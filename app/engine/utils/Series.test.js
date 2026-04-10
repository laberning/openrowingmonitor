'use strict'
/**
 * @copyright [OpenRowingMonitor]{@link https://github.com/JaapvanEkris/openrowingmonitor}
 *
 * @file Tests of the Series object. As this object is fundamental for most other utility objects, we must test its behaviour quite thoroughly
 * Please note: this file contains commented out stress tests of the length(), sum(), average() functions, to detect any issues with numerical stability
 * As these tests tend to run in the dozens of minutes, we do not run them systematically, but they should be run when the series object is changed.
 */
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { createSeries } from './Series.js'

/**
 * @description Test behaviour for no datapoints
 */
test('Series behaviour with an empty series', () => {
  const dataSeries = createSeries(3)
  testLength(dataSeries, 0)
  testatSeriesBegin(dataSeries, 0)
  testAtSeriesEnd(dataSeries, 0)
  testNumberOfValuesAbove(dataSeries, 0, 0)
  testNumberOfValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfValuesAbove(dataSeries, 10, 0)
  testNumberOfValuesEqualOrBelow(dataSeries, 10, 0)
  testSum(dataSeries, 0)
  testAverage(dataSeries, 0)
  testMedian(dataSeries, 0)
  testMinimum(dataSeries, 0)
  testMaximum(dataSeries, 0)
})

/**
 * @description Test behaviour for a single datapoint
 */
test('Series behaviour with a single pushed value. Series = [9]', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  testLength(dataSeries, 1)
  testatSeriesBegin(dataSeries, 9)
  testAtSeriesEnd(dataSeries, 9)
  testNumberOfValuesAbove(dataSeries, 0, 1)
  testNumberOfValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfValuesAbove(dataSeries, 10, 0)
  testNumberOfValuesEqualOrBelow(dataSeries, 10, 1)
  testSum(dataSeries, 9)
  testAverage(dataSeries, 9)
  testMedian(dataSeries, 9)
  testMinimum(dataSeries, 9)
  testMaximum(dataSeries, 9)
})

/**
 * @description Test behaviour for two datapoints
 */
test('Series behaviour with a second pushed value. Series = [9, 3]', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  testLength(dataSeries, 2)
  testatSeriesBegin(dataSeries, 9)
  testAtSeriesEnd(dataSeries, 3)
  testNumberOfValuesAbove(dataSeries, 0, 2)
  testNumberOfValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfValuesAbove(dataSeries, 10, 0)
  testNumberOfValuesEqualOrBelow(dataSeries, 10, 2)
  testSum(dataSeries, 12)
  testAverage(dataSeries, 6)
  testMedian(dataSeries, 6)
  testMinimum(dataSeries, 3)
  testMaximum(dataSeries, 9)
})

/**
 * @description Test behaviour for three datapoints
 */
test('Series behaviour with a third pushed value. Series = [9, 3, 6]', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  testLength(dataSeries, 3)
  testatSeriesBegin(dataSeries, 9)
  testAtSeriesEnd(dataSeries, 6)
  testNumberOfValuesAbove(dataSeries, 0, 3)
  testNumberOfValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfValuesAbove(dataSeries, 10, 0)
  testNumberOfValuesEqualOrBelow(dataSeries, 10, 3)
  testSum(dataSeries, 18)
  testAverage(dataSeries, 6)
  testMedian(dataSeries, 6)
  testMinimum(dataSeries, 3)
  testMaximum(dataSeries, 9)
})

/**
 * @description Test behaviour for four datapoints
 */
test('Series behaviour with a fourth pushed value. Series = [3, 6, 12]', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  dataSeries.push(12)
  testLength(dataSeries, 3)
  testatSeriesBegin(dataSeries, 3)
  testAtSeriesEnd(dataSeries, 12)
  testNumberOfValuesAbove(dataSeries, 0, 3)
  testNumberOfValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfValuesAbove(dataSeries, 10, 1)
  testNumberOfValuesEqualOrBelow(dataSeries, 10, 2)
  testSum(dataSeries, 21)
  testAverage(dataSeries, 7)
  testMedian(dataSeries, 6)
  testMinimum(dataSeries, 3)
  testMaximum(dataSeries, 12)
})

/**
 * @description Test behaviour for five datapoints
 */
test('Series behaviour with a fifth pushed value. Series = [6, 12, -3]', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  dataSeries.push(12)
  dataSeries.push(-3)
  testLength(dataSeries, 3)
  testatSeriesBegin(dataSeries, 6)
  testAtSeriesEnd(dataSeries, -3)
  testNumberOfValuesAbove(dataSeries, 0, 2)
  testNumberOfValuesEqualOrBelow(dataSeries, 0, 1)
  testNumberOfValuesAbove(dataSeries, 10, 1)
  testNumberOfValuesEqualOrBelow(dataSeries, 10, 2)
  testSum(dataSeries, 15)
  testAverage(dataSeries, 5)
  testMedian(dataSeries, 6)
  testMinimum(dataSeries, -3)
  testMaximum(dataSeries, 12)
})

/**
 * @description Test behaviour for recalculations of the min/max values
 */
