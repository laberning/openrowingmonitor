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
SCRIPT_DIR="$( cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd )"
INSTALL_DIR="$(dirname "$SCRIPT_DIR")"
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
  if ask "A new version of Open Rowing Monitor is available. Do you want to update?" Y; then
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
fi

cd $CURRENT_DIR
