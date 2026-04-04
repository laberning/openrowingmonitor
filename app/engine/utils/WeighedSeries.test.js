'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
/**
 * As this object is fundamental for most other utility objects, we must test its behaviour quite thoroughly
 */
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { createWeighedSeries } from './WeighedSeries.js'

test('Series behaviour with an empty series', () => {
  const dataSeries = createWeighedSeries(3, undefined)
  testLength(dataSeries, 0)
  testatSeriesBegin(dataSeries, 0)
  testAtSeriesEnd(dataSeries, 0)
  testNumberOfValuesAbove(dataSeries, 0, 0)
  testNumberOfValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfValuesAbove(dataSeries, 10, 0)
  testNumberOfValuesEqualOrBelow(dataSeries, 10, 0)
  testSum(dataSeries, 0)
  testAverage(dataSeries, undefined)
  testWeighedAverage(dataSeries, undefined)
  testMedian(dataSeries, 0)
  testMinimum(dataSeries, 0)
  testMaximum(dataSeries, 0)
})

test('Series behaviour with a single pushed value. Series = [9]', () => {
  const dataSeries = createWeighedSeries(3, undefined)
  dataSeries.push(9, 1)
  testLength(dataSeries, 1)
  testatSeriesBegin(dataSeries, 9)
  testAtSeriesEnd(dataSeries, 9)
  testNumberOfValuesAbove(dataSeries, 0, 1)
  testNumberOfValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfValuesAbove(dataSeries, 10, 0)
  testNumberOfValuesEqualOrBelow(dataSeries, 10, 1)
  testSum(dataSeries, 9)
  testAverage(dataSeries, 9)
  testWeighedAverage(dataSeries, 9)
  testMedian(dataSeries, 9)
  testMinimum(dataSeries, 9)
  testMaximum(dataSeries, 9)
})

test('Series behaviour with a second pushed value. Series = [9, 3]', () => {
  const dataSeries = createWeighedSeries(3, undefined)
  dataSeries.push(9, 1)
  dataSeries.push(3, 0)
  testLength(dataSeries, 2)
  testatSeriesBegin(dataSeries, 9)
  testAtSeriesEnd(dataSeries, 3)
  testNumberOfValuesAbove(dataSeries, 0, 2)
  testNumberOfValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfValuesAbove(dataSeries, 10, 0)
  testNumberOfValuesEqualOrBelow(dataSeries, 10, 2)
  testSum(dataSeries, 12)
  testAverage(dataSeries, 6)
  testWeighedAverage(dataSeries, 9)
  testMedian(dataSeries, 6)
  testMinimum(dataSeries, 3)
  testMaximum(dataSeries, 9)
})

test('Series behaviour with a third pushed value. Series = [9, 3, 6]', () => {
  const dataSeries = createWeighedSeries(3, undefined)
  dataSeries.push(9, 1)
  dataSeries.push(3, 0)
  dataSeries.push(6, 1)
  testLength(dataSeries, 3)
  testatSeriesBegin(dataSeries, 9)
  testAtSeriesEnd(dataSeries, 6)
  testNumberOfValuesAbove(dataSeries, 0, 3)
  testNumberOfValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfValuesAbove(dataSeries, 10, 0)
  testNumberOfValuesEqualOrBelow(dataSeries, 10, 3)
  testSum(dataSeries, 18)
  testAverage(dataSeries, 6)
  testWeighedAverage(dataSeries, 7.5)
  testMedian(dataSeries, 6)
  testMinimum(dataSeries, 3)
  testMaximum(dataSeries, 9)
})

