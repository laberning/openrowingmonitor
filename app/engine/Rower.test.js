'use strict'
/*

  This test is a test of the Rower object, that tests wether this object fills all fields correctly, given one validated rower, (the
  Concept2 RowErg) using a validated cycle of strokes. This thoroughly tests the raw physics of the translation of Angular physics
  to Linear physics. The combination with all possible known rowers is tested when testing the above function RowingStatistics, as
  these statistics are dependent on these settings as well.
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import rowerProfiles from '../../config/rowerProfiles.js'
import { replayRowingSession } from '../tools/RowingRecorder.js'
import { deepMerge } from '../tools/Helper.js'

import { createRower } from './Rower.js'

const baseConfig = {
  numOfImpulsesPerRevolution: 6,
  smoothing: 1,
  flankLength: 11,
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
  testTotalNumberOfStrokes(rower, 0)
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

// Test behaviour for one series of datapoint
// ToDo: add detailed test with a series of datapoints describng a complete stroke

// Test behaviour for three perfect identical strokes, including settingling behaviour of metrics
test('Correct Rower behaviour for three noisefree strokes with dynamic dragfactor and stroke detection', () => {
  const specificConfig = {
    numOfImpulsesPerRevolution: 6,
    smoothing: 1,
    flankLength: 11,
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
  testTotalLinearDistanceSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
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
  testStrokeState(rower, 'WaitingForDrive')
  rower.handleRotationImpulse(0.011175504)
  rower.handleRotationImpulse(0.01116456)
  rower.handleRotationImpulse(0.011130263)
  rower.handleRotationImpulse(0.011082613)
  rower.handleRotationImpulse(0.011081761)
  rower.handleRotationImpulse(0.011062297)
  rower.handleRotationImpulse(0.011051853)
  rower.handleRotationImpulse(0.010973313)
  rower.handleRotationImpulse(0.010919756)
  testStrokeState(rower, 'WaitingForDrive')
  rower.handleRotationImpulse(0.01086431)
  testStrokeState(rower, 'Drive')
  rower.handleRotationImpulse(0.010800864)
  testStrokeState(rower, 'Drive')
  rower.handleRotationImpulse(0.010956987)
  rower.handleRotationImpulse(0.010653396)
  rower.handleRotationImpulse(0.010648619)
  rower.handleRotationImpulse(0.010536818)
  rower.handleRotationImpulse(0.010526151)
  rower.handleRotationImpulse(0.010511225)
  rower.handleRotationImpulse(0.010386684)
  testStrokeState(rower, 'Drive')
  testTotalMovingTimeSinceStart(rower, 0.088970487)
  testTotalLinearDistanceSinceStart(rower, 0.27588786257094444)
  testTotalNumberOfStrokes(rower, 1)
  testCycleDuration(rower, 0.30000000000000004)
  testCycleLinearDistance(rower, 0.27588786257094444)
  testCycleLinearVelocity(rower, 0) // Shouldn't this one be filled after the first drive?
  testCyclePower(rower, 0) // Shouldn't this one be filled after the first drive?
  testDriveDuration(rower, 0) // Shouldn't this one be filled after the first drive?
  testDriveLinearDistance(rower, 0.27588786257094444)
  testDriveLength(rower, 0) // Shouldn't this one be filled after the first drive?
  testDriveAverageHandleForce(rower, 156.0502419475774)
  testDrivePeakHandleForce(rower, 163.82529073516713)
  testRecoveryDuration(rower, 0)
  testRecoveryDragFactor(rower, 100)
  testInstantHandlePower(rower, 312.12409398901383)
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
  testTotalLinearDistanceSinceStart(rower, 0.7931776048914653)
  testTotalNumberOfStrokes(rower, 1)
  testCycleDuration(rower, 0.143485717)
  testCycleLinearDistance(rower, 0.7931776048914653)
  testCycleLinearVelocity(rower, 3.1244766799874912)
  testCyclePower(rower, 0)
  testDriveDuration(rower, 0.143485717)
  testDriveLinearDistance(rower, 0.4483177766777847)
  testDriveLength(rower, 0.2722713633111154)
  testDriveAverageHandleForce(rower, 168.3328229383379)
  testDrivePeakHandleForce(rower, 220.1650887768097)
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
  testTotalLinearDistanceSinceStart(rower, 1.519974294345203)
  testTotalNumberOfStrokes(rower, 2)
  testCycleDuration(rower, 0.404798464)
  testCycleLinearDistance(rower, 1.0716565176674184)
  testCycleLinearVelocity(rower, 3.1521398371477467)
  testCyclePower(rower, 87.69492447163606)
  testDriveDuration(rower, 0.143485717)
  testDriveLinearDistance(rower, 0.24399292995458496)
  testDriveLength(rower, 0.2722713633111154)
  testDriveAverageHandleForce(rower, 156.83996983624334)
  testDrivePeakHandleForce(rower, 227.11541816883516)
  testRecoveryDuration(rower, 0.261312747)
  testRecoveryDragFactor(rower, 283.33086731525583)
  testInstantHandlePower(rower, 431.9361856991374)
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
  testTotalLinearDistanceSinceStart(rower, 2.2519530842089575)
  testTotalNumberOfStrokes(rower, 2)
  testCycleDuration(rower, 0.37123676400000005)
  testCycleLinearDistance(rower, 0.9759717198183395)
  testCycleLinearVelocity(rower, 4.469255430992759)
  testCyclePower(rower, 249.95599708025222)
  testDriveDuration(rower, 0.10992401700000004)
  testDriveLinearDistance(rower, 0.48798585990916965)
  testDriveLength(rower, 0.20943951023931945)
  testDriveAverageHandleForce(rower, 198.5975831180257)
  testDrivePeakHandleForce(rower, 294.6756879669133)
  testRecoveryDuration(rower, 0.261312747)
  testRecoveryDragFactor(rower, 283.33086731525583)
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
  testTotalLinearDistanceSinceStart(rower, 3.17912621803638)
  testTotalNumberOfStrokes(rower, 3)
  testCycleDuration(rower, 0.3376750640000003)
  testCycleLinearDistance(rower, 1.4151589937365927)
  testCycleLinearVelocity(rower, 4.479916721710978)
  testCyclePower(rower, 251.74905786098182)
  testDriveDuration(rower, 0.10992401700000004)
  testDriveLinearDistance(rower, 0.3903886879273361)
  testDriveLength(rower, 0.20943951023931945)
  testDriveAverageHandleForce(rower, 140.86369309378338)
  testDrivePeakHandleForce(rower, 227.11541816744213)
  testRecoveryDuration(rower, 0.22775104700000026)
  testRecoveryDragFactor(rower, 283.33086731525583)
  testInstantHandlePower(rower, 431.9361856957856)
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
  testTotalMovingTimeSinceStart(rower, 0.9923165270000005)
  testTotalLinearDistanceSinceStart(rower, 3.911105007900135)
  testTotalNumberOfStrokes(rower, 3)
  testCycleDuration(rower, 0.3712367640000004)
  testCycleLinearDistance(rower, 1.122367477791091)
  testCycleLinearVelocity(rower, 4.469255430992756)
  testCyclePower(rower, 249.95599708025168)
  testDriveDuration(rower, 0.14348571700000012)
  testDriveLinearDistance(rower, 0.634381617881921)
  testDriveLength(rower, 0.2722713633111155)
  testDriveAverageHandleForce(rower, 177.6995123165446)
  testDrivePeakHandleForce(rower, 294.67568796679427)
  testRecoveryDuration(rower, 0.22775104700000026)
  testRecoveryDragFactor(rower, 283.33086731525583)
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
  testTotalMovingTimeSinceStart(rower, 1.1137102920000004)
  testTotalNumberOfStrokes(rower, 3)
  testTotalLinearDistanceSinceStart(rower, 4.447889453800221)
  testCycleDuration(rower, 0.37123676400000005)
  testCycleLinearDistance(rower, 1.6591519236911776)
  testCycleLinearVelocity(rower, 4.469255430992759)
  testCyclePower(rower, 249.95599708025233)
  testDriveDuration(rower, 0.14348571700000012)
  testDriveLinearDistance(rower, 0.634381617881921)
  testDriveLength(rower, 0.2722713633111155)
  testDriveAverageHandleForce(rower, 177.6995123165446)
  testDrivePeakHandleForce(rower, 294.67568796679427)
  testRecoveryDuration(rower, 0.22775104699999993)
  testRecoveryDragFactor(rower, 283.33086731525583)
  testInstantHandlePower(rower, 0)
})

// Test behaviour for noisy upgoing flank
// ToDo: add detailed test with a series of datapoints describng a complete upgoing flank

// Test behaviour for noisy downgoing flank
// ToDo: add detailed test with a series of datapoints describng a complete downgoing flank

// Test behaviour for noisy stroke
// ToDo: add detailed test with a series of datapoints describng a complete upgoing and downgoing flank

// Test drag factor calculation
// ToDo: add a test to test the dragfactor calculation (can be reused from Flywheel.test.js)

// Test Dynamic stroke detection
// ToDo: add a test to test the dynamic stroke detection (can be reused from Flywheel.test.js)

// Test behaviour after reset
// ToDo: add detailed test with a series of datapoints followed by a reset

// Test behaviour with real-life data

test('sample data for Sportstech WRX700 should produce plausible results', async () => {
  const rower = createRower(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700))
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  testRecoveryDragFactor(rower, rowerProfiles.Sportstech_WRX700.dragFactor)

  await replayRowingSession(rower.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets.csv', realtime: false, loop: false })

  testTotalMovingTimeSinceStart(rower, 46.302522627)
  testTotalLinearDistanceSinceStart(rower, 166.2959671641673)
  testTotalNumberOfStrokes(rower, 16)
  // As dragFactor is static, it should remain in place
  testRecoveryDragFactor(rower, rowerProfiles.Sportstech_WRX700.dragFactor)
})

test('sample data for DKN R-320 should produce plausible results', async () => {
  const rower = createRower(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.DKN_R320))
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  testRecoveryDragFactor(rower, rowerProfiles.DKN_R320.dragFactor)

  await replayRowingSession(rower.handleRotationImpulse, { filename: 'recordings/DKNR320.csv', realtime: false, loop: false })

  testTotalMovingTimeSinceStart(rower, 21.701535821)
  testTotalLinearDistanceSinceStart(rower, 70.11298001986664)
  testTotalNumberOfStrokes(rower, 10)
  // As dragFactor is static, it should remain in place
  testRecoveryDragFactor(rower, rowerProfiles.DKN_R320.dragFactor)
})

test('sample data for NordicTrack RX800 should produce plausible results', async () => {
  const rower = createRower(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.NordicTrack_RX800))
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  testRecoveryDragFactor(rower, rowerProfiles.NordicTrack_RX800.dragFactor)

  await replayRowingSession(rower.handleRotationImpulse, { filename: 'recordings/RX800.csv', realtime: false, loop: false })

  testTotalMovingTimeSinceStart(rower, 17.389910236000024)
  testTotalLinearDistanceSinceStart(rower, 62.052936751782944)
  testTotalNumberOfStrokes(rower, 8)
  // As dragFactor is dynamic, it should have changed
  testRecoveryDragFactor(rower, 486.702741763346)
})

test('A full session for SportsTech WRX700 should produce plausible results', async () => {
  const rower = createRower(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700))
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  testRecoveryDragFactor(rower, rowerProfiles.Sportstech_WRX700.dragFactor)

  await replayRowingSession(rower.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets_session.csv', realtime: false, loop: false })

  testTotalMovingTimeSinceStart(rower, 2342.241183077012)
  testTotalLinearDistanceSinceStart(rower, 8408.914799199298)
  testTotalNumberOfStrokes(rower, 846)
  // As dragFactor is static, it should remain in place
  testRecoveryDragFactor(rower, rowerProfiles.Sportstech_WRX700.dragFactor)
})

test('A full session for a Concept2 RowErg should produce plausible results', async () => {
  const rower = createRower(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Concept2_RowErg))
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  testRecoveryDragFactor(rower, rowerProfiles.Concept2_RowErg.dragFactor)

  await replayRowingSession(rower.handleRotationImpulse, { filename: 'recordings/Concept2_RowErg_Session_2000meters.csv', realtime: false, loop: false })

  testTotalMovingTimeSinceStart(rower, 475.70944021399924)
  testTotalLinearDistanceSinceStart(rower, 2009.361922909656)
  testTotalNumberOfStrokes(rower, 208)
  // As dragFactor isn't static, it should be updated
  testRecoveryDragFactor(rower, 131.37509638912317)
})

function testStrokeState (rower, expectedValue) {
  assert.ok(rower.strokeState() === expectedValue, `strokeState should be ${expectedValue} at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.strokeState()}`)
}

function testTotalMovingTimeSinceStart (rower, expectedValue) {
  assert.ok(rower.totalMovingTimeSinceStart() === expectedValue, `totalMovingTimeSinceStart should be ${expectedValue} sec at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.totalMovingTimeSinceStart()}`)
}

function testTotalNumberOfStrokes (rower, expectedValue) {
  // Please note there is a stroke 0
  assert.ok(rower.totalNumberOfStrokes() + 1 === expectedValue, `totalNumberOfStrokes should be ${expectedValue} at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.totalNumberOfStrokes() + 1}`)
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

/*
function reportAll (rower) {
  assert.ok(0, `time: ${rower.totalMovingTimeSinceStart()}, state ${rower.strokeState()}, No Strokes: ${rower.totalNumberOfStrokes()}, Lin Distance: ${rower.totalLinearDistanceSinceStart()}, cycle dur: ${rower.cycleDuration()}, cycle Lin Dist: ${rower.cycleLinearDistance()}, Lin Velocity: ${rower.cycleLinearVelocity()}, Power: ${rower.cyclePower()}, Drive Dur: ${rower.driveDuration()}, Drive Lin. Dist. ${rower.driveLinearDistance()}, Drive Length: ${rower.driveLength()}, Av. Handle Force: ${rower.driveAverageHandleForce()}, Peak Handle Force: ${rower.drivePeakHandleForce()}, Rec. Dur: ${rower.recoveryDuration()}, Dragfactor: ${rower.recoveryDragFactor()}, Inst Handle Power: ${rower.instantHandlePower()}`)
}
*/

test.run()
