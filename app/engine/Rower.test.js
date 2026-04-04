'use strict'
/**
 * @copyright {@link https://github.com/JaapvanEkris/openrowingmonitor|OpenRowingMonitor}
 *
 * @file This test is a test of the Rower object, that tests wether this object fills all fields correctly, given one validated rower, (the
 * Concept2 RowErg) using a validated cycle of strokes. This thoroughly tests the raw physics of the translation of Angular physics
 * to Linear physics. The combination with all possible known rowers is tested when testing the above function RowingStatistics, as
 * these statistics are dependent on these settings as well.
 */
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import rowerProfiles from '../../config/rowerProfiles.js'
import { replayRowingSession } from '../recorders/RowingReplayer.js'
import { deepMerge } from '../tools/Helper.js'

import { createRower } from './Rower.js'

const baseConfig = { // Based on Concept 2 settings, as this is the validation system
  numOfImpulsesPerRevolution: 6,
  sprocketRadius: 1.4,
  maximumStrokeTimeBeforePause: 0.3, // Modification to standard settings to shorten test cases
  dragFactor: 110,
  autoAdjustDragFactor: true,
  minimumDragQuality: 0.95,
  dragFactorSmoothing: 3,
  minimumTimeBetweenImpulses: 0.005,
  maximumTimeBetweenImpulses: 0.017,
  flankLength: 12,
  systematicErrorAgressiveness: 0,
  systematicErrorNumberOfDatapoints: 1,
  minimumStrokeQuality: 0.36,
  minimumForceBeforeStroke: 20, // Modification to standard settings to shorten test cases
  minimumRecoverySlope: 0.00070,
  autoAdjustRecoverySlope: false, // Modification to standard settings to shorten test cases
  autoAdjustRecoverySlopeMargin: 0.04,
  minimumDriveTime: 0.04, // Modification to standard settings to shorten test cases
  minimumRecoveryTime: 0.09, // Modification to standard settings to shorten test cases
  flywheelInertia: 0.10138,
  magicConstant: 2.8
}

/**
 * @description Test behaviour for no datapoints
 */
test('Init_01: Correct rower behaviour at initialisation', () => {
  const rower = createRower(baseConfig)
  testStrokeState(rower, 'WaitingForDrive')
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testCycleDuration(rower, undefined) // Default value
  testCycleLinearDistance(rower, undefined)
  testCycleLinearVelocity(rower, undefined)
  testCyclePower(rower, undefined)
  testDriveDuration(rower, undefined)
  testDriveLinearDistance(rower, undefined)
  testDriveLength(rower, undefined)
  testDriveAverageHandleForce(rower, undefined)
  testDrivePeakHandleForce(rower, undefined)
  testRecoveryDuration(rower, undefined)
  testRecoveryDragFactor(rower, undefined)
  testInstantHandlePower(rower, 0)
})

/**
 * @todo Test behaviour for one datapoint
 */

/**
 * @description Test behaviour for three perfect identical strokes, including settingling behaviour of metrics
 */
