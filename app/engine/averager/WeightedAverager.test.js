'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { createWeightedAverager } from './WeightedAverager.js'

test('average should be 0 on empty dataset', () => {
  const weightedAverager = createWeightedAverager(10)
  assert.is(weightedAverager.weightedAverage(), 0)
})

test('average of one value is value', () => {
  const weightedAverager = createWeightedAverager(10)
  weightedAverager.pushValue(13.78)
  assert.is(weightedAverager.weightedAverage(), 13.78)
})

test('average of a and b is (2*b + a) / 3', () => {
  const weightedAverager = createWeightedAverager(10)
  weightedAverager.pushValue(5) // a
  weightedAverager.pushValue(2) // b
  assert.is(weightedAverager.weightedAverage(), 3)
})

test('average should be 0 after reset', () => {
  const weightedAverager = createWeightedAverager(10)
  weightedAverager.pushValue(5)
  weightedAverager.pushValue(2)
  weightedAverager.reset()
  assert.is(weightedAverager.weightedAverage(), 0)
})

test('average should be a after pushing a after a reset', () => {
  const weightedAverager = createWeightedAverager(10)
  weightedAverager.pushValue(5)
  weightedAverager.pushValue(2)
  weightedAverager.reset()
  weightedAverager.pushValue(7)
  assert.is(weightedAverager.weightedAverage(), 7)
})

test.run()
