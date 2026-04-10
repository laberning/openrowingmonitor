'use strict'
/**
 * @copyright {@link https://github.com/JaapvanEkris/openrowingmonitor|OpenRowingMonitor}
 *
 * @file This test is a test of the Rowingstatistics object, that tests wether this object fills all fields correctly, given one validated rower, (the
 * Concept2 RowErg) using a validated cycle of strokes. The combination with all possible known rowers is tested.
 */
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import rowerProfiles from '../../config/rowerProfiles.js'
import { replayRowingSession } from '../recorders/RowingReplayer.js'
import { deepMerge } from '../tools/Helper.js'

import { createRowingStatistics } from './RowingStatistics.js'

const baseConfig = {
  loglevel: {
    default: 'silent',
    RowingEngine: 'silent'
  },
  numOfPhasesForAveragingScreenData: 2,
  rowerSettings: { // Based on Concept 2 settings, as this is the validation system
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
}

/**
 * @description Test behaviour for no datapoints
 */
test('Init_01: Correct rower behaviour at initialisation', () => {
  const rowingStatistics = createRowingStatistics(baseConfig)
  testStrokeState(rowingStatistics, 'WaitingForDrive')
  testTotalMovingTime(rowingStatistics, 0)
  testTotalNumberOfStrokes(rowingStatistics, 0)
  testTotalLinearDistance(rowingStatistics, 0)
  testCycleDuration(rowingStatistics, undefined) // Default value
  testCycleDistance(rowingStatistics, undefined)
  testCycleLinearVelocity(rowingStatistics, undefined)
  testCyclePower(rowingStatistics, undefined)
  testDriveDuration(rowingStatistics, undefined)
  testDriveDistance(rowingStatistics, undefined)
  testDriveLength(rowingStatistics, undefined)
  testDriveAverageHandleForce(rowingStatistics, undefined)
  testDrivePeakHandleForce(rowingStatistics, undefined)
  testRecoveryDuration(rowingStatistics, undefined)
  testDragFactor(rowingStatistics, undefined)
  testInstantHandlePower(rowingStatistics, undefined)
})

/**
 * @todo Test behaviour for one datapoint
 */

/**
 * @description Test behaviour for three perfect identical strokes, including settingling behaviour of metrics
 */
test('Theoretical_01: Test behaviour for three perfect identical strokes, including settingling behaviour of metrics', () => {
  const rowingStatistics = createRowingStatistics(baseConfig)
  testStrokeState(rowingStatistics, 'WaitingForDrive')
  testTotalMovingTime(rowingStatistics, 0)
  testTotalLinearDistance(rowingStatistics, 0)
  testTotalNumberOfStrokes(rowingStatistics, 0)
  testCycleDuration(rowingStatistics, undefined) // Default value
  testCycleDistance(rowingStatistics, undefined)
  testCycleLinearVelocity(rowingStatistics, undefined)
  testCyclePower(rowingStatistics, undefined)
  testDriveDuration(rowingStatistics, undefined)
  testDriveDistance(rowingStatistics, undefined)
  testDriveLength(rowingStatistics, undefined)
  testDriveAverageHandleForce(rowingStatistics, undefined)
  testDrivePeakHandleForce(rowingStatistics, undefined)
  testRecoveryDuration(rowingStatistics, undefined)
  testDragFactor(rowingStatistics, undefined)
  testInstantHandlePower(rowingStatistics, undefined)
  // Drive initial stroke starts here
  rowingStatistics.handleRotationImpulse(0.011221636)
  rowingStatistics.handleRotationImpulse(0.011175504)
  rowingStatistics.handleRotationImpulse(0.01116456)
  rowingStatistics.handleRotationImpulse(0.011130263)
  rowingStatistics.handleRotationImpulse(0.011082613)
  rowingStatistics.handleRotationImpulse(0.011081761)
  rowingStatistics.handleRotationImpulse(0.011062297)
  rowingStatistics.handleRotationImpulse(0.011051853)
  rowingStatistics.handleRotationImpulse(0.010973313)
  rowingStatistics.handleRotationImpulse(0.010919756)
  rowingStatistics.handleRotationImpulse(0.01086431)
  rowingStatistics.handleRotationImpulse(0.010800864)
  rowingStatistics.handleRotationImpulse(0.010956987)
  rowingStatistics.handleRotationImpulse(0.010653396)
  rowingStatistics.handleRotationImpulse(0.010648619)
  rowingStatistics.handleRotationImpulse(0.010536818)
  rowingStatistics.handleRotationImpulse(0.010526151)
  rowingStatistics.handleRotationImpulse(0.010511225)
  rowingStatistics.handleRotationImpulse(0.010386684)
  testStrokeState(rowingStatistics, 'Drive')
  testTotalMovingTime(rowingStatistics, 0.077918634)
  testTotalLinearDistance(rowingStatistics, 0.2135951659708087)
  testTotalNumberOfStrokes(rowingStatistics, 0)
  testCycleDuration(rowingStatistics, undefined) // still default value
  testCycleDistance(rowingStatistics, undefined)
  testCycleLinearVelocity(rowingStatistics, undefined) // This isn't filled after the first drive, as we haven't survived a complete cycle yet
  testCyclePower(rowingStatistics, undefined) // This isn't filled after the first drive, as we haven't survived a complete cycle yet
  testDriveDuration(rowingStatistics, undefined) // Shouldn't this one be filled after the first drive?
  testDriveDistance(rowingStatistics, undefined)
  testDriveLength(rowingStatistics, undefined) // Shouldn't this one be filled after the first drive?
  testDriveAverageHandleForce(rowingStatistics, undefined)
  testDrivePeakHandleForce(rowingStatistics, undefined)
  testRecoveryDuration(rowingStatistics, undefined)
  testDragFactor(rowingStatistics, undefined)
  testInstantHandlePower(rowingStatistics, undefined)
  // Recovery initial stroke starts here
  rowingStatistics.handleRotationImpulse(0.010769)
  rowingStatistics.handleRotationImpulse(0.010707554)
  rowingStatistics.handleRotationImpulse(0.010722165)
  rowingStatistics.handleRotationImpulse(0.01089567)
  rowingStatistics.handleRotationImpulse(0.010917504)
  rowingStatistics.handleRotationImpulse(0.010997969)
  rowingStatistics.handleRotationImpulse(0.011004655)
  rowingStatistics.handleRotationImpulse(0.011013618)
  rowingStatistics.handleRotationImpulse(0.011058193)
  rowingStatistics.handleRotationImpulse(0.010807149)
  rowingStatistics.handleRotationImpulse(0.0110626)
  rowingStatistics.handleRotationImpulse(0.011090787)
  rowingStatistics.handleRotationImpulse(0.011099509)
  rowingStatistics.handleRotationImpulse(0.011131862)
  rowingStatistics.handleRotationImpulse(0.011209919)
  testStrokeState(rowingStatistics, 'Recovery')
  testTotalMovingTime(rowingStatistics, 0.23894732900000007)
  testTotalLinearDistance(rowingStatistics, 0.7475830808978304)
  testTotalNumberOfStrokes(rowingStatistics, 0)
  testCycleDuration(rowingStatistics, undefined)
  testCycleDistance(rowingStatistics, undefined)
  testCycleLinearVelocity(rowingStatistics, undefined)
  testCyclePower(rowingStatistics, undefined)
  testDriveDuration(rowingStatistics, undefined)
  testDriveDistance(rowingStatistics, 0.4271903319416174)
  testDriveLength(rowingStatistics, 0.1759291886010284)
  testDriveAverageHandleForce(rowingStatistics, 276.6342676838739)
  testDrivePeakHandleForce(rowingStatistics, 332.99182222129025)
  testRecoveryDuration(rowingStatistics, undefined)
  testDragFactor(rowingStatistics, undefined)
  testInstantHandlePower(rowingStatistics, undefined)
  // Drive second stroke starts here
  rowingStatistics.handleRotationImpulse(0.011221636)
  rowingStatistics.handleRotationImpulse(0.011175504)
  rowingStatistics.handleRotationImpulse(0.01116456)
  rowingStatistics.handleRotationImpulse(0.011130263)
  rowingStatistics.handleRotationImpulse(0.011082613)
  rowingStatistics.handleRotationImpulse(0.011081761)
  rowingStatistics.handleRotationImpulse(0.011062297)
  rowingStatistics.handleRotationImpulse(0.011051853)
  rowingStatistics.handleRotationImpulse(0.010973313)
  rowingStatistics.handleRotationImpulse(0.010919756)
  rowingStatistics.handleRotationImpulse(0.01086431)
  rowingStatistics.handleRotationImpulse(0.010800864)
  rowingStatistics.handleRotationImpulse(0.010956987)
  rowingStatistics.handleRotationImpulse(0.010653396)
  rowingStatistics.handleRotationImpulse(0.010648619)
  rowingStatistics.handleRotationImpulse(0.010536818)
  rowingStatistics.handleRotationImpulse(0.010526151)
  rowingStatistics.handleRotationImpulse(0.010511225)
  rowingStatistics.handleRotationImpulse(0.010386684)
  testStrokeState(rowingStatistics, 'Drive')
  testTotalMovingTime(rowingStatistics, 0.44915539800000004)
  testTotalLinearDistance(rowingStatistics, 1.790756456114694)
  testTotalNumberOfStrokes(rowingStatistics, 1)
  testCycleDuration(rowingStatistics, undefined)
  testCycleDistance(rowingStatistics, undefined)
  testCycleLinearVelocity(rowingStatistics, undefined)
  testCyclePower(rowingStatistics, undefined)
  testDriveDuration(rowingStatistics, 0.143485717)
  testDriveDistance(rowingStatistics, 0.4271903319416174)
  testDriveLength(rowingStatistics, 0.1759291886010284)
  testDriveAverageHandleForce(rowingStatistics, 276.6342676838739)
  testDrivePeakHandleForce(rowingStatistics, 332.99182222129025)
  testRecoveryDuration(rowingStatistics, 0.21654112800000003)
  testDragFactor(rowingStatistics, 281.5961372923874)
  testInstantHandlePower(rowingStatistics, undefined)
  // Recovery second stroke starts here
  rowingStatistics.handleRotationImpulse(0.010769)
  rowingStatistics.handleRotationImpulse(0.010707554)
  rowingStatistics.handleRotationImpulse(0.010722165)
  rowingStatistics.handleRotationImpulse(0.01089567)
  rowingStatistics.handleRotationImpulse(0.010917504)
  rowingStatistics.handleRotationImpulse(0.010997969)
  rowingStatistics.handleRotationImpulse(0.011004655)
  rowingStatistics.handleRotationImpulse(0.011013618)
  rowingStatistics.handleRotationImpulse(0.011058193)
  rowingStatistics.handleRotationImpulse(0.010807149)
  rowingStatistics.handleRotationImpulse(0.0110626)
  rowingStatistics.handleRotationImpulse(0.011090787)
  rowingStatistics.handleRotationImpulse(0.011099509)
  rowingStatistics.handleRotationImpulse(0.011131862)
  rowingStatistics.handleRotationImpulse(0.011209919)
  testStrokeState(rowingStatistics, 'Recovery')
  testTotalMovingTime(rowingStatistics, 0.6101840930000001)
  testTotalLinearDistance(rowingStatistics, 2.521238308350271)
  testTotalNumberOfStrokes(rowingStatistics, 1)
  testCycleDuration(rowingStatistics, undefined)
  testCycleDistance(rowingStatistics, undefined)
  testCycleLinearVelocity(rowingStatistics, undefined)
  testCyclePower(rowingStatistics, undefined)
  testDriveDuration(rowingStatistics, 0.22872752900000004)
  testDriveDistance(rowingStatistics, 1.0226745931298076)
  testDriveLength(rowingStatistics, 0.3078760800517996)
  testDriveAverageHandleForce(rowingStatistics, 288.45140756259053)
  testDrivePeakHandleForce(rowingStatistics, 447.108514349131)
  testRecoveryDuration(rowingStatistics, 0.21654112800000003)
  testDragFactor(rowingStatistics, 281.5961372923874)
  testInstantHandlePower(rowingStatistics, undefined)
  // Drive third stroke starts here
  rowingStatistics.handleRotationImpulse(0.011221636)
  rowingStatistics.handleRotationImpulse(0.011175504)
  rowingStatistics.handleRotationImpulse(0.01116456)
  rowingStatistics.handleRotationImpulse(0.011130263)
  rowingStatistics.handleRotationImpulse(0.011082613)
  rowingStatistics.handleRotationImpulse(0.011081761)
  rowingStatistics.handleRotationImpulse(0.011062297)
  rowingStatistics.handleRotationImpulse(0.011051853)
  rowingStatistics.handleRotationImpulse(0.010973313)
  rowingStatistics.handleRotationImpulse(0.010919756)
  rowingStatistics.handleRotationImpulse(0.01086431)
  rowingStatistics.handleRotationImpulse(0.010800864)
  rowingStatistics.handleRotationImpulse(0.010956987)
  rowingStatistics.handleRotationImpulse(0.010653396)
  rowingStatistics.handleRotationImpulse(0.010648619)
  rowingStatistics.handleRotationImpulse(0.010536818)
  rowingStatistics.handleRotationImpulse(0.010526151)
  rowingStatistics.handleRotationImpulse(0.010511225)
  rowingStatistics.handleRotationImpulse(0.010386684)
  testStrokeState(rowingStatistics, 'Drive')
  testTotalMovingTime(rowingStatistics, 0.8203921620000004)
  testTotalLinearDistance(rowingStatistics, 3.4465153211820017)
  testTotalNumberOfStrokes(rowingStatistics, 2)
  testCycleDuration(rowingStatistics, undefined)
  testCycleDistance(rowingStatistics, undefined)
  testCycleLinearVelocity(rowingStatistics, undefined)
  testCyclePower(rowingStatistics, undefined)
  testDriveDuration(rowingStatistics, 0.22872752900000004)
  testDriveDistance(rowingStatistics, 1.0226745931298076)
  testDriveLength(rowingStatistics, 0.3078760800517996)
  testDriveAverageHandleForce(rowingStatistics, 288.45140756259053)
  testDrivePeakHandleForce(rowingStatistics, 447.108514349131)
  testRecoveryDuration(rowingStatistics, 0.09812447700000015)
  testDragFactor(rowingStatistics, 281.5961372923874)
  testInstantHandlePower(rowingStatistics, undefined)
  // Recovery third stroke starts here
  rowingStatistics.handleRotationImpulse(0.010769)
  rowingStatistics.handleRotationImpulse(0.010707554)
  rowingStatistics.handleRotationImpulse(0.010722165)
  rowingStatistics.handleRotationImpulse(0.01089567)
  rowingStatistics.handleRotationImpulse(0.010917504)
  rowingStatistics.handleRotationImpulse(0.010997969)
  rowingStatistics.handleRotationImpulse(0.011004655)
  rowingStatistics.handleRotationImpulse(0.011013618)
  rowingStatistics.handleRotationImpulse(0.011058193)
  rowingStatistics.handleRotationImpulse(0.010807149)
  rowingStatistics.handleRotationImpulse(0.0110626)
  rowingStatistics.handleRotationImpulse(0.011090787)
  rowingStatistics.handleRotationImpulse(0.011099509)
  rowingStatistics.handleRotationImpulse(0.011131862)
  rowingStatistics.handleRotationImpulse(0.011209919)
  testStrokeState(rowingStatistics, 'Recovery')
  testTotalMovingTime(rowingStatistics, 0.9814208570000005)
  testTotalLinearDistance(rowingStatistics, 4.176997173417578)
  testTotalNumberOfStrokes(rowingStatistics, 2)
  testCycleDuration(rowingStatistics, undefined)
  testCycleDistance(rowingStatistics, undefined)
  testCycleLinearVelocity(rowingStatistics, undefined)
  testCyclePower(rowingStatistics, undefined)
  testDriveDuration(rowingStatistics, 0.27311228700000023)
  testDriveDistance(rowingStatistics, 1.2174697537259611)
  testDriveLength(rowingStatistics, 0.36651914291880905)
  testDriveAverageHandleForce(rowingStatistics, 256.5447026931294)
  testDrivePeakHandleForce(rowingStatistics, 447.1085143512751)
  testRecoveryDuration(rowingStatistics, 0.09812447700000015)
  testDragFactor(rowingStatistics, 281.5961372923874)
  testInstantHandlePower(rowingStatistics, undefined)
  // Dwelling state starts here
  rowingStatistics.handleRotationImpulse(0.020769)
  rowingStatistics.handleRotationImpulse(0.020707554)
  rowingStatistics.handleRotationImpulse(0.020722165)
  rowingStatistics.handleRotationImpulse(0.02089567)
  rowingStatistics.handleRotationImpulse(0.020917504)
  rowingStatistics.handleRotationImpulse(0.020997969)
  rowingStatistics.handleRotationImpulse(0.021004655)
  rowingStatistics.handleRotationImpulse(0.021013618)
  rowingStatistics.handleRotationImpulse(0.021058193)
  rowingStatistics.handleRotationImpulse(0.020807149)
  rowingStatistics.handleRotationImpulse(0.0210626)
  rowingStatistics.handleRotationImpulse(0.021090787)
  rowingStatistics.handleRotationImpulse(0.021099509)
  rowingStatistics.handleRotationImpulse(0.021131862)
  rowingStatistics.handleRotationImpulse(0.021209919)
  testStrokeState(rowingStatistics, 'WaitingForDrive')
  testTotalMovingTime(rowingStatistics, 1.1344792920000004)
  testTotalNumberOfStrokes(rowingStatistics, 2)
  testTotalLinearDistance(rowingStatistics, 4.810081445355078)
  testCycleDuration(rowingStatistics, undefined)
  testCycleDistance(rowingStatistics, undefined)
  testCycleLinearVelocity(rowingStatistics, undefined)
  testCyclePower(rowingStatistics, undefined)
  testDriveDuration(rowingStatistics, undefined)
  testDriveDistance(rowingStatistics, undefined)
  testDriveLength(rowingStatistics, undefined)
  testDriveAverageHandleForce(rowingStatistics, undefined)
  testDrivePeakHandleForce(rowingStatistics, undefined)
  testRecoveryDuration(rowingStatistics, undefined)
  testDragFactor(rowingStatistics, 281.5961372923874)
  testInstantHandlePower(rowingStatistics, undefined)
})

/**
 * @todo Test the effects of smoothing parameters
 */

/**
 * @todo Test force curve behaviour
 */

/**
 * @todo Test behaviour after reset
 */

/**
 * @description Test against a theoretical model, based on perfect clean data, as described in
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/discussions/215|this discussion}
 */
test('Theoretical_02: Correct Rowingstatistics behaviour with perfect clean data', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Theoretical_Model)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    rowerSettings: rowerProfile
  }
  const rowingStatistics = createRowingStatistics(testConfig)
  testTotalMovingTime(rowingStatistics, 0)
  testTotalLinearDistance(rowingStatistics, 0)
  testTotalNumberOfStrokes(rowingStatistics, 0)
  testCycleDuration(rowingStatistics, undefined)
  testCycleDistance(rowingStatistics, undefined)
  testCycleLinearVelocity(rowingStatistics, undefined)
  testCyclePower(rowingStatistics, undefined)
  testDriveDuration(rowingStatistics, undefined)
  testDriveDistance(rowingStatistics, undefined)
  testDriveLength(rowingStatistics, undefined)
  testDriveAverageHandleForce(rowingStatistics, undefined)
  testDrivePeakHandleForce(rowingStatistics, undefined)
  testRecoveryDuration(rowingStatistics, undefined)
  testDragFactor(rowingStatistics, undefined)
  testInstantHandlePower(rowingStatistics, undefined)
  testDragFactor(rowingStatistics, undefined)

  await replayRowingSession(rowingStatistics.handleRotationImpulse, { filename: 'recordings/Theoretical_Simulation_Clean.csv', realtime: false, loop: false })

  testTotalMovingTime(rowingStatistics, 61.343050894547225)
  testTotalLinearDistance(rowingStatistics, 235.67436268645264)
  testTotalNumberOfStrokes(rowingStatistics, 19)
  // As the session has stopped, all data is supposed to be undefined again
  testCycleDuration(rowingStatistics, undefined)
  testCycleDistance(rowingStatistics, undefined)
  testCycleLinearVelocity(rowingStatistics, undefined)
  testCyclePower(rowingStatistics, undefined)
  testDriveDuration(rowingStatistics, undefined)
  testDriveDistance(rowingStatistics, undefined)
  testDriveLength(rowingStatistics, undefined)
  testDriveAverageHandleForce(rowingStatistics, undefined)
  testDrivePeakHandleForce(rowingStatistics, undefined)
  testRecoveryDuration(rowingStatistics, undefined)
  testInstantHandlePower(rowingStatistics, undefined)
  testDragFactor(rowingStatistics, 119.92470860873752) // Theoretical value 120 * 10^âˆ’6 [ k g m 2 ]
})

