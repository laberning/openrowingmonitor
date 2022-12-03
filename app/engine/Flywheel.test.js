'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { deepMerge } from '../tools/Helper.js'
import { replayRowingSession } from '../tools/RowingRecorder.js'
import rowerProfiles from '../../config/rowerProfiles.js'

import { createFlywheel } from './Flywheel.js'

const baseConfig = {
  numOfImpulsesPerRevolution: 6,
  smoothing: 1,
  flankLength: 11,
  minimumStrokeQuality: 0.30,
  minumumRecoverySlope: 0,
  autoAdjustRecoverySlope: true,
  autoAdjustRecoverySlopeMargin: 0.10,
  minumumForceBeforeStroke: 50,
  minimumRecoveryTime: 2,
  minimumTimeBetweenImpulses: 0.005,
  maximumTimeBetweenImpulses: 0.02,
  autoAdjustDragFactor: true,
  dragFactorSmoothing: 3,
  dragFactor: 100,
  minimumDragQuality: 0.83,
  flywheelInertia: 0.1,
  sprocketRadius: 2
}

// Test behaviour for no datapoints
test('Correct Flywheel behaviour at initialisation', () => {
  const flywheel = createFlywheel(baseConfig)
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  testTorque(flywheel, 0)
  testDragFactor(flywheel, 0.0001)
  testIsDwelling(flywheel, false)
  testIsUnpowered(flywheel, false)
  testIsPowered(flywheel, true)
})

// Test behaviour for one datapoint
// ToDo: Add additional test for testing the behaviour after a single datapoint

// Test behaviour for perfect upgoing flank
// ToDo: Add additional test to test isDwelling, isUnpowered and isPowered with an upgoing flank

// Test behaviour for perfect downgoing flank
// ToDo: Add additional test to test isDwelling, isUnpowered and isPowered with an downgoing flank

