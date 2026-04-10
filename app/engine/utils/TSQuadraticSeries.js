'use strict'
/**
 * @copyright [OpenRowingMonitor]{@link https://github.com/JaapvanEkris/openrowingmonitor}
 *
 * @file The FullTSQuadraticSeries is a datatype that represents a Quadratic Series. It allows
 * values to be retrieved (like a FiFo buffer, or Queue) but it also includes
 * a Theil-Sen Quadratic Regressor to determine the coefficients of this dataseries.
 *
 * At creation its maximum length is set. After the buffer is filled, the oldest will be pushed
 * out of the buffer automatically.
 *
 * A key constraint is to prevent heavy calculations at the end of a stroke (due to large
 * array based curve fitting), which might be performed on a Pi zero or Zero 2W
 *
 * In order to prevent unneccessary calculations, this implementation uses lazy evaluation,
 * so it will calculate the B, C and goodnessOfFit only when needed, as many uses only
 * (first) need the first and second direvative.
 *
 * The Theil-Senn implementation uses concepts that are described here:
 * https://stats.stackexchange.com/questions/317777/theil-sen-estimator-for-polynomial,
 *
 * The determination of the coefficients is based on the Lagrange interpolation, which is descirbed here:
 * https://www.quora.com/How-do-I-find-a-quadratic-equation-from-points/answer/Robert-Paxson,
 * https://www.physicsforums.com/threads/quadratic-equation-from-3-points.404174/
 */

import { createSeries } from './Series.js'
import { createTSLinearSeries } from './TSLinearSeries.js'
import { createLabelledBinarySearchTree } from './BinarySearchTree.js'

import loglevel from 'loglevel'
const log = loglevel.getLogger('RowingEngine')

/**
 * @param {integer} maxSeriesLength - the maximum length of the quadratic series, 0 for unlimited
 */
