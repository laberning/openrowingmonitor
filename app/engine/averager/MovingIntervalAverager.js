'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This Averager calculates the average forecast for a moving interval of a continuous flow
  of data points for a certain (time) interval
*/
function createMovingIntervalAverager (movingDuration) {
  let dataPoints
  let duration
  let sum
  reset()

  function pushValue (dataValue, dataDuration) {
    // add the new dataPoint to the front of the array
    dataPoints.unshift({ value: dataValue, duration: dataDuration })
    duration += dataDuration
    sum += dataValue
    while (duration > movingDuration) {
      const removedDataPoint = dataPoints.pop()
      duration -= removedDataPoint.duration
      sum -= removedDataPoint.value
    }
  }

  function average () {
    if (duration > 0) {
      return sum / duration * movingDuration
    } else {
      return 0
    }
  }

  function reset () {
    dataPoints = []
    duration = 0.0
    sum = 0.0
  }

  return {
    pushValue,
    average,
    reset
  }
}

export { createMovingIntervalAverager }
