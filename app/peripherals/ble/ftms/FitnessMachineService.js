'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

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
import { BufferBuilder } from '../BufferBuilder.js'
import { GattService } from '../BleManager.js'
import { createStaticReadCharacteristic } from '../common/StaticReadCharacteristic.js'

import { FitnessMachineControlPointCharacteristic } from './FitnessMachineControlPointCharacteristic.js'
import { FitnessMachineStatusCharacteristic } from './FitnessMachineStatusCharacteristic.js'
import { IndoorBikeDataCharacteristic } from './IndoorBikeDataCharacteristic.js'
import { RowerDataCharacteristic } from './RowerDataCharacteristic.js'

export class FitnessMachineService extends GattService {
  #dataCharacteristic
  #statusCharacteristic

  /**
   * @param {ControlPointCallback} controlPointCallback
   * @param {boolean} [simulateIndoorBike = false]
   */
  constructor (controlPointCallback, simulateIndoorBike = false) {
    const ftmsFeaturesBuffer = new BufferBuilder()
    ftmsFeaturesBuffer.writeUInt16LE(featuresFlag)

    const dataCharacteristic = simulateIndoorBike ? new IndoorBikeDataCharacteristic() : new RowerDataCharacteristic()
    const statusCharacteristic = new FitnessMachineStatusCharacteristic()

    super({
      name: 'Fitness Machine',
      uuid: 0x1826,
      characteristics: [
        createStaticReadCharacteristic(0x2ACC, ftmsFeaturesBuffer.getBuffer(), 'FTMS Feature'),
        dataCharacteristic.characteristic,
        new FitnessMachineControlPointCharacteristic(controlPointCallback).characteristic,
        statusCharacteristic.characteristic
      ]
    })

    this.#dataCharacteristic = dataCharacteristic
    this.#statusCharacteristic = statusCharacteristic
  }

  /**
   * @param {Metrics} data
   */
  notifyData (data) {
    this.#dataCharacteristic.notify(data)
  }

  /**
   * Present current rowing status to FTMS central
   * @param {{name: string}} status
   */
  notifyStatus (status) {
    this.#statusCharacteristic.notify(status)
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

export const FTMSTypeField = {
  TreadmillSupported: (0x01 << 0),
  CrossTrainerSupported: (0x01 << 1),
  StepClimberSupported: (0x01 << 2),
  StairClimberSupported: (0x01 << 3),
  RowerSupported: (0x01 << 4),
  IndoorBikeSupported: (0x01 << 5)
}