export function createTSQuadraticSeries (maxSeriesLength = 0) {
  const X = createSeries(maxSeriesLength)
  const Y = createSeries(maxSeriesLength)
  const weight = createSeries(maxSeriesLength)
  const WY = createSeries(maxSeriesLength)
  const A = createLabelledBinarySearchTree()
  const linearResidu = createTSLinearSeries(maxSeriesLength)
  let _A = 0
  let _B = 0
  let _C = 0
  let _sst = 0
  let _goodnessOfFit = 0

  /**
   * @param {float} x - the x value of the datapoint
   * @param {float} y - the y value of the datapoint
   * @param {float} w - the weight of the datapoint (defaults to 1)
   * Invariant: BinrySearchTree A contains all calculated a's (as in the general formula y = a * x^2 + b * x + c),
   * where the a's are labeled in the BinarySearchTree with their Xi when they BEGIN in the point (Xi, Yi)
   */
  /* eslint-disable max-statements -- A lot of variables have to be set */
  function push (x, y, w = 1) {
    if (x === undefined || isNaN(x) || y === undefined || isNaN(y)) { return }

    if (maxSeriesLength > 0 && X.length() >= maxSeriesLength) {
      // The maximum of the array has been reached, so when pushing the new datapoint (x,y), the array will get shifted,
      // thus we have to remove all the A's that start with the old position X0 BEFORE this value gets thrown away
      A.remove(X.get(0))
    }

    X.push(x)
    Y.push(y)
    weight.push(w)
    WY.push(w * y)
    _A = 0
    _B = 0
    _C = 0
    _sst = 0
    _goodnessOfFit = 0

    if (X.length() >= 3) {
      // There are now at least three datapoints in the X and Y arrays, so let's calculate the A portion belonging for the new datapoint via Quadratic Theil-Sen regression
      let i = 0
      let j = 0

      // First we calculate the A for the formula
      let combinedweight = 0
      let coeffA = 1
      while (i < X.length() - 2) {
        j = i + 1
        while (j < X.length() - 1) {
          combinedweight = weight.get(i) * weight.get(j) * w
          coeffA = calculateA(i, j, X.length() - 1)
          A.push(X.get(i), coeffA, combinedweight)
          j++
        }
        i++
      }
      _A = A.weightedMedian()

      // We invalidate the linearResidu, B, C, and goodnessOfFit, as this will trigger a recalculate when they are needed
      linearResidu.reset()
      _B = null
      _C = null
      _sst = null
      _goodnessOfFit = null
    }
  }
  /* eslint-enable max-statements */

  /**
   * @param {integer} position - the position in the flank of the requested value (default = 0)
   * @returns {float} the firdt derivative of the quadratic function y = a x^2 + b x + c
   */
  function firstDerivativeAtPosition (position = 0) {
    if (X.length() >= 3 && position < X.length()) {
      calculateB()
      return ((_A * 2 * X.get(position)) + _B)
    } else {
      return 0
    }
  }

  /**
   * @param {integer} position - the position in the flank of the requested value (default = 0)
   * @returns {float} the second derivative of the quadratic function y = a x^2 + b x + c
   */
  function secondDerivativeAtPosition (position = 0) {
    if (X.length() >= 3 && position < X.length()) {
      return (_A * 2)
    } else {
      return 0
    }
  }

  /**
   * @param {float} x - the x value of the requested value
   * @returns {float} the slope of the linear function
   */
  function slope (x) {
    if (X.length() >= 3) {
      calculateB()
      return ((_A * 2 * x) + _B)
    } else {
      return 0
    }
  }

  /**
   * @returns {float} the (quadratic) coefficient a of the quadratic function y = a x^2 + b x + c
   */
  function coefficientA () {
    return _A
  }

  /**
   * @returns {float} the (linear) coefficient b of the quadratic function y = a x^2 + b x + c
   */
  function coefficientB () {
    calculateB()
    return _B
  }

  /**
   * @returns {float} the (intercept) coefficient c of the quadratic function y = a x^2 + b x + c
   */
  function coefficientC () {
    calculateB()
    calculateC()
    return _C
  }

  /**
   * @returns {float} the intercept of the quadratic function
   */
  function intercept () {
    calculateB()
    calculateC()
    return _C
  }

  /**
   * @returns {integer} the lenght of the stored series
   */
  function length () {
    return X.length()
  }

  /**
   * @returns {float} the R^2 as a global goodness of fit indicator
   */
  function goodnessOfFit () {
    let i = 0
    let sse = 0
    if (_goodnessOfFit === null) {
      calculateB()
      calculateC()
      if (X.length() >= 3) {
        _sst = 0
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
            // When _SST = 0, R2 isn't defined
            _goodnessOfFit = 0.01
        }
      } else {
        _goodnessOfFit = 0
      }
    }
    return _goodnessOfFit
  }

  /**
   * @returns {float} the local R^2 as a local goodness of fit indicator
   */
  function localGoodnessOfFit (position) {
    if (_sst === null) {
      // Force the recalculation of the _sst
      goodnessOfFit()
    }
    if (X.length() >= 3 && position < X.length()) {
      const squaredError = Math.pow((Y.get(position) - projectX(X.get(position))), 2)
      /* eslint-disable no-unreachable -- rather be systematic and add a break in all case statements */
      switch (true) {
        case (squaredError === 0):
          return 1
          break
        case (squaredError > _sst):
          // This is a pretty bad fit as the error is bigger than just using the line for the average y as intercept
          return 0.01
          break
        case (_sst !== 0):
          return Math.min(Math.max(1 - ((squaredError * X.length()) / _sst), 0), 1)
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
    if (X.length() >= 3) {
      calculateB()
      calculateC()
      return ((_A * x * x) + (_B * x) + _C)
    } else {
      return 0
    }
  }

  /**
   * @param {integer} pointOne - The position in the series of the first datapoint used for the quadratic coefficient calculation
   * @param {integer} pointTwo - The position in the series of the second datapoint used for the quadratic coefficient calculation
   * @param {integer} pointThree - The position in the series of the third datapoint used for the quadratic coefficient calculation
   * @returns {float} the coefficient A of the linear function
   */
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

  /**
   * @description This helper function calculates the slope of the linear residu and stores it in _B
   */
  function calculateB () {
    // Calculate all the linear slope for the newly added point and the newly calculated A
    // This function is only called when a linear slope is really needed, as this saves a lot of CPU cycles when only a slope suffices
    if (_B === null) {
      if (X.length() >= 3) {
        fillLinearResidu()
        _B = linearResidu.slope()
      } else {
        _B = 0
      }
    }
  }

  /**
   * @description This helper function calculates the intercept of the linear residu and stores it in _C
   */
  function calculateC () {
    // Calculate all the intercept for the newly added point and the newly calculated A
    // This function is only called when a linear intercept is really needed, as this saves a lot of CPU cycles when only a slope suffices
    if (_C === null) {
      if (X.length() >= 3) {
        fillLinearResidu()
        _C = linearResidu.intercept()
      } else {
        _C = 0
      }
    }
  }

  /**
   * @description This helper function fills the linear residu
   */
  function fillLinearResidu () {
    // To calculate the B and C via Linear regression over the residu, we need to fill it if empty
    if (linearResidu.length() === 0) {
      let i = 0
      while (i < X.length()) {
        linearResidu.push(X.get(i), Y.get(i) - (_A * Math.pow(X.get(i), 2)), weight.get(i))
        i++
      }
    }
  }

  /**
   * @returns {boolean} whether the quadratic regression should be considered reliable to produce results
   */
  function reliable () {
    return (X.length() >= 3)
  }

  /**
   * @description This function is used for clearing data and state
   */
  function reset () {
    if (X.length() > 0) {
      // There is something to reset
      X.reset()
      Y.reset()
      weight.reset()
      WY.reset()
      A.reset()
      linearResidu.reset()
      _A = 0
      _B = 0
      _C = 0
      _goodnessOfFit = 0
    }
  }

  return {
    push,
    X,
    Y,
    firstDerivativeAtPosition,
    secondDerivativeAtPosition,
    slope,
    coefficientA,
    coefficientB,
    coefficientC,
    intercept,
    length,
    goodnessOfFit,
    localGoodnessOfFit,
    projectX,
    reliable,
    reset
  }
}
