'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
import { BufferBuilder } from '../BufferBuilder.js'
import { GattNotifyCharacteristic } from '../BleManager.js'

export const cpsMeasurementFeaturesFlags = {
  pedalPowerBalancePresent: (0x01 << 0),
  pedalPowerBalanceReference: (0x01 << 1),
  accumulatedTorquePresent: (0x01 << 2),
  accumulatedTorqueSource: (0x01 << 3),
  accumulatedTorqueSourceWheel: (0x00 << 3),
  accumulatedTorqueSourceCrank: (0x01 << 3),
  wheelRevolutionDataPresent: (0x01 << 4),
  crankRevolutionDataPresent: (0x01 << 5),
  extremeForceMagnitudesPresent: (0x01 << 6),
  extremeTorqueMagnitudesPresent: (0x01 << 7),
  extremeAnglesPresent: (0x01 << 8),
  topDeadSpotAnglePresent: (0x01 << 9),
  bottomDeadSpotAnglePresent: (0x01 << 10),
  accumulatedEnergyPresent: (0x01 << 11),
  offsetCompensationIndicator: (0x01 << 12)
}

export class CyclingPowerMeasurementCharacteristic extends GattNotifyCharacteristic {
  constructor () {
    super({
      name: 'Cycling Power Meter Measurement',
      uuid: 0x2A63,
      properties: ['notify'],
      descriptors: [
        {
          uuid: 0x2901,
          value: 'Cycling Power Measurement'
        }
      ]
    })
  }

  /**
   * @param {Metrics} data
   */
  // @ts-ignore: Type is not assignable to type
  notify (data) {
    const bufferBuilder = new BufferBuilder()

    // Features flag
    bufferBuilder.writeUInt16LE(cpsMeasurementFeaturesFlags.wheelRevolutionDataPresent | cpsMeasurementFeaturesFlags.crankRevolutionDataPresent)

    // Instantaneous Power
    bufferBuilder.writeUInt16LE(data.cyclePower > 0 ? Math.round(data.cyclePower) : 0)

    // Wheel revolution count (basically the distance in cm)
    bufferBuilder.writeUInt32LE(data.totalLinearDistance > 0 ? Math.round(Math.round(data.totalLinearDistance * 100)) : 0)

    // Wheel revolution time (ushort with 2048 resolution, resetting in every 32sec)
    bufferBuilder.writeUInt16LE(data.totalMovingTime > 0 ? Math.round(data.totalMovingTime * 2048) % Math.pow(2, 16) : 0)

    // Total stroke count
    bufferBuilder.writeUInt16LE(data.totalNumberOfStrokes > 0 ? Math.round(data.totalNumberOfStrokes) : 0)

    // last stroke time time (ushort with 1024 resolution, resetting in every 64sec)
    bufferBuilder.writeUInt16LE(data.driveLastStartTime > 0 ? Math.round(data.driveLastStartTime * 1024) % Math.pow(2, 16) : 0)

    super.notify(bufferBuilder.getBuffer())
  }
}