/**
 * @description Test against a theoretical model, based on noise-injected data, as described in
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/discussions/215|this discussion}
 */
test('Theoretical_03: Correct Rowingstatistics behaviour with noise-injected data', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Theoretical_Model)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    rowerSettings: rowerProfile
  }
  const rowingStatistics = createRowingStatistics(testConfig)
  testTotalMovingTime(rowingStatistics, 0)
  testTotalLinearDistance(rowingStatistics, 0)
  testTotalNumberOfStrokes(rowingStatistics, 0)
  testCycleDuration(rowingStatistics, undefined)
  testCycleDistance(rowingStatistics, undefined)
  testCycleLinearVelocity(rowingStatistics, undefined)
  testCyclePower(rowingStatistics, undefined)
  testDriveDuration(rowingStatistics, undefined)
  testDriveDistance(rowingStatistics, undefined)
  testDriveLength(rowingStatistics, undefined)
  testDriveAverageHandleForce(rowingStatistics, undefined)
  testDrivePeakHandleForce(rowingStatistics, undefined)
  testRecoveryDuration(rowingStatistics, undefined)
  testInstantHandlePower(rowingStatistics, undefined)
  testDragFactor(rowingStatistics, undefined)

  await replayRowingSession(rowingStatistics.handleRotationImpulse, { filename: 'recordings/Theoretical_Simulation_Random_Noise.csv', realtime: false, loop: false })

  testTotalMovingTime(rowingStatistics, 181.35954479988044)
  testTotalLinearDistance(rowingStatistics, 706.3578534826354)
  testTotalNumberOfStrokes(rowingStatistics, 59)
  testCycleDuration(rowingStatistics, undefined)
  testCycleDistance(rowingStatistics, undefined)
  testCycleLinearVelocity(rowingStatistics, undefined)
  testCyclePower(rowingStatistics, undefined)
  testDriveDuration(rowingStatistics, undefined)
  testDriveDistance(rowingStatistics, undefined)
  testDriveLength(rowingStatistics, undefined)
  testDriveAverageHandleForce(rowingStatistics, undefined)
  testDrivePeakHandleForce(rowingStatistics, undefined)
  testRecoveryDuration(rowingStatistics, undefined)
  testInstantHandlePower(rowingStatistics, undefined)
  testDragFactor(rowingStatistics, 119.95812733742444) // Theoretical value 120 * 10^âˆ’6 [ k g m 2 ]
})

