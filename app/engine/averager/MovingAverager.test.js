'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { createMovingAverager } from './MovingAverager.js'

test('average should be initValue on empty dataset', () => {
  const movingAverager = createMovingAverager(10, 5.5)
  assert.is(movingAverager.getAverage(), 5.5)
})

test('an averager of length 1 should return the last added value averaged with the default value', () => {
  const movingAverager = createMovingAverager(1, 3)
  movingAverager.pushValue(9)
  assert.is(movingAverager.getAverage(), 9)
})

test('an averager of length 2 should return average of last 2 added elements', () => {
  const movingAverager = createMovingAverager(2, 3)
  movingAverager.pushValue(9)
  movingAverager.pushValue(4)
  assert.is(movingAverager.getAverage(), 6.5)
})

test('elements outside of range should not be considered', () => {
  const movingAverager = createMovingAverager(2, 3)
  movingAverager.pushValue(9)
  movingAverager.pushValue(4)
  movingAverager.pushValue(3)
  assert.is(movingAverager.getAverage(), 3.5)
})

test('replacing the last element should work as expected', () => {
  const movingAverager = createMovingAverager(2, 3)
  movingAverager.pushValue(9)
  movingAverager.pushValue(5)
  movingAverager.replaceLastPushedValue(12)
  assert.is(movingAverager.getAverage(), 10.5)
})

test.run()
