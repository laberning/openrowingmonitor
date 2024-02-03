#!/bin/bash
#
#  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
#
#  Installation script for Open Rowing Monitor, use at your own risk!
#

# treat unset variables as an error when substituting
set -u
# exit when a command fails
set -e

print() {
  echo "$@"
}

cancel() {
  print "$@"
  exit 1
}

ask() {
  local prompt default reply

  if [[ ${2:-} = 'Y' ]]; then
    prompt='Y/n'
    default='Y'
  elif [[ ${2:-} = 'N' ]]; then
    prompt='y/N'
    default='N'
  else
    prompt='y/n'
    default=''
  fi

  while true; do
    echo -n "$1 [$prompt] "
    read -r reply </dev/tty

    if [[ -z $reply ]]; then
      reply=$default
    fi

    case "$reply" in
      Y*|y*) return 0 ;;
      N*|n*) return 1 ;;
    esac
  done
}

CURRENT_DIR=$(pwd)
INSTALL_DIR="/opt/openrowingmonitor"
GIT_REMOTE="https://github.com/JaapvanEkris/openrowingmonitor.git"

print "This script will set up Open Rowing Monitor on one of the following devices"
print "  Raspberry Pi Zero W or WH"
print "  Raspberry Pi Zero 2 W or WH"
print "  Raspberry Pi 3 Model A+, B or B+"
print "  Raspberry Pi 4 Model B"
print
print "You should only run this script on a SD Card that contains Raspberry Pi OS (Lite)"
print "and does not contain any important data."

if [[ -f "/proc/device-tree/model" ]]; then
  MODEL=$(tr -d '\0' < /proc/device-tree/model)
else
  MODEL="undefined"
fi

if [[ $MODEL != Raspberry* ]]; then
  print
  cancel "This script currently only works on Raspberry Pi OS, you will have to do a manual installation."
fi

VERSION=$(grep -oP '(?<=^VERSION=).+' /etc/os-release | tr -d '"')
if [[ $VERSION == "12 (bookworm)" ]]; then
  print
  print "Error: So far this install script is not capable of installing on Raspberry Pi OS 12 (bookworm)."
  print "Please use Raspberry Pi 11 (bullseye), which can be installed via the Raspberry Manager via the 'Raspberry Pi OS (other)' option, under the Legacy versions"
  exit 1
fi

if [[ $VERSION != "10 (buster)" ]] && [[ $VERSION != "11 (bullseye)" ]]; then
  print
  print "Warning: So far this install script has only been tested with Raspberry Pi OS 10 (buster), 11 (bullseye)"
  if ! ask "You are running Raspberry Pi OS $VERSION, are you sure that you want to continue?" N; then
    exit 1
  fi
fi

print
if ! ask "Do you want to start the installation of Open Rowing Monitor?" Y; then
  exit 1
fi

# todo: once we know what hardware we support we can check for that via /sys/firmware/devicetree/base/model

HOSTNAME=$(hostname)
TARGET_HOSTNAME="rowingmonitor"
if [[ $HOSTNAME != $TARGET_HOSTNAME ]]; then
  if ask "Do you want to change the device name from '$HOSTNAME' to '$TARGET_HOSTNAME'?" Y; then
    sudo hostname -b $TARGET_HOSTNAME
    sudo sed -i "s/$HOSTNAME/$TARGET_HOSTNAME/" /etc/hosts 2> /dev/null
    sudo hostnamectl set-hostname $TARGET_HOSTNAME
    sudo systemctl restart avahi-daemon
  fi
fi

INIT_SHARE=false
if ask "Do you want to create a samba network share to simplify access to training data and configuration?" Y; then
  INIT_SHARE=true
fi

INIT_GUI=false
if ask "Do you also want to run the Graphical User Interface on this device (requires attached screen)?" N; then
  INIT_GUI=true
fi

print
print "Installing System dependencies..."
sudo apt-get -y update
sudo apt-get -y dist-upgrade
sudo systemctl disable bluetooth
sudo apt-get -y install bluetooth bluez libbluetooth-dev libudev-dev git
sudo apt-get -y install pigpio
# We disable the pigpio service explicity, as the JS wrapper is alergic to the deamon
sudo systemctl mask pigpiod.service

