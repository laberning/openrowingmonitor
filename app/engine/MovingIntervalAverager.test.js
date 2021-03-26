'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { createMovingIntervalAverager } from './MovingIntervalAverager.js'

test('average of a datapoint with duration of averager is equal to datapoint', () => {
  const minuteAverager = createMovingIntervalAverager(10)
  minuteAverager.pushValue(5, 10)
  assert.is(minuteAverager.average(), 5)
})

test('average of a datapoint with half duration of averager is double to datapoint', () => {
  const minuteAverager = createMovingIntervalAverager(20)
  minuteAverager.pushValue(5, 10)
  assert.is(minuteAverager.average(), 10)
})

test('average of two identical datapoints with half duration of averager is equal to datapoint sum', () => {
  const minuteAverager = createMovingIntervalAverager(20)
  minuteAverager.pushValue(5, 10)
  minuteAverager.pushValue(5, 10)
  assert.is(minuteAverager.average(), 10)
})

test('average does not consider datapoints that are outside of duration', () => {
  const minuteAverager = createMovingIntervalAverager(20)
  minuteAverager.pushValue(10, 10)
  minuteAverager.pushValue(5, 10)
  minuteAverager.pushValue(5, 10)
  assert.is(minuteAverager.average(), 10)
})

test('average works with lots of values', () => {
  // one hour
  const minuteAverager = createMovingIntervalAverager(3000)
  for (let i = 0; i < 1000; i++) {
    minuteAverager.pushValue(10, 1)
  }
  for (let i = 0; i < 1000; i++) {
    minuteAverager.pushValue(20, 1)
  }
  for (let i = 0; i < 1000; i++) {
    minuteAverager.pushValue(30, 2)
  }
  assert.is(minuteAverager.average(), 50000)
})

test.run()
