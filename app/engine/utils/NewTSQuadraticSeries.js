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
  https://stats.stackexchange.com/questions/317777/theil-sen-estimator-for-polynomial,
  https://math.stackexchange.com/questions/710750/find-a-second-degree-polynomial-that-goes-through-3-points
  https://www.physicsforums.com/threads/quadratic-equation-from-3-points.404174/

  The array is ordered such that x[0] is the oldest, and x[x.length-1] is the youngest
*/

import { createSeries } from './Series.js'

import loglevel from 'loglevel'
const log = loglevel.getLogger('RowingEngine')

function createTSQuadraticSeries (maxSeriesLength = 0) {
  const X = createSeries(maxSeriesLength)
  const Y = createSeries(maxSeriesLength)
  const A = []
  const B = createSeries()
  let _A = 0
  let _B = 0

  function push (x, y) {
    X.push(x)
    Y.push(y)

    if (maxSeriesLength > 0 && A.length >= maxSeriesLength) {
      // The maximum of the array has been reached, we have to create room
      // in the 2D array by removing the first row from the table
      removeFirstRow()
    }

    // Invariant: the indices of the X and Y array now match up with the
    // row numbers of the A array. So, the A of (X[0],Y[0]) and (X[1],Y[1]
    // will be stored in A[0][.].

    // Calculate the slopes of this new point
    if (X.length() > 2) {
      // There are at least two points in the X and Y arrays, so let's add the new datapoint
      let i = 0
      let result = 0
      let mid = 0
      while (i < X.length() - 2) {
        mid = Math.floor((i + A.length) / 2)
        result = calculateA(i, mid, A.length)
        A[i].push(result)
        i++
      }
      _A = Amedian()
    } else {
      _A = 0
    }

    // Add an empty array at the end to store futurs results for the most recent points
    A.push([])

    B.reset()
    if (X.length() > 2) {
      // There are at least two points in the X and Y arrays, so let's add the new datapoint
      let i = 0
      let j = 0
      let result = 0
      while (i < X.length() - 1) {
        j = i + 1
        while (j < X.length() - 1) {
          result = calculateB(i, j)
          B.push(result)
          j++
        }
        i++
      }
      _B = B.median()
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

  function removeFirstRow () {
    A.shift()
  }

  function calculateA (pointOne, pointTwo, pointThree) {
    // For the underlying math, see https://math.stackexchange.com/questions/710750/find-a-second-degree-polynomial-that-goes-through-3-points
    // and https://www.physicsforums.com/threads/quadratic-equation-from-3-points.404174/
    if (pointOne < pointTwo && pointTwo < pointThree && X.get(pointOne) !== X.get(pointTwo) && X.get(pointTwo) !== X.get(pointThree) && X.get(pointOne) !== X.get(pointThree)) {
      return (X.get(pointOne) * (Y.get(pointTwo) - Y.get(pointThree)) + X.get(pointThree) * (Y.get(pointOne) - Y.get(pointTwo)) + X.get(pointTwo) * (Y.get(pointThree) - Y.get(pointOne))) / ((X.get(pointThree) - X.get(pointTwo)) * Math.pow(X.get(pointOne), 2) + X.get(pointOne) * (Math.pow(X.get(pointTwo), 2) - Math.pow(X.get(pointThree), 2))  + (X.get(pointTwo) * Math.pow(X.get(pointThree), 2) - X.get(pointThree) * Math.pow(X.get(pointTwo), 2)))
    } else {
      log.error('TS Quadratic Regressor, Division by zero prevented in CalculateA!')
      return 0
    }
  }

  function calculateB (pointOne, pointTwo) {
    // For the underlying math, see https://math.stackexchange.com/questions/710750/find-a-second-degree-polynomial-that-goes-through-3-points
    // and https://www.physicsforums.com/threads/quadratic-equation-from-3-points.404174/
    if (pointOne < pointTwo && X.get(pointOne) !== X.get(pointTwo)) {
      return ((Y.get(pointTwo) - _A * Math.pow(X.get(pointTwo), 2)) - (Y.get(pointOne) - _A * Math.pow(X.get(pointOne), 2))) / (X.get(pointTwo) - X.get(pointOne))
    } else {
      log.error('TS Quadratic Regressor, Division by zero prevented in CalculateB!')
      return 0
    }
  }

  function calculateC (pointOne) {
    // For the underlying math, see https://math.stackexchange.com/questions/710750/find-a-second-degree-polynomial-that-goes-through-3-points
    // and https://www.physicsforums.com/threads/quadratic-equation-from-3-points.404174/
    return Y.get(pointOne) - _A * Math.pow(X.get(pointOne), 2) - _B * X.get(pointOne)
  }

  function Amedian () {
    if (A.length > 1) {
      const sortedArray = [...A.flat()].sort((a, b) => a - b)
      const mid = Math.floor(sortedArray.length / 2)
      return (sortedArray.length % 2 !== 0 ? sortedArray[mid] : ((sortedArray[mid - 1] + sortedArray[mid]) / 2))
    } else {
      log.error('TS Quadratic Regressor, Median calculation on empty dataset attempted!')
      return 0
    }
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
