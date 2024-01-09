'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  The FullTSQuadraticSeries is a datatype that represents a Quadratic Series. It allows
  values to be retrieved (like a FiFo buffer, or Queue) but it also includes
  a Theil-Sen Quadratic Regressor to determine the coefficients of this dataseries.

  At creation its length is determined. After it is filled, the oldest will be pushed
  out of the queue) automatically.

  A key constraint is to prevent heavy calculations at the end (due to large
  array based curve fitting), which might be performed on a Pi zero

  The Theil-Senn implementation uses concepts that are described here:
  https://stats.stackexchange.com/questions/317777/theil-sen-estimator-for-polynomial,

  The determination of the coefficients is based on the math descirbed here:
  https://www.quora.com/How-do-I-find-a-quadratic-equation-from-points/answer/Robert-Paxson,
  https://www.physicsforums.com/threads/quadratic-equation-from-3-points.404174/
*/

import { createSeries } from './Series.js'
import { createTSLinearSeries } from './FullTSLinearSeries.js'
import { createLabelledBinarySearchTree } from './BinarySearchTree.js'

import loglevel from 'loglevel'
const log = loglevel.getLogger('RowingEngine')

function createTSQuadraticSeries (maxSeriesLength = 0) {
  const X = createSeries(maxSeriesLength)
  const Y = createSeries(maxSeriesLength)
  const A = createLabelledBinarySearchTree()
  let _A = 0
  let _B = 0
  let _C = 0

  function push (x, y) {
    // Invariant: A contains all a's (as in the general formula y = a * x^2 + b * x + c)
    // Where the a's are labeled in the Binary Search Tree with their Xi when they BEGIN in the point (Xi, Yi)

    if (maxSeriesLength > 0 && X.length() >= maxSeriesLength) {
      // The maximum of the array has been reached, so when pushing the new datapoint (x,y), the array will get shifted,
      // thus we have to remove all the A's that start with the old position X0 BEFORE this value gets thrown away
      A.remove(X.get(0))
    }

    X.push(x)
    Y.push(y)

    // Calculate the coefficient a for the new interval by adding the newly added datapoint
    let i = 0
    let j = 0
    const linearResidu = createTSLinearSeries(maxSeriesLength)

    switch (true) {
      case (X.length() > 2):
        // There are now at least three datapoints in the X and Y arrays, so let's calculate the A portion belonging for the new datapoint via Quadratic Theil-Sen regression
        // First we calculate the A for the formula
        while (i < X.length() - 2) {
          j = i + 1
          while (j < X.length() - 1) {
            A.push(X.get(i), calculateA(i, j, X.length() - 1))
            j++
          }
          i++
        }
        _A = A.median()

        // Next, we calculate the B and C via Linear regression over the residu
        i = 0
        while (i < X.length() - 1) {
          linearResidu.push(X.get(i), Y.get(i) - (_A * Math.pow(X.get(i), 2)))
          i++
        }
        _B = linearResidu.coefficientA()
        _C = linearResidu.coefficientB()
        break
      case (X.length() === 2 && X.get(1) - X.get(0) !== 0):
        // There are only two datapoints, so we need to be creative to get to a quadratic solution
        // As we know this is part of a 'linear' acceleration, we know that the second derivative should obey 2 * _A = angular acceleration = 2 * angular distance / (delta t)^2
        _A = (Y.get(1) - Y.get(0)) / Math.pow(X.get(1) - X.get(0), 2)
        // As the first derivative should match angular velocity (= angular acceleration * (delta t))
        _B = -2 * _A * X.get(0)
        _C = 0
        break
      default:
        _A = 0
        _B = 0
        _C = 0
    }
  }

  function firstDerivativeAtPosition (position) {
    if (X.length() > 1 && position < X.length()) {
      return ((_A * 2 * X.get(position)) + _B)
    } else {
      return 0
    }
  }

  function secondDerivativeAtPosition (position) {
    if (X.length() > 1 && position < X.length()) {
      return (_A * 2)
    } else {
      return 0
    }
  }

  function slope (x) {
    if (X.length() > 2) {
      return ((_A * 2 * x) + _B)
    } else {
      return 0
    }
  }

  function coefficientA () {
    // For testing purposses only!
    return _A
  }

  function coefficientB () {
    // For testing purposses only!
    return _B
  }

  function coefficientC () {
    // For testing purposses only!
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
    let i = 0
    let ssr = 0
    let sst = 0
    if (X.length() >= 2) {
      while (i < X.length() - 1) {
        ssr += Math.pow((Y.get(i) - projectX(X.get(i))), 2)
        sst += Math.pow((Y.get(i) - Y.average()), 2)
        i++
      }
      if (sst !== 0) {
        const _goodnessOfFit = 1 - (ssr / sst)
        return _goodnessOfFit
      } else {
        return 0
      }
    } else {
      return 0
    }
  }

  function projectX (x) {
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

  function xAtPosition (position) {
    return X.get(position)
  }

  function yAtSeriesBegin () {
    return Y.atSeriesBegin()
  }

  function yAtSeriesEnd () {
    return Y.atSeriesEnd()
  }

  function yAtPosition (position) {
    return Y.get(position)
  }

  function xSum () {
    return X.sum()
  }

  function ySum () {
    return Y.sum()
  }

  function minimumX () {
    return X.minimum()
  }

  function minimumY () {
    return Y.minimum()
  }

  function maximumX () {
    return X.maximum()
  }

  function maximumY () {
    return Y.maximum()
  }

  function xAverage () {
    return X.average()
  }

  function yAverage () {
    return Y.average()
  }

  function xSeries () {
    return X.series()
  }

  function ySeries () {
    return Y.series()
  }

  function calculateA (pointOne, pointTwo, pointThree) {
    let result = 0
    if (X.get(pointOne) !== X.get(pointTwo) && X.get(pointOne) !== X.get(pointThree) && X.get(pointTwo) !== X.get(pointThree)) {
      // For the underlying math, see https://www.quora.com/How-do-I-find-a-quadratic-equation-from-points/answer/Robert-Paxson
      result = (X.get(pointOne) * (Y.get(pointThree) - Y.get(pointTwo)) + Y.get(pointOne) * (X.get(pointTwo) - X.get(pointThree)) + (X.get(pointThree) * Y.get(pointTwo) - X.get(pointTwo) * Y.get(pointThree))) / ((X.get(pointOne) - X.get(pointTwo)) * (X.get(pointOne) - X.get(pointThree)) * (X.get(pointTwo) - X.get(pointThree)))
      return result
    } else {
      log.error('TS Quadratic Regressor, Division by zero prevented in CalculateA!')
      return 0
    }
  }

  function reset () {
    X.reset()
    Y.reset()
    A.reset()
    _A = 0
    _B = 0
    _C = 0
  }

  return {
    push,
    firstDerivativeAtPosition,
    secondDerivativeAtPosition,
    slope,
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
    xAtPosition,
    yAtSeriesBegin,
    yAtSeriesEnd,
    yAtPosition,
    minimumX,
    minimumY,
    maximumX,
    maximumY,
    xAverage,
    yAverage,
    xSum,
    ySum,
    xSeries,
    ySeries,
    reset
  }
}

export { createTSQuadraticSeries }