test('Series behaviour with a fourth pushed value. Series = [3, 6, 12]', () => {
  const dataSeries = createWeighedSeries(3, undefined)
  dataSeries.push(9, 0)
  dataSeries.push(3, 0)
  dataSeries.push(6, 1)
  dataSeries.push(12, 1)
  testLength(dataSeries, 3)
  testatSeriesBegin(dataSeries, 3)
  testAtSeriesEnd(dataSeries, 12)
  testNumberOfValuesAbove(dataSeries, 0, 3)
  testNumberOfValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfValuesAbove(dataSeries, 10, 1)
  testNumberOfValuesEqualOrBelow(dataSeries, 10, 2)
  testSum(dataSeries, 21)
  testAverage(dataSeries, 7)
  testWeighedAverage(dataSeries, 9)
  testMedian(dataSeries, 6)
  testMinimum(dataSeries, 3)
  testMaximum(dataSeries, 12)
})

test('Series behaviour with a fifth pushed value. Series = [6, 12, -3]', () => {
  const dataSeries = createWeighedSeries(3, undefined)
  dataSeries.push(9, 1)
  dataSeries.push(3, 1)
  dataSeries.push(6, 1)
  dataSeries.push(12, 1)
  dataSeries.push(-3, 0.5)
  testLength(dataSeries, 3)
  testatSeriesBegin(dataSeries, 6)
  testAtSeriesEnd(dataSeries, -3)
  testNumberOfValuesAbove(dataSeries, 0, 2)
  testNumberOfValuesEqualOrBelow(dataSeries, 0, 1)
  testNumberOfValuesAbove(dataSeries, 10, 1)
  testNumberOfValuesEqualOrBelow(dataSeries, 10, 2)
  testSum(dataSeries, 15)
  testAverage(dataSeries, 5)
  testWeighedAverage(dataSeries, 6.6)
  testMedian(dataSeries, 6)
  testMinimum(dataSeries, -3)
  testMaximum(dataSeries, 12)
})

test('Series behaviour pushing out the min and max value and forcing a recalculate of min/max via the array.', () => {
  const dataSeries = createWeighedSeries(3, undefined)
  dataSeries.push(9, 1)
  dataSeries.push(3, 1)
  dataSeries.push(6, 1)
  testLength(dataSeries, 3)
  testMinimum(dataSeries, 3)
  testMaximum(dataSeries, 9)
  dataSeries.push(6, 1)
  testLength(dataSeries, 3)
  testMinimum(dataSeries, 3)
  testMaximum(dataSeries, 6)
  dataSeries.push(6, 1)
  testLength(dataSeries, 3)
  testMinimum(dataSeries, 6)
  testMaximum(dataSeries, 6)
})

test('Series behaviour pushing out the min and max value, replacing them just in time.', () => {
  const dataSeries = createWeighedSeries(3, undefined)
  dataSeries.push(9, 1)
  dataSeries.push(3, 1)
  dataSeries.push(6, 1)
  testMinimum(dataSeries, 3)
  testMaximum(dataSeries, 9)
  dataSeries.push(12, 1)
  testMinimum(dataSeries, 3)
  testMaximum(dataSeries, 12)
  dataSeries.push(1, 1)
  testMinimum(dataSeries, 1)
  testMaximum(dataSeries, 12)
})

test('Series behaviour with a five pushed values followed by a reset, Series = []', () => {
  const dataSeries = createWeighedSeries(3, undefined)
  dataSeries.push(9, 1)
  dataSeries.push(3, 1)
  dataSeries.push(6, 1)
  dataSeries.push(12, 1)
  dataSeries.push(-3, 1)
  dataSeries.reset()
  testLength(dataSeries, 0)
  testatSeriesBegin(dataSeries, 0)
  testAtSeriesEnd(dataSeries, 0)
  testNumberOfValuesAbove(dataSeries, 0, 0)
  testNumberOfValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfValuesAbove(dataSeries, 10, 0)
  testNumberOfValuesEqualOrBelow(dataSeries, 10, 0)
  testSum(dataSeries, 0)
  testAverage(dataSeries, undefined)
  testWeighedAverage(dataSeries, undefined)
  testMedian(dataSeries, 0)
})

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

function testWeighedAverage (series, expectedValue) {
  assert.ok(series.weighedAverage() === expectedValue, `Expected weighedAverage to be ${expectedValue}, encountered ${series.weighedAverage()}`)
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
