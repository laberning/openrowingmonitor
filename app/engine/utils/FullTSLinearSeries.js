'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  The TSLinearSeries is a datatype that represents a Linear Series. It allows
  values to be retrieved (like a FiFo buffer, or Queue) but it also includes
  a TheilÃ¢â‚¬â€œSen estimator Linear Regressor to determine the slope of this timeseries.

  At creation its length is determined. After it is filled, the oldest will be pushed
  out of the queue) automatically.

  A key constraint is to prevent heavy calculations at the end (due to large
  array based curve fitting), which might happen on a Pi zero

  This implementation uses concepts that are described here:
  https://en.wikipedia.org/wiki/Theil%E2%80%93Sen_estimator

  The array is ordered such that x[0] is the oldest, and x[x.length-1] is the youngest
*/

import { createSeries } from './Series.js'

import loglevel from 'loglevel'
const log = loglevel.getLogger('RowingEngine')

function createTSLinearSeries (maxSeriesLength = 0) {
  const X = createSeries(maxSeriesLength)
  const Y = createSeries(maxSeriesLength)
  const slopes = []

  let _A = 0
  let _B = 0
  let _goodnessOfFit = 0

  function push (x, y) {
    X.push(x)
    Y.push(y)

    if (maxSeriesLength > 0 && slopes.length >= maxSeriesLength) {
      // The maximum of the array has been reached, we have to create room
      // in the 2D array by removing the first row from the table
      removeFirstRow()
    }

    // Invariant: the indices of the X and Y array now match up with the
    // row numbers of the slopes array. So, the slope of (X[0],Y[0]) and (X[1],Y[1]
    // will be stored in slopes[0][.].

    // Calculate the slopes of this new point
    if (X.length() > 1) {
      // There are at least two points in the X and Y arrays, so let's add the new datapoint
      let i = 0
      let result = 0
      while (i < slopes.length) {
        result = calculateSlope(i, slopes.length)
        slopes[i].push(result)
        i++
      }
    }
    // Add an empty array at the end to store futurs results for the most recent points
    slopes.push([])

    // Calculate the median of the slopes
    if (X.length() > 1) {
      _A = median()
    } else {
      _A = 0
    }
    _B = Y.average() - (_A * X.average())
  }

  function slope () {
    return _A
  }

  function intercept () {
    return _B
  }

  function coefficientA () {
    // For testing purposses only!
    return _A
  }

  function coefficientB () {
    // For testing purposses only!
    return _B
  }

  function length () {
    return X.length()
  }

  function goodnessOfFit () {
    // This function returns the R^2 as a goodness of fit indicator
    if (X.length() >= 2) {
      return _goodnessOfFit
    } else {
      return 0
    }
  }

  function projectX (x) {
    if (X.length() >= 2) {
      return (_A * x) + _B
    } else {
      return 0
    }
  }

  function projectY (y) {
    if (X.length() >= 2 && _A !== 0) {
      return ((y - _B) / _A)
    } else {
      return 0
    }
  }

  function numberOfXValuesAbove (testedValue) {
    return X.numberOfValuesAbove(testedValue)
  }

  function numberOfXValuesEqualOrBelow (testedValue) {
    return X.numberOfValuesEqualOrBelow(testedValue)
  }

  function numberOfYValuesAbove (testedValue) {
    return Y.numberOfValuesAbove(testedValue)
  }

  function numberOfYValuesEqualOrBelow (testedValue) {
    return Y.numberOfValuesEqualOrBelow(testedValue)
  }

  function xAtSeriesBegin () {
    return X.atSeriesBegin()
  }

  function xAtSeriesEnd () {
    return X.atSeriesEnd()
  }

  function yAtSeriesBegin () {
    return Y.atSeriesBegin()
  }

  function yAtSeriesEnd () {
    return Y.atSeriesEnd()
  }

  function xSum () {
    return X.sum()
  }

  function ySum () {
    return Y.sum()
  }

  function xSeries () {
    return X.series()
  }

  function ySeries () {
    return Y.series()
  }

  function removeFirstRow () {
    slopes.shift()
  }

  function calculateSlope (pointOne, pointTwo) {
    if (pointOne !== pointTwo && X.get(pointOne) !== X.get(pointTwo)) {
      return ((Y.get(pointTwo) - Y.get(pointOne)) / (X.get(pointTwo) - X.get(pointOne)))
    } else {
      log.error('TS Linear Regressor, Division by zero prevented!')
      return 0
    }
  }

  function median () {
    if (slopes.length > 1) {
      const sortedArray = [...slopes.flat()].sort((a, b) => a - b)
      const mid = Math.floor(sortedArray.length / 2)
      return (sortedArray.length % 2 !== 0 ? sortedArray[mid] : ((sortedArray[mid - 1] + sortedArray[mid]) / 2))
    } else {
      log.error('TS Linear Regressor, Median calculation on empty dataset attempted!')
      return 0
    }
  }

  function reset () {
    X.reset()
    Y.reset()
    slopes.splice(0, slopes.length)
    _A = 0
    _B = 0
    _goodnessOfFit = 0
  }

  return {
    push,
    slope,
    intercept,
    coefficientA,
    coefficientB,
    length,
    goodnessOfFit,
    projectX,
    projectY,
    numberOfXValuesAbove,
    numberOfXValuesEqualOrBelow,
    numberOfYValuesAbove,
    numberOfYValuesEqualOrBelow,
    xAtSeriesBegin,
    xAtSeriesEnd,
    yAtSeriesBegin,
    yAtSeriesEnd,
    xSum,
    ySum,
    xSeries,
    ySeries,
    reset
  }
}

export { createTSLinearSeries }
