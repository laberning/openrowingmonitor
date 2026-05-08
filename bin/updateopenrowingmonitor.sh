#!/bin/bash
#
#  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
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

# updates the software to the most recent git commit from origin
update_branch() {
  print "Stopping Open Rowing Monitor..."
  sudo systemctl stop openrowingmonitor

  print "Fetching new version of Open Rowing Monitor from branch \"$CURRENT_BRANCH\"..."
  sudo git fetch --force origin
  sudo git fetch --force --tags origin
  sudo git reset --hard origin/$CURRENT_BRANCH

  print "Updating Runtime dependencies..."
  sudo npm ci
  sudo npm run build

  print "Starting Open Rowing Monitor..."
  sudo systemctl start openrowingmonitor

  print
  print "Update complete, Open Rowing Monitor now has the following exciting new features:"
  git log --reverse --pretty=format:"- %s" $LOCAL_VERSION..HEAD
}

# allows switching to another git feature branch by passing the -b parameter
switch_branch() {
  print "Stopping Open Rowing Monitor..."
  sudo systemctl stop openrowingmonitor

  print "Switching Open Rowing Monitor to branch \"$CURRENT_BRANCH\"..."
  sudo git fetch --force origin
  sudo git fetch --force --tags origin
  sudo git branch -D $CURRENT_BRANCH 2> /dev/null || true
  sudo git checkout -b $CURRENT_BRANCH origin/$CURRENT_BRANCH

  print "Updating Runtime dependencies..."
  sudo rm -rf node_modules
  sudo npm install
  sudo npm run build

  print "Starting Open Rowing Monitor..."
  sudo systemctl start openrowingmonitor

  print
  print "Switch to branch \"$CURRENT_BRANCH\" complete, Open Rowing Monitor now has the following exciting new features:"
  git log --reverse --pretty=format:"- %s" $LOCAL_VERSION..HEAD
}

CURRENT_DIR=$(pwd)
SCRIPT_DIR="$( cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd )"
INSTALL_DIR="$(dirname "$SCRIPT_DIR")"
GIT_REMOTE="https://github.com/JaapvanEkris/openrowingmonitor.git"

cd $INSTALL_DIR

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
LOCAL_VERSION=$(git rev-parse HEAD)

print "Update script for Open Rowing Monitor"
print

if getopts "b:" arg; then
  if [ $CURRENT_BRANCH = $OPTARG ]; then
    cancel "No need to switch to branch \"$OPTARG\", it is already the active branch"
  fi

  echo "Checking for the existence of branch \"$OPTARG\"..."
  if [ $(git ls-remote --heads $GIT_REMOTE 2>/dev/null|awk -F 'refs/heads/' '{print $2}'|grep -x "$OPTARG"|wc -l) = 0 ]; then
    cancel "Branch \"$OPTARG\" does not exist in the repository, can not switch"
  fi

  ARCHITECTURE=$(uname -m)
  if [[ $ARCHITECTURE == "armv6l" ]] && [[ $OPTARG != "v1beta_updates_Pi_Zero_W" ]]; then
    cancel "Branch \"$OPTARG\" doesn't work on a Pi Zero W, please use branch 'v1beta_updates_Pi_Zero_W'"
  fi
  if [[ $ARCHITECTURE != "armv6l" ]] && [[ $OPTARG == "v1beta_updates_Pi_Zero_W" ]]; then
    cancel "Branch \"$OPTARG\" is a legacy version intended for the Pi Zero W, please use branch 'v1beta_updates' or similar"
  fi


  if ask "Do you want to switch from branch \"$CURRENT_BRANCH\" to branch \"$OPTARG\"?" Y; then
    print "Switching to branch \"$OPTARG\"..."
    CURRENT_BRANCH=$OPTARG
    switch_branch
  else
    cancel "Stopping update - please run without -b parameter to do a regular update"
  fi
  
else
  print "Checking for new version..."
  REMOTE_VERSION=$(git ls-remote $GIT_REMOTE refs/heads/$CURRENT_BRANCH | awk '{print $1;}')

  ARCHITECTURE=$(uname -m)
  if [[ $ARCHITECTURE == "armv6l" ]] && [[ $CURRENT_BRANCH != "v1beta_updates_Pi_Zero_W" ]]; then
    cancel "Branch \"$OPTARG\" doesn't work on a Pi Zero W, please use branch 'v1beta_updates_Pi_Zero_W'"
  fi

  if [ "$LOCAL_VERSION" = "$REMOTE_VERSION" ]; then
      print "You are using the latest version of Open Rowing Monitor from branch \"$CURRENT_BRANCH\"."
  else
    if ask "A new version of Open Rowing Monitor is available from branch \"$CURRENT_BRANCH\". Do you want to update?" Y; then
      update_branch
    fi
  fi
fi

cd $CURRENT_DIR
