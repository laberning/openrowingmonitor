'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor
*/
import test from 'ava'
import { createMovingIntervalAverager } from './MovingIntervalAverager.js'

test('average of a datapoint with duration of averager is equal to datapoint', t => {
  const minuteAverager = createMovingIntervalAverager(10)
  minuteAverager.pushValue(5, 10)
  t.is(minuteAverager.average(), 5)
})

test('average of a datapoint with half duration of averager is double to datapoint', t => {
  const minuteAverager = createMovingIntervalAverager(20)
  minuteAverager.pushValue(5, 10)
  t.is(minuteAverager.average(), 10)
})

test('average of two identical datapoints with half duration of averager is equal to datapoint sum', t => {
  const minuteAverager = createMovingIntervalAverager(20)
  minuteAverager.pushValue(5, 10)
  minuteAverager.pushValue(5, 10)
  t.is(minuteAverager.average(), 10)
})

test('average does not consider datapoints that are outside of duration', t => {
  const minuteAverager = createMovingIntervalAverager(20)
  minuteAverager.pushValue(10, 10)
  minuteAverager.pushValue(5, 10)
  minuteAverager.pushValue(5, 10)
  t.is(minuteAverager.average(), 10)
})

test('average works with lots of values', t => {
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
  t.is(minuteAverager.average(), 50000)
})