// Test behaviour for perfect stroke
test('Correct Flywheel behaviour for a noisefree stroke', () => {
  const flywheel = createFlywheel(baseConfig)
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  testTorque(flywheel, 0)
  testDragFactor(flywheel, 0.0001)
  testIsDwelling(flywheel, false)
  testIsUnpowered(flywheel, false)
  testIsPowered(flywheel, true)
  flywheel.pushValue(0.011221636)
  flywheel.pushValue(0.011175504)
  flywheel.pushValue(0.01116456)
  flywheel.pushValue(0.011130263)
  flywheel.pushValue(0.011082613)
  flywheel.pushValue(0.011081761)
  flywheel.pushValue(0.011062297)
  flywheel.pushValue(0.011051853)
  flywheel.pushValue(0.010973313)
  testIsAboveMinimumSpeed(flywheel, false)
  flywheel.pushValue(0.010919756)
  testIsAboveMinimumSpeed(flywheel, true)
  flywheel.maintainStateAndMetrics()
  flywheel.pushValue(0.01086431)
  testIsAboveMinimumSpeed(flywheel, true)
  flywheel.pushValue(0.010800864)
  flywheel.pushValue(0.010956987)
  flywheel.pushValue(0.010653396)
  flywheel.pushValue(0.010648619)
  flywheel.pushValue(0.010536818)
  flywheel.pushValue(0.010526151)
  flywheel.pushValue(0.010511225)
  flywheel.pushValue(0.010386684)
  testDeltaTime(flywheel, 0.011051853)
  testSpinningTime(flywheel, 0.088970487)
  testAngularPosition(flywheel, 9.42477796076938)
  testAngularVelocity(flywheel, 95.26126661773489)
  testAngularAcceleration(flywheel, 23.690349229418256)
  testTorque(flywheel, 3.276505814703343)
  testDragFactor(flywheel, 0.0001)
  testIsDwelling(flywheel, false)
  testIsUnpowered(flywheel, false)
  testIsPowered(flywheel, true)
  flywheel.pushValue(0.010769)
  flywheel.pushValue(0.010707554)
  flywheel.pushValue(0.010722165)
  flywheel.pushValue(0.01089567)
  flywheel.pushValue(0.010917504)
  flywheel.pushValue(0.010997969)
  flywheel.pushValue(0.011004655)
  flywheel.pushValue(0.011013618)
  flywheel.pushValue(0.011058193)
  flywheel.pushValue(0.010807149)
  flywheel.pushValue(0.0110626)
  flywheel.pushValue(0.011090787)
  flywheel.pushValue(0.011099509)
  flywheel.pushValue(0.011131862)
  flywheel.pushValue(0.011209919)
  testDeltaTime(flywheel, 0.01089567)
  testSpinningTime(flywheel, 0.24984299900000007)
  testAngularPosition(flywheel, 25.132741228718345)
  testAngularVelocity(flywheel, 96.59818534009558)
  testAngularAcceleration(flywheel, -28.68758647905641)
  testTorque(flywheel, -1.9356377068056956)
  testDragFactor(flywheel, 0.0001)
  testIsDwelling(flywheel, false)
  testIsUnpowered(flywheel, true)
  testIsPowered(flywheel, false)
  flywheel.pushValue(0.020769)
  flywheel.pushValue(0.020707554)
  flywheel.pushValue(0.020722165)
  flywheel.pushValue(0.02089567)
  flywheel.pushValue(0.020917504)
  flywheel.pushValue(0.020997969)
  flywheel.pushValue(0.021004655)
  flywheel.pushValue(0.021013618)
  flywheel.pushValue(0.021058193)
  flywheel.pushValue(0.020807149)
  flywheel.pushValue(0.0210626)
  flywheel.pushValue(0.021090787)
  flywheel.pushValue(0.021099509)
  flywheel.pushValue(0.021131862)
  flywheel.pushValue(0.021209919)
  testDeltaTime(flywheel, 0.02089567)
  testSpinningTime(flywheel, 0.45433115300000004)
  testAngularPosition(flywheel, 40.84070449666731)
  testAngularVelocity(flywheel, 88.98063578530606)
  testAngularAcceleration(flywheel, -25.426721357529768)
  testTorque(flywheel, -1.750916781277248)
  testDragFactor(flywheel, 0.0001)
  testIsDwelling(flywheel, true)
  testIsUnpowered(flywheel, true)
  testIsPowered(flywheel, false)
})

// Test behaviour for noisy upgoing flank
// ToDo: Add additional test to test isDwelling, isUnpowered and isPowered with an upgoing flank

// Test behaviour for noisy downgoing flank
// ToDo: Add additional test to test isDwelling, isUnpowered and isPowered with an downgoing flank

// Test behaviour for noisy stroke
// ToDo: Add additional test to test isDwelling, isUnpowered and isPowered with an upgoing and downgoing flank

// Test drag factor calculation
// ToDo: Add additional test to test dragfactor calculation

// Test Dynamic stroke detection
// ToDo: Add additional test to test isDwelling, isUnpowered and isPowered with an upgoing and downgoing flank with dynamic stroke detection