test('Theoretical_01: Test behaviour for three perfect identical strokes, including settingling behaviour of metrics', () => {
  const rower = createRower(baseConfig)
  testStrokeState(rower, 'WaitingForDrive')
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  testCycleDuration(rower, undefined) // Default value
  testCycleLinearDistance(rower, undefined)
  testCycleLinearVelocity(rower, undefined)
  testCyclePower(rower, undefined)
  testDriveDuration(rower, undefined)
  testDriveLinearDistance(rower, undefined)
  testDriveLength(rower, undefined)
  testDriveAverageHandleForce(rower, undefined)
  testDrivePeakHandleForce(rower, undefined)
  testRecoveryDuration(rower, undefined)
  testRecoveryDragFactor(rower, undefined)
  testInstantHandlePower(rower, 0)
  // Drive initial stroke starts here
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
  testTotalMovingTimeSinceStart(rower, 0.077918634)
  testTotalLinearDistanceSinceStart(rower, 0.2135951659708087)
  testTotalNumberOfStrokes(rower, 1)
  testCycleDuration(rower, undefined) // still default value
  testCycleLinearDistance(rower, undefined)
  testCycleLinearVelocity(rower, undefined) // This isn't filled after the first drive, as we haven't survived a complete cycle yet
  testCyclePower(rower, undefined) // This isn't filled after the first drive, as we haven't survived a complete cycle yet
  testDriveDuration(rower, undefined) // This isn't filled after the first drive as it is too short
  testDriveLinearDistance(rower, undefined)
  testDriveLength(rower, undefined)
  testDriveAverageHandleForce(rower, undefined)
  testDrivePeakHandleForce(rower, undefined)
  testRecoveryDuration(rower, undefined)
  testRecoveryDragFactor(rower, undefined)
  testInstantHandlePower(rower, 367.97696436918955)
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
  testTotalMovingTimeSinceStart(rower, 0.23894732900000007)
  testTotalLinearDistanceSinceStart(rower, 0.7475830808978304)
  testTotalNumberOfStrokes(rower, 1)
  testCycleDuration(rower, undefined)
  testCycleLinearDistance(rower, undefined)
  testCycleLinearVelocity(rower, undefined)
  testCyclePower(rower, undefined)
  testDriveDuration(rower, 0.143485717)
  testDriveLinearDistance(rower, 0.4271903319416174)
  testDriveLength(rower, 0.1759291886010284)
  testDriveAverageHandleForce(rower, 276.6342676838739)
  testDrivePeakHandleForce(rower, 332.99182222129025)
  testRecoveryDuration(rower, undefined)
  testRecoveryDragFactor(rower, undefined)
  testInstantHandlePower(rower, 0)
  // Drive second stroke starts here
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
  testTotalMovingTimeSinceStart(rower, 0.44915539800000004)
  testTotalLinearDistanceSinceStart(rower, 1.790756456114694)
  testTotalNumberOfStrokes(rower, 2)
  testCycleDuration(rower, 0.36002684500000004)
  testCycleLinearDistance(rower, 1.3635661241730768)
  testCycleLinearVelocity(rower, 4.328458575829895)
  testCyclePower(rower, 227.0689899451657)
  testDriveDuration(rower, 0.143485717)
  testDriveLinearDistance(rower, 0.3895903211923076)
  testDriveLength(rower, 0.1759291886010284)
  testDriveAverageHandleForce(rower, 236.92279327988305)
  testDrivePeakHandleForce(rower, 378.60223820258005)
  testRecoveryDuration(rower, 0.21654112800000003)
  testRecoveryDragFactor(rower, 281.5961372923874)
  testInstantHandlePower(rower, 502.7377823299629)
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
  testTotalMovingTimeSinceStart(rower, 0.6101840930000001)
  testTotalLinearDistanceSinceStart(rower, 2.521238308350271)
  testTotalNumberOfStrokes(rower, 2)
  testCycleDuration(rower, 0.44526865700000007)
  testCycleLinearDistance(rower, 1.1200721734278847)
  testCycleLinearVelocity(rower, 4.484147636986217)
  testCyclePower(rower, 252.46300093932936)
  testDriveDuration(rower, 0.22872752900000004)
  testDriveLinearDistance(rower, 1.0226745931298076)
  testDriveLength(rower, 0.3078760800517996)
  testDriveAverageHandleForce(rower, 288.45140756259053)
  testDrivePeakHandleForce(rower, 447.108514349131)
  testRecoveryDuration(rower, 0.21654112800000003)
  testRecoveryDragFactor(rower, 281.5961372923874)
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
  testTotalMovingTimeSinceStart(rower, 0.8203921620000004)
  testTotalLinearDistanceSinceStart(rower, 3.4465153211820017)
  testTotalNumberOfStrokes(rower, 3)
  testCycleDuration(rower, 0.3268520060000002)
  testCycleLinearDistance(rower, 1.0226745931298078)
  testCycleLinearVelocity(rower, 4.469801860329268)
  testCyclePower(rower, 250.04769019893303)
  testDriveDuration(rower, 0.22872752900000004)
  testDriveLinearDistance(rower, 0.5843854817884615)
  testDriveLength(rower, 0.3078760800517996)
  testDriveAverageHandleForce(rower, 192.2653879294337)
  testDrivePeakHandleForce(rower, 378.6022382039591)
  testRecoveryDuration(rower, 0.09812447700000015)
  testRecoveryDragFactor(rower, 281.5961372923874)
  testInstantHandlePower(rower, 502.73778233173203)
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
  testTotalMovingTimeSinceStart(rower, 0.9814208570000005)
  testTotalLinearDistanceSinceStart(rower, 4.176997173417578)
  testTotalNumberOfStrokes(rower, 3)
  testCycleDuration(rower, 0.3712367640000004)
  testCycleLinearDistance(rower, 1.314867334024038)
  testCycleLinearVelocity(rower, 4.4601155532842265)
  testCyclePower(rower, 248.42560903379598)
  testDriveDuration(rower, 0.27311228700000023)
  testDriveLinearDistance(rower, 1.2174697537259611)
  testDriveLength(rower, 0.36651914291880905)
  testDriveAverageHandleForce(rower, 256.5447026931294)
  testDrivePeakHandleForce(rower, 447.1085143512751)
  testRecoveryDuration(rower, 0.09812447700000015)
  testRecoveryDragFactor(rower, 281.5961372923874)
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
  testTotalMovingTimeSinceStart(rower, 1.1551868460000003)
  testTotalNumberOfStrokes(rower, 3)
  testTotalLinearDistanceSinceStart(rower, 4.858780235504117)
  testCycleDuration(rower, 0.4683079950000001)
  testCycleLinearDistance(rower, 1.996650396110577)
  testCycleLinearVelocity(rower, 4.263541125558996)
  testCyclePower(rower, 217.00483025394573)
  testDriveDuration(rower, 0.27311228700000023)
  testDriveLinearDistance(rower, 1.2174697537259611)
  testDriveLength(rower, 0.36651914291880905)
  testDriveAverageHandleForce(rower, 256.5447026931294)
  testDrivePeakHandleForce(rower, 447.1085143512751)
  testRecoveryDuration(rower, 0.19519570799999986)
  testRecoveryDragFactor(rower, 281.5961372923874)
  testInstantHandlePower(rower, 0)
})

