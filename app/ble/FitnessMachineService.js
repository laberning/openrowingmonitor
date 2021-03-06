'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Implements the Fitness Machine Service (FTMS) according to specs.
  Either presents a FTMS Rower (for rower applications that can use parameters such as Stroke Rate) or
  simulates a FTMS Indoor Bike (for usage with bike training apps)

  Relevant parts from https://www.bluetooth.com/specifications/specs/fitness-machine-service-1-0
  For Discovery we should implement:
  - Fitness Machine Feature Characteristic
  - Rower Data Characteristic
  - Training Status Characteristic (not yet implemented) todo: Maybe implement a simple version of it to see which
    applications make use of it. Might become interesting, if we implement training management
  - Fitness Machine Status Characteristic
  - Fitness Machine Control Point Characteristic
*/
import bleno from '@abandonware/bleno'

import RowerDataCharacteristic from './RowerDataCharacteristic.js'
import RowerFeatureCharacteristic from './RowerFeatureCharacteristic.js'
import IndoorBikeDataCharacteristic from './IndoorBikeDataCharacteristic.js'
import IndoorBikeFeatureCharacteristic from './IndoorBikeFeatureCharacteristic.js'
import FitnessMachineControlPointCharacteristic from './FitnessMachineControlPointCharacteristic.js'
import FitnessMachineStatusCharacteristic from './FitnessMachineStatusCharacteristic.js'

export default class FitnessMachineService extends bleno.PrimaryService {
  constructor (options, controlPointCallback) {
    const simulateIndoorBike = options?.simulateIndoorBike === true
    const dataCharacteristic = simulateIndoorBike ? new IndoorBikeDataCharacteristic() : new RowerDataCharacteristic()
    const featureCharacteristic = simulateIndoorBike ? new IndoorBikeFeatureCharacteristic() : new RowerFeatureCharacteristic()
    const statusCharacteristic = new FitnessMachineStatusCharacteristic()
    super({
      // Fitness Machine
      uuid: '1826',
      characteristics: [
        featureCharacteristic,
        dataCharacteristic,
        new FitnessMachineControlPointCharacteristic(controlPointCallback),
        statusCharacteristic
      ]
    })
    this.dataCharacteristic = dataCharacteristic
    this.statusCharacteristic = statusCharacteristic
  }

  notifyData (event) {
    this.dataCharacteristic.notify(event)
  }

  notifyStatus (event) {
    this.statusCharacteristic.notify(event)
  }
}
