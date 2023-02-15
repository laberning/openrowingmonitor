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
import IndoorBikeDataCharacteristic from './IndoorBikeDataCharacteristic.js'
import FitnessMachineControlPointCharacteristic from './FitnessMachineControlPointCharacteristic.js'
import FitnessMachineStatusCharacteristic from './FitnessMachineStatusCharacteristic.js'
import StaticReadCharacteristic from '../common/StaticReadCharacteristic.js'
import BufferBuilder from '../BufferBuilder.js'

export default class FitnessMachineService extends bleno.PrimaryService {
  constructor (options, controlPointCallback) {
    const simulateIndoorBike = options?.simulateIndoorBike === true
    const dataCharacteristic = simulateIndoorBike ? new IndoorBikeDataCharacteristic() : new RowerDataCharacteristic()
    const statusCharacteristic = new FitnessMachineStatusCharacteristic()
    const ftmsFeaturesBuffer = new BufferBuilder()
    ftmsFeaturesBuffer.writeUInt16LE(featuresFlag)

    super({
      // Fitness Machine
      uuid: '1826',
      characteristics: [
        new StaticReadCharacteristic('2ACC', 'FTMS Feature', ftmsFeaturesBuffer.getBuffer()),
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

export const FtmsBikeFeaturesFlags = {
  averageSpeedSupported: (0x01 << 0),
  cadenceSupported: (0x01 << 1),
  totalDistanceSupported: (0x01 << 2),
  inclinationSupported: (0x01 << 3),
  elevationGainSupported: (0x01 << 4),
  paceSupported: (0x01 << 5),
  stepCountSupported: (0x01 << 6),
  resistanceLevelSupported: (0x01 << 7),
  strideCountSupported: (0x01 << 8),
  expendedEnergySupported: (0x01 << 9),
  heartRateMeasurementSupported: (0x01 << 10),
  metabolicEquivalentSupported: (0x01 << 11),
  elapsedTimeSupported: (0x01 << 12),
  remainingTimeSupported: (0x01 << 13),
  powerMeasurementSupported: (0x01 << 14),
  forceOnBeltAndPowerOutputSupported: (0x01 << 15),
  userDataRetentionSupported: (0x01 << 16)
}

export const featuresFlag = FtmsBikeFeaturesFlags.cadenceSupported | FtmsBikeFeaturesFlags.totalDistanceSupported | FtmsBikeFeaturesFlags.paceSupported | FtmsBikeFeaturesFlags.expendedEnergySupported | FtmsBikeFeaturesFlags.heartRateMeasurementSupported | FtmsBikeFeaturesFlags.elapsedTimeSupported | FtmsBikeFeaturesFlags.powerMeasurementSupported
