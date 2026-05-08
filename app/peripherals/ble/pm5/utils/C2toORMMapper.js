'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
/**
 * @file Contains all supporting functions needed to process Concept2 PM5 workouts commands to the internal ORM workouts
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/blob/main/docs/PM5_Interface.md|for the entire interface description}
 */
export function createWorkoutPlan () {
  let workoutplan = []

  function reset () {
    workoutplan = null
    workoutplan = []
  }

  function addInterval (type, data) {
    let workoutstep
    let targetTime
    switch (true) {
      case (type === 'rest'):
        if (data.length > 1) {
          targetTime = readUInt16(data[0], data[1])
          if (targetTime > 0) {
            workoutplan.push({})
            workoutstep = workoutplan.length - 1
            workoutplan[workoutstep].type = 'rest'
            workoutplan[workoutstep].targetTime = targetTime
          }
        }
        // As ErgData and ErgZone will always send a rest interval (with 0 length), we must ignore that
        break
      case (type === 'justrow'):
        workoutplan.push({})
        workoutstep = workoutplan.length - 1
        workoutplan[workoutstep].type = 'justrow'
        break
      case (type === 'distance' && data.length > 4):
        workoutplan.push({})
        workoutstep = workoutplan.length - 1
        /* eslint-disable-next-line no-case-declarations -- readable code outweighs rules */
        const targetDistance = readUInt32(data[1], data[2], data[3], data[4])
        if (targetDistance > 0) {
          workoutplan[workoutstep].type = 'distance'
          workoutplan[workoutstep].targetDistance = targetDistance
        } else {
          workoutplan[workoutstep].type = 'justrow'
        }
        break
      case (type === 'time' && data.length > 4):
        workoutplan.push({})
        workoutstep = workoutplan.length - 1
        targetTime = readUInt32(data[1], data[2], data[3], data[4]) / 100
        if (targetTime > 0) {
          workoutplan[workoutstep].type = 'time'
          workoutplan[workoutstep].targetTime = targetTime
        } else {
          workoutplan[workoutstep].type = 'justrow'
        }
        break
      case (type === 'calories' && data.length > 4):
        workoutplan.push({})
        workoutstep = workoutplan.length - 1
        /* eslint-disable-next-line no-case-declarations -- readable code outweighs rules */
        const targetCalories = readUInt32(data[1], data[2], data[3], data[4])
        if (targetCalories > 0) {
          workoutplan[workoutstep].type = 'calories'
          workoutplan[workoutstep].targetCalories = targetCalories
        } else {
          workoutplan[workoutstep].type = 'justrow'
        }
        break
      default:
        workoutplan.push({})
        workoutstep = workoutplan.length - 1
        workoutplan[workoutstep].type = 'justrow'
    }
  }

  function addPaceTarget (data) {
    if (workoutplan.length < 1) { return }
    const workoutstep = workoutplan.length - 1
    if (data.length > 3) {
      const targetLinearVelocity = 50000 / readUInt32(data[0], data[1], data[2], data[3])
      if (targetLinearVelocity > 0) { workoutplan[workoutstep].targetLinearVelocity = targetLinearVelocity }
    }
  }

  function addSplit (type, data) {
    if (workoutplan.length < 1) { return }
    const workoutstep = workoutplan.length - 1

    workoutplan[workoutstep].split = {}
    switch (true) {
      case (type === 'justrow'):
        workoutplan[workoutstep].split.type = 'justrow'
        break
      case (type === 'distance' && data.length > 4):
        /* eslint-disable-next-line no-case-declarations -- readable code outweighs rules */
        const targetDistance = readUInt32(data[1], data[2], data[3], data[4])
        if (targetDistance > 0) {
          workoutplan[workoutstep].split.type = 'distance'
          workoutplan[workoutstep].split.targetDistance = targetDistance
        } else {
          workoutplan[workoutstep].split.type = workoutplan[workoutstep].type
          workoutplan[workoutstep].split.targetDistance = workoutplan[workoutstep].targetDistance
        }
        break
      case (type === 'time' && data.length > 4):
        /* eslint-disable-next-line no-case-declarations -- readable code outweighs rules */
        const targetTime = readUInt32(data[1], data[2], data[3], data[4]) / 100
        if (targetTime > 0) {
          workoutplan[workoutstep].split.type = 'time'
          workoutplan[workoutstep].split.targetTime = targetTime
        } else {
          workoutplan[workoutstep].split.type = workoutplan[workoutstep].type
          workoutplan[workoutstep].split.targetTime = workoutplan[workoutstep].targetTime
        }
        break
      case (type === 'calories' && data.length > 4):
        /* eslint-disable-next-line no-case-declarations -- readable code outweighs rules */
        const targetCalories = readUInt32(data[1], data[2], data[3], data[4])
        if (targetCalories > 0) {
          workoutplan[workoutstep].split.type = 'calories'
          workoutplan[workoutstep].split.targetCalories = targetCalories
        } else {
          workoutplan[workoutstep].split.type = workoutplan[workoutstep].type
          workoutplan[workoutstep].split.targetCalories = workoutplan[workoutstep].targetCalories
        }
        break
      default:
        workoutplan[workoutstep].split.type = workoutplan[workoutstep].type
        if (workoutplan[workoutstep].type === 'distance') { workoutplan[workoutstep].split.targetDistance = workoutplan[workoutstep].targetDistance }
        if (workoutplan[workoutstep].type === 'time' || workoutplan[workoutstep].type === 'rest') { workoutplan[workoutstep].split.targetTime = workoutplan[workoutstep].targetTime }
        if (workoutplan[workoutstep].type === 'calories') { workoutplan[workoutstep].split.targetCalories = workoutplan[workoutstep].targetCalories }
    }
  }

  function length () {
    return workoutplan.length
  }

  function lastInterval () {
    if (workoutplan.length > 0) {
      return workoutplan[workoutplan.length - 1]
    } else {
      return undefined
    }
  }

  function forelastInterval () {
    if (workoutplan.length > 1) {
      return workoutplan[workoutplan.length - 2]
    } else {
      return undefined
    }
  }

  function result () {
    if (workoutplan.length > 0) {
      // Make sure we don't end with a rest interval
      if (workoutplan[workoutplan.length - 1].type === 'rest') { workoutplan.pop() }
      return workoutplan
    } else {
      return []
    }
  }

  return {
    reset,
    addInterval,
    addSplit,
    addPaceTarget,
    length,
    lastInterval,
    forelastInterval,
    result
  }
}

