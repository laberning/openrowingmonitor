'use strict'
/**
 * @copyright {@link https://github.com/JaapvanEkris/openrowingmonitor|OpenRowingMonitor}
 *
 * @file This creates a series with a maximum number of values. It allows for determining the Average, Median, Number of Positive, number of Negative
 * BE AWARE: The median function is extremely CPU intensive for larger series. Use the BinarySearchTree for that situation instead!
 * BE AWARE: Accumulators (seriesSum especially) are vulnerable to floating point rounding errors causing drift.
 */
/**
 * @param {number} maxSeriesLength - The maximum length of the series (0 for unlimited)
 */
export function createSeries (maxSeriesLength = 0) {
  /**
   * @type {Array<number>}
   * 'updateCountCeiling' is added as a future provision. It currently set to 1, forcing a sum recalc every push. Setting it higher reduces CPU load, but also reduces accuracy
   * due to accumulator rounding issues. Special tests are present in the corresponding unit-tests, but testing of dependent modules show small deviations
   */
  const updateCountCeiling = maxSeriesLength > 0 ? Math.min(1, maxSeriesLength) : 1
  let seriesArray = []
  let numPos = 0
  let numNeg = 0
  let min = undefined
  let max = undefined
  let seriesSum = null
  let updatecount = 0

  /**
   * @param {float} value - value to be added to the series
   */
  function push (value) {
    if (value === undefined || isNaN(value)) { return }

    if (min !== undefined) { min = Math.min(min, value) }
    if (max !== undefined) { max = Math.max(max, value) }

    if (maxSeriesLength > 0 && seriesArray.length >= maxSeriesLength) {
      // The maximum of the array has been reached, we have to create room by removing the first value from the array
      if (seriesArray[0] > 0) {
        numPos--
      } else {
        numNeg--
      }
      if (min === seriesArray[0]) {
        min = undefined
      }
      if (max === seriesArray[0]) {
        max = undefined
      }
      if (seriesSum !== null) { seriesSum -= seriesArray[0] }
      seriesArray.shift()
    }
    seriesArray.push(value)

    updatecount++

    if (updatecount < updateCountCeiling && seriesSum !== null) {
      seriesSum += value
    } else {
      updatecount = 0
      seriesSum = null
    }

    if (value > 0) {
      numPos++
    } else {
      numNeg++
    }
  }

  /**
   * @returns {number} length of the series
   */
  function length () {
    return seriesArray.length
  }

  /**
   * @returns {float} the oldest value of the series (i.e. the one first added)
   */
  function atSeriesBegin () {
    if (seriesArray.length > 0) {
      return seriesArray[0]
    } else {
      return 0
    }
  }

  /**
   * @returns {float} the youngest value of the series (i.e. the one last added)
   */
  function atSeriesEnd () {
    if (seriesArray.length > 0) {
      return seriesArray[seriesArray.length - 1]
    } else {
      return 0
    }
  }

  /**
   * @param {integer} position - position to be retrieved, starting at 0
   * @returns {float} value at that specific postion in the series
   */
  function get (position) {
    if (position >= 0 && position < seriesArray.length) {
      return seriesArray[position]
    } else {
      return undefined
    }
  }

  /**
   * @param {float} testedValue - tested value
   * @returns {integer} count of values in the series above the tested value
   */
  function numberOfValuesAbove (testedValue) {
    if (testedValue === 0) {
      return numPos
    } else {
      let i = seriesArray.length - 1
      let count = 0
      while (i >= 0) {
        if (seriesArray[i] > testedValue) {
          count++
        }
        i--
      }
      return count
    }
  }

  /**
   * @param {float} testedValue - tested value
   * @returns {integer} number of values in the series below or equal to the tested value
   */
  function numberOfValuesEqualOrBelow (testedValue) {
    if (testedValue === 0) {
      return numNeg
    } else {
      let i = seriesArray.length - 1
      let count = 0
      while (i >= 0) {
        if (seriesArray[i] <= testedValue) {
          count++
        }
        i--
      }
      return count
    }
  }

  /**
   * @returns {float} sum of the entire series
   * @description This determines the total sum of the series. As a running sum becomes unstable after longer running sums, we need to summarise this via a reduce
   */
  function sum () {
    if (seriesSum === null) {
      seriesSum = (seriesArray.length > 0 ? seriesArray.reduce((total, item) => total + item) : 0)
    }
    return seriesSum
  }

  /**
   * @returns {float} average of the entire series
   */
  function average () {
    if (seriesArray.length > 0) {
      return sum() / seriesArray.length
    } else {
      return 0
    }
  }

  /**
   * @returns {float} smallest element in the series
   */
  function minimum () {
    if (seriesArray.length > 0) {
      if (isNaN(min)) { min = Math.min(...seriesArray) }
      return min
    } else {
      return 0
    }
  }

  /**
   * @returns {float} largest value in the series
   */
  function maximum () {
    if (seriesArray.length > 0) {
      if (isNaN(max)) { max = Math.max(...seriesArray) }
      return max
    } else {
      return 0
    }
  }

  /**
   * @returns {float} median of the series
   * @description returns the median of the series. As this is a CPU intensive approach, DO NOT USE FOR LARGE SERIES!. For larger series, use the BinarySearchTree.js instead
   */
  function median () {
    if (seriesArray.length > 0) {
      const mid = Math.floor(seriesArray.length / 2)
      const sortedArray = [...seriesArray].sort((a, b) => a - b)
      return seriesArray.length % 2 !== 0 ? sortedArray[mid] : (sortedArray[mid - 1] + sortedArray[mid]) / 2
    } else {
      return 0
    }
  }

  /**
   * @returns {array} returns the entire series
   */
  function series () {
    if (seriesArray.length > 0) {
      return seriesArray
    } else {
      return []
    }
  }

  /**
   * Resets the series to its initial state
   */
  function reset () {
    seriesArray = /** @type {Array<number>} */(/** @type {unknown} */(null))
    seriesArray = []
    numPos = 0
    numNeg = 0
    min = undefined
    max = undefined
    seriesSum = null
  }

  return {
    push,
    length,
    atSeriesBegin,
    atSeriesEnd,
    get,
    numberOfValuesAbove,
    numberOfValuesEqualOrBelow,
    sum,
    average,
    minimum,
    maximum,
    median,
    series,
    reset
  }
}
