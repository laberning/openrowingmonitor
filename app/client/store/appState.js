'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Defines the global state of the app
*/

export const APP_STATE = {
  // currently can be STANDALONE (Mobile Home Screen App), KIOSK (Raspberry Pi deployment) or '' (default)
  appMode: '',
  // todo: this is currently embedded into the metrics object, but should probably be extracted
  peripheralMode: 'FTMSROWER',
  // contains all the rowing metrics that are delivered from the backend
  metrics: {}
}
