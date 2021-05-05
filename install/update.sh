#!/bin/bash
#
#  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor
#
#  Update script for Open Rowing Monitor, use at your own risk!
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

CURRENT_DIR=$(pwd)
INSTALL_DIR="/opt/openrowingmonitor"
GIT_REMOTE="https://github.com/laberning/openrowingmonitor.git"

print "Update script for Open Rowing Monitor"
print
print "Checking for new version..."

cd $INSTALL_DIR

LOCAL_VERSION=$(git rev-parse HEAD)
REMOTE_VERSION=$(git ls-remote $GIT_REMOTE HEAD | awk '{print $1;}')

if [ "$LOCAL_VERSION" = "$REMOTE_VERSION" ]; then
    print "You are using the latest version of Open Rowing Monitor."
else
    print "A new version of Open Rowing Monitor is available. Do you want to update?"
    print
    read -p "Press RETURN to continue or CTRL + C to abort"
    print "Stopping Open Rowing Monitor..."
    sudo systemctl stop openrowingmonitor

    print "Fetching new version of Open Rowing Monitor..."
    sudo git fetch --force origin
    sudo git fetch --force --tags origin
    sudo git reset --hard origin/main

    print "Updating Runtime dependencies..."
    sudo npm install
    sudo npm run build

    print "Starting Open Rowing Monitor..."
    sudo systemctl start openrowingmonitor

    print
    print "Update complete, Open Rowing Monitor now has the following exciting new features:"
    git log --reverse --pretty=format:"- %s" $LOCAL_VERSION..HEAD
fi

cd $CURRENT_DIR