/**
 * @description Test against a theoretical model, based on a simulation of magnet positioning errors, as described in
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/discussions/215|this discussion}
 * Magnet errors -0.01, +0.1, +0.2, -0.2, -0.1, +0.01 degrees
 */
test('Theoretical_04: Correct Rowingstatistics behaviour with structural magnet errors', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Theoretical_Model)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    rowerSettings: rowerProfile
  }
  const rowingStatistics = createRowingStatistics(testConfig)
  testTotalMovingTime(rowingStatistics, 0)
  testTotalLinearDistance(rowingStatistics, 0)
  testTotalNumberOfStrokes(rowingStatistics, 0)
  testCycleDuration(rowingStatistics, undefined)
  testCycleDistance(rowingStatistics, undefined)
  testCycleLinearVelocity(rowingStatistics, undefined)
  testCyclePower(rowingStatistics, undefined)
  testDriveDuration(rowingStatistics, undefined)
  testDriveDistance(rowingStatistics, undefined)
  testDriveLength(rowingStatistics, undefined)
  testDriveAverageHandleForce(rowingStatistics, undefined)
  testDrivePeakHandleForce(rowingStatistics, undefined)
  testRecoveryDuration(rowingStatistics, undefined)
  testInstantHandlePower(rowingStatistics, undefined)
  testDragFactor(rowingStatistics, undefined)

  await replayRowingSession(rowingStatistics.handleRotationImpulse, { filename: 'recordings/Theoretical_Simulation_Systematic_Noise.csv', realtime: false, loop: false })

  testTotalMovingTime(rowingStatistics, 181.3424733944077)
  testTotalLinearDistance(rowingStatistics, 706.291973992365)
  testTotalNumberOfStrokes(rowingStatistics, 59)
  testCycleDuration(rowingStatistics, undefined)
  testCycleDistance(rowingStatistics, undefined)
  testCycleLinearVelocity(rowingStatistics, undefined)
  testCyclePower(rowingStatistics, undefined)
  testDriveDuration(rowingStatistics, undefined)
  testDriveDistance(rowingStatistics, undefined)
  testDriveLength(rowingStatistics, undefined)
  testDriveAverageHandleForce(rowingStatistics, undefined)
  testDrivePeakHandleForce(rowingStatistics, undefined)
  testRecoveryDuration(rowingStatistics, undefined)
  testInstantHandlePower(rowingStatistics, undefined)
  testDragFactor(rowingStatistics, 119.92470860871332) // Theoretical value 120 * 10^âˆ’6 [ k g m 2 ]
})

