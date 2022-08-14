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
  minumumRecoverySlope: 0.7,
  autoAdjustRecoverySlope: true,
  autoAdjustRecoverySlopeMargin: 0.10,
  minumumForceBeforeStroke: 50,
  minimumRecoveryTime: 2,
  minimumTimeBetweenImpulses: 0.05,
  maximumTimeBetweenImpulses: 0.1,
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
  assert.ok(flywheel.angularVelocity() === 0, `Angular Velocity should be 0 Radians/sec, is ${flywheel.angularVelocity()}`)
  assert.ok(flywheel.angularAcceleration() === 0, `Angular Acceleration should be 0 Radians/sec^2, is ${flywheel.angularAcceleration()}`)
  assert.ok(flywheel.torque() === 0, `Torque should be 0 N/M, is ${flywheel.torque()}`)
  assert.ok(flywheel.dragFactor() === 0.0001, `Drag Factor should be 0.0001 N*m*s2, is ${flywheel.dragFactor()}`)
  assert.ok(flywheel.isDwelling() === false, `isDwelling should be false, is ${flywheel.isDwelling()}`)
  assert.ok(flywheel.isUnpowered() === false, `isUnpowered should be false, is ${flywheel.isUnpowered()}`)
  assert.ok(flywheel.isPowered() === true, `isPowered should be true, is ${flywheel.isPowered()}`)
})

// Test behaviour for one datapoint

// Test behaviour for perfect upgoing flank

// Test behaviour for perfect downgoing flank

// Test behaviour for perfect stroke

// Test behaviour for noisy upgoing flank

// Test behaviour for noisy downgoing flank

// Test behaviour for noisy stroke

// Test behaviour for not maintaining metrics
test('Correct Flywheel behaviour at maintainStateOnly', () => {
  const flywheel = createFlywheel(baseConfig)
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  assert.ok(flywheel.angularVelocity() === 0, `Angular Velocity should be 0 Radians/sec, is ${flywheel.angularVelocity()}`)
  assert.ok(flywheel.angularAcceleration() === 0, `Angular Acceleration should be 0 Radians/sec^2, is ${flywheel.angularAcceleration()}`)
  assert.ok(flywheel.torque() === 0, `Torque should be 0 N/M, is ${flywheel.torque()}`)
  assert.ok(flywheel.dragFactor() === 0.0001, `Drag Factor should be 0.0001 N*m*s2, is ${flywheel.dragFactor()}`)
  assert.ok(flywheel.isDwelling() === false, `isDwelling should be false, is ${flywheel.isDwelling()}`)
  assert.ok(flywheel.isUnpowered() === false, `isUnpowered should be false, is ${flywheel.isUnpowered()}`)
  assert.ok(flywheel.isPowered() === true, `isPowered should be true, is ${flywheel.isPowered()}`)
  flywheel.maintainStateOnly()
  flywheel.pushValue(0.011081761)
  flywheel.pushValue(0.011062297)
  flywheel.pushValue(0.011082613)
  flywheel.pushValue(0.01116456)
  flywheel.pushValue(0.011221636)
  flywheel.pushValue(0.011175504)
  flywheel.pushValue(0.010919756)
  flywheel.pushValue(0.01086431)
  flywheel.pushValue(0.011051853)
  flywheel.pushValue(0.010648619)
  flywheel.pushValue(0.010973313)
  flywheel.pushValue(0.011130263)
  flywheel.pushValue(0.010386684)
  flywheel.pushValue(0.010526151)
  flywheel.pushValue(0.010536818)
  flywheel.pushValue(0.010511225)
  flywheel.pushValue(0.010653396)
  flywheel.pushValue(0.010800864)
  flywheel.pushValue(0.010956987)
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  assert.ok(flywheel.angularVelocity() === 0, `Angular Velocity should remain 0 Radians/sec, is ${flywheel.angularVelocity()}`)
  assert.ok(flywheel.angularAcceleration() === 0, `Angular Acceleration should remain 0 Radians/sec^2, is ${flywheel.angularAcceleration()}`)
  assert.ok(flywheel.torque() === 0, `Torque should remain 0 N/M, is ${flywheel.torque()}`)
  assert.ok(flywheel.dragFactor() === 0.0001, `Drag Factor should remain 0.0001 N*m*s2, is ${flywheel.dragFactor()}`)
  assert.ok(flywheel.isDwelling() === false, `isDwelling (2) should be false, is ${flywheel.isDwelling()}`)
  assert.ok(flywheel.isUnpowered() === false, `isUnpowered should be false, is ${flywheel.isUnpowered()}`)
  assert.ok(flywheel.isPowered() === true, `isPowered should be true, is ${flywheel.isPowered()}`)
  flywheel.pushValue(0.01089567)
  flywheel.pushValue(0.010917504)
  flywheel.pushValue(0.011058193)
  flywheel.pushValue(0.011131862)
  flywheel.pushValue(0.011209919)
  flywheel.pushValue(0.011013618)
  flywheel.pushValue(0.0110626)
  flywheel.pushValue(0.010997969)
  flywheel.pushValue(0.011004655)
  flywheel.pushValue(0.011090787)
  flywheel.pushValue(0.011099509)
  flywheel.pushValue(0.010807149)
  flywheel.pushValue(0.010707554)
  flywheel.pushValue(0.010722165)
  flywheel.pushValue(0.010769)
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  assert.ok(flywheel.angularVelocity() === 0, `Angular Velocity should remain 0 Radians/sec, is ${flywheel.angularVelocity()}`)
  assert.ok(flywheel.angularAcceleration() === 0, `Angular Acceleration should remain 0 Radians/sec^2, is ${flywheel.angularAcceleration()}`)
  assert.ok(flywheel.torque() === 0, `Torque should remain 0 N/M, is ${flywheel.torque()}`)
  assert.ok(flywheel.dragFactor() === 0.0001, `Drag Factor should remain 0.0001 N*m*s2, is ${flywheel.dragFactor()}`)
  assert.ok(flywheel.isDwelling() === false, `isDwelling (3) should be false, is ${flywheel.isDwelling()}`)
  assert.ok(flywheel.isUnpowered() === true, `isUnpowered should be false, is ${flywheel.isUnpowered()}`)
  assert.ok(flywheel.isPowered() === false, `isPowered should be true, is ${flywheel.isPowered()}`)
})

// Test behaviour after reset

function testDeltaTime (flywheel, expectedValue) {
  assert.ok(flywheel.deltaTime() === expectedValue, `deltaTime should be ${expectedValue} sec at flywheel.spinningTime() sec, is ${flywheel.deltaTime()}`)
}

function testSpinningTime (flywheel, expectedValue) {
  assert.ok(flywheel.spinningTime() === expectedValue, `spinningTime should be ${expectedValue} sec at flywheel.spinningTime() sec, is ${flywheel.spinningTime()}`)
}

function testAngularPosition (flywheel, expectedValue) {
  assert.ok(flywheel.angularPosition() === expectedValue, `angularPosition should be ${expectedValue} Radians at flywheel.spinningTime() sec, is ${flywheel.angularPosition()}`)
}

test.run()