// Test behaviour for not maintaining metrics
test('Correct Flywheel behaviour at maintainStateOnly', () => {
  const flywheel = createFlywheel(baseConfig)
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  testTorque(flywheel, 0)
  testDragFactor(flywheel, 0.0001)
  testIsDwelling(flywheel, false)
  testIsUnpowered(flywheel, false)
  testIsPowered(flywheel, true)
  flywheel.maintainStateOnly()
  flywheel.pushValue(0.011221636)
  flywheel.pushValue(0.011175504)
  flywheel.pushValue(0.01116456)
  flywheel.pushValue(0.011130263)
  flywheel.pushValue(0.011082613)
  flywheel.pushValue(0.011081761)
  flywheel.pushValue(0.011062297)
  flywheel.pushValue(0.011051853)
  flywheel.pushValue(0.010973313)
  flywheel.pushValue(0.010919756)
  flywheel.pushValue(0.01086431)
  flywheel.pushValue(0.010800864)
  flywheel.pushValue(0.010956987)
  flywheel.pushValue(0.010653396)
  flywheel.pushValue(0.010648619)
  flywheel.pushValue(0.010536818)
  flywheel.pushValue(0.010526151)
  flywheel.pushValue(0.010511225)
  flywheel.pushValue(0.010386684)
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  testTorque(flywheel, 0)
  testDragFactor(flywheel, 0.0001)
  testIsDwelling(flywheel, false)
  testIsUnpowered(flywheel, false)
  testIsPowered(flywheel, true)
  flywheel.pushValue(0.010769)
  flywheel.pushValue(0.010707554)
  flywheel.pushValue(0.010722165)
  flywheel.pushValue(0.01089567)
  flywheel.pushValue(0.010917504)
  flywheel.pushValue(0.010997969)
  flywheel.pushValue(0.011004655)
  flywheel.pushValue(0.011013618)
  flywheel.pushValue(0.011058193)
  flywheel.pushValue(0.010807149)
  flywheel.pushValue(0.0110626)
  flywheel.pushValue(0.011090787)
  flywheel.pushValue(0.011099509)
  flywheel.pushValue(0.011131862)
  flywheel.pushValue(0.011209919)
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  testTorque(flywheel, 0)
  testDragFactor(flywheel, 0.0001)
  testIsDwelling(flywheel, false)
  testIsUnpowered(flywheel, true)
  testIsPowered(flywheel, false)
})

test('Correct Flywheel behaviour with a SportsTech WRX700', async () => {
  const flywheel = createFlywheel(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700))
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testDragFactor(flywheel, (rowerProfiles.Sportstech_WRX700.dragFactor / 1000000))

  // Inject 16 strokes
  flywheel.maintainStateAndMetrics()
  await replayRowingSession(flywheel.pushValue, { filename: 'recordings/WRX700_2magnets.csv', realtime: false, loop: false })
  testSpinningTime(flywheel, 46.302522627)
  testAngularPosition(flywheel, 741.4158662471912)
  testDragFactor(flywheel, (rowerProfiles.Sportstech_WRX700.dragFactor / 1000000))
})

test('Correct Flywheel behaviour with a DKN R-320', async () => {
  const flywheel = createFlywheel(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.DKN_R320))
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testDragFactor(flywheel, (rowerProfiles.DKN_R320.dragFactor / 1000000))

  // Inject 10 strokes
  flywheel.maintainStateAndMetrics()
  await replayRowingSession(flywheel.pushValue, { filename: 'recordings/DKNR320.csv', realtime: false, loop: false })

  testSpinningTime(flywheel, 22.249536391000003)
  testAngularPosition(flywheel, 496.37163926718733)
  // As dragfactor is static, it should remain the same
  testDragFactor(flywheel, (rowerProfiles.DKN_R320.dragFactor / 1000000))
})

test('Correct Flywheel behaviour with a NordicTrack RX800', async () => {
  const flywheel = createFlywheel(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.NordicTrack_RX800))
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testDragFactor(flywheel, (rowerProfiles.NordicTrack_RX800.dragFactor / 1000000))

  // Inject 10 strokes
  flywheel.maintainStateAndMetrics()
  await replayRowingSession(flywheel.pushValue, { filename: 'recordings/RX800.csv', realtime: false, loop: false })

  testSpinningTime(flywheel, 22.65622640199999)
  testAngularPosition(flywheel, 1446.7034169780998)
  // As we don't detect strokes here (this is a function of Rower.js, the dragcalculation shouldn't be triggered
  testDragFactor(flywheel, (rowerProfiles.NordicTrack_RX800.dragFactor / 1000000))
})

test('Correct Flywheel behaviour with a full session on a SportsTech WRX700', async () => {
  const flywheel = createFlywheel(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700))
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testDragFactor(flywheel, (rowerProfiles.Sportstech_WRX700.dragFactor / 1000000))

  // Inject 846 strokes
  flywheel.maintainStateAndMetrics()
  await replayRowingSession(flywheel.pushValue, { filename: 'recordings/WRX700_2magnets_session.csv', realtime: false, loop: false })
  testSpinningTime(flywheel, 2342.741183077012)
  testAngularPosition(flywheel, 37337.82868791469)
  // The dragfactor should remain static
  testDragFactor(flywheel, (rowerProfiles.Sportstech_WRX700.dragFactor / 1000000))
})

