'use strict'
/**
 * @copyright [OpenRowingMonitor]{@link https://github.com/JaapvanEkris/openrowingmonitor}
 *
 * @file Implementation of the AdditionalStrokeData as defined in:
 * - https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
 * - https://www.concept2.co.uk/files/pdf/us/monitors/PM5_CSAFECommunicationDefinition.pdf
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/blob/main/docs/PM5_Interface.md#0x0036-additional-stroke-data|the description of desired behaviour}
*/
import { BufferBuilder } from '../../../BufferBuilder.js'
import { GattNotifyCharacteristic } from '../../../BleManager.js'

import { toC2128BitUUID } from '../../Pm5Constants.js'

export class AdditionalStrokeDataCharacteristic extends GattNotifyCharacteristic {
  #multiplexedCharacteristic

  /**
   * @param {import('./MultiplexedCharacteristic.js').MultiplexedCharacteristic} multiplexedCharacteristic
   */
  constructor (multiplexedCharacteristic) {
    super({
      name: 'Additional Stroke Data',
      uuid: toC2128BitUUID('0036'),
      properties: ['notify']
    })
    this.#multiplexedCharacteristic = multiplexedCharacteristic
  }

  /**
   * @param {Metrics} data
   */
  // @ts-ignore: Type is not assignable to type
  notify (data) {
    const bufferBuilder = new BufferBuilder()
    // elapsedTime: UInt24LE in 0.01 sec
    bufferBuilder.writeUInt24LE(data.interval.timeSpent.total > 0 && data.interval.timeSpent.total < 167772.15 && data.sessionState !== 'WaitingForStart' ? Math.round(data.interval.timeSpent.total * 100) : 0)
    // strokePower: UInt16LE in watts
    bufferBuilder.writeUInt16LE(data.cyclePower > 0 && data.cyclePower < 65535 ? Math.round(data.cyclePower) : 0)
    // strokeCalories: UInt16LE in cal
    bufferBuilder.writeUInt16LE(data.strokeCalories > 0 && data.strokeCalories < 65.535 ? Math.round(data.strokeCalories * 1000) : 0)
    // strokeCount: UInt16LE
    bufferBuilder.writeUInt16LE(data.interval.numberOfStrokes > 0 && data.interval.numberOfStrokes < 65535 ? Math.round(data.interval.numberOfStrokes) : 0)
    // projectedWorkTime: UInt24LE in 1 sec
    bufferBuilder.writeUInt24LE(data.interval.movingTime.projectedEnd > 0 && data.interval.movingTime.projectedEnd < 16777215 ? Math.round(data.interval.movingTime.projectedEnd) : 0)
    // projectedWorkDistance: UInt24LE in 1 m
    bufferBuilder.writeUInt24LE(data.interval.distance.projectedEnd > 0 && data.interval.distance.projectedEnd < 16777215 ? Math.round(data.interval.distance.projectedEnd) : 0)
    if (!this.isSubscribed) {
      // the multiplexer uses a slightly different format for the AdditionalStrokeData
      // it adds workPerStroke at the end
      // workPerStroke: UInt16LE in 0.1 Joules
      bufferBuilder.writeUInt16LE(data.strokeWork > 0 && data.strokeWork < 6553.5 ? Math.round(data.strokeWork * 10) : 0)
    }

    if (this.isSubscribed) {
      super.notify(bufferBuilder.getBuffer())

      return
    }

    this.#multiplexedCharacteristic.notify(0x36, bufferBuilder.getBuffer())
  }
}
