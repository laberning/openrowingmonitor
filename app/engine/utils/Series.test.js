'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { createSeries } from './Series.js'

test('Length should be 0 on empty dataset', () => {
  const dataSeries = createSeries(3)
  assert.is(dataSeries.length(), 0)
})

test('atSeriesBegin should be 0 on empty dataset', () => {
  const dataSeries = createSeries(3)
  assert.is(dataSeries.atSeriesBegin(), 0)
})

test('atSeriesEnd should be 0 on empty dataset', () => {
  const dataSeries = createSeries(3)
  assert.is(dataSeries.atSeriesEnd(), 0)
})

test('numberOfValuesAbove(0) should be 0 on empty dataset', () => {
  const dataSeries = createSeries(3)
  assert.is(dataSeries.numberOfValuesAbove(0), 0)
})

test('numberOfValuesEqualOrBelow(0) should be 0 on empty dataset', () => {
  const dataSeries = createSeries(3)
  assert.is(dataSeries.numberOfValuesEqualOrBelow(0), 0)
})

test('sum should be 0 on empty dataset', () => {
  const dataSeries = createSeries(3)
  assert.is(dataSeries.sum(), 0)
})

test('average should be 0 on empty dataset', () => {
  const dataSeries = createSeries(3)
  assert.is(dataSeries.average(), 0)
})

test('median should be 0 on empty dataset', () => {
  const dataSeries = createSeries(3)
  assert.is(dataSeries.median(), 0)
})

test('Length should be 1 after single push(9)', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  assert.is(dataSeries.length(), 1)
})

test('atSeriesBegin should be 9 after single push(9)', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  assert.is(dataSeries.atSeriesBegin(), 9)
})

test('atSeriesEnd should be 9 after single push(9)', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  assert.is(dataSeries.atSeriesEnd(), 0)
})

test('numberOfValuesAbove(0) should be 1 after single push(9)', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  assert.is(dataSeries.numberOfValuesAbove(0), 1)
})

test('numberOfValuesEqualOrBelow(0) should remain 0 after single push(9)', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  assert.is(dataSeries.numberOfValuesEqualOrBelow(0), 0)
})

test('numberOfValuesEqualOrBelow(10) should be 1 after single push(9)', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  assert.is(dataSeries.numberOfValuesEqualOrBelow(10), 1)
})

test('sum should be 9 after single push(9)', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  assert.is(dataSeries.sum(), 9)
})

test('average should be 9 after single push(9)', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  assert.is(dataSeries.average(), 9)
})

test('median should be 9 after single push(9)', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  assert.is(dataSeries.median(), 9)
})

test('Length should be 2 after second push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  assert.is(dataSeries.length(), 2)
})

test('atSeriesBegin should remain 9 after second push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  assert.is(dataSeries.atSeriesBegin(), 9)
})

test('atSeriesEnd should be 3 after second push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  assert.is(dataSeries.atSeriesEnd(), 3)
})

test('numberOfValuesAbove(0) should be 2 after second push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  assert.is(dataSeries.numberOfValuesAbove(0), 2)
})

test('numberOfValuesEqualOrBelow(0) should remain 0 after second push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  assert.is(dataSeries.numberOfValuesEqualOrBelow(0), 0)
})

test('numberOfValuesEqualOrBelow(10) should be 2 after second push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  assert.is(dataSeries.numberOfValuesEqualOrBelow(10), 2)
})

test('sum should be 12 after second push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  assert.is(dataSeries.sum(), 12)
})

test('average should be 6 after second push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  assert.is(dataSeries.average(), 6)
})

test('median should be 6 after second push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  assert.is(dataSeries.median(), 6)
})

test('Length should be 3 after third push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  assert.is(dataSeries.length(), 3)
})

test('atSeriesBegin should remain 9 after third push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  assert.is(dataSeries.atSeriesBegin(), 9)
})

test('atSeriesEnd should be 6 after third push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  assert.is(dataSeries.atSeriesEnd(), 6)
})

