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

  The Theil-Senn implementation uses concepts that are described here:
  https://stats.stackexchange.com/questions/317777/theil-sen-estimator-for-polynomial,

  The determination of the coefficients is based on the math descirbed here:
  https://www.quora.com/How-do-I-find-a-quadratic-equation-from-points/answer/Robert-Paxson,
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
  const B = []
  const C = []
  let _A = 0
  let _B = 0
  let _C = 0

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

    // Add an empty array at the end to store futurs results for the most recent points
    A.push([])
    B.push([])
    C.push([])

    // Calculate the slopes of this new point
    if (X.length() > 2) {
      // There are at least two points in the X and Y arrays, so let's add the new datapoint
      let i = 0
      while (i < X.length() - 2) {
        A[X.length() - 1].push(calculateA(i, X.length() - 1))
        B[X.length() - 1].push(calculateB(i, X.length() - 1))
        C[X.length() - 1].push(calculateC(i, X.length() - 1))
        i++
      }
      // _A = matrixMedian(A)
      // _B = matrixMedian(B)
      // _C = matrixMedian(C)
      _A = trimmedMatrixMedian(A)
      _B = trimmedMatrixMedian(B)
      _C = trimmedMatrixMedian(C)
    } else {
      _A = 0
      _B = 0
      _C = 0
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
    return _C
  }

  function intercept () {
    return coefficientC()
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
    B.shift()
    C.shift()
  }

  function calculateA (pointOne, pointThree) {
    if ((pointOne + 1) < pointThree && X.get(pointOne) !== X.get(pointThree)) {
      const results = createSeries(maxSeriesLength)
      let pointTwo = pointOne + 1
      while (pointOne < pointTwo && pointTwo < pointThree && X.get(pointOne) !== X.get(pointTwo) && X.get(pointTwo) !== X.get(pointThree)) {
        // For the underlying math, see https://www.quora.com/How-do-I-find-a-quadratic-equation-from-points/answer/Robert-Paxson
        results.push((X.get(pointOne) * (Y.get(pointThree) - Y.get(pointTwo)) + Y.get(pointOne) * (X.get(pointTwo) - X.get(pointThree)) + (X.get(pointThree) * Y.get(pointTwo) - X.get(pointTwo) * Y.get(pointThree))) / ((X.get(pointOne) - X.get(pointTwo)) * (X.get(pointOne) - X.get(pointThree)) * (X.get(pointTwo) - X.get(pointThree))))
        pointTwo += 1
      }
      return results.median()
    } else {
      log.error('TS Quadratic Regressor, Division by zero prevented in CalculateA!')
      return 0
    }
  }

  function calculateB (pointOne, pointThree) {
    if ((pointOne + 1) < pointThree && X.get(pointOne) !== X.get(pointThree)) {
      const pointTwo = Math.floor((pointOne + pointThree) / 2)
      if (pointOne < pointTwo && pointTwo < pointThree && X.get(pointOne) !== X.get(pointTwo) && X.get(pointTwo) !== X.get(pointThree)) {
        // For the underlying math, see https://www.quora.com/How-do-I-find-a-quadratic-equation-from-points/answer/Robert-Paxson
        return ((Math.pow(X.get(pointOne), 2) * (Y.get(pointTwo) - Y.get(pointThree)) + Math.pow(X.get(pointTwo), 2) * (Y.get(pointThree) - Y.get(pointOne)) + Math.pow(X.get(pointThree), 2) * (Y.get(pointOne) - Y.get(pointTwo))) / ((X.get(pointOne) - X.get(pointTwo)) * (X.get(pointOne) - X.get(pointThree)) * (X.get(pointTwo) - X.get(pointThree))))
      } else {
        log.error('TS Quadratic Regressor, Division by zero prevented in CalculateB!')
        return 0
      }
    } else {
      log.error('TS Quadratic Regressor, Division by zero prevented in CalculateA!')
      return 0
    }
  }

  function calculateC (pointOne, pointThree) {
    if ((pointOne + 1) < pointThree && X.get(pointOne) !== X.get(pointThree)) {
      const pointTwo = Math.floor((pointOne + pointThree) / 2)
      if (pointOne < pointTwo && pointTwo < pointThree && X.get(pointOne) !== X.get(pointTwo) && X.get(pointTwo) !== X.get(pointThree)) {
        // For the underlying math, see https://www.quora.com/How-do-I-find-a-quadratic-equation-from-points/answer/Robert-Paxson
        return ((Math.pow(X.get(pointOne), 2) * (X.get(pointTwo) * Y.get(pointThree) - X.get(pointThree) * Y.get(pointTwo)) + Math.pow(X.get(pointTwo), 2) * (X.get(pointThree) * Y.get(pointOne) - X.get(pointOne) * Y.get(pointThree)) + Math.pow(X.get(pointThree), 2) * (X.get(pointOne) * Y.get(pointTwo) - X.get(pointTwo) * Y.get(pointOne))) / ((X.get(pointOne) - X.get(pointTwo)) * (X.get(pointOne) - X.get(pointThree)) * (X.get(pointTwo) - X.get(pointThree))))
      } else {
        log.error('TS Quadratic Regressor, Division by zero prevented in CalculateB!')
        return 0
      }
    } else {
      log.error('TS Quadratic Regressor, Division by zero prevented in CalculateA!')
      return 0
    }
  }

  function matrixMedian (inputMatrix) {
    if (inputMatrix.length > 1) {
      const sortedArray = [...inputMatrix.flat()].sort((a, b) => a - b)
      const mid = Math.floor(sortedArray.length / 2)
      return (sortedArray.length % 2 !== 0 ? sortedArray[mid] : ((sortedArray[mid - 1] + sortedArray[mid]) / 2))
    } else {
      log.error('TS Quadratic Regressor, Median calculation on empty matrix attempted!')
      return 0
    }
  }

  function trimmedMatrixMedian (inputMatrix) {
    if (inputMatrix.length > 1) {
      let intermediateMatrix = []
      let i = 0
      while (i<inputMatrix.length) {
        intermediateMatrix.push(inputMatrix[i].splice(0, maxSeriesLength - i))
        i++
      }
      const sortedArray = [...intermediateMatrix.flat()].sort((a, b) => a - b)
      const mid = Math.floor(sortedArray.length / 2)
      return (sortedArray.length % 2 !== 0 ? sortedArray[mid] : ((sortedArray[mid - 1] + sortedArray[mid]) / 2))
    } else {
      log.error('TS Quadratic Regressor, Median calculation on empty matrix attempted!')
      return 0
    }
  }
  
  function reset () {
    X.reset()
    Y.reset()
    A.splice(0, A.length)
    B.splice(0, B.length)
    C.splice(0, C.length)
    _A = 0
    _B = 0
    _C = 0
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
