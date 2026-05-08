'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Decorators for translating raw metrics to human readable notes in file names and notes
*/

/**
 * @param {number} distance
 * @param {number} time
 */
export function createName (distance, time) {
  let shortDuration
  switch (true) {
    case (distance === 42195):
      shortDuration = 'Full Marathon'
      break
    case (distance === 21097):
      shortDuration = 'Half Marathon'
      break
    case (distance % 1000 === 0):
      shortDuration = `${Math.floor(distance / 1000)}K`
      break
    case (distance % 1000 === 500):
      shortDuration = `${Math.floor(distance / 1000)}.5K`
      break
    case (time % 3600 === 0):
      shortDuration = `${Math.floor(time / 3600)} hour`
      break
    case (time % 3600 === 1800):
      shortDuration = `${Math.floor(time / 3600)}.5 hours`
      break
    case (distance % 60 === 0):
      shortDuration = `${Math.floor(time / 60)} minutes`
      break
    default:
      shortDuration = `${Math.floor(distance)} meters`
  }
  return shortDuration
}

/**
 * @param {number} drag
 */
export function createDragLine (drag) {
  return `Drag factor: ${drag.toFixed(1)} 10-6 N*m*s2`
}

/**
 * @param {number} VO2MaxResult
 */
export function createVO2MaxLine (VO2MaxResult) {
  let VO2MaxLine
  if (VO2MaxResult !== undefined) {
    VO2MaxLine = `, estimated VO2Max: ${VO2MaxResult.toFixed(1)} mL/(kg*min)`
  } else {
    VO2MaxLine = ', no credible VO2Max estimate'
  }
  return VO2MaxLine
}

/**
 * @param {Array<number>} HRRArray
 */
export function createHRRLine (HRRArray) {
  let HRRLine
  switch (HRRArray.length) {
    case (2):
      HRRLine = `, HRR1: ${HRRArray[1] - HRRArray[0]} (${HRRArray[1]} BPM)`
      break
    case (3):
      HRRLine = `, HRR1: ${HRRArray[1] - HRRArray[0]} (${HRRArray[1]} BPM), HRR2: ${HRRArray[2] - HRRArray[0]} (${HRRArray[2]} BPM)`
      break
    case (4):
      HRRLine = `, HRR1: ${HRRArray[1] - HRRArray[0]} (${HRRArray[1]} BPM), HRR2: ${HRRArray[2] - HRRArray[0]} (${HRRArray[2]} BPM), HRR3: ${HRRArray[3] - HRRArray[0]} (${HRRArray[3]} BPM)`
      break
    default:
      HRRLine = ''
  }
  return HRRLine
}
