'use strict'
/*
  Open Rowing Monitor, https://github.com/jaapvanekris/openrowingmonitor
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { createOLSLinearSeries } from './OLSLinearSeries.js'

test('Length should be 0 on empty dataset', () => {
  const dataSeries = createOLSLinearSeries(3)
  assert.is(dataSeries.length(), 0)
})

test('xAtSeriesBegin should be 0 on empty dataset', () => {
  const dataSeries = createOLSLinearSeries(3)
  assert.is(dataSeries.xAtSeriesBegin(), 0)
})

test('yAtSeriesBegin should be 0 on empty dataset', () => {
  const dataSeries = createOLSLinearSeries(3)
  assert.is(dataSeries.yAtSeriesBegin(), 0)
})

test('xAtSeriesEnd should be 0 on empty dataset', () => {
  const dataSeries = createOLSLinearSeries(3)
  assert.is(dataSeries.xAtSeriesEnd(), 0)
})

test('yAtSeriesEnd should be 0 on empty dataset', () => {
  const dataSeries = createOLSLinearSeries(3)
  assert.is(dataSeries.yAtSeriesEnd(), 0)
})

test('numberOfXValuesAbove(0) should be 0 on empty dataset', () => {
  const dataSeries = createOLSLinearSeries(3)
  assert.is(dataSeries.numberOfXValuesAbove(0), 0)
})

test('numberOfYValuesAbove(0) should be 0 on empty dataset', () => {
  const dataSeries = createOLSLinearSeries(3)
  assert.is(dataSeries.numberOfYValuesAbove(0), 0)
})

test('numberOfXValuesEqualOrBelow(0) should be 0 on empty dataset', () => {
  const dataSeries = createOLSLinearSeries(3)
  assert.is(dataSeries.numberOfXValuesEqualOrBelow(0), 0)
})

test('numberOfYValuesEqualOrBelow(0) should be 0 on empty dataset', () => {
  const dataSeries = createOLSLinearSeries(3)
  assert.is(dataSeries.numberOfYValuesEqualOrBelow(0), 0)
})

test('xSum should be 0 on empty dataset', () => {
  const dataSeries = createOLSLinearSeries(3)
  assert.is(dataSeries.xSum(), 0)
})

test('ySum should be 0 on empty dataset', () => {
  const dataSeries = createOLSLinearSeries(3)
  assert.is(dataSeries.ySum(), 0)
})

test('slope should be 0 on empty dataset', () => {
  const dataSeries = createOLSLinearSeries(3)
  assert.is(dataSeries.slope(), 0)
})

test('intercept should be 0 on empty dataset', () => {
  const dataSeries = createOLSLinearSeries(3)
  assert.is(dataSeries.intercept(), 0)
})

test('Length should be 1 after single push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  assert.is(dataSeries.length(), 1)
})

test('xAtSeriesBegin should be 5 after single push(5, 9)', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  assert.is(dataSeries.xAtSeriesBegin(), 5)
})

test('yAtSeriesBegin should be 9 after single push(5, 9)', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  assert.is(dataSeries.yAtSeriesBegin(), 9)
})

test('xAtSeriesEnd should be 5 after single push(5, 9)', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  assert.is(dataSeries.xAtSeriesEnd(), 5)
})

test('yAtSeriesEnd should be 9 after single push(5, 9)', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  assert.is(dataSeries.yAtSeriesEnd(), 9)
})

test('numberOfXValuesAbove(0) should be 1 after single push(5, 9)', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  assert.is(dataSeries.numberOfXValuesAbove(0), 1)
})

test('numberOfYValuesAbove(0) should be 1 after single push(5, 9)', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  assert.is(dataSeries.numberOfYValuesAbove(0), 1)
})

test('numberOfXValuesEqualOrBelow(0) should remain 0 after single push(5, 9)', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  assert.is(dataSeries.numberOfXValuesEqualOrBelow(0), 0)
})

test('numberOfYValuesEqualOrBelow(0) should remain 0 after single push(5, 9)', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  assert.is(dataSeries.numberOfYValuesEqualOrBelow(0), 0)
})

test('numberOfXValuesEqualOrBelow(10) should be 1 after single push(5, 9)', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  assert.is(dataSeries.numberOfXValuesEqualOrBelow(10), 1)
})

test('numberOfYValuesEqualOrBelow(10) should be 1 after single push(5, 9)', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  assert.is(dataSeries.numberOfYValuesEqualOrBelow(10), 1)
})

test('xSum should be 5 after single push(5, 9)', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  assert.is(dataSeries.xSum(), 5)
})

test('ySum should be 9 after single push(5, 9)', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  assert.is(dataSeries.ySum(), 9)
})

test('slope should be 0 after single push(5, 9)', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  assert.is(dataSeries.slope(), 0)
})

test('intercept should be 0 after single push(5, 9)', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  assert.is(dataSeries.intercept(), 0)
})

test('Length should be 2 after second push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  assert.is(dataSeries.length(), 2)
})

test('xAtSeriesBegin should remain 5 after second push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  assert.is(dataSeries.xAtSeriesBegin(), 5)
})

test('yAtSeriesBegin should remain 9 after second push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  assert.is(dataSeries.yAtSeriesBegin(), 9)
})

test('xAtSeriesEnd should be 3 after second push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  assert.is(dataSeries.xAtSeriesEnd(), 3)
})

test('yAtSeriesEnd should be 3 after second push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  assert.is(dataSeries.yAtSeriesEnd(), 3)
})

test('numberOfXValuesAbove(0) should be 2 after second push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  assert.is(dataSeries.numberOfXValuesAbove(0), 2)
})

test('numberOfYValuesAbove(0) should be 2 after second push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  assert.is(dataSeries.numberOfYValuesAbove(0), 2)
})

test('numberOfXValuesEqualOrBelow(0) should remain 0 after second push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  assert.is(dataSeries.numberOfXValuesEqualOrBelow(0), 0)
})

test('numberOfYValuesEqualOrBelow(0) should remain 0 after second push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  assert.is(dataSeries.numberOfYValuesEqualOrBelow(0), 0)
})

test('numberOfXValuesEqualOrBelow(10) should be 2 after second push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  assert.is(dataSeries.numberOfXValuesEqualOrBelow(10), 2)
})

test('numberOfYValuesEqualOrBelow(10) should be 2 after second push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  assert.is(dataSeries.numberOfYValuesEqualOrBelow(10), 2)
})

test('xSum should be 8 after second push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  assert.is(dataSeries.xSum(), 8)
})

test('ySum should be 12 after second push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  assert.is(dataSeries.ySum(), 12)
})

test('slope should be 3 after second push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  assert.is(dataSeries.slope(), 3)
})

test('intercept should be -6 after second push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  assert.is(dataSeries.intercept(), -6)
})

test('goodnessOfFit should be 1 after second push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  assert.is(dataSeries.goodnessOfFit(), 1)
})

test('Length should be 3 after third push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  assert.is(dataSeries.length(), 3)
})

test('xAtSeriesBegin should remain 5 after third push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  assert.is(dataSeries.xAtSeriesBegin(), 5)
})

test('yAtSeriesBegin should remain 9 after third push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  assert.is(dataSeries.yAtSeriesBegin(), 9)
})

test('xAtSeriesEnd should be 4 after third push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  assert.is(dataSeries.xAtSeriesEnd(), 4)
})

test('yAtSeriesEnd should be 6 after third push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  assert.is(dataSeries.yAtSeriesEnd(), 6)
})

test('numberOfXValuesAbove(0) should be 3 after third push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  assert.is(dataSeries.numberOfXValuesAbove(0), 3)
})

test('numberOfYValuesAbove(0) should be 3 after third push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  assert.is(dataSeries.numberOfYValuesAbove(0), 3)
})

test('numberOfXValuesEqualOrBelow(0) should remain 0 after third push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  assert.is(dataSeries.numberOfXValuesEqualOrBelow(0), 0)
})

test('numberOfYValuesEqualOrBelow(0) should remain 0 after third push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  assert.is(dataSeries.numberOfYValuesEqualOrBelow(0), 0)
})

test('numberOfXValuesEqualOrBelow(10) should be 3 after third push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  assert.is(dataSeries.numberOfXValuesEqualOrBelow(10), 3)
})

test('numberOfYValuesEqualOrBelow(10) should be 3 after third push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  assert.is(dataSeries.numberOfYValuesEqualOrBelow(10), 3)
})

test('xSum should be 12 after third push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  assert.is(dataSeries.xSum(), 12)
})

test('ySum should be 18 after third push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  assert.is(dataSeries.ySum(), 18)
})

test('slope should be 3 after third push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  assert.is(dataSeries.slope(), 3)
})

test('intercept should be -6 after third push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  assert.is(dataSeries.intercept(), -6)
})

test('goodnessOfFit should be 1 after third push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  assert.is(dataSeries.goodnessOfFit(), 1)
})

test('Length should remain 3 after fourth push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  assert.is(dataSeries.length(), 3)
})

test('xAtSeriesBegin should turn to 3 after fourth push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  assert.is(dataSeries.xAtSeriesBegin(), 3)
})

test('yAtSeriesBegin should turn to 3 after fourth push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  assert.is(dataSeries.yAtSeriesBegin(), 3)
})

test('xAtSeriesEnd should be 6 after fourth push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  assert.is(dataSeries.xAtSeriesEnd(), 6)
})

test('yAtSeriesEnd should be 12 after fourth push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  assert.is(dataSeries.yAtSeriesEnd(), 12)
})

test('numberOfYValuesAbove(0) should be 3 after fourth push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  assert.is(dataSeries.numberOfYValuesAbove(0), 3)
})

test('numberOfXValuesAbove(0) should be 3 after fourth push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  assert.is(dataSeries.numberOfXValuesAbove(0), 3)
})

test('numberOfXValuesEqualOrBelow(0) should remain 0 after fourth push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  dataSeries.push(12)
  assert.is(dataSeries.numberOfXValuesEqualOrBelow(0), 0)
})

test('numberOfYValuesEqualOrBelow(0) should remain 0 after fourth push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  dataSeries.push(12)
  assert.is(dataSeries.numberOfYValuesEqualOrBelow(0), 0)
})

test('numberOfXValuesEqualOrBelow(10) should be 3 after fourth push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  assert.is(dataSeries.numberOfXValuesEqualOrBelow(10), 3)
})

test('numberOfYValuesEqualOrBelow(10) should be 2 after fourth push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  assert.is(dataSeries.numberOfYValuesEqualOrBelow(10), 2)
})

test('xSum should be 13 after fourth push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  assert.is(dataSeries.xSum(), 13)
})

test('ySum should be 21 after fourth push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  assert.is(dataSeries.ySum(), 21)
})

test('slope should be 3 after fourth push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  assert.is(dataSeries.slope(), 3)
})

test('intercept should be -6 after fourth push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  assert.is(dataSeries.intercept(), -6)
})

test('goodnessOfFit should be 1 after fourth push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  assert.is(dataSeries.goodnessOfFit(), 1)
})

test('Length should remain 3 after fifth push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  assert.is(dataSeries.length(), 3)
})

test('xAtSeriesBegin should turn to 6 after fifth push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  assert.is(dataSeries.xAtSeriesBegin(), 4)
})

test('yAtSeriesBegin should turn to 6 after fifth push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  assert.is(dataSeries.yAtSeriesBegin(), 6)
})

test('xAtSeriesEnd should be -3 after fifth push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  assert.is(dataSeries.xAtSeriesEnd(), 1)
})

test('yAtSeriesEnd should be -3 after fifth push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  assert.is(dataSeries.yAtSeriesEnd(), -3)
})

test('numberOfXValuesAbove(0) should be 2 after fifth push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  assert.is(dataSeries.numberOfXValuesAbove(0), 3)
})

test('numberOfYValuesAbove(0) should be 2 after fifth push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  assert.is(dataSeries.numberOfYValuesAbove(0), 2)
})

test('numberOfXValuesEqualOrBelow(0) should be 1 after fifth push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  assert.is(dataSeries.numberOfXValuesEqualOrBelow(0), 0)
})

test('numberOfYValuesEqualOrBelow(0) should be 1 after fifth push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  assert.is(dataSeries.numberOfYValuesEqualOrBelow(0), 1)
})

test('numberOfYValuesAbove(10) should be 1 after fifth push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  assert.is(dataSeries.numberOfYValuesAbove(10), 1)
})

test('numberOfYValuesEqualOrBelow(10) should remain 2 after fifth push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  assert.is(dataSeries.numberOfYValuesEqualOrBelow(10), 2)
})

test('xSum should be 11 after fifth push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  assert.is(dataSeries.xSum(), 11)
})

test('ySum should be 15 after fifth push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  assert.is(dataSeries.ySum(), 15)
})

test('slope should be 3 after fifth push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  assert.is(dataSeries.slope(), 3)
})

test('intercept should be -6 after fifth push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  assert.is(dataSeries.intercept(), -6)
})

test('goodnessOfFit should be 1 after fifth push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  assert.is(dataSeries.goodnessOfFit(), 1)
})

test('Length should be 0 after reset', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  dataSeries.reset()
  assert.is(dataSeries.length(), 0)
})

test('xAtSeriesBegin should be 0 after reset', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  dataSeries.reset()
  assert.is(dataSeries.xAtSeriesBegin(), 0)
})

test('yAtSeriesBegin should be 0 after reset', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  dataSeries.reset()
  assert.is(dataSeries.yAtSeriesBegin(), 0)
})

test('xAtSeriesEnd should be 0 after reset', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  dataSeries.reset()
  assert.is(dataSeries.xAtSeriesEnd(), 0)
})

test('yAtSeriesEnd should be 0 after reset', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  dataSeries.reset()
  assert.is(dataSeries.yAtSeriesEnd(), 0)
})

test('numberOfXValuesAbove(0) should be 0 after reset', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  dataSeries.reset()
  assert.is(dataSeries.numberOfXValuesAbove(0), 0)
})

test('numberOfYValuesAbove(0) should be 0 after reset', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  dataSeries.reset()
  assert.is(dataSeries.numberOfYValuesAbove(0), 0)
})

test('numberOfXValuesEqualOrBelow(0) should be 0 after reset', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  dataSeries.reset()
  assert.is(dataSeries.numberOfXValuesEqualOrBelow(0), 0)
})

test('numberOfYValuesEqualOrBelow(0) should be 0 after reset', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  dataSeries.reset()
  assert.is(dataSeries.numberOfYValuesEqualOrBelow(0), 0)
})

test('numberOfYValuesAbove(10) should be 0 after reset', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  dataSeries.reset()
  assert.is(dataSeries.numberOfYValuesAbove(10), 0)
})

test('numberOfYValuesEqualOrBelow(10) should be 0 after reset', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  dataSeries.reset()
  assert.is(dataSeries.numberOfYValuesEqualOrBelow(10), 0)
})

test('xSum should be 0 after reset', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  dataSeries.reset()
  assert.is(dataSeries.xSum(), 0)
})

test('ySum should be 0 after reset', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  dataSeries.reset()
  assert.is(dataSeries.ySum(), 0)
})

test('slope should be 0 after reset', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  dataSeries.reset()
  assert.is(dataSeries.slope(), 0)
})

test('intercept should be 0 after reset', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  dataSeries.reset()
  assert.is(dataSeries.intercept(), 0)
})

test('goodnessOfFit should be 0 after reset', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  dataSeries.reset()
  assert.is(dataSeries.goodnessOfFit(), 0)
})

test('slope should be 3 after fifth push with noise', () => {
  const dataSeries = createOLSLinearSeries(5)
  dataSeries.push(5, 9)
  dataSeries.push(3, 2)
  dataSeries.push(4, 7)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  assert.is(dataSeries.slope(), 3)
})

test('intercept should be -6 after fifth push with noise', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 2)
  dataSeries.push(4, 7)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  assert.is(dataSeries.intercept(), -6)
})

test('goodnessOfFit should be 1 after fifth push with noise', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 2)
  dataSeries.push(4, 7)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  assert.is(dataSeries.goodnessOfFit(), 1)
})

test.run()
