'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
/**
 * Implementation of the StrokeData as defined in:
 * - https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
 * - https://www.concept2.co.uk/files/pdf/us/monitors/PM5_CSAFECommunicationDefinition.pdf
 */
import { BufferBuilder } from '../../../BufferBuilder.js'

import { Concept2Date } from '../../utils/C2toORMMapper.js'
import { pm5Constants } from '../../Pm5Constants.js'

export class AdditionalWorkoutSummary2Characteristic {
  #multiplexedCharacteristic

  /**
   * @param {import('../other-characteristics/MultiplexedCharacteristic.js').MultiplexedCharacteristic} multiplexedCharacteristic
   */
  constructor (multiplexedCharacteristic) {
    this.#multiplexedCharacteristic = multiplexedCharacteristic
  }

  /**
   * @param {Metrics} data
   */
  // @ts-ignore: Type is not assignable to type
  notify (data) {
    const bufferBuilder = new BufferBuilder()
    // Data bytes packed as follows: (10Bytes) example: (0x3C) 0333 1212 4808 10 0000 00

    // Log Entry Date (see https://www.c2forum.com/viewtopic.php?t=200769)
    bufferBuilder.writeUInt16LE(new Concept2Date().toC2DateInt())
    // Log Entry Time (see https://www.c2forum.com/viewtopic.php?t=200769)
    bufferBuilder.writeUInt16LE(new Concept2Date().toC2TimeInt())
    // Avg Pace (0.1 sec)
    bufferBuilder.writeUInt16LE(data.workout.pace.average !== Infinity && data.workout.pace.average > 0 && data.workout.pace.average < 655.34 ? Math.round(data.workout.pace.average * 10) : 0)
    // Game Identifier/ Workout Verified (see Appendix),
    bufferBuilder.writeUInt8((0 & 0x0F) | ((0 & 0xF0) >> 4))
    // Game Score (Fish/Darts 1 point LSB, Target 0.1% LSB)
    bufferBuilder.writeUInt16LE(0)
    // Erg Machine Type
    bufferBuilder.writeUInt8(pm5Constants.ergMachineType)

    this.#multiplexedCharacteristic.notify(0x3C, bufferBuilder.getBuffer())
  }
}
