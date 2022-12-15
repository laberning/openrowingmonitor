'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This keeps an array, for all in-stroke metrics
*/
import { createSeries } from './Series.js'

function createCurveMetrics (precission = 0) {
  const _curve = createSeries()
  let _max = 0
  let totalInputXTime = 0
  let totaltime = 0

  function push (deltaTime, inputValue) {
    // add the new dataPoint to the array, we have to move datapoints starting at the oldst ones
    if (inputValue > 0) {
      _curve.push(inputValue.toFixed(precission))
      _max = Math.max(_max, inputValue)
      totalInputXTime += deltaTime * inputValue
      totaltime += deltaTime
    } else {
      // Let's skip negative and zero values with 0's as they are not relevant
      _curve.push(0)
    }
  }

  function peak () {
    if (_max > 0) {
      return _max
    } else {
      return 0
    }
  }

  function average () {
    if (totaltime > 0 && totalInputXTime > 0) {
      return totalInputXTime / totaltime
    } else {
      return 0
    }
  }

  function curve () {
    if (_curve.length() > 0) {
      return Array.from(_curve.series())
    } else {
      return []
    }
  }

  function length () {
    return _curve.length()
  }

  function reset () {
    _curve.reset()
    _max = 0
    totalInputXTime = 0
    totaltime = 0
  }

  return {
    push,
    peak,
    average,
    curve,
    length,
    reset
  }
}

export { createCurveMetrics }