print
ARCHITECTURE=$(uname -m)
if [[ $ARCHITECTURE == "armv6l" ]];
then
  print "You are running a system with ARM v6 architecture. Official support for Node.js has been discontinued"
  print "for ARM v6. Installing experimental unofficial build of Node.js..."

  # we stick to node 14 as there are problem with WebAssembly on node 16 on the armv6l architecture
  NODEJS_VERSION=v14.18.3
  sudo rm -rf /opt/nodejs
  sudo mkdir -p /opt/nodejs
  sudo curl https://unofficial-builds.nodejs.org/download/release/$NODEJS_VERSION/node-$NODEJS_VERSION-linux-armv6l.tar.gz | sudo tar -xz --strip 1 -C /opt/nodejs/

  sudo ln -sfn /opt/nodejs/bin/node /usr/bin/node
  sudo ln -sfn /opt/nodejs/bin/node /usr/sbin/node
  sudo ln -sfn /opt/nodejs/bin/node /sbin/node
  sudo ln -sfn /opt/nodejs/bin/node /usr/local/bin/node
  sudo ln -sfn /opt/nodejs/bin/npm /usr/bin/npm
  sudo ln -sfn /opt/nodejs/bin/npm /usr/sbin/npm
  sudo ln -sfn /opt/nodejs/bin/npm /sbin/npm
  sudo ln -sfn /opt/nodejs/bin/npm /usr/local/bin/npm
else
  print "Installing Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

print
print "Installing Open Rowing Monitor..."

if ! [[ -d "${INSTALL_DIR}" ]]; then
  sudo mkdir -p $INSTALL_DIR
fi

cd $INSTALL_DIR

# get project code from repository
sudo git init -q
# older versions of git would use 'master' instead of 'main' for the default branch
sudo git checkout -q -b v1beta_updates
sudo git config remote.origin.url $GIT_REMOTE
sudo git config remote.origin.fetch +refs/heads/*:refs/remotes/origin/*
# prevent altering line endings
sudo git config core.autocrlf false
sudo git fetch --force origin
sudo git fetch --force --tags origin
sudo git reset --hard origin/v1beta_updates

# add bin directory to the system path
echo "export PATH=\"\$PATH:$INSTALL_DIR/bin\"" >> ~/.bashrc

# otherwise node-gyp would fail while building the system dependencies
# On newer nodejs versions (> Node 16) we solve this via the .npmrc file 
if [[ $ARCHITECTURE == "armv6l" ]]; then
  sudo npm config set user 0
fi

print
print "Downloading and compiling Runtime dependencies..."
sudo npm ci
sudo npm run build
if ! [[ -f "config/config.js" ]]; then
    sudo cp install/config.js config/
fi

print
print "Setting up GPIO 17 as input and enable the pull-up resistor..."
echo -e "\n# configure GPIO 17 as input and enable the pull-up resistor for Open Rowing Monitor\ngpio=17=pu,ip" | sudo tee -a /boot/config.txt > /dev/null

print
print "Setting up Open Rowing Monitor as autostarting system service..."
sudo cp install/openrowingmonitor.service /lib/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable openrowingmonitor
sudo systemctl restart openrowingmonitor

if $INIT_SHARE; then
  print
  print "Creating network share..."
  # set the installer selections via debconf-set-selections, otherwise installing samba will open
  # the wizard to manually set those settings
  echo "samba-common samba-common/workgroup string WORKGROUP" | sudo debconf-set-selections
  echo "samba-common samba-common/dhcp boolean true" | sudo debconf-set-selections
  echo "samba-common samba-common/do_debconf boolean true" | sudo debconf-set-selections
  sudo apt-get -y install samba samba-common-bin smbclient cifs-utils
  sudo cp -f install/smb.conf /etc/samba/smb.conf
  sudo systemctl restart smbd
  print
  print "Network share created"
fi

if $INIT_GUI; then
  print
  print "Installing Graphical User Interface..."
  sudo apt-get -y install --no-install-recommends xserver-xorg xserver-xorg-legacy x11-xserver-utils xinit openbox chromium-browser
  sudo gpasswd -a pi tty
  sudo sed -i 's/allowed_users=console/allowed_users=anybody\nneeds_root_rights=yes/' /etc/X11/Xwrapper.config
  sudo cp install/webbrowserkiosk.service /lib/systemd/system/
  sudo systemctl daemon-reload
  sudo systemctl enable webbrowserkiosk
  sudo systemctl restart webbrowserkiosk
  print "sudo systemctl status webbrowserkiosk"
  sudo systemctl status webbrowserkiosk
  print
  print "Installation of Graphical User Interface finished."
  print "If the screen resolution or the screen borders are not correct, run 'sudo raspi-config' and modify the display options."
fi

cd $CURRENT_DIR

print
print "sudo systemctl status openrowingmonitor"
sudo systemctl status openrowingmonitor
print
print "Installation of Open Rowing Monitor finished."
print "Open Rowing Monitor should now be up and running."
print "You can now adjust the configuration in $INSTALL_DIR/config/config.js either via ssh or via the network share"
print
print "Please reboot the device for all features and settings to take effect."
