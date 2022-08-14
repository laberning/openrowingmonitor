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
  assert.ok(flywheel.deltaTime() === 0, `deltaTime should be 0 sec, is ${flywheel.deltaTime()}`)
  assert.ok(flywheel.spinningTime() === 0, `spinningTime should be 0 sec, is ${flywheel.spinningTime()}`)
  assert.ok(flywheel.angularPosition() === 0, `Angular Position should be 0 Radians, is ${flywheel.angularPosition()}`)
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

// Test behaviour after reset

test.run()