/**
 * @description Test behaviour for the C2 Model C
 */
test('C2_ModelC_01: A full session for a Concept2 Model C should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Concept2_Model_C)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    rowerSettings: rowerProfile
  }
  const rowingStatistics = createRowingStatistics(testConfig)
  testTotalMovingTime(rowingStatistics, 0)
  testTotalLinearDistance(rowingStatistics, 0)
  testTotalNumberOfStrokes(rowingStatistics, 0)
  testDragFactor(rowingStatistics, undefined)

  await replayRowingSession(rowingStatistics.handleRotationImpulse, { filename: 'recordings/Concept2_Model_C.csv', realtime: false, loop: false })

  testIsMoving(rowingStatistics, true) // As data has stopped abrubtly and the last drive is 4 sec ago, rowingStatistics's watchdog hasn't been triggered yet
  testIsDriveStart(rowingStatistics, false)
  testIsRecoveryStart(rowingStatistics, false)
  testTotalMovingTime(rowingStatistics, 181.4588596531004)
  testTotalLinearDistance(rowingStatistics, 552.4833037536148)
  testTotalWork(rowingStatistics, 20593.15388304616)
  testTotalCalories(rowingStatistics, 34.73409914542138)
  testTotalCaloriesPerMinute(rowingStatistics, 12.371981079533317)
  testTotalCaloriesPerHour (rowingStatistics, 742.318864771999)
  testTotalNumberOfStrokes(rowingStatistics, 80)
  testStrokeState(rowingStatistics, 'Drive')
  testStrokeWork(rowingStatistics, 25.512113604279875)
  testStrokeCalories(rowingStatistics, 0.21500383832546952)
  testCycleDistance(rowingStatistics, 2.9525168987431822)
  testCycleStrokeRate(rowingStatistics, 24.336340661672818)
  testCycleDuration(rowingStatistics, 2.465448722719998)
  testCycleLinearVelocity(rowingStatistics, 1.2061131266447134)
  testCyclePace(rowingStatistics, 414.55481161286275)
  testCyclePower(rowingStatistics, 4.971183651233226)
  testDriveLastStartTime (rowingStatistics, 177.31209030312513)
  testDriveDuration(rowingStatistics, 0.7592322967347798)
  testDriveLength(rowingStatistics, 0.38117990863556767)
  testDriveDistance(rowingStatistics, 0.9595679920915494)
  testDriveAverageHandleForce(rowingStatistics, 102.2713643967354)
  testDrivePeakHandleForce(rowingStatistics, 212.5533895691384)
  testRecoveryDuration(rowingStatistics, 1.983892772108078)
  testDragFactor(rowingStatistics, 122.56864708679767)
})

