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

// Test behaviour for not maintaining metrics
test('Correct Flywheel behaviour at initialisation', () => {
  const flywheel = createFlywheel(baseConfig)
  flywheel.maintainStateOnly()
  flywheel.push(0)
  flywheel.push(0.011081761)
  flywheel.push(0.022144058)
  flywheel.push(0.033226671)
  flywheel.push(0.044391231)
  flywheel.push(0.055612867)
  flywheel.push(0.066788371)
  flywheel.push(0.077708127)
  flywheel.push(0.088572437)
  flywheel.push(0.09962429)
  flywheel.push(0.110272909)
  flywheel.push(0.121246222)
  flywheel.push(0.132376485)
  flywheel.push(0.142763169)
  flywheel.push(0.15328932)
  flywheel.push(0.163826138)
  flywheel.push(0.174337363)
  flywheel.push(0.184990759)
  flywheel.push(0.195510874)
  flywheel.push(0.205921522)
  flywheel.push(0.216005901)
  assert.ok(flywheel.deltaTime() === 0, `deltaTime should remain 0 sec, is ${flywheel.deltaTime()}`)
  assert.ok(flywheel.spinningTime() === 0, `spinningTime should remain 0 sec, is ${flywheel.spinningTime()}`)
  assert.ok(flywheel.angularPosition() === 0, `Angular Position should remain 0 Radians, is ${flywheel.angularPosition()}`)
  assert.ok(flywheel.angularVelocity() === 0, `Angular Velocity should remain 0 Radians/sec, is ${flywheel.angularVelocity()}`)
  assert.ok(flywheel.angularAcceleration() === 0, `Angular Acceleration should remain 0 Radians/sec^2, is ${flywheel.angularAcceleration()}`)
  assert.ok(flywheel.torque() === 0, `Torque should remain 0 N/M, is ${flywheel.torque()}`)
  assert.ok(flywheel.dragFactor() === 0.0001, `Drag Factor should remain 0.0001 N*m*s2, is ${flywheel.dragFactor()}`)
  assert.ok(flywheel.isDwelling() === false, `isDwelling should be false, is ${flywheel.isDwelling()}`)
  assert.ok(flywheel.isUnpowered() === false, `isUnpowered should be false, is ${flywheel.isUnpowered()}`)
  assert.ok(flywheel.isPowered() === true, `isPowered should be true, is ${flywheel.isPowered()}`)
  flywheel.push(0.226370642)
  flywheel.push(0.235877962)
  flywheel.push(0.245496285)
  flywheel.push(0.254945696)
  flywheel.push(0.264341976)
  flywheel.push(0.273785701)
  flywheel.push(0.283392172)
  flywheel.push(0.293037532)
  flywheel.push(0.302636391)
  flywheel.push(0.312148988)
  flywheel.push(0.321509192)
  flywheel.push(0.331006066)
  flywheel.push(0.340566813)
  flywheel.push(0.3502321)
  flywheel.push(0.359980519)
  flywheel.push(0.369596546)
  flywheel.push(0.379089994)
  flywheel.push(0.388719187)
  flywheel.push(0.398553331)
  flywheel.push(0.408067244)
  flywheel.push(0.417839201)
  flywheel.push(0.427500637)
  assert.ok(flywheel.deltaTime() === 0, `deltaTime should remain 0 sec, is ${flywheel.deltaTime()}`)
  assert.ok(flywheel.spinningTime() === 0, `spinningTime should remain 0 sec, is ${flywheel.spinningTime()}`)
  assert.ok(flywheel.angularPosition() === 0, `Angular Position should remain 0 Radians, is ${flywheel.angularPosition()}`)
  assert.ok(flywheel.angularVelocity() === 0, `Angular Velocity should remain 0 Radians/sec, is ${flywheel.angularVelocity()}`)
  assert.ok(flywheel.angularAcceleration() === 0, `Angular Acceleration should remain 0 Radians/sec^2, is ${flywheel.angularAcceleration()}`)
  assert.ok(flywheel.torque() === 0, `Torque should remain 0 N/M, is ${flywheel.torque()}`)
  assert.ok(flywheel.dragFactor() === 0.0001, `Drag Factor should remain 0.0001 N*m*s2, is ${flywheel.dragFactor()}`)
  assert.ok(flywheel.isDwelling() === false, `isDwelling should be false, is ${flywheel.isDwelling()}`)
  assert.ok(flywheel.isUnpowered() === true, `isUnpowered should be false, is ${flywheel.isUnpowered()}`)
  assert.ok(flywheel.isPowered() === false, `isPowered should be true, is ${flywheel.isPowered()}`)

})


// Test behaviour after reset

test.run()
