'use strict'
/**
 * @copyright [OpenRowingMonitor]{@link https://github.com/JaapvanEkris/openrowingmonitor}
 *
 * @file This creates a weighed series with a maximum number of values. It allows for determining the Average, Weighed Averge, Median, Number of Positive, number of Negative. DO NOT USE MEDIAN ON LARGE SERIES!
 */
import { createSeries } from './Series.js'

/**
 * @param {integer} the maximum length of the weighed series, 0 for unlimited
 * @param {float|undefined} the default value to return if a function can't calculate a value
 */
export function createWeighedSeries (maxSeriesLength = 0, defaultValue) {
  const dataArray = createSeries(maxSeriesLength)
  const weightArray = createSeries(maxSeriesLength)
  const weightedArray = createSeries(maxSeriesLength)

  /**
   * @param {float} the value of the datapoint
   * @param {float} the weight of the datapoint
   */
  function push (value, weight) {
    if (value === undefined || isNaN(value) || weight === undefined || isNaN(weight)) { return }
    dataArray.push(value)
    weightArray.push(weight)
    weightedArray.push(value * weight)
  }

  /**
   * @returns {integer} the lenght of the stored series
   */
  function length () {
    return dataArray.length()
  }

  /**
   * @returns {float} the oldest value of the series (i.e. the one first added)
   */
  function atSeriesBegin () {
    return dataArray.atSeriesBegin()
  }

  /**
   * @returns {float} the youngest value of the series (i.e. the one last added)
   */
  function atSeriesEnd () {
    return dataArray.atSeriesEnd()
  }

  /**
   * @param {integer} position to be retrieved, starting at 0
   * @returns {float} value at that specific postion in the series
   */
  function get (position) {
    return dataArray.get(position)
  }

  /**
   * @param {float} tested value
   * @returns {integer} count of values in the series above the tested value
   */
  function numberOfValuesAbove (testedValue) {
    return dataArray.numberOfValuesAbove(testedValue)
  }

  /**
   * @param {float} tested value
   * @returns {integer} number of values in the series below or equal to the tested value
   */
  function numberOfValuesEqualOrBelow (testedValue) {
    return dataArray.numberOfValuesEqualOrBelow(testedValue)
  }

  /**
   * @returns {float} sum of the entire series
   */
  function sum () {
    return dataArray.sum()
  }

  /**
   * @returns {float} average of the entire series
   */
  function average () {
    if (dataArray.length() > 0) {
      // The series contains sufficient values to be valid
      return dataArray.average()
    } else {
      // The array isn't sufficiently filled
      return defaultValue
    }
  }

  /**
   * @returns {float} the weighed average of the series
   */
  function weighedAverage () {
    if (dataArray.length() > 0 && weightArray.sum() !== 0) {
      return (weightedArray.sum() / weightArray.sum())
    } else {
      return defaultValue
    }
  }

  /**
   * @returns {float} smallest element in the series
   */
  function minimum () {
    return dataArray.minimum()
  }

  /**
   * @returns {float} largest value in the series
   */
  function maximum () {
    return dataArray.maximum()
  }

  /**
   * @returns {float} median of the series
   * @description returns the median of the series. As this is a CPU intensive approach, DO NOT USE FOR LARGE SERIES!. For larger series, use the BinarySearchTree.js instead
   */
  function median () {
    return dataArray.median()
  }

  /**
   * @returns {boolean} if the weighed series results are to be considered reliable
   */
  function reliable () {
    return dataArray.length() > 0
  }

  /**
   * @returns {array} returns the entire series of datapoints
   */
  function series () {
    return dataArray.series()
  }

  /**
   * Resets the series to its initial state
   */
  function reset () {
    dataArray.reset()
    weightArray.reset()
    weightedArray.reset()
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
    weighedAverage,
    minimum,
    maximum,
    median,
    series,
    reliable,
    reset
  }
}
