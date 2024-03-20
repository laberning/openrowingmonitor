'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  The LinearSeries is a datatype that represents a Linear Series. It allows
  values to be retrieved (like a FiFo buffer, or Queue) but it also includes
  a Linear Regressor to determine the slope, intercept and R^2 of this timeseries
  of x any y coordinates through Simple Linear Regression.

  At creation it can be determined that the Time Series is limited (i.e. after it
  is filled, the oldest will be pushed out of the queue) or that the the time series
  is unlimited (will only expand). The latter is activated by calling the creation with
  an empty argument.

  please note that for unlimited series it is up to the calling function to handle resetting
  the Linear Series when needed through the reset() call.

  A key constraint is to prevent heavy calculations at the end (due to large
  array based curve fitting) as this function is also used to calculate
  drag at the end of the recovery phase, which might happen on a Pi zero

  This implementation uses concepts that are described here:
  https://www.colorado.edu/amath/sites/default/files/attached-files/ch12_0.pdf
*/

import { createSeries } from './Series.js'

import loglevel from 'loglevel'
const log = loglevel.getLogger('RowingEngine')

function createOLSLinearSeries (maxSeriesLength = 0) {
  const X = createSeries(maxSeriesLength)
  const XX = createSeries(maxSeriesLength)
  const Y = createSeries(maxSeriesLength)
  const YY = createSeries(maxSeriesLength)
  const XY = createSeries(maxSeriesLength)
  const trend = createSeries(maxSeriesLength)
  let _slope = 0
  let _intercept = 0
  let _goodnessOfFit = 0

  function push (x, y) {
    X.push(x)
    XX.push(x * x)
    Y.push(y)
    YY.push(y * y)
    XY.push(x * y)

    // Let's approximate the line through OLS
    if (X.length() >= 2 && X.sum() > 0) {
      _slope = (X.length() * XY.sum() - X.sum() * Y.sum()) / (X.length() * XX.sum() - X.sum() * X.sum())
      _intercept = (Y.sum() - (_slope * X.sum())) / X.length()
      const sse = YY.sum() - (_intercept * Y.sum()) - (_slope * XY.sum())
      const sst = YY.sum() - (Math.pow(Y.sum(), 2) / X.length())
      _goodnessOfFit = 1 - (sse / sst)
      trend.push(determineTrend(X.length() - 2, X.length() - 1))
    } else {
      _slope = 0
      _intercept = 0
      _goodnessOfFit = 0
    }
  }

  function slope () {
    return _slope
  }

  function intercept () {
    return _intercept
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
      return (_slope * x) + _intercept
    } else {
      return 0
    }
  }

  function projectY (y) {
    if (X.length() >= 2 && _slope !== 0) {
      return ((y - _intercept) / _slope)
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

  function numberOfUpwardTrend () {
    return trend.numberOfValuesAbove(0)
  }

  function numberOfFlatOrDownwardTrend () {
    return trend.numberOfValuesEqualOrBelow(0)
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

  function xSeries () {
    return X.series()
  }

  function ySeries () {
    return Y.series()
  }

  function determineTrend (pointOne, pointTwo) {
    if (pointOne !== pointTwo) {
      return (Y.get(pointTwo) - Y.get(pointOne))
    } else {
      log.error('OLS Linear Regressor, trend determination, trend can not be applied to one point!')
      return 0
    }
  }

  function reset () {
    X.reset()
    XX.reset()
    Y.reset()
    YY.reset()
    XY.reset()
    _slope = 0
    _intercept = 0
    _goodnessOfFit = 0
  }

  return {
    push,
    slope,
    intercept,
    length,
    goodnessOfFit,
    projectX,
    projectY,
    numberOfXValuesAbove,
    numberOfXValuesEqualOrBelow,
    numberOfYValuesAbove,
    numberOfYValuesEqualOrBelow,
    numberOfUpwardTrend,
    numberOfFlatOrDownwardTrend,
    xAtSeriesBegin,
    xAtSeriesEnd,
    yAtSeriesBegin,
    yAtSeriesEnd,
    xSum,
    ySum,
    minimumX,
    minimumY,
    maximumX,
    maximumY,
    xSeries,
    ySeries,
    reset
  }
}

export { createOLSLinearSeries }
