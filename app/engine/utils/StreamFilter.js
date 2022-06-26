'use strict'
/*
  Open Rowing Monitor, https://github.com/jaapvanekris/openrowingmonitor

  This keeps an array, which we can ask for an moving average

  Please note: The array contains maxLenght values
  They are arranged that dataPoints[0] is the oldest, and dataPoints[currentLength] the youngest
*/

import { createSeries } from './Series.js'

function createStreamFilter (maxLength, defaultValue) {
  const dataPoints = createSeries(maxLength)
  let lastRawDatapoint = defaultValue
  let cleanDatapoint = defaultValue

  function push (dataPoint) {
    dataPoints.push(dataPoint)
    lastRawDatapoint = dataPoint

    if (dataPoints.length() > 0) {
      // The series contains sufficient values to be valid
      cleanDatapoint = dataPoints.median()
    } else {
      // The array isn't sufficiently filled
      cleanDatapoint = defaultValue
    }

  }

  function raw () {
    return lastRawDatapoint
  }

  function clean () {
    return cleanDatapoint
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
    reset
  }
}

export { createStreamFilter }
