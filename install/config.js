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
    // example: change the default log level:
    loglevel: {
      default: 'debug'
    },

  // The rower specific settings. Either choose a profile from config/rowerProfiles.js (see
  // https://github.com/laberning/openrowingmonitor/blob/main/docs/Supported_Rowers.md) or define
  // the settings manually (see https://github.com/laberning/openrowingmonitor/blob/main/docs/rower_settings.md
  // on how to do this). If you find good settings for a new rowing device please send them to us (together
  // with a raw recording of at least 10 strokes) so we can add the device to the profiles.

  // EXAMPLE ROWER CONFIG : using a DKN R-320 Air Rower as is
  // rowerSettings: rowerProfiles.DKN_R320

  // EXAMPLE ROWER CONFIG: Just set custom rower settings to make it work
  // rowerSettings: {
  //   numOfImpulsesPerRevolution: 1,
  //   dragFactor: 0.03,
  //   flywheelInertia: 0.3
  // }

  // EXAMPLE ROWER CONFIG: set a rower profile, but overwrite some settings:
  // rowerSettings: Object.assign(rowerProfiles.DKN_R320, {
  //   autoAdjustDragFactor: true
  // })
}