/**
 * @todo Test behaviour for noisy stroke
 */

/**
 * @todo Test behaviour after reset
 */

/**
 * @todo Test drag factor calculation
 */

/**
 * @description Test against a theoretical model, based on perfect clean data, as described in
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/discussions/215|this discussion}
 */
test('Theoretical_02: Correct Rower behaviour with perfect clean data', async () => {
  const rower = createRower(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Theoretical_Model))
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  // As dragFactor isn't static, it isn't available yet
  testRecoveryDragFactor(rower, undefined)

  await replayRowingSession(rower.handleRotationImpulse, { filename: 'recordings/Theoretical_Simulation_Clean.csv', realtime: false, loop: false })

  testTotalMovingTimeSinceStart(rower, 61.3575905099299)
  testTotalLinearDistanceSinceStart(rower, 235.71100184559577)
  testTotalNumberOfStrokes(rower, 20)
  // As the session has stopped, all data is supposed to be undefined again
  testCycleDuration(rower, 6.002600148120585)
  testCycleLinearDistance(rower, 20.51792911861166)
  testCycleLinearVelocity(rower, 3.418173560175646)
  testCyclePower(rower, 111.82537494177338)
  testDriveDuration(rower, 0.8536150547956822)
  testDriveLinearDistance(rower, 3.3708026409143326)
  testDriveLength(rower, 1.363241772147737)
  testDriveAverageHandleForce(rower, 376.227848755665)
  testDrivePeakHandleForce(rower, 595.5968022268906) // Theoretical value 600N
  testRecoveryDuration(rower, 5.148985093324903)
  testInstantHandlePower(rower, 0)
  testRecoveryDragFactor(rower, 119.92470860879553) // Theoretical value 120 * 10^âˆ’6 [ k g m 2 ]
})

/**
 * @description Test against a theoretical model, based on noise-injected data, as described in
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/discussions/215|this discussion}
 */
test('Theoretical_03: Correct Rower behaviour with noise-injected data', async () => {
  const rower = createRower(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Theoretical_Model))
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  // As dragFactor isn't static, it isn't available yet
  testRecoveryDragFactor(rower, undefined)

  await replayRowingSession(rower.handleRotationImpulse, { filename: 'recordings/Theoretical_Simulation_Random_Noise.csv', realtime: false, loop: false })

  testTotalMovingTimeSinceStart(rower, 181.37410307752515)
  testTotalLinearDistanceSinceStart(rower, 706.3941674377243)
  testTotalNumberOfStrokes(rower, 60)
  testCycleDuration(rower, 6.017174805743167)
  testCycleLinearDistance(rower, 20.556148767785583)
  testCycleLinearVelocity(rower, 3.4162343421008674)
  testCyclePower(rower, 111.63515863384868)
  testDriveDuration(rower, 0.9022807545438525)
  testDriveLinearDistance(rower, 3.5909710922219444)
  testDriveLength(rower, 1.4521488442443375)
  testDriveAverageHandleForce(rower, 357.06261389429113)
  testDrivePeakHandleForce(rower, 597.4110902759764) // Theoretical value 600N
  testRecoveryDuration(rower, 5.114894051199315)
  testInstantHandlePower(rower, 0)
  testRecoveryDragFactor(rower, 119.95115701917243) // Theoretical value 120 * 10^âˆ’6 [ k g m 2 ]
})

