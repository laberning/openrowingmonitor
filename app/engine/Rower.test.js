'use strict'
/*

  This test is a test of the Rower object, that tests wether this object fills all fields correctly, given one validated rower, (the
  Concept2 RowErg) using a validated cycle of strokes. This thoroughly tests the raw physics of the translation of Angular physics
  to Linear physics. The combination with all possible known rowers is tested when testing the above function RowingStatistics, as
  these statistics are dependent on these settings as well.
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { createRower } from './Rower.js'

const baseConfig = {
  numOfImpulsesPerRevolution: 6,
  flankLength: 11,
  numberOfErrorsAllowed: 2,
  minimumStrokeQuality: 0.30,
  minumumRecoverySlope: 0,
  autoAdjustRecoverySlope: true,
  autoAdjustRecoverySlopeMargin: 0.10,
  minumumForceBeforeStroke: 50,
  minimumRecoveryTime: 0.9,
  minimumDriveTime: 0.4,
  maximumStrokeTimeBeforePause: 6.0,
  minimumTimeBetweenImpulses: 0.005,
  maximumTimeBetweenImpulses: 0.02,
  autoAdjustDragFactor: true,
  dragFactorSmoothing: 3,
  dragFactor: 100,
  minimumDragQuality: 0.83,
  flywheelInertia: 0.1,
  magicConstant: 2.8,
  sprocketRadius: 2
}

// Test behaviour for no datapoints
test('Correct rower behaviour at initialisation', () => {
  const rower = createRower(baseConfig)
  testStrokeState(rower, 'WaitingForDrive')
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, -1)
  testTotalLinearDistanceSinceStart(rower, 0)
  testCycleDuration(rower, 1.3)
  testCycleLinearDistance(rower, 0)
  testCycleLinearVelocity(rower, 0)
  testCyclePower(rower, 0)
  testDriveDuration(rower, 0)
  testDriveLinearDistance(rower, 0)
  testDriveLength(rower, 0)
  testDriveAverageHandleForce(rower, 0)
  testDrivePeakHandleForce(rower, 0)
  testRecoveryDuration(rower, 0)
  testRecoveryDragFactor(rower, 100)
  testInstantHandlePower(rower, 0)
})

// Test behaviour for one datapoint

// Test behaviour for perfect stroke
test('Correct Rower behaviour for a noisefree stroke', () => {
  const specificConfig = {
    numOfImpulsesPerRevolution: 6,
    flankLength: 11,
    numberOfErrorsAllowed: 2,
    minimumStrokeQuality: 0.30,
    minumumRecoverySlope: 0,
    autoAdjustRecoverySlope: true,
    autoAdjustRecoverySlopeMargin: 0.10,
    minumumForceBeforeStroke: 50,
    minimumDriveTime: 0.1,
    minimumRecoveryTime: 0.2,
    maximumStrokeTimeBeforePause: 0.2,
    minimumTimeBetweenImpulses: 0.005,
    maximumTimeBetweenImpulses: 0.02,
    autoAdjustDragFactor: true,
    dragFactorSmoothing: 3,
    dragFactor: 100,
    minimumDragQuality: 0.83,
    flywheelInertia: 0.1,
    magicConstant: 2.8,
    sprocketRadius: 2
  }

  const rower = createRower(specificConfig)
  testStrokeState(rower, 'WaitingForDrive')
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, -1)
  testTotalLinearDistanceSinceStart(rower, 0)
  testCycleDuration(rower, 0.30000000000000004)
  testCycleLinearDistance(rower, 0)
  testCycleLinearVelocity(rower, 0)
  testCyclePower(rower, 0)
  testDriveDuration(rower, 0)
  testDriveLinearDistance(rower, 0)
  testDriveLength(rower, 0)
  testDriveAverageHandleForce(rower, 0)
  testDrivePeakHandleForce(rower, 0)
  testRecoveryDuration(rower, 0)
  testRecoveryDragFactor(rower, 100)
  testInstantHandlePower(rower, 0)
  rower.handleRotationImpulse(0.011221636)
  testStrokeState(rower, 'Drive')
  rower.handleRotationImpulse(0.011175504)
  rower.handleRotationImpulse(0.01116456)
  rower.handleRotationImpulse(0.011130263)
  rower.handleRotationImpulse(0.011082613)
  rower.handleRotationImpulse(0.011081761)
  rower.handleRotationImpulse(0.011062297)
  rower.handleRotationImpulse(0.011051853)
  rower.handleRotationImpulse(0.010973313)
  rower.handleRotationImpulse(0.010919756)
  rower.handleRotationImpulse(0.01086431)
  rower.handleRotationImpulse(0.010800864)
  rower.handleRotationImpulse(0.010956987)
  rower.handleRotationImpulse(0.010653396)
  rower.handleRotationImpulse(0.010648619)
  rower.handleRotationImpulse(0.010536818)
  rower.handleRotationImpulse(0.010526151)
  rower.handleRotationImpulse(0.010511225)
  rower.handleRotationImpulse(0.010386684)
  testStrokeState(rower, 'Drive')
  testTotalMovingTimeSinceStart(rower, 0.088970487)
  testTotalNumberOfStrokes(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0.31037384539231255)
  testCycleDuration(rower, 0.30000000000000004)
  testCycleLinearDistance(rower, 0)
  testCycleLinearVelocity(rower, 0)
  testCyclePower(rower, 0)
  testDriveDuration(rower, 0)
  testDriveLinearDistance(rower, 0)
  testDriveLength(rower, 0)
  testDriveAverageHandleForce(rower, 0)
  testDrivePeakHandleForce(rower, 0)
  testRecoveryDuration(rower, 0)
  testRecoveryDragFactor(rower, 0)
  testInstantHandlePower(rower, 0)
  rower.handleRotationImpulse(0.010769)
  rower.handleRotationImpulse(0.010707554)
  rower.handleRotationImpulse(0.010722165)
  rower.handleRotationImpulse(0.01089567)
  rower.handleRotationImpulse(0.010917504)
  rower.handleRotationImpulse(0.010997969)
  rower.handleRotationImpulse(0.011004655)
  rower.handleRotationImpulse(0.011013618)
  rower.handleRotationImpulse(0.011058193)
  rower.handleRotationImpulse(0.010807149)
  rower.handleRotationImpulse(0.0110626)
  rower.handleRotationImpulse(0.011090787)
  rower.handleRotationImpulse(0.011099509)
  rower.handleRotationImpulse(0.011131862)
  rower.handleRotationImpulse(0.011209919)
  testStrokeState(rower, 'Recovery')
  testTotalMovingTimeSinceStart(rower, 0.24984299900000007)
  testTotalNumberOfStrokes(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testCycleDuration(rower, 0)
  testCycleLinearDistance(rower, 0)
  testCycleLinearVelocity(rower, 0)
  testCyclePower(rower, 0)
  testDriveDuration(rower, 0)
  testDriveLinearDistance(rower, 0)
  testDriveLength(rower, 0)
  testDriveAverageHandleForce(rower, 0)
  testDrivePeakHandleForce(rower, 0)
  testRecoveryDuration(rower, 0)
  testRecoveryDragFactor(rower, 0)
  testInstantHandlePower(rower, 0)
  rower.handleRotationImpulse(0.020769)
  rower.handleRotationImpulse(0.020707554)
  rower.handleRotationImpulse(0.020722165)
  rower.handleRotationImpulse(0.02089567)
  rower.handleRotationImpulse(0.020917504)
  rower.handleRotationImpulse(0.020997969)
  rower.handleRotationImpulse(0.021004655)
  rower.handleRotationImpulse(0.021013618)
  rower.handleRotationImpulse(0.021058193)
  rower.handleRotationImpulse(0.020807149)
  rower.handleRotationImpulse(0.0210626)
  rower.handleRotationImpulse(0.021090787)
  rower.handleRotationImpulse(0.021099509)
  rower.handleRotationImpulse(0.021131862)
  rower.handleRotationImpulse(0.021209919)
  testStrokeState(rower, 'Stopped')
  testTotalMovingTimeSinceStart(rower, 0.4508356267)
  testTotalNumberOfStrokes(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testCycleDuration(rower, 0)
  testCycleLinearDistance(rower, 0)
  testCycleLinearVelocity(rower, 0)
  testCyclePower(rower, 0)
  testDriveDuration(rower, 0)
  testDriveLinearDistance(rower, 0)
  testDriveLength(rower, 0)
  testDriveAverageHandleForce(rower, 0)
  testDrivePeakHandleForce(rower, 0)
  testRecoveryDuration(rower, 0)
  testRecoveryDragFactor(rower, 0)
  testInstantHandlePower(rower, 0)
})

// Test behaviour for noisy upgoing flank

// Test behaviour for noisy downgoing flank

// Test behaviour for noisy stroke

// Test behaviour after reset

// Test behaviour for one datapoint

// Test behaviour for noisy stroke

// Test drag factor calculation

// Test Dynamic stroke detection

// Test behaviour after reset

function testStrokeState (rower, expectedValue) {
  assert.ok(rower.strokeState() === expectedValue, `strokeState should be ${expectedValue} at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.strokeState()}`)
}

function testTotalMovingTimeSinceStart (rower, expectedValue) {
  assert.ok(rower.totalMovingTimeSinceStart() === expectedValue, `totalMovingTimeSinceStart should be ${expectedValue} sec at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.totalMovingTimeSinceStart()}`)
}

function testTotalNumberOfStrokes (rower, expectedValue) {
  assert.ok(rower.totalNumberOfStrokes() === expectedValue, `totalNumberOfStrokes should be ${expectedValue} at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.totalNumberOfStrokes()}`)
}

function testTotalLinearDistanceSinceStart (rower, expectedValue) {
  assert.ok(rower.totalLinearDistanceSinceStart() === expectedValue, `totalLinearDistanceSinceStart should be ${expectedValue} meters at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.totalLinearDistanceSinceStart()}`)
}

function testCycleDuration (rower, expectedValue) {
  assert.ok(rower.cycleDuration() === expectedValue, `cycleDuration should be ${expectedValue} sec at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.cycleDuration()}`)
}

function testCycleLinearDistance (rower, expectedValue) {
  assert.ok(rower.cycleLinearDistance() === expectedValue, `cycleLinearDistance should be ${expectedValue} meters at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.cycleLinearDistance()}`)
}

function testCycleLinearVelocity (rower, expectedValue) {
  assert.ok(rower.cycleLinearVelocity() === expectedValue, `cycleLinearVelocity should be ${expectedValue} m/s at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.cycleLinearVelocity()}`)
}

function testCyclePower (rower, expectedValue) {
  assert.ok(rower.cyclePower() === expectedValue, `cyclePower should be ${expectedValue} Watt at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.cyclePower()}`)
}

function testDriveDuration (rower, expectedValue) {
  assert.ok(rower.driveDuration() === expectedValue, `driveDuration should be ${expectedValue} sec at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.driveDuration()}`)
}

function testDriveLinearDistance (rower, expectedValue) {
  assert.ok(rower.driveLinearDistance() === expectedValue, `driveLinearDistance should be ${expectedValue} meters at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.driveLinearDistance()}`)
}

function testDriveLength (rower, expectedValue) {
  assert.ok(rower.driveLength() === expectedValue, `driveLength should be ${expectedValue} meters at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.driveLength()}`)
}

function testDriveAverageHandleForce (rower, expectedValue) {
  assert.ok(rower.driveAverageHandleForce() === expectedValue, `driveAverageHandleForce should be ${expectedValue} N at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.driveAverageHandleForce()}`)
}

function testDrivePeakHandleForce (rower, expectedValue) {
  assert.ok(rower.drivePeakHandleForce() === expectedValue, `drivePeakHandleForce should be ${expectedValue} N at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.drivePeakHandleForce()}`)
}

function testRecoveryDuration (rower, expectedValue) {
  assert.ok(rower.recoveryDuration() === expectedValue, `recoveryDuration should be ${expectedValue} sec at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.recoveryDuration()}`)
}

function testRecoveryDragFactor (rower, expectedValue) {
  assert.ok(rower.recoveryDragFactor() === expectedValue, `recoveryDragFactor should be ${expectedValue} N*m*s^2 at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.recoveryDragFactor()}`)
}

function testInstantHandlePower (rower, expectedValue) {
  assert.ok(rower.instantHandlePower() === expectedValue, `instantHandlePower should be ${expectedValue} Watt at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.instantHandlePower()}`)
}

test.run()
