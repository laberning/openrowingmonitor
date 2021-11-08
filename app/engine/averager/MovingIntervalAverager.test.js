'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { createMovingIntervalAverager } from './MovingIntervalAverager.js'

test('average of a data point with duration of averager is equal to datapoint', () => {
  const movingAverager = createMovingIntervalAverager(10)
  movingAverager.pushValue(5, 10)
  assert.is(movingAverager.getAverage(), 5)
})

test('average of a data point with half duration of averager is double to datapoint', () => {
  const movingAverager = createMovingIntervalAverager(20)
  movingAverager.pushValue(5, 10)
  assert.is(movingAverager.getAverage(), 10)
})

test('average of two identical data points with half duration of averager is equal to datapoint sum', () => {
  const movingAverager = createMovingIntervalAverager(20)
  movingAverager.pushValue(5, 10)
  movingAverager.pushValue(5, 10)
  assert.is(movingAverager.getAverage(), 10)
})

test('average does not consider data points that are outside of duration', () => {
  const movingAverager = createMovingIntervalAverager(20)
  movingAverager.pushValue(10, 10)
  movingAverager.pushValue(5, 10)
  movingAverager.pushValue(5, 10)
  assert.is(movingAverager.getAverage(), 10)
})

test('average works with lots of values', () => {
  // one hour
  const movingAverager = createMovingIntervalAverager(3000)
  for (let i = 0; i < 1000; i++) {
    movingAverager.pushValue(10, 1)
  }
  for (let i = 0; i < 1000; i++) {
    movingAverager.pushValue(20, 1)
  }
  for (let i = 0; i < 1000; i++) {
    movingAverager.pushValue(30, 2)
  }
  assert.is(movingAverager.getAverage(), 50000)
})

test('average should return 0 on empty dataset', () => {
  const movingAverager = createMovingIntervalAverager(10)
  assert.is(movingAverager.getAverage(), 0)
})

test.run()
