'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This Averager can calculate the moving average of a continuous flow of data points

  Please note: The array contains flankLength + 1 measured currentDt's, thus flankLength number
  of flanks between them.
  They are arranged that dataPoints[0] is the youngest, and dataPoints[flankLength] the oldest
*/
function createMovingAverager (length, initValue) {
  let dataPoints
  reset()

  function pushValue (dataPoint) {
    // add the new dataPoint to the array, we have to move data points starting at the oldest ones
    let i = length - 1
    while (i > 0) {
      // older data points are moved towards the higher numbers
      dataPoints[i] = dataPoints[i - 1]
      i = i - 1
    }
    dataPoints[0] = dataPoint
  }

  function replaceLastPushedValue (dataPoint) {
    // replace the newest dataPoint in the array, as it was faulty
    dataPoints[0] = dataPoint
  }

  function getMovingAverage () {
    let i = length - 1
    let arrayTotal = 0.0
    while (i >= 0) {
      // summarize the value of the moving average
      arrayTotal = arrayTotal + dataPoints[i]
      i = i - 1
    }
    const arrayAverage = arrayTotal / length
    return arrayAverage
  }

  function reset () {
    dataPoints = new Array(length)
    dataPoints.fill(initValue)
  }

  return {
    pushValue,
    replaceLastPushedValue,
    getMovingAverage,
    reset
  }
}

export { createMovingAverager }
