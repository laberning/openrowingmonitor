'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { createStreamFilter } from './StreamFilter.js'

test('average should be initValue on empty dataset', () => {
  const datapoints = createStreamFilter(3, 5.5)
  testReliable(datapoints, false)
  testClean(datapoints, 5.5)
})

test('an averager of length 1 should return the last added value', () => {
  const datapoints = createStreamFilter(3, 5.5)
  datapoints.push(9)
  testReliable(datapoints, true)
  testClean(datapoints, 9)
})

test('a median of length 2 should return average of the 2 added elements', () => {
  const datapoints = createStreamFilter(3, 5.5)
  datapoints.push(9)
  datapoints.push(4)
  testReliable(datapoints, true)
  testClean(datapoints, 6.5)
})

test('a median of three values should deliver the middle element', () => {
  const datapoints = createStreamFilter(3, 5.5)
  datapoints.push(9)
  datapoints.push(4)
  datapoints.push(3)
  testReliable(datapoints, true)
  testClean(datapoints, 4)
})

test('elements outside of range should not be considered', () => {
  const datapoints = createStreamFilter(3, 5.5)
  datapoints.push(9)
  datapoints.push(4)
  datapoints.push(3)
  datapoints.push(1)
  testReliable(datapoints, true)
  testClean(datapoints, 3)
})

test('elements outside of range should not be considered', () => {
  const datapoints = createStreamFilter(3, 5.5)
  datapoints.push(9)
  datapoints.push(4)
  datapoints.push(3)
  datapoints.push(1)
  datapoints.reset()
  testReliable(datapoints, false)
  testClean(datapoints, 5.5)
})

function testClean (series, expectedValue) {
  assert.ok(series.clean() === expectedValue, `Expected clean datapoint should be ${expectedValue}, encountered ${series.clean()}`)
}

function testReliable (series, expectedValue) {
  assert.ok(series.reliable() === expectedValue, `Expected clean datapoint should be ${expectedValue}, encountered ${series.reliable()}`)
}

test.run()
