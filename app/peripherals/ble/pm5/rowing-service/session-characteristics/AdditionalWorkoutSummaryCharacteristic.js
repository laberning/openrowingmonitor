'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Implementation of the StrokeData as defined in:
  * https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
  * https://www.concept2.co.uk/files/pdf/us/monitors/PM5_CSAFECommunicationDefinition.pdf
*/
import { BufferBuilder } from '../../../BufferBuilder.js'
import { GattNotifyCharacteristic } from '../../../BleManager.js'
import { toC2128BitUUID, toC2IntervalType } from '../../utils/ORMtoC2Mapper.js'
import { Concept2Date } from '../../utils/C2toORMMapper.js'

export class AdditionalWorkoutSummaryCharacteristic extends GattNotifyCharacteristic {
  #multiplexedCharacteristic

  /**
   * @param {import('../other-characteristics/MultiplexedCharacteristic.js').MultiplexedCharacteristic} multiplexedCharacteristic
   */
  constructor (multiplexedCharacteristic) {
    super({
      name: 'Additional Workout Summary',
      uuid: toC2128BitUUID('003A'),
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
    // Data bytes packed as follows: (19bytes) example: 0x 0333 1212 02 C800 05 3B00 2500 550000 3C00 AA01

    // Log Entry Date, (see https://www.c2forum.com/viewtopic.php?t=200769)
    bufferBuilder.writeUInt16LE(new Concept2Date().toC2DateInt())
    // Log Entry Time, (see https://www.c2forum.com/viewtopic.php?t=200769)
    bufferBuilder.writeUInt16LE(new Concept2Date().toC2TimeInt())
    if (this.isSubscribed) {
      // intervalType: UInt8, see OBJ_INTERVALTYPE_T enum - NOT IN MULTIPLEXED
      bufferBuilder.writeUInt8(toC2IntervalType(data))
    }
    // Split/Interval Size (meters or seconds)
    if (data.split.type === 'distance') {
      bufferBuilder.writeUInt16LE(data.split.distance.fromStart > 0 ? Math.round(data.split.distance.fromStart) : 0)
    } else {
      bufferBuilder.writeUInt16LE(data.split.timeSpent.moving > 0 ? Math.round(data.split.timeSpent.moving) : 0)
    }
    // Split/Interval Number, based on BLE traces, split data messages' split number always starts at 1
    bufferBuilder.writeUInt8(data.split.C2number >= 0 ? data.split.C2number + 1 : 0)
    // Total Calories
    bufferBuilder.writeUInt16LE(data.workout.calories.totalSpent > 0 && data.workout.calories.totalSpent < 65534 ? Math.round(data.workout.calories.totalSpent) : 0)
    // Power (Watts)
    bufferBuilder.writeUInt16LE(data.workout.power.average > 0 && data.workout.power.average < 65534 ? Math.round(data.workout.power.average) : 0)
    // Total Rest Distance (1 m lsb)
    bufferBuilder.writeUInt24LE(0)
    // Interval Rest Time (seconds)
    bufferBuilder.writeUInt16LE(data.workout.timeSpent.C2Rest > 0 ? Math.round(data.workout.timeSpent.C2Rest) : 0)
    // Avg Calories (cals/hr)
    bufferBuilder.writeUInt16LE(data.workout.calories.averagePerHour > 0 && data.workout.calories.averagePerHour < 65534 ? Math.round(data.workout.calories.averagePerHour) : 0)

    if (this.isSubscribed) {
      super.notify(bufferBuilder.getBuffer())
      return
    }

    this.#multiplexedCharacteristic.notify(0x3A, bufferBuilder.getBuffer())
  }
}
