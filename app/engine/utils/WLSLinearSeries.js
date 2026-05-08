'use strict'
/**
 * @copyright [OpenRowingMonitor]{@link https://github.com/JaapvanEkris/openrowingmonitor}
 *
 * @file The WLSLinearSeries is a datatype that represents a Linear Series. It allows
 * values to be retrieved (like a FiFo buffer, or Queue) but it also includes
 * a Weighted Linear Regressor to determine the slope, intercept and R^2 of this series
 * of x and y coordinates through Weighted Least Squares Regression.
 *
 * At creation it can be determined that the Series is limited (i.e. after it
 * is filled, the oldest will be pushed out of the queue) or that the series
 * is unlimited (will only expand). The latter is activated by calling the creation with
 * an empty argument.
 *
 * please note that for unlimited series it is up to the calling function to handle resetting
 * the Linear Series when needed through the reset() call.
 *
 * This implementation uses concepts that are described here:
 * https://www.colorado.edu/amath/sites/default/files/attached-files/ch12_0.pdf
 *
 * For weighted least squares:
 * https://en.wikipedia.org/wiki/Weighted_least_squares
 */
import { createSeries } from './Series.js'

import loglevel from 'loglevel'
const log = loglevel.getLogger('RowingEngine')

/**
 * @param {integer} maxSeriesLength - the maximum length of the linear series, default = 0 for unlimited
 */
export function createWLSLinearSeries (maxSeriesLength = 0) {
  const X = createSeries(maxSeriesLength)
  const weight = createSeries(maxSeriesLength)
  const WX = createSeries(maxSeriesLength)
  const WY = createSeries(maxSeriesLength)
  const WXX = createSeries(maxSeriesLength)
  const WYY = createSeries(maxSeriesLength)
  const WXY = createSeries(maxSeriesLength)
  const Y = createSeries(maxSeriesLength)
  let _slope = 0
  let _intercept = 0
  let _goodnessOfFit = 0

  /**
   * @param {float} x - the x value of the datapoint
   * @param {float} y - the y value of the datapoint
   * @param {float} w - the weight of the datapoint, default = 1
   */
  function push (x, y, w = 1) {
    if (x === undefined || isNaN(x) || y === undefined || isNaN(y)) { return }

    // Ensure weight is valid and positive
    const _weight = (w === undefined || isNaN(w) || w <= 0) ? 1 : w

    X.push(x)
    Y.push(y)
    weight.push(_weight)
    WX.push(_weight * x)
    WY.push(_weight * y)
    WXX.push(_weight * x * x)
    WYY.push(_weight * y * y)
    WXY.push(_weight * x * y)

    // Calculate regression parameters using Weighted Least Squares
    const denominator = (weight.sum() * WXX.sum()) - (WX.sum() * WX.sum())
    if (X.length() >= 2 && denominator !== 0) {
      _slope = (weight.sum() * WXY.sum() - WX.sum() * WY.sum()) / denominator
      _intercept = (WY.sum() - _slope * WX.sum()) / weight.sum()

      // Calculate weighted R^2
      const weighedAverageY = WY.sum() / weight.sum()
      const sse = WYY.sum() - (2 * _intercept * WY.sum()) - (2 * _slope * WXY.sum()) +
        (_intercept * _intercept * weight.sum()) + (2 * _slope * _intercept * WX.sum()) +
        (_slope * _slope * WXX.sum())
      const sst = WYY.sum() - (weighedAverageY * weighedAverageY * weight.sum())

      _goodnessOfFit = (sst !== 0) ? 1 - (sse / sst) : 0
    } else {
      _slope = 0
      _intercept = 0
      _goodnessOfFit = 0
    }
  }

  /**
   * @returns {float} the slope of the linear function
   */
  function slope () {
    return _slope
  }

  /**
   * @returns {float} the intercept of the linear function
   */
  function intercept () {
    return _intercept
  }

  /**
   * @returns {integer} the lenght of the stored series
   */
  function length () {
    return X.length()
  }

  /**
   * @returns {float} the R^2 as a goodness of fit indicator
   */
  function goodnessOfFit () {
    if (X.length() >= 2) {
      return _goodnessOfFit
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
      return (_slope * x) + _intercept
    } else {
      return 0
    }
  }

  /**
   * @param {float} y - the y value to be solved
   * @returns {float} the resulting x value when solved via the linear function
   */
  function projectY (y) {
    if (X.length() >= 2 && _slope !== 0) {
      return ((y - _intercept) / _slope)
    } else {
      log.error('WLS Regressor, attempted a Y-projection while slope was zero!')
      return 0
    }
  }

  /**
   * @returns {boolean} whether the linear regression should be considered reliable to produce results
   */
  function reliable () {
    return (X.length() >= 2 && _slope !== 0)
  }

  /**
   * @description This function is used for clearing all data, typically when flywheel.js is completely reset
   */
  function reset () {
    X.reset()
    Y.reset()
    weight.reset()
    WX.reset()
    WY.reset()
    WXX.reset()
    WYY.reset()
    WXY.reset()
    _slope = 0
    _intercept = 0
    _goodnessOfFit = 0
  }

  return {
    push,
    X,
    Y,
    weight,
    slope,
    intercept,
    length,
    goodnessOfFit,
    projectX,
    projectY,
    reliable,
    reset
  }
}
