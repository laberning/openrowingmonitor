'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Implementation of the StrokeData as defined in:
  * https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
  * https://www.concept2.co.uk/files/pdf/us/monitors/PM5_CSAFECommunicationDefinition.pdf
*/
import { BufferBuilder } from '../../../BufferBuilder.js'
import { GattNotifyCharacteristic } from '../../../BleManager.js'
import { toC2128BitUUID, toC2WorkoutType } from '../../utils/ORMtoC2Mapper.js'
import { Concept2Date } from '../../utils/C2toORMMapper.js'

export class WorkoutSummaryCharacteristic extends GattNotifyCharacteristic {
  #multiplexedCharacteristic

  /**
   * @param {import('../other-characteristics/MultiplexedCharacteristic.js').MultiplexedCharacteristic} multiplexedCharacteristic
   */
  constructor (multiplexedCharacteristic) {
    super({
      name: 'Workout Summary',
      uuid: toC2128BitUUID('0039'),
      properties: ['notify']
    })
    this.#multiplexedCharacteristic = multiplexedCharacteristic
  }

  /**
   * @param {Metrics} data
   * @param {SegmentMetrics} workoutData
   */
  // @ts-ignore: Type is not assignable to type
  notify (data, workoutHRData) {
    const bufferBuilder = new BufferBuilder()
    // Data bytes packed as follows: (20bytes) example: 0333 1212 A0A500 102700 0C 00 00 00 00 8D 00 07 4808

    // Log Entry Date (see https://www.c2forum.com/viewtopic.php?t=200769)
    bufferBuilder.writeUInt16LE(new Concept2Date().toC2DateInt())
    // Log Entry Time (see https://www.c2forum.com/viewtopic.php?t=200769)
    bufferBuilder.writeUInt16LE(new Concept2Date().toC2TimeInt())
    // Elapsed Time (0.01 sec lsb),
    bufferBuilder.writeUInt24LE(Math.round((data.workout.timeSpent.total - data.workout.timeSpent.C2Rest) * 100))
    // Distance (0.1 m)
    bufferBuilder.writeUInt24LE(data.workout.distance.fromStart > 0 ? Math.round(data.workout.distance.fromStart * 10) : 0)
    // Average Stroke Rate,
    bufferBuilder.writeUInt8(data.workout.strokerate.average > 0 && data.workout.strokerate.average < 255 ? Math.round(data.workout.strokerate.average) : 0)
    // Ending Heartrate,
    bufferBuilder.writeUInt8(workoutHRData.atSeriesEnd() > 0 ? Math.round(workoutHRData.atSeriesEnd()) : 0)
    // Average Heartrate,
    bufferBuilder.writeUInt8(workoutHRData.average() > 0 ? Math.round(workoutHRData.average()) : 0)
    // Min Heartrate,
    bufferBuilder.writeUInt8(workoutHRData.minimum() > 0 ? Math.round(workoutHRData.minimum()) : 0)
    // Max Heartrate,
    bufferBuilder.writeUInt8(workoutHRData.maximum() > 0 ? Math.round(workoutHRData.maximum()) : 0)
    // Drag Factor Average,
    bufferBuilder.writeUInt8(data.workout.dragfactor.average > 0 && data.workout.dragfactor.average < 255 ? Math.round(data.workout.dragfactor.average) : 255)
    // Recovery Heart Rate, (zero = not valid data. After 1 minute of rest/recovery, PM5 sends this data as a revised End Of Workout summary data characteristic unless the monitor has been turned off or a new workout started)
    bufferBuilder.writeUInt8(0)
    // workoutType: UInt8, see OBJ_WORKOUTTYPE_T enum
    bufferBuilder.writeUInt8(toC2WorkoutType(data))
    if (this.isSubscribed) {
    // Avg Pace (0.1 sec) - NOT IN MULTIPLEXED
      bufferBuilder.writeUInt16LE(Math.round(data.workout.pace.average))
    }

    if (this.isSubscribed) {
      super.notify(bufferBuilder.getBuffer())

      return
    }

    this.#multiplexedCharacteristic.notify(0x39, bufferBuilder.getBuffer())
  }
}
