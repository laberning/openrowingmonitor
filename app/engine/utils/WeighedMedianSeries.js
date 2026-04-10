'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
/**
 * This creates a series with a maximum number of values. It allows for determining the Average, Median, Number of Positive, number of Negative
 * @remark This object uses BinairySearchTrees for determining the Median, Min and Max values, making it usefull for larger series without hurting the CPU too much
 *
 * @param {number} [maxSeriesLength] The maximum length of the series (0 for unlimited)
 */
import { createLabelledBinarySearchTree } from './BinarySearchTree.js'

export function createWeighedMedianSeries (maxSeriesLength = 0) {
  /**
   * @type {Array<number>}
   */
  const binarySearchTree = createLabelledBinarySearchTree()
  let positionArray = []
  let seriesArray = []
  let seriesSum = 0

  /**
   * @param {float} unique identifyer for destroying the datapoint
   * @param {float} value to be added to the series
   * @param {float} weight of value
   */
  function push (position, value, weight) {
    if (value === undefined || isNaN(value)) { return }

    binarySearchTree.push(position, value, weight)
    // As we manage the size of the series based on weight, a single new value might trigger the removal of two old ones
    if (maxSeriesLength > 0 && binarySearchTree.totalWeight() >= maxSeriesLength) { removeHead() }
    if (maxSeriesLength > 0 && binarySearchTree.totalWeight() >= maxSeriesLength) { removeHead() }
    seriesArray.push(value)
    positionArray.push(position)
    seriesSum += value
  }

  function removeHead () {
    // The maximum of the array has been reached, we have to create room by removing the first
    // value from the array
    seriesSum -= seriesArray[0]
    binarySearchTree.remove(positionArray[0])
    positionArray.shift()
    seriesArray.shift()
  }

  /**
   * @output {number} length of the series
   */
  function length () {
    return seriesArray.length
  }

  /**
   * @output {float} value at the head of the series (i.e. the one first added)
   */
  function atSeriesBegin () {
    if (seriesArray.length > 0) {
      return seriesArray[0]
    } else {
      return 0
    }
  }

  /**
   * @output {float} value at the tail of the series (i.e. the one last added)
   */
  function atSeriesEnd () {
    if (seriesArray.length > 0) {
      return seriesArray[seriesArray.length - 1]
    } else {
      return 0
    }
  }

  /**
   * @param {number} position
   * @output {float} value at a specific postion, starting at 0
   */
  function get (position) {
    if (position >= 0 && position < seriesArray.length) {
      return seriesArray[position]
    } else {
      return undefined
    }
  }

  /**
   * @param {number} testedValue
   * @output {number} number of values in the series above the tested value
   */
  function numberOfValuesAbove (testedValue) {
    if (seriesArray.length > 0) {
      return binarySearchTree.numberOfValuesAbove(testedValue)
    } else {
      return 0
    }
  }

  /**
   * @param {number} testedValue
   * @output {number} number of values in the series below or equal to the tested value
   */
  function numberOfValuesEqualOrBelow (testedValue) {
    if (seriesArray.length > 0) {
      return binarySearchTree.numberOfValuesEqualOrBelow(testedValue)
    } else {
      return 0
    }
  }

  /**
   * @output {float} sum of the entire series
   */
  function sum () {
    return seriesSum
  }

  /**
   * @output {float} average of the entire series
   */
  function average () {
    if (seriesArray.length > 0) {
      return seriesSum / seriesArray.length
    } else {
      return 0
    }
  }

  /**
   * @output {float} smallest element in the series
   */
  function minimum () {
    if (seriesArray.length > 0) {
      return binarySearchTree.minimum()
    } else {
      return 0
    }
  }

  /**
   * @output {float} largest value in the series
   */
  function maximum () {
    if (seriesArray.length > 0) {
      return binarySearchTree.maximum()
    } else {
      return 0
    }
  }

  /**
   * @output {float} median of the series
   */
  function median () {
    if (seriesArray.length > 0) {
      return binarySearchTree.median()
    } else {
      return 0
    }
  }

  /**
   * @output {float} weighed median of the series
   */
  function weighedMedian () {
    if (seriesArray.length > 0) {
      return binarySearchTree.weightedMedian()
    } else {
      return 0
    }
  }

  /**
   * @output {array} returns the entire series
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
    binarySearchTree.reset()
    seriesArray = /** @type {Array<number>} */(/** @type {unknown} */(null))
    positionArray = []
    seriesArray = []
    seriesSum = 0
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
    weighedMedian,
    series,
    reset
  }
}
