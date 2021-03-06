'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This implements the Rower Feature Characteristic as defined by the specification.
  Used to inform the Central about the features that the Open Rowing Monitor supports.
  Make sure that The Fitness Machine Features and Target Setting Features that are announced here
  are supported in RowerDataCharacteristic and FitnessMachineControlPointCharacteristic.
*/
import bleno from '@abandonware/bleno'

export default class RowerFeatureCharacteristic extends bleno.Characteristic {
  constructor () {
    super({
      // Fitness Machine Feature
      uuid: '2ACC',
      properties: ['read'],
      value: null
    })
  }

  onReadRequest (offset, callback) {
    // see https://www.bluetooth.com/specifications/specs/fitness-machine-service-1-0 for details
    // Fitness Machine Features for the RowerDataCharacteristic
    // Total Distance Supported (2), Pace Supported (5),
    // Expended Energy Supported (9), Power Measurement Supported (14)
    // 00100100 01000010
    // Target Setting Features for the RowerDataCharacteristic
    // none
    // 0000000 0000000
    const features = [0x24, 0x42, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
    console.log('Features of Rower requested')
    callback(this.RESULT_SUCCESS, features.slice(offset, features.length))
  };
}
