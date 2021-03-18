'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This totalizer calculates the moving total of a continuous flow of data points for a
  certain (time) interval

  todo: not implemented yet, could be used to calculate Energy per hour and Energy per
  minute (for FTMS protocol)
*/
function createMovingTotalizer (movingTimeInterval) {
  let recordedTimeInterval = 0.0

  function pushValue (dataValue, timeInterval) {
    recordedTimeInterval += timeInterval
  }

  function total () {
    return recordedTimeInterval
  }

  function reset () {
    recordedTimeInterval = 0.0
  }

  return {
    pushValue,
    total,
    reset
  }
}

export { createMovingTotalizer }