/**
 * @description Test behaviour for the C2 RowErg
 */
test('C2_RowErg_01: A full session for a Concept2 RowErg should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Concept2_RowErg)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    rowerSettings: rowerProfile
  }
  const rowingStatistics = createRowingStatistics(testConfig)
  testTotalMovingTime(rowingStatistics, 0)
  testTotalLinearDistance(rowingStatistics, 0)
  testTotalNumberOfStrokes(rowingStatistics, 0)
  testDragFactor(rowingStatistics, undefined)

  await replayRowingSession(rowingStatistics.handleRotationImpulse, { filename: 'recordings/Concept2_RowErg_Session_2000meters.csv', realtime: false, loop: false })

  testIsMoving(rowingStatistics, true) // As data stops abrubtly, the flywheel will not have timed out
  testIsDriveStart(rowingStatistics, false)
  testIsRecoveryStart(rowingStatistics, false)
  testTotalMovingTime(rowingStatistics, 589.9664157362346)
  testTotalLinearDistance(rowingStatistics, 2028.3093228150667)
  testTotalWork(rowingStatistics, 67751.31484279277)
  testTotalCalories(rowingStatistics, 113.68892973306028)
  testTotalCaloriesPerMinute(rowingStatistics, 11.542360132437295)
  testTotalCaloriesPerHour (rowingStatistics, 692.5416079462377)
  testTotalNumberOfStrokes(rowingStatistics, 205)
  testStrokeState(rowingStatistics, 'Recovery')
  testStrokeWork(rowingStatistics, 330.7759067800944)
  testStrokeCalories(rowingStatistics, 0.5617995397938088)
  testCycleDistance(rowingStatistics, 10.261713455631917)
  testCycleStrokeRate(rowingStatistics, 20.26138264188829)
  testCycleDuration(rowingStatistics, 2.9612984000389133)
  testCycleLinearVelocity(rowingStatistics, 3.4650957806968687)
  testCyclePace(rowingStatistics, 144.29615561721775)
  testCyclePower(rowingStatistics, 116.49419766383924)
  testDriveLastStartTime (rowingStatistics, 587.302081036686) // Since the last drive is witin 6 seconds, the Flywheel.js has not been able to trigger a pause yet
  testDriveDuration(rowingStatistics, 0.7332495742683705)
  testDriveLength(rowingStatistics, 1.1728612573401769)
  testDriveDistance(rowingStatistics, 2.5693271336160244)
  testDriveAverageHandleForce(rowingStatistics, 284.3396357312365)
  testDrivePeakHandleForce(rowingStatistics, 444.35598591963236)
  testRecoveryDuration(rowingStatistics, 2.2585963714949457)
  testDragFactor(rowingStatistics, 80.77192371126783)
})

/**
 * @description Test behaviour for the DKN R-320
 */
test('DKN_R320_01: sample data for DKN R-320 should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.DKN_R320)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    rowerSettings: rowerProfile
  }
  const rowingStatistics = createRowingStatistics(testConfig)
  testTotalMovingTime(rowingStatistics, 0)
  testTotalLinearDistance(rowingStatistics, 0)
  testTotalNumberOfStrokes(rowingStatistics, 0)
  testDragFactor(rowingStatistics, undefined)

  await replayRowingSession(rowingStatistics.handleRotationImpulse, { filename: 'recordings/DKNR320.csv', realtime: false, loop: false })

  testIsMoving(rowingStatistics, true) // The recording stops abrubtly, and rowingStatistics's watchdog hasn't kicked in yet
  testIsDriveStart(rowingStatistics, false)
  testIsRecoveryStart(rowingStatistics, false)
  testTotalMovingTime(rowingStatistics, 21.701535821)
  testTotalLinearDistance(rowingStatistics, 69.20242183779045)
  testTotalWork(rowingStatistics, 5200.736822863752)
  testTotalCalories(rowingStatistics, 6.761544006858335)
  testTotalCaloriesPerMinute(rowingStatistics, 19.726851654537608)
  testTotalCaloriesPerHour (rowingStatistics, 1183.6110992722565)
  testTotalNumberOfStrokes(rowingStatistics, 9)
  testStrokeState(rowingStatistics, 'Recovery')
  testStrokeWork(rowingStatistics, 646.220649414442)
  testStrokeCalories(rowingStatistics, 0.8038903655792305)
  testCycleDistance(rowingStatistics, 7.284465456609526)
  testCycleStrokeRate(rowingStatistics, 26.533345021949888)
  testCycleDuration(rowingStatistics, 2.2613055365)
  testCycleLinearVelocity(rowingStatistics, 3.2218652746225382)
  testCyclePace(rowingStatistics, 155.189605207368)
  testCyclePower(rowingStatistics, 93.68863152770354)
  testDriveLastStartTime (rowingStatistics, 19.511980053000002)
  testDriveDuration(rowingStatistics, 1.2778628719999965)
  testDriveLength(rowingStatistics, 1.7592918860102824)
  testDriveDistance(rowingStatistics, 3.642232728304757)
  testDriveAverageHandleForce(rowingStatistics, 385.62555350976965)
  testDrivePeakHandleForce(rowingStatistics, 604.6392224523523)
  testRecoveryDuration(rowingStatistics, 1.011930944000003)
  testDragFactor(rowingStatistics, rowerProfiles.DKN_R320.dragFactor) // This is a fixed-drag machine
})

/**
 * @description Test behaviour for the NordicTrack RX800
 */
test('NordicT_RX800_01: sample data for NordicTrack RX800 should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.NordicTrack_RX800)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    rowerSettings: rowerProfile
  }
  const rowingStatistics = createRowingStatistics(testConfig)
  testTotalMovingTime(rowingStatistics, 0)
  testTotalLinearDistance(rowingStatistics, 0)
  testTotalNumberOfStrokes(rowingStatistics, 0)
  testDragFactor(rowingStatistics, undefined)

  await replayRowingSession(rowingStatistics.handleRotationImpulse, { filename: 'recordings/RX800.csv', realtime: false, loop: false })

  testIsMoving(rowingStatistics, true) // The recording stops abrubtly, and rowingStatistics's watchdog hasn't kicked in yet
  testIsDriveStart(rowingStatistics, false)
  testIsRecoveryStart(rowingStatistics, false)
  testTotalMovingTime(rowingStatistics, 22.368358745999995)
  testTotalLinearDistance(rowingStatistics, 80.8365747440095)
  testTotalWork(rowingStatistics, 3132.9891152627774)
  testTotalCalories(rowingStatistics, 4.847829052893121)
  testTotalCaloriesPerMinute(rowingStatistics, 12.915884067211993)
  testTotalCaloriesPerHour (rowingStatistics, 774.9530440327195)
  testTotalNumberOfStrokes(rowingStatistics, 9)
  testStrokeState(rowingStatistics, 'Recovery')
  testStrokeWork(rowingStatistics, 298.42006474992013)
  testStrokeCalories(rowingStatistics, 0.47141003264278075)
  testCycleDistance(rowingStatistics, 8.14484194775459)
  testCycleStrokeRate(rowingStatistics, 26.709337908517135)
  testCycleDuration(rowingStatistics, 2.246405365999996)
  testCycleLinearVelocity(rowingStatistics, 3.627196444262048)
  testCyclePace(rowingStatistics, 137.84751051765127)
  testCyclePower(rowingStatistics, 133.6207873388181)
  testDriveLastStartTime (rowingStatistics, 20.24632183399998)
  testDriveDuration(rowingStatistics, 0.6251555590000031)
  testDriveLength(rowingStatistics, 1.2252211349000253)
  testDriveDistance(rowingStatistics, 2.290304983280253)
  testDriveAverageHandleForce(rowingStatistics, 242.21443734968256)
  testDrivePeakHandleForce(rowingStatistics, 389.6437952657745)
  testRecoveryDuration(rowingStatistics, 1.612378919999994)
  testDragFactor(rowingStatistics, 493.8082148322739)
})

