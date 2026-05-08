'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
/**
 * Implementation of the StrokeData as defined in:
 * - https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
 * - https://www.concept2.co.uk/files/pdf/us/monitors/PM5_CSAFECommunicationDefinition.pdf
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/blob/main/docs/PM5_Interface.md#0x0037-split-data|the description of desired behaviour}
*/
import { BufferBuilder } from '../../../BufferBuilder.js'
import { GattNotifyCharacteristic } from '../../../BleManager.js'
import { toC2128BitUUID, toC2IntervalType } from '../../utils/ORMtoC2Mapper.js'

export class SplitDataCharacteristic extends GattNotifyCharacteristic {
  #multiplexedCharacteristic

  /**
   * @param {import('../other-characteristics/MultiplexedCharacteristic.js').MultiplexedCharacteristic} multiplexedCharacteristic
   */
  constructor (multiplexedCharacteristic) {
    super({
      name: 'Split Data',
      uuid: toC2128BitUUID('0037'),
      properties: ['notify']
    })
    this.#multiplexedCharacteristic = multiplexedCharacteristic
  }

  /**
   * @param {Metrics} data
   * @param {SegmentMetrics} splitData
   */
  // @ts-ignore: Type is not assignable to type
  notify (data) {
    const bufferBuilder = new BufferBuilder()
    // Data bytes packed as follows: (18bytes)

    // Elapsed Time (0.01 sec),
    bufferBuilder.writeUInt24LE(data.interval.timeSpent.total > 0 && data.sessionState !== 'WaitingForStart' ? Math.round(data.interval.timeSpent.total * 100) : 0)
    // Distance in split (0.1 m), based on experiments with the intervals screen
    bufferBuilder.writeUInt24LE(data.interval.distance.fromStart > 0 ? Math.round(data.interval.distance.fromStart * 10) : 0)
    // Split/Interval Time (0.1 sec)
    bufferBuilder.writeUInt24LE(data.split.timeSpent.moving > 0 ? Math.round(data.split.timeSpent.moving * 10) : 0)
    // Split/Interval Distance (1m accurate)
    bufferBuilder.writeUInt24LE(data.split.distance.fromStart > 0 ? Math.round(data.split.distance.fromStart) : 0)
    // Interval Rest Time (1 sec accurate)
    bufferBuilder.writeUInt16LE(data.split.timeSpent.rest > 0 ? Math.round(data.split.timeSpent.rest) : 0)
    // Interval Rest Distance Lo (1m accurate)
    bufferBuilder.writeUInt16LE(Math.round(0))
    // intervalType: UInt8, see OBJ_INTERVALTYPE_T enum
    bufferBuilder.writeUInt8(toC2IntervalType(data))
    // Split/Interval Number, based on BLE traces, split data messages' split number always starts at 1
    bufferBuilder.writeUInt8(data.split.C2number >= 0 ? data.split.C2number + 1 : 0)

    if (this.isSubscribed) {
      super.notify(bufferBuilder.getBuffer())

      return
    }

    this.#multiplexedCharacteristic.notify(0x37, bufferBuilder.getBuffer())
  }
}
