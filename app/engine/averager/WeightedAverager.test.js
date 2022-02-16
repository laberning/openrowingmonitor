'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { createWeightedAverager } from './WeightedAverager.js'

test('average should be 0 on empty dataset', () => {
  const weightedAverager = createWeightedAverager(10)
  assert.is(weightedAverager.getAverage(), 0)
})

test('average of one value is value', () => {
  const weightedAverager = createWeightedAverager(10)
  weightedAverager.pushValue(13.78)
  assert.is(weightedAverager.getAverage(), 13.78)
})

test('average of a and b is (2*b + a) / 3', () => {
  const weightedAverager = createWeightedAverager(10)
  weightedAverager.pushValue(5) // a
  weightedAverager.pushValue(2) // b
  assert.is(weightedAverager.getAverage(), 3)
})

test('average of a, b and c is (2*c + b) / 3 if maxNumOfDataPoints is 2', () => {
  const weightedAverager = createWeightedAverager(2)
  weightedAverager.pushValue(5) // a
  weightedAverager.pushValue(2) // b
  weightedAverager.pushValue(17) // c
  assert.is(weightedAverager.getAverage(), 12)
})

test('lastPushedValue of a, b and c is c', () => {
  const weightedAverager = createWeightedAverager(10)
  weightedAverager.pushValue(5) // a
  weightedAverager.pushValue(2) // b
  weightedAverager.pushValue(17) // c
  assert.is(weightedAverager.getLastPushedValue(), 17)
})

test('average should be 0 after reset', () => {
  const weightedAverager = createWeightedAverager(10)
  weightedAverager.pushValue(5)
  weightedAverager.pushValue(2)
  weightedAverager.reset()
  assert.is(weightedAverager.getAverage(), 0)
})

test('average should be a after pushing a after a reset', () => {
  const weightedAverager = createWeightedAverager(10)
  weightedAverager.pushValue(5)
  weightedAverager.pushValue(2)
  weightedAverager.reset()
  weightedAverager.pushValue(7)
  assert.is(weightedAverager.getAverage(), 7)
})

test.run()