/**
 * @description Test against the Merarch R50
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/discussions/140|this discussion}
 */
test('Merarch_R50_01: Data with Merarch R50 should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Merach_R50)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    rowerSettings: rowerProfile
  }

  const rowingStatistics = createRowingStatistics(testConfig)
  testTotalMovingTime(rowingStatistics, 0)
  testTotalLinearDistance(rowingStatistics, 0)
  testTotalNumberOfStrokes(rowingStatistics, 0)
  testDragFactor(rowingStatistics, undefined)

  await replayRowingSession(rowingStatistics.handleRotationImpulse, { filename: 'recordings/Merach_R50_510m.csv', realtime: false, loop: false })

  testIsMoving(rowingStatistics, false)
  testIsDriveStart(rowingStatistics, false)
  testIsRecoveryStart(rowingStatistics, false)
  testTotalMovingTime(rowingStatistics, 129.219922)
  testTotalLinearDistance(rowingStatistics, 510.8083338801155)
  testTotalWork(rowingStatistics, 22829.81352857388)
  testTotalCalories(rowingStatistics, 32.51100638435607)
  testTotalCaloriesPerMinute(rowingStatistics, 15.52334646861831)
  testTotalCaloriesPerHour (rowingStatistics, 931.4007881170988)
  testTotalNumberOfStrokes(rowingStatistics, 49)
  testStrokeState(rowingStatistics, 'WaitingForDrive')
  testStrokeWork(rowingStatistics, undefined)
  testStrokeCalories(rowingStatistics, undefined)
  testCycleDistance(rowingStatistics, undefined)
  testCycleStrokeRate(rowingStatistics, undefined)
  testCycleDuration(rowingStatistics, undefined)
  testCycleLinearVelocity(rowingStatistics, undefined)
  testCyclePace(rowingStatistics, Infinity)
  testCyclePower(rowingStatistics, undefined)
  testDriveLastStartTime (rowingStatistics, 123.22668199999998)
  testDriveDuration(rowingStatistics, undefined)
  testDriveLength(rowingStatistics, undefined)
  testDriveDistance(rowingStatistics, undefined)
  testDriveAverageHandleForce(rowingStatistics, undefined)
  testDrivePeakHandleForce(rowingStatistics, undefined)
  testRecoveryDuration(rowingStatistics, undefined)
  testDragFactor(rowingStatistics, 123.2635201451201)
})

/**
 * @description Test against the Oartec Slider
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/discussions/218|this discussion}
 */
test('Oartec_Slider_01: Test for the Oartec Slider on a 190 meters run', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Oartec_Slider)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    rowerSettings: rowerProfile
  }

  const rowingStatistics = createRowingStatistics(testConfig)
  testTotalMovingTime(rowingStatistics, 0)
  testTotalLinearDistance(rowingStatistics, 0)
  testTotalNumberOfStrokes(rowingStatistics, 0)
  testDragFactor(rowingStatistics, undefined)

  await replayRowingSession(rowingStatistics.handleRotationImpulse, { filename: 'recordings/Oartec_Slider.csv', realtime: false, loop: false })

  testIsMoving(rowingStatistics, false)
  testIsDriveStart(rowingStatistics, false)
  testIsRecoveryStart(rowingStatistics, false)
  testTotalMovingTime(rowingStatistics, 58.26220982176262)
  testTotalLinearDistance(rowingStatistics, 195.08912586384486)
  testTotalWork(rowingStatistics, 7140.670099435771)
  testTotalCalories(rowingStatistics, 11.655822341752382)
  testTotalCaloriesPerMinute(rowingStatistics, 13.934098177873182)
  testTotalCaloriesPerHour (rowingStatistics, 836.0458906723909)
  testTotalNumberOfStrokes(rowingStatistics, 13)
  testStrokeState(rowingStatistics, 'WaitingForDrive')
  testStrokeWork(rowingStatistics, undefined)
  testStrokeCalories(rowingStatistics, undefined)
  testCycleDistance(rowingStatistics, undefined)
  testCycleStrokeRate(rowingStatistics, undefined)
  testCycleDuration(rowingStatistics, undefined)
  testCycleLinearVelocity(rowingStatistics, undefined)
  testCyclePace(rowingStatistics, Infinity)
  testCyclePower(rowingStatistics, undefined)
  testDriveLastStartTime (rowingStatistics, 44.9507183497444)
  testDriveDuration(rowingStatistics, undefined)
  testDriveLength(rowingStatistics, undefined)
  testDriveDistance(rowingStatistics, undefined)
  testDriveAverageHandleForce(rowingStatistics, undefined)
  testDrivePeakHandleForce(rowingStatistics, undefined)
  testRecoveryDuration(rowingStatistics, undefined)
  testDragFactor(rowingStatistics, 171.65666790675232)
})

/**
 * @description Test against the Schwinn Windrigger
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/discussions/159|this discussion}
 */
test('Schwinn_Wndrggr_01: Test of the Schwinn Windrigger', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Schwinn_Windrigger)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    rowerSettings: rowerProfile
  }

  const rowingStatistics = createRowingStatistics(testConfig)
  testTotalMovingTime(rowingStatistics, 0)
  testTotalLinearDistance(rowingStatistics, 0)
  testTotalNumberOfStrokes(rowingStatistics, 0)
  testDragFactor(rowingStatistics, undefined)

  await replayRowingSession(rowingStatistics.handleRotationImpulse, { filename: 'recordings/Schwinn_Windrigger.csv', realtime: false, loop: false })

  testIsMoving(rowingStatistics, false)
  testIsDriveStart(rowingStatistics, false)
  testIsRecoveryStart(rowingStatistics, false)
  testTotalMovingTime(rowingStatistics, 120.29544599999997)
  testTotalLinearDistance(rowingStatistics, 431.5031059961717)
  testTotalWork(rowingStatistics, 18455.110628084884)
  testTotalCalories(rowingStatistics, 27.600916336271315)
  testTotalCaloriesPerMinute(rowingStatistics, 14.955024168523664)
  testTotalCaloriesPerHour (rowingStatistics, 897.30145011142)
  testTotalNumberOfStrokes(rowingStatistics, 46)
  testStrokeState(rowingStatistics, 'WaitingForDrive')
  testStrokeWork(rowingStatistics, undefined)
  testStrokeCalories(rowingStatistics, undefined)
  testCycleDistance(rowingStatistics, undefined)
  testCycleStrokeRate(rowingStatistics, undefined)
  testCycleDuration(rowingStatistics, undefined)
  testCycleLinearVelocity(rowingStatistics, undefined)
  testCyclePace(rowingStatistics, Infinity)
  testCyclePower(rowingStatistics, undefined)
  testDriveLastStartTime (rowingStatistics, 111.44649600000002)
  testDriveDuration(rowingStatistics, undefined)
  testDriveLength(rowingStatistics, undefined)
  testDriveDistance(rowingStatistics, undefined)
  testDriveAverageHandleForce(rowingStatistics, undefined)
  testDrivePeakHandleForce(rowingStatistics, undefined)
  testRecoveryDuration(rowingStatistics, undefined)
  testDragFactor(rowingStatistics, 229.67514256584752)
})

