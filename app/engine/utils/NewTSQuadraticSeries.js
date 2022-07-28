'use strict'
/*
  Open Rowing Monitor, https://github.com/jaapvanekris/openrowingmonitor

  The TSLinearSeries is a datatype that represents a Linear Series. It allows
  values to be retrieved (like a FiFo buffer, or Queue) but it also includes
  a Theil-Sen estimator Linear Regressor to determine the slope of this timeseries.

  At creation its length is determined. After it is filled, the oldest will be pushed
  out of the queue) automatically.

  A key constraint is to prevent heavy calculations at the end (due to large
  array based curve fitting), which might be performed on a Pi zero

  This implementation uses concepts that are described here:
  https://stats.stackexchange.com/questions/317777/theil-sen-estimator-for-polynomial

  The array is ordered such that x[0] is the oldest, and x[x.length-1] is the youngest
*/

import { createSeries } from './Series.js'
import { createTSLinearSeries } from './TSLinearSeries.js'

function createTSQuadraticSeries (maxSeriesLength = 0) {
  const X = createSeries(maxSeriesLength)
  const Y = createSeries(maxSeriesLength)
  const A = createTSLinearSeries(maxSeriesLength)
  const B = createTSLinearSeries(maxSeriesLength)
  let _A = 0
  let _B = 0

  function push (x, y) {
    X.push(x)
    Y.push(y)
    A.push(Math.pow(x, 2), y)

    // Invariant: the indices of the X and Y array now match up with the
    // row numbers of the A array. So, the A of (X[0],Y[0]) and (X[1],Y[1]
    // will be stored in A[0][.].

    // Calculate the quadratic element of this new point
    if (X.length() > 2) {
      _A = A.slope()
    } else {
      _A = 0
    }

    B.reset()
    if (X.length() > 2) {
      // There are at least two points in the X and Y arrays, so let's add the new datapoint
      let i = 0
      while (i <= X.length() - 1) {
        B.push(x, y - (_A * Math.pow(x, 2)))
        i++
      }
      _B = B.slope()
    } else {
      _B = 0
    }
  }

  function slope (index) {
    return _slope(X.get(index))
  }

  function slopeAtSeriesBegin () {
    return _slope(X.get(0))
  }

  function slopeAtSeriesEnd () {
    return _slope(X.get(X.length() - 1))
  }

  function _slope (x) {
    if (X.length() > 2) {
      return ((_A * 2 * x) + _B)
    } else {
      return 0
    }
  }

  function coefficientA () {
    return _A
  }

  function coefficientB () {
    return _B
  }

  function coefficientC () {
    const C = createSeries()
    let i = 0
    let result = 0
    while (i < X.length() - 1) {
      result = calculateC(i)
      C.push(result)
      i++
    }
    return C.median()
  }

  function intercept () {
    return 0
    // ToDo: calculate y-intercept
  }

  function length () {
    return X.length()
  }

  function goodnessOfFit () {
    // This function returns the R^2 as a goodness of fit indicator
    // ToDo: calculate the goodness of fit when called
    if (X.length() >= 2) {
      // return _goodnessOfFit
      return 1
    } else {
      return 0
    }
  }

  function projectX (x) {
    const _C = coefficientC()
    if (X.length() > 2) {
      return ((_A * x * x) + (_B * x) + _C)
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

  function calculateC (pointOne) {
    return Y.get(pointOne) - _A * Math.pow(X.get(pointOne), 2) - _B * X.get(pointOne)
  }

  function reset () {
    X.reset()
    Y.reset()
    A.splice(0, A.length)
    B.reset()
    _A = 0
    _B = 0
  }

  return {
    push,
    slope,
    slopeAtSeriesBegin,
    slopeAtSeriesEnd,
    coefficientA,
    coefficientB,
    coefficientC,
    intercept,
    length,
    goodnessOfFit,
    projectX,
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

export { createTSQuadraticSeries }
