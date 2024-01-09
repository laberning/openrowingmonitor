'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  The TSLinearSeries is a datatype that represents a Linear Series. It allows
  values to be retrieved (like a FiFo buffer, or Queue) but it also includes
  a Theil-Sen estimator Linear Regressor to determine the slope of this timeseries.

  At creation its length is determined. After it is filled, the oldest will be pushed
  out of the queue) automatically.

  A key constraint is to prevent heavy calculations at the end (due to large
  array based curve fitting), which might happen on a Pi zero

  This implementation uses concepts that are described here:
  https://en.wikipedia.org/wiki/Theil%E2%80%93Sen_estimator

  The array is ordered such that x[0] is the oldest, and x[x.length-1] is the youngest
*/

import { createSeries } from './Series.js'
import { createLabelledBinarySearchTree } from './BinarySearchTree.js'

import loglevel from 'loglevel'
const log = loglevel.getLogger('RowingEngine')

function createTSLinearSeries (maxSeriesLength = 0) {
  const X = createSeries(maxSeriesLength)
  const Y = createSeries(maxSeriesLength)
  const A = createLabelledBinarySearchTree()

  let _A = 0
  let _B = 0

  function push (x, y) {
    // Invariant: A contains all a's (as in the general formula y = a * x^2 + b * x + c)
    // Where the a's are labeled in the Binary Search Tree with their xi when they BEGIN in the point (xi, yi)
    if (maxSeriesLength > 0 && X.length() >= maxSeriesLength) {
      // The maximum of the array has been reached, so when pushing the x,y the array gets shifted,
      // thus we have to remove the a's belonging to the current position X0 as well before this value is trashed
      A.remove(X.get(0))
    }

    X.push(x)
    Y.push(y)

    // Calculate all the slopes of the newly added point
    if (X.length() > 1) {
      // There are at least two points in the X and Y arrays, so let's add the new datapoint
      let i = 0
      while (i < X.length() - 1) {
        A.push(X.get(i), calculateSlope(i, X.length() - 1))
        i++
      }
    }

    // Calculate the median of the slopes
    if (X.length() > 1) {
      _A = A.median()
    } else {
      _A = 0
    }

    // Calculate all the intercepts for the newly added point and the newly calculated A
    const B = createLabelledBinarySearchTree()
    if (X.length() > 1) {
      // There are at least two points in the X and Y arrays, so let's calculate the intercept
      let i = 0
      while (i < X.length() - 1) {
        // Please note , as we need to recreate the B-tree for each newly added datapoint anyway, the label i isn't relevant
        B.push(i, (Y.get(i) - (_A * X.get(i))))
        i++
      }
    }

    _B = B.median()
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

  function calculateSlope (pointOne, pointTwo) {
    if (pointOne !== pointTwo && X.get(pointOne) !== X.get(pointTwo)) {
      return ((Y.get(pointTwo) - Y.get(pointOne)) / (X.get(pointTwo) - X.get(pointOne)))
    } else {
      log.error('TS Linear Regressor, Division by zero prevented!')
      return 0
    }
  }

  function reset () {
    X.reset()
    Y.reset()
    A.reset()
    _A = 0
    _B = 0
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
    xAverage,
    yAverage,
    xSeries,
    ySeries,
    reset
  }
}

export { createTSLinearSeries }
