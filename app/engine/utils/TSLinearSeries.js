'use strict'
/**
 * @copyright [OpenRowingMonitor]{@link https://github.com/JaapvanEkris/openrowingmonitor}
 *
 * @file The TSLinearSeries is a datatype that represents a Weighted Linear Series. It allows
 * values to be retrieved (like a FiFo buffer, or Queue) but it also includes
 * a Weighted Theil-Sen estimator Linear Regressor to determine the slope of this timeseries.
 *
 * At creation its length is determined. After it is filled, the oldest will be pushed
 * out of the queue) automatically. This is a property of the Series object
 *
 * A key constraint is to prevent heavy calculations at the end (due to large
 * array based curve fitting), which might happen on a Pi zero
 *
 * In order to prevent unneccessary calculations, this implementation uses lazy evaluation,
 * so it will calculate the intercept and goodnessOfFit only when needed, as many uses only
 * (first) need the slope.
 *
 * This implementation uses concepts that are described here:
 * https://en.wikipedia.org/wiki/Theil%E2%80%93Sen_estimator
 *
 * The array is ordered such that x[0] is the oldest, and x[x.length-1] is the youngest
 */

import { createSeries } from './Series.js'
import { createLabelledBinarySearchTree } from './BinarySearchTree.js'

import loglevel from 'loglevel'
const log = loglevel.getLogger('RowingEngine')

/**
 * @param {integer} maxSeriesLength - the maximum length of the quadratic series, default = 0 for unlimited
 */
