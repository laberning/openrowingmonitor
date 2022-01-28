#!/bin/bash
#
#  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor
#
#  Runs the Web Frontend in a chromium browser in fullscreen kiosk mode
#
xset s off
xset s noblank
xset -dpms
openbox-session &

# Start Chromium in kiosk mode
sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' ~/.config/chromium/'Local State'
sed -i 's/"exited_cleanly":false/"exited_cleanly":true/; s/"exit_type":"[^"]\+"/"exit_type":"Normal"/' ~/.config/chromium/Default/Preferences
chromium-browser --disable-infobars --kiosk --noerrdialogs --disable-session-crashed-bubble --disable-pinch --check-for-update-interval=604800 --app="http://127.0.0.1/#:kiosk:"
