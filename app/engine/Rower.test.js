'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

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

const createWorkoutEvaluator = function () {
  const strokes = []

  function handleDriveEnd (stroke) {
    strokes.push(stroke)
    log.info(`stroke: ${strokes.length}, power: ${Math.round(stroke.power)}w, duration: ${stroke.duration.toFixed(2)}s, ` +
    ` drivePhase: ${stroke.durationDrivePhase.toFixed(2)}s, distance: ${stroke.distance.toFixed(2)}m`)
  }
  function updateKeyMetrics () {}
  function handleRecoveryEnd () {}
  function handlePause () {}
  /* 
  function getNumOfStrokes () {
    return strokes.length
  }
  function getTotalTime () {
    return strokes.map((stroke) => stroke.power).reduce((acc, power) => Math.max(acc, power))
  }
  function getTotalDistance () {
    return strokes[strokes.length - 1].distance
  }
  */
  return {
    handleDriveEnd,
    handleRecoveryEnd,
    updateKeyMetrics,
    handlePause,
    /*
    getNumOfStrokes,
    getMaxStrokePower,
    getMinStrokePower,
    getDistanceSum,
    getDistanceTotal
    */
  }
}

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
