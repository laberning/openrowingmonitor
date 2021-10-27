'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import loglevel from 'loglevel'

import rowerProfiles from '../../config/rowerProfiles.js'
import { createRowingEngine } from './RowingEngine.js'
import { replayRowingSession } from '../tools/RowingRecorder.js'
import { deepMerge } from '../tools/Helper.js'

const log = loglevel.getLogger('RowingEngine.test')
log.setLevel('warn')

const createWorkoutEvaluator = function () {
  const strokes = []

  function handleStrokeEnd (stroke) {
    strokes.push(stroke)
    log.info(`stroke: ${strokes.length}, power: ${Math.round(stroke.power)}w, duration: ${stroke.duration.toFixed(2)}s, ` +
    ` drivePhase: ${stroke.durationDrivePhase.toFixed(2)}s, distance: ${stroke.distance.toFixed(2)}m`)
  }
  function updateKeyMetrics () {}
  function handleRecoveryEnd () {}
  function handlePause () {}
  function getNumOfStrokes () {
    return strokes.length
  }
  function getMaxStrokePower () {
    return strokes.map((stroke) => stroke.power).reduce((acc, power) => Math.max(acc, power))
  }
  function getMinStrokePower () {
    return strokes.map((stroke) => stroke.power).reduce((acc, power) => Math.max(acc, power))
  }
  function getDistanceSum () {
    return strokes.map((stroke) => stroke.strokeDistance).reduce((acc, strokeDistance) => acc + strokeDistance)
  }
  function getDistanceTotal () {
    return strokes[strokes.length - 1].distance
  }

  return {
    handleStrokeEnd,
    handleRecoveryEnd,
    updateKeyMetrics,
    handlePause,
    getNumOfStrokes,
    getMaxStrokePower,
    getMinStrokePower,
    getDistanceSum,
    getDistanceTotal
  }
}

test('sample data for WRX700 should produce plausible results with rower profile', async () => {
  const rowingEngine = createRowingEngine(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.WRX700))
  const workoutEvaluator = createWorkoutEvaluator()
  rowingEngine.notify(workoutEvaluator)
  await replayRowingSession(rowingEngine.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets.csv' })
  assert.is(workoutEvaluator.getNumOfStrokes(), 16, 'number of strokes does not meet expectation')
  assertPowerRange(workoutEvaluator, 50, 220)
  assertDistanceRange(workoutEvaluator, 140, 144)
  assertStrokeDistanceSumMatchesTotal(workoutEvaluator)
})

test('sample data for DKNR320 should produce plausible results with rower profile', async () => {
  const rowingEngine = createRowingEngine(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.DKNR320))
  const workoutEvaluator = createWorkoutEvaluator()
  rowingEngine.notify(workoutEvaluator)
  await replayRowingSession(rowingEngine.handleRotationImpulse, { filename: 'recordings/DKNR320.csv' })
  assert.is(workoutEvaluator.getNumOfStrokes(), 10, 'number of strokes does not meet expectation')
  assertPowerRange(workoutEvaluator, 75, 200)
  assertDistanceRange(workoutEvaluator, 64, 67)
  assertStrokeDistanceSumMatchesTotal(workoutEvaluator)
})

test('sample data for RX800 should produce plausible results with rower profile', async () => {
  const rowingEngine = createRowingEngine(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.RX800))
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
