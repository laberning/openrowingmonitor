'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
/**
 * Implementation of the AdditionalStrokeData as defined in:
 * - https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
 * - https://www.concept2.co.uk/files/pdf/us/monitors/PM5_CSAFECommunicationDefinition.pdf
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/blob/main/docs/PM5_Interface.md#0x0038-additional-split-data|the description of desired behaviour}
 */
import { BufferBuilder } from '../../../BufferBuilder.js'
import { GattNotifyCharacteristic } from '../../../BleManager.js'

import { pm5Constants, toC2128BitUUID } from '../../Pm5Constants.js'

export class AdditionalSplitDataCharacteristic extends GattNotifyCharacteristic {
  #multiplexedCharacteristic

  /**
   * @param {import('../other-characteristics/MultiplexedCharacteristic.js').MultiplexedCharacteristic} multiplexedCharacteristic
   */
  constructor (multiplexedCharacteristic) {
    super({
      name: 'Additional Split Data',
      uuid: toC2128BitUUID('0038'),
      properties: ['notify']
    })
    this.#multiplexedCharacteristic = multiplexedCharacteristic
  }

  /**
   * @param {Metrics} data
   * @param {SegmentMetrics} splitData
   */
  // @ts-ignore: Type is not assignable to type
  /* eslint-disable complexity -- A lot of defensive programming is needed to tame this beast */
  notify (data, splitHRData) {
    const bufferBuilder = new BufferBuilder()
    // Data bytes packed as follows: (19bytes) - Multiplex as per spec 18bytes, but actually the list show 19. need to verify from the PM5

    // Elapsed Time in 0.01 sec
    bufferBuilder.writeUInt24LE(data.interval.timeSpent.total > 0 && data.sessionState !== 'WaitingForStart' ? Math.round(data.interval.timeSpent.total * 100) : 0)
    // Split/Interval Avg Stroke Rate
    bufferBuilder.writeUInt8(data.split.strokerate.average > 0 ? Math.round(data.split.strokerate.average) : 0)
    // Split/Interval Work Heartrate,
    bufferBuilder.writeUInt8(splitHRData.average() > 0 ? Math.round(splitHRData.average()) : 0)
    // Split/Interval Rest Heartrate,
    bufferBuilder.writeUInt8(0)
    // Split/Interval Average Pace (in 0.1 sec)
    bufferBuilder.writeUInt16LE(data.split.pace.average !== Infinity && data.split.pace.average > 0 && data.split.pace.average < 655.34 ? Math.round(data.split.pace.average * 10) : 0)
    // Split/Interval Total Calories (Cals),
    bufferBuilder.writeUInt16LE(data.split.calories.totalSpent > 0 && data.split.calories.totalSpent < 65534 ? Math.round(data.split.calories.totalSpent) : 0)
    // Split/Interval Average Calories (Cals/Hr),
    bufferBuilder.writeUInt16LE(data.split.calories.averagePerHour > 0 && data.split.calories.averagePerHour < 65534 ? Math.round(data.split.calories.averagePerHour) : 0)
    // Split/Interval Speed (0.001 m/s, max=65.534 m/s)
    bufferBuilder.writeUInt16LE(data.split.linearVelocity.average !== Infinity && data.split.linearVelocity.average > 0 && data.split.linearVelocity.average < 655.34 ? Math.round(data.split.linearVelocity.average * 1000) : 0)
    // Split/Interval Power (Watts, max = 65.534 kW)
    bufferBuilder.writeUInt16LE(data.split.power.average > 0 && data.split.power.average < 65534 ? Math.round(data.split.power.average) : 0)
    // Split Avg Drag Factor,
    bufferBuilder.writeUInt8(data.split.dragfactor.average > 0 && data.split.dragfactor.average < 255 ? Math.round(data.split.dragfactor.average) : 255)
    // Split/Interval Number, based on BLE traces, split data messages' split number always starts at 1
    bufferBuilder.writeUInt8(data.split.C2number >= 0 ? data.split.C2number + 1 : 0)
    // Erg Machine Type
    bufferBuilder.writeUInt8(pm5Constants.ergMachineType)

    if (this.isSubscribed) {
      super.notify(bufferBuilder.getBuffer())

      return
    }

    this.#multiplexedCharacteristic.notify(0x38, bufferBuilder.getBuffer())
  }
}
/* eslint-enable complexity */
