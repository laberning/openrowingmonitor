'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor
*/
import bleno from '@abandonware/bleno'
import BufferBuilder from '../BufferBuilder.js'
import { SensorLocationAsBuffer } from '../common/SensorLocation.js'
import StaticReadCharacteristic from '../common/StaticReadCharacteristic.js'
import CyclingSpeedCadenceControlPointCharacteristic from './CscControlPointCharacteristic.js'
import CyclingSpeedCadenceMeasurementCharacteristic, { cscFeaturesFlags } from './CscMeasurementCharacteristic.js'

export default class CyclingSpeedCadenceService extends bleno.PrimaryService {
  constructor (controlPointCallback) {
    const cscFeatureBuffer = new BufferBuilder()
    cscFeatureBuffer.writeUInt16LE(featuresFlag)

    const measurementCharacteristic = new CyclingSpeedCadenceMeasurementCharacteristic()
    super({
      // Cycling Speed and Cadence
      uuid: '1816',
      characteristics: [
        new StaticReadCharacteristic('2A5C', 'Cycling Speed and Cadence Feature', cscFeatureBuffer.getBuffer()),
        measurementCharacteristic,
        new CyclingSpeedCadenceControlPointCharacteristic(controlPointCallback),
        new StaticReadCharacteristic('2A5D', 'Sensor Location', SensorLocationAsBuffer())
      ]
    })
    this.measurementCharacteristic = measurementCharacteristic
  }

  notifyData (event) {
    this.measurementCharacteristic.notify(event)
  }
}

const featuresFlag = cscFeaturesFlags.crankRevolutionDataSupported | cscFeaturesFlags.wheelRevolutionDataSupported