export function createTSLinearSeries (maxSeriesLength = 0) {
  const X = createSeries(maxSeriesLength)
  const Y = createSeries(maxSeriesLength)
  const weight = createSeries(maxSeriesLength)
  const WY = createSeries(maxSeriesLength)
  const A = createLabelledBinarySearchTree()

  let _A = 0
  let _B = 0
  let _sst = 0
  let _goodnessOfFit = 0

  /**
   * @param {float} x - the x value of the datapoint
   * @param {float} y - the y value of the datapoint
   * @param {float} w - the weight of the datapoint (optional, defaults to 1 for unweighted regression)
   * Invariant: BinarySearchTree A contains all calculated a's (as in the general formula y = a * x + b),
   * where the a's are labeled in the BinarySearchTree with their Xi when they BEGIN in the point (Xi, Yi)
   */
  function push (x, y, w = 1) {
    if (x === undefined || isNaN(x) || y === undefined || isNaN(y)) { return }

    if (maxSeriesLength > 0 && X.length() >= maxSeriesLength) {
      // The maximum of the array has been reached, so when pushing the x,y the array gets shifted,
      // thus we have to remove the a's belonging to the current position X[0] as well before this value is trashed
      A.remove(X.get(0))
    }

    X.push(x)
    Y.push(y)
    weight.push(w)
    WY.push(w * y)

    // Calculate all the slopes of the newly added point
    if (X.length() > 1) {
      // There are at least two points in the X and Y arrays, so let's add the new datapoint
      let i = 0
      let slope
      let combinedweight
      while (i < X.length() - 1) {
        // Calculate the slope with all preceeding datapoints and X.length() - 1'th datapoint (as the array starts at zero)
        slope = calculateSlope(i, X.length() - 1)
        combinedweight = weight.get(i) * w
        A.push(X.get(i), slope, combinedweight)
        i++
      }
    }

    // Calculate the median of the slopes
    if (X.length() > 1) {
      _A = A.weightedMedian()
    } else {
      _A = 0
    }

    // Invalidate the previously calculated intercept and goodnessOfFit. We'll only calculate them if we need them
    _B = null
    _sst = null
    _goodnessOfFit = null
  }

  /**
   * @returns {float} the slope of the linear function
   */
  function slope () {
    return _A
  }

  /**
   * @returns {float} the intercept of the linear function
   */
  function intercept () {
    calculateIntercept()
    return _B
  }

  /**
   * @returns {float} the coefficient a of the linear function y = a * x + b
   */
  function coefficientA () {
    return _A
  }

  /**
   * @returns {float} the coefficient b of the linear function y = a * x + b
   */
  function coefficientB () {
    calculateIntercept()
    return _B
  }

  /**
   * @returns {integer} the lenght of the stored series
   */
  function length () {
    return X.length()
  }

  /**
   * @returns {float} the R^2 as a global goodness of fit indicator
   * It will automatically recalculate the _goodnessOfFit when it isn't defined
   * This lazy approach is intended to prevent unneccesary calculations, especially when there is a batch of datapoints
   * pushes from the TSQuadratic regressor processing its linear residu
   * @see [Goodness-of-Fit Statistics] {@link https://web.maths.unsw.edu.au/~adelle/Garvan/Assays/GoodnessOfFit.html}
   */
  function goodnessOfFit () {
    let i = 0
    let sse = 0
    calculateIntercept()
    if (_goodnessOfFit === null) {
      if (X.length() >= 2) {
        _sst = 0

        // Calculate weighted R^2
        const weightedAverageY = WY.sum() / weight.sum()

        while (i < X.length()) {
          sse += weight.get(i) * Math.pow(Y.get(i) - projectX(X.get(i)), 2)
          _sst += weight.get(i) * Math.pow(Y.get(i) - weightedAverageY, 2)
          i++
        }

        switch (true) {
          case (sse === 0):
            _goodnessOfFit = 1
            break
          case (sse > _sst):
            // This is a pretty bad fit as the error is bigger than just using the line for the average y as intercept
            _goodnessOfFit = 0.01
            break
          case (_sst !== 0):
            _goodnessOfFit = 1 - (sse / _sst)
            break
          default:
            // When SST = 0, R2 isn't defined
            _goodnessOfFit = 0.01
        }
      } else {
        _goodnessOfFit = 0
      }
    }
    return _goodnessOfFit
  }

  /**
   * @param {integer} position - The position in the series for which the Local Goodness Of Fit has to be calcuated
   * @returns {float} the local R^2 as a local goodness of fit indicator
   */
  function localGoodnessOfFit (position) {
    if (_sst === null) {
      // Force the recalculation of the _sst
      goodnessOfFit()
    }
    if (X.length() >= 2 && position < X.length()) {
      const weightedSquaredError = weight.get(position) * Math.pow((Y.get(position) - projectX(X.get(position))), 2)
      /* eslint-disable no-unreachable -- rather be systematic and add a break in all case statements */
      switch (true) {
        case (weightedSquaredError === 0):
          return 1
          break
        case (weightedSquaredError > _sst):
          // This is a pretty bad fit as the error is bigger than just using the line for the average y as intercept
          return 0.01
          break
        case (_sst !== 0):
          return Math.min(Math.max(1 - ((weightedSquaredError * X.length()) / _sst), 0), 1)
          break
        default:
          // When _SST = 0, localGoodnessOfFit isn't defined
          return 0.01
      }
      /* eslint-enable no-unreachable */
    } else {
      return 0
    }
  }

  /**
   * @param {float} x - the x value to be projected
   * @returns {float} the resulting y value when projected via the linear function
   */
  function projectX (x) {
    if (X.length() >= 2) {
      calculateIntercept()
      return (_A * x) + _B
    } else {
      return 0
    }
  }

  /**
   * @param {float} y - the y value to be solved
   * @returns {float} the resulting x value when solved via the linear function
   */
  function projectY (y) {
    if (X.length() >= 2 && _A !== 0) {
      calculateIntercept()
      return ((y - _B) / _A)
    } else {
      log.error('TS Linear Regressor, attempted a Y-projection while slope was zero!')
      return 0
    }
  }

  /**
   * @param {integer} pointOne - The position in the series of the first datapoint used for the slope calculation
   * @param {integer} pointTwo - The position in the series of the second datapoint used for the slope calculation
   * @returns {float} the slope of the linear function
   */
  function calculateSlope (pointOne, pointTwo) {
    if (pointOne !== pointTwo && X.get(pointOne) !== X.get(pointTwo)) {
      return ((Y.get(pointTwo) - Y.get(pointOne)) / (X.get(pointTwo) - X.get(pointOne)))
    } else {
      log.error('TS Linear Regressor, Division by zero prevented!')
      return 0
    }
  }

  /**
   * @description This helper function calculates the intercept and stores it in _B
   */
  function calculateIntercept () {
    // Calculate all the intercepts for the newly added point and the newly calculated A, when needed
    // This function is only called when an intercept is really needed, as this saves a lot of CPU cycles when only a slope suffices
    const B = createLabelledBinarySearchTree()
    if (_B === null) {
      if (X.length() > 1) {
        // There are at least two points in the X and Y arrays, so let's calculate the intercept
        let i = 0
        while (i < X.length()) {
          // Please note, we recreate the B-tree for each newly added datapoint anyway, so the label i isn't relevant
          B.push(i, (Y.get(i) - (_A * X.get(i))), weight.get(i))
          i++
        }
        _B = B.weightedMedian()
      } else {
        _B = 0
      }
    }
    B.reset()
  }

  /**
   * @returns {boolean} whether the linear regression should be considered reliable to produce results
   */
  function reliable () {
    return (X.length() >= 2)
  }

  /**
   * @description This function is used for clearing data and state, bringing it back to its original state
   */
  function reset () {
    if (X.length() > 0) {
      // There is something to reset
      X.reset()
      Y.reset()
      weight.reset()
      WY.reset()
      A.reset()
      _A = 0
      _B = 0
      _goodnessOfFit = 0
    }
  }

  return {
    push,
    X,
    Y,
    slope,
    intercept,
    coefficientA,
    coefficientB,
    length,
    goodnessOfFit,
    localGoodnessOfFit,
    projectX,
    projectY,
    reliable,
    reset
  }
}