test('numberOfValuesAbove(0) should be 3 after third push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  assert.is(dataSeries.numberOfValuesAbove(0), 3)
})

test('numberOfValuesEqualOrBelow(0) should remain 0 after third push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  assert.is(dataSeries.numberOfValuesEqualOrBelow(0), 0)
})

test('numberOfValuesEqualOrBelow(10) should be 3 after third push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  assert.is(dataSeries.numberOfValuesEqualOrBelow(10), 3)
})

test('sum should be 18 after third push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  assert.is(dataSeries.sum(), 6)
})

test('average should be 6 after third push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  assert.is(dataSeries.average(), 6)
})

test('median should be 6 after third push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  assert.is(dataSeries.median(), 6)
})

test('Length should remain 3 after fourth push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  dataSeries.push(12)
  assert.is(dataSeries.length(), 3)
})

test('atSeriesBegin should turn to 3 after fourth push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  dataSeries.push(12)
  assert.is(dataSeries.atSeriesBegin(), 3)
})

test('atSeriesEnd should be 12 after fourth push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  dataSeries.push(12)
  assert.is(dataSeries.atSeriesEnd(), 12)
})

test('numberOfValuesAbove(0) should be 3 after fourth push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  dataSeries.push(12)
  assert.is(dataSeries.numberOfValuesAbove(0), 3)
})

test('numberOfValuesEqualOrBelow(0) should remain 0 after fourth push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  dataSeries.push(12)
  assert.is(dataSeries.numberOfValuesEqualOrBelow(0), 0)
})

test('numberOfValuesEqualOrBelow(10) should be 2 after fourth push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  dataSeries.push(12)
  assert.is(dataSeries.numberOfValuesEqualOrBelow(10), 2)
})

test('sum should be 21 after fourth push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  dataSeries.push(12)
  assert.is(dataSeries.sum(), 21)
})

test('average should be 7 after fourth push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  dataSeries.push(12)
  assert.is(dataSeries.average(), 7)
})

test('median should remain 6 after fourth push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  dataSeries.push(12)
  assert.is(dataSeries.median(), 6)
})

test('Length should remain 3 after fifth push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  dataSeries.push(12)
  dataSeries.push(-3)
  assert.is(dataSeries.length(), 3)
})

test('atSeriesBegin should turn to 6 after fifth push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  dataSeries.push(12)
  dataSeries.push(-3)
  assert.is(dataSeries.atSeriesBegin(), 6)
})

test('atSeriesEnd should be -3 after fifth push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  dataSeries.push(12)
  dataSeries.push(-3)
  assert.is(dataSeries.atSeriesEnd(), -3)
})

test('numberOfValuesAbove(0) should be 2 after fifth push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  dataSeries.push(12)
  dataSeries.push(-3)
  assert.is(dataSeries.numberOfValuesAbove(0), 2)
})

test('numberOfValuesEqualOrBelow(0) should be 1 after fifth push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  dataSeries.push(12)
  dataSeries.push(-3)
  assert.is(dataSeries.numberOfValuesEqualOrBelow(0), 1)
})

test('numberOfValuesEqualOrBelow(10) should remain 2 after fifth push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  dataSeries.push(12)
  dataSeries.push(-3)
  assert.is(dataSeries.numberOfValuesEqualOrBelow(10), 2)
})

test('sum should be 15 after fifth push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  dataSeries.push(12)
  dataSeries.push(-3)
  assert.is(dataSeries.sum(), 15)
})

test('average should be 5 after fifth push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  dataSeries.push(12)
  dataSeries.push(-3)
  assert.is(dataSeries.average(), 5)
})

test('median should remain 6 after fifth push', () => {
  const dataSeries = createSeries(3)
  dataSeries.push(9)
  dataSeries.push(3)
  dataSeries.push(6)
  dataSeries.push(12)
  dataSeries.push(-3)
  assert.is(dataSeries.median(), 6)
})

test.run()
