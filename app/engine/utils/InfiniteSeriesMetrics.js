'use strict'
/**
 * @copyright {@link https://github.com/JaapvanEkris/openrowingmonitor|OpenRowingMonitor}
 *
 * @file This creates an unlimited series (resetting it is a responsibility of the caller). It allows for determining the Average, Median, Minimum and Maximum
 */
/**
 * @description the creator function, no parameters
 */
export function createInfiniteSeriesMetrics () {
  let min = undefined
  let max = undefined
  let seriesSum = 0
  let seriesCount = 0

  /**
   * @param {float} value - value to be added to the series
   */
  function push (value) {
    if (value === undefined || isNaN(value)) { return }

    seriesSum += value
    seriesCount++

    if (min !== undefined) {
      min = Math.min(min, value)
    } else {
      if (!isNaN(value)) { min = value }
    }

    if (max !== undefined) {
      max = Math.max(max, value)
    } else {
      if (!isNaN(value)) { max = value }
    }
  }

  /**
   * @returns {number} length of the series
   */
  function length () {
    return seriesCount
  }

  /**
   * @returns {float} sum of the entire series
   * @description This determines the total sum of the series. As a running sum becomes unstable after longer running sums, we need to summarise this via a reduce
   */
  function sum () {
    return seriesSum
  }

  /**
   * @returns {float} average of the entire series
   */
  function average () {
    if (seriesCount > 0) {
      return seriesSum / seriesCount
    } else {
      return 0
    }
  }

  /**
   * @returns {float} smallest element in the series
   */
  function minimum () {
    if (min !== undefined) {
      return min
    } else {
      return 0
    }
  }

  /**
   * @returns {float} largest value in the series
   */
  function maximum () {
    if (max !== undefined) {
      return max
    } else {
      return 0
    }
  }

  /**
   * Resets the series to its initial state
   */
  function reset () {
    min = undefined
    max = undefined
    seriesSum = 0
    seriesCount = 0
  }

  return {
    push,
    length,
    sum,
    average,
    minimum,
    maximum,
    reset
  }
}
