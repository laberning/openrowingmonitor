'use strict'
/**
 * @copyright {@link https://github.com/JaapvanEkris/openrowingmonitor|OpenRowingMonitor}
 *
 * @file This keeps an array, for all in-stroke metrics
 */
import { createSeries } from './Series.js'

export function createCurveMetrics () {
  const _curve = createSeries()
  let _max = 0
  let _peakPosition = 0
  let totalInputXTime = 0
  let totaltime = 0

  function push (deltaTime, inputValue) {
    // add the new dataPoint to the array, we have to move datapoints starting at the oldst ones
    if (inputValue > 0) {
      _curve.push(inputValue)
      if (inputValue >= _max) {
        _peakPosition = _curve.length()
        _max = Math.max(_max, inputValue)
      }
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

  function peakNormalizedPosition () {
    if (_max > 0 && _peakPosition > 0 && _curve.length() > 0) {
      return (_peakPosition / _curve.length())
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
    _peakPosition = 0
    totalInputXTime = 0
    totaltime = 0
  }

  return {
    push,
    peak,
    peakNormalizedPosition,
    average,
    curve,
    length,
    reset
  }
}
