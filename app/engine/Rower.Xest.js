'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Let's skip the tests for now. ToDo: fix the interface

  This test is a test of the Rower object, that tests wether this object fills all fields correctly, given one validated rower, (the
  Concept2 RowErg) using a validated cycle of strokes. This thoroughly tests the raw physics of the translation of Angular physics
  to Linear physics. The combination with all possible known rowers is tested when testing the above function RowingStatistics, as
  these statistics are dependent on these settings as well.
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import loglevel from 'loglevel'

import rowerProfiles from '../../config/rowerProfiles.js'
import { createRower } from './Rower.js'
import { replayRowingSession } from '../tools/RowingRecorder.js'
import { deepMerge } from '../tools/Helper.js'

const log = loglevel.getLogger('RowingEngine.test')
log.setLevel('warn')

'use strict'
/*
  Open Rowing Monitor, https://github.com/jaapvanekris/openrowingmonitor
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { createRower } from './Rower.js'

// Test behaviour for no datapoints

// Test behaviour for one datapoint

// Test behaviour for perfect upgoing flank

// Test behaviour for perfect downgoing flank

// Test behaviour for perfect stroke

// Test behaviour for noisy upgoing flank

// Test behaviour for noisy downgoing flank

// Test behaviour for noisy stroke

test('Correct behaviour with an empty dataset', () => {
  const dataSeries = createOLSLinearSeries(3)
  assert.ok(dataSeries.length() === 0, `Length should be 0, is ${dataSeries.length()}`)
  assert.ok(dataSeries.xAtSeriesBegin() === 0, `xAtSeriesBegin should be 0, is ${dataSeries.xAtSeriesBegin()}`)
  assert.ok(dataSeries.yAtSeriesBegin() === 0, `yAtSeriesBegin should be 0, is ${dataSeries.yAtSeriesBegin()}`)
  assert.ok(dataSeries.xAtSeriesEnd() === 0, `xAtSeriesEnd should be 0, is ${dataSeries.xAtSeriesEnd()}`)
  assert.ok(dataSeries.yAtSeriesEnd() === 0, `yAtSeriesEnd should be 0, is ${dataSeries.yAtSeriesEnd()}`)
  assert.ok(dataSeries.numberOfXValuesAbove(0) === 0, `numberOfXValuesAbove(0) should be 0, is ${dataSeries.numberOfXValuesAbove(0)}`)
  assert.ok(dataSeries.numberOfYValuesAbove(0) === 0, `numberOfYValuesAbove(0) should be 0, is ${dataSeries.numberOfYValuesAbove(0)}`)
  assert.ok(dataSeries.numberOfXValuesEqualOrBelow(0) === 0, `numberOfXValuesEqualOrBelow(0) should be 0, is ${dataSeries.numberOfXValuesEqualOrBelow(0)}`)
  assert.ok(dataSeries.numberOfYValuesEqualOrBelow(0) === 0, `numberOfYValuesEqualOrBelow(0) should be 0, is ${dataSeries.numberOfYValuesEqualOrBelow(0)}`)
  assert.ok(dataSeries.numberOfYValuesAbove(10) === 0, `numberOfYValuesAbove(10) should be 0, is ${dataSeries.numberOfYValuesAbove(10)}`)
  assert.ok(dataSeries.numberOfYValuesEqualOrBelow(10) === 0, `numberOfYValuesEqualOrBelow(10) should be 0, is ${dataSeries.numberOfYValuesEqualOrBelow(10)}`)
  assert.ok(dataSeries.xSum() === 0, `xSum should be 0, is ${dataSeries.xSum()}`)
  assert.ok(dataSeries.ySum() === 0, `ySum should be 0, is ${dataSeries.ySum()}`)
  assert.ok(dataSeries.slope() === 0, `slope should be 0, is ${dataSeries.slope()}`)
  assert.ok(dataSeries.intercept() === 0, `intercept should be 0, is ${dataSeries.intercept()}`)
  assert.ok(dataSeries.goodnessOfFit() === 0, `goodnessOfFit should be 0, is ${dataSeries.goodnessOfFit()}`)
})

test('Behaviour on a series after single push', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  assert.ok(dataSeries.length() === 1, `Length should be 1, is ${dataSeries.length()}`)
  assert.ok(dataSeries.xAtSeriesBegin() === 5, `xAtSeriesBegin should be 5, is ${dataSeries.xAtSeriesBegin()}`)
  assert.ok(dataSeries.yAtSeriesBegin() === 9, `yAtSeriesBegin should be 9, is ${dataSeries.yAtSeriesBegin()}`)
  assert.ok(dataSeries.xAtSeriesEnd() === 5, `xAtSeriesEnd should be 5, is ${dataSeries.xAtSeriesEnd()}`)
  assert.ok(dataSeries.yAtSeriesEnd() === 9, `yAtSeriesEnd should be 9, is ${dataSeries.yAtSeriesEnd()}`)
  assert.ok(dataSeries.numberOfXValuesAbove(0) === 1, `numberOfXValuesAbove(0) should be 1, is ${dataSeries.numberOfXValuesAbove(0)}`)
  assert.ok(dataSeries.numberOfYValuesAbove(0) === 1, `numberOfYValuesAbove(0) should be 1, is ${dataSeries.numberOfYValuesAbove(0)}`)
  assert.ok(dataSeries.numberOfXValuesEqualOrBelow(0) === 0, `numberOfXValuesEqualOrBelow(0) should be 0, is ${dataSeries.numberOfXValuesEqualOrBelow(0)}`)
  assert.ok(dataSeries.numberOfYValuesEqualOrBelow(0) === 0, `numberOfYValuesEqualOrBelow(0) should be 0, is ${dataSeries.numberOfYValuesEqualOrBelow(0)}`)
  assert.ok(dataSeries.numberOfYValuesAbove(10) === 0, `numberOfYValuesAbove(10) should be 0, is ${dataSeries.numberOfYValuesAbove(10)}`)
  assert.ok(dataSeries.numberOfYValuesEqualOrBelow(10) === 1, `numberOfYValuesEqualOrBelow(10) should be 1, is ${dataSeries.numberOfYValuesEqualOrBelow(10)}`)
  assert.ok(dataSeries.xSum() === 5, `xSum should be 5, is ${dataSeries.xSum()}`)
  assert.ok(dataSeries.ySum() === 9, `ySum should be 9, is ${dataSeries.ySum()}`)
  assert.ok(dataSeries.slope() === 0, `slope should be 0, is ${dataSeries.slope()}`)
  assert.ok(dataSeries.intercept() === 0, `intercept should be 0, is ${dataSeries.intercept()}`)
  assert.ok(dataSeries.goodnessOfFit() === 0, `goodnessOfFit should be 0, is ${dataSeries.goodnessOfFit()}`)
})

test('Behaviour after two pushed values', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  assert.ok(dataSeries.length() === 2, `Length should be 2, is ${dataSeries.length()}`)
  assert.ok(dataSeries.xAtSeriesBegin() === 5, `xAtSeriesBegin should be 5, is ${dataSeries.xAtSeriesBegin()}`)
  assert.ok(dataSeries.yAtSeriesBegin() === 9, `yAtSeriesBegin should be 9, is ${dataSeries.yAtSeriesBegin()}`)
  assert.ok(dataSeries.xAtSeriesEnd() === 3, `xAtSeriesEnd should be 3, is ${dataSeries.xAtSeriesEnd()}`)
  assert.ok(dataSeries.yAtSeriesEnd() === 3, `yAtSeriesEnd should be 3, is ${dataSeries.yAtSeriesEnd()}`)
  assert.ok(dataSeries.numberOfXValuesAbove(0) === 2, `numberOfXValuesAbove(0) should be 2, is ${dataSeries.numberOfXValuesAbove(0)}`)
  assert.ok(dataSeries.numberOfYValuesAbove(0) === 2, `numberOfYValuesAbove(0) should be 2, is ${dataSeries.numberOfYValuesAbove(0)}`)
  assert.ok(dataSeries.numberOfXValuesEqualOrBelow(0) === 0, `numberOfXValuesEqualOrBelow(0) should be 0, is ${dataSeries.numberOfXValuesEqualOrBelow(0)}`)
  assert.ok(dataSeries.numberOfYValuesEqualOrBelow(0) === 0, `numberOfYValuesEqualOrBelow(0) should be 0, is ${dataSeries.numberOfYValuesEqualOrBelow(0)}`)
  assert.ok(dataSeries.numberOfYValuesAbove(10) === 0, `numberOfYValuesAbove(10) should be 0, is ${dataSeries.numberOfYValuesAbove(10)}`)
  assert.ok(dataSeries.numberOfYValuesEqualOrBelow(10) === 2, `numberOfYValuesEqualOrBelow(10) should be 2, is ${dataSeries.numberOfYValuesEqualOrBelow(10)}`)
  assert.ok(dataSeries.xSum() === 8, `xSum should be 8, is ${dataSeries.xSum()}`)
  assert.ok(dataSeries.ySum() === 12, `ySum should be 12, is ${dataSeries.ySum()}`)
  assert.ok(dataSeries.slope() === 3, `slope should be 3, is ${dataSeries.slope()}`)
  assert.ok(dataSeries.intercept() === -6, `intercept should be -6, is ${dataSeries.intercept()}`)
  assert.ok(dataSeries.goodnessOfFit() === 1, `goodnessOfFit should be 1, is ${dataSeries.goodnessOfFit()}`)
})

test('Behaviour after three pushed values, filling the series', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  assert.ok(dataSeries.length() === 3, `Length should be 3, is ${dataSeries.length()}`)
  assert.ok(dataSeries.xAtSeriesBegin() === 5, `xAtSeriesBegin should be 5, is ${dataSeries.xAtSeriesBegin()}`)
  assert.ok(dataSeries.yAtSeriesBegin() === 9, `yAtSeriesBegin should be 9, is ${dataSeries.yAtSeriesBegin()}`)
  assert.ok(dataSeries.xAtSeriesEnd() === 4, `xAtSeriesEnd should be 4, is ${dataSeries.xAtSeriesEnd()}`)
  assert.ok(dataSeries.yAtSeriesEnd() === 6, `yAtSeriesEnd should be 6, is ${dataSeries.yAtSeriesEnd()}`)
  assert.ok(dataSeries.numberOfXValuesAbove(0) === 3, `numberOfXValuesAbove(0) should be 3, is ${dataSeries.numberOfXValuesAbove(0)}`)
  assert.ok(dataSeries.numberOfYValuesAbove(0) === 3, `numberOfYValuesAbove(0) should be 3, is ${dataSeries.numberOfYValuesAbove(0)}`)
  assert.ok(dataSeries.numberOfXValuesEqualOrBelow(0) === 0, `numberOfXValuesEqualOrBelow(0) should be 0, is ${dataSeries.numberOfXValuesEqualOrBelow(0)}`)
  assert.ok(dataSeries.numberOfYValuesEqualOrBelow(0) === 0, `numberOfYValuesEqualOrBelow(0) should be 0, is ${dataSeries.numberOfYValuesEqualOrBelow(0)}`)
  assert.ok(dataSeries.numberOfYValuesAbove(10) === 0, `numberOfYValuesAbove(10) should be 0, is ${dataSeries.numberOfYValuesAbove(10)}`)
  assert.ok(dataSeries.numberOfYValuesEqualOrBelow(10) === 3, `numberOfYValuesEqualOrBelow(10) should be 3, is ${dataSeries.numberOfYValuesEqualOrBelow(10)}`)
  assert.ok(dataSeries.xSum() === 12, `xSum should be 12, is ${dataSeries.xSum()}`)
  assert.ok(dataSeries.ySum() === 18, `ySum should be 18, is ${dataSeries.ySum()}`)
  assert.ok(dataSeries.slope() === 3, `slope should be 3, is ${dataSeries.slope()}`)
  assert.ok(dataSeries.intercept() === -6, `intercept should be -6, is ${dataSeries.intercept()}`)
  assert.ok(dataSeries.goodnessOfFit() === 1, `goodnessOfFit should be 1, is ${dataSeries.goodnessOfFit()}`)
})

test('Behaviour after four pushed values, filling the series, but pushing the first out again', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  assert.ok(dataSeries.length() === 3, `Length should be 3, is ${dataSeries.length()}`)
  assert.ok(dataSeries.xAtSeriesBegin() === 3, `xAtSeriesBegin should be 3, is ${dataSeries.xAtSeriesBegin()}`)
  assert.ok(dataSeries.yAtSeriesBegin() === 3, `yAtSeriesBegin should be 3, is ${dataSeries.yAtSeriesBegin()}`)
  assert.ok(dataSeries.xAtSeriesEnd() === 6, `xAtSeriesEnd should be 6, is ${dataSeries.xAtSeriesEnd()}`)
  assert.ok(dataSeries.yAtSeriesEnd() === 12, `yAtSeriesEnd should be 12, is ${dataSeries.yAtSeriesEnd()}`)
  assert.ok(dataSeries.numberOfXValuesAbove(0) === 3, `numberOfXValuesAbove(0) should be 3, is ${dataSeries.numberOfXValuesAbove(0)}`)
  assert.ok(dataSeries.numberOfYValuesAbove(0) === 3, `numberOfYValuesAbove(0) should be 3, is ${dataSeries.numberOfYValuesAbove(0)}`)
  assert.ok(dataSeries.numberOfXValuesEqualOrBelow(0) === 0, `numberOfXValuesEqualOrBelow(0) should be 0, is ${dataSeries.numberOfXValuesEqualOrBelow(0)}`)
  assert.ok(dataSeries.numberOfYValuesEqualOrBelow(0) === 0, `numberOfYValuesEqualOrBelow(0) should be 0, is ${dataSeries.numberOfYValuesEqualOrBelow(0)}`)
  assert.ok(dataSeries.numberOfYValuesAbove(10) === 1, `numberOfYValuesAbove(10) should be 1, is ${dataSeries.numberOfYValuesAbove(10)}`)
  assert.ok(dataSeries.numberOfYValuesEqualOrBelow(10) === 2, `numberOfYValuesEqualOrBelow(10) should be 2, is ${dataSeries.numberOfYValuesEqualOrBelow(10)}`)
  assert.ok(dataSeries.xSum() === 13, `xSum should be 12, is ${dataSeries.xSum()}`)
  assert.ok(dataSeries.ySum() === 21, `ySum should be 18, is ${dataSeries.ySum()}`)
  assert.ok(dataSeries.slope() === 3, `slope should be 3, is ${dataSeries.slope()}`)
  assert.ok(dataSeries.intercept() === -6, `intercept should be -6, is ${dataSeries.intercept()}`)
  assert.ok(dataSeries.goodnessOfFit() === 1, `goodnessOfFit should be 1, is ${dataSeries.goodnessOfFit()}`)
})

test('Behaviour after five pushed values, filling the series, but pushing the first two out again', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  assert.ok(dataSeries.length() === 3, `Length should be 3, is ${dataSeries.length()}`)
  assert.ok(dataSeries.xAtSeriesBegin() === 4, `xAtSeriesBegin should be 4, is ${dataSeries.xAtSeriesBegin()}`)
  assert.ok(dataSeries.yAtSeriesBegin() === 6, `yAtSeriesBegin should be 6, is ${dataSeries.yAtSeriesBegin()}`)
  assert.ok(dataSeries.xAtSeriesEnd() === 1, `xAtSeriesEnd should be 1, is ${dataSeries.xAtSeriesEnd()}`)
  assert.ok(dataSeries.yAtSeriesEnd() === -3, `yAtSeriesEnd should be -3, is ${dataSeries.yAtSeriesEnd()}`)
  assert.ok(dataSeries.numberOfXValuesAbove(0) === 3, `numberOfXValuesAbove(0) should be 3, is ${dataSeries.numberOfXValuesAbove(0)}`)
  assert.ok(dataSeries.numberOfYValuesAbove(0) === 2, `numberOfYValuesAbove(0) should be 2, is ${dataSeries.numberOfYValuesAbove(0)}`)
  assert.ok(dataSeries.numberOfXValuesEqualOrBelow(0) === 0, `numberOfXValuesEqualOrBelow(0) should be 0, is ${dataSeries.numberOfXValuesEqualOrBelow(0)}`)
  assert.ok(dataSeries.numberOfYValuesEqualOrBelow(0) === 1, `numberOfYValuesEqualOrBelow(0) should be 1, is ${dataSeries.numberOfYValuesEqualOrBelow(0)}`)
  assert.ok(dataSeries.numberOfYValuesAbove(10) === 1, `numberOfYValuesAbove(10) should be 1, is ${dataSeries.numberOfYValuesAbove(10)}`)
  assert.ok(dataSeries.numberOfYValuesEqualOrBelow(10) === 2, `numberOfYValuesEqualOrBelow(10) should be 2, is ${dataSeries.numberOfYValuesEqualOrBelow(10)}`)
  assert.ok(dataSeries.xSum() === 11, `xSum should be 11, is ${dataSeries.xSum()}`)
  assert.ok(dataSeries.ySum() === 15, `ySum should be 15, is ${dataSeries.ySum()}`)
  assert.ok(dataSeries.slope() === 3, `slope should be 3, is ${dataSeries.slope()}`)
  assert.ok(dataSeries.intercept() === -6, `intercept should be -6, is ${dataSeries.intercept()}`)
  assert.ok(dataSeries.goodnessOfFit() === 1, `goodnessOfFit should be 1, is ${dataSeries.goodnessOfFit()}`)
})

test('Behaviour after five pushed values, filling the series, and resetting it', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  dataSeries.reset()
  assert.ok(dataSeries.length() === 0, `Length should be 0, is ${dataSeries.length()}`)
  assert.ok(dataSeries.xAtSeriesBegin() === 0, `xAtSeriesBegin should be 0, is ${dataSeries.xAtSeriesBegin()}`)
  assert.ok(dataSeries.yAtSeriesBegin() === 0, `yAtSeriesBegin should be 0, is ${dataSeries.yAtSeriesBegin()}`)
  assert.ok(dataSeries.xAtSeriesEnd() === 0, `xAtSeriesEnd should be 0, is ${dataSeries.xAtSeriesEnd()}`)
  assert.ok(dataSeries.yAtSeriesEnd() === 0, `yAtSeriesEnd should be 0, is ${dataSeries.yAtSeriesEnd()}`)
  assert.ok(dataSeries.numberOfXValuesAbove(0) === 0, `numberOfXValuesAbove(0) should be 0, is ${dataSeries.numberOfXValuesAbove(0)}`)
  assert.ok(dataSeries.numberOfYValuesAbove(0) === 0, `numberOfYValuesAbove(0) should be 0, is ${dataSeries.numberOfYValuesAbove(0)}`)
  assert.ok(dataSeries.numberOfXValuesEqualOrBelow(0) === 0, `numberOfXValuesEqualOrBelow(0) should be 0, is ${dataSeries.numberOfXValuesEqualOrBelow(0)}`)
  assert.ok(dataSeries.numberOfYValuesEqualOrBelow(0) === 0, `numberOfYValuesEqualOrBelow(0) should be 0, is ${dataSeries.numberOfYValuesEqualOrBelow(0)}`)
  assert.ok(dataSeries.numberOfYValuesAbove(10) === 0, `numberOfYValuesAbove(10) should be 0, is ${dataSeries.numberOfYValuesAbove(10)}`)
  assert.ok(dataSeries.numberOfYValuesEqualOrBelow(10) === 0, `numberOfYValuesEqualOrBelow(10) should be 0, is ${dataSeries.numberOfYValuesEqualOrBelow(10)}`)
  assert.ok(dataSeries.xSum() === 0, `xSum should be 0, is ${dataSeries.xSum()}`)
  assert.ok(dataSeries.ySum() === 0, `ySum should be 0, is ${dataSeries.ySum()}`)
  assert.ok(dataSeries.slope() === 0, `slope should be 0, is ${dataSeries.slope()}`)
  assert.ok(dataSeries.intercept() === 0, `intercept should be 0, is ${dataSeries.intercept()}`)
  assert.ok(dataSeries.goodnessOfFit() === 0, `goodnessOfFit should be 0, is ${dataSeries.goodnessOfFit()}`)
})

test('Series with 5 elements, with 2 noisy datapoints', () => {
  const dataSeries = createOLSLinearSeries(5)
  dataSeries.push(5, 9)
  dataSeries.push(3, 2)
  dataSeries.push(4, 7)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  assert.ok(dataSeries.slope() < 3.1, `Slope should be below 3.1, is ${dataSeries.slope()}`)
  assert.ok(dataSeries.slope() > 2.9, `Slope should be above 2.9, is ${dataSeries.slope()}`)
  assert.ok(dataSeries.intercept() < -5.8, `Intercept should be below -5.7, is ${dataSeries.intercept()}`)
  assert.ok(dataSeries.intercept() > -6.3, `Intercept should be above -6.3, is ${dataSeries.intercept()}`)
  assert.ok(dataSeries.goodnessOfFit() > 0.9, `Intercept should be above 0.9, was ${dataSeries.goodnessOfFit()}`)
  assert.ok(dataSeries.goodnessOfFit() < 1.0, `Intercept should stay below 1.0, was ${dataSeries.goodnessOfFit()}`)
})

test('Rower function should deliver results close to the validation machine (Concept2 RowErg)', async () => {
  const rowingEngine = createRower(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.RX800))
  const workoutEvaluator = createWorkoutEvaluator()
  rowingEngine.notify(workoutEvaluator)
  await replayRowingSession(rowingEngine.handleRotationImpulse, { filename: 'recordings/RX800.csv' })
  assert.is(workoutEvaluator.getNumOfStrokes(), 10, 'number of strokes does not meet expectation')
  assertPowerRange(workoutEvaluator, 80, 200)
  assertDistanceRange(workoutEvaluator, 70, 80)
  assertStrokeDistanceSumMatchesTotal(workoutEvaluator)
})

function assertPowerRange (evaluator, minPower, maxPower) {
  assert.ok(evaluator.getMinStrokePower() > minPower, `minimum stroke power should be above ${minPower}w, but is ${evaluator.getMinStrokePower()}w`)
  assert.ok(evaluator.getMaxStrokePower() < maxPower, `maximum stroke power should be below ${maxPower}w, but is ${evaluator.getMaxStrokePower()}w`)
}

function assertDistanceRange (evaluator, minDistance, maxDistance) {
  assert.ok(evaluator.getDistanceSum() >= minDistance && evaluator.getDistanceSum() <= maxDistance, `distance should be between ${minDistance}m and ${maxDistance}m, but is ${evaluator.getDistanceSum().toFixed(2)}m`)
}

function assertStrokeDistanceSumMatchesTotal (evaluator) {
  assert.ok(evaluator.getDistanceSum().toFixed(2) === evaluator.getDistanceTotal().toFixed(2), `sum of distance of all strokes is ${evaluator.getDistanceSum().toFixed(2)}m, but total in last stroke is ${evaluator.getDistanceTotal().toFixed(2)}m`)
}

test.run()
