'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  The Averager calculates the average of a continuous flow of data points
*/
function createAverager (maxNumOfDataPoints) {
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
    const sum = dataPoints
      .map((dataPoint, index) => Math.pow(2, numOfDataPoints - index - 1) * dataPoint)
      .reduce((acc, dataPoint) => acc + dataPoint, 0)
    const weight = Math.pow(2, numOfDataPoints) - 1
    return sum / weight
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

export { createAverager }
