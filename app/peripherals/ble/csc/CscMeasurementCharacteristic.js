'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
import { BufferBuilder } from '../BufferBuilder.js'
import { GattNotifyCharacteristic } from '../BleManager.js'

export class CyclingSpeedCadenceMeasurementCharacteristic extends GattNotifyCharacteristic {
  constructor () {
    super({
      name: 'Cycling Speed and Cadence Measurement',
      uuid: 0x2A5B,
      properties: ['notify'],
      descriptors: [
        {
          uuid: 0x2901,
          value: 'Cycling Speed and Cadence Measurement'
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
    bufferBuilder.writeUInt8(cscFeaturesFlags.crankRevolutionDataSupported | cscFeaturesFlags.wheelRevolutionDataSupported)

    // Wheel revolution count (basically the distance in cm)
    bufferBuilder.writeUInt32LE(data.totalLinearDistance > 0 ? Math.round(Math.round(data.totalLinearDistance * 100)) : 0)

    // Wheel revolution time (ushort with 1024 resolution, resetting in every 64sec)
    bufferBuilder.writeUInt16LE(data.totalMovingTime > 0 ? Math.round(data.totalMovingTime * 1024) % Math.pow(2, 16) : 0)

    // Total stroke count
    bufferBuilder.writeUInt16LE(data.totalNumberOfStrokes > 0 ? Math.round(data.totalNumberOfStrokes) : 0)

    // last stroke time time (ushort with 1024 resolution, resetting in every 64sec)
    bufferBuilder.writeUInt16LE(data.driveLastStartTime > 0 ? Math.round(data.driveLastStartTime * 1024) % Math.pow(2, 16) : 0)

    super.notify(bufferBuilder.getBuffer())
  }
}

export const cscFeaturesFlags =
  {
    wheelRevolutionDataSupported: (0x01 << 0),
    crankRevolutionDataSupported: (0x01 << 1),
    multipleSensorLocationSupported: (0x01 << 2)
  }