/**
 * @description Test against a theoretical model, based on a simulation of magnet positioning errors, as described in
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/discussions/215|this discussion}
 * Magnet errors -0.01, +0.1, +0.2, -0.2, -0.1, +0.01 degrees
 */
test('Theoretical_04: Correct Rower behaviour with structural magnet errors', async () => {
  const rower = createRower(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Theoretical_Model))
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  // As dragFactor isn't static, it isn't available yet
  testRecoveryDragFactor(rower, undefined)

  await replayRowingSession(rower.handleRotationImpulse, { filename: 'recordings/Theoretical_Simulation_Systematic_Noise.csv', realtime: false, loop: false })

  testTotalMovingTimeSinceStart(rower, 181.35701304844142)
  testTotalLinearDistanceSinceStart(rower, 706.3286131515105)
  testTotalNumberOfStrokes(rower, 60)
  testCycleDuration(rower, 6.002627869048808)
  testCycleLinearDistance(rower, 20.51792911861257)
  testCycleLinearVelocity(rower, 3.4181577745989578)
  testCyclePower(rower, 111.823825675902)
  testDriveDuration(rower, 0.8536290880211368)
  testDriveLinearDistance(rower, 3.370802640914105)
  testDriveLength(rower, 1.363241772147737)
  testDriveAverageHandleForce(rower, 376.5982501172787)
  testDrivePeakHandleForce(rower, 595.8795141321255) // Theoretical value 600N
  testRecoveryDuration(rower, 5.148998781027672)
  testInstantHandlePower(rower, 0)
  testRecoveryDragFactor(rower, 119.92470860881883) // Theoretical value 120 * 10^âˆ’6 [ k g m 2 ]
})

/**
 * @description Test behaviour for the C2 Model C
 */
test('C2_ModelC_01: A full session for a Concept2 Model C should produce plausible results', async () => {
  const rower = createRower(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Concept2_Model_C))
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  // As dragFactor isn't static, it isn't available yet
  testRecoveryDragFactor(rower, undefined)

  await replayRowingSession(rower.handleRotationImpulse, { filename: 'recordings/Concept2_Model_C.csv', realtime: false, loop: false })

  testTotalMovingTimeSinceStart(rower, 181.4588596531004)
  testTotalLinearDistanceSinceStart(rower, 552.4833037536148)
  testTotalNumberOfStrokes(rower, 81)
  testCycleDuration(rower, 2.7431250688428577)
  testCycleLinearDistance(rower, 3.4692073560232397)
  testCycleLinearVelocity(rower, 1.1301499807254836)
  testCyclePower(rower, 4.041720500786868)
  testDriveDuration(rower, 0.7592322967347798)
  testDriveLinearDistance(rower, 1.3286326044344432)
  testDriveLength(rower, 0.38117990863556767)
  testDriveAverageHandleForce(rower, 89.5649019624021)
  testDrivePeakHandleForce(rower, 176.95825697187902)
  testRecoveryDuration(rower, 1.983892772108078)
  testInstantHandlePower(rower, 31.747253027739596)
  testRecoveryDragFactor(rower, 122.56864708679767)
})

/**
 * @description Test behaviour for the C2 RowErg
 */
