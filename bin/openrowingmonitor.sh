#!/bin/bash
#
#  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
#
#  Start script for Open Rowing Monitor
#

# treat unset variables as an error when substituting
set -u
# exit when a command fails
set -e

print() {
  echo "$@"
}

CURRENT_DIR=$(pwd)
SCRIPT_DIR="$( cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd )"
INSTALL_DIR="$(dirname "$SCRIPT_DIR")"

cd $INSTALL_DIR
npm start
cd $CURRENT_DIR
