'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
import { SensorLocationAsBuffer } from '../common/SensorLocation.js'

import { BufferBuilder } from '../BufferBuilder.js'
import { GattService } from '../BleManager.js'

import { CyclingSpeedCadenceMeasurementCharacteristic, cscFeaturesFlags } from './CscMeasurementCharacteristic.js'
import { CyclingSpeedCadenceControlPointCharacteristic } from './CscControlPointCharacteristic.js'
import { createStaticReadCharacteristic } from '../common/StaticReadCharacteristic.js'

export class CyclingSpeedCadenceService extends GattService {
  #measurementCharacteristic

  /**
   * @param {ControlPointCallback} controlPointCallback
   */
  constructor (controlPointCallback) {
    const cscFeatureBuffer = new BufferBuilder()
    cscFeatureBuffer.writeUInt16LE(featuresFlag)
    const measurementCharacteristic = new CyclingSpeedCadenceMeasurementCharacteristic()

    super({
      name: 'Cycling Speed and Cadence',
      uuid: 0x1816,
      characteristics: [
        createStaticReadCharacteristic(0x2A5C, cscFeatureBuffer.getBuffer(), 'Cycling Speed and Cadence Feature'),
        measurementCharacteristic.characteristic,
        new CyclingSpeedCadenceControlPointCharacteristic(controlPointCallback).characteristic,
        createStaticReadCharacteristic(0x2A5D, SensorLocationAsBuffer(), 'Sensor Location')
      ]
    })
    this.#measurementCharacteristic = measurementCharacteristic
  }

  /**
   * @param {Metrics} data
   */
  notifyData (data) {
    this.#measurementCharacteristic.notify(data)
  }
}

const featuresFlag = cscFeaturesFlags.crankRevolutionDataSupported | cscFeaturesFlags.wheelRevolutionDataSupported