test('A full session for a Concept2 RowErg should produce plausible results', async () => {
  const flywheel = createFlywheel(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Concept2_RowErg))
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testDragFactor(flywheel, (rowerProfiles.Concept2_RowErg.dragFactor / 1000000))

  flywheel.maintainStateAndMetrics()
  await replayRowingSession(flywheel.pushValue, { filename: 'recordings/Concept2_RowErg_Session_2000meters.csv', realtime: false, loop: false })

  testSpinningTime(flywheel, 476.21730295999913)
  testAngularPosition(flywheel, 55767.458391423614)
  // As we don't detect strokes here (this is a function of Rower.js, the dragcalculation shouldn't be triggered
  testDragFactor(flywheel, (rowerProfiles.Concept2_RowErg.dragFactor / 1000000))
})

// Test behaviour after reset
// ToDo: Add additional test to test isDwelling, isUnpowered and isPowered after a reset

function testDeltaTime (flywheel, expectedValue) {
  assert.ok(flywheel.deltaTime() === expectedValue, `deltaTime should be ${expectedValue} sec at ${flywheel.spinningTime()} sec, is ${flywheel.deltaTime()}`)
}

function testSpinningTime (flywheel, expectedValue) {
  assert.ok(flywheel.spinningTime() === expectedValue, `spinningTime should be ${expectedValue} sec at ${flywheel.spinningTime()} sec, is ${flywheel.spinningTime()}`)
}

function testAngularPosition (flywheel, expectedValue) {
  assert.ok(flywheel.angularPosition() === expectedValue, `angularPosition should be ${expectedValue} Radians at ${flywheel.spinningTime()} sec, is ${flywheel.angularPosition()}`)
}

function testAngularVelocity (flywheel, expectedValue) {
  assert.ok(flywheel.angularVelocity() === expectedValue, `angularVelocity should be ${expectedValue} Radians/sec at ${flywheel.spinningTime()} sec, is ${flywheel.angularVelocity()}`)
}

function testAngularAcceleration (flywheel, expectedValue) {
  assert.ok(flywheel.angularAcceleration() === expectedValue, `angularAcceleration should be ${expectedValue} Radians/sec^2 at ${flywheel.spinningTime()} sec, is ${flywheel.angularAcceleration()}`)
}

function testTorque (flywheel, expectedValue) {
  assert.ok(flywheel.torque() === expectedValue, `Torque should be ${expectedValue} N/M at ${flywheel.spinningTime()} sec, is ${flywheel.torque()}`)
}

function testDragFactor (flywheel, expectedValue) {
  assert.ok(flywheel.dragFactor() === expectedValue, `Drag Factor should be ${expectedValue} N*m*s^2 at ${flywheel.spinningTime()} sec, is ${flywheel.dragFactor()}`)
}

function testIsAboveMinimumSpeed (flywheel, expectedValue) {
  assert.ok(flywheel.isAboveMinimumSpeed() === expectedValue, `isAboveMinimumSpeed should be ${expectedValue} at ${flywheel.spinningTime()} sec, is ${flywheel.isAboveMinimumSpeed()}`)
}

function testIsDwelling (flywheel, expectedValue) {
  assert.ok(flywheel.isDwelling() === expectedValue, `isDwelling should be ${expectedValue} at ${flywheel.spinningTime()} sec, is ${flywheel.isDwelling()}`)
}

function testIsUnpowered (flywheel, expectedValue) {
  assert.ok(flywheel.isUnpowered() === expectedValue, `isUnpowered should be ${expectedValue} at ${flywheel.spinningTime()} sec, is ${flywheel.isUnpowered()}`)
}

function testIsPowered (flywheel, expectedValue) {
  assert.ok(flywheel.isPowered() === expectedValue, `isPowered should be ${expectedValue} at ${flywheel.spinningTime()} sec, is ${flywheel.isPowered()}`)
}

test.run()