test('C2_RowErg_01: A full session for a Concept2 RowErg should produce plausible results', async () => {
  const rower = createRower(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Concept2_RowErg))
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  testRecoveryDragFactor(rower, undefined)

  await replayRowingSession(rower.handleRotationImpulse, { filename: 'recordings/Concept2_RowErg_Session_2000meters.csv', realtime: false, loop: false })

  testTotalMovingTimeSinceStart(rower, 589.9664157362346)
  testTotalLinearDistanceSinceStart(rower, 2028.3093228150667)
  testTotalNumberOfStrokes(rower, 206)
  testCycleDuration(rower, 2.991845945763316)
  testCycleLinearDistance(rower, 9.249577681017865)
  testCycleLinearVelocity(rower, 3.467310312773511)
  testCyclePower(rower, 116.7175506729407)
  testDriveDuration(rower, 0.7332495742683705)
  testDriveLinearDistance(rower, 2.5693271336160244)
  testDriveLength(rower, 1.1728612573401769)
  testDriveAverageHandleForce(rower, 284.3396357312365)
  testDrivePeakHandleForce(rower, 444.35598591963236)
  testRecoveryDuration(rower, 2.2585963714949457)
  testInstantHandlePower(rower, 0)
  testRecoveryDragFactor(rower, 80.77192371126783)
})

/**
 * @description Test behaviour for the DKN R-320
 */
test('DKN_R320_01: sample data for DKN R-320 should produce plausible results', async () => {
  const rower = createRower(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.DKN_R320))
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  testRecoveryDragFactor(rower, rowerProfiles.DKN_R320.dragFactor) // As dragFactor is static, it should be known at initialisation

  await replayRowingSession(rower.handleRotationImpulse, { filename: 'recordings/DKNR320.csv', realtime: false, loop: false })

  testTotalMovingTimeSinceStart(rower, 21.701535821)
  testTotalLinearDistanceSinceStart(rower, 69.20242183779045)
  testTotalNumberOfStrokes(rower, 10)
  testCycleDuration(rower, 2.2897938159999995)
  testCycleLinearDistance(rower, 7.284465456609514)
  testCycleLinearVelocity(rower, 3.181275713869568)
  testCyclePower(rower, 90.14921752119831)
  testDriveDuration(rower, 1.2778628719999965)
  testDriveLinearDistance(rower, 3.642232728304757)
  testDriveLength(rower, 1.7592918860102824)
  testDriveAverageHandleForce(rower, 385.62555350976965)
  testDrivePeakHandleForce(rower, 604.6392224523523)
  testRecoveryDuration(rower, 1.011930944000003)
  testInstantHandlePower(rower, 0)
  testRecoveryDragFactor(rower, rowerProfiles.DKN_R320.dragFactor) // As dragFactor is static, it should remain in place
})

/**
 * @description Test behaviour for the NordicTrack RX800
 */
test('NordicT_RX800_01: sample data for NordicTrack RX800 should produce plausible results', async () => {
  const rower = createRower(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.NordicTrack_RX800))
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  testRecoveryDragFactor(rower, undefined)

  await replayRowingSession(rower.handleRotationImpulse, { filename: 'recordings/RX800.csv', realtime: false, loop: false })

  testTotalMovingTimeSinceStart(rower, 22.368358745999995)
  testTotalLinearDistanceSinceStart(rower, 80.8365747440095)
  testTotalNumberOfStrokes(rower, 10)
  testCycleDuration(rower, 2.237534478999997)
  testCycleLinearDistance(rower, 7.751801481871587)
  testCycleLinearVelocity(rower, 3.621913392059043)
  testCyclePower(rower, 133.0369301265531)
  testDriveDuration(rower, 0.6251555590000031)
  testDriveLinearDistance(rower, 2.290304983280253)
  testDriveLength(rower, 1.2252211349000253)
  testDriveAverageHandleForce(rower, 242.21443734968256)
  testDrivePeakHandleForce(rower, 389.6437952657745)
  testRecoveryDuration(rower, 1.612378919999994)
  testInstantHandlePower(rower, 0)
  testRecoveryDragFactor(rower, 493.8082148322739)
})

/**
 * @description Test behaviour for the Merarch R50
 */
test('Merarch_R50_01: sample data for Merarch R50 should produce plausible results', async () => {
  const rower = createRower(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Merach_R50))
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  testRecoveryDragFactor(rower, undefined)

  await replayRowingSession(rower.handleRotationImpulse, { filename: 'recordings/Merach_R50_510m.csv', realtime: false, loop: false })

  testTotalMovingTimeSinceStart(rower, 129.30676700000004)
  testTotalLinearDistanceSinceStart(rower, 511.02296249261553)
  testTotalNumberOfStrokes(rower, 50)
  testCycleDuration(rower, 6.080085000000054)
  testCycleLinearDistance(rower, 21.069134297647764)
  testCycleLinearVelocity(rower, 3.465046801046821)
  testCyclePower(rower, 116.48911500649851)
  testDriveDuration(rower, 0.8127870000000712)
  testDriveLinearDistance(rower, 3.327846651885306)
  testDriveLength(rower, 1.347743248390033)
  testDriveAverageHandleForce(rower, 367.91178083645434)
  testDrivePeakHandleForce(rower, 672.9842122409556)
  testRecoveryDuration(rower, 5.2672979999999825)
  testInstantHandlePower(rower, 0)
  testRecoveryDragFactor(rower, 123.11298950726905)
})

