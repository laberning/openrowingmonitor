'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Defines the global state of the app
*/

export const APP_STATE = {
  // currently can be STANDALONE (Mobile Home Screen App), KIOSK (Raspberry Pi deployment) or '' (default)
  appMode: '',
  // currently can be DASHBOARD or 'ROWINGGAMES' (default)
  activeRoute: 'DASHBOARD',
  // contains all the rowing metrics that are delivered from the backend
  metrics: {},
  config: {
    // currently can be FTMS, FTMSBIKE or PM5
    peripheralMode: '',
    // true if upload to strava is enabled
    stravaUploadEnabled: false,
    // true if remote device shutdown is enabled
    shutdownEnabled: false
  }
}
