'use strict'
/**
 * @copyright [OpenRowingMonitor]{@link https://github.com/JaapvanEkris/openrowingmonitor}
 *
 * @file Tests of the InfiniteSeriesMetrics object.
 * Please note: this file contains a stress tests of the length(), sum() and average() functions, to detect any issues with numerical stability due to accumulator behaviour
 */
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { createInfiniteSeriesMetrics } from './InfiniteSeriesMetrics.js'

/**
 * @description Test behaviour for no datapoints
 */
test('Series behaviour with an empty series', () => {
  const dataSeries = createInfiniteSeriesMetrics()
  testLength(dataSeries, 0)
  testSum(dataSeries, 0)
  testAverage(dataSeries, 0)
  testMinimum(dataSeries, 0)
  testMaximum(dataSeries, 0)
})

/**
 * @description Test behaviour for a single datapoint
 */
test('Series behaviour with a single pushed value. Series = [9]', () => {
  const dataSeries = createInfiniteSeriesMetrics()
  dataSeries.push(9)
  testLength(dataSeries, 1)
  testSum(dataSeries, 9)
  testAverage(dataSeries, 9)
  testMinimum(dataSeries, 9)
  testMaximum(dataSeries, 9)
})

/**
 * @description Test behaviour for two datapoints
 */
test('Series behaviour with a second pushed value. Series = [9, 3]', () => {
  const dataSeries = createInfiniteSeriesMetrics()
  dataSeries.push(9)
  dataSeries.push(3)
  testLength(dataSeries, 2)
  testSum(dataSeries, 12)
  testAverage(dataSeries, 6)
  testMinimum(dataSeries, 3)
  testMaximum(dataSeries, 9)
})

/**
 * @description Test behaviour for three datapoints
 */
test('Series behaviour with a third pushed value. Series = [9, 3, 6]', () => {
  const dataSeries = createInfiniteSeriesMetrics()
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  testLength(dataSeries, 3)
  testSum(dataSeries, 18)
  testAverage(dataSeries, 6)
  testMinimum(dataSeries, 3)
  testMaximum(dataSeries, 9)
})

/**
 * @description Test behaviour for four datapoints
 */
test('Series behaviour with a fourth pushed value. Series = [9, 3, 6, 12]', () => {
  const dataSeries = createInfiniteSeriesMetrics()
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  dataSeries.push(12)
  testLength(dataSeries, 4)
  testSum(dataSeries, 30)
  testAverage(dataSeries, 7.5)
  testMinimum(dataSeries, 3)
  testMaximum(dataSeries, 12)
})

/**
 * @description Test behaviour for five datapoints
 */
test('Series behaviour with a fifth pushed value. Series = [9, 3, 6, 12, -5]', () => {
  const dataSeries = createInfiniteSeriesMetrics()
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  dataSeries.push(12)
  dataSeries.push(-5)
  testSum(dataSeries, 25)
  testAverage(dataSeries, 5)
  testMinimum(dataSeries, -5)
  testMaximum(dataSeries, 12)
})

/**
 * @description Test behaviour after a reset()
 */
test('Series behaviour with a five pushed values followed by a reset, Series = []', () => {
  const dataSeries = createInfiniteSeriesMetrics()
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  dataSeries.push(12)
  dataSeries.push(-5)
  dataSeries.reset()
  testLength(dataSeries, 0)
  testSum(dataSeries, 0)
  testAverage(dataSeries, 0)
  testMinimum(dataSeries, 0)
  testMaximum(dataSeries, 0)
})

/**
 * These stress tests test the reliability of the sum(), average() and length() function after a huge number of updates/
 * Javascript maximum array length is 4294967295, as heap memory is limited, we stay with 2^25 datapoints
 * This test takes several seconds due to the many large array shifts, so only run them manually when changing the series module
 */
test('Stress test of the series object, 67.108.864 datapoints, with a maxLength of 33.554.432 (2^25)', () => {
  const dataSeries = createInfiniteSeriesMetrics()
  let j = 0
  let randomvalue
  while (j < 33554432) {
    randomvalue = Math.random()
    dataSeries.push(randomvalue)
    dataSeries.push(1 - randomvalue)
    j++
  }
  testLength(dataSeries, 67108864)
  testSum(dataSeries, 33554432)
  testAverage(dataSeries, 0.5)
})

function testLength (series, expectedValue) {
  assert.ok(series.length() === expectedValue, `Expected length should be ${expectedValue}, encountered ${series.length()}`)
}

function testSum (series, expectedValue) {
  assert.ok(series.sum() === expectedValue, `Expected sum to be ${expectedValue}, encountered ${series.sum()}`)
}

function testAverage (series, expectedValue) {
  assert.ok(series.average() === expectedValue, `Expected average to be ${expectedValue}, encountered ${series.average()}`)
}

function testMinimum (series, expectedValue) {
  assert.ok(series.minimum() === expectedValue, `Expected minimum to be ${expectedValue}, encountered ${series.minimum()}`)
}

function testMaximum (series, expectedValue) {
  assert.ok(series.maximum() === expectedValue, `Expected maximum to be ${expectedValue}, encountered ${series.maximum()}`)
}

test.run()