/**
 * @description Test behaviour for the Sportstech WRX700
 */
test('Sportstech_WRX700_01: sample data for Sportstech WRX700 should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    rowerSettings: rowerProfile
  }
  const rowingStatistics = createRowingStatistics(testConfig)
  testTotalMovingTime(rowingStatistics, 0)
  testTotalLinearDistance(rowingStatistics, 0)
  testTotalNumberOfStrokes(rowingStatistics, 0)
  testDragFactor(rowingStatistics, undefined)

  await replayRowingSession(rowingStatistics.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets.csv', realtime: false, loop: false })

  testIsMoving(rowingStatistics, true) // The recording stops abrubtly, and rowingStatistics's watchdog hasn't kicked in yet
  testIsDriveStart(rowingStatistics, false)
  testIsRecoveryStart(rowingStatistics, false)
  testTotalMovingTime(rowingStatistics, 46.302522627)
  testTotalLinearDistance(rowingStatistics, 165.58832475070278)
  testTotalWork(rowingStatistics, 9748.548017262458)
  testTotalCalories(rowingStatistics, 13.142874997261865)
  testTotalCaloriesPerMinute(rowingStatistics, 16.06317491735509)
  testTotalCaloriesPerHour (rowingStatistics, 963.7904950413053)
  testTotalNumberOfStrokes(rowingStatistics, 15)
  testStrokeState(rowingStatistics, 'Recovery')
  testStrokeWork(rowingStatistics, 763.0876311342454)
  testStrokeCalories(rowingStatistics, 0.9544143736814243)
  testCycleDistance(rowingStatistics, 10.968457408700388)
  testCycleStrokeRate(rowingStatistics, 21.96216589358063)
  testCycleDuration(rowingStatistics, 2.731970985500002)
  testCycleLinearVelocity(rowingStatistics, 4.015620240977591)
  testCyclePace(rowingStatistics, 124.51376624156981)
  testCyclePower(rowingStatistics, 181.32184485208828)
  testDriveLastStartTime (rowingStatistics, 42.953401899000006)
  testDriveDuration(rowingStatistics, 1.297822779999997)
  testDriveLength(rowingStatistics, 1.7592918860102864)
  testDriveDistance(rowingStatistics, 5.661139307716341)
  testDriveAverageHandleForce(rowingStatistics, 347.2288656270118)
  testDrivePeakHandleForce(rowingStatistics, 634.0186435697934)
  testRecoveryDuration(rowingStatistics, 1.332040928000005)
  testDragFactor(rowingStatistics, rowerProfiles.Sportstech_WRX700.dragFactor)
})

/**
 * @description Test behaviour for the SportsTech WRX700 in a full session
 */
test('Sportstech_WRX700_02: A full session for SportsTech WRX700 should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    rowerSettings: rowerProfile
  }
  const rowingStatistics = createRowingStatistics(testConfig)
  testTotalMovingTime(rowingStatistics, 0)
  testTotalLinearDistance(rowingStatistics, 0)
  testTotalNumberOfStrokes(rowingStatistics, 0)
  testDragFactor(rowingStatistics, undefined)

  await replayRowingSession(rowingStatistics.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets_session.csv', realtime: false, loop: false })

  testIsMoving(rowingStatistics, true) // There were no timeouts yet
  testIsDriveStart(rowingStatistics, false)
  testIsRecoveryStart(rowingStatistics, false)
  testTotalMovingTime(rowingStatistics, 2340.0100514160117)
  testTotalLinearDistance(rowingStatistics, 8406.084229545408)
  testTotalWork(rowingStatistics, 487699.09367508633)
  testTotalCalories(rowingStatistics, 659.476164927607)
  testTotalCaloriesPerMinute(rowingStatistics, 17.199317176667705)
  testTotalCaloriesPerHour (rowingStatistics, 1031.959030600064)
  testTotalNumberOfStrokes(rowingStatistics, 845)
  testStrokeState(rowingStatistics, 'Recovery')
  testStrokeWork(rowingStatistics, 395.80950222397223)
  testStrokeCalories(rowingStatistics, 0.5966066672311777)
  testCycleDistance(rowingStatistics, 9.553172581771296)
  testCycleStrokeRate(rowingStatistics, 22.763981039266426)
  testCycleDuration(rowingStatistics, 2.635742838500164)
  testCycleLinearVelocity(rowingStatistics, 3.624974543637083)
  testCyclePace(rowingStatistics, 137.93200310265624)
  testCyclePower(rowingStatistics, 134.02976389064236)
  testDriveLastStartTime (rowingStatistics, 2336.8188294280117)
  testDriveDuration(rowingStatistics, 1.3936550620001071)
  testDriveLength(rowingStatistics, 1.5393804002590334)
  testDriveDistance(rowingStatistics, 4.953496894251904)
  testDriveAverageHandleForce(rowingStatistics, 210.6300325410566)
  testDrivePeakHandleForce(rowingStatistics, 352.68327935116827)
  testRecoveryDuration(rowingStatistics, 1.251141552000263)
  testDragFactor(rowingStatistics, rowerProfiles.Sportstech_WRX700.dragFactor)
})

/**
 * @description Test against the Topiom V2
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/discussions/144|this discussion}
 */
