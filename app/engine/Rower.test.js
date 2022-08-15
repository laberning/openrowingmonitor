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

// Test behaviour for three perfect identical strokes, including settingling behaviour of metrics
test('Correct Rower behaviour for three noisefree strokes', () => {
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
  // Drive initial stroke starts here
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
  testCycleLinearDistance(rower, 0.31037384539231255)
  testCycleLinearVelocity(rower, 0) // Shouldn't this one be filled after the first drive?
  testCyclePower(rower, 0) // Shouldn't this one be filled after the first drive?
  testDriveDuration(rower, 0) // Shouldn't this one be filled after the first drive?
  testDriveLinearDistance(rower, 0.31037384539231255)
  testDriveLength(rower, 0) // Shouldn't this one be filled after the first drive?
  testDriveAverageHandleForce(rower, 137.03899089057128)
  testDrivePeakHandleForce(rower, 148.21599460366207)
  testRecoveryDuration(rower, 0)
  testRecoveryDragFactor(rower, 100)
  testInstantHandlePower(rower, 281.27434724439394)
  // Recovery initial stroke starts here
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
  testTotalLinearDistanceSinceStart(rower, 0.8276635877128334)
  testCycleDuration(rower, 0.143485717)
  testCycleLinearDistance(rower, 0.8276635877128334)
  testCycleLinearVelocity(rower, 3.364821039986529)
  testCyclePower(rower, 0)
  testDriveDuration(rower, 0.143485717)
  testDriveLinearDistance(rower, 0.48280375949915283)
  testDriveLength(rower, 0.29321531433504733)
  testDriveAverageHandleForce(rower, 150.17083984007644)
  testDrivePeakHandleForce(rower, 202.43126572577572)
  testRecoveryDuration(rower, 0)
  testRecoveryDragFactor(rower, 100)
  testInstantHandlePower(rower, 0)
  // Drive seconds stroke starts here
  rower.handleRotationImpulse(0.011221636)
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
  testTotalMovingTimeSinceStart(rower, 0.46020725100000004)
  testTotalLinearDistanceSinceStart(rower, 1.5369732812411068)
  testTotalNumberOfStrokes(rower, 1)
  testTotalLinearDistanceSinceStart(rower, 1.5369732812411068)
  testCycleDuration(rower, 0.415928727)
  testCycleLinearDistance(rower, 1.054169521741954)
  testCycleLinearVelocity(rower, 3.233614902568041)
  testCyclePower(rower, 94.67229918305185)
  testDriveDuration(rower, 0.143485717)
  testDriveLinearDistance(rower, 0.1920199512077526)
  testDriveLength(rower, 0.29321531433504733)
  testDriveAverageHandleForce(rower, 135.1539916297626)
  testDrivePeakHandleForce(rower, 213.08591529407013)
  testRecoveryDuration(rower, 0.27244301)
  testRecoveryDragFactor(rower, 269.73125212721015)
  testInstantHandlePower(rower, 404.16488453885546)
  // Recovery second stroke starts here
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
  testTotalMovingTimeSinceStart(rower, 0.6210797630000001)
  testTotalNumberOfStrokes(rower, 1)
  testTotalLinearDistanceSinceStart(rower, 2.2570480982701784)
  testCycleDuration(rower, 0.3818901600000001)
  testCycleLinearDistance(rower, 0.9120947682368242)
  testCycleLinearVelocity(rower, 4.399627822481296)
  testCyclePower(rower, 238.4546801226091)
  testDriveDuration(rower, 0.1094471500000001)
  testDriveLinearDistance(rower, 0.4800498780193813)
  testDriveLength(rower, 0.2094395102393196)
  testDriveAverageHandleForce(rower, 193.82556307418187)
  testDrivePeakHandleForce(rower, 303.2433563085232)
  testRecoveryDuration(rower, 0.27244301)
  testRecoveryDragFactor(rower, 269.73125212721015)
  testInstantHandlePower(rower, 0)
  // Drive third stroke starts here
  rower.handleRotationImpulse(0.011221636)
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
  testTotalMovingTimeSinceStart(rower, 0.8314440150000004)
  testTotalLinearDistanceSinceStart(rower, 3.173108196370115)
  testTotalNumberOfStrokes(rower, 2)
  testCycleDuration(rower, 0.36010650100000036)
  testCycleLinearDistance(rower, 1.3481049883173792)
  testCycleLinearVelocity(rower, 4.399155786037744)
  testCyclePower(rower, 94.67229918305185)
  testDriveDuration(rower, 0.143485717)
  testDriveLinearDistance(rower, 0.1920199512077526)
  testDriveLength(rower, 0.29321531433504733)
  testDriveAverageHandleForce(rower, 135.1539916297626)
  testDrivePeakHandleForce(rower, 213.08591529407013)
  testRecoveryDuration(rower, 0.27244301)
  testRecoveryDragFactor(rower, 269.73125212721015)
  testInstantHandlePower(rower, 404.16488453885546)
  // Recovery third stroke starts here
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
  testTotalMovingTimeSinceStart(rower, 0.6210797630000001)
  testTotalNumberOfStrokes(rower, 2)
  testTotalLinearDistanceSinceStart(rower, 2.2570480982701784)
  testCycleDuration(rower, 0.3818901600000001)
  testCycleLinearDistance(rower, 0.9120947682368242)
  testCycleLinearVelocity(rower, 4.399627822481296)
  testCyclePower(rower, 238.4546801226091)
  testDriveDuration(rower, 0.1094471500000001)
  testDriveLinearDistance(rower, 0.4800498780193813)
  testDriveLength(rower, 0.2094395102393196)
  testDriveAverageHandleForce(rower, 193.82556307418187)
  testDrivePeakHandleForce(rower, 303.2433563085232)
  testRecoveryDuration(rower, 0.27244301)
  testRecoveryDragFactor(rower, 269.73125212721015)
  testInstantHandlePower(rower, 0)
  // Dwelling state starts here
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
  testStrokeState(rower, 'WaitingForDrive')
  testTotalMovingTimeSinceStart(rower, 0.7424735280000003)
  testTotalNumberOfStrokes(rower, 1)
  testTotalLinearDistanceSinceStart(rower, 2.785102964091498)
  testCycleDuration(rower, 0.32654480100000033)
  testCycleLinearDistance(rower, 1.4401496340581437)
  testCycleLinearVelocity(rower, 4.410266614712209)
  testCyclePower(rower, 240.18869668977658)
  testDriveDuration(rower, 0.1094471500000001)
  testDriveLinearDistance(rower, 0.4800498780193813)
  testDriveLength(rower, 0.2094395102393196)
  testDriveAverageHandleForce(rower, 193.82556307418187)
  testDrivePeakHandleForce(rower, 303.2433563085232)
  testRecoveryDuration(rower, 0.21709765100000022)
  testRecoveryDragFactor(rower, 269.73125212721015)
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