test('Series behaviour pushing out the min and max value and forcing a recalculate of min/max via the array.', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  testMinimum(dataSeries, 3)
  testMaximum(dataSeries, 9)
  dataSeries.push(6)
  testMinimum(dataSeries, 3)
  testMaximum(dataSeries, 6)
  dataSeries.push(6)
  testMinimum(dataSeries, 6)
  testMaximum(dataSeries, 6)
})

/**
 * @description Test behaviour for recalculations of the min/max values
 */
test('Series behaviour pushing out the min and max value, replacing them just in time.', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  testMinimum(dataSeries, 3)
  testMaximum(dataSeries, 9)
  dataSeries.push(12)
  testMinimum(dataSeries, 3)
  testMaximum(dataSeries, 12)
  dataSeries.push(1)
  testMinimum(dataSeries, 1)
  testMaximum(dataSeries, 12)
})

/**
 * @description Test behaviour after a reset()
 */
test('Series behaviour with a five pushed values followed by a reset, Series = []', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  dataSeries.push(12)
  dataSeries.push(-3)
  dataSeries.reset()
  testLength(dataSeries, 0)
  testatSeriesBegin(dataSeries, 0)
  testAtSeriesEnd(dataSeries, 0)
  testNumberOfValuesAbove(dataSeries, 0, 0)
  testNumberOfValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfValuesAbove(dataSeries, 10, 0)
  testNumberOfValuesEqualOrBelow(dataSeries, 10, 0)
  testSum(dataSeries, 0)
  testAverage(dataSeries, 0)
  testMedian(dataSeries, 0)
})

/* These stress tests test the reliability of the sum(), average() and length() function after a huge number of updates
// This specific test takes a long time (over 10 minutes), so only run them manually when changing the series module
// Javascript maximum array length is 4294967295, as heap memory is limited, we stay with 2^25 datapoints
test('Stress test of the series object, 33.554.432 (2^25) datapoints', () => {
  const dataSeries = createSeries()
  let j = 0
  let randomvalue
  while (j < 16777216) {
    randomvalue = Math.random()
    dataSeries.push(randomvalue)
    dataSeries.push(1 - randomvalue)
    j++
  }
  testLength(dataSeries, 33554432)
  testSum(dataSeries, 16777216)
  testAverage(dataSeries, 0.5)
  testMedian(dataSeries, 0.5)
})

// Javascript maximum array length is 4294967295, as heap memory is limited, we stay with 2^25 datapoints
// This test takes several hours (!) due to the many large array shifts, so only run them manually when changing the series module
test('Stress test of the series object, 67.108.864 datapoints, with a maxLength of 33.554.432 (2^25)', () => {
  const dataSeries = createSeries(33554432)
  let j = 0
  let randomvalue
  while (j < 33554432) {
    randomvalue = Math.random()
    dataSeries.push(randomvalue)
    dataSeries.push(1 - randomvalue)
    j++
  }
  testLength(dataSeries, 33554432)
  testSum(dataSeries, 16777216)
  testAverage(dataSeries, 0.5)
  testMedian(dataSeries, 0.5)
}) */

function testLength (series, expectedValue) {
  assert.ok(series.length() === expectedValue, `Expected length should be ${expectedValue}, encountered ${series.length()}`)
}

function testatSeriesBegin (series, expectedValue) {
  assert.ok(series.atSeriesBegin() === expectedValue, `Expected atSeriesBegin to be ${expectedValue}, encountered ${series.atSeriesBegin()}`)
}

function testAtSeriesEnd (series, expectedValue) {
  assert.ok(series.atSeriesEnd() === expectedValue, `Expected atSeriesEnd to be ${expectedValue}, encountered ${series.atSeriesEnd()}`)
}

function testNumberOfValuesAbove (series, cutoff, expectedValue) {
  assert.ok(series.numberOfValuesAbove(cutoff) === expectedValue, `Expected numberOfValuesAbove(${cutoff}) to be ${expectedValue}, encountered ${series.numberOfValuesAbove(cutoff)}`)
}

function testNumberOfValuesEqualOrBelow (series, cutoff, expectedValue) {
  assert.ok(series.numberOfValuesEqualOrBelow(cutoff) === expectedValue, `Expected numberOfValuesEqualOrBelow(${cutoff}) to be ${expectedValue}, encountered ${series.numberOfValuesEqualOrBelow(cutoff)}`)
}

function testSum (series, expectedValue) {
  assert.ok(series.sum() === expectedValue, `Expected sum to be ${expectedValue}, encountered ${series.sum()}`)
}

function testAverage (series, expectedValue) {
  assert.ok(series.average() === expectedValue, `Expected average to be ${expectedValue}, encountered ${series.average()}`)
}

function testMedian (series, expectedValue) {
  assert.ok(series.median() === expectedValue, `Expected median to be ${expectedValue}, encountered ${series.median()}`)
}

function testMinimum (series, expectedValue) {
  assert.ok(series.minimum() === expectedValue, `Expected minimum to be ${expectedValue}, encountered ${series.minimum()}`)
}

function testMaximum (series, expectedValue) {
  assert.ok(series.maximum() === expectedValue, `Expected maximum to be ${expectedValue}, encountered ${series.maximum()}`)
}

test.run()