/**
 * @description Test behaviour for the Oartec Slider
 */
test('Oartec_Slider_01: sample data for Oartec Slider should produce plausible results', async () => {
  const rower = createRower(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Oartec_Slider))
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  testRecoveryDragFactor(rower, undefined)

  await replayRowingSession(rower.handleRotationImpulse, { filename: 'recordings/Oartec_Slider.csv', realtime: false, loop: false })

  testTotalMovingTimeSinceStart(rower, 58.32198919882932)
  testTotalLinearDistanceSinceStart(rower, 195.17761419351442)
  testTotalNumberOfStrokes(rower, 14)
  testCycleDuration(rower, 13.371270849084922)
  testCycleLinearDistance(rower, 33.36960390678204)
  testCycleLinearVelocity(rower, 2.4956847109450653)
  testCyclePower(rower, 43.52383815572541)
  testDriveDuration(rower, 1.1030650912501372)
  testDriveLinearDistance(rower, 4.294337493820962)
  testDriveLength(rower, 1.5408380992502635)
  testDriveAverageHandleForce(rower, 381.3323961655147)
  testDrivePeakHandleForce(rower, 541.5104462470034)
  testRecoveryDuration(rower, 12.268205757834785)
  testInstantHandlePower(rower, 0)
  testRecoveryDragFactor(rower, 171.76129602250094)
})

/**
 * @description Test behaviour for the Schwinn Windrigger
 */
test('Schwinn_Wndrggr_01: sample data for Schwinn Windrigger should produce plausible results', async () => {
  const rower = createRower(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Schwinn_Windrigger))
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  testRecoveryDragFactor(rower, undefined)

  await replayRowingSession(rower.handleRotationImpulse, { filename: 'recordings/Schwinn_Windrigger.csv', realtime: false, loop: false })

  testTotalMovingTimeSinceStart(rower, 120.58333099999997)
  testTotalLinearDistanceSinceStart(rower, 432.11617011823284)
  testTotalNumberOfStrokes(rower, 47)
  testCycleDuration(rower, 9.136834999999948)
  testCycleLinearDistance(rower, 18.08516640554577)
  testCycleLinearVelocity(rower, 1.9838607607875394)
  testCyclePower(rower, 21.862085772339665)
  testDriveDuration(rower, 0.6514299999999906)
  testDriveLinearDistance(rower, 1.9110111872560942)
  testDriveLength(rower, 0.6905220652590236)
  testDriveAverageHandleForce(rower, 245.6040207461455)
  testDrivePeakHandleForce(rower, 356.88032010420187)
  testRecoveryDuration(rower, 8.485404999999957)
  testInstantHandlePower(rower, 0)
  testRecoveryDragFactor(rower, 244.79315251519714)
})

/**
 * @description Test behaviour for the Sportstech WRX700
 */
test('Sportstech_WRX700_01: sample data for Sportstech WRX700 should produce plausible results', async () => {
  const rower = createRower(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700))
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  testRecoveryDragFactor(rower, rowerProfiles.Sportstech_WRX700.dragFactor) // As dragFactor is static, it should be known at initialisation

  await replayRowingSession(rower.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets.csv', realtime: false, loop: false })

  testTotalMovingTimeSinceStart(rower, 46.302522627)
  testTotalLinearDistanceSinceStart(rower, 165.58832475070278)
  testTotalNumberOfStrokes(rower, 16)
  testCycleDuration(rower, 2.629863708000002)
  testCycleLinearDistance(rower, 12.02992102889722)
  testCycleLinearVelocity(rower, 4.03619251053907)
  testCyclePower(rower, 184.10841872694715)
  testDriveDuration(rower, 1.297822779999997)
  testDriveLinearDistance(rower, 5.661139307716341)
  testDriveLength(rower, 1.7592918860102864)
  testDriveAverageHandleForce(rower, 347.2288656270118)
  testDrivePeakHandleForce(rower, 634.0186435697934)
  testRecoveryDuration(rower, 1.332040928000005)
  testInstantHandlePower(rower, 0)
  testRecoveryDragFactor(rower, rowerProfiles.Sportstech_WRX700.dragFactor) // As dragFactor is static, it should remain in place
})

