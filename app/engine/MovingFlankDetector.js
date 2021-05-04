'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This keeps an array, which we can test for an upgoing or downgoing flank

  Please note: The array contains flankLenght + 1 measured currentDt's, thus flankLenght number of flanks between them
  They are arranged that dataPoints[0] is the youngest, and dataPoints[flankLength] the youngest
*/
function createMovingFlankDetector (rowerSettings) {
  const dataPoints = new Array(rowerSettings.flankLength + 1)
  dataPoints.fill(rowerSettings.maximumImpulseLength)

  function pushValue (dataPoint) {
    // add the new dataPoint to the array, we have to move datapoints starting at the oldst ones
    let i = rowerSettings.flankLength
    while (i > 0) {
      // older datapoints are moved toward the higher numbers
      dataPoints[i] = dataPoints[i - 1]
      i = i - 1
    }
    dataPoints[0] = dataPoint
  }

  function isDecelerating () {
    let i = rowerSettings.flankLength
    let numberOfErrors = 0
    while (i > 0) {
      if (dataPoints[i] < dataPoints[i - 1]) {
        // Oldest interval (dataPoints[i]) is shorter than the younger one (datapoint[i-1], as the distance is fixed, we are decelerating
      } else {
        numberOfErrors = numberOfErrors + 1
      }
      i = i - 1
    }
    if (numberOfErrors > rowerSettings.numberOfErrorsAllowed) {
      return false
    } else {
      return true
    }
  }

  function isAccelerating () {
    let i = rowerSettings.flankLength
    let numberOfErrors = 0
    while (i > 0) {
      if (dataPoints[i] > dataPoints[i - 1]) {
        // Oldest interval (dataPoints[i]) is longer than the younger one (datapoint[i-1], as the distance is fixed, we are accelerating
      } else {
        numberOfErrors = numberOfErrors + 1
      }
      i = i - 1
    }
    if (numberOfErrors > rowerSettings.numberOfErrorsAllowed) {
      return false
    } else {
      return true
    }
  }

  return {
    pushValue,
    isDecelerating,
    isAccelerating
  }
}

export { createMovingFlankDetector }
