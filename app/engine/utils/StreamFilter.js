'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This keeps an array, which we can ask for an moving average

  Please note: The array contains maxLenght values
*/

import { createSeries } from './Series.js'

function createStreamFilter (maxLength, defaultValue) {
  const dataPoints = createSeries(maxLength)
  let lastRawDatapoint = defaultValue
  let cleanDatapoint = defaultValue

  function push (dataPoint) {
    lastRawDatapoint = dataPoint
    dataPoints.push(dataPoint)
    cleanDatapoint = dataPoints.median()
  }

  function raw () {
    return lastRawDatapoint
  }

  function clean () {
    if (dataPoints.length() > 0) {
      // The series contains sufficient values to be valid
      return cleanDatapoint
    } else {
      // The array isn't sufficiently filled
      return defaultValue
    }
  }

  function reliable () {
    return dataPoints.length() > 0
  }

  function reset () {
    dataPoints.reset()
    lastRawDatapoint = defaultValue
    cleanDatapoint = defaultValue
  }

  return {
    push,
    raw,
    clean,
    reliable,
    reset
  }
}

export { createStreamFilter }
