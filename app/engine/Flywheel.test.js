'use strict'
/*
  Open Rowing Monitor, https://github.com/jaapvanekris/openrowingmonitor
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { createFlywheel } from './Flywheel.js'

const baseConfig = {
  numOfImpulsesPerRevolution: 6,
  flankLength: 11,
  numberOfErrorsAllowed: 2,
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

// Test behaviour for perfect upgoing flank

// Test behaviour for perfect downgoing flank

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
  testDeltaTime(flywheel, 0.011051853)
  testSpinningTime(flywheel, 0.088970487)
  testAngularPosition(flywheel, 9.42477796076938)
  testAngularVelocity(flywheel, 94.88455249645972)
  testAngularAcceleration(flywheel, 20.298978842831396)
  testTorque(flywheel, 2.9302057145284817)
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
  testAngularVelocity(flywheel, 97.07271474918261) // This one is just weird, as it is faster than the end of the drive
  testAngularAcceleration(flywheel, -30.17863526547285)
  testTorque(flywheel, -2.0755523316696673)
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
  testSpinningTime(flywheel, 0.4508356267)
  testAngularPosition(flywheel, 40.84070449666731)
  testAngularVelocity(flywheel, 76.06032067978344)
  testAngularAcceleration(flywheel, -28.74116734735154)
  testTorque(flywheel, -2.2955994965440047)
  testDragFactor(flywheel, 0.0001)
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

test.run()
