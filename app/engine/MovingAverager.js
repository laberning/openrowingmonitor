'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This keeps an array, to be able to calculate a moving average
  As special feature, we can replace the last pushed value (if we don't like the resulting average)
  Setting rowerSettings.smoothing to 1 effectively turns this filter off

  They are arranged that dataPoints[0] is the youngest, and dataPoints[flankLength] the youngest
*/
function createMovingAverager (rowerSettings) {
  const dataPoints = new Array(rowerSettings.smoothing)
  dataPoints.fill(rowerSettings.maximumImpulseLength)

  function pushValue (dataPoint) {
    // add the new dataPoint to the array, we have to move datapoints starting at the oldst ones
    let i = rowerSettings.smoothing - 1
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

  function getMovingAverage () {
    let i = rowerSettings.smoothing - 1
    let arrayTotal = 0.0
    while (i >= 0) {
      // summarise the value of the moving average
      arrayTotal = arrayTotal + dataPoints[i]
      i = i - 1
    }
    const arrayAverage = arrayTotal / rowerSettings.flankLength
    return arrayAverage
  }

  return {
    pushValue,
    replaceLastPushedValue,
    getMovingAverage
  }
}

export { createMovingAverager }
