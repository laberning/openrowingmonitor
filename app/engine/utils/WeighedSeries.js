'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This creates a series with weights
  It allows for determining the Average, Weighed Average, Median, Number of Positive, number of Negative
*/

import { createSeries } from './Series.js'

function createWeighedSeries (maxSeriesLength) {
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
    return dataArray.average()
  }

  function weighedAverage () {
    if (dataArray.length() > 0 && weightArray.sum() !== 0) {
      return (weightedArray.sum() / weightArray.sum())
    } else {
      return undefined
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
    reset
  }
}

export { createWeighedSeries }
