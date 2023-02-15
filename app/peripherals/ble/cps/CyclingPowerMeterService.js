'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor
*/
import bleno from '@abandonware/bleno'
import BufferBuilder from '../BufferBuilder.js'
import { SensorLocationAsBuffer } from '../common/SensorLocation.js'
import StaticReadCharacteristic from '../common/StaticReadCharacteristic.js'
import CyclingPowerControlPointCharacteristic from './CpsControlPointCharacteristic.js'
import CyclingPowerMeasurementCharacteristic from './CpsMeasurementCharacteristic.js'

export default class CyclingPowerService extends bleno.PrimaryService {
  constructor (controlPointCallback) {
    const cpsFeatureBuffer = new BufferBuilder()
    cpsFeatureBuffer.writeUInt32LE(featuresFlag)

    const measurementCharacteristic = new CyclingPowerMeasurementCharacteristic()
    super({
      // Cycling Power
      uuid: '1818',
      characteristics: [
        new StaticReadCharacteristic('2A65', 'Cycling Power Feature', cpsFeatureBuffer.getBuffer()),
        measurementCharacteristic,
        new StaticReadCharacteristic('2A5D', 'Sensor Location', SensorLocationAsBuffer()),
        new CyclingPowerControlPointCharacteristic(controlPointCallback)
      ]
    })
    this.measurementCharacteristic = measurementCharacteristic
  }

  notifyData (event) {
    this.measurementCharacteristic.notify(event)
  }
}

export const cpsFeaturesFlags =
{
  pedalPowerBalanceSupported: (0x01 << 0),
  accumulatedTorqueSupported: (0x01 << 1),
  wheelRevolutionDataSupported: (0x01 << 2),
  crankRevolutionDataSupported: (0x01 << 3),
  extremeMagnitudesSupported: (0x01 << 4),
  extremeAnglesSupported: (0x01 << 5),
  topAndBottomDeadSpotAnglesSupported: (0x01 << 6),
  accumulatedEnergySupported: (0x01 << 7),
  offsetCompensationIndicatorSupported: (0x01 << 8),
  offsetCompensationSupported: (0x01 << 9),
  cyclingPowerMeasurementCharacteristicContentMaskingSupported: (0x01 << 10),
  multipleSensorLocationsSupported: (0x01 << 11),
  crankLengthAdjustmentSupported: (0x01 << 12),
  chainLengthAdjustmentSupported: (0x01 << 13),
  chainWeightAdjustmentSupported: (0x01 << 14),
  spanLengthAdjustmentSupported: (0x01 << 15),
  sensorMeasurementContext: (0x01 << 16),
  sensorMeasurementContextForce: (0x00 << 16),
  sensorMeasurementContextTorque: (0x01 << 16),
  instantaneousMeasurementDirectionSupported: (0x01 << 17),
  factoryCalibrationDateSupported: (0x01 << 18),
  enhancedOffsetCompensationSupported: (0x01 << 19),
  distributeSystemSupportUnspecified: (0x00 << 20),
  distributeSystemSupportNotInDistributed: (0x01 << 20),
  distributeSystemSupportInDistributed: (0x02 << 20),
  distributeSystemSupportRFU: (0x03 << 20)
}

const featuresFlag = cpsFeaturesFlags.sensorMeasurementContextForce | cpsFeaturesFlags.wheelRevolutionDataSupported | cpsFeaturesFlags.crankRevolutionDataSupported | cpsFeaturesFlags.distributeSystemSupportNotInDistributed
