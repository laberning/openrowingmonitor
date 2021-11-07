'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  You can modify this file to configure Open Rowing Monitor to your needs.
  This file should be placed in the 'config' folder of Open Rowing Monitor.

  All available configuration parameters are visible in config/config.default.js
  To modify a parameter, copy it to this file and modify the value.

  Changes to this file are persisted when you update to new versions.
*/
// eslint-disable-next-line no-unused-vars
import rowerProfiles from './rowerProfiles.js'

export default {
  /*
    // example: change the default log level:
    loglevel: {
      default: 'debug'
    },

    // example: set a rower profile:
    rowerSettings: rowerProfiles.DKNR320

    // example: set custom rower settings:
    rowerSettings: {
      numOfImpulsesPerRevolution: 1,
      dragFactor: 0.03,
      flywheelInertia: 0.3
    }

    // example: set a rower profile, but overwrite some settings:
    rowerSettings: Object.assign(rowerProfiles.DKNR320, {
      autoAdjustDragFactor: true
    })
  */
}
