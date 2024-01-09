'use strict'
/*
  Open Rowing Monitor, https://github.com/jaapvanekris/openrowingmonitor
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { deepMerge } from '../tools/Helper.js'
import { replayRowingSession } from '../tools/RowingRecorder.js'
import rowerProfiles from '../../config/rowerProfiles.js'

import { createFlywheel } from './Flywheel.js'

const baseConfig = { // Based on Concept 2 settings, as this is the validation system
  numOfImpulsesPerRevolution: 6,
  sprocketRadius: 1.4,
  maximumStrokeTimeBeforePause: 6.0,
  dragFactor: 110,
  autoAdjustDragFactor: true,
  minimumDragQuality: 0.95,
  dragFactorSmoothing: 3,
  minimumTimeBetweenImpulses: 0.005,
  maximumTimeBetweenImpulses: 0.020,
  flankLength: 12,
  smoothing: 1,
  minimumStrokeQuality: 0.36,
  minumumForceBeforeStroke: 10,
  minumumRecoverySlope: 0.00070,
  autoAdjustRecoverySlope: true,
  autoAdjustRecoverySlopeMargin: 0.15,
  minimumDriveTime: 0.40,
  minimumRecoveryTime: 0.90,
  flywheelInertia: 0.1031,
  magicConstant: 2.8
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
  testDragFactor(flywheel, 0.00011)
  testIsDwelling(flywheel, false)
  testIsUnpowered(flywheel, false)
  testIsPowered(flywheel, true)
})

// Test behaviour for one datapoint

// Test behaviour for perfect upgoing flank

// Test behaviour for perfect downgoing flank

// Test behaviour for perfect stroke
test('Correct Flywheel behaviour for a noisefree stroke', () => {
  const flywheel = createFlywheel(baseConfig)
  flywheel.maintainStateAndMetrics()
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  testTorque(flywheel, 0)
  testDragFactor(flywheel, 0.00011)
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
  testDeltaTime(flywheel, 0.011062297)
  testSpinningTime(flywheel, 0.077918634)
  testAngularPosition(flywheel, 8.377580409572781)
  testAngularVelocity(flywheel, 94.76231358849583)
  testAngularAcceleration(flywheel, 28.980404808837132)
  testTorque(flywheel, 3.975668304221995)
  testDragFactor(flywheel, 0.00011)
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
  testDeltaTime(flywheel, 0.010722165)
  testSpinningTime(flywheel, 0.23894732900000007)
  testAngularPosition(flywheel, 24.085543677521745)
  testAngularVelocity(flywheel, 97.13471664858164)
  testAngularAcceleration(flywheel, -29.657593800236377)
  testTorque(flywheel, -2.0198310711803433)
  testDragFactor(flywheel, 0.00011)
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
  testDeltaTime(flywheel, 0.020722165)
  testSpinningTime(flywheel, 0.43343548300000007)
  testAngularPosition(flywheel, 39.79350694547071)
  testAngularVelocity(flywheel, 50.71501160141977)
  testAngularAcceleration(flywheel, -159.90034506799844)
  testTorque(flywheel, -16.202804212320103)
  testDragFactor(flywheel, 0.00011)
  testIsDwelling(flywheel, true)
  testIsUnpowered(flywheel, true)
  testIsPowered(flywheel, false)
})

// Test behaviour for noisy upgoing flank

// Test behaviour for noisy downgoing flank

// Test behaviour for noisy stroke

// Test drag factor calculation

// Test Dynamic stroke detection

// Test behaviour for not maintaining metrics
test('Correct Flywheel behaviour at maintainStateOnly', () => {
  const flywheel = createFlywheel(baseConfig)
  flywheel.maintainStateAndMetrics()
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  testTorque(flywheel, 0)
  testDragFactor(flywheel, 0.00011)
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
  testDragFactor(flywheel, 0.00011)
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
  testDragFactor(flywheel, 0.00011)
  testIsDwelling(flywheel, false)
  testIsUnpowered(flywheel, true)
  testIsPowered(flywheel, false)
})

test('Correct Flywheel behaviour with a SportsTech WRX700', async () => {
  const flywheel = createFlywheel(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700))
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testDragFactor(flywheel, (rowerProfiles.Sportstech_WRX700.dragFactor / 1000000))
  flywheel.maintainStateAndMetrics()

  // Inject 16 strokes
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
  flywheel.maintainStateAndMetrics()

  // Inject 10 strokes
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
  flywheel.maintainStateAndMetrics()

  // Inject 10 strokes
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
  flywheel.maintainStateAndMetrics()

  // Inject 846 strokes
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

  testSpinningTime(flywheel, 591.0432650000008)
  testAngularPosition(flywheel, 65961.92655232249)
  // As we don't detect strokes here (this is a function of Rower.js, the dragcalculation shouldn't be triggered
  testDragFactor(flywheel, (rowerProfiles.Concept2_RowErg.dragFactor / 1000000))
})

// Test behaviour after reset

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

function testIsDwelling (flywheel, expectedValue) {
  assert.ok(flywheel.isDwelling() === expectedValue, `isDwelling should be ${expectedValue} at ${flywheel.spinningTime()} sec, is ${flywheel.isDwelling()}`)
}

function testIsUnpowered (flywheel, expectedValue) {
  assert.ok(flywheel.isUnpowered() === expectedValue, `isUnpowered should be ${expectedValue} at ${flywheel.spinningTime()} sec, is ${flywheel.isUnpowered()}`)
}

function testIsPowered (flywheel, expectedValue) {
  assert.ok(flywheel.isPowered() === expectedValue, `isPowered should be ${expectedValue} at ${flywheel.spinningTime()} sec, is ${flywheel.isPowered()}`)
}

/*
function reportAll (flywheel) {
  assert.ok(0, `deltaTime: ${flywheel.deltaTime()}, spinningTime: ${flywheel.spinningTime()}, ang. pos: ${flywheel.angularPosition()}, ang. vel: ${flywheel.angularVelocity()}, Ang. acc: ${flywheel.angularAcceleration()}, Torque: ${flywheel.torque()}, DF: ${flywheel.dragFactor()}`)
}
*/

test.run()
