'use strict'
/*
  Open Rowing Monitor, https://github.com/jaapvanekris/openrowingmonitor

  This Averager can calculate the moving average of a continuous flow of data points

  Please note: The array contains currentLenght values
  They are arranged that dataPoints[0] is the youngest, and dataPoints[currentLength-1] the oldest
  It will accept a defaultValue that is returned when the array isn't sufficiently filled
*/

function createMovingAverager (maxLength, defaultValue) {
  let dataPoints = new Array(maxLength)
  let currentLength
  reset()

  function pushValue (dataPoint) {
    // add the new dataPoint to the array, we have to move datapoints starting at the oldst ones
    if (currentLength < maxLength) {
      // if the array hasn't reached it's maximum size, allow it to grow
      currentLength += 1
    }
    let i = currentLength - 1
    while (i > 0) {
      // older datapoints are moved toward the higher numbers
      dataPoints[i] = dataPoints[i - 1]
      i = i - 1
    }
    dataPoints[0] = dataPoint
  }

  function replaceLastPushedValue (dataPoint) {
    // replace the newest dataPoint in the array, as it was faulty
    dataPoints[0] = dataPoint
  }

  function getAverage () {
    let arrayAverage = 0
    if (currentLength > 1) {
      // The array is sufficiently filled to calculate an acceptable average
      let i = currentLength - 1
      let arrayTotal = 0.0
      while (i >= 0) {
        // summarise the value of the moving average
        arrayTotal += dataPoints[i]
        i = i - 1
      }
      arrayAverage = arrayTotal / currentLength
    } else {
      // The array isn't sufficiently filled
      if (currentLength == 1) {
        arrayAverage = (dataPoints[0] + defaultValue) / 2
      } else {
        arrayAverage = defaultValue
      }
    }
    return arrayAverage
  }

  function reset () {
    dataPoints.fill(defaultValue)
    currentLength = 0
  }

  return {
    pushValue,
    replaceLastPushedValue,
    getAverage,
    reset
  }
}

export { createMovingAverager }
