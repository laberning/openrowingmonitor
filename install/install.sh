#!/bin/bash
#
#  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor
#
#  Installation script for Open Rowing Monitor, use at your own risk!
#

# treat unset variables as an error when substituting
set -u
# exit when a command fails
set -e

print() {
  printf "%s\n" "$@"
}

cancel() {
  print "$@"
  exit 1
}

print "Installation script for Open Rowing Monitor"
print
print "This script will set up Open Rowing Monitor on a Raspberry Pi 3 / 4 with Raspberry Pi OS (Lite)."
print "You should only run this script on a SD Card that does not contain any important data."
print

OSID=$(grep -oP '(?<=^ID=).+' /etc/os-release | tr -d '"')
if [[ $OSID != "raspbian" ]]; then
  cancel "This script currently only works on Raspberry Pi OS, you will have to do a manual installation."
fi

VERSION=$(grep -oP '(?<=^VERSION=).+' /etc/os-release | tr -d '"')
if [[ $VERSION != "10 (buster)" ]]; then
  print "Warning: So far this install script has only been tested with Raspberry Pi OS 10 (buster)."
  print "You are running Raspberry Pi OS $VERSION, are you sure that you want to continue?"
fi

# todo: once we know what hardware we support we can check for that via /sys/firmware/devicetree/base/model

print
read -p "Press RETURN to continue or CTRL + C to abort"

print
print "Installing System dependencies..."
sudo apt-get -y update
sudo apt-get -y dist-upgrade
sudo systemctl disable bluetooth
sudo apt-get -y install bluetooth bluez libbluetooth-dev libudev-dev git

curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs

print
print "Installing Open Rowing Monitor..."
INSTALL_DIR="/opt/openrowingmonitor"
GIT_REMOTE="https://github.com/laberning/openrowingmonitor.git"

if ! [[ -d "${INSTALL_DIR}" ]]; then
  sudo mkdir -p $INSTALL_DIR
fi

cd $INSTALL_DIR

# get project code from repository
sudo git init -q
sudo git config remote.origin.url $GIT_REMOTE
sudo git config remote.origin.fetch +refs/heads/*:refs/remotes/origin/*
# prevent altering line endings
sudo git config core.autocrlf false
sudo git fetch --force origin
sudo git fetch --force --tags origin
sudo git reset --hard origin/main

# otherwise node-gyp would fail while building the system dependencies
sudo npm config set user 0

print
print "Downloading and compiling Runtime dependencies..."
sudo npm ci
sudo npm run build
if ! [[ -f "config/config.js" ]]; then
    cp install/config.js config/
fi

print
print "Setting up Open Rowing Monitor as autostarting system service..."
sudo cp install/openrowingmonitor.service /lib/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable openrowingmonitor
sudo systemctl restart openrowingmonitor

print
print "Installation of Open Rowing Monitor finished"
print "Open Rowing Monitor should now be up and running."
