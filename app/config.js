'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This file contains the app specific configuration.
  Modify it to your needs.
*/
import log from 'loglevel'
export default {
  loglevel: {
    // the default loglevel
    default: log.levels.INFO,
    // the log level of some modules can be set individually to filter noise
    RowingEngine: log.levels.WARN
  },
  // selects the Bluetooth Low Energy Profile
  // supported modes: FTMS, FTMSBIKE, PM5
  bluetoothMode: 'FTMS'
}
