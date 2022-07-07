'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { createStreamFilter } from './StreamFilter.js'

test('average should be initValue on empty dataset', () => {
  const datapoints = createStreamFilter(3, 5.5)
  assert.is(datapoints.clean(), 5.5)
})

test('an averager of length 1 should return the last added value', () => {
  const datapoints = createStreamFilter(3, 5.5)
  datapoints.push(9)
  assert.is(datapoints.clean(), 9)
})

test('a median of length 2 should return average of last 2 added elements', () => {
  const datapoints = createStreamFilter(3, 5.5)
  datapoints.push(9)
  datapoints.push(4)
  assert.is(datapoints.clean(), 6.5)
})

test('a median of three values should deliver the middle element', () => {
  const datapoints = createStreamFilter(3, 5.5)
  datapoints.push(9)
  datapoints.push(4)
  datapoints.push(3)
  assert.is(datapoints.clean(), 4)
})

test('elements outside of range should not be considered', () => {
  const datapoints = createStreamFilter(3, 5.5)
  datapoints.push(9)
  datapoints.push(4)
  datapoints.push(3)
  datapoints.push(1)
  assert.is(datapoints.clean(), 3)
})

test.run()