test('TopiomV2_01: Data for the Topiom V2 should produce plausible results for 9750 meter run', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Topiom_V2)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    userSettings: {
      sex: 'male'
    },
    rowerSettings: rowerProfile
  }
  const rowingStatistics = createRowingStatistics(testConfig)
  testTotalMovingTime(rowingStatistics, 0)
  testTotalLinearDistance(rowingStatistics, 0)
  testTotalNumberOfStrokes(rowingStatistics, 0)
  testDragFactor(rowingStatistics, undefined)

  await replayRowingSession(rowingStatistics.handleRotationImpulse, { filename: 'recordings/Topiom_V2_1magnet.csv', realtime: false, loop: false })

  testIsMoving(rowingStatistics, false)
  testIsDriveStart(rowingStatistics, false)
  testIsRecoveryStart(rowingStatistics, false)
  testTotalMovingTime(rowingStatistics, 2443.167392999993)
  testTotalLinearDistance(rowingStatistics, 9784.558725355426)
  testTotalWork(rowingStatistics, 390420.6310543407)
  testTotalCalories(rowingStatistics, 575.4264551827048)
  testTotalCaloriesPerMinute(rowingStatistics, 14.085069675489422)
  testTotalCaloriesPerHour (rowingStatistics, 845.1041805293637)
  testTotalNumberOfStrokes(rowingStatistics, 1200)
  testStrokeState(rowingStatistics, 'WaitingForDrive')
  testStrokeWork(rowingStatistics, undefined)
  testStrokeCalories(rowingStatistics, undefined)
  testCycleDistance(rowingStatistics, undefined)
  testCycleStrokeRate(rowingStatistics, undefined)
  testCycleDuration(rowingStatistics, undefined)
  testCycleLinearVelocity(rowingStatistics, undefined)
  testCyclePace(rowingStatistics, Infinity)
  testCyclePower(rowingStatistics, undefined)
  testDriveLastStartTime (rowingStatistics, 2437.8734489999933)
  testDriveDuration(rowingStatistics, undefined)
  testDriveLength(rowingStatistics, undefined)
  testDriveDistance(rowingStatistics, undefined)
  testDriveAverageHandleForce(rowingStatistics, undefined)
  testDrivePeakHandleForce(rowingStatistics, undefined)
  testRecoveryDuration(rowingStatistics, undefined)
  testDragFactor(rowingStatistics, rowerProfiles.Topiom_V2.dragFactor)
})

function testIsMoving (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().metricsContext.isMoving === expectedValue, `isMoving should be ${expectedValue} at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().metricsContext.isMoving}`)
}

function testIsDriveStart (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().metricsContext.isDriveStart === expectedValue, `isDriveStart should be ${expectedValue} at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().metricsContext.isDriveStart}`)
}

function testIsRecoveryStart (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().metricsContext.isRecoveryStart === expectedValue, `isRecoveryStart should be ${expectedValue} at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().metricsContext.isRecoveryStart}`)
}

function testStrokeState (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().strokeState === expectedValue, `strokeState should be ${expectedValue} at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().strokeState}`)
}

function testTotalMovingTime (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().totalMovingTime === expectedValue, `totalMovingTime should be ${expectedValue} sec at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().totalMovingTime}`)
}

function testTotalWork (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().totalWork === expectedValue, `totalWork should be ${expectedValue} Joules at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().totalWork}`)
}

function testTotalCalories (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().totalCalories === expectedValue, `totalCalories should be ${expectedValue} kCal at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().totalCalories}`)
}

function testTotalCaloriesPerMinute (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().totalCaloriesPerMinute === expectedValue, `totalCaloriesPerMinute should be ${expectedValue} kCal at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().totalCaloriesPerMinute}`)
}

function testTotalCaloriesPerHour (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().totalCaloriesPerHour === expectedValue, `totalCaloriesPerHour should be ${expectedValue} kCal at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().totalCaloriesPerHour}`)
}

function testTotalNumberOfStrokes (rowingStatistics, expectedValue) {
  // Please note there is a stroke 0
  assert.ok(rowingStatistics.getMetrics().totalNumberOfStrokes === expectedValue, `totalNumberOfStrokes should be ${expectedValue} at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().totalNumberOfStrokes}`)
}

function testTotalLinearDistance (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().totalLinearDistance === expectedValue, `totalLinearDistance should be ${expectedValue} meters at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().totalLinearDistance}`)
}

function testStrokeWork (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().strokeWork === expectedValue, ` should be ${expectedValue} Joules at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().strokeWork}`)
}

function testStrokeCalories (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().strokeCalories === expectedValue, `strokeCalories should be ${expectedValue} kCal at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().strokeCalories}`)
}

function testCycleDuration (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().cycleDuration === expectedValue, `cycleDuration should be ${expectedValue} sec at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().cycleDuration}`)
}

function testCycleDistance (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().cycleDistance === expectedValue, `cycleDistance should be ${expectedValue} meters at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().cycleDistance}`)
}

function testCycleLinearVelocity (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().cycleLinearVelocity === expectedValue, `cycleLinearVelocity should be ${expectedValue} m/s at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().cycleLinearVelocity}`)
}

function testCycleStrokeRate (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().cycleStrokeRate === expectedValue, ` should be ${expectedValue} SPM at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().cycleStrokeRate}`)
}

function testCyclePace (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().cyclePace === expectedValue, `cyclePace should be ${expectedValue} sec/500m at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().cyclePace}`)
}

function testCyclePower (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().cyclePower === expectedValue, `cyclePower should be ${expectedValue} Watt at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().cyclePower}`)
}

function testDriveLastStartTime (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().driveLastStartTime === expectedValue, `driveLastStartTime should be ${expectedValue} sec at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().driveLastStartTime}`)
}

function testDriveDuration (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().driveDuration === expectedValue, `driveDuration should be ${expectedValue} sec at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().driveDuration}`)
}

function testDriveDistance (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().driveDistance === expectedValue, `DriveDistance should be ${expectedValue} meters at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().driveDistance}`)
}

function testDriveLength (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().driveLength === expectedValue, `driveLength should be ${expectedValue} meters at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().driveLength}`)
}

function testDriveAverageHandleForce (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().driveAverageHandleForce === expectedValue, `driveAverageHandleForce should be ${expectedValue} N at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().driveAverageHandleForce}`)
}

function testDrivePeakHandleForce (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().drivePeakHandleForce === expectedValue, `drivePeakHandleForce should be ${expectedValue} N at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().drivePeakHandleForce}`)
}

function testRecoveryDuration (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().recoveryDuration === expectedValue, `recoveryDuration should be ${expectedValue} sec at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().recoveryDuration}`)
}

function testDragFactor (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().dragFactor === expectedValue, `dragFactor should be ${expectedValue} N*m*s^2 at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().dragFactor}`)
}

function testInstantHandlePower (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().instantHandlePower === expectedValue, `instantHandlePower should be ${expectedValue} Watt at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().instantHandlePower}`)
}

function reportAll (rowingStatistics) { // eslint-disable-line no-unused-vars
  assert.ok(0, `time: ${rowingStatistics.getMetrics().totalMovingTime}, state ${rowingStatistics.getMetrics().strokeState}, No Strokes: ${rowingStatistics.getMetrics().totalNumberOfStrokes + 1}, Lin Distance: ${rowingStatistics.getMetrics().totalLinearDistance}, cycle dur: ${rowingStatistics.getMetrics().cycleDuration}, cycle Lin Dist: ${rowingStatistics.getMetrics().cycleLinearDistance}, Lin Velocity: ${rowingStatistics.getMetrics().cycleLinearVelocity}, Power: ${rowingStatistics.getMetrics().cyclePower}, Drive Dur: ${rowingStatistics.getMetrics().driveDuration}, Drive Lin. Dist. ${rowingStatistics.driveDistance}, Drive Length: ${rowingStatistics.getMetrics().driveLength}, Av. Handle Force: ${rowingStatistics.getMetrics().driveAverageHandleForce}, Peak Handle Force: ${rowingStatistics.getMetrics().drivePeakHandleForce}, Rec. Dur: ${rowingStatistics.getMetrics().recoveryDuration}, Dragfactor: ${rowingStatistics.getMetrics().dragFactor}, Inst Handle Power: ${rowingStatistics.getMetrics().instantHandlePower}`)
}

test.run()