/**
 * @description Test behaviour for the SportsTech WRX700 in a full session
 */
test('Sportstech_WRX700_02: A full session for SportsTech WRX700 should produce plausible results', async () => {
  const rower = createRower(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700))
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  testRecoveryDragFactor(rower, rowerProfiles.Sportstech_WRX700.dragFactor) // As dragFactor is static, it should be known at initialisation

  await replayRowingSession(rower.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets_session.csv', realtime: false, loop: false })

  testTotalMovingTimeSinceStart(rower, 2340.0100514160117)
  testTotalLinearDistanceSinceStart(rower, 8406.084229545408)
  testTotalNumberOfStrokes(rower, 846)
  testCycleDuration(rower, 2.64479661400037)
  testCycleLinearDistance(rower, 9.906993788503808)
  testCycleLinearVelocity(rower, 3.47828310363887)
  testCyclePower(rower, 117.82916841975236)
  testDriveDuration(rower, 1.3936550620001071)
  testDriveLinearDistance(rower, 4.953496894251904)
  testDriveLength(rower, 1.5393804002590334)
  testDriveAverageHandleForce(rower, 210.6300325410566)
  testDrivePeakHandleForce(rower, 352.68327935116827)
  testRecoveryDuration(rower, 1.251141552000263)
  testInstantHandlePower(rower, 0)
  testRecoveryDragFactor(rower, rowerProfiles.Sportstech_WRX700.dragFactor) // As dragFactor is static, it should remain in place
})

/**
 * @description Test behaviour for the Topiom V2
 */
test('TopiomV2_01: sample data for Topiom V2 should produce plausible results', async () => {
  const rower = createRower(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Topiom_V2))
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  testRecoveryDragFactor(rower, rowerProfiles.Topiom_V2.dragFactor)

  await replayRowingSession(rower.handleRotationImpulse, { filename: 'recordings/Topiom_V2_1magnet.csv', realtime: false, loop: false })

  testTotalMovingTimeSinceStart(rower, 2443.938449999993)
  testTotalLinearDistanceSinceStart(rower, 9785.826483676927)
  testTotalNumberOfStrokes(rower, 1201)
  testCycleDuration(rower, 6.065000999999484)
  testCycleLinearDistance(rower, 16.480858179530163)
  testCycleLinearVelocity(rower, 2.717371057239985)
  testCyclePower(rower, 56.182992510450624)
  testDriveDuration(rower, 1.0403479999999945)
  testDriveLinearDistance(rower, 3.8032749645067345)
  testDriveLength(rower, 1.3194689145075973)
  testDriveAverageHandleForce(rower, 140.7915517540433)
  testDrivePeakHandleForce(rower, 207.94182032146372)
  testRecoveryDuration(rower, 5.024652999999489)
  testInstantHandlePower(rower, 0)
  testRecoveryDragFactor(rower, rowerProfiles.Topiom_V2.dragFactor)
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

function reportAll (rower) { // eslint-disable-line no-unused-vars
  assert.ok(0, `time: ${rower.totalMovingTimeSinceStart()}, state ${rower.strokeState()}, No Strokes: ${rower.totalNumberOfStrokes() + 1}, Lin Distance: ${rower.totalLinearDistanceSinceStart()}, cycle dur: ${rower.cycleDuration()}, cycle Lin Dist: ${rower.cycleLinearDistance()}, Lin Velocity: ${rower.cycleLinearVelocity()}, Power: ${rower.cyclePower()}, Drive Dur: ${rower.driveDuration()}, Drive Lin. Dist. ${rower.driveLinearDistance()}, Drive Length: ${rower.driveLength()}, Av. Handle Force: ${rower.driveAverageHandleForce()}, Peak Handle Force: ${rower.drivePeakHandleForce()}, Rec. Dur: ${rower.recoveryDuration()}, Dragfactor: ${rower.recoveryDragFactor()}, Inst Handle Power: ${rower.instantHandlePower()}`)
}

test.run()