export function readUInt16 (msb, lsb) {
  return (msb * 256) + lsb
}

function readUInt32 (msb, byte2, byte3, lsb) {
  return (msb * 16777216) + (byte2 * 65536) + (byte3 * 256) + lsb
}

export class Concept2Date extends Date {
  /**
   * Converts a Date object to a Concept2 date binary format
   * @returns {number} The UTC date as a uint16 parsed as per the Concept2 specs
   */
  toC2DateInt () {
    const yearEpoch = 2000

    return (this.getMonth() + 1) | (this.getDate()) << 4 | (this.getFullYear() - yearEpoch) << 9
  }

  /**
   * Converts a Date object to a Concept2 date byte array format
   * @returns {number[]} The UTC date as a byte array parsed as per the Concept2 specs
   */
  toC2DateByteArray () {
    return [
      this.getHours() % 12 || 12,
      this.getMinutes(),
      this.getHours() > 12 ? 1 : 0,
      this.getMonth() + 1,
      this.getDate(),
      (this.getFullYear() >> 8) & 0xFF,
      this.getFullYear() & 0xFF
    ]
  }

  /**
   * Converts a Date object to a Concept2 time binary format
   * @returns {number} The UTC time as a uint16 parsed as per the Concept2 specs
   */
  toC2TimeInt () {
    return this.getMinutes() | this.getHours() << 8
  }
}
