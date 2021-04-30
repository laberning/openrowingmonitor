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

const log = loglevel.getLogger('RowingEngine.test')
log.setLevel('warn')

const createWorkoutEvaluator = function () {
  const strokes = []

  function handleStroke (stroke) {
    strokes.push(stroke)
    log.info(`stroke: ${strokes.length}, power: ${Math.round(stroke.power)}w, duration: ${stroke.duration.toFixed(2)}s, ` +
    ` drivePhase: ${stroke.durationDrivePhase.toFixed(2)}s, distance: ${stroke.distance.toFixed(2)}m`)
  }
  function handleStrokeStateChanged () {}
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
  return {
    handleStroke,
    handleStrokeStateChanged,
    handlePause,
    getNumOfStrokes,
    getMaxStrokePower,
    getMinStrokePower
  }
}

test('sample data for WRX700 should produce plausible results with rower profile', async () => {
  const rowingEngine = createRowingEngine(rowerProfiles.WRX700)
  const workoutEvaluator = createWorkoutEvaluator()
  rowingEngine.notify(workoutEvaluator)
  await replayRowingSession(rowingEngine.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets.csv' })
  assert.is(workoutEvaluator.getNumOfStrokes(), 16, 'number of strokes does not meet expectation')
  assert.ok(workoutEvaluator.getMaxStrokePower() < 220, `maximum stroke power should be below 220w, but is ${workoutEvaluator.getMaxStrokePower()}w`)
  assert.ok(workoutEvaluator.getMinStrokePower() > 50, `minimum stroke power should be above 50w, but is ${workoutEvaluator.getMinStrokePower()}w`)
})

test('sample data for DKNR320 should produce plausible results with rower profile', async () => {
  const rowingEngine = createRowingEngine(rowerProfiles.DKNR320)
  const workoutEvaluator = createWorkoutEvaluator()
  rowingEngine.notify(workoutEvaluator)
  await replayRowingSession(rowingEngine.handleRotationImpulse, { filename: 'recordings/DKNR320.csv' })
  assert.is(workoutEvaluator.getNumOfStrokes(), 10, 'number of strokes does not meet expectation')
  assert.ok(workoutEvaluator.getMaxStrokePower() < 200, `maximum stroke power should be below 200w, but is ${workoutEvaluator.getMaxStrokePower()}w`)
  assert.ok(workoutEvaluator.getMinStrokePower() > 75, `minimum stroke power should be above 75w, but is ${workoutEvaluator.getMinStrokePower()}w`)
})

test('sample data for RX800 should produce plausible results with rower profile', async () => {
  const rowingEngine = createRowingEngine(rowerProfiles.RX800)
  const workoutEvaluator = createWorkoutEvaluator()
  rowingEngine.notify(workoutEvaluator)
  await replayRowingSession(rowingEngine.handleRotationImpulse, { filename: 'recordings/RX800.csv' })
  assert.is(workoutEvaluator.getNumOfStrokes(), 10, 'number of strokes does not meet expectation')
  assert.ok(workoutEvaluator.getMaxStrokePower() < 260, `maximum stroke power should be below 260, but is ${workoutEvaluator.getMaxStrokePower()}w`)
  assert.ok(workoutEvaluator.getMinStrokePower() > 160, `minimum stroke power should be above 160w, but is ${workoutEvaluator.getMinStrokePower()}w`)
})

test.run()
