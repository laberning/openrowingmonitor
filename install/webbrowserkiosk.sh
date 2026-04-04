#!/bin/bash
#
#  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
#
#  Runs the Web Frontend in a Chromium or Firefox browser in fullscreen kiosk mode
#
xset s off
xset s noblank
xset -dpms
openbox-session &

# Start Firefox in kiosk mode
if which chromium-browser >/dev/null; then
  # chromium is installed, as we tuned this to its absolute minimum, we'll use that
  nice -n 5 chromium-browser --kiosk --start-fullscreen --no-memcheck --noerrdialogs --disable-infobars --disable-features=AudioServiceSandbox --disable-translate --disable-features=TranslateUI --fast --fast-start --disk-cache-dir=/dev/null --disable-session-crashed-bubble --no-sandbox --disable-notifications --disable-sync-preferences --no-sandbox --disable-background-mode --disable-popup-blocking --no-first-run --enable-gpu-rasterization --disable-logging --disable-default-apps --disable-extensions --disable-crash-reporter --disable-pdf-extension --disable-new-tab-first-run --disable-dev-shm-usage --start-maximized --mute-audio --disable-crashpad --hide-scrollbars --overscroll-history-navigation=0 --ash-hide-cursor --memory-pressure-off --force-device-scale-factor=1 --ignore-certificate-errors --disable-pinch --enable-low-end-device-mode --disable-site-isolation-trials --renderer-process-limit=2 --check-for-update-interval=604800 --app="http://127.0.0.1/?mode=kiosk"
else
  # Use firefox if Chromium wasn't installed (legacy setup for 0.9.6 installs)
  nice -n 5 firefox --display=:0 --kiosk-monitor 0 --kiosk http://127.0.0.1/?mode=kiosk
fi
