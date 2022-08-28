'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  As this object is fundamental for most other utility objects, we must test its behaviour quite thoroughly
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { createSeries } from './Series.js'

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
})

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
})

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
})

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
})

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
})

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
})

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

test.run()
