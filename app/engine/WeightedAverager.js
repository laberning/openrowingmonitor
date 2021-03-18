'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  The Averager calculates the weighted average of a continuous flow of data points
*/
function createWeightedAverager (maxNumOfDataPoints) {
  let dataPoints = []

  function pushValue (dataPoint) {
    // add the new dataPoint to the front of the array
    dataPoints.unshift(dataPoint)
    // ensure that the array does not get longer than maxNumOfDataPoints
    if (dataPoints.length > maxNumOfDataPoints) {
      dataPoints.pop()
    }
  }

  function weightedAverage () {
    const numOfDataPoints = dataPoints.length
    if (numOfDataPoints > 0) {
      const sum = dataPoints
        .map((dataPoint, index) => Math.pow(2, numOfDataPoints - index - 1) * dataPoint)
        .reduce((acc, dataPoint) => acc + dataPoint, 0)
      const weight = Math.pow(2, numOfDataPoints) - 1
      return sum / weight
    } else {
      return 0
    }
  }

  function reset () {
    dataPoints = []
  }

  return {
    pushValue,
    weightedAverage,
    reset
  }
}

export { createWeightedAverager }
