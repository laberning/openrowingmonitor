'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This creates a series with a maximum number of values
  It allows for determining the Average, Median, Number of Positive, number of Negative
*/

import { createSeries } from './Series.js'

function createWeighedSeries (maxSeriesLength, defaultValue) {
  const dataArray = createSeries(maxSeriesLength)
  const weightArray = createSeries(maxSeriesLength)
  const weightedArray = createSeries(maxSeriesLength)

  function push (value, weight) {
    dataArray.push(value)
    weightArray.push(weight)
    weightedArray.push(value * weight)
  }

  function length () {
    return dataArray.length()
  }

  function atSeriesBegin () {
    return dataArray.atSeriesBegin()
  }

  function atSeriesEnd () {
    return dataArray.atSeriesEnd()
  }

  function get (position) {
    return dataArray.get(position)
  }

  function numberOfValuesAbove (testedValue) {
    return dataArray.numberOfValuesAbove(testedValue)
  }

  function numberOfValuesEqualOrBelow (testedValue) {
    return dataArray.numberOfValuesEqualOrBelow(testedValue)
  }

  function sum () {
    return dataArray.sum()
  }

  function average () {
    if (dataArray.length() > 0) {
      // The series contains sufficient values to be valid
      return dataArray.average()
    } else {
      // The array isn't sufficiently filled
      return defaultValue
    }
  }

  function weighedAverage () {
    if (dataArray.length() > 0 && weightArray.sum() !== 0) {
      return (weightedArray.sum() / weightArray.sum())
    } else {
      return defaultValue
    }
  }

  function minimum () {
    return dataArray.minimum()
  }

  function maximum () {
    return dataArray.maximum()
  }

  function median () {
    return dataArray.median()
  }

  function reliable () {
    return dataArray.length() > 0
  }

  function series () {
    return dataArray.series()
  }

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

export { createWeighedSeries }
