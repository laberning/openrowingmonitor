'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This file contains the default configuration of the Open Rowing Monitor.

  !!! Note that changes to this file will be OVERWRITTEN when you update to a new version
  of Open Rowing Monitor. !!!

  To change the settings you should modify the 'config.js' in this folder. Simply copy the
  options that you would like to change into that file. If 'config.js' does not exist, you
  can use the example file from the 'install' folder.
*/
import rowerProfiles from './rowerProfiles.js'

export default {
  // available log levels: trace, debug, info, warn, error, silent
  loglevel: {
    // the default loglevel
    default: 'info',
    // the log level of of the rowing engine (stroke detection and physics model)
    RowingEngine: 'warn'
  },

  // selects the Bluetooth Low Energy Profile
  // supported modes: FTMS, FTMSBIKE, PM5
  bluetoothMode: 'FTMS',

  // defines the name that is used to announce the FTMS Rower via Bluetooth Low Energy (BLE)
  // some rowing training applications expect that the rowing device is announced with a certain name
  ftmsRowerPeripheralName: 'OpenRowingMonitor',

  // defines the name that is used to announce the FTMS Bike via Bluetooth Low Energy (BLE)
  // most bike training applications are fine with any device name
  ftmsBikePeripheralName: 'OpenRowingBike',

  // the rower specific settings. Either choose a profile from config/rowerProfiles.js or
  // define the settings individually. If you find good settings for a new rowing device
  // please send them to us (together with a raw recording of 10 strokes) so we can add
  // the device to the profiles.
  rowerSettings: rowerProfiles.DEFAULT
}
