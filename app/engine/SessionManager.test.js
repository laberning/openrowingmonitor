'use strict'
/**
 * @copyright [OpenRowingMonitor]{@link https://github.com/JaapvanEkris/openrowingmonitor}
 *
 * @file This test is a test of the SessionManager, that tests wether this object fills all fields correctly,
 * and cuts off a session, interval and split decently
 *
 * Aside testing all the fully supported machine profiles and verify metrics accuracy, we also test SessionManager's behaviour (in order of increasing complexity):
 * - C2_ModelC_01: Basic 'justrow' session (basis for metrics of subsequent tests), abrupt data stop (no Flywheel-timeout)
 * - C2_ModelC_02: Single 2K distance interval, no splits
 * - C2_ModelC_03: Single time interval, no splits
 * - C2_ModelC_04: Single Calories interval, no splits
 * - C2_RowErg_01: Basic 'justrow' session, no splits (basis for metrics of subsequent tests), abrupt data stop (no Flywheel-timeout)
 * - C2_RowErg_02: Single 2K distance interval, no splits
 * - C2_RowErg_03: Single time interval, after initially setting a 2K distance interval (i.e. overwriting)
 * - C2_RowErg_04: Single Calories interval, no splits
 * - Merarch_R50_01: Single distance interval, including splits
 * - Oartec_Slider_01: Basic 'justrow' session (basic machine profile test), with Flywheel-timeout
 * - DKN_R320_01: Basic 'justrow' session (basic machine profile test), abrupt data stop (no Flywheel-timeout)
 * - NordicT_RX800_01: Basic 'justrow' session (basic machine profile test), abrupt data stop (no Flywheel-timeout)
 * - NordicT_RX800_02: Single floating point time interval, no splits
 * - NordicT_RX800_03: Single floating point Calories interval, no splits
 * - NordicT_RX800_04: Single floating point distance interval, no splits
 * - Schwinn_Wndrggr_01: Combination of a single time based interval with a floating point calorie split
 * - TheoreticalModel_01: Session startup behaviour and basic 'justrow' session (basis for metrics of subsequent tests, with perfectly clean data)
 * - TheoreticalModel_02: Session startup behaviour with a combination of time based interval and a justrow interval, with distance split
 * - TheoreticalModel_03: Session startup behaviour with a combination of time based interval and a time interval, with distance split
 * - TheoreticalModel_04: Basic 'justrow' session (basis for metrics of subsequent tests, with random noise injection)
 * - TheoreticalModel_05: Combination of time based interval and a justrow interval
 * - TheoreticalModel_06: Session startup behaviour with a combination of time based interval and a time interval, with time split
 * - TheoreticalModel_07: Basic 'justrow' session (basis for metrics of subsequent tests, with structural noise injection)
 * - TheoreticalModel_08: Combination of time based interval and a justrow interval
 * - TheoreticalModel_09: Combination of two distance based intervals, both with a distance split
 * - Sportstech_WRX700_01: Basic short 'justrow' session (basis for metrics of subsequent tests), abrupt data stop (no Flywheel-timeout), static dragfactor
 * - Sportstech_WRX700_02: Single distance interval (no splits) after a session reset before rowing start
 * - Sportstech_WRX700_03: Single distance interval (no splits) after an overwrite of the workout before rowing start
 * - Sportstech_WRX700_04: Simple single calories interval (no splits) after overwriting a complex workout plan before workout start
 * - Sportstech_WRX700_05: Basic long 'justrow' session (basis for metrics of subsequent tests), abrupt data stop (no Flywheel-timeout), static dragfactor
 * - Sportstech_WRX700_06: Short 'justrow' session, followed by a reset, followed by a longer 'justrow' session
 * - Sportstech_WRX700_07: Short 'justrow' session, followed by a reset, followed by a longer 'distance' session with two intervals and splits
 * - Sportstech_WRX700_08: Single time interval (no splits) after an overwrite of the workout before rowing start
 * - Sportstech_WRX700_09: underrun of a time interval with splits
 * - TopiomV2_01: Stresstest of the number of intervals (more than 100)
 */
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import rowerProfiles from '../../config/rowerProfiles.js'
import { replayRowingSession } from '../recorders/RowingReplayer.js'
import { deepMerge } from '../tools/Helper.js'

import { createSessionManager } from './SessionManager.js'

/**
 * From this point on, testing is based on a theoretical model where all parameters and results are known in advance
 * The model and parameters are described in
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/discussions/215|this discussion}
 */

/**
 * @description Test against a theoretical model, based on perfect clean data
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/discussions/215|this discussion}
 */
test('TheoreticalModel_01: perfect clean data on the Theoretical Model should produce plausible results for an unlimited run with startup noise', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Theoretical_Model)
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
  const sessionManager = createSessionManager(testConfig)

  // Test Instantanuous metrics
  testIsMoving(sessionManager, false)
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalWork(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalCaloriesPerMinute(sessionManager, 0)
  testTotalCaloriesPerHour (sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testStrokeState(sessionManager, 'WaitingForDrive')
  testStrokeWork(sessionManager, undefined)
  testStrokeCalories(sessionManager, undefined)
  testCycleDistance(sessionManager, undefined)
  testCycleStrokeRate(sessionManager, undefined)
  testCycleDuration(sessionManager, undefined)
  testCycleLinearVelocity(sessionManager, undefined)
  testCyclePace(sessionManager, Infinity)
  testCyclePower(sessionManager, undefined)
  testDriveLastStartTime (sessionManager, 0)
  testDriveDuration(sessionManager, undefined)
  testDriveLength(sessionManager, undefined)
  testDriveDistance(sessionManager, undefined)
  testDriveAverageHandleForce(sessionManager, undefined)
  testDrivePeakHandleForce(sessionManager, undefined)
  testRecoveryDuration(sessionManager, undefined)
  testDragFactor(sessionManager, undefined)

  // Test session metrics
  testSessionType(sessionManager, 'justrow')
  testSessionState(sessionManager, 'WaitingForStart')
  testSessionTime(sessionManager, 0)
  testSessionMovingTimeTarget(sessionManager, undefined)
  testSessionMovingTimeToEnd(sessionManager, undefined)
  testSessionMovingTimeProjectedEnd(sessionManager, undefined)
  testSessionTimeSpentTotal(sessionManager, 0)
  testSessionTimeSpentMoving(sessionManager, 0)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 0)
  testSessionDistanceToEnd(sessionManager, undefined)
  testSessionDistanceTarget(sessionManager, undefined)
  testSessionDistanceProjectedEnd(sessionManager, undefined)
  testSessionWorkSinceStart(sessionManager, 0)
  testSessionCaloriesSinceStart(sessionManager, 0)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 0)
  testSessionMinimumPace(sessionManager, Infinity)
  testSessionAveragePace(sessionManager, Infinity)
  testSessionMaximumPace(sessionManager, Infinity)
  testSessionMinimumLinearVelocity(sessionManager, 0)
  testSessionAverageLinearVelocity(sessionManager, 0)
  testSessionMaximumLinearVelocity(sessionManager, 0)
  testSessionMinimumPower(sessionManager, 0)
  testSessionAveragePower(sessionManager, 0)
  testSessionMaximumPower(sessionManager, 0)
  testSessionMinimumStrokedistance(sessionManager, 0)
  testSessionAverageStrokedistance(sessionManager, 0)
  testSessionMaximumStrokedistance(sessionManager, 0)
  testSessionMinimumStrokerate(sessionManager, 0)
  testSessionAverageStrokerate(sessionManager, 0)
  testSessionMaximumStrokerate(sessionManager, 0)
  testSessionMinimumDragfactor(sessionManager, 0)
  testSessionAverageDragfactor(sessionManager, 0)
  testSessionMaximumDragfactor(sessionManager, 0)
  testSessionNumberOfIntervals(sessionManager, 1)

  // Test interval metrics
  testIntervalNumber(sessionManager, 0)
  testIntervalWorkoutStepNumber(sessionManager, 0)
  testIntervalType(sessionManager, 'justrow')
  testIntervalTime(sessionManager, 0)
  testIntervalMovingTimeTarget(sessionManager, undefined)
  testIntervalMovingTimeToEnd(sessionManager, undefined)
  testIntervalMovingTimeProjectedEnd(sessionManager, undefined)
  testIntervalTimeSpentTotal(sessionManager, 0)
  testIntervalTimeSpentMoving(sessionManager, 0)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 0)
  testIntervalDistanceToEnd(sessionManager, undefined)
  testIntervalDistanceTarget(sessionManager, undefined)
  testIntervalDistanceProjectedEnd(sessionManager, undefined)
  testIntervalWorkSinceStart(sessionManager, 0)
  testIntervalCaloriesSinceStart(sessionManager, 0)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 0)
  testIntervalMinimumPace(sessionManager, Infinity)
  testIntervalAveragePace(sessionManager, Infinity)
  testIntervalMaximumPace(sessionManager, Infinity)
  testIntervalMinimumLinearVelocity(sessionManager, 0)
  testIntervalAverageLinearVelocity(sessionManager, 0)
  testIntervalMaximumLinearVelocity(sessionManager, 0)
  testIntervalMinimumPower(sessionManager, 0)
  testIntervalAveragePower(sessionManager, 0)
  testIntervalMaximumPower(sessionManager, 0)
  testIntervalMinimumStrokedistance(sessionManager, 0)
  testIntervalAverageStrokedistance(sessionManager, 0)
  testIntervalMaximumStrokedistance(sessionManager, 0)
  testIntervalMinimumStrokerate(sessionManager, 0)
  testIntervalAverageStrokerate(sessionManager, 0)
  testIntervalMaximumStrokerate(sessionManager, 0)
  testIntervalMinimumDragfactor(sessionManager, 0)
  testIntervalAverageDragfactor(sessionManager, 0)
  testIntervalMaximumDragfactor(sessionManager, 0)

  // Test split metrics
  testSplitNumber(sessionManager, 0)
  testSplitType(sessionManager, 'justrow')
  testSplitTime(sessionManager, 0)
  testSplitMovingTimeTarget(sessionManager, undefined)
  testSplitMovingTimeToEnd(sessionManager, undefined)
  testSplitMovingTimeProjectedEnd(sessionManager, undefined)
  testSplitTimeSpentTotal(sessionManager, 0)
  testSplitTimeSpentMoving(sessionManager, 0)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 0)
  testSplitDistanceToEnd(sessionManager, undefined)
  testSplitDistanceTarget(sessionManager, undefined)
  testSplitDistanceProjectedEnd(sessionManager, undefined)
  testSplitWorkSinceStart(sessionManager, 0)
  testSplitCaloriesSinceStart(sessionManager, 0)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)
  testSplitNumberOfStrokes(sessionManager, 0)
  testSplitMinimumPace(sessionManager, Infinity)
  testSplitAveragePace(sessionManager, Infinity)
  testSplitMaximumPace(sessionManager, Infinity)
  testSplitMinimumLinearVelocity(sessionManager, 0)
  testSplitAverageLinearVelocity(sessionManager, 0)
  testSplitMaximumLinearVelocity(sessionManager, 0)
  testSplitMinimumPower(sessionManager, 0)
  testSplitAveragePower(sessionManager, 0)
  testSplitMaximumPower(sessionManager, 0)
  testSplitMinimumStrokedistance(sessionManager, 0)
  testSplitAverageStrokedistance(sessionManager, 0)
  testSplitMaximumStrokedistance(sessionManager, 0)
  testSplitMinimumStrokerate(sessionManager, 0)
  testSplitAverageStrokerate(sessionManager, 0)
  testSplitMaximumStrokerate(sessionManager, 0)
  testSplitMinimumDragfactor(sessionManager, 0)
  testSplitAverageDragfactor(sessionManager, 0)
  testSplitMaximumDragfactor(sessionManager, 0)

  // Replay a session
  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/Theoretical_Simulation_Clean.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, false) // This implies that all instantanuous metrics must be undefined
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 61.343050894547225)
  testTotalLinearDistance(sessionManager, 235.67436268645264)
  testTotalWork(sessionManager, 10082.626106960444)
  testTotalCalories(sessionManager, 14.714421962126979)
  testTotalCaloriesPerMinute(sessionManager, 14.881045347565594)
  testTotalCaloriesPerHour (sessionManager, 892.8627208539357)
  testTotalNumberOfStrokes(sessionManager, 19)
  testStrokeState(sessionManager, 'WaitingForDrive') // This is normal for an unplanned pause
  testStrokeWork(sessionManager, undefined)
  testStrokeCalories(sessionManager, undefined)
  testCycleDistance(sessionManager, undefined)
  testCycleStrokeRate(sessionManager, undefined)
  testCycleDuration(sessionManager, undefined)
  testCycleLinearVelocity(sessionManager, undefined)
  testCyclePace(sessionManager, Infinity)
  testCyclePower(sessionManager, undefined)
  testDriveLastStartTime (sessionManager, 55.354990361809314)
  testDriveDuration(sessionManager, undefined)
  testDriveLength(sessionManager, undefined)
  testDriveDistance(sessionManager, undefined)
  testDriveAverageHandleForce(sessionManager, undefined)
  testDrivePeakHandleForce(sessionManager, undefined)
  testRecoveryDuration(sessionManager, undefined)
  testDragFactor(sessionManager, 119.92470860873752) // Theoretical value 120 * 10^âˆ’6 [ k g m 2 ]

  // Test session metrics
  testSessionType(sessionManager, 'justrow')
  testSessionState(sessionManager, 'Paused') // As we suddenly stop sending data, the sessionManager will assume a forced pause
  testSessionTime(sessionManager, 61.343050894547225)
  testSessionMovingTimeTarget(sessionManager, undefined)
  testSessionMovingTimeToEnd(sessionManager, undefined)
  testSessionMovingTimeProjectedEnd(sessionManager, undefined)
  testSessionTimeSpentTotal(sessionManager, 61.343050894547225)
  testSessionTimeSpentMoving(sessionManager, 61.343050894547225)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 235.67436268645264)
  testSessionDistanceToEnd(sessionManager, undefined)
  testSessionDistanceTarget(sessionManager, undefined)
  testSessionDistanceProjectedEnd(sessionManager, undefined)
  testSessionWorkSinceStart(sessionManager, 10082.626106960444)
  testSessionCaloriesSinceStart(sessionManager, 14.714421962126979)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 19)
  testSessionMinimumPace(sessionManager, 144.0892354553984)
  testSessionAveragePace(sessionManager, 130.14366559709262) // Theoretical value 126.4 sec/500m
  testSessionMaximumPace(sessionManager, 127.41091348974768)
  testSessionMinimumLinearVelocity(sessionManager, 3.470071851097931)
  testSessionAverageLinearVelocity(sessionManager, 3.841908076785951)
  testSessionMaximumLinearVelocity(sessionManager, 3.9243106128442697)
  testSessionMinimumPower(sessionManager, 116.99665182631449)
  testSessionAveragePower(sessionManager, 165.54273711119356) // Theoretical value 173.33 Watts
  testSessionMaximumPower(sessionManager, 169.2186227233455)
  testSessionMinimumStrokedistance(sessionManager, 6.587811328583184)
  testSessionAverageStrokedistance(sessionManager, 11.5140880042863) // Theoretical value 11.77 meters
  testSessionMaximumStrokedistance(sessionManager, 11.797809243281058)
  testSessionMinimumStrokerate(sessionManager, 19.934902370540915)
  testSessionAverageStrokerate(sessionManager, 20.456618908984527) // Theoretical value 20 SPM
  testSessionMaximumStrokerate(sessionManager, 31.604473880804594)
  testSessionMinimumDragfactor(sessionManager, 119.53033047834111)
  testSessionAverageDragfactor(sessionManager, 119.91517741425835) // Theoretical value 120 * 10^âˆ’6 [ k g m 2 ]
  testSessionMaximumDragfactor(sessionManager, 120.10320388420907)
  testSessionNumberOfIntervals(sessionManager, 1)

  // Test interval metrics
  // As there is only one interval, this is identical to the Session data
  testIntervalNumber(sessionManager, 0)
  testIntervalWorkoutStepNumber(sessionManager, 0)
  testIntervalType(sessionManager, 'justrow')
  testIntervalTime(sessionManager, 61.343050894547225)
  testIntervalMovingTimeTarget(sessionManager, undefined)
  testIntervalMovingTimeToEnd(sessionManager, undefined)
  testIntervalMovingTimeProjectedEnd(sessionManager, undefined)
  testIntervalTimeSpentTotal(sessionManager, 61.343050894547225)
  testIntervalTimeSpentMoving(sessionManager, 61.343050894547225)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 235.67436268645264)
  testIntervalDistanceToEnd(sessionManager, undefined)
  testIntervalDistanceTarget(sessionManager, undefined)
  testIntervalDistanceProjectedEnd(sessionManager, undefined)
  testIntervalWorkSinceStart(sessionManager, 10082.626106960444)
  testIntervalCaloriesSinceStart(sessionManager, 14.714421962126979)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 19)
  testIntervalMinimumPace(sessionManager, 144.0892354553984)
  testIntervalAveragePace(sessionManager, 130.14366559709262) // Theoretical value 126.4 sec/500m
  testIntervalMaximumPace(sessionManager, 127.41091348974768)
  testIntervalMinimumLinearVelocity(sessionManager, 3.470071851097931)
  testIntervalAverageLinearVelocity(sessionManager, 3.841908076785951)
  testIntervalMaximumLinearVelocity(sessionManager, 3.9243106128442697)
  testIntervalMinimumPower(sessionManager, 116.99665182631449)
  testIntervalAveragePower(sessionManager, 165.54273711119356) // Theoretical value 173.33 Watts
  testIntervalMaximumPower(sessionManager, 169.2186227233455)
  testIntervalMinimumStrokedistance(sessionManager, 6.587811328583184)
  testIntervalAverageStrokedistance(sessionManager, 11.5140880042863) // Theoretical value 11.77 meters
  testIntervalMaximumStrokedistance(sessionManager, 11.797809243281058)
  testIntervalMinimumStrokerate(sessionManager, 19.934902370540915)
  testIntervalAverageStrokerate(sessionManager, 20.456618908984527) // Theoretical value 20 SPM
  testIntervalMaximumStrokerate(sessionManager, 31.604473880804594)
  testIntervalMinimumDragfactor(sessionManager, 119.53033047834111)
  testIntervalAverageDragfactor(sessionManager, 119.91517741425835) // Theoretical value 120 * 10^âˆ’6 [ k g m 2 ]
  testIntervalMaximumDragfactor(sessionManager, 120.10320388420907)

  // Test split metrics
  // As the session has been forcefully stopped, so we have a rest interval without data
  testSplitNumber(sessionManager, 1)
  testSplitType(sessionManager, 'rest')
  testSplitTime(sessionManager, 0)
  testSplitMovingTimeTarget(sessionManager, undefined)
  testSplitMovingTimeToEnd(sessionManager, 0)
  testSplitMovingTimeProjectedEnd(sessionManager, undefined)
  testSplitTimeSpentTotal(sessionManager, 0)
  testSplitTimeSpentMoving(sessionManager, 0)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 0)
  testSplitDistanceToEnd(sessionManager, undefined)
  testSplitDistanceTarget(sessionManager, undefined)
  testSplitDistanceProjectedEnd(sessionManager, undefined)
  testSplitWorkSinceStart(sessionManager, 0)
  testSplitCaloriesSinceStart(sessionManager, 0)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)
  testSplitNumberOfStrokes(sessionManager, 0)
  testSplitMinimumPace(sessionManager, Infinity)
  testSplitAveragePace(sessionManager, Infinity)
  testSplitMaximumPace(sessionManager, Infinity)
  testSplitMinimumLinearVelocity(sessionManager, 0)
  testSplitAverageLinearVelocity(sessionManager, 0)
  testSplitMaximumLinearVelocity(sessionManager, 0)
  testSplitMinimumPower(sessionManager, 0)
  testSplitAveragePower(sessionManager, 0)
  testSplitMaximumPower(sessionManager, 0)
  testSplitMinimumStrokedistance(sessionManager, 0)
  testSplitAverageStrokedistance(sessionManager, 0)
  testSplitMaximumStrokedistance(sessionManager, 0)
  testSplitMinimumStrokerate(sessionManager, 0)
  testSplitAverageStrokerate(sessionManager, 0)
  testSplitMaximumStrokerate(sessionManager, 0)
  testSplitMinimumDragfactor(sessionManager, 0)
  testSplitAverageDragfactor(sessionManager, 0)
  testSplitMaximumDragfactor(sessionManager, 0)
})

/**
 * @description Test against a theoretical model, based on perfect clean data
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/discussions/215|this discussion}
 */
test('TheoreticalModel_02: perfect clean data on the Theoretical Model should produce plausible results for an unlimited run without startup noise', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Theoretical_Model)
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

  const sessionManager = createSessionManager(testConfig)

  testSessionType(sessionManager, 'justrow')
  testSessionTime(sessionManager, 0)
  testSessionMovingTimeTarget(sessionManager, undefined)
  testSessionMovingTimeToEnd(sessionManager, undefined)
  testSessionDistance(sessionManager, 0)
  testSessionDistanceToEnd(sessionManager, undefined)
  testSessionDistanceTarget(sessionManager, undefined)
  testSessionDistanceProjectedEnd(sessionManager, undefined)
  testSessionCaloriesSinceStart(sessionManager, 0)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testIntervalType(sessionManager, 'justrow')
  testIntervalTime(sessionManager, 0)
  testIntervalMovingTimeTarget(sessionManager, undefined)
  testIntervalMovingTimeToEnd(sessionManager, undefined)
  testIntervalMovingTimeProjectedEnd(sessionManager, undefined)
  testIntervalDistance(sessionManager, 0)
  testIntervalDistanceTarget(sessionManager, undefined)
  testIntervalDistanceProjectedEnd(sessionManager, undefined)
  testIntervalCaloriesSinceStart(sessionManager, 0)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testSplitType(sessionManager, 'justrow')
  testSplitTime(sessionManager, 0)
  testSplitMovingTimeTarget(sessionManager, undefined)
  testSplitMovingTimeToEnd(sessionManager, undefined)
  testSplitMovingTimeProjectedEnd(sessionManager, undefined)
  testSplitDistance(sessionManager, 0)
  testSplitDistanceTarget(sessionManager, undefined)
  testSplitDistanceProjectedEnd(sessionManager, undefined)
  testSplitCaloriesSinceStart(sessionManager, 0)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)

  // Cut off the startup noise via a startup interval
  const intervalSettings = []
  intervalSettings[0] = {
    type: 'time',
    targetTime: 30
  }
  intervalSettings[1] = {
    type: 'justrow',
    split: {
      type: 'distance',
      targetDistance: 100
    }
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testSessionType(sessionManager, 'justrow')
  testSessionNumberOfIntervals(sessionManager, 2)
  testSessionTime(sessionManager, 0)
  testSessionMovingTimeTarget(sessionManager, undefined)
  testSessionMovingTimeToEnd(sessionManager, undefined)
  testSessionDistance(sessionManager, 0)
  testSessionDistanceToEnd(sessionManager, undefined)
  testSessionDistanceTarget(sessionManager, undefined)
  testSessionDistanceProjectedEnd(sessionManager, undefined)
  testSessionCaloriesSinceStart(sessionManager, 0)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testIntervalType(sessionManager, 'time')
  testIntervalTime(sessionManager, 0)
  testIntervalMovingTimeTarget(sessionManager, 30)
  testIntervalMovingTimeToEnd(sessionManager, 30)
  testIntervalMovingTimeProjectedEnd(sessionManager, 30)
  testIntervalDistance(sessionManager, 0)
  testIntervalDistanceTarget(sessionManager, undefined)
  testIntervalDistanceProjectedEnd(sessionManager, undefined)
  testIntervalCaloriesSinceStart(sessionManager, 0)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testSplitType(sessionManager, 'time')
  testSplitTime(sessionManager, 0)
  testSplitMovingTimeTarget(sessionManager, 30)
  testSplitMovingTimeToEnd(sessionManager, 30)
  testSplitMovingTimeProjectedEnd(sessionManager, 30)
  testSplitDistance(sessionManager, 0)
  testSplitDistanceTarget(sessionManager, undefined)
  testSplitDistanceProjectedEnd(sessionManager, undefined)
  testSplitCaloriesSinceStart(sessionManager, 0)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)

  // Test Instantanuous metrics
  testIsMoving(sessionManager, false)
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalWork(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalCaloriesPerMinute(sessionManager, 0)
  testTotalCaloriesPerHour (sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testStrokeState(sessionManager, 'WaitingForDrive')
  testStrokeWork(sessionManager, undefined)
  testStrokeCalories(sessionManager, undefined)
  testCycleDistance(sessionManager, undefined)
  testCycleStrokeRate(sessionManager, undefined)
  testCycleDuration(sessionManager, undefined)
  testCycleLinearVelocity(sessionManager, undefined)
  testCyclePace(sessionManager, Infinity)
  testCyclePower(sessionManager, undefined)
  testDriveLastStartTime (sessionManager, 0)
  testDriveDuration(sessionManager, undefined)
  testDriveLength(sessionManager, undefined)
  testDriveDistance(sessionManager, undefined)
  testDriveAverageHandleForce(sessionManager, undefined)
  testDrivePeakHandleForce(sessionManager, undefined)
  testRecoveryDuration(sessionManager, undefined)
  testDragFactor(sessionManager, undefined)

  // Test session metrics
  testSessionType(sessionManager, 'justrow')
  testSessionState(sessionManager, 'WaitingForStart')
  testSessionTime(sessionManager, 0)
  testSessionMovingTimeTarget(sessionManager, undefined)
  testSessionMovingTimeToEnd(sessionManager, undefined)
  testSessionMovingTimeProjectedEnd(sessionManager, undefined)
  testSessionTimeSpentTotal(sessionManager, 0)
  testSessionTimeSpentMoving(sessionManager, 0)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 0)
  testSessionDistanceToEnd(sessionManager, undefined)
  testSessionDistanceTarget(sessionManager, undefined)
  testSessionDistanceProjectedEnd(sessionManager, undefined)
  testSessionWorkSinceStart(sessionManager, 0)
  testSessionCaloriesSinceStart(sessionManager, 0)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 0)
  testSessionMinimumPace(sessionManager, Infinity)
  testSessionAveragePace(sessionManager, Infinity)
  testSessionMaximumPace(sessionManager, Infinity)
  testSessionMinimumLinearVelocity(sessionManager, 0)
  testSessionAverageLinearVelocity(sessionManager, 0)
  testSessionMaximumLinearVelocity(sessionManager, 0)
  testSessionMinimumPower(sessionManager, 0)
  testSessionAveragePower(sessionManager, 0)
  testSessionMaximumPower(sessionManager, 0)
  testSessionMinimumStrokedistance(sessionManager, 0)
  testSessionAverageStrokedistance(sessionManager, 0)
  testSessionMaximumStrokedistance(sessionManager, 0)
  testSessionMinimumStrokerate(sessionManager, 0)
  testSessionAverageStrokerate(sessionManager, 0)
  testSessionMaximumStrokerate(sessionManager, 0)
  testSessionMinimumDragfactor(sessionManager, 0)
  testSessionAverageDragfactor(sessionManager, 0)
  testSessionMaximumDragfactor(sessionManager, 0)
  testSessionNumberOfIntervals(sessionManager, 2)

  // Test interval metrics
  testIntervalNumber(sessionManager, 0)
  testIntervalWorkoutStepNumber(sessionManager, 0)
  testIntervalType(sessionManager, 'time')
  testIntervalTime(sessionManager, 0)
  testIntervalMovingTimeTarget(sessionManager, 30)
  testIntervalMovingTimeToEnd(sessionManager, 30)
  testIntervalMovingTimeProjectedEnd(sessionManager, 30)
  testIntervalTimeSpentTotal(sessionManager, 0)
  testIntervalTimeSpentMoving(sessionManager, 0)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 0)
  testIntervalDistanceToEnd(sessionManager, undefined)
  testIntervalDistanceTarget(sessionManager, undefined)
  testIntervalDistanceProjectedEnd(sessionManager, undefined)
  testIntervalWorkSinceStart(sessionManager, 0)
  testIntervalCaloriesSinceStart(sessionManager, 0)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 0)
  testIntervalMinimumPace(sessionManager, Infinity)
  testIntervalAveragePace(sessionManager, Infinity)
  testIntervalMaximumPace(sessionManager, Infinity)
  testIntervalMinimumLinearVelocity(sessionManager, 0)
  testIntervalAverageLinearVelocity(sessionManager, 0)
  testIntervalMaximumLinearVelocity(sessionManager, 0)
  testIntervalMinimumPower(sessionManager, 0)
  testIntervalAveragePower(sessionManager, 0)
  testIntervalMaximumPower(sessionManager, 0)
  testIntervalMinimumStrokedistance(sessionManager, 0)
  testIntervalAverageStrokedistance(sessionManager, 0)
  testIntervalMaximumStrokedistance(sessionManager, 0)
  testIntervalMinimumStrokerate(sessionManager, 0)
  testIntervalAverageStrokerate(sessionManager, 0)
  testIntervalMaximumStrokerate(sessionManager, 0)
  testIntervalMinimumDragfactor(sessionManager, 0)
  testIntervalAverageDragfactor(sessionManager, 0)
  testIntervalMaximumDragfactor(sessionManager, 0)

  // Test split metrics
  // As the session has been forcefully stopped, so we have a rest interval without data
  testSplitNumber(sessionManager, 0)
  testSplitType(sessionManager, 'time')
  testSplitTime(sessionManager, 0)
  testSplitMovingTimeTarget(sessionManager, 30)
  testSplitMovingTimeToEnd(sessionManager, 30)
  testSplitMovingTimeProjectedEnd(sessionManager, 30)
  testSplitTimeSpentTotal(sessionManager, 0)
  testSplitTimeSpentMoving(sessionManager, 0)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 0)
  testSplitDistanceToEnd(sessionManager, undefined)
  testSplitDistanceTarget(sessionManager, undefined)
  testSplitDistanceProjectedEnd(sessionManager, undefined)
  testSplitWorkSinceStart(sessionManager, 0)
  testSplitCaloriesSinceStart(sessionManager, 0)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)
  testSplitNumberOfStrokes(sessionManager, 0)
  testSplitMinimumPace(sessionManager, Infinity)
  testSplitAveragePace(sessionManager, Infinity)
  testSplitMaximumPace(sessionManager, Infinity)
  testSplitMinimumLinearVelocity(sessionManager, 0)
  testSplitAverageLinearVelocity(sessionManager, 0)
  testSplitMaximumLinearVelocity(sessionManager, 0)
  testSplitMinimumPower(sessionManager, 0)
  testSplitAveragePower(sessionManager, 0)
  testSplitMaximumPower(sessionManager, 0)
  testSplitMinimumStrokedistance(sessionManager, 0)
  testSplitAverageStrokedistance(sessionManager, 0)
  testSplitMaximumStrokedistance(sessionManager, 0)
  testSplitMinimumStrokerate(sessionManager, 0)
  testSplitAverageStrokerate(sessionManager, 0)
  testSplitMaximumStrokerate(sessionManager, 0)
  testSplitMinimumDragfactor(sessionManager, 0)
  testSplitAverageDragfactor(sessionManager, 0)
  testSplitMaximumDragfactor(sessionManager, 0)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/Theoretical_Simulation_Clean.csv', realtime: false, loop: false })

  testSessionState(sessionManager, 'Paused') // As we suddenly stop sending data, the sessionManager will assume a forced pause

  // Test Instantanuous metrics
  testIsMoving(sessionManager, false) // This implies that all instantanuous metrics must be undefined
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 61.343050894547225)
  testTotalLinearDistance(sessionManager, 235.67436268645264)
  testTotalWork(sessionManager, 10082.626106960444)
  testTotalCalories(sessionManager, 14.714421962126979)
  testTotalCaloriesPerMinute(sessionManager, 14.881045347565594)
  testTotalCaloriesPerHour (sessionManager, 892.8627208539357)
  testTotalNumberOfStrokes(sessionManager, 19)
  testStrokeState(sessionManager, 'WaitingForDrive') // This is normal for an unplanned pause
  testStrokeWork(sessionManager, undefined)
  testStrokeCalories(sessionManager, undefined)
  testCycleDistance(sessionManager, undefined)
  testCycleStrokeRate(sessionManager, undefined)
  testCycleDuration(sessionManager, undefined)
  testCycleLinearVelocity(sessionManager, undefined)
  testCyclePace(sessionManager, Infinity)
  testCyclePower(sessionManager, undefined)
  testDriveLastStartTime (sessionManager, 55.354990361809314)
  testDriveDuration(sessionManager, undefined)
  testDriveLength(sessionManager, undefined)
  testDriveDistance(sessionManager, undefined)
  testDriveAverageHandleForce(sessionManager, undefined)
  testDrivePeakHandleForce(sessionManager, undefined)
  testRecoveryDuration(sessionManager, undefined)
  testDragFactor(sessionManager, 119.92470860873752) // Theoretical value 120 * 10^âˆ’6 [ k g m 2 ]

  // Test session metrics
  testSessionType(sessionManager, 'justrow')
  testSessionState(sessionManager, 'Paused') // As we suddenly stop sending data, the sessionManager will assume a forced pause
  testSessionTime(sessionManager, 61.343050894547225)
  testSessionMovingTimeTarget(sessionManager, undefined)
  testSessionMovingTimeToEnd(sessionManager, undefined)
  testSessionMovingTimeProjectedEnd(sessionManager, undefined)
  testSessionTimeSpentTotal(sessionManager, 61.343050894547225)
  testSessionTimeSpentMoving(sessionManager, 61.343050894547225)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 235.67436268645264)
  testSessionDistanceToEnd(sessionManager, undefined)
  testSessionDistanceTarget(sessionManager, undefined)
  testSessionDistanceProjectedEnd(sessionManager, undefined)
  testSessionWorkSinceStart(sessionManager, 10082.626106960444)
  testSessionCaloriesSinceStart(sessionManager, 14.714421962126979)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 19)
  testSessionMinimumPace(sessionManager, 144.0892354553984)
  testSessionAveragePace(sessionManager, 130.14366559709262) // Theoretical value 126.4 sec/500m
  testSessionMaximumPace(sessionManager, 127.41091348974768)
  testSessionMinimumLinearVelocity(sessionManager, 3.470071851097931)
  testSessionAverageLinearVelocity(sessionManager, 3.841908076785951)
  testSessionMaximumLinearVelocity(sessionManager, 3.9243106128442697)
  testSessionMinimumPower(sessionManager, 116.99665182631449)
  testSessionAveragePower(sessionManager, 165.54273711119356) // Theoretical value 173.33 Watts
  testSessionMaximumPower(sessionManager, 169.2186227233455)
  testSessionMinimumStrokedistance(sessionManager, 6.587811328583184)
  testSessionAverageStrokedistance(sessionManager, 11.5140880042863) // Theoretical value 11.77 meters
  testSessionMaximumStrokedistance(sessionManager, 11.797809243281058)
  testSessionMinimumStrokerate(sessionManager, 19.934902370540915)
  testSessionAverageStrokerate(sessionManager, 20.456618908984527) // Theoretical value 20 SPM
  testSessionMaximumStrokerate(sessionManager, 31.604473880804594)
  testSessionMinimumDragfactor(sessionManager, 119.53033047834111)
  testSessionAverageDragfactor(sessionManager, 119.91517741425835) // Theoretical value 120 * 10^âˆ’6 [ k g m 2 ]
  testSessionMaximumDragfactor(sessionManager, 120.10320388420907)
  testSessionNumberOfIntervals(sessionManager, 2)

  // Test interval metrics
  // This is the second interval, a 'justrow' after the 30 seconds one
  testIntervalNumber(sessionManager, 1)
  testIntervalWorkoutStepNumber(sessionManager, 1)
  testIntervalType(sessionManager, 'justrow')
  testIntervalTime(sessionManager, 31.343050894547225) // Must be 61.343050894547225 - 30 seconds
  testIntervalMovingTimeTarget(sessionManager, undefined)
  testIntervalMovingTimeToEnd(sessionManager, undefined)
  testIntervalMovingTimeProjectedEnd(sessionManager, undefined)
  testIntervalTimeSpentTotal(sessionManager, 31.343050894547225) // Must be 61.343050894547225 - 30 seconds
  testIntervalTimeSpentMoving(sessionManager, 31.343050894547225) // Must be 61.343050894547225 - 30 seconds
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 119.60692098433933) // Should roughly be 50% of 235.67436268645264
  testIntervalDistanceToEnd(sessionManager, undefined)
  testIntervalDistanceTarget(sessionManager, undefined)
  testIntervalDistanceProjectedEnd(sessionManager, undefined)
  testIntervalWorkSinceStart(sessionManager, 4671.686006844603) // Should roughly be 50% of 10082.626106960444
  testIntervalCaloriesSinceStart(sessionManager, 7.061145676302369) // Should roughly be 50% of 14.714421962126979
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 9) // Should roughly be 50% of 19
  testIntervalMinimumPace(sessionManager, 127.56507833607847)
  testIntervalAveragePace(sessionManager, 131.0252393281285) // @ToDo: Find out why the average is not between min and max // Theoretical value 126.4 sec/500m
  testIntervalMaximumPace(sessionManager, 127.45906821256413)
  testIntervalMinimumLinearVelocity(sessionManager, 3.919568008124587)
  testIntervalAverageLinearVelocity(sessionManager, 3.816058665978411) // @ToDo: Find out why the average is not between min and max
  testIntervalMaximumLinearVelocity(sessionManager, 3.9228279871475875)
  testIntervalMinimumPower(sessionManager, 168.60585499373533)
  testIntervalAveragePower(sessionManager, 168.85374966728924) // Theoretical value 173.33 Watts
  testIntervalMaximumPower(sessionManager, 169.02691185708946)
  testIntervalMinimumStrokedistance(sessionManager, 11.761170031995)
  testIntervalAverageStrokedistance(sessionManager, 11.76931211244628) // Theoretical value 11.77 meters
  testIntervalMaximumStrokedistance(sessionManager, 11.797809243281058)
  testIntervalMinimumStrokerate(sessionManager, 19.934902370540915)
  testIntervalAverageStrokerate(sessionManager, 19.991783863976412) // Theoretical value 20 SPM
  testIntervalMaximumStrokerate(sessionManager, 20.008254387829442)
  testIntervalMinimumDragfactor(sessionManager, 119.92470619589947)
  testIntervalAverageDragfactor(sessionManager, 119.92470820224528) // Theoretical value 120 * 10^âˆ’6 [ k g m 2 ]
  testIntervalMaximumDragfactor(sessionManager, 119.92470861917981)

  // Test split metrics
  // As we are in un unplanned pause, this is an empty split
  testSplitNumber(sessionManager, 3)
  testSplitType(sessionManager, 'rest')
  testSplitTime(sessionManager, 0)
  testSplitMovingTimeTarget(sessionManager, undefined)
  testSplitMovingTimeToEnd(sessionManager, 0)
  testSplitMovingTimeProjectedEnd(sessionManager, undefined)
  testSplitTimeSpentTotal(sessionManager, 0)
  testSplitTimeSpentMoving(sessionManager, 0)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 0)
  testSplitDistanceToEnd(sessionManager, undefined)
  testSplitDistanceTarget(sessionManager, undefined)
  testSplitDistanceProjectedEnd(sessionManager, undefined)
  testSplitWorkSinceStart(sessionManager, 0)
  testSplitCaloriesSinceStart(sessionManager, 0)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)
  testSplitNumberOfStrokes(sessionManager, 0)
  testSplitMinimumPace(sessionManager, Infinity)
  testSplitAveragePace(sessionManager, Infinity)
  testSplitMaximumPace(sessionManager, Infinity)
  testSplitMinimumLinearVelocity(sessionManager, 0)
  testSplitAverageLinearVelocity(sessionManager, 0)
  testSplitMaximumLinearVelocity(sessionManager, 0)
  testSplitMinimumPower(sessionManager, 0)
  testSplitAveragePower(sessionManager, 0)
  testSplitMaximumPower(sessionManager, 0)
  testSplitMinimumStrokedistance(sessionManager, 0)
  testSplitAverageStrokedistance(sessionManager, 0)
  testSplitMaximumStrokedistance(sessionManager, 0)
  testSplitMinimumStrokerate(sessionManager, 0)
  testSplitAverageStrokerate(sessionManager, 0)
  testSplitMaximumStrokerate(sessionManager, 0)
  testSplitMinimumDragfactor(sessionManager, 0)
  testSplitAverageDragfactor(sessionManager, 0)
  testSplitMaximumDragfactor(sessionManager, 0)
})

/**
 * @description Test against a theoretical model, based on perfect clean data
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/discussions/215|this discussion}
 */
test('TheoreticalModel_03: perfect clean data on the Theoretical Model should produce plausible results for an one minute run without startup noise', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Theoretical_Model)
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

  const sessionManager = createSessionManager(testConfig)

  testSessionType(sessionManager, 'justrow')
  testIntervalType(sessionManager, 'justrow')
  testSplitType(sessionManager, 'justrow')

  // Cut off the startup noise via a startup interval
  const intervalSettings = []
  intervalSettings[0] = {
    type: 'time',
    targetTime: 30
  }
  intervalSettings[1] = {
    type: 'time',
    targetTime: 30,
    split: {
      type: 'distance',
      targetDistance: 100
    }
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testSessionType(sessionManager, 'time')
  testSessionNumberOfIntervals(sessionManager, 2)
  testSessionTime(sessionManager, 0)
  testSessionMovingTimeTarget(sessionManager, 60)
  testSessionMovingTimeToEnd(sessionManager, 60)
  testSessionDistance(sessionManager, 0)
  testSessionDistanceToEnd(sessionManager, undefined)
  testSessionDistanceTarget(sessionManager, undefined)
  testSessionDistanceProjectedEnd(sessionManager, undefined)
  testSessionCaloriesSinceStart(sessionManager, 0)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testIntervalType(sessionManager, 'time')
  testIntervalTime(sessionManager, 0)
  testIntervalMovingTimeTarget(sessionManager, 30)
  testIntervalMovingTimeToEnd(sessionManager, 30)
  testIntervalMovingTimeProjectedEnd(sessionManager, 30)
  testIntervalDistance(sessionManager, 0)
  testIntervalDistanceTarget(sessionManager, undefined)
  testIntervalDistanceProjectedEnd(sessionManager, undefined)
  testIntervalCaloriesSinceStart(sessionManager, 0)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testSplitType(sessionManager, 'time')
  testSplitTime(sessionManager, 0)
  testSplitMovingTimeTarget(sessionManager, 30)
  testSplitMovingTimeToEnd(sessionManager, 30)
  testSplitMovingTimeProjectedEnd(sessionManager, 30)
  testSplitDistance(sessionManager, 0)
  testSplitDistanceTarget(sessionManager, undefined)
  testSplitDistanceProjectedEnd(sessionManager, undefined)
  testSplitCaloriesSinceStart(sessionManager, 0)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/Theoretical_Simulation_Clean.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, false) // This implies that all instantanuous metrics must be undefined
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 60.00317320053867)
  testTotalLinearDistance(sessionManager, 232.08372509069608)
  testTotalWork(sessionManager, 10082.626106960444)
  testTotalCalories(sessionManager, 14.602765487626264)
  testTotalCaloriesPerMinute(sessionManager, 14.881045347565594)
  testTotalCaloriesPerHour (sessionManager, 892.8627208539357)
  testTotalNumberOfStrokes(sessionManager, 19)
  testStrokeState(sessionManager, 'Stopped') // This is normal for an unplanned pause
  testStrokeWork(sessionManager, undefined)
  testStrokeCalories(sessionManager, undefined)
  testCycleDistance(sessionManager, undefined)
  testCycleStrokeRate(sessionManager, undefined)
  testCycleDuration(sessionManager, undefined)
  testCycleLinearVelocity(sessionManager, undefined)
  testCyclePace(sessionManager, Infinity)
  testCyclePower(sessionManager, undefined)
  testDriveLastStartTime (sessionManager, 55.354990361809314)
  testDriveDuration(sessionManager, undefined)
  testDriveLength(sessionManager, undefined)
  testDriveDistance(sessionManager, undefined)
  testDriveAverageHandleForce(sessionManager, undefined)
  testDrivePeakHandleForce(sessionManager, undefined)
  testRecoveryDuration(sessionManager, undefined)
  testDragFactor(sessionManager, 119.92470860873752) // Theoretical value 120 * 10^âˆ’6 [ k g m 2 ]

  // Test session metrics
  testSessionType(sessionManager, 'time')
  testSessionState(sessionManager, 'Stopped') // As we suddenly stop sending data, the sessionManager will assume a forced pause
  testSessionTime(sessionManager, 60.00317320053867)
  testSessionMovingTimeTarget(sessionManager, 60)
  testSessionMovingTimeToEnd(sessionManager, -0.0031732005386686524) // We overshoot the target due to the test setup
  testSessionMovingTimeProjectedEnd(sessionManager, 60)
  testSessionTimeSpentTotal(sessionManager, 60.00317320053867)
  testSessionTimeSpentMoving(sessionManager, 60.00317320053867)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 232.08372509069608)
  testSessionDistanceToEnd(sessionManager, undefined)
  testSessionDistanceTarget(sessionManager, undefined)
  testSessionDistanceProjectedEnd(sessionManager, 232.07241914048825)
  testSessionWorkSinceStart(sessionManager, 10082.626106960444)
  testSessionCaloriesSinceStart(sessionManager, 14.602765487626264)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 19)
  testSessionMinimumPace(sessionManager, 144.0892354553984)
  testSessionAveragePace(sessionManager, 129.27053195369476) // Theoretical value 126.4 sec/500m
  testSessionMaximumPace(sessionManager, 127.41091348974768)
  testSessionMinimumLinearVelocity(sessionManager, 3.470071851097931)
  testSessionAverageLinearVelocity(sessionManager, 3.86785752671848)
  testSessionMaximumLinearVelocity(sessionManager, 3.9243106128442697)
  testSessionMinimumPower(sessionManager, 116.99665182631449)
  testSessionAveragePower(sessionManager, 165.63151339413506) // Theoretical value 173.33 Watts
  testSessionMaximumPower(sessionManager, 169.2186227233455)
  testSessionMinimumStrokedistance(sessionManager, 6.587811328583184)
  testSessionAverageStrokedistance(sessionManager, 11.520590164280335) // Theoretical value 11.77 meters
  testSessionMaximumStrokedistance(sessionManager, 11.797809243281058)
  testSessionMinimumStrokerate(sessionManager, 19.934902370540915)
  testSessionAverageStrokerate(sessionManager, 20.444814958539755) // Theoretical value 20 SPM
  testSessionMaximumStrokerate(sessionManager, 31.604473880804594)
  testSessionMinimumDragfactor(sessionManager, 119.53033047834111)
  testSessionAverageDragfactor(sessionManager, 119.91517741425835) // Theoretical value 120 * 10^âˆ’6 [ k g m 2 ]
  testSessionMaximumDragfactor(sessionManager, 120.10320388420907)
  testSessionNumberOfIntervals(sessionManager, 2)

  // Test interval metrics
  // This is the second interval, a 'time' after the 30 seconds one
  testIntervalNumber(sessionManager, 1)
  testIntervalWorkoutStepNumber(sessionManager, 1)
  testIntervalType(sessionManager, 'time')
  testIntervalTime(sessionManager, 30.00317320053867) // Must be 30 seconds
  testIntervalMovingTimeTarget(sessionManager, 30)
  testIntervalMovingTimeToEnd(sessionManager, -0.0031732005386686524) // This overshoot is due to the testing setup
  testIntervalMovingTimeProjectedEnd(sessionManager, 30)
  testIntervalTimeSpentTotal(sessionManager, 30.00317320053867) // Must be 30 seconds
  testIntervalTimeSpentMoving(sessionManager, 30.00317320053867) // Must be 30 seconds
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 116.01628338858276) // Should roughly be 50% of 232.08372509069608
  testIntervalDistanceToEnd(sessionManager, undefined)
  testIntervalDistanceTarget(sessionManager, undefined)
  testIntervalDistanceProjectedEnd(sessionManager, 116.00497743837494)
  testIntervalWorkSinceStart(sessionManager, 4671.686006844603) // Should roughly be 50% of 10082.626106960444
  testIntervalCaloriesSinceStart(sessionManager, 6.949489201801654) // Should roughly be 50% of 14.602765487626264
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 9) // Should roughly be 50% of 19
  testIntervalMinimumPace(sessionManager, 127.56507833607847)
  testIntervalAveragePace(sessionManager, 129.30587122863867) // @ToDo: Find out why the average is not between min and max // Theoretical value 126.4 sec/500m
  testIntervalMaximumPace(sessionManager, 127.45906821256413)
  testIntervalMinimumLinearVelocity(sessionManager, 3.919568008124587)
  testIntervalAverageLinearVelocity(sessionManager, 3.8668004418445925) // @ToDo: Find out why the average is not between min and max
  testIntervalMaximumLinearVelocity(sessionManager, 3.9228279871475875)
  testIntervalMinimumPower(sessionManager, 168.60585499373533)
  testIntervalAveragePower(sessionManager, 168.85703841443038) // Theoretical value 173.33 Watts
  testIntervalMaximumPower(sessionManager, 169.02691185708946)
  testIntervalMinimumStrokedistance(sessionManager, 11.761170031995)
  testIntervalAverageStrokedistance(sessionManager, 11.768883584636455) // Theoretical value 11.77 meters
  testIntervalMaximumStrokedistance(sessionManager, 11.797809243281058)
  testIntervalMinimumStrokerate(sessionManager, 19.934902370540915)
  testIntervalAverageStrokerate(sessionManager, 19.992640965455724) // Theoretical value 20 SPM
  testIntervalMaximumStrokerate(sessionManager, 20.008254387829442)
  testIntervalMinimumDragfactor(sessionManager, 119.92470619589947)
  testIntervalAverageDragfactor(sessionManager, 119.92470820224528) // Theoretical value 120 * 10^âˆ’6 [ k g m 2 ]
  testIntervalMaximumDragfactor(sessionManager, 119.92470861917981)

  // Test split metrics
  testSplitNumber(sessionManager, 2)
  testSplitType(sessionManager, 'distance')
  testSplitTime(sessionManager, 4.3932161982612215)
  testSplitMovingTimeTarget(sessionManager, undefined)
  testSplitMovingTimeToEnd(sessionManager, undefined)
  testSplitMovingTimeProjectedEnd(sessionManager, 27.964625049896377)
  testSplitTimeSpentTotal(sessionManager, 4.3932161982612215)
  testSplitTimeSpentMoving(sessionManager, 4.3932161982612215)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 16.016283388582764) // Value must be 116.01628338858276 - 100 meters
  testSplitDistanceToEnd(sessionManager, 83.98371661141726)
  testSplitDistanceTarget(sessionManager, 100)
  testSplitDistanceProjectedEnd(sessionManager, 100)
  testSplitWorkSinceStart(sessionManager, 445.08219269137953)
  testSplitCaloriesSinceStart(sessionManager, 0.7847022766955813)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)
  testSplitNumberOfStrokes(sessionManager, 0)
  testSplitMinimumPace(sessionManager, 127.48689711011771)
  testSplitAveragePace(sessionManager, 137.1484286233638) // @ToDo: Find out why the average is not between min and max
  testSplitMaximumPace(sessionManager, 127.48689711011771)
  testSplitMinimumLinearVelocity(sessionManager, 3.921971679710123)
  testSplitAverageLinearVelocity(sessionManager, 3.6456852259904267)
  testSplitMaximumLinearVelocity(sessionManager, 3.921971679710123)
  testSplitMinimumPower(sessionManager, 168.91623586297118)
  testSplitAveragePower(sessionManager, 168.91623586297118)
  testSplitMaximumPower(sessionManager, 168.91623586297118)
  testSplitMinimumStrokedistance(sessionManager, 11.761170084059628)
  testSplitAverageStrokedistance(sessionManager, 11.761170084059628)
  testSplitMaximumStrokedistance(sessionManager, 11.761170084059628)
  testSplitMinimumStrokerate(sessionManager, 20.008068792083268)
  testSplitAverageStrokerate(sessionManager, 20.008068792083268)
  testSplitMaximumStrokerate(sessionManager, 20.008068792083268)
  testSplitMinimumDragfactor(sessionManager, 119.92470860873752)
  testSplitAverageDragfactor(sessionManager, 119.92470860873752)
  testSplitMaximumDragfactor(sessionManager, 119.92470860873752)
})

/**
 * @description Test against a theoretical model, based on noise-injected data
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/discussions/215|this discussion}
 */
test('TheoreticalModel_04: Random noise-injected data on the Theoretical Model should produce plausible results for an unlimited run with startup noise', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Theoretical_Model)
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
  const sessionManager = createSessionManager(testConfig)

  // Test session metrics
  testSessionType(sessionManager, 'justrow')
  testSessionState(sessionManager, 'WaitingForStart')
  testIntervalType(sessionManager, 'justrow')
  testSplitType(sessionManager, 'justrow')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/Theoretical_Simulation_Random_Noise.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, false) // This implies that all instantanuous metrics must be undefined
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 181.35954479988044)
  testTotalLinearDistance(sessionManager, 706.3578534826354)
  testTotalWork(sessionManager, 30830.62794514783)
  testTotalCalories(sessionManager, 44.47579820489273)
  testTotalCaloriesPerMinute(sessionManager, 14.889408208674077)
  testTotalCaloriesPerHour (sessionManager, 893.3644925204446)
  testTotalNumberOfStrokes(sessionManager, 59)
  testStrokeState(sessionManager, 'WaitingForDrive') // This is normal for an unplanned pause
  testStrokeWork(sessionManager, undefined)
  testStrokeCalories(sessionManager, undefined)
  testCycleDistance(sessionManager, undefined)
  testCycleStrokeRate(sessionManager, undefined)
  testCycleDuration(sessionManager, undefined)
  testCycleLinearVelocity(sessionManager, undefined)
  testCyclePace(sessionManager, Infinity)
  testCyclePower(sessionManager, undefined)
  testDriveLastStartTime (sessionManager, 175.35692827178198)
  testDriveDuration(sessionManager, undefined)
  testDriveLength(sessionManager, undefined)
  testDriveDistance(sessionManager, undefined)
  testDriveAverageHandleForce(sessionManager, undefined)
  testDrivePeakHandleForce(sessionManager, undefined)
  testRecoveryDuration(sessionManager, undefined)
  testDragFactor(sessionManager, 119.95812733742444) // Theoretical value 120 * 10^âˆ’6 [ k g m 2 ]

  // Test session metrics
  testSessionType(sessionManager, 'justrow')
  testSessionState(sessionManager, 'Paused') // As we faded with a tail, the flywheel will assume an unplanned pause/stop
  testSessionTime(sessionManager, 181.35954479988044)
  testSessionMovingTimeTarget(sessionManager, undefined)
  testSessionMovingTimeToEnd(sessionManager, undefined)
  testSessionMovingTimeProjectedEnd(sessionManager, undefined)
  testSessionTimeSpentTotal(sessionManager, 181.35954479988044)
  testSessionTimeSpentMoving(sessionManager, 181.35954479988044)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 706.3578534826354)
  testSessionDistanceToEnd(sessionManager, undefined)
  testSessionDistanceTarget(sessionManager, undefined)
  testSessionDistanceProjectedEnd(sessionManager, undefined)
  testSessionWorkSinceStart(sessionManager, 30830.62794514783)
  testSessionCaloriesSinceStart(sessionManager, 44.47579820489273)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 59)
  testSessionMinimumPace(sessionManager, 143.20756199431048)
  testSessionAveragePace(sessionManager, 128.3765331592925) // Theoretical value 126.4 sec/500m
  testSessionMaximumPace(sessionManager, 127.26445208111573)
  testSessionMinimumLinearVelocity(sessionManager, 3.4914357387067634)
  testSessionAverageLinearVelocity(sessionManager, 3.8947928230745155)
  testSessionMaximumLinearVelocity(sessionManager, 3.9288268783910714)
  testSessionMinimumPower(sessionManager, 119.17089214328217)
  testSessionAveragePower(sessionManager, 167.86656212390972) // Theoretical value 173.33 Watts
  testSessionMaximumPower(sessionManager, 169.80499196952417)
  testSessionMinimumStrokedistance(sessionManager, 6.8147639775967415)
  testSessionAverageStrokedistance(sessionManager, 11.688190521312269) // Theoretical value 11.77 meters
  testSessionMaximumStrokedistance(sessionManager, 11.926002210270553)
  testSessionMinimumStrokerate(sessionManager, 19.766111256103418)
  testSessionAverageStrokerate(sessionManager, 20.136702368594744) // Theoretical value 20 SPM
  testSessionMaximumStrokerate(sessionManager, 30.74004397086722)
  testSessionMinimumDragfactor(sessionManager, 119.88119659734743)
  testSessionAverageDragfactor(sessionManager, 119.92945505951025) // Theoretical value 120 * 10^âˆ’6 [ k g m 2 ]
  testSessionMaximumDragfactor(sessionManager, 119.98099357162658)
  testSessionNumberOfIntervals(sessionManager, 1)

  // Test interval metrics
  testIntervalNumber(sessionManager, 0)
  testIntervalWorkoutStepNumber(sessionManager, 0)
  testIntervalType(sessionManager, 'justrow')
  testIntervalTime(sessionManager, 181.35954479988044)
  testIntervalMovingTimeTarget(sessionManager, undefined)
  testIntervalMovingTimeToEnd(sessionManager, undefined)
  testIntervalMovingTimeProjectedEnd(sessionManager, undefined)
  testIntervalTimeSpentTotal(sessionManager, 181.35954479988044)
  testIntervalTimeSpentMoving(sessionManager, 181.35954479988044)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 706.3578534826354)
  testIntervalDistanceToEnd(sessionManager, undefined)
  testIntervalDistanceTarget(sessionManager, undefined)
  testIntervalDistanceProjectedEnd(sessionManager, undefined)
  testIntervalWorkSinceStart(sessionManager, 30830.62794514783)
  testIntervalCaloriesSinceStart(sessionManager, 44.47579820489273)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 59)
  testIntervalMinimumPace(sessionManager, 143.20756199431048)
  testIntervalAveragePace(sessionManager, 128.3765331592925)
  testIntervalMaximumPace(sessionManager, 127.26445208111573)
  testIntervalMinimumLinearVelocity(sessionManager, 3.4914357387067634)
  testIntervalAverageLinearVelocity(sessionManager, 3.8947928230745155) // @ToDo: Find out why the average is not between min and max
  testIntervalMaximumLinearVelocity(sessionManager, 3.9288268783910714)
  testIntervalMinimumPower(sessionManager, 119.17089214328217)
  testIntervalAveragePower(sessionManager, 167.86656212390972) // Theoretical value 173.33 Watts
  testIntervalMaximumPower(sessionManager, 169.80499196952417)
  testIntervalMinimumStrokedistance(sessionManager, 6.8147639775967415)
  testIntervalAverageStrokedistance(sessionManager, 11.688190521312269) // Theoretical value 11.77 meters
  testIntervalMaximumStrokedistance(sessionManager, 11.926002210270553)
  testIntervalMinimumStrokerate(sessionManager, 19.766111256103418)
  testIntervalAverageStrokerate(sessionManager, 20.136702368594744) // Theoretical value 20 SPM
  testIntervalMaximumStrokerate(sessionManager, 30.74004397086722)
  testIntervalMinimumDragfactor(sessionManager, 119.88119659734743)
  testIntervalAverageDragfactor(sessionManager, 119.92945505951025) // Theoretical value 120 * 10^âˆ’6 [ k g m 2 ]
  testIntervalMaximumDragfactor(sessionManager, 119.98099357162658)

  // Test split metrics
  // As we are in an unplanned pause, this is the rest split
  testSplitNumber(sessionManager, 1)
  testSplitType(sessionManager, 'rest')
  testSplitTime(sessionManager, 0)
  testSplitMovingTimeTarget(sessionManager, undefined)
  testSplitMovingTimeToEnd(sessionManager, 0)
  testSplitMovingTimeProjectedEnd(sessionManager, undefined)
  testSplitTimeSpentTotal(sessionManager, 0)
  testSplitTimeSpentMoving(sessionManager, 0)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 0)
  testSplitDistanceToEnd(sessionManager, undefined)
  testSplitDistanceTarget(sessionManager, undefined)
  testSplitDistanceProjectedEnd(sessionManager, undefined)
  testSplitWorkSinceStart(sessionManager, 0)
  testSplitCaloriesSinceStart(sessionManager, 0)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)
  testSplitNumberOfStrokes(sessionManager, 0)
  testSplitMinimumPace(sessionManager, Infinity)
  testSplitAveragePace(sessionManager, Infinity)
  testSplitMaximumPace(sessionManager, Infinity)
  testSplitMinimumLinearVelocity(sessionManager, 0)
  testSplitAverageLinearVelocity(sessionManager, 0)
  testSplitMaximumLinearVelocity(sessionManager, 0)
  testSplitMinimumPower(sessionManager, 0)
  testSplitAveragePower(sessionManager, 0)
  testSplitMaximumPower(sessionManager, 0)
  testSplitMinimumStrokedistance(sessionManager, 0)
  testSplitAverageStrokedistance(sessionManager, 0)
  testSplitMaximumStrokedistance(sessionManager, 0)
  testSplitMinimumStrokerate(sessionManager, 0)
  testSplitAverageStrokerate(sessionManager, 0)
  testSplitMaximumStrokerate(sessionManager, 0)
  testSplitMinimumDragfactor(sessionManager, 0)
  testSplitAverageDragfactor(sessionManager, 0)
  testSplitMaximumDragfactor(sessionManager, 0)
})

/**
 * @description Test against a theoretical model, based on noise-injected data
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/discussions/215|this discussion}
 */
test('TheoreticalModel_05: Random noise-injected data on the Theoretical Model should produce plausible results for an unlimited run without startup noise', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Theoretical_Model)
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

  const sessionManager = createSessionManager(testConfig)

  testSessionType(sessionManager, 'justrow')
  testIntervalType(sessionManager, 'justrow')
  testSplitType(sessionManager, 'justrow')

  // Cut off the startup noise via a startup interval
  const intervalSettings = []
  intervalSettings[0] = {
    type: 'time',
    targetTime: 60
  }
  intervalSettings[1] = {
    type: 'justrow'
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testSessionType(sessionManager, 'justrow')
  testIntervalType(sessionManager, 'time')
  testIntervalMovingTimeTarget(sessionManager, 60)
  testSplitType(sessionManager, 'time')
  testSplitMovingTimeTarget(sessionManager, 60)

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/Theoretical_Simulation_Random_Noise.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, false) // This implies that all instantanuous metrics must be undefined
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 181.35954479988044)
  testTotalLinearDistance(sessionManager, 706.3578534826354)
  testTotalWork(sessionManager, 30830.62794514783)
  testTotalCalories(sessionManager, 44.47579820489273)
  testTotalCaloriesPerMinute(sessionManager, 14.889408208674077)
  testTotalCaloriesPerHour (sessionManager, 893.3644925204446)
  testTotalNumberOfStrokes(sessionManager, 59)
  testStrokeState(sessionManager, 'WaitingForDrive') // This is normal for an unplanned pause
  testStrokeWork(sessionManager, undefined)
  testStrokeCalories(sessionManager, undefined)
  testCycleDistance(sessionManager, undefined)
  testCycleStrokeRate(sessionManager, undefined)
  testCycleDuration(sessionManager, undefined)
  testCycleLinearVelocity(sessionManager, undefined)
  testCyclePace(sessionManager, Infinity)
  testCyclePower(sessionManager, undefined)
  testDriveLastStartTime (sessionManager, 175.35692827178198)
  testDriveDuration(sessionManager, undefined)
  testDriveLength(sessionManager, undefined)
  testDriveDistance(sessionManager, undefined)
  testDriveAverageHandleForce(sessionManager, undefined)
  testDrivePeakHandleForce(sessionManager, undefined)
  testRecoveryDuration(sessionManager, undefined)
  testDragFactor(sessionManager, 119.95812733742444) // Theoretical value 120 * 10^âˆ’6 [ k g m 2 ]

  // Test session metrics
  testSessionType(sessionManager, 'justrow')
  testSessionState(sessionManager, 'Paused') // As we faded with a tail, the flywheel will assume an unplanned pause/stop
  testSessionTime(sessionManager, 181.35954479988044)
  testSessionMovingTimeTarget(sessionManager, undefined)
  testSessionMovingTimeToEnd(sessionManager, undefined)
  testSessionMovingTimeProjectedEnd(sessionManager, undefined)
  testSessionTimeSpentTotal(sessionManager, 181.35954479988044)
  testSessionTimeSpentMoving(sessionManager, 181.35954479988044)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 706.3578534826354)
  testSessionDistanceToEnd(sessionManager, undefined)
  testSessionDistanceTarget(sessionManager, undefined)
  testSessionDistanceProjectedEnd(sessionManager, undefined)
  testSessionWorkSinceStart(sessionManager, 30830.62794514783)
  testSessionCaloriesSinceStart(sessionManager, 44.47579820489273)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 59)
  testSessionMinimumPace(sessionManager, 143.20756199431048)
  testSessionAveragePace(sessionManager, 128.3765331592925) // Theoretical value 126.4 sec/500m
  testSessionMaximumPace(sessionManager, 127.26445208111573)
  testSessionMinimumLinearVelocity(sessionManager, 3.4914357387067634)
  testSessionAverageLinearVelocity(sessionManager, 3.8947928230745155)
  testSessionMaximumLinearVelocity(sessionManager, 3.9288268783910714)
  testSessionMinimumPower(sessionManager, 119.17089214328217)
  testSessionAveragePower(sessionManager, 167.86656212390972) // Theoretical value 173.33 Watts
  testSessionMaximumPower(sessionManager, 169.80499196952417)
  testSessionMinimumStrokedistance(sessionManager, 6.8147639775967415)
  testSessionAverageStrokedistance(sessionManager, 11.688190521312269) // Theoretical value 11.77 meters
  testSessionMaximumStrokedistance(sessionManager, 11.926002210270553)
  testSessionMinimumStrokerate(sessionManager, 19.766111256103418)
  testSessionAverageStrokerate(sessionManager, 20.136702368594744) // Theoretical value 20 SPM
  testSessionMaximumStrokerate(sessionManager, 30.74004397086722)
  testSessionMinimumDragfactor(sessionManager, 119.88119659734743)
  testSessionAverageDragfactor(sessionManager, 119.92945505951025) // Theoretical value 120 * 10^âˆ’6 [ k g m 2 ]
  testSessionMaximumDragfactor(sessionManager, 119.98099357162658)
  testSessionNumberOfIntervals(sessionManager, 2)

  // Test interval metrics
  testIntervalNumber(sessionManager, 1)
  testIntervalWorkoutStepNumber(sessionManager, 1)
  testIntervalType(sessionManager, 'justrow')
  testIntervalTime(sessionManager, 121.35954479988044) // Must be 181.35954479988044 - 60
  testIntervalMovingTimeTarget(sessionManager, undefined)
  testIntervalMovingTimeToEnd(sessionManager, undefined)
  testIntervalMovingTimeProjectedEnd(sessionManager, undefined)
  testIntervalTimeSpentTotal(sessionManager, 121.35954479988044) // Must be 181.35954479988044 - 60
  testIntervalTimeSpentMoving(sessionManager, 121.35954479988044) // Must be 181.35954479988044 - 60
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 472.6432562138848)
  testIntervalDistanceToEnd(sessionManager, undefined)
  testIntervalDistanceTarget(sessionManager, undefined)
  testIntervalDistanceProjectedEnd(sessionManager, undefined)
  testIntervalWorkSinceStart(sessionManager, 20252.714098956265)
  testIntervalCaloriesSinceStart(sessionManager, 29.40159454185315)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 39)
  testIntervalMinimumPace(sessionManager, 127.75474337938022)
  testIntervalAveragePace(sessionManager, 128.38387431149735)
  testIntervalMaximumPace(sessionManager, 127.26445208111573)
  testIntervalMinimumLinearVelocity(sessionManager, 3.9137490066822886)
  testIntervalAverageLinearVelocity(sessionManager, 3.894570113898041) // @ToDo: Find out why the average is not between min and max
  testIntervalMaximumLinearVelocity(sessionManager, 3.9288268783910714)
  testIntervalMinimumPower(sessionManager, 167.85749146696816)
  testIntervalAveragePower(sessionManager, 168.91570965510715) // Theoretical value 173.33 Watts
  testIntervalMaximumPower(sessionManager, 169.80499196952417)
  testIntervalMinimumStrokedistance(sessionManager, 11.596244164231889)
  testIntervalAverageStrokedistance(sessionManager, 11.76579996842933) // Theoretical value 11.77 meters
  testIntervalMaximumStrokedistance(sessionManager, 11.926002210270553)
  testIntervalMinimumStrokerate(sessionManager, 19.766111256103418)
  testIntervalAverageStrokerate(sessionManager, 20.000727150211933) // Theoretical value 20 SPM
  testIntervalMaximumStrokerate(sessionManager, 20.254747571696083)
  testIntervalMinimumDragfactor(sessionManager, 119.88119659734743)
  testIntervalAverageDragfactor(sessionManager, 119.93062630759866) // Theoretical value 120 * 10^âˆ’6 [ k g m 2 ]
  testIntervalMaximumDragfactor(sessionManager, 119.98099357162658)

  // Test split metrics
  // As we are in an unplanned pause, this is the rest split
  testSplitNumber(sessionManager, 2)
  testSplitType(sessionManager, 'rest')
  testSplitTime(sessionManager, 0)
  testSplitMovingTimeTarget(sessionManager, undefined)
  testSplitMovingTimeToEnd(sessionManager, 0)
  testSplitMovingTimeProjectedEnd(sessionManager, undefined)
  testSplitTimeSpentTotal(sessionManager, 0)
  testSplitTimeSpentMoving(sessionManager, 0)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 0)
  testSplitDistanceToEnd(sessionManager, undefined)
  testSplitDistanceTarget(sessionManager, undefined)
  testSplitDistanceProjectedEnd(sessionManager, undefined)
  testSplitWorkSinceStart(sessionManager, 0)
  testSplitCaloriesSinceStart(sessionManager, 0)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)
  testSplitNumberOfStrokes(sessionManager, 0)
  testSplitMinimumPace(sessionManager, Infinity)
  testSplitAveragePace(sessionManager, Infinity)
  testSplitMaximumPace(sessionManager, Infinity)
  testSplitMinimumLinearVelocity(sessionManager, 0)
  testSplitAverageLinearVelocity(sessionManager, 0)
  testSplitMaximumLinearVelocity(sessionManager, 0)
  testSplitMinimumPower(sessionManager, 0)
  testSplitAveragePower(sessionManager, 0)
  testSplitMaximumPower(sessionManager, 0)
  testSplitMinimumStrokedistance(sessionManager, 0)
  testSplitAverageStrokedistance(sessionManager, 0)
  testSplitMaximumStrokedistance(sessionManager, 0)
  testSplitMinimumStrokerate(sessionManager, 0)
  testSplitAverageStrokerate(sessionManager, 0)
  testSplitMaximumStrokerate(sessionManager, 0)
  testSplitMinimumDragfactor(sessionManager, 0)
  testSplitAverageDragfactor(sessionManager, 0)
  testSplitMaximumDragfactor(sessionManager, 0)
})

/**
 * @description Test against a theoretical model, based on noise-injected data
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/discussions/215|this discussion}
 */
test('TheoreticalModel_06: Random noise-injected data on the Theoretical Model should produce plausible results for a 100 seconds run without startup noise', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Theoretical_Model)
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

  const sessionManager = createSessionManager(testConfig)

  testSessionType(sessionManager, 'justrow')
  testIntervalType(sessionManager, 'justrow')
  testSplitType(sessionManager, 'justrow')

  // Cut off the startup noise via a startup interval
  const intervalSettings = []
  intervalSettings[0] = {
    type: 'time',
    targetTime: 60
  }
  intervalSettings[1] = {
    type: 'time',
    targetTime: 100,
    split: {
      type: 'time',
      targetTime: 25
    }
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testSessionType(sessionManager, 'time')
  testSessionMovingTimeTarget(sessionManager, 160)
  testIntervalType(sessionManager, 'time')
  testIntervalMovingTimeTarget(sessionManager, 60)
  testSplitType(sessionManager, 'time')
  testSplitMovingTimeTarget(sessionManager, 60)

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/Theoretical_Simulation_Random_Noise.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, false) // This implies that all instantanuous metrics must be undefined
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 160.00166827178606) // Must be 60 + 100 seconds
  testTotalLinearDistance(sessionManager, 625.7793542351126)
  testTotalWork(sessionManager, 27713.910740051204)
  testTotalCalories(sessionManager, 39.72767306079284)
  testTotalCaloriesPerMinute(sessionManager, 14.889253924433362)
  testTotalCaloriesPerHour (sessionManager, 893.355235466002)
  testTotalNumberOfStrokes(sessionManager, 53)
  testStrokeState(sessionManager, 'Stopped') // This is normal for an unplanned pause
  testStrokeWork(sessionManager, undefined)
  testStrokeCalories(sessionManager, undefined)
  testCycleDistance(sessionManager, undefined)
  testCycleStrokeRate(sessionManager, undefined)
  testCycleDuration(sessionManager, undefined)
  testCycleLinearVelocity(sessionManager, undefined)
  testCyclePace(sessionManager, Infinity)
  testCyclePower(sessionManager, undefined)
  testDriveLastStartTime (sessionManager, 157.35162666759084)
  testDriveDuration(sessionManager, undefined)
  testDriveLength(sessionManager, undefined)
  testDriveDistance(sessionManager, undefined)
  testDriveAverageHandleForce(sessionManager, undefined)
  testDrivePeakHandleForce(sessionManager, undefined)
  testRecoveryDuration(sessionManager, undefined)
  testDragFactor(sessionManager, 119.92309925039875) // Theoretical value 120 * 10^âˆ’6 [ k g m 2 ]

  // Test session metrics
  testSessionType(sessionManager, 'time')
  testSessionState(sessionManager, 'Stopped') // As we faded with a tail, the flywheel will assume an unplanned pause/stop
  testSessionTime(sessionManager, 160.00166827178606)
  testSessionMovingTimeTarget(sessionManager, 160)
  testSessionMovingTimeToEnd(sessionManager, -0.0016682717860589946)
  testSessionMovingTimeProjectedEnd(sessionManager, 160) // This is a limit of the testing setup
  testSessionTimeSpentTotal(sessionManager, 160.00166827178606)
  testSessionTimeSpentMoving(sessionManager, 160.00166827178606)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 625.7793542351126)
  testSessionDistanceToEnd(sessionManager, undefined)
  testSessionDistanceTarget(sessionManager, undefined)
  testSessionDistanceProjectedEnd(sessionManager, 625.7726897468015)
  testSessionWorkSinceStart(sessionManager, 27713.910740051204)
  testSessionCaloriesSinceStart(sessionManager, 39.72767306079284)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 53)
  testSessionMinimumPace(sessionManager, 143.20756199431048)
  testSessionAveragePace(sessionManager, 127.84191999059749) // Theoretical value 126.4 sec/500m
  testSessionMaximumPace(sessionManager, 127.26445208111573)
  testSessionMinimumLinearVelocity(sessionManager, 3.4914357387067634)
  testSessionAverageLinearVelocity(sessionManager, 3.9110801843149257)
  testSessionMaximumLinearVelocity(sessionManager, 3.9288268783910714)
  testSessionMinimumPower(sessionManager, 119.17089214328217)
  testSessionAveragePower(sessionManager, 167.75805401711526) // Theoretical value 173.33 Watts
  testSessionMaximumPower(sessionManager, 169.80499196952417)
  testSessionMinimumStrokedistance(sessionManager, 6.8147639775967415)
  testSessionAverageStrokedistance(sessionManager, 11.678757897679443) // Theoretical value 11.77 meters
  testSessionMaximumStrokedistance(sessionManager, 11.926002210270553)
  testSessionMinimumStrokerate(sessionManager, 19.766111256103418)
  testSessionAverageStrokerate(sessionManager, 20.153223856940368) // Theoretical value 20 SPM
  testSessionMaximumStrokerate(sessionManager, 30.74004397086722)
  testSessionMinimumDragfactor(sessionManager, 119.88119659734743)
  testSessionAverageDragfactor(sessionManager, 119.92544826617716) // Theoretical value 120 * 10^âˆ’6 [ k g m 2 ]
  testSessionMaximumDragfactor(sessionManager, 119.97031693785685)
  testSessionNumberOfIntervals(sessionManager, 2)

  // Test interval metrics
  testIntervalNumber(sessionManager, 1)
  testIntervalWorkoutStepNumber(sessionManager, 1)
  testIntervalType(sessionManager, 'time')
  testIntervalTime(sessionManager, 100.00166827178606)
  testIntervalMovingTimeTarget(sessionManager, 100)
  testIntervalMovingTimeToEnd(sessionManager, -0.0016682717860589946)
  testIntervalMovingTimeProjectedEnd(sessionManager, 100)
  testIntervalTimeSpentTotal(sessionManager, 100.00166827178606)
  testIntervalTimeSpentMoving(sessionManager, 100.00166827178606)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 392.064756966362)
  testIntervalDistanceToEnd(sessionManager, undefined)
  testIntervalDistanceTarget(sessionManager, undefined)
  testIntervalDistanceProjectedEnd(sessionManager, 392.05809247805087)
  testIntervalWorkSinceStart(sessionManager, 17135.99689385964)
  testIntervalCaloriesSinceStart(sessionManager, 24.653469397753256)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 33)
  testIntervalMinimumPace(sessionManager, 127.72836794100452)
  testIntervalAveragePace(sessionManager, 127.5320804725709)
  testIntervalMaximumPace(sessionManager, 127.26445208111573)
  testIntervalMinimumLinearVelocity(sessionManager, 3.91455718146294)
  testIntervalAverageLinearVelocity(sessionManager, 3.9205821636975338)
  testIntervalMaximumLinearVelocity(sessionManager, 3.9288268783910714)
  testIntervalMinimumPower(sessionManager, 167.9618742700358)
  testIntervalAveragePower(sessionManager, 168.91628821515124) // Theoretical value 173.33 Watts
  testIntervalMaximumPower(sessionManager, 169.80499196952417)
  testIntervalMinimumStrokedistance(sessionManager, 11.596244164231889)
  testIntervalAverageStrokedistance(sessionManager, 11.76361856265632) // Theoretical value 11.77 meters
  testIntervalMaximumStrokedistance(sessionManager, 11.926002210270553)
  testIntervalMinimumStrokerate(sessionManager, 19.766111256103418)
  testIntervalAverageStrokerate(sessionManager, 20.004541334725744) // Theoretical value 20 SPM
  testIntervalMaximumStrokerate(sessionManager, 20.254747571696083)
  testIntervalMinimumDragfactor(sessionManager, 119.88119659734743)
  testIntervalAverageDragfactor(sessionManager, 119.92443717461988) // Theoretical value 120 * 10^âˆ’6 [ k g m 2 ]
  testIntervalMaximumDragfactor(sessionManager, 119.97031693785685)

  // Test split metrics
  // As the session has been stopped by the session limit, the last split must still be filled
  testSplitNumber(sessionManager, 4)
  testSplitType(sessionManager, 'time')
  testSplitTime(sessionManager, 25.00166827178606) // Must be 25 seconds
  testSplitMovingTimeTarget(sessionManager, 25)
  testSplitMovingTimeToEnd(sessionManager, -0.0016682717860589946) // This is a testing artifact
  testSplitMovingTimeProjectedEnd(sessionManager, 25)
  testSplitTimeSpentTotal(sessionManager, 25.00166827178606) // Must be 25 seconds
  testSplitTimeSpentMoving(sessionManager, 25.00166827178606) // Must be 25 seconds
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 97.90846209156177)
  testSplitDistanceToEnd(sessionManager, undefined)
  testSplitDistanceTarget(sessionManager, undefined)
  testSplitDistanceProjectedEnd(sessionManager, 97.90179760325066)
  testSplitWorkSinceStart(sessionManager, 4155.13417257055)
  testSplitCaloriesSinceStart(sessionManager, 6.040742996525552)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)
  testSplitNumberOfStrokes(sessionManager, 8)
  testSplitMinimumPace(sessionManager, 127.72836794100452)
  testSplitAveragePace(sessionManager, 127.67879168812327) // Theoretical value 126.4 sec/500m
  testSplitMaximumPace(sessionManager, 127.26445208111573)
  testSplitMinimumLinearVelocity(sessionManager, 3.91455718146294)
  testSplitAverageLinearVelocity(sessionManager, 3.9160771604209206)
  testSplitMaximumLinearVelocity(sessionManager, 3.9288268783910714)
  testSplitMinimumPower(sessionManager, 167.9618742700358)
  testSplitAveragePower(sessionManager, 168.8984890169985) // Theoretical value 173.33 Watts
  testSplitMaximumPower(sessionManager, 169.80499196952417)
  testSplitMinimumStrokedistance(sessionManager, 11.596244164231889)
  testSplitAverageStrokedistance(sessionManager, 11.764571944715392) // Theoretical value 11.77 meters
  testSplitMaximumStrokedistance(sessionManager, 11.926002210270553)
  testSplitMinimumStrokerate(sessionManager, 19.766111256103418)
  testSplitAverageStrokerate(sessionManager, 20.00279031736199) // Theoretical value 20 SPM
  testSplitMaximumStrokerate(sessionManager, 20.254747571696083)
  testSplitMinimumDragfactor(sessionManager, 119.91175705511066)
  testSplitAverageDragfactor(sessionManager, 119.9293850222281) // Theoretical value 120 * 10^Ã¢Ë†â€™6 [ k g m 2 ]
  testSplitMaximumDragfactor(sessionManager, 119.96325514444989)
})

/**
 * @description Test against a theoretical model, based on a simulation of magnet positioning errors
 * Magnet errors -0.01, +0.1, +0.2, -0.2, -0.1, +0.01 degrees
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/discussions/215|this discussion}
 */
test('TheoreticalModel_07: Data with structural magnet errors on the Theoretical Model should produce plausible results for an unlimited run with startup noise', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Theoretical_Model)
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
  const sessionManager = createSessionManager(testConfig)

  testSessionType(sessionManager, 'justrow')
  testIntervalType(sessionManager, 'justrow')
  testSplitType(sessionManager, 'justrow')

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/Theoretical_Simulation_Systematic_Noise.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, false) // This implies that all instantanuous metrics must be undefined
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 181.3424733944077)
  testTotalLinearDistance(sessionManager, 706.291973992365)
  testTotalWork(sessionManager, 30825.447009125084)
  testTotalCalories(sessionManager, 44.46944136298644)
  testTotalCaloriesPerMinute(sessionManager, 14.887874599873015)
  testTotalCaloriesPerHour (sessionManager, 893.272475992381)
  testTotalNumberOfStrokes(sessionManager, 59)
  testStrokeState(sessionManager, 'WaitingForDrive') // This is normal for an unplanned pause
  testStrokeWork(sessionManager, undefined)
  testStrokeCalories(sessionManager, undefined)
  testCycleDistance(sessionManager, undefined)
  testCycleStrokeRate(sessionManager, undefined)
  testCycleDuration(sessionManager, undefined)
  testCycleLinearVelocity(sessionManager, undefined)
  testCyclePace(sessionManager, Infinity)
  testCyclePower(sessionManager, undefined)
  testDriveLastStartTime (sessionManager, 175.3543851793926)
  testDriveDuration(sessionManager, undefined)
  testDriveLength(sessionManager, undefined)
  testDriveDistance(sessionManager, undefined)
  testDriveAverageHandleForce(sessionManager, undefined)
  testDrivePeakHandleForce(sessionManager, undefined)
  testRecoveryDuration(sessionManager, undefined)
  testDragFactor(sessionManager, 119.92470860871332) // Theoretical value 120 * 10^âˆ’6 [ k g m 2 ]

  // Test session metrics
  testSessionType(sessionManager, 'justrow')
  testSessionState(sessionManager, 'Paused') // As we faded with a tail, the flywheel will assume an unplanned pause/stop
  testSessionTime(sessionManager, 181.3424733944077)
  testSessionMovingTimeTarget(sessionManager, undefined)
  testSessionMovingTimeToEnd(sessionManager, undefined)
  testSessionMovingTimeProjectedEnd(sessionManager, undefined)
  testSessionTimeSpentTotal(sessionManager, 181.3424733944077)
  testSessionTimeSpentMoving(sessionManager, 181.3424733944077)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 706.291973992365)
  testSessionDistanceToEnd(sessionManager, undefined)
  testSessionDistanceTarget(sessionManager, undefined)
  testSessionDistanceProjectedEnd(sessionManager, undefined)
  testSessionWorkSinceStart(sessionManager, 30825.447009125084)
  testSessionCaloriesSinceStart(sessionManager, 44.46944136298644)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 59)
  testSessionMinimumPace(sessionManager, 144.32053455877914)
  testSessionAveragePace(sessionManager, 128.37642226723648) // Theoretical value 126.4 sec/500m
  testSessionMaximumPace(sessionManager, 127.40389706972888)
  testSessionMinimumLinearVelocity(sessionManager, 3.464510449109784)
  testSessionAverageLinearVelocity(sessionManager, 3.8947961874118007)
  testSessionMaximumLinearVelocity(sessionManager, 3.9245267334824705)
  testSessionMinimumPower(sessionManager, 116.43502959686765)
  testSessionAveragePower(sessionManager, 167.8340203392529) // Theoretical value 173.33 Watts
  testSessionMaximumPower(sessionManager, 169.24658408781292)
  testSessionMinimumStrokedistance(sessionManager, 6.452070266383135)
  testSessionAverageStrokedistance(sessionManager, 11.684809832020528) // Theoretical value 11.77 meters
  testSessionMaximumStrokedistance(sessionManager, 11.797809243241765)
  testSessionMinimumStrokerate(sessionManager, 19.93472003813677)
  testSessionAverageStrokerate(sessionManager, 20.150540474688565) // Theoretical value 20 SPM
  testSessionMaximumStrokerate(sessionManager, 32.21766322503396)
  testSessionMinimumDragfactor(sessionManager, 119.77141609592097)
  testSessionAverageDragfactor(sessionManager, 119.92305170537736) // Theoretical value 120 * 10^âˆ’6 [ k g m 2 ]
  testSessionMaximumDragfactor(sessionManager, 120.12445748254608)
  testSessionNumberOfIntervals(sessionManager, 1)

  // Test interval metrics
  testIntervalNumber(sessionManager, 0)
  testIntervalWorkoutStepNumber(sessionManager, 0)
  testIntervalType(sessionManager, 'justrow')
  testIntervalTime(sessionManager, 181.3424733944077)
  testIntervalMovingTimeTarget(sessionManager, undefined)
  testIntervalMovingTimeToEnd(sessionManager, undefined)
  testIntervalMovingTimeProjectedEnd(sessionManager, undefined)
  testIntervalTimeSpentTotal(sessionManager, 181.3424733944077)
  testIntervalTimeSpentMoving(sessionManager, 181.3424733944077)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 706.291973992365)
  testIntervalDistanceToEnd(sessionManager, undefined)
  testIntervalDistanceTarget(sessionManager, undefined)
  testIntervalDistanceProjectedEnd(sessionManager, undefined)
  testIntervalWorkSinceStart(sessionManager, 30825.447009125084)
  testIntervalCaloriesSinceStart(sessionManager, 44.46944136298644)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 59)
  testIntervalMinimumPace(sessionManager, 144.32053455877914)
  testIntervalAveragePace(sessionManager, 128.37642226723648) // Theoretical value 126.4 sec/500m
  testIntervalMaximumPace(sessionManager, 127.40389706972888)
  testIntervalMinimumLinearVelocity(sessionManager, 3.464510449109784)
  testIntervalAverageLinearVelocity(sessionManager, 3.8947961874118007) // @ToDo: Find out why the average is not between min and max
  testIntervalMaximumLinearVelocity(sessionManager, 3.9245267334824705)
  testIntervalMinimumPower(sessionManager, 116.43502959686765)
  testIntervalAveragePower(sessionManager, 167.8340203392529) // Theoretical value 173.33 Watts
  testIntervalMaximumPower(sessionManager, 169.24658408781292)
  testIntervalMinimumStrokedistance(sessionManager, 6.452070266383135)
  testIntervalAverageStrokedistance(sessionManager, 11.684809832020528) // Theoretical value 11.77 meters
  testIntervalMaximumStrokedistance(sessionManager, 11.797809243241765)
  testIntervalMinimumStrokerate(sessionManager, 19.93472003813677)
  testIntervalAverageStrokerate(sessionManager, 20.150540474688565) // Theoretical value 20 SPM
  testIntervalMaximumStrokerate(sessionManager, 32.21766322503396)
  testIntervalMinimumDragfactor(sessionManager, 119.77141609592097)
  testIntervalAverageDragfactor(sessionManager, 119.92305170537736) // Theoretical value 120 * 10^âˆ’6 [ k g m 2 ]
  testIntervalMaximumDragfactor(sessionManager, 120.12445748254608)

  // Test split metrics
  // As we are in an unplanned pause, this is the rest split
  testSplitNumber(sessionManager, 1)
  testSplitType(sessionManager, 'rest')
  testSplitTime(sessionManager, 0)
  testSplitMovingTimeTarget(sessionManager, undefined)
  testSplitMovingTimeToEnd(sessionManager, 0)
  testSplitMovingTimeProjectedEnd(sessionManager, undefined)
  testSplitTimeSpentTotal(sessionManager, 0)
  testSplitTimeSpentMoving(sessionManager, 0)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 0)
  testSplitDistanceToEnd(sessionManager, undefined)
  testSplitDistanceTarget(sessionManager, undefined)
  testSplitDistanceProjectedEnd(sessionManager, undefined)
  testSplitWorkSinceStart(sessionManager, 0)
  testSplitCaloriesSinceStart(sessionManager, 0)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)
  testSplitNumberOfStrokes(sessionManager, 0)
  testSplitMinimumPace(sessionManager, Infinity)
  testSplitAveragePace(sessionManager, Infinity)
  testSplitMaximumPace(sessionManager, Infinity)
  testSplitMinimumLinearVelocity(sessionManager, 0)
  testSplitAverageLinearVelocity(sessionManager, 0)
  testSplitMaximumLinearVelocity(sessionManager, 0)
  testSplitMinimumPower(sessionManager, 0)
  testSplitAveragePower(sessionManager, 0)
  testSplitMaximumPower(sessionManager, 0)
  testSplitMinimumStrokedistance(sessionManager, 0)
  testSplitAverageStrokedistance(sessionManager, 0)
  testSplitMaximumStrokedistance(sessionManager, 0)
  testSplitMinimumStrokerate(sessionManager, 0)
  testSplitAverageStrokerate(sessionManager, 0)
  testSplitMaximumStrokerate(sessionManager, 0)
  testSplitMinimumDragfactor(sessionManager, 0)
  testSplitAverageDragfactor(sessionManager, 0)
  testSplitMaximumDragfactor(sessionManager, 0)
})

/**
 * @description Test against a theoretical model, based on a simulation of magnet positioning errors
 * Magnet errors -0.01, +0.1, +0.2, -0.2, -0.1, +0.01 degrees
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/discussions/215|this discussion}
 */
test('TheoreticalModel_08: Data with structural magnet errors on the Theoretical Model should produce plausible results for an unlimited run without startup noise', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Theoretical_Model)
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

  const sessionManager = createSessionManager(testConfig)

  testSessionType(sessionManager, 'justrow')
  testIntervalType(sessionManager, 'justrow')
  testSplitType(sessionManager, 'justrow')

  // Cut off the startup noise via a startup interval
  const intervalSettings = []
  intervalSettings[0] = {
    type: 'time',
    targetTime: 60
  }
  intervalSettings[1] = {
    type: 'justrow'
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testSessionType(sessionManager, 'justrow')
  testIntervalType(sessionManager, 'time')
  testIntervalMovingTimeTarget(sessionManager, 60)
  testSplitType(sessionManager, 'time')
  testSplitMovingTimeTarget(sessionManager, 60)

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/Theoretical_Simulation_Systematic_Noise.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, false) // This implies that all instantanuous metrics must be undefined
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 181.3424733944077)
  testTotalLinearDistance(sessionManager, 706.291973992365)
  testTotalWork(sessionManager, 30825.447009125084)
  testTotalCalories(sessionManager, 44.46944136298644)
  testTotalCaloriesPerMinute(sessionManager, 14.887874599873015)
  testTotalCaloriesPerHour (sessionManager, 893.272475992381)
  testTotalNumberOfStrokes(sessionManager, 59)
  testStrokeState(sessionManager, 'WaitingForDrive') // This is normal for an unplanned pause
  testStrokeWork(sessionManager, undefined)
  testStrokeCalories(sessionManager, undefined)
  testCycleDistance(sessionManager, undefined)
  testCycleStrokeRate(sessionManager, undefined)
  testCycleDuration(sessionManager, undefined)
  testCycleLinearVelocity(sessionManager, undefined)
  testCyclePace(sessionManager, Infinity)
  testCyclePower(sessionManager, undefined)
  testDriveLastStartTime (sessionManager, 175.3543851793926)
  testDriveDuration(sessionManager, undefined)
  testDriveLength(sessionManager, undefined)
  testDriveDistance(sessionManager, undefined)
  testDriveAverageHandleForce(sessionManager, undefined)
  testDrivePeakHandleForce(sessionManager, undefined)
  testRecoveryDuration(sessionManager, undefined)
  testDragFactor(sessionManager, 119.92470860871332) // Theoretical value 120 * 10^âˆ’6 [ k g m 2 ]

  // Test session metrics
  testSessionType(sessionManager, 'justrow')
  testSessionState(sessionManager, 'Paused') // As we faded with a tail, the flywheel will assume an unplanned pause/stop
  testSessionTime(sessionManager, 181.3424733944077)
  testSessionMovingTimeTarget(sessionManager, undefined)
  testSessionMovingTimeToEnd(sessionManager, undefined)
  testSessionMovingTimeProjectedEnd(sessionManager, undefined)
  testSessionTimeSpentTotal(sessionManager, 181.3424733944077)
  testSessionTimeSpentMoving(sessionManager, 181.3424733944077)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 706.291973992365)
  testSessionDistanceToEnd(sessionManager, undefined)
  testSessionDistanceTarget(sessionManager, undefined)
  testSessionDistanceProjectedEnd(sessionManager, undefined)
  testSessionWorkSinceStart(sessionManager, 30825.447009125084)
  testSessionCaloriesSinceStart(sessionManager, 44.46944136298644)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 59)
  testSessionMinimumPace(sessionManager, 144.32053455877914)
  testSessionAveragePace(sessionManager, 128.37642226723648) // Theoretical value 126.4 sec/500m
  testSessionMaximumPace(sessionManager, 127.40389706972888)
  testSessionMinimumLinearVelocity(sessionManager, 3.464510449109784)
  testSessionAverageLinearVelocity(sessionManager, 3.8947961874118007)
  testSessionMaximumLinearVelocity(sessionManager, 3.9245267334824705)
  testSessionMinimumPower(sessionManager, 116.43502959686765)
  testSessionAveragePower(sessionManager, 167.8340203392529) // Theoretical value 173.33 Watts
  testSessionMaximumPower(sessionManager, 169.24658408781292)
  testSessionMinimumStrokedistance(sessionManager, 6.452070266383135)
  testSessionAverageStrokedistance(sessionManager, 11.684809832020528) // Theoretical value 11.77 meters
  testSessionMaximumStrokedistance(sessionManager, 11.797809243241765)
  testSessionMinimumStrokerate(sessionManager, 19.93472003813677)
  testSessionAverageStrokerate(sessionManager, 20.150540474688565) // Theoretical value 20 SPM
  testSessionMaximumStrokerate(sessionManager, 32.21766322503396)
  testSessionMinimumDragfactor(sessionManager, 119.77141609592097)
  testSessionAverageDragfactor(sessionManager, 119.92305170537736) // Theoretical value 120 * 10^âˆ’6 [ k g m 2 ]
  testSessionMaximumDragfactor(sessionManager, 120.12445748254608)
  testSessionNumberOfIntervals(sessionManager, 2)

  // Test interval metrics
  testIntervalNumber(sessionManager, 1)
  testIntervalWorkoutStepNumber(sessionManager, 1)
  testIntervalType(sessionManager, 'justrow')
  testIntervalTime(sessionManager, 121.3424733944077) // Must be 181.3424733944077 - 60
  testIntervalMovingTimeTarget(sessionManager, undefined)
  testIntervalMovingTimeToEnd(sessionManager, undefined)
  testIntervalMovingTimeProjectedEnd(sessionManager, undefined)
  testIntervalTimeSpentTotal(sessionManager, 121.3424733944077) // Must be 181.3424733944077 - 60
  testIntervalTimeSpentMoving(sessionManager, 121.3424733944077) // Must be 181.3424733944077 - 60
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 472.59432036681153)
  testIntervalDistanceToEnd(sessionManager, undefined)
  testIntervalDistanceTarget(sessionManager, undefined)
  testIntervalDistanceProjectedEnd(sessionManager, undefined)
  testIntervalWorkSinceStart(sessionManager, 20249.36413024754)
  testIntervalCaloriesSinceStart(sessionManager, 29.396981478341157)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 39)
  testIntervalMinimumPace(sessionManager, 127.56619237664853)
  testIntervalAveragePace(sessionManager, 128.3791067360118) // @ToDo: Find out why the average is not between min and max // Theoretical value 126.4 sec/500m
  testIntervalMaximumPace(sessionManager, 127.40758861515249)
  testIntervalMinimumLinearVelocity(sessionManager, 3.9195337783831734)
  testIntervalAverageLinearVelocity(sessionManager, 3.8947147453530637) // @ToDo: Find out why the average is not between min and max
  testIntervalMaximumLinearVelocity(sessionManager, 3.9244130230758905)
  testIntervalMinimumPower(sessionManager, 168.60143772708057)
  testIntervalAveragePower(sessionManager, 168.91413373215897) // Theoretical value 173.33 Watts
  testIntervalMaximumPower(sessionManager, 169.23187165676933)
  testIntervalMinimumStrokedistance(sessionManager, 11.724530924929411)
  testIntervalAverageStrokedistance(sessionManager, 11.765867412158823) // Theoretical value 11.77 meters
  testIntervalMaximumStrokedistance(sessionManager, 11.797809243208839)
  testIntervalMinimumStrokerate(sessionManager, 19.93472003813677)
  testIntervalAverageStrokerate(sessionManager, 20.00001841711283) // Theoretical value 20 SPM
  testIntervalMaximumStrokerate(sessionManager, 20.081870630909517)
  testIntervalMinimumDragfactor(sessionManager, 119.92470860848056)
  testIntervalAverageDragfactor(sessionManager, 119.9247086088608) // Theoretical value 120 * 10^âˆ’6 [ k g m 2 ]
  testIntervalMaximumDragfactor(sessionManager, 119.92470860915626)

  // Test split metrics
  // As we are in an unplanned pause, this is the rest split
  testSplitNumber(sessionManager, 2)
  testSplitType(sessionManager, 'rest')
  testSplitTime(sessionManager, 0)
  testSplitMovingTimeTarget(sessionManager, undefined)
  testSplitMovingTimeToEnd(sessionManager, 0)
  testSplitMovingTimeProjectedEnd(sessionManager, undefined)
  testSplitTimeSpentTotal(sessionManager, 0)
  testSplitTimeSpentMoving(sessionManager, 0)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 0)
  testSplitDistanceToEnd(sessionManager, undefined)
  testSplitDistanceTarget(sessionManager, undefined)
  testSplitDistanceProjectedEnd(sessionManager, undefined)
  testSplitWorkSinceStart(sessionManager, 0)
  testSplitCaloriesSinceStart(sessionManager, 0)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)
  testSplitNumberOfStrokes(sessionManager, 0)
  testSplitMinimumPace(sessionManager, Infinity)
  testSplitAveragePace(sessionManager, Infinity)
  testSplitMaximumPace(sessionManager, Infinity)
  testSplitMinimumLinearVelocity(sessionManager, 0)
  testSplitAverageLinearVelocity(sessionManager, 0)
  testSplitMaximumLinearVelocity(sessionManager, 0)
  testSplitMinimumPower(sessionManager, 0)
  testSplitAveragePower(sessionManager, 0)
  testSplitMaximumPower(sessionManager, 0)
  testSplitMinimumStrokedistance(sessionManager, 0)
  testSplitAverageStrokedistance(sessionManager, 0)
  testSplitMaximumStrokedistance(sessionManager, 0)
  testSplitMinimumStrokerate(sessionManager, 0)
  testSplitAverageStrokerate(sessionManager, 0)
  testSplitMaximumStrokerate(sessionManager, 0)
  testSplitMinimumDragfactor(sessionManager, 0)
  testSplitAverageDragfactor(sessionManager, 0)
  testSplitMaximumDragfactor(sessionManager, 0)
})

/**
 * @description Test against a theoretical model, based on a simulation of magnet positioning errors
 * Magnet errors -0.01, +0.1, +0.2, -0.2, -0.1, +0.01 degrees
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/discussions/215|this discussion}
 */
test('TheoreticalModel_09: Data with structural magnet errors on the Theoretical Model should produce plausible results for an unlimited run without startup noise', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Theoretical_Model)
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

  const sessionManager = createSessionManager(testConfig)

  testSessionType(sessionManager, 'justrow')
  testIntervalType(sessionManager, 'justrow')
  testSplitType(sessionManager, 'justrow')

  // Cut off the startup noise via a startup interval
  const intervalSettings = []
  intervalSettings[0] = {
    type: 'distance',
    targetDistance: 200,
    split: {
      type: 'distance',
      targetDistance: 100
    }
  }
  intervalSettings[1] = {
    type: 'distance',
    targetDistance: 500,
    split: {
      type: 'distance',
      targetDistance: 100
    }
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testSessionType(sessionManager, 'distance')
  testSessionDistanceTarget(sessionManager, 700)
  testIntervalType(sessionManager, 'distance')
  testIntervalDistanceTarget(sessionManager, 200)
  testSplitType(sessionManager, 'distance')
  testSplitDistanceTarget(sessionManager, 100)

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/Theoretical_Simulation_Systematic_Noise.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, false) // This implies that all instantanuous metrics must be undefined
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 179.10634837290942)
  testTotalLinearDistance(sessionManager, 700.0266777793616)
  testTotalWork(sessionManager, 30825.447009125084)
  testTotalCalories(sessionManager, 44.28309761119491)
  testTotalCaloriesPerMinute(sessionManager, 14.887874599873015)
  testTotalCaloriesPerHour (sessionManager, 893.272475992381)
  testTotalNumberOfStrokes(sessionManager, 59)
  testStrokeState(sessionManager, 'Stopped')
  testStrokeWork(sessionManager, undefined)
  testStrokeCalories(sessionManager, undefined)
  testCycleDistance(sessionManager, undefined)
  testCycleStrokeRate(sessionManager, undefined)
  testCycleDuration(sessionManager, undefined)
  testCycleLinearVelocity(sessionManager, undefined)
  testCyclePace(sessionManager, Infinity)
  testCyclePower(sessionManager, undefined)
  testDriveLastStartTime (sessionManager, 175.3543851793926)
  testDriveDuration(sessionManager, undefined)
  testDriveLength(sessionManager, undefined)
  testDriveDistance(sessionManager, undefined)
  testDriveAverageHandleForce(sessionManager, undefined)
  testDrivePeakHandleForce(sessionManager, undefined)
  testRecoveryDuration(sessionManager, undefined)
  testDragFactor(sessionManager, 119.92470860871332) // Theoretical value 120 * 10^Ã¢Ë†â€™6 [ k g m 2 ]

  // Test session metrics
  testSessionType(sessionManager, 'distance')
  testSessionState(sessionManager, 'Stopped')
  testSessionTime(sessionManager, 179.10634837290942)
  testSessionMovingTimeTarget(sessionManager, undefined)
  testSessionMovingTimeToEnd(sessionManager, undefined) // ??
  testSessionMovingTimeProjectedEnd(sessionManager, 179.09921884268792)
  testSessionTimeSpentTotal(sessionManager, 179.10634837290942)
  testSessionTimeSpentMoving(sessionManager, 179.10634837290942)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 700.0266777793616) // Must be 700
  testSessionDistanceToEnd(sessionManager, -0.02667777936164839) // Thi8s is a testing artifact
  testSessionDistanceTarget(sessionManager, 700)
  testSessionDistanceProjectedEnd(sessionManager, 700)
  testSessionWorkSinceStart(sessionManager, 30825.447009125084)
  testSessionCaloriesSinceStart(sessionManager, 44.28309761119491)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 59)
  testSessionMinimumPace(sessionManager, 144.32053455877914)
  testSessionAveragePace(sessionManager, 127.92823049335355) // Theoretical value 126.4 sec/500m
  testSessionMaximumPace(sessionManager, 127.40389706972888)
  testSessionMinimumLinearVelocity(sessionManager, 3.464510449109784)
  testSessionAverageLinearVelocity(sessionManager, 3.9084414602762543)
  testSessionMaximumLinearVelocity(sessionManager, 3.9245267334824705)
  testSessionMinimumPower(sessionManager, 116.43502959686765)
  testSessionAveragePower(sessionManager, 167.84318036808412) // Theoretical value 173.33 Watts
  testSessionMaximumPower(sessionManager, 169.24658408781292)
  testSessionMinimumStrokedistance(sessionManager, 6.452070266383135)
  testSessionAverageStrokedistance(sessionManager, 11.685456952800514) // Theoretical value 11.77 meters
  testSessionMaximumStrokedistance(sessionManager, 11.797809243241765)
  testSessionMinimumStrokerate(sessionManager, 19.93472003813677)
  testSessionAverageStrokerate(sessionManager, 20.149332641731963) // Theoretical value 20 SPM
  testSessionMaximumStrokerate(sessionManager, 32.21766322503396)
  testSessionMinimumDragfactor(sessionManager, 119.77141609592097)
  testSessionAverageDragfactor(sessionManager, 119.92305170537736) // Theoretical value 120 * 10^Ã¢Ë†â€™6 [ k g m 2 ]
  testSessionMaximumDragfactor(sessionManager, 120.12445748254608)
  testSessionNumberOfIntervals(sessionManager, 2)

  // Test interval metrics
  testIntervalNumber(sessionManager, 1)
  testIntervalWorkoutStepNumber(sessionManager, 1)
  testIntervalType(sessionManager, 'distance')
  testIntervalTime(sessionManager, 127.698945752801)
  testIntervalMovingTimeTarget(sessionManager, undefined)
  testIntervalMovingTimeToEnd(sessionManager, undefined)
  testIntervalMovingTimeProjectedEnd(sessionManager, 127.69181622257949)
  testIntervalTimeSpentTotal(sessionManager, 127.698945752801)
  testIntervalTimeSpentMoving(sessionManager, 127.698945752801)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 500.02667777936165) // Must be 500
  testIntervalDistanceToEnd(sessionManager, -0.02667777936164839) // This is a testing artifact
  testIntervalDistanceTarget(sessionManager, 500)
  testIntervalDistanceProjectedEnd(sessionManager, 500)
  testIntervalWorkSinceStart(sessionManager, 21805.629791344654)
  testIntervalCaloriesSinceStart(sessionManager, 31.408845280680705)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 42)
  testIntervalMinimumPace(sessionManager, 127.56619237664853)
  testIntervalAveragePace(sessionManager, 127.69213266771794) // @ToDo: Find out why the average is not between min and max // Theoretical value 126.4 sec/500m
  testIntervalMaximumPace(sessionManager, 127.40758861515249)
  testIntervalMinimumLinearVelocity(sessionManager, 3.9195337783831734)
  testIntervalAverageLinearVelocity(sessionManager, 3.9156680177087044) // @ToDo: Find out why the average is not between min and max // Theoretical value 126.4 sec/500m
  testIntervalMaximumLinearVelocity(sessionManager, 3.9244130230758905)
  testIntervalMinimumPower(sessionManager, 168.60143772708057)
  testIntervalAveragePower(sessionManager, 168.9135517818113) // Theoretical value 173.33 Watts
  testIntervalMaximumPower(sessionManager, 169.23187165676933)
  testIntervalMinimumStrokedistance(sessionManager, 11.724530924929411)
  testIntervalAverageStrokedistance(sessionManager, 11.765480573374434) // Theoretical value 11.77 meters
  testIntervalMaximumStrokedistance(sessionManager, 11.797809243208839)
  testIntervalMinimumStrokerate(sessionManager, 19.93472003813677)
  testIntervalAverageStrokerate(sessionManager, 20.000651573915178) // Theoretical value 20 SPM
  testIntervalMaximumStrokerate(sessionManager, 20.081870630909517)
  testIntervalMinimumDragfactor(sessionManager, 119.92470860848056)
  testIntervalAverageDragfactor(sessionManager, 119.92470860886081) // Theoretical value 120 * 10^Ã¢Ë†â€™6 [ k g m 2 ]
  testIntervalMaximumDragfactor(sessionManager, 119.92470860915626)

  // Test split metrics
  testSplitNumber(sessionManager, 6)
  testSplitType(sessionManager, 'distance')
  testSplitTime(sessionManager, 25.71247191894588)
  testSplitMovingTimeTarget(sessionManager, undefined)
  testSplitMovingTimeToEnd(sessionManager, undefined)
  testSplitMovingTimeProjectedEnd(sessionManager, 25.705342388724375)
  testSplitTimeSpentTotal(sessionManager, 25.71247191894588)
  testSplitTimeSpentMoving(sessionManager, 25.71247191894588)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 100.02667777936165) // Must be 100
  testSplitDistanceToEnd(sessionManager, -0.02667777936164839) // This is a testing artifact
  testSplitDistanceTarget(sessionManager, 100)
  testSplitDistanceProjectedEnd(sessionManager, 100)
  testSplitWorkSinceStart(sessionManager, 4153.888188366189)
  testSplitCaloriesSinceStart(sessionManager, 6.09878998216567)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)
  testSplitNumberOfStrokes(sessionManager, 8)
  testSplitMinimumPace(sessionManager, 127.56619237664853)
  testSplitAveragePace(sessionManager, 128.5280711594877) // @ToDo: Find out why the average is not between min and max // Theoretical value 126.4 sec/500m
  testSplitMaximumPace(sessionManager, 127.4603200487888)
  testSplitMinimumLinearVelocity(sessionManager, 3.9195337783831734)
  testSplitAverageLinearVelocity(sessionManager, 3.8902007591754866) // Theoretical value 126.4 sec/500m
  testSplitMaximumLinearVelocity(sessionManager, 3.922789459563665)
  testSplitMinimumPower(sessionManager, 168.60143772708057)
  testSplitAveragePower(sessionManager, 168.85290357507074) // Theoretical value 173.33 Watts
  testSplitMaximumPower(sessionManager, 169.02193163175738)
  testSplitMinimumStrokedistance(sessionManager, 11.761170084055639)
  testSplitAverageStrokedistance(sessionManager, 11.766558195702117) // Theoretical value 11.77 meters
  testSplitMaximumStrokedistance(sessionManager, 11.797809243208839)
  testSplitMinimumStrokerate(sessionManager, 19.93472003813677)
  testSplitAverageStrokerate(sessionManager, 19.996423510611475) // Theoretical value 20 SPM
  testSplitMaximumStrokerate(sessionManager, 20.008067113920635)
  testSplitMinimumDragfactor(sessionManager, 119.92470860860358)
  testSplitAverageDragfactor(sessionManager, 119.92470860886526) // Theoretical value 120 * 10^Ã¢Ë†â€™6 [ k g m 2 ]
  testSplitMaximumDragfactor(sessionManager, 119.92470860915626)
})

/**
 * From this point on, the reference machine (Concept2 RowErg with a PM5) will be used
 */

/**
 * @description Test behaviour for the C2 RowErg in a 'Just Row' session
 */
test('C2_RowErg_01: A full session for a Concept2 RowErg should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Concept2_RowErg)
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
  const sessionManager = createSessionManager(testConfig)

  testSessionType(sessionManager, 'justrow')
  testIntervalType(sessionManager, 'justrow')
  testSplitType(sessionManager, 'justrow')

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/Concept2_RowErg_Session_2000meters.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, true)
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 589.9664157362346)
  testTotalLinearDistance(sessionManager, 2028.3093228150667)
  testTotalWork(sessionManager, 67751.31484279277)
  testTotalCalories(sessionManager, 113.68892973306028)
  testTotalCaloriesPerMinute(sessionManager, 11.542360132437295)
  testTotalCaloriesPerHour (sessionManager, 692.5416079462377)
  testTotalNumberOfStrokes(sessionManager, 205)
  testStrokeState(sessionManager, 'Recovery')
  testStrokeWork(sessionManager, 330.7759067800944)
  testStrokeCalories(sessionManager, 0.5617995397938088)
  testCycleDistance(sessionManager, 10.261713455631917)
  testCycleStrokeRate(sessionManager, 20.26138264188829)
  testCycleDuration(sessionManager, 2.9612984000389133)
  testCycleLinearVelocity(sessionManager, 3.4650957806968687)
  testCyclePace(sessionManager, 144.29615561721775)
  testCyclePower(sessionManager, 116.49419766383924)
  testDriveLastStartTime (sessionManager, 587.302081036686) // Since the last drive is witin 6 seconds, the session has not been able to pause yet
  testDriveDuration(sessionManager, 0.7332495742683705)
  testDriveLength(sessionManager, 1.1728612573401769)
  testDriveDistance(sessionManager, 2.5693271336160244)
  testDriveAverageHandleForce(sessionManager, 284.3396357312365)
  testDrivePeakHandleForce(sessionManager, 444.35598591963236)
  testRecoveryDuration(sessionManager, 2.2585963714949457)
  testDragFactor(sessionManager, 80.77192371126783)

  // Test session metrics
  testSessionType(sessionManager, 'justrow')
  testSessionState(sessionManager, 'Rowing')
  testSessionTime(sessionManager, 589.9664157362346)
  testSessionMovingTimeTarget(sessionManager, undefined)
  testSessionMovingTimeToEnd(sessionManager, undefined)
  testSessionMovingTimeProjectedEnd(sessionManager, undefined)
  testSessionTimeSpentTotal(sessionManager, 589.9664157362346)
  testSessionTimeSpentMoving(sessionManager, 589.9664157362346)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 2028.3093228150667)
  testSessionDistanceToEnd(sessionManager, undefined)
  testSessionDistanceTarget(sessionManager, undefined)
  testSessionDistanceProjectedEnd(sessionManager, undefined)
  testSessionWorkSinceStart(sessionManager, 67751.31484279277)
  testSessionCaloriesSinceStart(sessionManager, 113.68892973306028)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 205)
  testSessionMinimumPace(sessionManager, 179.5376166116343)
  testSessionAveragePace(sessionManager, 145.43304837681936)
  testSessionMaximumPace(sessionManager, 142.0274009673654)
  testSessionMinimumLinearVelocity(sessionManager, 2.7849317008678574)
  testSessionAverageLinearVelocity(sessionManager, 3.438008111502222)
  testSessionMaximumLinearVelocity(sessionManager, 3.5204474389761478)
  testSessionMinimumPower(sessionManager, 60.47859281426262)
  testSessionAveragePower(sessionManager, 113.90001827057858)
  testSessionMaximumPower(sessionManager, 122.16651759501134)
  testSessionMinimumStrokedistance(sessionManager, 7.107647385095529)
  testSessionAverageStrokedistance(sessionManager, 9.860928675480205)
  testSessionMaximumStrokedistance(sessionManager, 10.524188926326556)
  testSessionMinimumStrokerate(sessionManager, 19.73589341291662)
  testSessionAverageStrokerate(sessionManager, 20.93351037644888)
  testSessionMaximumStrokerate(sessionManager, 23.509312294032103)
  testSessionMinimumDragfactor(sessionManager, 80.59518571754946)
  testSessionAverageDragfactor(sessionManager, 81.607049911396)
  testSessionMaximumDragfactor(sessionManager, 86.87374547552109)
  testSessionNumberOfIntervals(sessionManager, 1)

  // Test interval metrics
  testIntervalNumber(sessionManager, 0)
  testIntervalWorkoutStepNumber(sessionManager, 0)
  testIntervalType(sessionManager, 'justrow')
  testIntervalTime(sessionManager, 589.9664157362346)
  testIntervalMovingTimeTarget(sessionManager, undefined)
  testIntervalMovingTimeToEnd(sessionManager, undefined)
  testIntervalMovingTimeProjectedEnd(sessionManager, undefined)
  testIntervalTimeSpentTotal(sessionManager, 589.9664157362346)
  testIntervalTimeSpentMoving(sessionManager, 589.9664157362346)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 2028.3093228150667)
  testIntervalDistanceToEnd(sessionManager, undefined)
  testIntervalDistanceTarget(sessionManager, undefined)
  testIntervalDistanceProjectedEnd(sessionManager, undefined)
  testIntervalWorkSinceStart(sessionManager, 67751.31484279277)
  testIntervalCaloriesSinceStart(sessionManager, 113.68892973306028)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 205)
  testIntervalMinimumPace(sessionManager, 179.5376166116343)
  testIntervalAveragePace(sessionManager, 145.43304837681936)
  testIntervalMaximumPace(sessionManager, 142.0274009673654)
  testIntervalMinimumLinearVelocity(sessionManager, 2.7849317008678574)
  testIntervalAverageLinearVelocity(sessionManager, 3.438008111502222)
  testIntervalMaximumLinearVelocity(sessionManager, 3.5204474389761478)
  testIntervalMinimumPower(sessionManager, 60.47859281426262)
  testIntervalAveragePower(sessionManager, 113.90001827057858)
  testIntervalMaximumPower(sessionManager, 122.16651759501134)
  testIntervalMinimumStrokedistance(sessionManager, 7.107647385095529)
  testIntervalAverageStrokedistance(sessionManager, 9.860928675480205)
  testIntervalMaximumStrokedistance(sessionManager, 10.524188926326556)
  testIntervalMinimumStrokerate(sessionManager, 19.73589341291662)
  testIntervalAverageStrokerate(sessionManager, 20.93351037644888)
  testIntervalMaximumStrokerate(sessionManager, 23.509312294032103)
  testIntervalMinimumDragfactor(sessionManager, 80.59518571754946)
  testIntervalAverageDragfactor(sessionManager, 81.607049911396)
  testIntervalMaximumDragfactor(sessionManager, 86.87374547552109)

  // Test split metrics
  testSplitNumber(sessionManager, 0)
  testSplitType(sessionManager, 'justrow')
  testSplitTime(sessionManager, 589.9664157362346)
  testSplitMovingTimeTarget(sessionManager, undefined)
  testSplitMovingTimeToEnd(sessionManager, undefined)
  testSplitMovingTimeProjectedEnd(sessionManager, undefined)
  testSplitTimeSpentTotal(sessionManager, 589.9664157362346)
  testSplitTimeSpentMoving(sessionManager, 589.9664157362346)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 2028.3093228150667)
  testSplitDistanceToEnd(sessionManager, undefined)
  testSplitDistanceTarget(sessionManager, undefined)
  testSplitDistanceProjectedEnd(sessionManager, undefined)
  testSplitWorkSinceStart(sessionManager, 67751.31484279277)
  testSplitCaloriesSinceStart(sessionManager, 113.68892973306028)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)
  testSplitNumberOfStrokes(sessionManager, 205)
  testSplitMinimumPace(sessionManager, 179.5376166116343)
  testSplitAveragePace(sessionManager, 145.43304837681936)
  testSplitMaximumPace(sessionManager, 142.0274009673654)
  testSplitMinimumLinearVelocity(sessionManager, 2.7849317008678574)
  testSplitAverageLinearVelocity(sessionManager, 3.438008111502222)
  testSplitMaximumLinearVelocity(sessionManager, 3.5204474389761478)
  testSplitMinimumPower(sessionManager, 60.47859281426262)
  testSplitAveragePower(sessionManager, 113.90001827057858)
  testSplitMaximumPower(sessionManager, 122.16651759501134)
  testSplitMinimumStrokedistance(sessionManager, 7.107647385095529)
  testSplitAverageStrokedistance(sessionManager, 9.860928675480205)
  testSplitMaximumStrokedistance(sessionManager, 10.524188926326556)
  testSplitMinimumStrokerate(sessionManager, 19.73589341291662)
  testSplitAverageStrokerate(sessionManager, 20.93351037644888)
  testSplitMaximumStrokerate(sessionManager, 23.509312294032103)
  testSplitMinimumDragfactor(sessionManager, 80.59518571754946)
  testSplitAverageDragfactor(sessionManager, 81.607049911396)
  testSplitMaximumDragfactor(sessionManager, 86.87374547552109)
})

/**
 * @description Test behaviour for the C2 RowErg in a single interval session with a Distance target
 */
test('C2_RowErg_02: A 2000 meter session for a Concept2 RowErg should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Concept2_RowErg)
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
  const sessionManager = createSessionManager(testConfig)

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'distance',
    targetDistance: 2000,
    targetTime: 0
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testSessionType(sessionManager, 'distance')
  testSessionDistanceTarget(sessionManager, 2000)
  testIntervalType(sessionManager, 'distance')
  testIntervalDistanceTarget(sessionManager, 2000)
  testSplitType(sessionManager, 'distance')
  testSplitDistanceTarget(sessionManager, 2000)

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/Concept2_RowErg_Session_2000meters.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, false)
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 581.8270194717597)
  testTotalLinearDistance(sessionManager, 2000.010942750369)
  testTotalWork(sessionManager, 66911.3317369586)
  testTotalCalories(sessionManager, 112.21066280070247)
  testTotalCaloriesPerMinute(sessionManager, 11.539575094705384)
  testTotalCaloriesPerHour (sessionManager, 692.3745056823234)
  testTotalNumberOfStrokes(sessionManager, 203)
  testStrokeState(sessionManager, 'Stopped')
  testStrokeWork(sessionManager, undefined)
  testStrokeCalories(sessionManager, undefined)
  testCycleDistance(sessionManager, undefined)
  testCycleStrokeRate(sessionManager, undefined)
  testCycleDuration(sessionManager, undefined)
  testCycleLinearVelocity(sessionManager, undefined)
  testCyclePace(sessionManager, Infinity)
  testCyclePower(sessionManager, undefined)
  testDriveLastStartTime (sessionManager, 581.4837629473499)
  testDriveDuration(sessionManager, undefined)
  testDriveLength(sessionManager, undefined)
  testDriveDistance(sessionManager, undefined)
  testDriveAverageHandleForce(sessionManager, undefined)
  testDrivePeakHandleForce(sessionManager, undefined)
  testRecoveryDuration(sessionManager, undefined)
  testDragFactor(sessionManager, 80.73138415749969)

  // Test session metrics
  testSessionType(sessionManager, 'distance')
  testSessionState(sessionManager, 'Stopped')
  testSessionTime(sessionManager, 581.8270194717597)
  testSessionMovingTimeTarget(sessionManager, undefined)
  testSessionMovingTimeToEnd(sessionManager, undefined)
  testSessionMovingTimeProjectedEnd(sessionManager, 581.8236773633961)
  testSessionTimeSpentTotal(sessionManager, 581.8270194717597)
  testSessionTimeSpentMoving(sessionManager, 581.8270194717597)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 2000.010942750369)
  testSessionDistanceToEnd(sessionManager, -0.010942750368940324) // This is a testing artifact
  testSessionDistanceTarget(sessionManager, 2000)
  testSessionDistanceProjectedEnd(sessionManager, 2000)
  testSessionWorkSinceStart(sessionManager, 66911.3317369586)
  testSessionCaloriesSinceStart(sessionManager, 112.21066280070247)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 203)
  testSessionMinimumPace(sessionManager, 179.5376166116343)
  testSessionAveragePace(sessionManager, 145.4559590238153)
  testSessionMaximumPace(sessionManager, 142.0274009673654)
  testSessionMinimumLinearVelocity(sessionManager, 2.7849317008678574)
  testSessionAverageLinearVelocity(sessionManager, 3.437466593707142)
  testSessionMaximumLinearVelocity(sessionManager, 3.5204474389761478)
  testSessionMinimumPower(sessionManager, 60.47859281426262)
  testSessionAveragePower(sessionManager, 113.87181597977373)
  testSessionMaximumPower(sessionManager, 122.16651759501134)
  testSessionMinimumStrokedistance(sessionManager, 7.107647385095529)
  testSessionAverageStrokedistance(sessionManager, 9.859022488181807)
  testSessionMaximumStrokedistance(sessionManager, 10.524188926326556)
  testSessionMinimumStrokerate(sessionManager, 19.73589341291662)
  testSessionAverageStrokerate(sessionManager, 20.935842468347502)
  testSessionMaximumStrokerate(sessionManager, 23.509312294032103)
  testSessionMinimumDragfactor(sessionManager, 80.59518571754946)
  testSessionAverageDragfactor(sessionManager, 81.6148058901703)
  testSessionMaximumDragfactor(sessionManager, 86.87374547552109)
  testSessionNumberOfIntervals(sessionManager, 1)

  // Test interval metrics
  testIntervalNumber(sessionManager, 0)
  testIntervalWorkoutStepNumber(sessionManager, 0)
  testIntervalType(sessionManager, 'distance')
  testIntervalTime(sessionManager, 581.8270194717597)
  testIntervalMovingTimeTarget(sessionManager, undefined)
  testIntervalMovingTimeToEnd(sessionManager, undefined)
  testIntervalMovingTimeProjectedEnd(sessionManager, 581.8236773633961) // @ToDo find out why this deviates from the session projection
  testIntervalTimeSpentTotal(sessionManager, 581.8270194717597)
  testIntervalTimeSpentMoving(sessionManager, 581.8270194717597)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 2000.010942750369)
  testIntervalDistanceToEnd(sessionManager, -0.010942750368940324) // This is a testing artifact
  testIntervalDistanceTarget(sessionManager, 2000)
  testIntervalDistanceProjectedEnd(sessionManager, 2000)
  testIntervalWorkSinceStart(sessionManager, 66911.3317369586)
  testIntervalCaloriesSinceStart(sessionManager, 112.21066280070247)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 203)
  testIntervalMinimumPace(sessionManager, 179.5376166116343)
  testIntervalAveragePace(sessionManager, 145.4559590238153)
  testIntervalMaximumPace(sessionManager, 142.0274009673654)
  testIntervalMinimumLinearVelocity(sessionManager, 2.7849317008678574)
  testIntervalAverageLinearVelocity(sessionManager, 3.437466593707142)
  testIntervalMaximumLinearVelocity(sessionManager, 3.5204474389761478)
  testIntervalMinimumPower(sessionManager, 60.47859281426262)
  testIntervalAveragePower(sessionManager, 113.87181597977373)
  testIntervalMaximumPower(sessionManager, 122.16651759501134)
  testIntervalMinimumStrokedistance(sessionManager, 7.107647385095529)
  testIntervalAverageStrokedistance(sessionManager, 9.859022488181807)
  testIntervalMaximumStrokedistance(sessionManager, 10.524188926326556)
  testIntervalMinimumStrokerate(sessionManager, 19.73589341291662)
  testIntervalAverageStrokerate(sessionManager, 20.935842468347502)
  testIntervalMaximumStrokerate(sessionManager, 23.509312294032103)
  testIntervalMinimumDragfactor(sessionManager, 80.59518571754946)
  testIntervalAverageDragfactor(sessionManager, 81.6148058901703)
  testIntervalMaximumDragfactor(sessionManager, 86.87374547552109)

  // Test split metrics
  testSplitNumber(sessionManager, 0)
  testSplitType(sessionManager, 'distance')
  testSplitTime(sessionManager, 581.8270194717597)
  testSplitMovingTimeTarget(sessionManager, undefined)
  testSplitMovingTimeToEnd(sessionManager, undefined)
  testSplitMovingTimeProjectedEnd(sessionManager, 581.8236773633961) // @ToDo find out why this deviates from the session projection
  testSplitTimeSpentTotal(sessionManager, 581.8270194717597)
  testSplitTimeSpentMoving(sessionManager, 581.8270194717597)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 2000.010942750369)
  testSplitDistanceToEnd(sessionManager, -0.010942750368940324) // This is a testing artifact
  testSplitDistanceTarget(sessionManager, 2000)
  testSplitDistanceProjectedEnd(sessionManager, 2000)
  testSplitWorkSinceStart(sessionManager, 66911.3317369586)
  testSplitCaloriesSinceStart(sessionManager, 112.21066280070247)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)
  testSplitNumberOfStrokes(sessionManager, 203)
  testSplitMinimumPace(sessionManager, 179.5376166116343)
  testSplitAveragePace(sessionManager, 145.4559590238153)
  testSplitMaximumPace(sessionManager, 142.0274009673654)
  testSplitMinimumLinearVelocity(sessionManager, 2.7849317008678574)
  testSplitAverageLinearVelocity(sessionManager, 3.437466593707142)
  testSplitMaximumLinearVelocity(sessionManager, 3.5204474389761478)
  testSplitMinimumPower(sessionManager, 60.47859281426262)
  testSplitAveragePower(sessionManager, 113.87181597977373)
  testSplitMaximumPower(sessionManager, 122.16651759501134)
  testSplitMinimumStrokedistance(sessionManager, 7.107647385095529)
  testSplitAverageStrokedistance(sessionManager, 9.859022488181807)
  testSplitMaximumStrokedistance(sessionManager, 10.524188926326556)
  testSplitMinimumStrokerate(sessionManager, 19.73589341291662)
  testSplitAverageStrokerate(sessionManager, 20.935842468347502)
  testSplitMaximumStrokerate(sessionManager, 23.509312294032103)
  testSplitMinimumDragfactor(sessionManager, 80.59518571754946)
  testSplitAverageDragfactor(sessionManager, 81.6148058901703)
  testSplitMaximumDragfactor(sessionManager, 86.87374547552109)
})

/**
 * @description Test behaviour for the C2 RowErg in a single interval session with a Time target
 * This also tests the repeated updating of the workout plan
 */
test('C2_RowErg_03: A 580 seconds session for a Concept2 RowErg should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Concept2_RowErg)
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
  const sessionManager = createSessionManager(testConfig)

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'distance',
    targetDistance: 2000,
    targetTime: 0
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testSessionType(sessionManager, 'distance')
  testSessionDistanceTarget(sessionManager, 2000)
  testIntervalType(sessionManager, 'distance')
  testIntervalDistanceTarget(sessionManager, 2000)
  testSplitType(sessionManager, 'distance')
  testSplitDistanceTarget(sessionManager, 2000)

  // Let's reset that workout plan
  intervalSettings[0] = {
    type: 'time',
    targetDistance: 0,
    targetTime: 580
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testSessionType(sessionManager, 'time')
  testSessionMovingTimeTarget(sessionManager, 580)
  testIntervalType(sessionManager, 'time')
  testIntervalMovingTimeTarget(sessionManager, 580)
  testSplitType(sessionManager, 'time')
  testSplitMovingTimeTarget(sessionManager, 580)

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/Concept2_RowErg_Session_2000meters.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, false)
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 580.0012592877247)
  testTotalLinearDistance(sessionManager, 1993.9102063497517)
  testTotalWork(sessionManager, 66743.55736267459)
  testTotalCalories(sessionManager, 111.89873100033381)
  testTotalCaloriesPerMinute(sessionManager, 11.53922973724572)
  testTotalCaloriesPerHour (sessionManager, 692.353784234743)
  testTotalNumberOfStrokes(sessionManager, 202)
  testStrokeState(sessionManager, 'Stopped')
  testStrokeWork(sessionManager, undefined)
  testStrokeCalories(sessionManager, undefined)
  testCycleDistance(sessionManager, undefined)
  testCycleStrokeRate(sessionManager, undefined)
  testCycleDuration(sessionManager, undefined)
  testCycleLinearVelocity(sessionManager, undefined)
  testCyclePace(sessionManager, Infinity)
  testCyclePower(sessionManager, undefined)
  testDriveLastStartTime (sessionManager, 578.6205943255404)
  testDriveDuration(sessionManager, undefined)
  testDriveLength(sessionManager, undefined)
  testDriveDistance(sessionManager, undefined)
  testDriveAverageHandleForce(sessionManager, undefined)
  testDrivePeakHandleForce(sessionManager, undefined)
  testRecoveryDuration(sessionManager, undefined)
  testDragFactor(sessionManager, 80.76953491531596)

  // Test session metrics
  testSessionType(sessionManager, 'time')
  testSessionState(sessionManager, 'Stopped')
  testSessionTime(sessionManager, 580.0012592877247)
  testSessionMovingTimeTarget(sessionManager, 580)
  testSessionMovingTimeToEnd(sessionManager, -0.0012592877246788703) // This is a testing artifact
  testSessionMovingTimeProjectedEnd(sessionManager, 580)
  testSessionTimeSpentTotal(sessionManager, 580.0012592877247)
  testSessionTimeSpentMoving(sessionManager, 580.0012592877247)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 1993.9102063497517)
  testSessionDistanceToEnd(sessionManager, undefined)
  testSessionDistanceTarget(sessionManager, undefined)
  testSessionDistanceProjectedEnd(sessionManager, 1993.9055444257651)
  testSessionWorkSinceStart(sessionManager, 66743.55736267459)
  testSessionCaloriesSinceStart(sessionManager, 111.89873100033381)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 202)
  testSessionMinimumPace(sessionManager, 179.5376166116343)
  testSessionAveragePace(sessionManager, 145.443174281537)
  testSessionMaximumPace(sessionManager, 142.0274009673654)
  testSessionMinimumLinearVelocity(sessionManager, 2.7849317008678574)
  testSessionAverageLinearVelocity(sessionManager, 3.4377687538099306)
  testSessionMaximumLinearVelocity(sessionManager, 3.5204474389761478)
  testSessionMinimumPower(sessionManager, 60.47859281426262)
  testSessionAveragePower(sessionManager, 113.86152135697425)
  testSessionMaximumPower(sessionManager, 122.16651759501134)
  testSessionMinimumStrokedistance(sessionManager, 7.107647385095529)
  testSessionAverageStrokedistance(sessionManager, 9.858745898234758)
  testSessionMaximumStrokedistance(sessionManager, 10.524188926326556)
  testSessionMinimumStrokerate(sessionManager, 19.73589341291662)
  testSessionAverageStrokerate(sessionManager, 20.93582388255797)
  testSessionMaximumStrokerate(sessionManager, 23.509312294032103)
  testSessionMinimumDragfactor(sessionManager, 80.59518571754946)
  testSessionAverageDragfactor(sessionManager, 81.61708137780113)
  testSessionMaximumDragfactor(sessionManager, 86.87374547552109)
  testSessionNumberOfIntervals(sessionManager, 1)

  // Test interval metrics
  testIntervalNumber(sessionManager, 0)
  testIntervalWorkoutStepNumber(sessionManager, 0)
  testIntervalType(sessionManager, 'time')
  testIntervalTime(sessionManager, 580.0012592877247)
  testIntervalMovingTimeTarget(sessionManager, 580)
  testIntervalMovingTimeToEnd(sessionManager, -0.0012592877246788703)
  testIntervalMovingTimeProjectedEnd(sessionManager, 580)
  testIntervalTimeSpentTotal(sessionManager, 580.0012592877247)
  testIntervalTimeSpentMoving(sessionManager, 580.0012592877247)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 1993.9102063497517)
  testIntervalDistanceToEnd(sessionManager, undefined)
  testIntervalDistanceTarget(sessionManager, undefined)
  testIntervalDistanceProjectedEnd(sessionManager, 1993.9055444257651)
  testIntervalWorkSinceStart(sessionManager, 66743.55736267459)
  testIntervalCaloriesSinceStart(sessionManager, 111.89873100033381)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 202)
  testIntervalMinimumPace(sessionManager, 179.5376166116343)
  testIntervalAveragePace(sessionManager, 145.443174281537)
  testIntervalMaximumPace(sessionManager, 142.0274009673654)
  testIntervalMinimumLinearVelocity(sessionManager, 2.7849317008678574)
  testIntervalAverageLinearVelocity(sessionManager, 3.4377687538099306)
  testIntervalMaximumLinearVelocity(sessionManager, 3.5204474389761478)
  testIntervalMinimumPower(sessionManager, 60.47859281426262)
  testIntervalAveragePower(sessionManager, 113.86152135697425)
  testIntervalMaximumPower(sessionManager, 122.16651759501134)
  testIntervalMinimumStrokedistance(sessionManager, 7.107647385095529)
  testIntervalAverageStrokedistance(sessionManager, 9.858745898234758)
  testIntervalMaximumStrokedistance(sessionManager, 10.524188926326556)
  testIntervalMinimumStrokerate(sessionManager, 19.73589341291662)
  testIntervalAverageStrokerate(sessionManager, 20.93582388255797)
  testIntervalMaximumStrokerate(sessionManager, 23.509312294032103)
  testIntervalMinimumDragfactor(sessionManager, 80.59518571754946)
  testIntervalAverageDragfactor(sessionManager, 81.61708137780113)
  testIntervalMaximumDragfactor(sessionManager, 86.87374547552109)

  // Test split metrics
  testSplitNumber(sessionManager, 0)
  testSplitType(sessionManager, 'time')
  testSplitTime(sessionManager, 580.0012592877247)
  testSplitMovingTimeTarget(sessionManager, 580)
  testSplitMovingTimeToEnd(sessionManager, -0.0012592877246788703)
  testSplitMovingTimeProjectedEnd(sessionManager, 580)
  testSplitTimeSpentTotal(sessionManager, 580.0012592877247)
  testSplitTimeSpentMoving(sessionManager, 580.0012592877247)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 1993.9102063497517)
  testSplitDistanceToEnd(sessionManager, undefined)
  testSplitDistanceTarget(sessionManager, undefined)
  testSplitDistanceProjectedEnd(sessionManager, 1993.9055444257651)
  testSplitWorkSinceStart(sessionManager, 66743.55736267459)
  testSplitCaloriesSinceStart(sessionManager, 111.89873100033381)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)
  testSplitNumberOfStrokes(sessionManager, 202)
  testSplitMinimumPace(sessionManager, 179.5376166116343)
  testSplitAveragePace(sessionManager, 145.443174281537)
  testSplitMaximumPace(sessionManager, 142.0274009673654)
  testSplitMinimumLinearVelocity(sessionManager, 2.7849317008678574)
  testSplitAverageLinearVelocity(sessionManager, 3.4377687538099306)
  testSplitMaximumLinearVelocity(sessionManager, 3.5204474389761478)
  testSplitMinimumPower(sessionManager, 60.47859281426262)
  testSplitAveragePower(sessionManager, 113.86152135697425)
  testSplitMaximumPower(sessionManager, 122.16651759501134)
  testSplitMinimumStrokedistance(sessionManager, 7.107647385095529)
  testSplitAverageStrokedistance(sessionManager, 9.858745898234758)
  testSplitMaximumStrokedistance(sessionManager, 10.524188926326556)
  testSplitMinimumStrokerate(sessionManager, 19.73589341291662)
  testSplitAverageStrokerate(sessionManager, 20.93582388255797)
  testSplitMaximumStrokerate(sessionManager, 23.509312294032103)
  testSplitMinimumDragfactor(sessionManager, 80.59518571754946)
  testSplitAverageDragfactor(sessionManager, 81.61708137780113)
  testSplitMaximumDragfactor(sessionManager, 86.87374547552109)
})

/**
 * @description Test behaviour for the C2 RowErg in a single interval session with a Calorie target
 */
test('C2_RowErg_04: A 100 calories session for a Concept2 RowErg should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Concept2_RowErg)
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
  const sessionManager = createSessionManager(testConfig)

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'calories',
    targetCalories: 100
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testSessionType(sessionManager, 'calories')
  testSessionCaloriesTarget(sessionManager, 100)
  testIntervalType(sessionManager, 'calories')
  testIntervalCaloriesTarget(sessionManager, 100)
  testSplitType(sessionManager, 'calories')
  testSplitCaloriesTarget(sessionManager, 100)

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/Concept2_RowErg_Session_2000meters.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, false)
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 519.003226746047)
  testTotalLinearDistance(sessionManager, 1781.9764966241942)
  testTotalWork(sessionManager, 59587.80767782036)
  testTotalCalories(sessionManager, 100.00056192199949)
  testTotalCaloriesPerMinute(sessionManager, 11.517655566822938)
  testTotalCaloriesPerHour (sessionManager, 691.0593340093769)
  testTotalNumberOfStrokes(sessionManager, 181)
  testStrokeState(sessionManager, 'Stopped')
  testStrokeWork(sessionManager, undefined)
  testStrokeCalories(sessionManager, undefined)
  testCycleDistance(sessionManager, undefined)
  testCycleStrokeRate(sessionManager, undefined)
  testCycleDuration(sessionManager, undefined)
  testCycleLinearVelocity(sessionManager, undefined)
  testCyclePace(sessionManager, Infinity)
  testCyclePower(sessionManager, undefined)
  testDriveLastStartTime (sessionManager, 517.925185924641)
  testDriveDuration(sessionManager, undefined)
  testDriveLength(sessionManager, undefined)
  testDriveDistance(sessionManager, undefined)
  testDriveAverageHandleForce(sessionManager, undefined)
  testDrivePeakHandleForce(sessionManager, undefined)
  testRecoveryDuration(sessionManager, undefined)
  testDragFactor(sessionManager, 80.74590910920787)

  // Test session metrics
  testSessionType(sessionManager, 'calories')
  testSessionState(sessionManager, 'Stopped')
  testSessionTime(sessionManager, 519.003226746047)
  testSessionMovingTimeTarget(sessionManager, undefined)
  testSessionMovingTimeToEnd(sessionManager, undefined)
  testSessionMovingTimeProjectedEnd(sessionManager, 518.9964836821997)
  testSessionTimeSpentTotal(sessionManager, 519.003226746047)
  testSessionTimeSpentMoving(sessionManager, 519.003226746047)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 1781.9764966241942)
  testSessionDistanceToEnd(sessionManager, undefined)
  testSessionDistanceTarget(sessionManager, undefined)
  testSessionDistanceProjectedEnd(sessionManager, 1781.95105941339)
  testSessionWorkSinceStart(sessionManager, 59587.80767782036)
  testSessionCaloriesSinceStart(sessionManager, 100.00056192199949)
  testSessionCaloriesTarget(sessionManager, 100)
  testSessionCaloriesToEnd(sessionManager, -0.0005619219994912328)
  testSessionNumberOfStrokes(sessionManager, 181)
  testSessionMinimumPace(sessionManager, 179.5376166116343)
  testSessionAveragePace(sessionManager, 145.62572169982468)
  testSessionMaximumPace(sessionManager, 143.12937987059576)
  testSessionMinimumLinearVelocity(sessionManager, 2.7849317008678574)
  testSessionAverageLinearVelocity(sessionManager, 3.433459379041841)
  testSessionMaximumLinearVelocity(sessionManager, 3.493342879372868)
  testSessionMinimumPower(sessionManager, 60.47859281426262)
  testSessionAveragePower(sessionManager, 113.45327375288849)
  testSessionMaximumPower(sessionManager, 119.3665674687934)
  testSessionMinimumStrokedistance(sessionManager, 7.107647385095529)
  testSessionAverageStrokedistance(sessionManager, 9.837751690285906)
  testSessionMaximumStrokedistance(sessionManager, 10.524188926326556)
  testSessionMinimumStrokerate(sessionManager, 19.73589341291662)
  testSessionAverageStrokerate(sessionManager, 20.955753706412516)
  testSessionMaximumStrokerate(sessionManager, 23.509312294032103)
  testSessionMinimumDragfactor(sessionManager, 80.59518571754946)
  testSessionAverageDragfactor(sessionManager, 81.71102193904294)
  testSessionMaximumDragfactor(sessionManager, 86.87374547552109)
  testSessionNumberOfIntervals(sessionManager, 1)

  // Test interval metrics
  testIntervalNumber(sessionManager, 0)
  testIntervalWorkoutStepNumber(sessionManager, 0)
  testIntervalType(sessionManager, 'calories')
  testIntervalTime(sessionManager, 519.003226746047)
  testIntervalMovingTimeTarget(sessionManager, undefined)
  testIntervalMovingTimeToEnd(sessionManager, undefined)
  testIntervalMovingTimeProjectedEnd(sessionManager, 518.9964836821997)
  testIntervalTimeSpentTotal(sessionManager, 519.003226746047)
  testIntervalTimeSpentMoving(sessionManager, 519.003226746047)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 1781.9764966241942)
  testIntervalDistanceToEnd(sessionManager, undefined)
  testIntervalDistanceTarget(sessionManager, undefined)
  testIntervalDistanceProjectedEnd(sessionManager, 1781.95105941339)
  testIntervalWorkSinceStart(sessionManager, 59587.80767782036)
  testIntervalCaloriesSinceStart(sessionManager, 100.00056192199949)
  testIntervalCaloriesTarget(sessionManager, 100)
  testIntervalCaloriesToEnd(sessionManager, -0.0005619219994912328)
  testIntervalNumberOfStrokes(sessionManager, 181)
  testIntervalMinimumPace(sessionManager, 179.5376166116343)
  testIntervalAveragePace(sessionManager, 145.62572169982468)
  testIntervalMaximumPace(sessionManager, 143.12937987059576)
  testIntervalMinimumLinearVelocity(sessionManager, 2.7849317008678574)
  testIntervalAverageLinearVelocity(sessionManager, 3.433459379041841)
  testIntervalMaximumLinearVelocity(sessionManager, 3.493342879372868)
  testIntervalMinimumPower(sessionManager, 60.47859281426262)
  testIntervalAveragePower(sessionManager, 113.45327375288849)
  testIntervalMaximumPower(sessionManager, 119.3665674687934)
  testIntervalMinimumStrokedistance(sessionManager, 7.107647385095529)
  testIntervalAverageStrokedistance(sessionManager, 9.837751690285906)
  testIntervalMaximumStrokedistance(sessionManager, 10.524188926326556)
  testIntervalMinimumStrokerate(sessionManager, 19.73589341291662)
  testIntervalAverageStrokerate(sessionManager, 20.955753706412516)
  testIntervalMaximumStrokerate(sessionManager, 23.509312294032103)
  testIntervalMinimumDragfactor(sessionManager, 80.59518571754946)
  testIntervalAverageDragfactor(sessionManager, 81.71102193904294)
  testIntervalMaximumDragfactor(sessionManager, 86.87374547552109)

  // Test split metrics
  testSplitNumber(sessionManager, 0)
  testSplitType(sessionManager, 'calories')
  testSplitTime(sessionManager, 519.003226746047)
  testSplitMovingTimeTarget(sessionManager, undefined)
  testSplitMovingTimeToEnd(sessionManager, undefined)
  testSplitMovingTimeProjectedEnd(sessionManager, 518.9964836821997)
  testSplitTimeSpentTotal(sessionManager, 519.003226746047)
  testSplitTimeSpentMoving(sessionManager, 519.003226746047)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 1781.9764966241942)
  testSplitDistanceToEnd(sessionManager, undefined)
  testSplitDistanceTarget(sessionManager, undefined)
  testSplitDistanceProjectedEnd(sessionManager, 1781.95105941339)
  testSplitWorkSinceStart(sessionManager, 59587.80767782036)
  testSplitCaloriesSinceStart(sessionManager, 100.00056192199949)
  testSplitCaloriesTarget(sessionManager, 100)
  testSplitCaloriesToEnd(sessionManager, -0.0005619219994912328)
  testSplitNumberOfStrokes(sessionManager, 181)
  testSplitMinimumPace(sessionManager, 179.5376166116343)
  testSplitAveragePace(sessionManager, 145.62572169982468)
  testSplitMaximumPace(sessionManager, 143.12937987059576)
  testSplitMinimumLinearVelocity(sessionManager, 2.7849317008678574)
  testSplitAverageLinearVelocity(sessionManager, 3.433459379041841)
  testSplitMaximumLinearVelocity(sessionManager, 3.493342879372868)
  testSplitMinimumPower(sessionManager, 60.47859281426262)
  testSplitAveragePower(sessionManager, 113.45327375288849)
  testSplitMaximumPower(sessionManager, 119.3665674687934)
  testSplitMinimumStrokedistance(sessionManager, 7.107647385095529)
  testSplitAverageStrokedistance(sessionManager, 9.837751690285906)
  testSplitMaximumStrokedistance(sessionManager, 10.524188926326556)
  testSplitMinimumStrokerate(sessionManager, 19.73589341291662)
  testSplitAverageStrokerate(sessionManager, 20.955753706412516)
  testSplitMaximumStrokerate(sessionManager, 23.509312294032103)
  testSplitMinimumDragfactor(sessionManager, 80.59518571754946)
  testSplitAverageDragfactor(sessionManager, 81.71102193904294)
  testSplitMaximumDragfactor(sessionManager, 86.87374547552109)
})

/**
 * From this point on, the regular profiles will be tested
 */

/**
 * @description Test behaviour for the C2 Model C in a 'Just Row' session
 * As a side test, this tests the SessionManager's watchdog functionality by suddenly stopping sending data
 */
test('C2_ModelC_01: A full session for a Concept2 Model C should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Concept2_Model_C)
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
  const sessionManager = createSessionManager(testConfig)

  testSessionType(sessionManager, 'justrow')
  testIntervalType(sessionManager, 'justrow')
  testSplitType(sessionManager, 'justrow')

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/Concept2_Model_C.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, true) // As data has stopped abrubtly and the last drive is 4 sec ago, SessionManager's watchdog hasn't been triggered yet
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 181.4588596531004)
  testTotalLinearDistance(sessionManager, 552.4833037536148)
  testTotalWork(sessionManager, 20593.15388304616)
  testTotalCalories(sessionManager, 34.73409914542138)
  testTotalCaloriesPerMinute(sessionManager, 12.371981079533317)
  testTotalCaloriesPerHour (sessionManager, 742.318864771999)
  testTotalNumberOfStrokes(sessionManager, 80)
  testStrokeState(sessionManager, 'Drive')
  testStrokeWork(sessionManager, 25.512113604279875)
  testStrokeCalories(sessionManager, 0.21500383832546952)
  testCycleDistance(sessionManager, 2.9525168987431822)
  testCycleStrokeRate(sessionManager, 24.336340661672818)
  testCycleDuration(sessionManager, 2.465448722719998)
  testCycleLinearVelocity(sessionManager, 1.2061131266447134)
  testCyclePace(sessionManager, 414.55481161286275)
  testCyclePower(sessionManager, 4.971183651233226)
  testDriveLastStartTime (sessionManager, 177.31209030312513)
  testDriveDuration(sessionManager, 0.7592322967347798)
  testDriveLength(sessionManager, 0.38117990863556767)
  testDriveDistance(sessionManager, 0.9595679920915494)
  testDriveAverageHandleForce(sessionManager, 102.2713643967354)
  testDrivePeakHandleForce(sessionManager, 212.5533895691384)
  testRecoveryDuration(sessionManager, 1.983892772108078)
  testDragFactor(sessionManager, 122.56864708679767)

  // Test session metrics
  testSessionType(sessionManager, 'justrow')
  testSessionState(sessionManager, 'Rowing')
  testSessionTime(sessionManager, 181.4588596531004)
  testSessionMovingTimeTarget(sessionManager, undefined)
  testSessionMovingTimeToEnd(sessionManager, undefined)
  testSessionMovingTimeProjectedEnd(sessionManager, undefined)
  testSessionTimeSpentTotal(sessionManager, 181.4588596531004)
  testSessionTimeSpentMoving(sessionManager, 181.4588596531004)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 552.4833037536148)
  testSessionDistanceToEnd(sessionManager, undefined)
  testSessionDistanceTarget(sessionManager, undefined)
  testSessionDistanceProjectedEnd(sessionManager, undefined)
  testSessionWorkSinceStart(sessionManager, 20593.15388304616)
  testSessionCaloriesSinceStart(sessionManager, 34.73409914542138)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 80)
  testSessionMinimumPace(sessionManager, 414.55481161286275)
  testSessionAveragePace(sessionManager, 164.22112525415224)
  testSessionMaximumPace(sessionManager, 140.53128594463587)
  testSessionMinimumLinearVelocity(sessionManager, 1.2061131266447134)
  testSessionAverageLinearVelocity(sessionManager, 3.0446752768633694)
  testSessionMaximumLinearVelocity(sessionManager, 3.5579265971918987)
  testSessionMinimumPower(sessionManager, 4.971183651233226)
  testSessionAveragePower(sessionManager, 87.66783476317362)
  testSessionMaximumPower(sessionManager, 126.35684327004489)
  testSessionMinimumStrokedistance(sessionManager, 2.5834522864002882)
  testSessionAverageStrokedistance(sessionManager, 6.94152974027156)
  testSessionMaximumStrokedistance(sessionManager, 13.069984906848259)
  testSessionMinimumStrokerate(sessionManager, 15.784784897254365)
  testSessionAverageStrokerate(sessionManager, 29.594256299241724)
  testSessionMaximumStrokerate(sessionManager, 44.75500508102043)
  testSessionMinimumDragfactor(sessionManager, 122.17215796334402)
  testSessionAverageDragfactor(sessionManager, 123.62620664131599)
  testSessionMaximumDragfactor(sessionManager, 124.90962932377184)
  testSessionNumberOfIntervals(sessionManager, 1)

  // Test interval metrics
  testIntervalNumber(sessionManager, 0)
  testIntervalWorkoutStepNumber(sessionManager, 0)
  testIntervalType(sessionManager, 'justrow')
  testIntervalTime(sessionManager, 181.4588596531004)
  testIntervalMovingTimeTarget(sessionManager, undefined)
  testIntervalMovingTimeToEnd(sessionManager, undefined)
  testIntervalMovingTimeProjectedEnd(sessionManager, undefined)
  testIntervalTimeSpentTotal(sessionManager, 181.4588596531004)
  testIntervalTimeSpentMoving(sessionManager, 181.4588596531004)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 552.4833037536148)
  testIntervalDistanceToEnd(sessionManager, undefined)
  testIntervalDistanceTarget(sessionManager, undefined)
  testIntervalDistanceProjectedEnd(sessionManager, undefined)
  testIntervalWorkSinceStart(sessionManager, 20593.15388304616)
  testIntervalCaloriesSinceStart(sessionManager, 34.73409914542138)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 80)
  testIntervalMinimumPace(sessionManager, 414.55481161286275)
  testIntervalAveragePace(sessionManager, 164.22112525415224)
  testIntervalMaximumPace(sessionManager, 140.53128594463587)
  testIntervalMinimumLinearVelocity(sessionManager, 1.2061131266447134)
  testIntervalAverageLinearVelocity(sessionManager, 3.0446752768633694)
  testIntervalMaximumLinearVelocity(sessionManager, 3.5579265971918987)
  testIntervalMinimumPower(sessionManager, 4.971183651233226)
  testIntervalAveragePower(sessionManager, 87.66783476317362)
  testIntervalMaximumPower(sessionManager, 126.35684327004489)
  testIntervalMinimumStrokedistance(sessionManager, 2.5834522864002882)
  testIntervalAverageStrokedistance(sessionManager, 6.94152974027156)
  testIntervalMaximumStrokedistance(sessionManager, 13.069984906848259)
  testIntervalMinimumStrokerate(sessionManager, 15.784784897254365)
  testIntervalAverageStrokerate(sessionManager, 29.594256299241724)
  testIntervalMaximumStrokerate(sessionManager, 44.75500508102043)
  testIntervalMinimumDragfactor(sessionManager, 122.17215796334402)
  testIntervalAverageDragfactor(sessionManager, 123.62620664131599)
  testIntervalMaximumDragfactor(sessionManager, 124.90962932377184)

  // Test split metrics
  testSplitNumber(sessionManager, 0)
  testSplitType(sessionManager, 'justrow')
  testSplitTime(sessionManager, 181.4588596531004)
  testSplitMovingTimeTarget(sessionManager, undefined)
  testSplitMovingTimeToEnd(sessionManager, undefined)
  testSplitMovingTimeProjectedEnd(sessionManager, undefined)
  testSplitTimeSpentTotal(sessionManager, 181.4588596531004)
  testSplitTimeSpentMoving(sessionManager, 181.4588596531004)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 552.4833037536148)
  testSplitDistanceToEnd(sessionManager, undefined)
  testSplitDistanceTarget(sessionManager, undefined)
  testSplitDistanceProjectedEnd(sessionManager, undefined)
  testSplitWorkSinceStart(sessionManager, 20593.15388304616)
  testSplitCaloriesSinceStart(sessionManager, 34.73409914542138)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)
  testSplitNumberOfStrokes(sessionManager, 80)
  testSplitMinimumPace(sessionManager, 414.55481161286275)
  testSplitAveragePace(sessionManager, 164.22112525415224)
  testSplitMaximumPace(sessionManager, 140.53128594463587)
  testSplitMinimumLinearVelocity(sessionManager, 1.2061131266447134)
  testSplitAverageLinearVelocity(sessionManager, 3.0446752768633694)
  testSplitMaximumLinearVelocity(sessionManager, 3.5579265971918987)
  testSplitMinimumPower(sessionManager, 4.971183651233226)
  testSplitAveragePower(sessionManager, 87.66783476317362)
  testSplitMaximumPower(sessionManager, 126.35684327004489)
  testSplitMinimumStrokedistance(sessionManager, 2.5834522864002882)
  testSplitAverageStrokedistance(sessionManager, 6.94152974027156)
  testSplitMaximumStrokedistance(sessionManager, 13.069984906848259)
  testSplitMinimumStrokerate(sessionManager, 15.784784897254365)
  testSplitAverageStrokerate(sessionManager, 29.594256299241724)
  testSplitMaximumStrokerate(sessionManager, 44.75500508102043)
  testSplitMinimumDragfactor(sessionManager, 122.17215796334402)
  testSplitAverageDragfactor(sessionManager, 123.62620664131599)
  testSplitMaximumDragfactor(sessionManager, 124.90962932377184)
})

/**
 * @description Test behaviour for the C2 Model C in a single interval session with a Distance target
 */
test('C2_ModelC_02: A 500 meter session for a Concept2 Model C should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Concept2_Model_C)
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
  const sessionManager = createSessionManager(testConfig)

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'distance',
    targetDistance: 500,
    targetTime: 0
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testSessionType(sessionManager, 'distance')
  testSessionDistanceTarget(sessionManager, 500)
  testIntervalType(sessionManager, 'distance')
  testIntervalDistanceTarget(sessionManager, 500)
  testSplitType(sessionManager, 'distance')
  testSplitDistanceTarget(sessionManager, 500)

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/Concept2_Model_C.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, false)
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 156.7473648976275)
  testTotalLinearDistance(sessionManager, 500.03104229779495)
  testTotalWork(sessionManager, 19457.128401218226)
  testTotalCalories(sessionManager, 31.592878885486314)
  testTotalCaloriesPerMinute(sessionManager, 12.381421536256369)
  testTotalCaloriesPerHour (sessionManager, 742.8852921753821)
  testTotalNumberOfStrokes(sessionManager, 71)
  testStrokeState(sessionManager, 'Stopped')
  testStrokeWork(sessionManager, undefined)
  testStrokeCalories(sessionManager, undefined)
  testCycleDistance(sessionManager, undefined)
  testCycleStrokeRate(sessionManager, undefined)
  testCycleDuration(sessionManager, undefined)
  testCycleLinearVelocity(sessionManager, undefined)
  testCyclePace(sessionManager, Infinity)
  testCyclePower(sessionManager, undefined)
  testDriveLastStartTime (sessionManager, 155.29769226061947)
  testDriveDuration(sessionManager, undefined)
  testDriveLength(sessionManager, undefined)
  testDriveDistance(sessionManager, undefined)
  testDriveAverageHandleForce(sessionManager, undefined)
  testDrivePeakHandleForce(sessionManager, undefined)
  testRecoveryDuration(sessionManager, undefined)
  testDragFactor(sessionManager, 123.25256925094398)

  // Test session metrics
  testSessionType(sessionManager, 'distance')
  testSessionState(sessionManager, 'Stopped')
  testSessionTime(sessionManager, 156.7473648976275)
  testSessionMovingTimeTarget(sessionManager, undefined)
  testSessionMovingTimeToEnd(sessionManager, undefined)
  testSessionMovingTimeProjectedEnd(sessionManager, 156.73945983078266)
  testSessionTimeSpentTotal(sessionManager, 156.7473648976275)
  testSessionTimeSpentMoving(sessionManager, 156.7473648976275)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 500.03104229779495)
  testSessionDistanceToEnd(sessionManager, -0.031042297794954266) // This is a testing artifact
  testSessionDistanceTarget(sessionManager, 500)
  testSessionDistanceProjectedEnd(sessionManager, 500)
  testSessionWorkSinceStart(sessionManager, 19457.128401218226)
  testSessionCaloriesSinceStart(sessionManager, 31.592878885486314)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 71)
  testSessionMinimumPace(sessionManager, 183.61153074397942)
  testSessionAveragePace(sessionManager, 156.7376339050128)
  testSessionMaximumPace(sessionManager, 140.53128594463587)
  testSessionMinimumLinearVelocity(sessionManager, 2.7231405237679764)
  testSessionAverageLinearVelocity(sessionManager, 3.1900443278543644)
  testSessionMaximumLinearVelocity(sessionManager, 3.5579265971918987)
  testSessionMinimumPower(sessionManager, 56.541612582807076)
  testSessionAveragePower(sessionManager, 90.83151920453602)
  testSessionMaximumPower(sessionManager, 126.35684327004489)
  testSessionMinimumStrokedistance(sessionManager, 3.8823727820117346)
  testSessionAverageStrokedistance(sessionManager, 6.977796243571697)
  testSessionMaximumStrokedistance(sessionManager, 12.30927126596217)
  testSessionMinimumStrokerate(sessionManager, 15.784784897254365)
  testSessionAverageStrokerate(sessionManager, 29.97910826490652)
  testSessionMaximumStrokerate(sessionManager, 44.75500508102043)
  testSessionMinimumDragfactor(sessionManager, 122.17215796334402)
  testSessionAverageDragfactor(sessionManager, 123.68393578065213)
  testSessionMaximumDragfactor(sessionManager, 124.90962932377184)
  testSessionNumberOfIntervals(sessionManager, 1)

  // Test interval metrics
  testIntervalNumber(sessionManager, 0)
  testIntervalWorkoutStepNumber(sessionManager, 0)
  testIntervalType(sessionManager, 'distance')
  testIntervalTime(sessionManager, 156.7473648976275)
  testIntervalMovingTimeTarget(sessionManager, undefined)
  testIntervalMovingTimeToEnd(sessionManager, undefined)
  testIntervalMovingTimeProjectedEnd(sessionManager, 156.73945983078266)
  testIntervalTimeSpentTotal(sessionManager, 156.7473648976275)
  testIntervalTimeSpentMoving(sessionManager, 156.7473648976275)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 500.03104229779495)
  testIntervalDistanceToEnd(sessionManager, -0.031042297794954266) // This is a testing artifact
  testIntervalDistanceTarget(sessionManager, 500)
  testIntervalDistanceProjectedEnd(sessionManager, 500)
  testIntervalWorkSinceStart(sessionManager, 19457.128401218226)
  testIntervalCaloriesSinceStart(sessionManager, 31.592878885486314)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 71)
  testIntervalMinimumPace(sessionManager, 183.61153074397942)
  testIntervalAveragePace(sessionManager, 156.7376339050128)
  testIntervalMaximumPace(sessionManager, 140.53128594463587)
  testIntervalMinimumLinearVelocity(sessionManager, 2.7231405237679764)
  testIntervalAverageLinearVelocity(sessionManager, 3.1900443278543644)
  testIntervalMaximumLinearVelocity(sessionManager, 3.5579265971918987)
  testIntervalMinimumPower(sessionManager, 56.541612582807076)
  testIntervalAveragePower(sessionManager, 90.83151920453602)
  testIntervalMaximumPower(sessionManager, 126.35684327004489)
  testIntervalMinimumStrokedistance(sessionManager, 3.8823727820117346)
  testIntervalAverageStrokedistance(sessionManager, 6.977796243571697)
  testIntervalMaximumStrokedistance(sessionManager, 12.30927126596217)
  testIntervalMinimumStrokerate(sessionManager, 15.784784897254365)
  testIntervalAverageStrokerate(sessionManager, 29.97910826490652)
  testIntervalMaximumStrokerate(sessionManager, 44.75500508102043)
  testIntervalMinimumDragfactor(sessionManager, 122.17215796334402)
  testIntervalAverageDragfactor(sessionManager, 123.68393578065213)
  testIntervalMaximumDragfactor(sessionManager, 124.90962932377184)

  // Test split metrics
  testSplitNumber(sessionManager, 0)
  testSplitType(sessionManager, 'distance')
  testSplitTime(sessionManager, 156.7473648976275)
  testSplitMovingTimeTarget(sessionManager, undefined)
  testSplitMovingTimeToEnd(sessionManager, undefined)
  testSplitMovingTimeProjectedEnd(sessionManager, 156.73945983078266)
  testSplitTimeSpentTotal(sessionManager, 156.7473648976275)
  testSplitTimeSpentMoving(sessionManager, 156.7473648976275)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 500.03104229779495)
  testSplitDistanceToEnd(sessionManager, -0.031042297794954266) // This is a testing artifact
  testSplitDistanceTarget(sessionManager, 500)
  testSplitDistanceProjectedEnd(sessionManager, 500)
  testSplitWorkSinceStart(sessionManager, 19457.128401218226)
  testSplitCaloriesSinceStart(sessionManager, 31.592878885486314)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)
  testSplitNumberOfStrokes(sessionManager, 71)
  testSplitMinimumPace(sessionManager, 183.61153074397942)
  testSplitAveragePace(sessionManager, 156.7376339050128)
  testSplitMaximumPace(sessionManager, 140.53128594463587)
  testSplitMinimumLinearVelocity(sessionManager, 2.7231405237679764)
  testSplitAverageLinearVelocity(sessionManager, 3.1900443278543644)
  testSplitMaximumLinearVelocity(sessionManager, 3.5579265971918987)
  testSplitMinimumPower(sessionManager, 56.541612582807076)
  testSplitAveragePower(sessionManager, 90.83151920453602)
  testSplitMaximumPower(sessionManager, 126.35684327004489)
  testSplitMinimumStrokedistance(sessionManager, 3.8823727820117346)
  testSplitAverageStrokedistance(sessionManager, 6.977796243571697)
  testSplitMaximumStrokedistance(sessionManager, 12.30927126596217)
  testSplitMinimumStrokerate(sessionManager, 15.784784897254365)
  testSplitAverageStrokerate(sessionManager, 29.97910826490652)
  testSplitMaximumStrokerate(sessionManager, 44.75500508102043)
  testSplitMinimumDragfactor(sessionManager, 122.17215796334402)
  testSplitAverageDragfactor(sessionManager, 123.68393578065213)
  testSplitMaximumDragfactor(sessionManager, 124.90962932377184)
})

/**
 * @description Test behaviour for the C2 Model C in a single interval session with a Time target
 */
test('C2_ModelC_03: A 3 minute session for a Concept2 Model C should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Concept2_Model_C)
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
  const sessionManager = createSessionManager(testConfig)

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'time',
    targetDistance: 0,
    targetTime: 180
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testSessionType(sessionManager, 'time')
  testSessionMovingTimeTarget(sessionManager, 180)
  testIntervalType(sessionManager, 'time')
  testIntervalMovingTimeTarget(sessionManager, 180)
  testSplitType(sessionManager, 'time')
  testSplitMovingTimeTarget(sessionManager, 180)

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/Concept2_Model_C.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, false)
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 180.95283402881833)
  testTotalLinearDistance(sessionManager, 552.261864986209)
  testTotalWork(sessionManager, 20581.907031896142)
  testTotalCalories(sessionManager, 34.681219056588326)
  testTotalCaloriesPerMinute(sessionManager, 12.371981079533313)
  testTotalCaloriesPerHour (sessionManager, 742.318864771999)
  testTotalNumberOfStrokes(sessionManager, 80)
  testStrokeState(sessionManager, 'Stopped')
  testStrokeWork(sessionManager, undefined)
  testStrokeCalories(sessionManager, undefined)
  testCycleDistance(sessionManager, undefined)
  testCycleStrokeRate(sessionManager, undefined)
  testCycleDuration(sessionManager, undefined)
  testCycleLinearVelocity(sessionManager, undefined)
  testCyclePace(sessionManager, Infinity)
  testCyclePower(sessionManager, undefined)
  testDriveLastStartTime (sessionManager, 177.31209030312513)
  testDriveDuration(sessionManager, undefined)
  testDriveLength(sessionManager, undefined)
  testDriveDistance(sessionManager, undefined)
  testDriveAverageHandleForce(sessionManager, undefined)
  testDrivePeakHandleForce(sessionManager, undefined)
  testRecoveryDuration(sessionManager, undefined)
  testDragFactor(sessionManager, 122.56864708679767)

  // Test session metrics
  testSessionType(sessionManager, 'time')
  testSessionState(sessionManager, 'Stopped')
  testSessionTime(sessionManager, 180.95283402881833)
  testSessionMovingTimeTarget(sessionManager, 180)
  testSessionMovingTimeToEnd(sessionManager, -0.9528340288183301) // This is a testing artifact
  testSessionMovingTimeProjectedEnd(sessionManager, 180)
  testSessionTimeSpentTotal(sessionManager, 180.95283402881833)
  testSessionTimeSpentMoving(sessionManager, 180.95283402881833)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 552.261864986209)
  testSessionDistanceToEnd(sessionManager, undefined)
  testSessionDistanceTarget(sessionManager, undefined)
  testSessionDistanceProjectedEnd(sessionManager, 551.9720967289775)
  testSessionWorkSinceStart(sessionManager, 20581.907031896142)
  testSessionCaloriesSinceStart(sessionManager, 34.681219056588326)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 80)
  testSessionMinimumPace(sessionManager, 414.55481161286275)
  testSessionAveragePace(sessionManager, 163.82883329572016)
  testSessionMaximumPace(sessionManager, 140.53128594463587)
  testSessionMinimumLinearVelocity(sessionManager, 1.2061131266447134)
  testSessionAverageLinearVelocity(sessionManager, 3.051965822752776)
  testSessionMaximumLinearVelocity(sessionManager, 3.5579265971918987)
  testSessionMinimumPower(sessionManager, 4.971183651233226)
  testSessionAveragePower(sessionManager, 87.14773003919915)
  testSessionMaximumPower(sessionManager, 126.35684327004489)
  testSessionMinimumStrokedistance(sessionManager, 2.5834522864002882)
  testSessionAverageStrokedistance(sessionManager, 6.9164416091927645)
  testSessionMaximumStrokedistance(sessionManager, 13.069984906848259)
  testSessionMinimumStrokerate(sessionManager, 15.784784897254365)
  testSessionAverageStrokerate(sessionManager, 29.561187647433115)
  testSessionMaximumStrokerate(sessionManager, 44.75500508102043)
  testSessionMinimumDragfactor(sessionManager, 122.17215796334402)
  testSessionAverageDragfactor(sessionManager, 123.61959689410025)
  testSessionMaximumDragfactor(sessionManager, 124.90962932377184)
  testSessionNumberOfIntervals(sessionManager, 1)

  // Test interval metrics
  testIntervalNumber(sessionManager, 0)
  testIntervalWorkoutStepNumber(sessionManager, 0)
  testIntervalType(sessionManager, 'time')
  testIntervalTime(sessionManager, 180.95283402881833)
  testIntervalMovingTimeTarget(sessionManager, 180)
  testIntervalMovingTimeToEnd(sessionManager, -0.9528340288183301) // This is a testing artifact
  testIntervalMovingTimeProjectedEnd(sessionManager, 180)
  testIntervalTimeSpentTotal(sessionManager, 180.95283402881833)
  testIntervalTimeSpentMoving(sessionManager, 180.95283402881833)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 552.261864986209)
  testIntervalDistanceToEnd(sessionManager, undefined)
  testIntervalDistanceTarget(sessionManager, undefined)
  testIntervalDistanceProjectedEnd(sessionManager, 551.9720967289775)
  testIntervalWorkSinceStart(sessionManager, 20581.907031896142)
  testIntervalCaloriesSinceStart(sessionManager, 34.681219056588326)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 80)
  testIntervalMinimumPace(sessionManager, 414.55481161286275)
  testIntervalAveragePace(sessionManager, 163.82883329572016)
  testIntervalMaximumPace(sessionManager, 140.53128594463587)
  testIntervalMinimumLinearVelocity(sessionManager, 1.2061131266447134)
  testIntervalAverageLinearVelocity(sessionManager, 3.051965822752776)
  testIntervalMaximumLinearVelocity(sessionManager, 3.5579265971918987)
  testIntervalMinimumPower(sessionManager, 4.971183651233226)
  testIntervalAveragePower(sessionManager, 87.14773003919915)
  testIntervalMaximumPower(sessionManager, 126.35684327004489)
  testIntervalMinimumStrokedistance(sessionManager, 2.5834522864002882)
  testIntervalAverageStrokedistance(sessionManager, 6.9164416091927645)
  testIntervalMaximumStrokedistance(sessionManager, 13.069984906848259)
  testIntervalMinimumStrokerate(sessionManager, 15.784784897254365)
  testIntervalAverageStrokerate(sessionManager, 29.561187647433115)
  testIntervalMaximumStrokerate(sessionManager, 44.75500508102043)
  testIntervalMinimumDragfactor(sessionManager, 122.17215796334402)
  testIntervalAverageDragfactor(sessionManager, 123.61959689410025)
  testIntervalMaximumDragfactor(sessionManager, 124.90962932377184)

  // Test split metrics
  testSplitNumber(sessionManager, 0)
  testSplitType(sessionManager, 'time')
  testSplitTime(sessionManager, 180.95283402881833)
  testSplitMovingTimeTarget(sessionManager, 180)
  testSplitMovingTimeToEnd(sessionManager, -0.9528340288183301) // This is a testing artifact
  testSplitMovingTimeProjectedEnd(sessionManager, 180)
  testSplitTimeSpentTotal(sessionManager, 180.95283402881833)
  testSplitTimeSpentMoving(sessionManager, 180.95283402881833)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 552.261864986209)
  testSplitDistanceToEnd(sessionManager, undefined)
  testSplitDistanceTarget(sessionManager, undefined)
  testSplitDistanceProjectedEnd(sessionManager, 551.9720967289775)
  testSplitWorkSinceStart(sessionManager, 20581.907031896142)
  testSplitCaloriesSinceStart(sessionManager, 34.681219056588326)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)
  testSplitNumberOfStrokes(sessionManager, 80)
  testSplitMinimumPace(sessionManager, 414.55481161286275)
  testSplitAveragePace(sessionManager, 163.82883329572016)
  testSplitMaximumPace(sessionManager, 140.53128594463587)
  testSplitMinimumLinearVelocity(sessionManager, 1.2061131266447134)
  testSplitAverageLinearVelocity(sessionManager, 3.051965822752776)
  testSplitMaximumLinearVelocity(sessionManager, 3.5579265971918987)
  testSplitMinimumPower(sessionManager, 4.971183651233226)
  testSplitAveragePower(sessionManager, 87.14773003919915)
  testSplitMaximumPower(sessionManager, 126.35684327004489)
  testSplitMinimumStrokedistance(sessionManager, 2.5834522864002882)
  testSplitAverageStrokedistance(sessionManager, 6.9164416091927645)
  testSplitMaximumStrokedistance(sessionManager, 13.069984906848259)
  testSplitMinimumStrokerate(sessionManager, 15.784784897254365)
  testSplitAverageStrokerate(sessionManager, 29.561187647433115)
  testSplitMaximumStrokerate(sessionManager, 44.75500508102043)
  testSplitMinimumDragfactor(sessionManager, 122.17215796334402)
  testSplitAverageDragfactor(sessionManager, 123.61959689410025)
  testSplitMaximumDragfactor(sessionManager, 124.90962932377184)
})

/**
 * @description Test behaviour for the C2 Model C in a single interval session with a Calorie target
 */
test('C2_ModelC_04: A 30 calorie session for a Concept2 Model C should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Concept2_Model_C)
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
  const sessionManager = createSessionManager(testConfig)

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'calories',
    targetCalories: 30
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testSessionType(sessionManager, 'calories')
  testSessionCaloriesTarget(sessionManager, 30)
  testIntervalType(sessionManager, 'calories')
  testIntervalCaloriesTarget(sessionManager, 30)
  testSplitType(sessionManager, 'calories')
  testSplitCaloriesTarget(sessionManager, 30)

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/Concept2_Model_C.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, false)
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 150.40548514616387)
  testTotalLinearDistance(sessionManager, 479.39900408481833)
  testTotalWork(sessionManager, 18345.892946257805)
  testTotalCalories(sessionManager, 30.006069425282995)
  testTotalCaloriesPerMinute(sessionManager, 12.32490350424709)
  testTotalCaloriesPerHour (sessionManager, 739.4942102548252)
  testTotalNumberOfStrokes(sessionManager, 68)
  testStrokeState(sessionManager, 'Stopped')
  testStrokeWork(sessionManager, undefined)
  testStrokeCalories(sessionManager, undefined)
  testCycleDistance(sessionManager, undefined)
  testCycleStrokeRate(sessionManager, undefined)
  testCycleDuration(sessionManager, undefined)
  testCycleLinearVelocity(sessionManager, undefined)
  testCyclePace(sessionManager, Infinity)
  testCyclePower(sessionManager, undefined)
  testDriveLastStartTime (sessionManager, 150.10276006263302)
  testDriveDuration(sessionManager, undefined)
  testDriveLength(sessionManager, undefined)
  testDriveDistance(sessionManager, undefined)
  testDriveAverageHandleForce(sessionManager, undefined)
  testDrivePeakHandleForce(sessionManager, undefined)
  testRecoveryDuration(sessionManager, undefined)
  testDragFactor(sessionManager, 123.25256925094398)

  // Test session metrics
  testSessionType(sessionManager, 'calories')
  testSessionState(sessionManager, 'Stopped')
  testSessionTime(sessionManager, 150.40548514616387)
  testSessionMovingTimeTarget(sessionManager, undefined)
  testSessionMovingTimeToEnd(sessionManager, undefined)
  testSessionMovingTimeProjectedEnd(sessionManager, 150.39875115395606)
  testSessionTimeSpentTotal(sessionManager, 150.40548514616387)
  testSessionTimeSpentMoving(sessionManager, 150.40548514616387)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 479.39900408481833)
  testSessionDistanceToEnd(sessionManager, undefined)
  testSessionDistanceTarget(sessionManager, undefined)
  testSessionDistanceProjectedEnd(sessionManager, 479.38090924189413)
  testSessionWorkSinceStart(sessionManager, 18345.892946257805)
  testSessionCaloriesSinceStart(sessionManager, 30.006069425282995)
  testSessionCaloriesTarget(sessionManager, 30)
  testSessionCaloriesToEnd(sessionManager, -0.0060694252829947) // This is a testing artifact
  testSessionNumberOfStrokes(sessionManager, 68)
  testSessionMinimumPace(sessionManager, 183.61153074397942)
  testSessionAveragePace(sessionManager, 156.86879182539266)
  testSessionMaximumPace(sessionManager, 140.53128594463587)
  testSessionMinimumLinearVelocity(sessionManager, 2.7231405237679764)
  testSessionAverageLinearVelocity(sessionManager, 3.1873771333468253)
  testSessionMaximumLinearVelocity(sessionManager, 3.5579265971918987)
  testSessionMinimumPower(sessionManager, 56.541612582807076)
  testSessionAveragePower(sessionManager, 91.38602718035276)
  testSessionMaximumPower(sessionManager, 126.35684327004489)
  testSessionMinimumStrokedistance(sessionManager, 4.147187873987795)
  testSessionAverageStrokedistance(sessionManager, 7.073114164003991)
  testSessionMaximumStrokedistance(sessionManager, 12.30927126596217)
  testSessionMinimumStrokerate(sessionManager, 15.784784897254365)
  testSessionAverageStrokerate(sessionManager, 29.66050862798517)
  testSessionMaximumStrokerate(sessionManager, 44.75500508102043)
  testSessionMinimumDragfactor(sessionManager, 122.17215796334402)
  testSessionAverageDragfactor(sessionManager, 123.7061384696812)
  testSessionMaximumDragfactor(sessionManager, 124.90962932377184)
  testSessionNumberOfIntervals(sessionManager, 1)

  // Test interval metrics
  testIntervalNumber(sessionManager, 0)
  testIntervalWorkoutStepNumber(sessionManager, 0)
  testIntervalType(sessionManager, 'calories')
  testIntervalTime(sessionManager, 150.40548514616387)
  testIntervalMovingTimeTarget(sessionManager, undefined)
  testIntervalMovingTimeToEnd(sessionManager, undefined)
  testIntervalMovingTimeProjectedEnd(sessionManager, 150.39875115395606)
  testIntervalTimeSpentTotal(sessionManager, 150.40548514616387)
  testIntervalTimeSpentMoving(sessionManager, 150.40548514616387)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 479.39900408481833)
  testIntervalDistanceToEnd(sessionManager, undefined)
  testIntervalDistanceTarget(sessionManager, undefined)
  testIntervalDistanceProjectedEnd(sessionManager, 479.38090924189413)
  testIntervalWorkSinceStart(sessionManager, 18345.892946257805)
  testIntervalCaloriesSinceStart(sessionManager, 30.006069425282995)
  testIntervalCaloriesTarget(sessionManager, 30)
  testIntervalCaloriesToEnd(sessionManager, -0.0060694252829947) // This is a testing artifact
  testIntervalNumberOfStrokes(sessionManager, 68)
  testIntervalMinimumPace(sessionManager, 183.61153074397942)
  testIntervalAveragePace(sessionManager, 156.86879182539266)
  testIntervalMaximumPace(sessionManager, 140.53128594463587)
  testIntervalMinimumLinearVelocity(sessionManager, 2.7231405237679764)
  testIntervalAverageLinearVelocity(sessionManager, 3.1873771333468253)
  testIntervalMaximumLinearVelocity(sessionManager, 3.5579265971918987)
  testIntervalMinimumPower(sessionManager, 56.541612582807076)
  testIntervalAveragePower(sessionManager, 91.38602718035276)
  testIntervalMaximumPower(sessionManager, 126.35684327004489)
  testIntervalMinimumStrokedistance(sessionManager, 4.147187873987795)
  testIntervalAverageStrokedistance(sessionManager, 7.073114164003991)
  testIntervalMaximumStrokedistance(sessionManager, 12.30927126596217)
  testIntervalMinimumStrokerate(sessionManager, 15.784784897254365)
  testIntervalAverageStrokerate(sessionManager, 29.66050862798517)
  testIntervalMaximumStrokerate(sessionManager, 44.75500508102043)
  testIntervalMinimumDragfactor(sessionManager, 122.17215796334402)
  testIntervalAverageDragfactor(sessionManager, 123.7061384696812)
  testIntervalMaximumDragfactor(sessionManager, 124.90962932377184)

  // Test split metrics
  testSplitNumber(sessionManager, 0)
  testSplitType(sessionManager, 'calories')
  testSplitTime(sessionManager, 150.40548514616387)
  testSplitMovingTimeTarget(sessionManager, undefined)
  testSplitMovingTimeToEnd(sessionManager, undefined)
  testSplitMovingTimeProjectedEnd(sessionManager, 150.39875115395606)
  testSplitTimeSpentTotal(sessionManager, 150.40548514616387)
  testSplitTimeSpentMoving(sessionManager, 150.40548514616387)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 479.39900408481833)
  testSplitDistanceToEnd(sessionManager, undefined)
  testSplitDistanceTarget(sessionManager, undefined)
  testSplitDistanceProjectedEnd(sessionManager, 479.38090924189413)
  testSplitWorkSinceStart(sessionManager, 18345.892946257805)
  testSplitCaloriesSinceStart(sessionManager, 30.006069425282995)
  testSplitCaloriesTarget(sessionManager, 30)
  testSplitCaloriesToEnd(sessionManager, -0.0060694252829947) // This is a testing artifact
  testSplitNumberOfStrokes(sessionManager, 68)
  testSplitMinimumPace(sessionManager, 183.61153074397942)
  testSplitAveragePace(sessionManager, 156.86879182539266)
  testSplitMaximumPace(sessionManager, 140.53128594463587)
  testSplitMinimumLinearVelocity(sessionManager, 2.7231405237679764)
  testSplitAverageLinearVelocity(sessionManager, 3.1873771333468253)
  testSplitMaximumLinearVelocity(sessionManager, 3.5579265971918987)
  testSplitMinimumPower(sessionManager, 56.541612582807076)
  testSplitAveragePower(sessionManager, 91.38602718035276)
  testSplitMaximumPower(sessionManager, 126.35684327004489)
  testSplitMinimumStrokedistance(sessionManager, 4.147187873987795)
  testSplitAverageStrokedistance(sessionManager, 7.073114164003991)
  testSplitMaximumStrokedistance(sessionManager, 12.30927126596217)
  testSplitMinimumStrokerate(sessionManager, 15.784784897254365)
  testSplitAverageStrokerate(sessionManager, 29.66050862798517)
  testSplitMaximumStrokerate(sessionManager, 44.75500508102043)
  testSplitMinimumDragfactor(sessionManager, 122.17215796334402)
  testSplitAverageDragfactor(sessionManager, 123.7061384696812)
  testSplitMaximumDragfactor(sessionManager, 124.90962932377184)
})

/**
 * @description Test behaviour for the DKN R-320 in a 'Just Row' session
 */
test('DKN_R320_01: sample data for DKN R-320 should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.DKN_R320)
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
  const sessionManager = createSessionManager(testConfig)

  testSessionType(sessionManager, 'justrow')
  testIntervalType(sessionManager, 'justrow')
  testSplitType(sessionManager, 'justrow')

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/DKNR320.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, true) // The recording stops abrubtly, and SessionManager's watchdog hasn't kicked in yet
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 21.701535821)
  testTotalLinearDistance(sessionManager, 69.20242183779045)
  testTotalWork(sessionManager, 5200.736822863752)
  testTotalCalories(sessionManager, 6.761544006858335)
  testTotalCaloriesPerMinute(sessionManager, 19.726851654537608)
  testTotalCaloriesPerHour (sessionManager, 1183.6110992722565)
  testTotalNumberOfStrokes(sessionManager, 9)
  testStrokeState(sessionManager, 'Recovery')
  testStrokeWork(sessionManager, 646.220649414442)
  testStrokeCalories(sessionManager, 0.8038903655792305)
  testCycleDistance(sessionManager, 7.284465456609526)
  testCycleStrokeRate(sessionManager, 26.533345021949888)
  testCycleDuration(sessionManager, 2.2613055365)
  testCycleLinearVelocity(sessionManager, 3.2218652746225382)
  testCyclePace(sessionManager, 155.189605207368)
  testCyclePower(sessionManager, 93.68863152770354)
  testDriveLastStartTime (sessionManager, 19.511980053000002)
  testDriveDuration(sessionManager, 1.2778628719999965)
  testDriveLength(sessionManager, 1.7592918860102824)
  testDriveDistance(sessionManager, 3.642232728304757)
  testDriveAverageHandleForce(sessionManager, 385.62555350976965)
  testDrivePeakHandleForce(sessionManager, 604.6392224523523)
  testRecoveryDuration(sessionManager, 1.011930944000003)
  testDragFactor(sessionManager, rowerProfiles.DKN_R320.dragFactor) // This is a fixed-drag machine

  // Test session metrics
  testSessionType(sessionManager, 'justrow')
  testSessionState(sessionManager, 'Rowing')
  testSessionTime(sessionManager, 21.701535821)
  testSessionMovingTimeTarget(sessionManager, undefined)
  testSessionMovingTimeToEnd(sessionManager, undefined)
  testSessionMovingTimeProjectedEnd(sessionManager, undefined)
  testSessionTimeSpentTotal(sessionManager, 21.701535821)
  testSessionTimeSpentMoving(sessionManager, 21.701535821)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 69.20242183779045)
  testSessionDistanceToEnd(sessionManager, undefined)
  testSessionDistanceTarget(sessionManager, undefined)
  testSessionDistanceProjectedEnd(sessionManager, undefined)
  testSessionWorkSinceStart(sessionManager, 5200.736822863752)
  testSessionCaloriesSinceStart(sessionManager, 6.761544006858335)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 9)
  testSessionMinimumPace(sessionManager, 183.18916429517017)
  testSessionAveragePace(sessionManager, 156.79751694144542)
  testSessionMaximumPace(sessionManager, 149.0674414849483)
  testSessionMinimumLinearVelocity(sessionManager, 2.7294190784906736)
  testSessionAverageLinearVelocity(sessionManager, 3.1888260079189927)
  testSessionMaximumLinearVelocity(sessionManager, 3.3541865012185523)
  testSessionMinimumPower(sessionManager, 56.93360711900691)
  testSessionAveragePower(sessionManager, 92.49881644788539)
  testSessionMaximumPower(sessionManager, 105.68200941707414)
  testSessionMinimumStrokedistance(sessionManager, 5.463349092457141)
  testSessionAverageStrokedistance(sessionManager, 7.123778718596076)
  testSessionMaximumStrokedistance(sessionManager, 7.739744547647621)
  testSessionMinimumStrokerate(sessionManager, 24.844269740570216)
  testSessionAverageStrokerate(sessionManager, 27.108243568576246)
  testSessionMaximumStrokerate(sessionManager, 33.14364602350064)
  testSessionMinimumDragfactor(sessionManager, rowerProfiles.DKN_R320.dragFactor)
  testSessionAverageDragfactor(sessionManager, rowerProfiles.DKN_R320.dragFactor)
  testSessionMaximumDragfactor(sessionManager, rowerProfiles.DKN_R320.dragFactor)
  testSessionNumberOfIntervals(sessionManager, 1)

  // Test interval metrics
  testIntervalNumber(sessionManager, 0)
  testIntervalWorkoutStepNumber(sessionManager, 0)
  testIntervalType(sessionManager, 'justrow')
  testIntervalTime(sessionManager, 21.701535821)
  testIntervalMovingTimeTarget(sessionManager, undefined)
  testIntervalMovingTimeToEnd(sessionManager, undefined)
  testIntervalMovingTimeProjectedEnd(sessionManager, undefined)
  testIntervalTimeSpentTotal(sessionManager, 21.701535821)
  testIntervalTimeSpentMoving(sessionManager, 21.701535821)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 69.20242183779045)
  testIntervalDistanceToEnd(sessionManager, undefined)
  testIntervalDistanceTarget(sessionManager, undefined)
  testIntervalDistanceProjectedEnd(sessionManager, undefined)
  testIntervalWorkSinceStart(sessionManager, 5200.736822863752)
  testIntervalCaloriesSinceStart(sessionManager, 6.761544006858335)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 9)
  testIntervalMinimumPace(sessionManager, 183.18916429517017)
  testIntervalAveragePace(sessionManager, 156.79751694144542)
  testIntervalMaximumPace(sessionManager, 149.0674414849483)
  testIntervalMinimumLinearVelocity(sessionManager, 2.7294190784906736)
  testIntervalAverageLinearVelocity(sessionManager, 3.1888260079189927)
  testIntervalMaximumLinearVelocity(sessionManager, 3.3541865012185523)
  testIntervalMinimumPower(sessionManager, 56.93360711900691)
  testIntervalAveragePower(sessionManager, 92.49881644788539)
  testIntervalMaximumPower(sessionManager, 105.68200941707414)
  testIntervalMinimumStrokedistance(sessionManager, 5.463349092457141)
  testIntervalAverageStrokedistance(sessionManager, 7.123778718596076)
  testIntervalMaximumStrokedistance(sessionManager, 7.739744547647621)
  testIntervalMinimumStrokerate(sessionManager, 24.844269740570216)
  testIntervalAverageStrokerate(sessionManager, 27.108243568576246)
  testIntervalMaximumStrokerate(sessionManager, 33.14364602350064)
  testIntervalMinimumDragfactor(sessionManager, rowerProfiles.DKN_R320.dragFactor)
  testIntervalAverageDragfactor(sessionManager, rowerProfiles.DKN_R320.dragFactor)
  testIntervalMaximumDragfactor(sessionManager, rowerProfiles.DKN_R320.dragFactor)

  // Test split metrics
  testSplitNumber(sessionManager, 0)
  testSplitType(sessionManager, 'justrow')
  testSplitTime(sessionManager, 21.701535821)
  testSplitMovingTimeTarget(sessionManager, undefined)
  testSplitMovingTimeToEnd(sessionManager, undefined)
  testSplitMovingTimeProjectedEnd(sessionManager, undefined)
  testSplitTimeSpentTotal(sessionManager, 21.701535821)
  testSplitTimeSpentMoving(sessionManager, 21.701535821)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 69.20242183779045)
  testSplitDistanceToEnd(sessionManager, undefined)
  testSplitDistanceTarget(sessionManager, undefined)
  testSplitDistanceProjectedEnd(sessionManager, undefined)
  testSplitWorkSinceStart(sessionManager, 5200.736822863752)
  testSplitCaloriesSinceStart(sessionManager, 6.761544006858335)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)
  testSplitNumberOfStrokes(sessionManager, 9)
  testSplitMinimumPace(sessionManager, 183.18916429517017)
  testSplitAveragePace(sessionManager, 156.79751694144542)
  testSplitMaximumPace(sessionManager, 149.0674414849483)
  testSplitMinimumLinearVelocity(sessionManager, 2.7294190784906736)
  testSplitAverageLinearVelocity(sessionManager, 3.1888260079189927)
  testSplitMaximumLinearVelocity(sessionManager, 3.3541865012185523)
  testSplitMinimumPower(sessionManager, 56.93360711900691)
  testSplitAveragePower(sessionManager, 92.49881644788539)
  testSplitMaximumPower(sessionManager, 105.68200941707414)
  testSplitMinimumStrokedistance(sessionManager, 5.463349092457141)
  testSplitAverageStrokedistance(sessionManager, 7.123778718596076)
  testSplitMaximumStrokedistance(sessionManager, 7.739744547647621)
  testSplitMinimumStrokerate(sessionManager, 24.844269740570216)
  testSplitAverageStrokerate(sessionManager, 27.108243568576246)
  testSplitMaximumStrokerate(sessionManager, 33.14364602350064)
  testSplitMinimumDragfactor(sessionManager, rowerProfiles.DKN_R320.dragFactor)
  testSplitAverageDragfactor(sessionManager, rowerProfiles.DKN_R320.dragFactor)
  testSplitMaximumDragfactor(sessionManager, rowerProfiles.DKN_R320.dragFactor)
})

/**
 * @description Test behaviour for the NordicTrack RX800 in a 'Just Row' session
 */
test('NordicT_RX800_01: sample data for NordicTrack RX800 should produce plausible results without intervalsettings', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.NordicTrack_RX800)
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
  const sessionManager = createSessionManager(testConfig)

  testSessionType(sessionManager, 'justrow')
  testIntervalType(sessionManager, 'justrow')
  testSplitType(sessionManager, 'justrow')

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/RX800.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, true) // The recording stops abrubtly, and SessionManager's watchdog hasn't kicked in yet
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 22.368358745999995)
  testTotalLinearDistance(sessionManager, 80.8365747440095)
  testTotalWork(sessionManager, 3132.9891152627774)
  testTotalCalories(sessionManager, 4.847829052893121)
  testTotalCaloriesPerMinute(sessionManager, 12.915884067211993)
  testTotalCaloriesPerHour (sessionManager, 774.9530440327195)
  testTotalNumberOfStrokes(sessionManager, 9)
  testStrokeState(sessionManager, 'Recovery')
  testStrokeWork(sessionManager, 298.42006474992013)
  testStrokeCalories(sessionManager, 0.47141003264278075)
  testCycleDistance(sessionManager, 8.14484194775459)
  testCycleStrokeRate(sessionManager, 26.709337908517135)
  testCycleDuration(sessionManager, 2.246405365999996)
  testCycleLinearVelocity(sessionManager, 3.627196444262048)
  testCyclePace(sessionManager, 137.84751051765127)
  testCyclePower(sessionManager, 133.6207873388181)
  testDriveLastStartTime (sessionManager, 20.24632183399998)
  testDriveDuration(sessionManager, 0.6251555590000031)
  testDriveLength(sessionManager, 1.2252211349000253)
  testDriveDistance(sessionManager, 2.290304983280253)
  testDriveAverageHandleForce(sessionManager, 242.21443734968256)
  testDrivePeakHandleForce(sessionManager, 389.6437952657745)
  testRecoveryDuration(sessionManager, 1.612378919999994)
  testDragFactor(sessionManager, 493.8082148322739)

  // Test session metrics
  testSessionType(sessionManager, 'justrow')
  testSessionState(sessionManager, 'Rowing')
  testSessionTime(sessionManager, 22.368358745999995)
  testSessionMovingTimeTarget(sessionManager, undefined)
  testSessionMovingTimeToEnd(sessionManager, undefined)
  testSessionMovingTimeProjectedEnd(sessionManager, undefined)
  testSessionTimeSpentTotal(sessionManager, 22.368358745999995)
  testSessionTimeSpentMoving(sessionManager, 22.368358745999995)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 80.8365747440095)
  testSessionDistanceToEnd(sessionManager, undefined)
  testSessionDistanceTarget(sessionManager, undefined)
  testSessionDistanceProjectedEnd(sessionManager, undefined)
  testSessionWorkSinceStart(sessionManager, 3132.9891152627774)
  testSessionCaloriesSinceStart(sessionManager, 4.847829052893121)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 9)
  testSessionMinimumPace(sessionManager, 147.67157107875008)
  testSessionAveragePace(sessionManager, 138.35543389137496)
  testSessionMaximumPace(sessionManager, 132.19298595053067)
  testSessionMinimumLinearVelocity(sessionManager, 3.385892059977887)
  testSessionAverageLinearVelocity(sessionManager, 3.613880466686678)
  testSessionMaximumLinearVelocity(sessionManager, 3.7823489378408492)
  testSessionMinimumPower(sessionManager, 108.68693914003735)
  testSessionAveragePower(sessionManager, 137.38710962037004)
  testSessionMaximumPower(sessionManager, 151.51288596463914)
  testSessionMinimumStrokedistance(sessionManager, 7.777415453835244)
  testSessionAverageStrokedistance(sessionManager, 8.270198787251077)
  testSessionMaximumStrokedistance(sessionManager, 8.642321255152048)
  testSessionMinimumStrokerate(sessionManager, 26.06112916090677)
  testSessionAverageStrokerate(sessionManager, 26.56482741163621)
  testSessionMaximumStrokerate(sessionManager, 27.7589108235975)
  testSessionMinimumDragfactor(sessionManager, 486.2899746779819)
  testSessionAverageDragfactor(sessionManager, 504.66471631556203)
  testSessionMaximumDragfactor(sessionManager, 553.4106584852259)
  testSessionNumberOfIntervals(sessionManager, 1)

  // Test interval metrics
  testIntervalNumber(sessionManager, 0)
  testIntervalWorkoutStepNumber(sessionManager, 0)
  testIntervalType(sessionManager, 'justrow')
  testIntervalTime(sessionManager, 22.368358745999995)
  testIntervalMovingTimeTarget(sessionManager, undefined)
  testIntervalMovingTimeToEnd(sessionManager, undefined)
  testIntervalMovingTimeProjectedEnd(sessionManager, undefined)
  testIntervalTimeSpentTotal(sessionManager, 22.368358745999995)
  testIntervalTimeSpentMoving(sessionManager, 22.368358745999995)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 80.8365747440095)
  testIntervalDistanceToEnd(sessionManager, undefined)
  testIntervalDistanceTarget(sessionManager, undefined)
  testIntervalDistanceProjectedEnd(sessionManager, undefined)
  testIntervalWorkSinceStart(sessionManager, 3132.9891152627774)
  testIntervalCaloriesSinceStart(sessionManager, 4.847829052893121)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 9)
  testIntervalMinimumPace(sessionManager, 147.67157107875008)
  testIntervalAveragePace(sessionManager, 138.35543389137496)
  testIntervalMaximumPace(sessionManager, 132.19298595053067)
  testIntervalMinimumLinearVelocity(sessionManager, 3.385892059977887)
  testIntervalAverageLinearVelocity(sessionManager, 3.613880466686678)
  testIntervalMaximumLinearVelocity(sessionManager, 3.7823489378408492)
  testIntervalMinimumPower(sessionManager, 108.68693914003735)
  testIntervalAveragePower(sessionManager, 137.38710962037004)
  testIntervalMaximumPower(sessionManager, 151.51288596463914)
  testIntervalMinimumStrokedistance(sessionManager, 7.777415453835244)
  testIntervalAverageStrokedistance(sessionManager, 8.270198787251077)
  testIntervalMaximumStrokedistance(sessionManager, 8.642321255152048)
  testIntervalMinimumStrokerate(sessionManager, 26.06112916090677)
  testIntervalAverageStrokerate(sessionManager, 26.56482741163621)
  testIntervalMaximumStrokerate(sessionManager, 27.7589108235975)
  testIntervalMinimumDragfactor(sessionManager, 486.2899746779819)
  testIntervalAverageDragfactor(sessionManager, 504.66471631556203)
  testIntervalMaximumDragfactor(sessionManager, 553.4106584852259)

  // Test split metrics
  testSplitNumber(sessionManager, 0)
  testSplitType(sessionManager, 'justrow')
  testSplitTime(sessionManager, 22.368358745999995)
  testSplitMovingTimeTarget(sessionManager, undefined)
  testSplitMovingTimeToEnd(sessionManager, undefined)
  testSplitMovingTimeProjectedEnd(sessionManager, undefined)
  testSplitTimeSpentTotal(sessionManager, 22.368358745999995)
  testSplitTimeSpentMoving(sessionManager, 22.368358745999995)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 80.8365747440095)
  testSplitDistanceToEnd(sessionManager, undefined)
  testSplitDistanceTarget(sessionManager, undefined)
  testSplitDistanceProjectedEnd(sessionManager, undefined)
  testSplitWorkSinceStart(sessionManager, 3132.9891152627774)
  testSplitCaloriesSinceStart(sessionManager, 4.847829052893121)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)
  testSplitNumberOfStrokes(sessionManager, 9)
  testSplitMinimumPace(sessionManager, 147.67157107875008)
  testSplitAveragePace(sessionManager, 138.35543389137496)
  testSplitMaximumPace(sessionManager, 132.19298595053067)
  testSplitMinimumLinearVelocity(sessionManager, 3.385892059977887)
  testSplitAverageLinearVelocity(sessionManager, 3.613880466686678)
  testSplitMaximumLinearVelocity(sessionManager, 3.7823489378408492)
  testSplitMinimumPower(sessionManager, 108.68693914003735)
  testSplitAveragePower(sessionManager, 137.38710962037004)
  testSplitMaximumPower(sessionManager, 151.51288596463914)
  testSplitMinimumStrokedistance(sessionManager, 7.777415453835244)
  testSplitAverageStrokedistance(sessionManager, 8.270198787251077)
  testSplitMaximumStrokedistance(sessionManager, 8.642321255152048)
  testSplitMinimumStrokerate(sessionManager, 26.06112916090677)
  testSplitAverageStrokerate(sessionManager, 26.56482741163621)
  testSplitMaximumStrokerate(sessionManager, 27.7589108235975)
  testSplitMinimumDragfactor(sessionManager, 486.2899746779819)
  testSplitAverageDragfactor(sessionManager, 504.66471631556203)
  testSplitMaximumDragfactor(sessionManager, 553.4106584852259)
})

/**
 * @description Test behaviour for the NordicTrack RX800 in a single interval session with a float Time target
 */
test('NordicT_RX800_02: sample data for NordicTrack RX800 should produce plausible results for a 20.1 seconds session', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.NordicTrack_RX800)
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
  const sessionManager = createSessionManager(testConfig)

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'time',
    targetTime: 20.1
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testSessionType(sessionManager, 'time')
  testSessionMovingTimeTarget(sessionManager, 20.1)
  testIntervalType(sessionManager, 'time')
  testIntervalMovingTimeTarget(sessionManager, 20.1)
  testSplitType(sessionManager, 'time')
  testSplitMovingTimeTarget(sessionManager, 20.1)

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/RX800.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, false)
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 20.10698646999998)
  testTotalLinearDistance(sessionManager, 72.62915467127921)
  testTotalWork(sessionManager, 2834.5690505128573)
  testTotalCalories(sessionManager, 4.375171777750339)
  testTotalCaloriesPerMinute(sessionManager, 12.965723467320839)
  testTotalCaloriesPerHour (sessionManager, 777.9434080392504)
  testTotalNumberOfStrokes(sessionManager, 8)
  testStrokeState(sessionManager, 'Stopped')
  testStrokeWork(sessionManager, undefined)
  testStrokeCalories(sessionManager, undefined)
  testCycleDistance(sessionManager, undefined)
  testCycleStrokeRate(sessionManager, undefined)
  testCycleDuration(sessionManager, undefined)
  testCycleLinearVelocity(sessionManager, undefined)
  testCyclePace(sessionManager, Infinity)
  testCyclePower(sessionManager, undefined)
  testDriveLastStartTime (sessionManager, 17.991045580999984)
  testDriveDuration(sessionManager, undefined)
  testDriveLength(sessionManager, undefined)
  testDriveDistance(sessionManager, undefined)
  testDriveAverageHandleForce(sessionManager, undefined)
  testDrivePeakHandleForce(sessionManager, undefined)
  testRecoveryDuration(sessionManager, undefined)
  testDragFactor(sessionManager, 489.6362497474688)

  // Test session metrics
  testSessionType(sessionManager, 'time')
  testSessionState(sessionManager, 'Stopped')
  testSessionTime(sessionManager, 20.10698646999998)
  testSessionMovingTimeTarget(sessionManager, 20.1)
  testSessionMovingTimeToEnd(sessionManager, -0.006986469999979761) // This is a test artifact
  testSessionMovingTimeProjectedEnd(sessionManager, 20.1)
  testSessionTimeSpentTotal(sessionManager, 20.10698646999998)
  testSessionTimeSpentMoving(sessionManager, 20.10698646999998)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 72.62915467127921)
  testSessionDistanceToEnd(sessionManager, undefined)
  testSessionDistanceTarget(sessionManager, undefined)
  testSessionDistanceProjectedEnd(sessionManager, 72.60374121313309)
  testSessionWorkSinceStart(sessionManager, 2834.5690505128573)
  testSessionCaloriesSinceStart(sessionManager, 4.375171777750339)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 8)
  testSessionMinimumPace(sessionManager, 147.67157107875008)
  testSessionAveragePace(sessionManager, 138.422280701218)
  testSessionMaximumPace(sessionManager, 132.19298595053067)
  testSessionMinimumLinearVelocity(sessionManager, 3.385892059977887)
  testSessionAverageLinearVelocity(sessionManager, 3.6121352535668803)
  testSessionMaximumLinearVelocity(sessionManager, 3.7823489378408492)
  testSessionMinimumPower(sessionManager, 108.68693914003735)
  testSessionAveragePower(sessionManager, 137.69966645388217)
  testSessionMaximumPower(sessionManager, 151.51288596463914)
  testSessionMinimumStrokedistance(sessionManager, 7.777415453835244)
  testSessionAverageStrokedistance(sessionManager, 8.277374474122523)
  testSessionMaximumStrokedistance(sessionManager, 8.642321255152048)
  testSessionMinimumStrokerate(sessionManager, 26.06112916090677)
  testSessionAverageStrokerate(sessionManager, 26.563783064771165)
  testSessionMaximumStrokerate(sessionManager, 27.7589108235975)
  testSessionMinimumDragfactor(sessionManager, 486.2899746779819)
  testSessionAverageDragfactor(sessionManager, 505.0579243390023)
  testSessionMaximumDragfactor(sessionManager, 553.4106584852259)
  testSessionNumberOfIntervals(sessionManager, 1)

  // Test interval metrics
  testIntervalNumber(sessionManager, 0)
  testIntervalWorkoutStepNumber(sessionManager, 0)
  testIntervalType(sessionManager, 'time')
  testIntervalTime(sessionManager, 20.10698646999998)
  testIntervalMovingTimeTarget(sessionManager, 20.1)
  testIntervalMovingTimeToEnd(sessionManager, -0.006986469999979761) // This is a test artifact
  testIntervalMovingTimeProjectedEnd(sessionManager, 20.1)
  testIntervalTimeSpentTotal(sessionManager, 20.10698646999998)
  testIntervalTimeSpentMoving(sessionManager, 20.10698646999998)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 72.62915467127921)
  testIntervalDistanceToEnd(sessionManager, undefined)
  testIntervalDistanceTarget(sessionManager, undefined)
  testIntervalDistanceProjectedEnd(sessionManager, 72.60374121313309)
  testIntervalWorkSinceStart(sessionManager, 2834.5690505128573)
  testIntervalCaloriesSinceStart(sessionManager, 4.375171777750339)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 8)
  testIntervalMinimumPace(sessionManager, 147.67157107875008)
  testIntervalAveragePace(sessionManager, 138.422280701218)
  testIntervalMaximumPace(sessionManager, 132.19298595053067)
  testIntervalMinimumLinearVelocity(sessionManager, 3.385892059977887)
  testIntervalAverageLinearVelocity(sessionManager, 3.6121352535668803)
  testIntervalMaximumLinearVelocity(sessionManager, 3.7823489378408492)
  testIntervalMinimumPower(sessionManager, 108.68693914003735)
  testIntervalAveragePower(sessionManager, 137.69966645388217)
  testIntervalMaximumPower(sessionManager, 151.51288596463914)
  testIntervalMinimumStrokedistance(sessionManager, 7.777415453835244)
  testIntervalAverageStrokedistance(sessionManager, 8.277374474122523)
  testIntervalMaximumStrokedistance(sessionManager, 8.642321255152048)
  testIntervalMinimumStrokerate(sessionManager, 26.06112916090677)
  testIntervalAverageStrokerate(sessionManager, 26.563783064771165)
  testIntervalMaximumStrokerate(sessionManager, 27.7589108235975)
  testIntervalMinimumDragfactor(sessionManager, 486.2899746779819)
  testIntervalAverageDragfactor(sessionManager, 505.0579243390023)
  testIntervalMaximumDragfactor(sessionManager, 553.4106584852259)

  // Test split metrics
  testSplitNumber(sessionManager, 0)
  testSplitType(sessionManager, 'time')
  testSplitTime(sessionManager, 20.10698646999998)
  testSplitMovingTimeTarget(sessionManager, 20.1)
  testSplitMovingTimeToEnd(sessionManager, -0.006986469999979761) // This is a test artifact
  testSplitMovingTimeProjectedEnd(sessionManager, 20.1)
  testSplitTimeSpentTotal(sessionManager, 20.10698646999998)
  testSplitTimeSpentMoving(sessionManager, 20.10698646999998)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 72.62915467127921)
  testSplitDistanceToEnd(sessionManager, undefined)
  testSplitDistanceTarget(sessionManager, undefined)
  testSplitDistanceProjectedEnd(sessionManager, 72.60374121313309)
  testSplitWorkSinceStart(sessionManager, 2834.5690505128573)
  testSplitCaloriesSinceStart(sessionManager, 4.375171777750339)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)
  testSplitNumberOfStrokes(sessionManager, 8)
  testSplitMinimumPace(sessionManager, 147.67157107875008)
  testSplitAveragePace(sessionManager, 138.422280701218)
  testSplitMaximumPace(sessionManager, 132.19298595053067)
  testSplitMinimumLinearVelocity(sessionManager, 3.385892059977887)
  testSplitAverageLinearVelocity(sessionManager, 3.6121352535668803)
  testSplitMaximumLinearVelocity(sessionManager, 3.7823489378408492)
  testSplitMinimumPower(sessionManager, 108.68693914003735)
  testSplitAveragePower(sessionManager, 137.69966645388217)
  testSplitMaximumPower(sessionManager, 151.51288596463914)
  testSplitMinimumStrokedistance(sessionManager, 7.777415453835244)
  testSplitAverageStrokedistance(sessionManager, 8.277374474122523)
  testSplitMaximumStrokedistance(sessionManager, 8.642321255152048)
  testSplitMinimumStrokerate(sessionManager, 26.06112916090677)
  testSplitAverageStrokerate(sessionManager, 26.563783064771165)
  testSplitMaximumStrokerate(sessionManager, 27.7589108235975)
  testSplitMinimumDragfactor(sessionManager, 486.2899746779819)
  testSplitAverageDragfactor(sessionManager, 505.0579243390023)
  testSplitMaximumDragfactor(sessionManager, 553.4106584852259)
})

/**
 * @description Test behaviour for the NordicTrack RX800 in a single interval session with a float Calorie target
 */
test('NordicT_RX800_03: sample data for NordicTrack RX800 should produce plausible results for a 4.8 calories session', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.NordicTrack_RX800)
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
  const sessionManager = createSessionManager(testConfig)

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'calories',
    targetCalories: 4.8
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testSessionType(sessionManager, 'calories')
  testSessionCaloriesTarget(sessionManager, 4.8)
  testIntervalType(sessionManager, 'calories')
  testIntervalCaloriesTarget(sessionManager, 4.8)
  testSplitType(sessionManager, 'calories')
  testSplitCaloriesTarget(sessionManager, 4.8)

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/RX800.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, false)
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 21.816067524999994)
  testTotalLinearDistance(sessionManager, 78.9867130267447)
  testTotalWork(sessionManager, 3132.9891152627774)
  testTotalCalories(sessionManager, 4.801804784476454)
  testTotalCaloriesPerMinute(sessionManager, 12.915884067211993)
  testTotalCaloriesPerHour (sessionManager, 774.9530440327195)
  testTotalNumberOfStrokes(sessionManager, 9)
  testStrokeState(sessionManager, 'Stopped')
  testStrokeWork(sessionManager, undefined)
  testStrokeCalories(sessionManager, undefined)
  testCycleDistance(sessionManager, undefined)
  testCycleStrokeRate(sessionManager, undefined)
  testCycleDuration(sessionManager, undefined)
  testCycleLinearVelocity(sessionManager, undefined)
  testCyclePace(sessionManager, Infinity)
  testCyclePower(sessionManager, undefined)
  testDriveLastStartTime (sessionManager, 20.24632183399998)
  testDriveDuration(sessionManager, undefined)
  testDriveLength(sessionManager, undefined)
  testDriveDistance(sessionManager, undefined)
  testDriveAverageHandleForce(sessionManager, undefined)
  testDrivePeakHandleForce(sessionManager, undefined)
  testRecoveryDuration(sessionManager, undefined)
  testDragFactor(sessionManager, 493.8082148322739)

  // Test session metrics
  testSessionType(sessionManager, 'calories')
  testSessionState(sessionManager, 'Stopped')
  testSessionTime(sessionManager, 21.816067524999994)
  testSessionMovingTimeTarget(sessionManager, undefined)
  testSessionMovingTimeToEnd(sessionManager, undefined)
  testSessionMovingTimeProjectedEnd(sessionManager, 21.794410111282083)
  testSessionTimeSpentTotal(sessionManager, 21.816067524999994)
  testSessionTimeSpentMoving(sessionManager, 21.816067524999994)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 78.9867130267447)
  testSessionDistanceToEnd(sessionManager, undefined)
  testSessionDistanceTarget(sessionManager, undefined)
  testSessionDistanceProjectedEnd(sessionManager, 78.90390603352311)
  testSessionWorkSinceStart(sessionManager, 3132.9891152627774)
  testSessionCaloriesSinceStart(sessionManager, 4.801804784476454)
  testSessionCaloriesTarget(sessionManager, 4.8)
  testSessionCaloriesToEnd(sessionManager, -0.0018047844764543797) // This is atesting artifact
  testSessionNumberOfStrokes(sessionManager, 9)
  testSessionMinimumPace(sessionManager, 147.67157107875008)
  testSessionAveragePace(sessionManager, 138.0996036486107)
  testSessionMaximumPace(sessionManager, 132.19298595053067)
  testSessionMinimumLinearVelocity(sessionManager, 3.385892059977887)
  testSessionAverageLinearVelocity(sessionManager, 3.620575199275962)
  testSessionMaximumLinearVelocity(sessionManager, 3.7823489378408492)
  testSessionMinimumPower(sessionManager, 108.68693914003735)
  testSessionAveragePower(sessionManager, 137.17786949361715)
  testSessionMaximumPower(sessionManager, 151.51288596463914)
  testSessionMinimumStrokedistance(sessionManager, 7.777415453835244)
  testSessionAverageStrokedistance(sessionManager, 8.263234518390162)
  testSessionMaximumStrokedistance(sessionManager, 8.642321255152048)
  testSessionMinimumStrokerate(sessionManager, 26.06112916090677)
  testSessionAverageStrokerate(sessionManager, 26.572855772574037)
  testSessionMaximumStrokerate(sessionManager, 27.7589108235975)
  testSessionMinimumDragfactor(sessionManager, 486.2899746779819)
  testSessionAverageDragfactor(sessionManager, 504.0933215006521)
  testSessionMaximumDragfactor(sessionManager, 553.4106584852259)
  testSessionNumberOfIntervals(sessionManager, 1)

  // Test interval metrics
  testIntervalNumber(sessionManager, 0)
  testIntervalWorkoutStepNumber(sessionManager, 0)
  testIntervalType(sessionManager, 'calories')
  testIntervalTime(sessionManager, 21.816067524999994)
  testIntervalMovingTimeTarget(sessionManager, undefined)
  testIntervalMovingTimeToEnd(sessionManager, undefined)
  testIntervalMovingTimeProjectedEnd(sessionManager, 21.794410111282083)
  testIntervalTimeSpentTotal(sessionManager, 21.816067524999994)
  testIntervalTimeSpentMoving(sessionManager, 21.816067524999994)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 78.9867130267447)
  testIntervalDistanceToEnd(sessionManager, undefined)
  testIntervalDistanceTarget(sessionManager, undefined)
  testIntervalDistanceProjectedEnd(sessionManager, 78.90390603352311)
  testIntervalWorkSinceStart(sessionManager, 3132.9891152627774)
  testIntervalCaloriesSinceStart(sessionManager, 4.801804784476454)
  testIntervalCaloriesTarget(sessionManager, 4.8)
  testIntervalCaloriesToEnd(sessionManager, -0.0018047844764543797) // This is a testing artifact
  testIntervalNumberOfStrokes(sessionManager, 9)
  testIntervalMinimumPace(sessionManager, 147.67157107875008)
  testIntervalAveragePace(sessionManager, 138.0996036486107)
  testIntervalMaximumPace(sessionManager, 132.19298595053067)
  testIntervalMinimumLinearVelocity(sessionManager, 3.385892059977887)
  testIntervalAverageLinearVelocity(sessionManager, 3.620575199275962)
  testIntervalMaximumLinearVelocity(sessionManager, 3.7823489378408492)
  testIntervalMinimumPower(sessionManager, 108.68693914003735)
  testIntervalAveragePower(sessionManager, 137.17786949361715)
  testIntervalMaximumPower(sessionManager, 151.51288596463914)
  testIntervalMinimumStrokedistance(sessionManager, 7.777415453835244)
  testIntervalAverageStrokedistance(sessionManager, 8.263234518390162)
  testIntervalMaximumStrokedistance(sessionManager, 8.642321255152048)
  testIntervalMinimumStrokerate(sessionManager, 26.06112916090677)
  testIntervalAverageStrokerate(sessionManager, 26.572855772574037)
  testIntervalMaximumStrokerate(sessionManager, 27.7589108235975)
  testIntervalMinimumDragfactor(sessionManager, 486.2899746779819)
  testIntervalAverageDragfactor(sessionManager, 504.0933215006521)
  testIntervalMaximumDragfactor(sessionManager, 553.4106584852259)

  // Test split metrics
  testSplitNumber(sessionManager, 0)
  testSplitType(sessionManager, 'calories')
  testSplitTime(sessionManager, 21.816067524999994)
  testSplitMovingTimeTarget(sessionManager, undefined)
  testSplitMovingTimeToEnd(sessionManager, undefined)
  testSplitMovingTimeProjectedEnd(sessionManager, 21.794410111282083)
  testSplitTimeSpentTotal(sessionManager, 21.816067524999994)
  testSplitTimeSpentMoving(sessionManager, 21.816067524999994)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 78.9867130267447)
  testSplitDistanceToEnd(sessionManager, undefined)
  testSplitDistanceTarget(sessionManager, undefined)
  testSplitDistanceProjectedEnd(sessionManager, 78.90390603352311)
  testSplitWorkSinceStart(sessionManager, 3132.9891152627774)
  testSplitCaloriesSinceStart(sessionManager, 4.801804784476454)
  testSplitCaloriesTarget(sessionManager, 4.8)
  testSplitCaloriesToEnd(sessionManager, -0.0018047844764543797) // This is a testing artifact
  testSplitNumberOfStrokes(sessionManager, 9)
  testSplitMinimumPace(sessionManager, 147.67157107875008)
  testSplitAveragePace(sessionManager, 138.0996036486107)
  testSplitMaximumPace(sessionManager, 132.19298595053067)
  testSplitMinimumLinearVelocity(sessionManager, 3.385892059977887)
  testSplitAverageLinearVelocity(sessionManager, 3.620575199275962)
  testSplitMaximumLinearVelocity(sessionManager, 3.7823489378408492)
  testSplitMinimumPower(sessionManager, 108.68693914003735)
  testSplitAveragePower(sessionManager, 137.17786949361715)
  testSplitMaximumPower(sessionManager, 151.51288596463914)
  testSplitMinimumStrokedistance(sessionManager, 7.777415453835244)
  testSplitAverageStrokedistance(sessionManager, 8.263234518390162)
  testSplitMaximumStrokedistance(sessionManager, 8.642321255152048)
  testSplitMinimumStrokerate(sessionManager, 26.06112916090677)
  testSplitAverageStrokerate(sessionManager, 26.572855772574037)
  testSplitMaximumStrokerate(sessionManager, 27.7589108235975)
  testSplitMinimumDragfactor(sessionManager, 486.2899746779819)
  testSplitAverageDragfactor(sessionManager, 504.0933215006521)
  testSplitMaximumDragfactor(sessionManager, 553.4106584852259)
})

/**
 * @description Test behaviour for the NordicTrack RX800 in a single interval session with a float Distance target
 */
test('NordicT_RX800_04: sample data for NordicTrack RX800 should produce plausible results for a 78.9 meter session', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.NordicTrack_RX800)
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
  const sessionManager = createSessionManager(testConfig)

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'distance',
    targetDistance: 78.9
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testSessionType(sessionManager, 'distance')
  testSessionDistanceTarget(sessionManager, 78.9)
  testIntervalType(sessionManager, 'distance')
  testIntervalDistanceTarget(sessionManager, 78.9)
  testSplitType(sessionManager, 'distance')
  testSplitDistanceTarget(sessionManager, 78.9)

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/RX800.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, false)
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 21.816067524999994)
  testTotalLinearDistance(sessionManager, 78.9867130267447)
  testTotalWork(sessionManager, 3132.9891152627774)
  testTotalCalories(sessionManager, 4.801804784476454)
  testTotalCaloriesPerMinute(sessionManager, 12.915884067211993)
  testTotalCaloriesPerHour (sessionManager, 774.9530440327195)
  testTotalNumberOfStrokes(sessionManager, 9)
  testStrokeState(sessionManager, 'Stopped')
  testStrokeWork(sessionManager, undefined)
  testStrokeCalories(sessionManager, undefined)
  testCycleDistance(sessionManager, undefined)
  testCycleStrokeRate(sessionManager, undefined)
  testCycleDuration(sessionManager, undefined)
  testCycleLinearVelocity(sessionManager, undefined)
  testCyclePace(sessionManager, Infinity)
  testCyclePower(sessionManager, undefined)
  testDriveLastStartTime (sessionManager, 20.24632183399998)
  testDriveDuration(sessionManager, undefined)
  testDriveLength(sessionManager, undefined)
  testDriveDistance(sessionManager, undefined)
  testDriveAverageHandleForce(sessionManager, undefined)
  testDrivePeakHandleForce(sessionManager, undefined)
  testRecoveryDuration(sessionManager, undefined)
  testDragFactor(sessionManager, 493.8082148322739)

  // Test session metrics
  testSessionType(sessionManager, 'distance')
  testSessionState(sessionManager, 'Stopped')
  testSessionTime(sessionManager, 21.816067524999994)
  testSessionMovingTimeTarget(sessionManager, undefined)
  testSessionMovingTimeToEnd(sessionManager, undefined)
  testSessionMovingTimeProjectedEnd(sessionManager, 21.793388523844655)
  testSessionTimeSpentTotal(sessionManager, 21.816067524999994)
  testSessionTimeSpentMoving(sessionManager, 21.816067524999994)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 78.9867130267447)
  testSessionDistanceToEnd(sessionManager, -0.08671302674468961) // This is a testing artifact)
  testSessionDistanceTarget(sessionManager, 78.9)
  testSessionDistanceProjectedEnd(sessionManager, 78.9)
  testSessionWorkSinceStart(sessionManager, 3132.9891152627774)
  testSessionCaloriesSinceStart(sessionManager, 4.801804784476454)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 9)
  testSessionMinimumPace(sessionManager, 147.67157107875008)
  testSessionAveragePace(sessionManager, 138.0996036486107)
  testSessionMaximumPace(sessionManager, 132.19298595053067)
  testSessionMinimumLinearVelocity(sessionManager, 3.385892059977887)
  testSessionAverageLinearVelocity(sessionManager, 3.620575199275962)
  testSessionMaximumLinearVelocity(sessionManager, 3.7823489378408492)
  testSessionMinimumPower(sessionManager, 108.68693914003735)
  testSessionAveragePower(sessionManager, 137.17786949361715)
  testSessionMaximumPower(sessionManager, 151.51288596463914)
  testSessionMinimumStrokedistance(sessionManager, 7.777415453835244)
  testSessionAverageStrokedistance(sessionManager, 8.263234518390162)
  testSessionMaximumStrokedistance(sessionManager, 8.642321255152048)
  testSessionMinimumStrokerate(sessionManager, 26.06112916090677)
  testSessionAverageStrokerate(sessionManager, 26.572855772574037)
  testSessionMaximumStrokerate(sessionManager, 27.7589108235975)
  testSessionMinimumDragfactor(sessionManager, 486.2899746779819)
  testSessionAverageDragfactor(sessionManager, 504.0933215006521)
  testSessionMaximumDragfactor(sessionManager, 553.4106584852259)
  testSessionNumberOfIntervals(sessionManager, 1)

  // Test interval metrics
  testIntervalNumber(sessionManager, 0)
  testIntervalWorkoutStepNumber(sessionManager, 0)
  testIntervalType(sessionManager, 'distance')
  testIntervalTime(sessionManager, 21.816067524999994)
  testIntervalMovingTimeTarget(sessionManager, undefined)
  testIntervalMovingTimeToEnd(sessionManager, undefined)
  testIntervalMovingTimeProjectedEnd(sessionManager, 21.793388523844655)
  testIntervalTimeSpentTotal(sessionManager, 21.816067524999994)
  testIntervalTimeSpentMoving(sessionManager, 21.816067524999994)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 78.9867130267447)
  testIntervalDistanceToEnd(sessionManager, -0.08671302674468961) // This is a testing artifact
  testIntervalDistanceTarget(sessionManager, 78.9)
  testIntervalDistanceProjectedEnd(sessionManager, 78.9)
  testIntervalWorkSinceStart(sessionManager, 3132.9891152627774)
  testIntervalCaloriesSinceStart(sessionManager, 4.801804784476454)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 9)
  testIntervalMinimumPace(sessionManager, 147.67157107875008)
  testIntervalAveragePace(sessionManager, 138.0996036486107)
  testIntervalMaximumPace(sessionManager, 132.19298595053067)
  testIntervalMinimumLinearVelocity(sessionManager, 3.385892059977887)
  testIntervalAverageLinearVelocity(sessionManager, 3.620575199275962)
  testIntervalMaximumLinearVelocity(sessionManager, 3.7823489378408492)
  testIntervalMinimumPower(sessionManager, 108.68693914003735)
  testIntervalAveragePower(sessionManager, 137.17786949361715)
  testIntervalMaximumPower(sessionManager, 151.51288596463914)
  testIntervalMinimumStrokedistance(sessionManager, 7.777415453835244)
  testIntervalAverageStrokedistance(sessionManager, 8.263234518390162)
  testIntervalMaximumStrokedistance(sessionManager, 8.642321255152048)
  testIntervalMinimumStrokerate(sessionManager, 26.06112916090677)
  testIntervalAverageStrokerate(sessionManager, 26.572855772574037)
  testIntervalMaximumStrokerate(sessionManager, 27.7589108235975)
  testIntervalMinimumDragfactor(sessionManager, 486.2899746779819)
  testIntervalAverageDragfactor(sessionManager, 504.0933215006521)
  testIntervalMaximumDragfactor(sessionManager, 553.4106584852259)

  // Test split metrics
  testSplitNumber(sessionManager, 0)
  testSplitType(sessionManager, 'distance')
  testSplitTime(sessionManager, 21.816067524999994)
  testSplitMovingTimeTarget(sessionManager, undefined)
  testSplitMovingTimeToEnd(sessionManager, undefined)
  testSplitMovingTimeProjectedEnd(sessionManager, 21.793388523844655)
  testSplitTimeSpentTotal(sessionManager, 21.816067524999994)
  testSplitTimeSpentMoving(sessionManager, 21.816067524999994)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 78.9867130267447)
  testSplitDistanceToEnd(sessionManager, -0.08671302674468961) // This is a testing artifact
  testSplitDistanceTarget(sessionManager, 78.9)
  testSplitDistanceProjectedEnd(sessionManager, 78.9)
  testSplitWorkSinceStart(sessionManager, 3132.9891152627774)
  testSplitCaloriesSinceStart(sessionManager, 4.801804784476454)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)
  testSplitNumberOfStrokes(sessionManager, 9)
  testSplitMinimumPace(sessionManager, 147.67157107875008)
  testSplitAveragePace(sessionManager, 138.0996036486107)
  testSplitMaximumPace(sessionManager, 132.19298595053067)
  testSplitMinimumLinearVelocity(sessionManager, 3.385892059977887)
  testSplitAverageLinearVelocity(sessionManager, 3.620575199275962)
  testSplitMaximumLinearVelocity(sessionManager, 3.7823489378408492)
  testSplitMinimumPower(sessionManager, 108.68693914003735)
  testSplitAveragePower(sessionManager, 137.17786949361715)
  testSplitMaximumPower(sessionManager, 151.51288596463914)
  testSplitMinimumStrokedistance(sessionManager, 7.777415453835244)
  testSplitAverageStrokedistance(sessionManager, 8.263234518390162)
  testSplitMaximumStrokedistance(sessionManager, 8.642321255152048)
  testSplitMinimumStrokerate(sessionManager, 26.06112916090677)
  testSplitAverageStrokerate(sessionManager, 26.572855772574037)
  testSplitMaximumStrokerate(sessionManager, 27.7589108235975)
  testSplitMinimumDragfactor(sessionManager, 486.2899746779819)
  testSplitAverageDragfactor(sessionManager, 504.0933215006521)
  testSplitMaximumDragfactor(sessionManager, 553.4106584852259)
})

/**
 * @description Test against the Merarch R50
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/discussions/140|this discussion}
 */
test('Merarch_R50_01: Data with Merarch R50 should produce plausible results for a 500 meter session', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Merach_R50)
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

  const sessionManager = createSessionManager(testConfig)

  testSessionType(sessionManager, 'justrow')
  testIntervalType(sessionManager, 'justrow')
  testSplitType(sessionManager, 'justrow')

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'distance',
    targetDistance: 500,
    split: {
      type: 'distance',
      targetDistance: 100
    }
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testSessionType(sessionManager, 'distance')
  testSessionDistanceTarget(sessionManager, 500)
  testIntervalType(sessionManager, 'distance')
  testIntervalDistanceTarget(sessionManager, 500)
  testSplitType(sessionManager, 'distance')
  testSplitDistanceTarget(sessionManager, 100)

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/Merach_R50_510m.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, false)
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 125.72261800000001)
  testTotalLinearDistance(sessionManager, 500.1592245940827)
  testTotalWork(sessionManager, 22829.81352857388)
  testTotalCalories(sessionManager, 32.219564384356076)
  testTotalCaloriesPerMinute(sessionManager, 15.52334646861831)
  testTotalCaloriesPerHour (sessionManager, 931.4007881170988)
  testTotalNumberOfStrokes(sessionManager, 49)
  testStrokeState(sessionManager, 'Stopped')
  testStrokeWork(sessionManager, undefined)
  testStrokeCalories(sessionManager, undefined)
  testCycleDistance(sessionManager, undefined)
  testCycleStrokeRate(sessionManager, undefined)
  testCycleDuration(sessionManager, undefined)
  testCycleLinearVelocity(sessionManager, undefined)
  testCyclePace(sessionManager, Infinity)
  testCyclePower(sessionManager, undefined)
  testDriveLastStartTime (sessionManager, 123.22668199999998)
  testDriveDuration(sessionManager, undefined)
  testDriveLength(sessionManager, undefined)
  testDriveDistance(sessionManager, undefined)
  testDriveAverageHandleForce(sessionManager, undefined)
  testDrivePeakHandleForce(sessionManager, undefined)
  testRecoveryDuration(sessionManager, undefined)
  testDragFactor(sessionManager, 123.2635201451201)

  // Test session metrics
  testSessionType(sessionManager, 'distance')
  testSessionState(sessionManager, 'Stopped')
  testSessionTime(sessionManager, 125.72261800000001)
  testSessionMovingTimeTarget(sessionManager, undefined)
  testSessionMovingTimeToEnd(sessionManager, undefined)
  testSessionMovingTimeProjectedEnd(sessionManager, 125.6836508203873)
  testSessionTimeSpentTotal(sessionManager, 125.72261800000001)
  testSessionTimeSpentMoving(sessionManager, 125.72261800000001)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 500.1592245940827)
  testSessionDistanceToEnd(sessionManager, -0.15922459408267287)
  testSessionDistanceTarget(sessionManager, 500)
  testSessionDistanceProjectedEnd(sessionManager, 500)
  testSessionWorkSinceStart(sessionManager, 22829.81352857388)
  testSessionCaloriesSinceStart(sessionManager, 32.219564384356076)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 49)
  testSessionMinimumPace(sessionManager, 155.82248412524578)
  testSessionAveragePace(sessionManager, 125.68259447982139)
  testSessionMaximumPace(sessionManager, 121.53313334054032)
  testSessionMinimumLinearVelocity(sessionManager, 3.2087795468471283)
  testSessionAverageLinearVelocity(sessionManager, 3.978275608244832)
  testSessionMaximumLinearVelocity(sessionManager, 4.114104411337619)
  testSessionMinimumPower(sessionManager, 92.5076553187539)
  testSessionAveragePower(sessionManager, 178.2374659740029)
  testSessionMaximumPower(sessionManager, 194.9772627729816)
  testSessionMinimumStrokedistance(sessionManager, 9.347453983785956)
  testSessionAverageStrokedistance(sessionManager, 10.046672970165618)
  testSessionMaximumStrokedistance(sessionManager, 10.427050626616515)
  testSessionMinimumStrokerate(sessionManager, 20.5967072044199)
  testSessionAverageStrokerate(sessionManager, 23.817939816423333)
  testSessionMaximumStrokerate(sessionManager, 25.503578789694632)
  testSessionMinimumDragfactor(sessionManager, 123.11994765671123)
  testSessionAverageDragfactor(sessionManager, 123.54922724050179)
  testSessionMaximumDragfactor(sessionManager, 124.43729521393021)
  testSessionNumberOfIntervals(sessionManager, 1)

  // Test interval metrics
  testIntervalNumber(sessionManager, 0)
  testIntervalWorkoutStepNumber(sessionManager, 0)
  testIntervalType(sessionManager, 'distance')
  testIntervalTime(sessionManager, 125.72261800000001)
  testIntervalMovingTimeTarget(sessionManager, undefined)
  testIntervalMovingTimeToEnd(sessionManager, undefined)
  testIntervalMovingTimeProjectedEnd(sessionManager, 125.6836508203873)
  testIntervalTimeSpentTotal(sessionManager, 125.72261800000001)
  testIntervalTimeSpentMoving(sessionManager, 125.72261800000001)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 500.1592245940827)
  testIntervalDistanceToEnd(sessionManager, -0.15922459408267287)
  testIntervalDistanceTarget(sessionManager, 500)
  testIntervalDistanceProjectedEnd(sessionManager, 500)
  testIntervalWorkSinceStart(sessionManager, 22829.81352857388)
  testIntervalCaloriesSinceStart(sessionManager, 32.219564384356076)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 49)
  testIntervalMinimumPace(sessionManager, 155.82248412524578)
  testIntervalAveragePace(sessionManager, 125.68259447982139)
  testIntervalMaximumPace(sessionManager, 121.53313334054032)
  testIntervalMinimumLinearVelocity(sessionManager, 3.2087795468471283)
  testIntervalAverageLinearVelocity(sessionManager, 3.978275608244832)
  testIntervalMaximumLinearVelocity(sessionManager, 4.114104411337619)
  testIntervalMinimumPower(sessionManager, 92.5076553187539)
  testIntervalAveragePower(sessionManager, 178.2374659740029)
  testIntervalMaximumPower(sessionManager, 194.9772627729816)
  testIntervalMinimumStrokedistance(sessionManager, 9.347453983785956)
  testIntervalAverageStrokedistance(sessionManager, 10.046672970165618)
  testIntervalMaximumStrokedistance(sessionManager, 10.427050626616515)
  testIntervalMinimumStrokerate(sessionManager, 20.5967072044199)
  testIntervalAverageStrokerate(sessionManager, 23.817939816423333)
  testIntervalMaximumStrokerate(sessionManager, 25.503578789694632)
  testIntervalMinimumDragfactor(sessionManager, 123.11994765671123)
  testIntervalAverageDragfactor(sessionManager, 123.54922724050179)
  testIntervalMaximumDragfactor(sessionManager, 124.43729521393021)

  // Test split metrics
  testSplitNumber(sessionManager, 4)
  testSplitType(sessionManager, 'distance')
  testSplitTime(sessionManager, 24.77682730146141)
  testSplitMovingTimeTarget(sessionManager, undefined)
  testSplitMovingTimeToEnd(sessionManager, undefined)
  testSplitMovingTimeProjectedEnd(sessionManager, 24.737860121848698)
  testSplitTimeSpentTotal(sessionManager, 24.77682730146141)
  testSplitTimeSpentMoving(sessionManager, 24.77682730146141)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 100.15922459408267)
  testSplitDistanceToEnd(sessionManager, -0.15922459408267287)
  testSplitDistanceTarget(sessionManager, 100)
  testSplitDistanceProjectedEnd(sessionManager, 100)
  testSplitWorkSinceStart(sessionManager, 4353.603332462535)
  testSplitCaloriesSinceStart(sessionManager, 6.202787432133093)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)
  testSplitNumberOfStrokes(sessionManager, 9)
  testSplitMinimumPace(sessionManager, 124.84188607444194)
  testSplitAveragePace(sessionManager, 123.68719607143008)
  testSplitMaximumPace(sessionManager, 123.2415163916658)
  testSplitMinimumLinearVelocity(sessionManager, 4.005066053726993)
  testSplitAverageLinearVelocity(sessionManager, 4.042455612877238)
  testSplitMaximumLinearVelocity(sessionManager, 4.0570743905080064)
  testSplitMinimumPower(sessionManager, 179.88177956899153)
  testSplitAveragePower(sessionManager, 183.7756302352862)
  testSplitMaximumPower(sessionManager, 186.98167445385002)
  testSplitMinimumStrokedistance(sessionManager, 10.206559417946657)
  testSplitAverageStrokedistance(sessionManager, 10.301192730215913)
  testSplitMaximumStrokedistance(sessionManager, 10.427050626616515)
  testSplitMinimumStrokerate(sessionManager, 23.20711050394371)
  testSplitAverageStrokerate(sessionManager, 23.496556552618888)
  testSplitMaximumStrokerate(sessionManager, 23.725763391265964)
  testSplitMinimumDragfactor(sessionManager, 123.11994765671123)
  testSplitAverageDragfactor(sessionManager, 123.31281478300096)
  testSplitMaximumDragfactor(sessionManager, 123.45997545234641)
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
    userSettings: {
      sex: 'male'
    },
    rowerSettings: rowerProfile
  }

  const sessionManager = createSessionManager(testConfig)

  testSessionType(sessionManager, 'justrow')
  testIntervalType(sessionManager, 'justrow')
  testSplitType(sessionManager, 'justrow')

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'distance',
    targetDistance: 190,
    split: {
      type: 'distance',
      targetDistance: 85
    }
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testSessionType(sessionManager, 'distance')
  testSessionDistanceTarget(sessionManager, 190)
  testIntervalType(sessionManager, 'distance')
  testIntervalDistanceTarget(sessionManager, 190)
  testSplitType(sessionManager, 'distance')
  testSplitDistanceTarget(sessionManager, 85)

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/Oartec_Slider.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, false)
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 54.977195480302356)
  testTotalLinearDistance(sessionManager, 190.05153764993952)
  testTotalWork(sessionManager, 7140.670099435771)
  testTotalCalories(sessionManager, 11.382071146630693)
  testTotalCaloriesPerMinute(sessionManager, 13.934098177873182)
  testTotalCaloriesPerHour (sessionManager, 836.0458906723909)
  testTotalNumberOfStrokes(sessionManager, 13)
  testStrokeState(sessionManager, 'Stopped')
  testStrokeWork(sessionManager, undefined)
  testStrokeCalories(sessionManager, undefined)
  testCycleDistance(sessionManager, undefined)
  testCycleStrokeRate(sessionManager, undefined)
  testCycleDuration(sessionManager, undefined)
  testCycleLinearVelocity(sessionManager, undefined)
  testCyclePace(sessionManager, Infinity)
  testCyclePower(sessionManager, undefined)
  testDriveLastStartTime (sessionManager, 44.9507183497444)
  testDriveDuration(sessionManager, undefined)
  testDriveLength(sessionManager, undefined)
  testDriveDistance(sessionManager, undefined)
  testDriveAverageHandleForce(sessionManager, undefined)
  testDrivePeakHandleForce(sessionManager, undefined)
  testRecoveryDuration(sessionManager, undefined)
  testDragFactor(sessionManager, 171.65666790675232)

  // Test session metrics
  testSessionType(sessionManager, 'distance')
  testSessionState(sessionManager, 'Stopped')
  testSessionTime(sessionManager, 54.977195480302356)
  testSessionMovingTimeTarget(sessionManager, undefined)
  testSessionMovingTimeToEnd(sessionManager, undefined)
  testSessionMovingTimeProjectedEnd(sessionManager, 54.957992672672596)
  testSessionTimeSpentTotal(sessionManager, 54.977195480302356)
  testSessionTimeSpentMoving(sessionManager, 54.977195480302356)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 190.05153764993952)
  testSessionDistanceToEnd(sessionManager, -0.051537649939518815)
  testSessionDistanceTarget(sessionManager, 190)
  testSessionDistanceProjectedEnd(sessionManager, 190)
  testSessionWorkSinceStart(sessionManager, 7140.670099435771)
  testSessionCaloriesSinceStart(sessionManager, 11.382071146630693)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 13)
  testSessionMinimumPace(sessionManager, 173.9443854055811)
  testSessionAveragePace(sessionManager, 144.6375971489538)
  testSessionMaximumPace(sessionManager, 130.18330972516975)
  testSessionMinimumLinearVelocity(sessionManager, 2.8744819721209423)
  testSessionAverageLinearVelocity(sessionManager, 3.4569158355491707)
  testSessionMaximumLinearVelocity(sessionManager, 3.840738118085575)
  testSessionMinimumPower(sessionManager, 66.50232040715504)
  testSessionAveragePower(sessionManager, 137.28524561571436)
  testSessionMaximumPower(sessionManager, 158.63917245072105)
  testSessionMinimumStrokedistance(sessionManager, 9.976113710936815)
  testSessionAverageStrokedistance(sessionManager, 12.666224909593485)
  testSessionMaximumStrokedistance(sessionManager, 13.500348187012701)
  testSessionMinimumStrokerate(sessionManager, 16.873797116170685)
  testSessionAverageStrokerate(sessionManager, 17.261321624223008)
  testSessionMaximumStrokerate(sessionManager, 17.69470146563009)
  testSessionMinimumDragfactor(sessionManager, 171.1367791084345)
  testSessionAverageDragfactor(sessionManager, 172.6199488651739)
  testSessionMaximumDragfactor(sessionManager, 175.906384020954)
  testSessionNumberOfIntervals(sessionManager, 1)

  // Test interval metrics
  testIntervalNumber(sessionManager, 0)
  testIntervalWorkoutStepNumber(sessionManager, 0)
  testIntervalType(sessionManager, 'distance')
  testIntervalTime(sessionManager, 54.977195480302356)
  testIntervalMovingTimeTarget(sessionManager, undefined)
  testIntervalMovingTimeToEnd(sessionManager, undefined)
  testIntervalMovingTimeProjectedEnd(sessionManager, 54.957992672672596)
  testIntervalTimeSpentTotal(sessionManager, 54.977195480302356)
  testIntervalTimeSpentMoving(sessionManager, 54.977195480302356)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 190.05153764993952)
  testIntervalDistanceToEnd(sessionManager, -0.051537649939518815)
  testIntervalDistanceTarget(sessionManager, 190)
  testIntervalDistanceProjectedEnd(sessionManager, 190)
  testIntervalWorkSinceStart(sessionManager, 7140.670099435771)
  testIntervalCaloriesSinceStart(sessionManager, 11.382071146630693)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 13)
  testIntervalMinimumPace(sessionManager, 173.9443854055811)
  testIntervalAveragePace(sessionManager, 144.6375971489538)
  testIntervalMaximumPace(sessionManager, 130.18330972516975)
  testIntervalMinimumLinearVelocity(sessionManager, 2.8744819721209423)
  testIntervalAverageLinearVelocity(sessionManager, 3.4569158355491707)
  testIntervalMaximumLinearVelocity(sessionManager, 3.840738118085575)
  testIntervalMinimumPower(sessionManager, 66.50232040715504)
  testIntervalAveragePower(sessionManager, 137.28524561571436)
  testIntervalMaximumPower(sessionManager, 158.63917245072105)
  testIntervalMinimumStrokedistance(sessionManager, 9.976113710936815)
  testIntervalAverageStrokedistance(sessionManager, 12.666224909593485)
  testIntervalMaximumStrokedistance(sessionManager, 13.500348187012701)
  testIntervalMinimumStrokerate(sessionManager, 16.873797116170685)
  testIntervalAverageStrokerate(sessionManager, 17.261321624223008)
  testIntervalMaximumStrokerate(sessionManager, 17.69470146563009)
  testIntervalMinimumDragfactor(sessionManager, 171.1367791084345)
  testIntervalAverageDragfactor(sessionManager, 172.6199488651739)
  testIntervalMaximumDragfactor(sessionManager, 175.906384020954)

  // Test split metrics
  testSplitNumber(sessionManager, 2)
  testSplitType(sessionManager, 'distance')
  testSplitTime(sessionManager, 8.0007716125439)
  testSplitMovingTimeTarget(sessionManager, undefined)
  testSplitMovingTimeToEnd(sessionManager, undefined)
  testSplitMovingTimeProjectedEnd(sessionManager, 32.200416528712395)
  testSplitTimeSpentTotal(sessionManager, 8.0007716125439)
  testSplitTimeSpentMoving(sessionManager, 8.0007716125439)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 20.05153764993952)
  testSplitDistanceToEnd(sessionManager, 64.94846235006048)
  testSplitDistanceTarget(sessionManager, 85)
  testSplitDistanceProjectedEnd(sessionManager, 85)
  testSplitWorkSinceStart(sessionManager, 0) // ToDo: explain this
  testSplitCaloriesSinceStart(sessionManager, 0.6667309677119935)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)
  testSplitNumberOfStrokes(sessionManager, 0)
  testSplitMinimumPace(sessionManager, 131.9999805439805)
  testSplitAveragePace(sessionManager, 199.50518888430565) // ToDo: explain this
  testSplitMaximumPace(sessionManager, 131.9999805439805)
  testSplitMinimumLinearVelocity(sessionManager, 3.787879346189806)
  testSplitAverageLinearVelocity(sessionManager, 2.5062004792765227)
  testSplitMaximumLinearVelocity(sessionManager, 3.787879346189806)
  testSplitMinimumPower(sessionManager, 152.1766130323092)
  testSplitAveragePower(sessionManager, 152.1766130323092)
  testSplitMaximumPower(sessionManager, 152.1766130323092)
  testSplitMinimumStrokedistance(sessionManager, 13.295419847178342)
  testSplitAverageStrokedistance(sessionManager, 13.295419847178342)
  testSplitMaximumStrokedistance(sessionManager, 13.295419847178342)
  testSplitMinimumStrokerate(sessionManager, 17.093502438589454)
  testSplitAverageStrokerate(sessionManager, 17.093502438589454)
  testSplitMaximumStrokerate(sessionManager, 17.093502438589454)
  testSplitMinimumDragfactor(sessionManager, 171.65666790675232)
  testSplitAverageDragfactor(sessionManager, 171.65666790675232)
  testSplitMaximumDragfactor(sessionManager, 171.65666790675232)
})

/**
 * @description Test against the Schwinn Windrigger
 * Additionally tests the calorie split
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/discussions/159|this discussion}
 */
test('Schwinn_Wndrggr_01: Data for the Schwinn Windrigger should produce plausible results for 120 seconds run', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Schwinn_Windrigger)
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

  const sessionManager = createSessionManager(testConfig)

  testSessionType(sessionManager, 'justrow')
  testIntervalType(sessionManager, 'justrow')
  testSplitType(sessionManager, 'justrow')

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'time',
    targetTime: 120,
    split: {
      type: 'calories',
      targetCalories: 3.14
    }
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testSessionType(sessionManager, 'time')
  testSessionMovingTimeTarget(sessionManager, 120)
  testIntervalType(sessionManager, 'time')
  testIntervalMovingTimeTarget(sessionManager, 120)
  testSplitType(sessionManager, 'calories')
  testSplitCaloriesTarget(sessionManager, 3.14)

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/Schwinn_Windrigger.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, false)
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 120.01874599999996)
  testTotalLinearDistance(sessionManager, 431.23010439799225)
  testTotalWork(sessionManager, 18455.110628084884)
  testTotalCalories(sessionManager, 27.577858002937983)
  testTotalCaloriesPerMinute(sessionManager, 14.955024168523664)
  testTotalCaloriesPerHour (sessionManager, 897.30145011142)
  testTotalNumberOfStrokes(sessionManager, 46)
  testStrokeState(sessionManager, 'Stopped')
  testStrokeWork(sessionManager, undefined)
  testStrokeCalories(sessionManager, undefined)
  testCycleDistance(sessionManager, undefined)
  testCycleStrokeRate(sessionManager, undefined)
  testCycleDuration(sessionManager, undefined)
  testCycleLinearVelocity(sessionManager, undefined)
  testCyclePace(sessionManager, Infinity)
  testCyclePower(sessionManager, undefined)
  testDriveLastStartTime (sessionManager, 111.44649600000002)
  testDriveDuration(sessionManager, undefined)
  testDriveLength(sessionManager, undefined)
  testDriveDistance(sessionManager, undefined)
  testDriveAverageHandleForce(sessionManager, undefined)
  testDrivePeakHandleForce(sessionManager, undefined)
  testRecoveryDuration(sessionManager, undefined)
  testDragFactor(sessionManager, 229.67514256584752)

  // Test session metrics
  testSessionType(sessionManager, 'time')
  testSessionState(sessionManager, 'Stopped')
  testSessionTime(sessionManager, 120.01874599999996)
  testSessionMovingTimeTarget(sessionManager, 120)
  testSessionMovingTimeToEnd(sessionManager, -0.018745999999964624)
  testSessionMovingTimeProjectedEnd(sessionManager, 120)
  testSessionTimeSpentTotal(sessionManager, 120.01874599999996)
  testSessionTimeSpentMoving(sessionManager, 120.01874599999996)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 431.23010439799225)
  testSessionDistanceToEnd(sessionManager, undefined)
  testSessionDistanceTarget(sessionManager, undefined)
  testSessionDistanceProjectedEnd(sessionManager, 431.19392247166047)
  testSessionWorkSinceStart(sessionManager, 18455.110628084884)
  testSessionCaloriesSinceStart(sessionManager, 27.577858002937983)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 46)
  testSessionMinimumPace(sessionManager, 186.17656608397135)
  testSessionAveragePace(sessionManager, 139.15858931920937)
  testSessionMaximumPace(sessionManager, 113.2497408547144)
  testSessionMinimumLinearVelocity(sessionManager, 2.685622635098365)
  testSessionAverageLinearVelocity(sessionManager, 3.593022913253838)
  testSessionMaximumLinearVelocity(sessionManager, 4.415021140237654)
  testSessionMinimumPower(sessionManager, 54.32601467750247)
  testSessionAveragePower(sessionManager, 163.15761770457485)
  testSessionMaximumPower(sessionManager, 240.96768506129658)
  testSessionMinimumStrokedistance(sessionManager, 6.499008533910098)
  testSessionAverageStrokedistance(sessionManager, 8.83875618371168)
  testSessionMaximumStrokedistance(sessionManager, 16.069668808959207)
  testSessionMinimumStrokerate(sessionManager, 10.96166204373795)
  testSessionAverageStrokerate(sessionManager, 26.187946271820365)
  testSessionMaximumStrokerate(sessionManager, 28.94477481688812)
  testSessionMinimumDragfactor(sessionManager, 210.65756253850174)
  testSessionAverageDragfactor(sessionManager, 217.44483049749743)
  testSessionMaximumDragfactor(sessionManager, 231.73602571367536)
  testSessionNumberOfIntervals(sessionManager, 1)

  // Test interval metrics
  testIntervalNumber(sessionManager, 0)
  testIntervalWorkoutStepNumber(sessionManager, 0)
  testIntervalType(sessionManager, 'time')
  testIntervalTime(sessionManager, 120.01874599999996)
  testIntervalMovingTimeTarget(sessionManager, 120)
  testIntervalMovingTimeToEnd(sessionManager, -0.018745999999964624)
  testIntervalMovingTimeProjectedEnd(sessionManager, 120)
  testIntervalTimeSpentTotal(sessionManager, 120.01874599999996)
  testIntervalTimeSpentMoving(sessionManager, 120.01874599999996)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 431.23010439799225)
  testIntervalDistanceToEnd(sessionManager, undefined)
  testIntervalDistanceTarget(sessionManager, undefined)
  testIntervalDistanceProjectedEnd(sessionManager, 431.19392247166047)
  testIntervalWorkSinceStart(sessionManager, 18455.110628084884)
  testIntervalCaloriesSinceStart(sessionManager, 27.577858002937983)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 46)
  testIntervalMinimumPace(sessionManager, 186.17656608397135)
  testIntervalAveragePace(sessionManager, 139.15858931920937)
  testIntervalMaximumPace(sessionManager, 113.2497408547144)
  testIntervalMinimumLinearVelocity(sessionManager, 2.685622635098365)
  testIntervalAverageLinearVelocity(sessionManager, 3.593022913253838)
  testIntervalMaximumLinearVelocity(sessionManager, 4.415021140237654)
  testIntervalMinimumPower(sessionManager, 54.32601467750247)
  testIntervalAveragePower(sessionManager, 163.15761770457485)
  testIntervalMaximumPower(sessionManager, 240.96768506129658)
  testIntervalMinimumStrokedistance(sessionManager, 6.499008533910098)
  testIntervalAverageStrokedistance(sessionManager, 8.83875618371168)
  testIntervalMaximumStrokedistance(sessionManager, 16.069668808959207)
  testIntervalMinimumStrokerate(sessionManager, 10.96166204373795)
  testIntervalAverageStrokerate(sessionManager, 26.187946271820365)
  testIntervalMaximumStrokerate(sessionManager, 28.94477481688812)
  testIntervalMinimumDragfactor(sessionManager, 210.65756253850174)
  testIntervalAverageDragfactor(sessionManager, 217.44483049749743)
  testIntervalMaximumDragfactor(sessionManager, 231.73602571367536)

  // Test split metrics
  testSplitNumber(sessionManager, 8)
  testSplitType(sessionManager, 'calories')
  testSplitTime(sessionManager, 18.751774983553844)
  testSplitMovingTimeTarget(sessionManager, undefined)
  testSplitMovingTimeToEnd(sessionManager, undefined)
  testSplitMovingTimeProjectedEnd(sessionManager, 26.93747894829525)
  testSplitTimeSpentTotal(sessionManager, 18.751774983553844)
  testSplitTimeSpentMoving(sessionManager, 18.751774983553844)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 47.17359551527596)
  testSplitDistanceToEnd(sessionManager, undefined)
  testSplitDistanceTarget(sessionManager, undefined)
  testSplitDistanceProjectedEnd(sessionManager, 62.972941393292615)
  testSplitWorkSinceStart(sessionManager, 939.9705920239176)
  testSplitCaloriesSinceStart(sessionManager, 2.457858002937982)
  testSplitCaloriesTarget(sessionManager, 3.14)
  testSplitCaloriesToEnd(sessionManager, 0.6821419970620184)
  testSplitNumberOfStrokes(sessionManager, 5)
  testSplitMinimumPace(sessionManager, 186.17656608397135)
  testSplitAveragePace(sessionManager, 198.75286989181862) // ToDo: Find out why this isn't between Min and Max pace
  testSplitMaximumPace(sessionManager, 167.24919852117975)
  testSplitMinimumLinearVelocity(sessionManager, 2.685622635098365)
  testSplitAverageLinearVelocity(sessionManager, 2.515686944657204) // ToDo: Find out why this isn't between Min and Max velocity
  testSplitMaximumLinearVelocity(sessionManager, 2.989550948052418)
  testSplitMinimumPower(sessionManager, 54.32601467750247)
  testSplitAveragePower(sessionManager, 68.72151923315722)
  testSplitMaximumPower(sessionManager, 74.81312047512183)
  testSplitMinimumStrokedistance(sessionManager, 6.499008533910098)
  testSplitAverageStrokedistance(sessionManager, 7.587165390577207)
  testSplitMaximumStrokedistance(sessionManager, 11.150696968157495)
  testSplitMinimumStrokerate(sessionManager, 14.862162729535287)
  testSplitAverageStrokerate(sessionManager, 23.379319186588383)
  testSplitMaximumStrokerate(sessionManager, 24.818001323626664)
  testSplitMinimumDragfactor(sessionManager, 225.50332469798812)
  testSplitAverageDragfactor(sessionManager, 229.3535354525803)
  testSplitMaximumDragfactor(sessionManager, 231.73602571367536)
})

/**
 * @description Test behaviour for the Sportstech WRX700 in a 'Just Row' session
 */
test('Sportstech_WRX700_01: sample data for Sportstech WRX700 should produce plausible results for a short unlimited run', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700)
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
  const sessionManager = createSessionManager(testConfig)

  testSessionType(sessionManager, 'justrow')
  testIntervalType(sessionManager, 'justrow')
  testSplitType(sessionManager, 'justrow')

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, true) // The recording stops abrubtly, and SessionManager's watchdog hasn't kicked in yet
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 46.302522627)
  testTotalLinearDistance(sessionManager, 165.58832475070278)
  testTotalWork(sessionManager, 9748.548017262458)
  testTotalCalories(sessionManager, 13.142874997261865)
  testTotalCaloriesPerMinute(sessionManager, 16.06317491735509)
  testTotalCaloriesPerHour (sessionManager, 963.7904950413053)
  testTotalNumberOfStrokes(sessionManager, 15)
  testStrokeState(sessionManager, 'Recovery')
  testStrokeWork(sessionManager, 763.0876311342454)
  testStrokeCalories(sessionManager, 0.9544143736814243)
  testCycleDistance(sessionManager, 10.968457408700388)
  testCycleStrokeRate(sessionManager, 21.96216589358063)
  testCycleDuration(sessionManager, 2.731970985500002)
  testCycleLinearVelocity(sessionManager, 4.015620240977591)
  testCyclePace(sessionManager, 124.51376624156981)
  testCyclePower(sessionManager, 181.32184485208828)
  testDriveLastStartTime (sessionManager, 42.953401899000006)
  testDriveDuration(sessionManager, 1.297822779999997)
  testDriveLength(sessionManager, 1.7592918860102864)
  testDriveDistance(sessionManager, 5.661139307716341)
  testDriveAverageHandleForce(sessionManager, 347.2288656270118)
  testDrivePeakHandleForce(sessionManager, 634.0186435697934)
  testRecoveryDuration(sessionManager, 1.332040928000005)
  testDragFactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)

  // Test session metrics
  testSessionType(sessionManager, 'justrow')
  testSessionState(sessionManager, 'Rowing')
  testSessionTime(sessionManager, 46.302522627)
  testSessionMovingTimeTarget(sessionManager, undefined)
  testSessionMovingTimeToEnd(sessionManager, undefined)
  testSessionMovingTimeProjectedEnd(sessionManager, undefined)
  testSessionTimeSpentTotal(sessionManager, 46.302522627)
  testSessionTimeSpentMoving(sessionManager, 46.302522627)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 165.58832475070278)
  testSessionDistanceToEnd(sessionManager, undefined)
  testSessionDistanceTarget(sessionManager, undefined)
  testSessionDistanceProjectedEnd(sessionManager, undefined)
  testSessionWorkSinceStart(sessionManager, 9748.548017262458)
  testSessionCaloriesSinceStart(sessionManager, 13.142874997261865)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 15)
  testSessionMinimumPace(sessionManager, 180.24261586109614)
  testSessionAveragePace(sessionManager, 139.81215975434733)
  testSessionMaximumPace(sessionManager, 115.80722039956261)
  testSessionMinimumLinearVelocity(sessionManager, 2.7740387455612865)
  testSessionAverageLinearVelocity(sessionManager, 3.5762268523604077)
  testSessionMaximumLinearVelocity(sessionManager, 4.317520084454841)
  testSessionMinimumPower(sessionManager, 59.79167863880113)
  testSessionAveragePower(sessionManager, 141.54132092961044)
  testSessionMaximumPower(sessionManager, 225.37999917458814)
  testSessionMinimumStrokedistance(sessionManager, 8.491708961574506)
  testSessionAverageStrokedistance(sessionManager, 10.370621576635525)
  testSessionMaximumStrokedistance(sessionManager, 11.32227861543267)
  testSessionMinimumStrokerate(sessionManager, 17.11018345586753)
  testSessionAverageStrokerate(sessionManager, 20.973328465999273)
  testSessionMaximumStrokerate(sessionManager, 23.947414069812904)
  testSessionMinimumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSessionAverageDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSessionMaximumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSessionNumberOfIntervals(sessionManager, 1)

  // Test interval metrics
  testIntervalNumber(sessionManager, 0)
  testIntervalWorkoutStepNumber(sessionManager, 0)
  testIntervalType(sessionManager, 'justrow')
  testIntervalTime(sessionManager, 46.302522627)
  testIntervalMovingTimeTarget(sessionManager, undefined)
  testIntervalMovingTimeToEnd(sessionManager, undefined)
  testIntervalMovingTimeProjectedEnd(sessionManager, undefined)
  testIntervalTimeSpentTotal(sessionManager, 46.302522627)
  testIntervalTimeSpentMoving(sessionManager, 46.302522627)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 165.58832475070278)
  testIntervalDistanceToEnd(sessionManager, undefined)
  testIntervalDistanceTarget(sessionManager, undefined)
  testIntervalDistanceProjectedEnd(sessionManager, undefined)
  testIntervalWorkSinceStart(sessionManager, 9748.548017262458)
  testIntervalCaloriesSinceStart(sessionManager, 13.142874997261865)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 15)
  testIntervalMinimumPace(sessionManager, 180.24261586109614)
  testIntervalAveragePace(sessionManager, 139.81215975434733)
  testIntervalMaximumPace(sessionManager, 115.80722039956261)
  testIntervalMinimumLinearVelocity(sessionManager, 2.7740387455612865)
  testIntervalAverageLinearVelocity(sessionManager, 3.5762268523604077)
  testIntervalMaximumLinearVelocity(sessionManager, 4.317520084454841)
  testIntervalMinimumPower(sessionManager, 59.79167863880113)
  testIntervalAveragePower(sessionManager, 141.54132092961044)
  testIntervalMaximumPower(sessionManager, 225.37999917458814)
  testIntervalMinimumStrokedistance(sessionManager, 8.491708961574506)
  testIntervalAverageStrokedistance(sessionManager, 10.370621576635525)
  testIntervalMaximumStrokedistance(sessionManager, 11.32227861543267)
  testIntervalMinimumStrokerate(sessionManager, 17.11018345586753)
  testIntervalAverageStrokerate(sessionManager, 20.973328465999273)
  testIntervalMaximumStrokerate(sessionManager, 23.947414069812904)
  testIntervalMinimumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testIntervalAverageDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testIntervalMaximumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)

  // Test split metrics
  testSplitNumber(sessionManager, 0)
  testSplitType(sessionManager, 'justrow')
  testSplitTime(sessionManager, 46.302522627)
  testSplitMovingTimeTarget(sessionManager, undefined)
  testSplitMovingTimeToEnd(sessionManager, undefined)
  testSplitMovingTimeProjectedEnd(sessionManager, undefined)
  testSplitTimeSpentTotal(sessionManager, 46.302522627)
  testSplitTimeSpentMoving(sessionManager, 46.302522627)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 165.58832475070278)
  testSplitDistanceToEnd(sessionManager, undefined)
  testSplitDistanceTarget(sessionManager, undefined)
  testSplitDistanceProjectedEnd(sessionManager, undefined)
  testSplitWorkSinceStart(sessionManager, 9748.548017262458)
  testSplitCaloriesSinceStart(sessionManager, 13.142874997261865)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)
  testSplitNumberOfStrokes(sessionManager, 15)
  testSplitMinimumPace(sessionManager, 180.24261586109614)
  testSplitAveragePace(sessionManager, 139.81215975434733)
  testSplitMaximumPace(sessionManager, 115.80722039956261)
  testSplitMinimumLinearVelocity(sessionManager, 2.7740387455612865)
  testSplitAverageLinearVelocity(sessionManager, 3.5762268523604077)
  testSplitMaximumLinearVelocity(sessionManager, 4.317520084454841)
  testSplitMinimumPower(sessionManager, 59.79167863880113)
  testSplitAveragePower(sessionManager, 141.54132092961044)
  testSplitMaximumPower(sessionManager, 225.37999917458814)
  testSplitMinimumStrokedistance(sessionManager, 8.491708961574506)
  testSplitAverageStrokedistance(sessionManager, 10.370621576635525)
  testSplitMaximumStrokedistance(sessionManager, 11.32227861543267)
  testSplitMinimumStrokerate(sessionManager, 17.11018345586753)
  testSplitAverageStrokerate(sessionManager, 20.973328465999273)
  testSplitMaximumStrokerate(sessionManager, 23.947414069812904)
  testSplitMinimumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSplitAverageDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSplitMaximumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
})

/**
 * @description Test behaviour for the Sportstech WRX700 in a single interval session with a Distance target
 */
test('Sportstech_WRX700_02: sample data for Sportstech WRX700 should produce plausible results for a 150 meter session, with sessionManager reset', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700)
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
  const sessionManager = createSessionManager(testConfig)

  testSessionType(sessionManager, 'justrow')
  testIntervalType(sessionManager, 'justrow')
  testSplitType(sessionManager, 'justrow')

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'distance',
    targetDistance: 100
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testSessionType(sessionManager, 'distance')
  testSessionDistanceTarget(sessionManager, 100)
  testIntervalType(sessionManager, 'distance')
  testIntervalDistanceTarget(sessionManager, 100)
  testSplitType(sessionManager, 'distance')
  testSplitDistanceTarget(sessionManager, 100)

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  sessionManager.handleCommand('reset')

  testSessionType(sessionManager, 'justrow')
  testIntervalType(sessionManager, 'justrow')
  testSplitType(sessionManager, 'justrow')

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  intervalSettings[0] = {
    type: 'distance',
    targetDistance: 165
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testSessionType(sessionManager, 'distance')
  testSessionDistanceTarget(sessionManager, 165)
  testIntervalType(sessionManager, 'distance')
  testIntervalDistanceTarget(sessionManager, 165)
  testSplitType(sessionManager, 'distance')
  testSplitDistanceTarget(sessionManager, 165)

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, true) // The recording stops abrubtly, and SessionManager's watchdog hasn't kicked in yet
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 46.302522627)
  testTotalLinearDistance(sessionManager, 165.58832475070278)
  testTotalWork(sessionManager, 9748.548017262458)
  testTotalCalories(sessionManager, 13.142874997261865)
  testTotalCaloriesPerMinute(sessionManager, 16.06317491735509)
  testTotalCaloriesPerHour (sessionManager, 963.7904950413053)
  testTotalNumberOfStrokes(sessionManager, 15)
  testStrokeState(sessionManager, 'Recovery')
  testStrokeWork(sessionManager, 763.0876311342454)
  testStrokeCalories(sessionManager, 0.9544143736814243)
  testCycleDistance(sessionManager, 10.968457408700388)
  testCycleStrokeRate(sessionManager, 21.96216589358063)
  testCycleDuration(sessionManager, 2.731970985500002)
  testCycleLinearVelocity(sessionManager, 4.015620240977591)
  testCyclePace(sessionManager, 124.51376624156981)
  testCyclePower(sessionManager, 181.32184485208828)
  testDriveLastStartTime (sessionManager, 42.953401899000006)
  testDriveDuration(sessionManager, 1.297822779999997)
  testDriveLength(sessionManager, 1.7592918860102864)
  testDriveDistance(sessionManager, 5.661139307716341)
  testDriveAverageHandleForce(sessionManager, 347.2288656270118)
  testDrivePeakHandleForce(sessionManager, 634.0186435697934)
  testRecoveryDuration(sessionManager, 1.332040928000005)
  testDragFactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)

  // Test session metrics
  testSessionType(sessionManager, 'distance')
  testSessionState(sessionManager, 'Stopped')
  testSessionTime(sessionManager, 46.302522627)
  testSessionMovingTimeTarget(sessionManager, undefined)
  testSessionMovingTimeToEnd(sessionManager, undefined)
  testSessionMovingTimeProjectedEnd(sessionManager, 46.11303122869046)
  testSessionTimeSpentTotal(sessionManager, 46.302522627)
  testSessionTimeSpentMoving(sessionManager, 46.302522627)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 165.58832475070278)
  testSessionDistanceToEnd(sessionManager, -0.5883247507027818) // This is a testing artifact
  testSessionDistanceTarget(sessionManager, 165)
  testSessionDistanceProjectedEnd(sessionManager, 165)
  testSessionWorkSinceStart(sessionManager, 9748.548017262458)
  testSessionCaloriesSinceStart(sessionManager, 13.142874997261865)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 15)
  testSessionMinimumPace(sessionManager, 180.24261586109614)
  testSessionAveragePace(sessionManager, 139.81215975434733)
  testSessionMaximumPace(sessionManager, 115.80722039956261)
  testSessionMinimumLinearVelocity(sessionManager, 2.7740387455612865)
  testSessionAverageLinearVelocity(sessionManager, 3.5762268523604077)
  testSessionMaximumLinearVelocity(sessionManager, 4.317520084454841)
  testSessionMinimumPower(sessionManager, 59.79167863880113)
  testSessionAveragePower(sessionManager, 142.86733839369302)
  testSessionMaximumPower(sessionManager, 225.37999917458814)
  testSessionMinimumStrokedistance(sessionManager, 8.491708961574506)
  testSessionAverageStrokedistance(sessionManager, 10.390549437704353)
  testSessionMaximumStrokedistance(sessionManager, 11.32227861543267)
  testSessionMinimumStrokerate(sessionManager, 17.11018345586753)
  testSessionAverageStrokerate(sessionManager, 21.006289713585318)
  testSessionMaximumStrokerate(sessionManager, 23.947414069812904)
  testSessionMinimumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSessionAverageDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSessionMaximumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSessionNumberOfIntervals(sessionManager, 1)

  // Test interval metrics
  testIntervalNumber(sessionManager, 0)
  testIntervalWorkoutStepNumber(sessionManager, 0)
  testIntervalType(sessionManager, 'distance')
  testIntervalTime(sessionManager, 46.302522627)
  testIntervalMovingTimeTarget(sessionManager, undefined)
  testIntervalMovingTimeToEnd(sessionManager, undefined)
  testIntervalMovingTimeProjectedEnd(sessionManager, 46.11303122869046)
  testIntervalTimeSpentTotal(sessionManager, 46.302522627)
  testIntervalTimeSpentMoving(sessionManager, 46.302522627)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 165.58832475070278)
  testIntervalDistanceToEnd(sessionManager, -0.5883247507027818) // This is a testing artifact
  testIntervalDistanceTarget(sessionManager, 165)
  testIntervalDistanceProjectedEnd(sessionManager, 165)
  testIntervalWorkSinceStart(sessionManager, 9748.548017262458)
  testIntervalCaloriesSinceStart(sessionManager, 13.142874997261865)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 15)
  testIntervalMinimumPace(sessionManager, 180.24261586109614)
  testIntervalAveragePace(sessionManager, 139.81215975434733)
  testIntervalMaximumPace(sessionManager, 115.80722039956261)
  testIntervalMinimumLinearVelocity(sessionManager, 2.7740387455612865)
  testIntervalAverageLinearVelocity(sessionManager, 3.5762268523604077)
  testIntervalMaximumLinearVelocity(sessionManager, 4.317520084454841)
  testIntervalMinimumPower(sessionManager, 59.79167863880113)
  testIntervalAveragePower(sessionManager, 142.86733839369302)
  testIntervalMaximumPower(sessionManager, 225.37999917458814)
  testIntervalMinimumStrokedistance(sessionManager, 8.491708961574506)
  testIntervalAverageStrokedistance(sessionManager, 10.390549437704353)
  testIntervalMaximumStrokedistance(sessionManager, 11.32227861543267)
  testIntervalMinimumStrokerate(sessionManager, 17.11018345586753)
  testIntervalAverageStrokerate(sessionManager, 21.006289713585318)
  testIntervalMaximumStrokerate(sessionManager, 23.947414069812904)
  testIntervalMinimumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testIntervalAverageDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testIntervalMaximumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)

  // Test split metrics
  testSplitNumber(sessionManager, 0)
  testSplitType(sessionManager, 'distance')
  testSplitTime(sessionManager, 46.302522627)
  testSplitMovingTimeTarget(sessionManager, undefined)
  testSplitMovingTimeToEnd(sessionManager, undefined)
  testSplitMovingTimeProjectedEnd(sessionManager, 46.11303122869046)
  testSplitTimeSpentTotal(sessionManager, 46.302522627)
  testSplitTimeSpentMoving(sessionManager, 46.302522627)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 165.58832475070278)
  testSplitDistanceToEnd(sessionManager, -0.5883247507027818) // This is a testing artifact
  testSplitDistanceTarget(sessionManager, 165)
  testSplitDistanceProjectedEnd(sessionManager, 165)
  testSplitWorkSinceStart(sessionManager, 9748.548017262458)
  testSplitCaloriesSinceStart(sessionManager, 13.142874997261865)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)
  testSplitNumberOfStrokes(sessionManager, 15)
  testSplitMinimumPace(sessionManager, 180.24261586109614)
  testSplitAveragePace(sessionManager, 139.81215975434733)
  testSplitMaximumPace(sessionManager, 115.80722039956261)
  testSplitMinimumLinearVelocity(sessionManager, 2.7740387455612865)
  testSplitAverageLinearVelocity(sessionManager, 3.5762268523604077)
  testSplitMaximumLinearVelocity(sessionManager, 4.317520084454841)
  testSplitMinimumPower(sessionManager, 59.79167863880113)
  testSplitAveragePower(sessionManager, 142.86733839369302)
  testSplitMaximumPower(sessionManager, 225.37999917458814)
  testSplitMinimumStrokedistance(sessionManager, 8.491708961574506)
  testSplitAverageStrokedistance(sessionManager, 10.390549437704353)
  testSplitMaximumStrokedistance(sessionManager, 11.32227861543267)
  testSplitMinimumStrokerate(sessionManager, 17.11018345586753)
  testSplitAverageStrokerate(sessionManager, 21.006289713585318)
  testSplitMaximumStrokerate(sessionManager, 23.947414069812904)
  testSplitMinimumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSplitAverageDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSplitMaximumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
})

/**
 * @description Test behaviour for the Sportstech WRX700 in a single interval session with overwriting a distance session with a Time interval
 */
test('Sportstech_WRX700_03: sample data for Sportstech WRX700 should produce plausible results for a 46 seconds session after a interval overwrite', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700)
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
  const sessionManager = createSessionManager(testConfig)

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'distance',
    targetDistance: 100
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testSessionType(sessionManager, 'distance')
  testSessionDistanceTarget(sessionManager, 100)
  testIntervalType(sessionManager, 'distance')
  testIntervalDistanceTarget(sessionManager, 100)
  testSplitType(sessionManager, 'distance')
  testSplitDistanceTarget(sessionManager, 100)

  // overwrite the interval settings
  intervalSettings[0] = {
    type: 'time',
    targetTime: 46
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testSessionType(sessionManager, 'time')
  testSessionMovingTimeTarget(sessionManager, 46)
  testIntervalType(sessionManager, 'time')
  testIntervalMovingTimeTarget(sessionManager, 46)
  testSplitType(sessionManager, 'time')
  testSplitMovingTimeTarget(sessionManager, 46)

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, true) // The recording stops abrubtly, and SessionManager's watchdog hasn't kicked in yet
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 46.302522627)
  testTotalLinearDistance(sessionManager, 165.58832475070278)
  testTotalWork(sessionManager, 9748.548017262458)
  testTotalCalories(sessionManager, 13.142874997261865)
  testTotalCaloriesPerMinute(sessionManager, 16.06317491735509)
  testTotalCaloriesPerHour (sessionManager, 963.7904950413053)
  testTotalNumberOfStrokes(sessionManager, 15)
  testStrokeState(sessionManager, 'Recovery')
  testStrokeWork(sessionManager, 763.0876311342454)
  testStrokeCalories(sessionManager, 0.9544143736814243)
  testCycleDistance(sessionManager, 10.968457408700388)
  testCycleStrokeRate(sessionManager, 21.96216589358063)
  testCycleDuration(sessionManager, 2.731970985500002)
  testCycleLinearVelocity(sessionManager, 4.015620240977591)
  testCyclePace(sessionManager, 124.51376624156981)
  testCyclePower(sessionManager, 181.32184485208828)
  testDriveLastStartTime (sessionManager, 42.953401899000006)
  testDriveDuration(sessionManager, 1.297822779999997)
  testDriveLength(sessionManager, 1.7592918860102864)
  testDriveDistance(sessionManager, 5.661139307716341)
  testDriveAverageHandleForce(sessionManager, 347.2288656270118)
  testDrivePeakHandleForce(sessionManager, 634.0186435697934)
  testRecoveryDuration(sessionManager, 1.332040928000005)
  testDragFactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)

  // Test session metrics
  testSessionType(sessionManager, 'time')
  testSessionState(sessionManager, 'Stopped')
  testSessionTime(sessionManager, 46.302522627)
  testSessionMovingTimeTarget(sessionManager, 46)
  testSessionMovingTimeToEnd(sessionManager, -0.3025226270000019) // This is a testing artifact
  testSessionMovingTimeProjectedEnd(sessionManager, 46)
  testSessionTimeSpentTotal(sessionManager, 46.302522627)
  testSessionTimeSpentMoving(sessionManager, 46.302522627)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 165.58832475070278)
  testSessionDistanceToEnd(sessionManager, undefined)
  testSessionDistanceTarget(sessionManager, undefined)
  testSessionDistanceProjectedEnd(sessionManager, 164.6490654983064)
  testSessionWorkSinceStart(sessionManager, 9748.548017262458)
  testSessionCaloriesSinceStart(sessionManager, 13.142874997261865)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 15)
  testSessionMinimumPace(sessionManager, 180.24261586109614)
  testSessionAveragePace(sessionManager, 139.81215975434733)
  testSessionMaximumPace(sessionManager, 115.80722039956261)
  testSessionMinimumLinearVelocity(sessionManager, 2.7740387455612865)
  testSessionAverageLinearVelocity(sessionManager, 3.5762268523604077)
  testSessionMaximumLinearVelocity(sessionManager, 4.317520084454841)
  testSessionMinimumPower(sessionManager, 59.79167863880113)
  testSessionAveragePower(sessionManager, 142.86733839369302)
  testSessionMaximumPower(sessionManager, 225.37999917458814)
  testSessionMinimumStrokedistance(sessionManager, 8.491708961574506)
  testSessionAverageStrokedistance(sessionManager, 10.390549437704353)
  testSessionMaximumStrokedistance(sessionManager, 11.32227861543267)
  testSessionMinimumStrokerate(sessionManager, 17.11018345586753)
  testSessionAverageStrokerate(sessionManager, 21.006289713585318)
  testSessionMaximumStrokerate(sessionManager, 23.947414069812904)
  testSessionMinimumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSessionAverageDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSessionMaximumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSessionNumberOfIntervals(sessionManager, 1)

  // Test interval metrics
  testIntervalNumber(sessionManager, 0)
  testIntervalWorkoutStepNumber(sessionManager, 0)
  testIntervalType(sessionManager, 'time')
  testIntervalTime(sessionManager, 46.302522627)
  testIntervalMovingTimeTarget(sessionManager, 46)
  testIntervalMovingTimeToEnd(sessionManager, -0.3025226270000019) // This is a testing artifact
  testIntervalMovingTimeProjectedEnd(sessionManager, 46)
  testIntervalTimeSpentTotal(sessionManager, 46.302522627)
  testIntervalTimeSpentMoving(sessionManager, 46.302522627)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 165.58832475070278)
  testIntervalDistanceToEnd(sessionManager, undefined)
  testIntervalDistanceTarget(sessionManager, undefined)
  testIntervalDistanceProjectedEnd(sessionManager, 164.6490654983064)
  testIntervalWorkSinceStart(sessionManager, 9748.548017262458)
  testIntervalCaloriesSinceStart(sessionManager, 13.142874997261865)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 15)
  testIntervalMinimumPace(sessionManager, 180.24261586109614)
  testIntervalAveragePace(sessionManager, 139.81215975434733)
  testIntervalMaximumPace(sessionManager, 115.80722039956261)
  testIntervalMinimumLinearVelocity(sessionManager, 2.7740387455612865)
  testIntervalAverageLinearVelocity(sessionManager, 3.5762268523604077)
  testIntervalMaximumLinearVelocity(sessionManager, 4.317520084454841)
  testIntervalMinimumPower(sessionManager, 59.79167863880113)
  testIntervalAveragePower(sessionManager, 142.86733839369302)
  testIntervalMaximumPower(sessionManager, 225.37999917458814)
  testIntervalMinimumStrokedistance(sessionManager, 8.491708961574506)
  testIntervalAverageStrokedistance(sessionManager, 10.390549437704353)
  testIntervalMaximumStrokedistance(sessionManager, 11.32227861543267)
  testIntervalMinimumStrokerate(sessionManager, 17.11018345586753)
  testIntervalAverageStrokerate(sessionManager, 21.006289713585318)
  testIntervalMaximumStrokerate(sessionManager, 23.947414069812904)
  testIntervalMinimumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testIntervalAverageDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testIntervalMaximumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)

  // Test split metrics
  testSplitNumber(sessionManager, 0)
  testSplitType(sessionManager, 'time')
  testSplitTime(sessionManager, 46.302522627)
  testSplitMovingTimeTarget(sessionManager, 46)
  testSplitMovingTimeToEnd(sessionManager, -0.3025226270000019) // This is a testing artifact
  testSplitMovingTimeProjectedEnd(sessionManager, 46)
  testSplitTimeSpentTotal(sessionManager, 46.302522627)
  testSplitTimeSpentMoving(sessionManager, 46.302522627)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 165.58832475070278)
  testSplitDistanceToEnd(sessionManager, undefined)
  testSplitDistanceTarget(sessionManager, undefined)
  testSplitDistanceProjectedEnd(sessionManager, 164.6490654983064)
  testSplitWorkSinceStart(sessionManager, 9748.548017262458)
  testSplitCaloriesSinceStart(sessionManager, 13.142874997261865)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)
  testSplitNumberOfStrokes(sessionManager, 15)
  testSplitMinimumPace(sessionManager, 180.24261586109614)
  testSplitAveragePace(sessionManager, 139.81215975434733)
  testSplitMaximumPace(sessionManager, 115.80722039956261)
  testSplitMinimumLinearVelocity(sessionManager, 2.7740387455612865)
  testSplitAverageLinearVelocity(sessionManager, 3.5762268523604077)
  testSplitMaximumLinearVelocity(sessionManager, 4.317520084454841)
  testSplitMinimumPower(sessionManager, 59.79167863880113)
  testSplitAveragePower(sessionManager, 142.86733839369302)
  testSplitMaximumPower(sessionManager, 225.37999917458814)
  testSplitMinimumStrokedistance(sessionManager, 8.491708961574506)
  testSplitAverageStrokedistance(sessionManager, 10.390549437704353)
  testSplitMaximumStrokedistance(sessionManager, 11.32227861543267)
  testSplitMinimumStrokerate(sessionManager, 17.11018345586753)
  testSplitAverageStrokerate(sessionManager, 21.006289713585318)
  testSplitMaximumStrokerate(sessionManager, 23.947414069812904)
  testSplitMinimumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSplitAverageDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSplitMaximumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
})

/**
 * @description Test behaviour for the SportsTech WRX700 in a single interval session with a Calorie target after a complex intervallan
 */
test('Sportstech_WRX700_04: sample data for Sportstech WRX700 should produce plausible results for a 13.14 calories session', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700)
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
  const sessionManager = createSessionManager(testConfig)

  let intervalSettings = []
  intervalSettings[0] = {
    type: 'distance',
    targetDistance: 10,
    split: {
      type: 'distance',
      targetDistance: 5
    }
  }
  intervalSettings[1] = {
    type: 'distance',
    targetDistance: 30,
    split: {
      type: 'distance',
      targetDistance: 15
    }
  }
  intervalSettings[2] = {
    type: 'distance',
    targetDistance: 50,
    split: {
      type: 'distance',
      targetDistance: 25
    }
  }
  intervalSettings[3] = {
    type: 'distance',
    targetDistance: 70,
    split: {
      type: 'distance',
      targetDistance: 35
    }
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testSessionType(sessionManager, 'distance')
  testSessionDistanceTarget(sessionManager, 160)
  testIntervalType(sessionManager, 'distance')
  testIntervalDistanceTarget(sessionManager, 10)
  testSplitType(sessionManager, 'distance')
  testSplitDistanceTarget(sessionManager, 5)

  intervalSettings = []
  intervalSettings[0] = {
    type: 'calories',
    targetCalories: 13.14
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testSessionType(sessionManager, 'calories')
  testSessionCaloriesTarget(sessionManager, 13.14)
  testIntervalType(sessionManager, 'calories')
  testIntervalCaloriesTarget(sessionManager, 13.14)
  testSplitType(sessionManager, 'calories')
  testSplitCaloriesTarget(sessionManager, 13.14)

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, true)
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 46.302522627)
  testTotalLinearDistance(sessionManager, 165.58832475070278)
  testTotalWork(sessionManager, 9748.548017262458)
  testTotalCalories(sessionManager, 13.142874997261865)
  testTotalCaloriesPerMinute(sessionManager, 16.06317491735509)
  testTotalCaloriesPerHour (sessionManager, 963.7904950413053)
  testTotalNumberOfStrokes(sessionManager, 15)
  testStrokeState(sessionManager, 'Recovery')
  testStrokeWork(sessionManager, 763.0876311342454)
  testStrokeCalories(sessionManager, 0.9544143736814243)
  testCycleDistance(sessionManager, 10.968457408700388)
  testCycleStrokeRate(sessionManager, 21.96216589358063)
  testCycleDuration(sessionManager, 2.731970985500002)
  testCycleLinearVelocity(sessionManager, 4.015620240977591)
  testCyclePace(sessionManager, 124.51376624156981)
  testCyclePower(sessionManager, 181.32184485208828)
  testDriveLastStartTime (sessionManager, 42.953401899000006)
  testDriveDuration(sessionManager, 1.297822779999997)
  testDriveLength(sessionManager, 1.7592918860102864)
  testDriveDistance(sessionManager, 5.661139307716341)
  testDriveAverageHandleForce(sessionManager, 347.2288656270118)
  testDrivePeakHandleForce(sessionManager, 634.0186435697934)
  testRecoveryDuration(sessionManager, 1.332040928000005)
  testDragFactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)

  // Test session metrics
  testSessionType(sessionManager, 'calories')
  testSessionState(sessionManager, 'Stopped')
  testSessionTime(sessionManager, 46.302522627)
  testSessionMovingTimeTarget(sessionManager, undefined)
  testSessionMovingTimeToEnd(sessionManager, undefined)
  testSessionMovingTimeProjectedEnd(sessionManager, 46.26802265985762)
  testSessionTimeSpentTotal(sessionManager, 46.302522627)
  testSessionTimeSpentMoving(sessionManager, 46.302522627)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 165.58832475070278)
  testSessionDistanceToEnd(sessionManager, undefined)
  testSessionDistanceTarget(sessionManager, undefined)
  testSessionDistanceProjectedEnd(sessionManager, 165.48121073524186)
  testSessionWorkSinceStart(sessionManager, 9748.548017262458)
  testSessionCaloriesSinceStart(sessionManager, 13.142874997261865)
  testSessionCaloriesTarget(sessionManager, 13.14)
  testSessionCaloriesToEnd(sessionManager, -0.002874997261864465)
  testSessionNumberOfStrokes(sessionManager, 15)
  testSessionMinimumPace(sessionManager, 180.24261586109614)
  testSessionAveragePace(sessionManager, 139.81215975434733)
  testSessionMaximumPace(sessionManager, 115.80722039956261)
  testSessionMinimumLinearVelocity(sessionManager, 2.7740387455612865)
  testSessionAverageLinearVelocity(sessionManager, 3.5762268523604077)
  testSessionMaximumLinearVelocity(sessionManager, 4.317520084454841)
  testSessionMinimumPower(sessionManager, 59.79167863880113)
  testSessionAveragePower(sessionManager, 142.86733839369302)
  testSessionMaximumPower(sessionManager, 225.37999917458814)
  testSessionMinimumStrokedistance(sessionManager, 8.491708961574506)
  testSessionAverageStrokedistance(sessionManager, 10.390549437704353)
  testSessionMaximumStrokedistance(sessionManager, 11.32227861543267)
  testSessionMinimumStrokerate(sessionManager, 17.11018345586753)
  testSessionAverageStrokerate(sessionManager, 21.006289713585318)
  testSessionMaximumStrokerate(sessionManager, 23.947414069812904)
  testSessionMinimumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSessionAverageDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSessionMaximumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSessionNumberOfIntervals(sessionManager, 1)

  // Test interval metrics
  testIntervalNumber(sessionManager, 0)
  testIntervalWorkoutStepNumber(sessionManager, 0)
  testIntervalType(sessionManager, 'calories')
  testIntervalTime(sessionManager, 46.302522627)
  testIntervalMovingTimeTarget(sessionManager, undefined)
  testIntervalMovingTimeToEnd(sessionManager, undefined)
  testIntervalMovingTimeProjectedEnd(sessionManager, 46.26802265985762)
  testIntervalTimeSpentTotal(sessionManager, 46.302522627)
  testIntervalTimeSpentMoving(sessionManager, 46.302522627)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 165.58832475070278)
  testIntervalDistanceToEnd(sessionManager, undefined)
  testIntervalDistanceTarget(sessionManager, undefined)
  testIntervalDistanceProjectedEnd(sessionManager, 165.48121073524186)
  testIntervalWorkSinceStart(sessionManager, 9748.548017262458)
  testIntervalCaloriesSinceStart(sessionManager, 13.142874997261865)
  testIntervalCaloriesTarget(sessionManager, 13.14)
  testIntervalCaloriesToEnd(sessionManager, -0.002874997261864465)
  testIntervalNumberOfStrokes(sessionManager, 15)
  testIntervalMinimumPace(sessionManager, 180.24261586109614)
  testIntervalAveragePace(sessionManager, 139.81215975434733)
  testIntervalMaximumPace(sessionManager, 115.80722039956261)
  testIntervalMinimumLinearVelocity(sessionManager, 2.7740387455612865)
  testIntervalAverageLinearVelocity(sessionManager, 3.5762268523604077)
  testIntervalMaximumLinearVelocity(sessionManager, 4.317520084454841)
  testIntervalMinimumPower(sessionManager, 59.79167863880113)
  testIntervalAveragePower(sessionManager, 142.86733839369302)
  testIntervalMaximumPower(sessionManager, 225.37999917458814)
  testIntervalMinimumStrokedistance(sessionManager, 8.491708961574506)
  testIntervalAverageStrokedistance(sessionManager, 10.390549437704353)
  testIntervalMaximumStrokedistance(sessionManager, 11.32227861543267)
  testIntervalMinimumStrokerate(sessionManager, 17.11018345586753)
  testIntervalAverageStrokerate(sessionManager, 21.006289713585318)
  testIntervalMaximumStrokerate(sessionManager, 23.947414069812904)
  testIntervalMinimumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testIntervalAverageDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testIntervalMaximumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)

  // Test split metrics
  testSplitNumber(sessionManager, 0)
  testSplitType(sessionManager, 'calories')
  testSplitTime(sessionManager, 46.302522627)
  testSplitMovingTimeTarget(sessionManager, undefined)
  testSplitMovingTimeToEnd(sessionManager, undefined)
  testSplitMovingTimeProjectedEnd(sessionManager, 46.26802265985762)
  testSplitTimeSpentTotal(sessionManager, 46.302522627)
  testSplitTimeSpentMoving(sessionManager, 46.302522627)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 165.58832475070278)
  testSplitDistanceToEnd(sessionManager, undefined)
  testSplitDistanceTarget(sessionManager, undefined)
  testSplitDistanceProjectedEnd(sessionManager, 165.48121073524186)
  testSplitWorkSinceStart(sessionManager, 9748.548017262458)
  testSplitCaloriesSinceStart(sessionManager, 13.142874997261865)
  testSplitCaloriesTarget(sessionManager, 13.14)
  testSplitCaloriesToEnd(sessionManager, -0.002874997261864465)
  testSplitNumberOfStrokes(sessionManager, 15)
  testSplitMinimumPace(sessionManager, 180.24261586109614)
  testSplitAveragePace(sessionManager, 139.81215975434733)
  testSplitMaximumPace(sessionManager, 115.80722039956261)
  testSplitMinimumLinearVelocity(sessionManager, 2.7740387455612865)
  testSplitAverageLinearVelocity(sessionManager, 3.5762268523604077)
  testSplitMaximumLinearVelocity(sessionManager, 4.317520084454841)
  testSplitMinimumPower(sessionManager, 59.79167863880113)
  testSplitAveragePower(sessionManager, 142.86733839369302)
  testSplitMaximumPower(sessionManager, 225.37999917458814)
  testSplitMinimumStrokedistance(sessionManager, 8.491708961574506)
  testSplitAverageStrokedistance(sessionManager, 10.390549437704353)
  testSplitMaximumStrokedistance(sessionManager, 11.32227861543267)
  testSplitMinimumStrokerate(sessionManager, 17.11018345586753)
  testSplitAverageStrokerate(sessionManager, 21.006289713585318)
  testSplitMaximumStrokerate(sessionManager, 23.947414069812904)
  testSplitMinimumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSplitAverageDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSplitMaximumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
})

/**
 * @description Test behaviour for the SportsTech WRX700 in a 'Just Row' session
 */
test('Sportstech_WRX700_05: A full unlimited session for SportsTech WRX700 should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700)
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
  const sessionManager = createSessionManager(testConfig)

  testSessionType(sessionManager, 'justrow')
  testIntervalType(sessionManager, 'justrow')
  testSplitType(sessionManager, 'justrow')

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets_session.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, true) // There were no timeouts yet
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 2340.0100514160117)
  testTotalLinearDistance(sessionManager, 8406.084229545408)
  testTotalWork(sessionManager, 487699.09367508633)
  testTotalCalories(sessionManager, 659.476164927607)
  testTotalCaloriesPerMinute(sessionManager, 17.199317176667705)
  testTotalCaloriesPerHour (sessionManager, 1031.959030600064)
  testTotalNumberOfStrokes(sessionManager, 845)
  testStrokeState(sessionManager, 'Recovery')
  testStrokeWork(sessionManager, 395.80950222397223)
  testStrokeCalories(sessionManager, 0.5966066672311777)
  testCycleDistance(sessionManager, 9.553172581771296)
  testCycleStrokeRate(sessionManager, 22.763981039266426)
  testCycleDuration(sessionManager, 2.635742838500164)
  testCycleLinearVelocity(sessionManager, 3.624974543637083)
  testCyclePace(sessionManager, 137.93200310265624)
  testCyclePower(sessionManager, 134.02976389064236)
  testDriveLastStartTime (sessionManager, 2336.8188294280117)
  testDriveDuration(sessionManager, 1.3936550620001071)
  testDriveLength(sessionManager, 1.5393804002590334)
  testDriveDistance(sessionManager, 4.953496894251904)
  testDriveAverageHandleForce(sessionManager, 210.6300325410566)
  testDrivePeakHandleForce(sessionManager, 352.68327935116827)
  testRecoveryDuration(sessionManager, 1.251141552000263)
  testDragFactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)

  // Test session metrics
  testSessionType(sessionManager, 'justrow')
  testSessionState(sessionManager, 'Rowing')
  testSessionTime(sessionManager, 2340.0100514160117)
  testSessionMovingTimeTarget(sessionManager, undefined)
  testSessionMovingTimeToEnd(sessionManager, undefined)
  testSessionMovingTimeProjectedEnd(sessionManager, undefined)
  testSessionTimeSpentTotal(sessionManager, 2340.0100514160117)
  testSessionTimeSpentMoving(sessionManager, 2340.0100514160117)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 8406.084229545408)
  testSessionDistanceToEnd(sessionManager, undefined)
  testSessionDistanceTarget(sessionManager, undefined)
  testSessionDistanceProjectedEnd(sessionManager, undefined)
  testSessionWorkSinceStart(sessionManager, 487699.09367508633)
  testSessionCaloriesSinceStart(sessionManager, 659.476164927607)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 845)
  testSessionMinimumPace(sessionManager, 241.8898638189788)
  testSessionAveragePace(sessionManager, 139.1854987124342)
  testSessionMaximumPace(sessionManager, 114.36541624043336)
  testSessionMinimumLinearVelocity(sessionManager, 2.067056436784722)
  testSessionAverageLinearVelocity(sessionManager, 3.5923282570767716)
  testSessionMaximumLinearVelocity(sessionManager, 4.37195103586942)
  testSessionMinimumPower(sessionManager, 24.73144671899844)
  testSessionAveragePower(sessionManager, 137.31551165546605)
  testSessionMaximumPower(sessionManager, 234.15919484264248)
  testSessionMinimumStrokedistance(sessionManager, 8.137887754842472)
  testSessionAverageStrokedistance(sessionManager, 9.936566278218478)
  testSessionMaximumStrokedistance(sessionManager, 12.383742235629555)
  testSessionMinimumStrokerate(sessionManager, 11.507551179373843)
  testSessionAverageStrokerate(sessionManager, 21.978699599238304)
  testSessionMaximumStrokerate(sessionManager, 28.507568204527697)
  testSessionMinimumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSessionAverageDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSessionMaximumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)

  // Test interval metrics
  testIntervalNumber(sessionManager, 0)
  testIntervalWorkoutStepNumber(sessionManager, 0)
  testIntervalType(sessionManager, 'justrow')
  testIntervalTime(sessionManager, 2340.0100514160117)
  testIntervalMovingTimeTarget(sessionManager, undefined)
  testIntervalMovingTimeToEnd(sessionManager, undefined)
  testIntervalMovingTimeProjectedEnd(sessionManager, undefined)
  testIntervalTimeSpentTotal(sessionManager, 2340.0100514160117)
  testIntervalTimeSpentMoving(sessionManager, 2340.0100514160117)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 8406.084229545408)
  testIntervalDistanceToEnd(sessionManager, undefined)
  testIntervalDistanceTarget(sessionManager, undefined)
  testIntervalDistanceProjectedEnd(sessionManager, undefined)
  testIntervalWorkSinceStart(sessionManager, 487699.09367508633)
  testIntervalCaloriesSinceStart(sessionManager, 659.476164927607)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 845)
  testIntervalMinimumPace(sessionManager, 241.8898638189788)
  testIntervalAveragePace(sessionManager, 139.1854987124342)
  testIntervalMaximumPace(sessionManager, 114.36541624043336)
  testIntervalMinimumLinearVelocity(sessionManager, 2.067056436784722)
  testIntervalAverageLinearVelocity(sessionManager, 3.5923282570767716)
  testIntervalMaximumLinearVelocity(sessionManager, 4.37195103586942)
  testIntervalMinimumPower(sessionManager, 24.73144671899844)
  testIntervalAveragePower(sessionManager, 137.31551165546605)
  testIntervalMaximumPower(sessionManager, 234.15919484264248)
  testIntervalMinimumStrokedistance(sessionManager, 8.137887754842472)
  testIntervalAverageStrokedistance(sessionManager, 9.936566278218478)
  testIntervalMaximumStrokedistance(sessionManager, 12.383742235629555)
  testIntervalMinimumStrokerate(sessionManager, 11.507551179373843)
  testIntervalAverageStrokerate(sessionManager, 21.978699599238304)
  testIntervalMaximumStrokerate(sessionManager, 28.507568204527697)
  testIntervalMinimumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testIntervalAverageDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testIntervalMaximumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)

  // Test split metrics
  testSplitNumber(sessionManager, 0)
  testSplitType(sessionManager, 'justrow')
  testSplitTime(sessionManager, 2340.0100514160117)
  testSplitMovingTimeTarget(sessionManager, undefined)
  testSplitMovingTimeToEnd(sessionManager, undefined)
  testSplitMovingTimeProjectedEnd(sessionManager, undefined)
  testSplitTimeSpentTotal(sessionManager, 2340.0100514160117)
  testSplitTimeSpentMoving(sessionManager, 2340.0100514160117)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 8406.084229545408)
  testSplitDistanceToEnd(sessionManager, undefined)
  testSplitDistanceTarget(sessionManager, undefined)
  testSplitDistanceProjectedEnd(sessionManager, undefined)
  testSplitWorkSinceStart(sessionManager, 487699.09367508633)
  testSplitCaloriesSinceStart(sessionManager, 659.476164927607)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)
  testSplitNumberOfStrokes(sessionManager, 845)
  testSplitMinimumPace(sessionManager, 241.8898638189788)
  testSplitAveragePace(sessionManager, 139.1854987124342)
  testSplitMaximumPace(sessionManager, 114.36541624043336)
  testSplitMinimumLinearVelocity(sessionManager, 2.067056436784722)
  testSplitAverageLinearVelocity(sessionManager, 3.5923282570767716)
  testSplitMaximumLinearVelocity(sessionManager, 4.37195103586942)
  testSplitMinimumPower(sessionManager, 24.73144671899844)
  testSplitAveragePower(sessionManager, 137.31551165546605)
  testSplitMaximumPower(sessionManager, 234.15919484264248)
  testSplitMinimumStrokedistance(sessionManager, 8.137887754842472)
  testSplitAverageStrokedistance(sessionManager, 9.936566278218478)
  testSplitMaximumStrokedistance(sessionManager, 12.383742235629555)
  testSplitMinimumStrokerate(sessionManager, 11.507551179373843)
  testSplitAverageStrokerate(sessionManager, 21.978699599238304)
  testSplitMaximumStrokerate(sessionManager, 28.507568204527697)
  testSplitMinimumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSplitAverageDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSplitMaximumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
})

/**
 * @description Test behaviour for the SportsTech WRX700 in a 'Just Row' session
 */
test('Sportstech_WRX700_06: a succesfull session with a reset for SportsTech WRX700 should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700)
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
  const sessionManager = createSessionManager(testConfig)

  testSessionType(sessionManager, 'justrow')
  testIntervalType(sessionManager, 'justrow')
  testSplitType(sessionManager, 'justrow')

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets.csv', realtime: false, loop: false })

  testSessionState(sessionManager, 'Rowing')
  testTotalMovingTime(sessionManager, 46.302522627)
  testTotalLinearDistance(sessionManager, 165.58832475070278)
  testTotalCalories(sessionManager, 13.142874997261865)
  testTotalNumberOfStrokes(sessionManager, 15)
  testDragFactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)

  sessionManager.handleCommand('reset')

  testSessionType(sessionManager, 'justrow')
  testIntervalType(sessionManager, 'justrow')
  testSplitType(sessionManager, 'justrow')

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets_session.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, true) // There were no timeouts yet
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 2340.0100514160117)
  testTotalLinearDistance(sessionManager, 8406.084229545408)
  testTotalWork(sessionManager, 487699.09367508633)
  testTotalCalories(sessionManager, 659.476164927607)
  testTotalCaloriesPerMinute(sessionManager, 17.199317176667705)
  testTotalCaloriesPerHour (sessionManager, 1031.959030600064)
  testTotalNumberOfStrokes(sessionManager, 845)
  testStrokeState(sessionManager, 'Recovery')
  testStrokeWork(sessionManager, 395.80950222397223)
  testStrokeCalories(sessionManager, 0.5966066672311777)
  testCycleDistance(sessionManager, 9.553172581771296)
  testCycleStrokeRate(sessionManager, 22.763981039266426)
  testCycleDuration(sessionManager, 2.635742838500164)
  testCycleLinearVelocity(sessionManager, 3.624974543637083)
  testCyclePace(sessionManager, 137.93200310265624)
  testCyclePower(sessionManager, 134.02976389064236)
  testDriveLastStartTime (sessionManager, 2336.8188294280117)
  testDriveDuration(sessionManager, 1.3936550620001071)
  testDriveLength(sessionManager, 1.5393804002590334)
  testDriveDistance(sessionManager, 4.953496894251904)
  testDriveAverageHandleForce(sessionManager, 210.6300325410566)
  testDrivePeakHandleForce(sessionManager, 352.68327935116827)
  testRecoveryDuration(sessionManager, 1.251141552000263)
  testDragFactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)

  // Test session metrics
  testSessionType(sessionManager, 'justrow')
  testSessionState(sessionManager, 'Rowing')
  testSessionTime(sessionManager, 2340.0100514160117)
  testSessionMovingTimeTarget(sessionManager, undefined)
  testSessionMovingTimeToEnd(sessionManager, undefined)
  testSessionMovingTimeProjectedEnd(sessionManager, undefined)
  testSessionTimeSpentTotal(sessionManager, 2340.0100514160117)
  testSessionTimeSpentMoving(sessionManager, 2340.0100514160117)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 8406.084229545408)
  testSessionDistanceToEnd(sessionManager, undefined)
  testSessionDistanceTarget(sessionManager, undefined)
  testSessionDistanceProjectedEnd(sessionManager, undefined)
  testSessionWorkSinceStart(sessionManager, 487699.09367508633)
  testSessionCaloriesSinceStart(sessionManager, 659.476164927607)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 845)
  testSessionMinimumPace(sessionManager, 241.8898638189788)
  testSessionAveragePace(sessionManager, 139.1854987124342)
  testSessionMaximumPace(sessionManager, 114.36541624043336)
  testSessionMinimumLinearVelocity(sessionManager, 2.067056436784722)
  testSessionAverageLinearVelocity(sessionManager, 3.5923282570767716)
  testSessionMaximumLinearVelocity(sessionManager, 4.37195103586942)
  testSessionMinimumPower(sessionManager, 24.73144671899844)
  testSessionAveragePower(sessionManager, 137.31551165546605)
  testSessionMaximumPower(sessionManager, 234.15919484264248)
  testSessionMinimumStrokedistance(sessionManager, 8.137887754842472)
  testSessionAverageStrokedistance(sessionManager, 9.936566278218478)
  testSessionMaximumStrokedistance(sessionManager, 12.383742235629555)
  testSessionMinimumStrokerate(sessionManager, 11.507551179373843)
  testSessionAverageStrokerate(sessionManager, 21.978699599238304)
  testSessionMaximumStrokerate(sessionManager, 28.507568204527697)
  testSessionMinimumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSessionAverageDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSessionMaximumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)

  // Test interval metrics
  testIntervalNumber(sessionManager, 0)
  testIntervalWorkoutStepNumber(sessionManager, 0)
  testIntervalType(sessionManager, 'justrow')
  testIntervalTime(sessionManager, 2340.0100514160117)
  testIntervalMovingTimeTarget(sessionManager, undefined)
  testIntervalMovingTimeToEnd(sessionManager, undefined)
  testIntervalMovingTimeProjectedEnd(sessionManager, undefined)
  testIntervalTimeSpentTotal(sessionManager, 2340.0100514160117)
  testIntervalTimeSpentMoving(sessionManager, 2340.0100514160117)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 8406.084229545408)
  testIntervalDistanceToEnd(sessionManager, undefined)
  testIntervalDistanceTarget(sessionManager, undefined)
  testIntervalDistanceProjectedEnd(sessionManager, undefined)
  testIntervalWorkSinceStart(sessionManager, 487699.09367508633)
  testIntervalCaloriesSinceStart(sessionManager, 659.476164927607)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 845)
  testIntervalMinimumPace(sessionManager, 241.8898638189788)
  testIntervalAveragePace(sessionManager, 139.1854987124342)
  testIntervalMaximumPace(sessionManager, 114.36541624043336)
  testIntervalMinimumLinearVelocity(sessionManager, 2.067056436784722)
  testIntervalAverageLinearVelocity(sessionManager, 3.5923282570767716)
  testIntervalMaximumLinearVelocity(sessionManager, 4.37195103586942)
  testIntervalMinimumPower(sessionManager, 24.73144671899844)
  testIntervalAveragePower(sessionManager, 137.31551165546605)
  testIntervalMaximumPower(sessionManager, 234.15919484264248)
  testIntervalMinimumStrokedistance(sessionManager, 8.137887754842472)
  testIntervalAverageStrokedistance(sessionManager, 9.936566278218478)
  testIntervalMaximumStrokedistance(sessionManager, 12.383742235629555)
  testIntervalMinimumStrokerate(sessionManager, 11.507551179373843)
  testIntervalAverageStrokerate(sessionManager, 21.978699599238304)
  testIntervalMaximumStrokerate(sessionManager, 28.507568204527697)
  testIntervalMinimumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testIntervalAverageDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testIntervalMaximumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)

  // Test split metrics
  testSplitNumber(sessionManager, 0)
  testSplitType(sessionManager, 'justrow')
  testSplitTime(sessionManager, 2340.0100514160117)
  testSplitMovingTimeTarget(sessionManager, undefined)
  testSplitMovingTimeToEnd(sessionManager, undefined)
  testSplitMovingTimeProjectedEnd(sessionManager, undefined)
  testSplitTimeSpentTotal(sessionManager, 2340.0100514160117)
  testSplitTimeSpentMoving(sessionManager, 2340.0100514160117)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 8406.084229545408)
  testSplitDistanceToEnd(sessionManager, undefined)
  testSplitDistanceTarget(sessionManager, undefined)
  testSplitDistanceProjectedEnd(sessionManager, undefined)
  testSplitWorkSinceStart(sessionManager, 487699.09367508633)
  testSplitCaloriesSinceStart(sessionManager, 659.476164927607)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)
  testSplitNumberOfStrokes(sessionManager, 845)
  testSplitMinimumPace(sessionManager, 241.8898638189788)
  testSplitAveragePace(sessionManager, 139.1854987124342)
  testSplitMaximumPace(sessionManager, 114.36541624043336)
  testSplitMinimumLinearVelocity(sessionManager, 2.067056436784722)
  testSplitAverageLinearVelocity(sessionManager, 3.5923282570767716)
  testSplitMaximumLinearVelocity(sessionManager, 4.37195103586942)
  testSplitMinimumPower(sessionManager, 24.73144671899844)
  testSplitAveragePower(sessionManager, 137.31551165546605)
  testSplitMaximumPower(sessionManager, 234.15919484264248)
  testSplitMinimumStrokedistance(sessionManager, 8.137887754842472)
  testSplitAverageStrokedistance(sessionManager, 9.936566278218478)
  testSplitMaximumStrokedistance(sessionManager, 12.383742235629555)
  testSplitMinimumStrokerate(sessionManager, 11.507551179373843)
  testSplitAverageStrokerate(sessionManager, 21.978699599238304)
  testSplitMaximumStrokerate(sessionManager, 28.507568204527697)
  testSplitMinimumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSplitAverageDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSplitMaximumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
})

/**
 * @description Test behaviour for the SportsTech WRX700 in a single interval session with a Distance target
 */
test('Sportstech_WRX700_07: A 8000 meter session for SportsTech WRX700 should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700)
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
  const sessionManager = createSessionManager(testConfig)

  testSessionType(sessionManager, 'justrow')
  testIntervalType(sessionManager, 'justrow')
  testSplitType(sessionManager, 'justrow')

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets.csv', realtime: false, loop: false })

  testSessionState(sessionManager, 'Rowing')
  testTotalMovingTime(sessionManager, 46.302522627)
  testTotalLinearDistance(sessionManager, 165.58832475070278)
  testTotalCalories(sessionManager, 13.142874997261865)
  testTotalNumberOfStrokes(sessionManager, 15)
  testDragFactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)

  sessionManager.handleCommand('reset')

  testSessionType(sessionManager, 'justrow')
  testIntervalType(sessionManager, 'justrow')
  testSplitType(sessionManager, 'justrow')

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'distance',
    targetDistance: 4000,
    split: {
      type: 'distance',
      targetDistance: 500
    }
  }
  intervalSettings[1] = {
    type: 'distance',
    targetDistance: 4000,
    split: {
      type: 'distance',
      targetDistance: 500
    }
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testSessionType(sessionManager, 'distance')
  testSessionDistanceTarget(sessionManager, 8000)
  testIntervalType(sessionManager, 'distance')
  testIntervalDistanceTarget(sessionManager, 4000)
  testSplitType(sessionManager, 'distance')
  testSplitDistanceTarget(sessionManager, 500)

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets_session.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, false)
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 2236.631120457007)
  testTotalLinearDistance(sessionManager, 8000.605126630226)
  testTotalWork(sessionManager, 461136.62533351587)
  testTotalCalories(sessionManager, 625.5636651176229)
  testTotalCaloriesPerMinute(sessionManager, 17.214588573735455)
  testTotalCaloriesPerHour (sessionManager, 1032.8753144241257)
  testTotalNumberOfStrokes(sessionManager, 804)
  testStrokeState(sessionManager, 'Stopped')
  testStrokeWork(sessionManager, undefined)
  testStrokeCalories(sessionManager, undefined)
  testCycleDistance(sessionManager, undefined)
  testCycleStrokeRate(sessionManager, undefined)
  testCycleDuration(sessionManager, undefined)
  testCycleLinearVelocity(sessionManager, undefined)
  testCyclePace(sessionManager, Infinity)
  testCyclePower(sessionManager, undefined)
  testDriveLastStartTime (sessionManager, 2235.5285743140066)
  testDriveDuration(sessionManager, undefined)
  testDriveLength(sessionManager, undefined)
  testDriveDistance(sessionManager, undefined)
  testDriveAverageHandleForce(sessionManager, undefined)
  testDrivePeakHandleForce(sessionManager, undefined)
  testRecoveryDuration(sessionManager, undefined)
  testDragFactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)

  // Test session metrics
  testSessionType(sessionManager, 'distance')
  testSessionState(sessionManager, 'Stopped')
  testSessionTime(sessionManager, 2236.631120457007)
  testSessionMovingTimeTarget(sessionManager, undefined)
  testSessionMovingTimeToEnd(sessionManager, undefined)
  testSessionMovingTimeProjectedEnd(sessionManager, 2236.4425562856004)
  testSessionTimeSpentTotal(sessionManager, 2236.631120457007)
  testSessionTimeSpentMoving(sessionManager, 2236.631120457007)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 8000.605126630226)
  testSessionDistanceToEnd(sessionManager, -0.6051266302256408) // This is a testing artifact
  testSessionDistanceTarget(sessionManager, 8000)
  testSessionDistanceProjectedEnd(sessionManager, 8000)
  testSessionWorkSinceStart(sessionManager, 461136.62533351587)
  testSessionCaloriesSinceStart(sessionManager, 625.5636651176229)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 804)
  testSessionMinimumPace(sessionManager, 241.8898638189788)
  testSessionAveragePace(sessionManager, 139.77887203883623)
  testSessionMaximumPace(sessionManager, 114.36541624043336)
  testSessionMinimumLinearVelocity(sessionManager, 2.067056436784722)
  testSessionAverageLinearVelocity(sessionManager, 3.577078514849367)
  testSessionMaximumLinearVelocity(sessionManager, 4.37195103586942)
  testSessionMinimumPower(sessionManager, 24.73144671899844)
  testSessionAveragePower(sessionManager, 135.5459464551185)
  testSessionMaximumPower(sessionManager, 234.15919484264248)
  testSessionMinimumStrokedistance(sessionManager, 8.137887754842472)
  testSessionAverageStrokedistance(sessionManager, 9.947115570201449)
  testSessionMaximumStrokedistance(sessionManager, 12.383742235629555)
  testSessionMinimumStrokerate(sessionManager, 11.507551179373843)
  testSessionAverageStrokerate(sessionManager, 21.858844027291234)
  testSessionMaximumStrokerate(sessionManager, 28.507568204527697)
  testSessionMinimumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSessionAverageDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSessionMaximumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)

  // Test interval metrics
  testIntervalNumber(sessionManager, 1)
  testIntervalWorkoutStepNumber(sessionManager, 1)
  testIntervalType(sessionManager, 'distance')
  testIntervalTime(sessionManager, 1109.77121002217) // Should be roughly 50% of 2236.631120457007
  testIntervalMovingTimeTarget(sessionManager, undefined)
  testIntervalMovingTimeToEnd(sessionManager, undefined)
  testIntervalMovingTimeProjectedEnd(sessionManager, 1109.5826458507634)
  testIntervalTimeSpentTotal(sessionManager, 1109.77121002217)
  testIntervalTimeSpentMoving(sessionManager, 1109.77121002217)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 4000.6051266302256) // Should be 4000
  testIntervalDistanceToEnd(sessionManager, -0.6051266302256408) // This is a testing artifact
  testIntervalDistanceTarget(sessionManager, 4000)
  testIntervalDistanceProjectedEnd(sessionManager, 4000)
  testIntervalWorkSinceStart(sessionManager, 230548.01178845193) // Should be roughly 50% of 461136.62533351587
  testIntervalCaloriesSinceStart(sessionManager, 312.05046920513513) // Should be roughly 50% of 625.5636651176229
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 403)
  testIntervalMinimumPace(sessionManager, 241.8898638189788)
  testIntervalAveragePace(sessionManager, 138.70041842356835)
  testIntervalMaximumPace(sessionManager, 114.36541624043336)
  testIntervalMinimumLinearVelocity(sessionManager, 2.067056436784722)
  testIntervalAverageLinearVelocity(sessionManager, 3.6048917925617348)
  testIntervalMaximumLinearVelocity(sessionManager, 4.37195103586942)
  testIntervalMinimumPower(sessionManager, 24.73144671899844)
  testIntervalAveragePower(sessionManager, 137.1389340161279)
  testIntervalMaximumPower(sessionManager, 234.15919484264248)
  testIntervalMinimumStrokedistance(sessionManager, 8.137887754842472)
  testIntervalAverageStrokedistance(sessionManager, 9.940356582190555)
  testIntervalMaximumStrokedistance(sessionManager, 12.029921028897247)
  testIntervalMinimumStrokerate(sessionManager, 11.992139312176349)
  testIntervalAverageStrokerate(sessionManager, 21.942774295166227)
  testIntervalMaximumStrokerate(sessionManager, 28.507568204527697)
  testIntervalMinimumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testIntervalAverageDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testIntervalMaximumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)

  // Test split metrics
  testSplitNumber(sessionManager, 15)
  testSplitType(sessionManager, 'distance')
  testSplitTime(sessionManager, 142.36663269382916)
  testSplitMovingTimeTarget(sessionManager, undefined)
  testSplitMovingTimeToEnd(sessionManager, undefined)
  testSplitMovingTimeProjectedEnd(sessionManager, 142.17806852242256)
  testSplitTimeSpentTotal(sessionManager, 142.36663269382916)
  testSplitTimeSpentMoving(sessionManager, 142.36663269382916)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 500.60512663022564)
  testSplitDistanceToEnd(sessionManager, -0.6051266302256408)
  testSplitDistanceTarget(sessionManager, 500)
  testSplitDistanceProjectedEnd(sessionManager, 500)
  testSplitWorkSinceStart(sessionManager, 27314.17745368625)
  testSplitCaloriesSinceStart(sessionManager, 37.824668332509304)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)
  testSplitNumberOfStrokes(sessionManager, 50)
  testSplitMinimumPace(sessionManager, 150.38315673744688)
  testSplitAveragePace(sessionManager, 142.19454128661866)
  testSplitMaximumPace(sessionManager, 121.87524493832613)
  testSplitMinimumLinearVelocity(sessionManager, 3.324840433247104)
  testSplitAverageLinearVelocity(sessionManager, 3.5163093848459352)
  testSplitMaximumLinearVelocity(sessionManager, 4.102555857450957)
  testSplitMinimumPower(sessionManager, 102.92907911021074)
  testSplitAveragePower(sessionManager, 123.62454928153953)
  testSplitMaximumPower(sessionManager, 193.544929845238)
  testSplitMinimumStrokedistance(sessionManager, 9.199351375038782)
  testSplitAverageStrokedistance(sessionManager, 9.984063754326442)
  testSplitMaximumStrokedistance(sessionManager, 10.614636201968015)
  testSplitMinimumStrokerate(sessionManager, 18.829658892542405)
  testSplitAverageStrokerate(sessionManager, 21.17988526584888)
  testSplitMaximumStrokerate(sessionManager, 26.497167887310965)
  testSplitMinimumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSplitAverageDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSplitMaximumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
})

/**
 * @description Test behaviour for the SportsTech WRX700 in a single interval session with a Time target
 * Additional check is the behaviour with providing a second workoutplan, overwriting the second one
 */
test('Sportstech_WRX700_08: A 2300 sec session for SportsTech WRX700 should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700)
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
  const sessionManager = createSessionManager(testConfig)

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'distance',
    targetDistance: 8000,
    split: {
      type: 'distance',
      targetDistance: 500
    }
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testSessionType(sessionManager, 'distance')
  testSessionDistanceTarget(sessionManager, 8000)
  testIntervalType(sessionManager, 'distance')
  testIntervalDistanceTarget(sessionManager, 8000)
  testSplitType(sessionManager, 'distance')
  testSplitDistanceTarget(sessionManager, 500)

  intervalSettings[0] = {
    type: 'time',
    targetDistance: 0,
    targetTime: 2300,
    split: {
      type: 'distance',
      targetDistance: 500
    }
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testSessionType(sessionManager, 'time')
  testSessionMovingTimeTarget(sessionManager, 2300)
  testIntervalType(sessionManager, 'time')
  testIntervalMovingTimeTarget(sessionManager, 2300)
  testSplitType(sessionManager, 'distance')
  testSplitDistanceTarget(sessionManager, 500)

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets_session.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, false)
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 2300.00695516701)
  testTotalLinearDistance(sessionManager, 8251.818183410143)
  testTotalWork(sessionManager, 477910.9434562283)
  testTotalCalories(sessionManager, 646.8205257460397)
  testTotalCaloriesPerMinute(sessionManager, 17.19999562179794)
  testTotalCaloriesPerHour (sessionManager, 1031.9997373078784)
  testTotalNumberOfStrokes(sessionManager, 830)
  testStrokeState(sessionManager, 'Stopped')
  testStrokeWork(sessionManager, undefined)
  testStrokeCalories(sessionManager, undefined)
  testCycleDistance(sessionManager, undefined)
  testCycleStrokeRate(sessionManager, undefined)
  testCycleDuration(sessionManager, undefined)
  testCycleLinearVelocity(sessionManager, undefined)
  testCyclePace(sessionManager, Infinity)
  testCyclePower(sessionManager, undefined)
  testDriveLastStartTime (sessionManager, 2299.40197893501)
  testDriveDuration(sessionManager, undefined)
  testDriveLength(sessionManager, undefined)
  testDriveDistance(sessionManager, undefined)
  testDriveAverageHandleForce(sessionManager, undefined)
  testDrivePeakHandleForce(sessionManager, undefined)
  testRecoveryDuration(sessionManager, undefined)
  testDragFactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)

  // Test session metrics
  testSessionType(sessionManager, 'time')
  testSessionState(sessionManager, 'Stopped')
  testSessionTime(sessionManager, 2300.00695516701)
  testSessionMovingTimeTarget(sessionManager, 2300)
  testSessionMovingTimeToEnd(sessionManager, -0.006955167009891738) // This is a testing artifact
  testSessionMovingTimeProjectedEnd(sessionManager, 2300)
  testSessionTimeSpentTotal(sessionManager, 2300.00695516701)
  testSessionTimeSpentMoving(sessionManager, 2300.00695516701)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 8251.818183410143)
  testSessionDistanceToEnd(sessionManager, undefined)
  testSessionDistanceTarget(sessionManager, undefined)
  testSessionDistanceProjectedEnd(sessionManager, 8251.801912458166)
  testSessionWorkSinceStart(sessionManager, 477910.9434562283)
  testSessionCaloriesSinceStart(sessionManager, 646.8205257460397)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 830)
  testSessionMinimumPace(sessionManager, 241.8898638189788)
  testSessionAveragePace(sessionManager, 139.3636471408844)
  testSessionMaximumPace(sessionManager, 114.36541624043336)
  testSessionMinimumLinearVelocity(sessionManager, 2.067056436784722)
  testSessionAverageLinearVelocity(sessionManager, 3.587736187002511)
  testSessionMaximumLinearVelocity(sessionManager, 4.37195103586942)
  testSessionMinimumPower(sessionManager, 24.73144671899844)
  testSessionAveragePower(sessionManager, 136.80207530368608)
  testSessionMaximumPower(sessionManager, 234.15919484264248)
  testSessionMinimumStrokedistance(sessionManager, 8.137887754842472)
  testSessionAverageStrokedistance(sessionManager, 9.940731718897963)
  testSessionMaximumStrokedistance(sessionManager, 12.383742235629555)
  testSessionMinimumStrokerate(sessionManager, 11.507551179373843)
  testSessionAverageStrokerate(sessionManager, 21.940539134796552)
  testSessionMaximumStrokerate(sessionManager, 28.507568204527697)
  testSessionMinimumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSessionAverageDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSessionMaximumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)

  // Test interval metrics
  testIntervalNumber(sessionManager, 0)
  testIntervalWorkoutStepNumber(sessionManager, 0)
  testIntervalType(sessionManager, 'time')
  testIntervalTime(sessionManager, 2300.00695516701)
  testIntervalMovingTimeTarget(sessionManager, 2300)
  testIntervalMovingTimeToEnd(sessionManager, -0.006955167009891738) // This is a testing artifact
  testIntervalMovingTimeProjectedEnd(sessionManager, 2300)
  testIntervalTimeSpentTotal(sessionManager, 2300.00695516701)
  testIntervalTimeSpentMoving(sessionManager, 2300.00695516701)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 8251.818183410143)
  testIntervalDistanceToEnd(sessionManager, undefined)
  testIntervalDistanceTarget(sessionManager, undefined)
  testIntervalDistanceProjectedEnd(sessionManager, 8251.801912458166)
  testIntervalWorkSinceStart(sessionManager, 477910.9434562283)
  testIntervalCaloriesSinceStart(sessionManager, 646.8205257460397)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 830)
  testIntervalMinimumPace(sessionManager, 241.8898638189788)
  testIntervalAveragePace(sessionManager, 139.3636471408844)
  testIntervalMaximumPace(sessionManager, 114.36541624043336)
  testIntervalMinimumLinearVelocity(sessionManager, 2.067056436784722)
  testIntervalAverageLinearVelocity(sessionManager, 3.587736187002511)
  testIntervalMaximumLinearVelocity(sessionManager, 4.37195103586942)
  testIntervalMinimumPower(sessionManager, 24.73144671899844)
  testIntervalAveragePower(sessionManager, 136.80207530368608)
  testIntervalMaximumPower(sessionManager, 234.15919484264248)
  testIntervalMinimumStrokedistance(sessionManager, 8.137887754842472)
  testIntervalAverageStrokedistance(sessionManager, 9.940731718897963)
  testIntervalMaximumStrokedistance(sessionManager, 12.383742235629555)
  testIntervalMinimumStrokerate(sessionManager, 11.507551179373843)
  testIntervalAverageStrokerate(sessionManager, 21.940539134796552)
  testIntervalMaximumStrokerate(sessionManager, 28.507568204527697)
  testIntervalMinimumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testIntervalAverageDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testIntervalMaximumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)

  // Test split metrics
  testSplitNumber(sessionManager, 16)
  testSplitType(sessionManager, 'distance')
  testSplitTime(sessionManager, 63.47999194274462)
  testSplitMovingTimeTarget(sessionManager, undefined)
  testSplitMovingTimeToEnd(sessionManager, undefined)
  testSplitMovingTimeProjectedEnd(sessionManager, 169.56754143965827)
  testSplitTimeSpentTotal(sessionManager, 63.47999194274462)
  testSplitTimeSpentMoving(sessionManager, 63.47999194274462)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 251.81818341014332)
  testSplitDistanceToEnd(sessionManager, 248.18181658985668)
  testSplitDistanceTarget(sessionManager, 500)
  testSplitDistanceProjectedEnd(sessionManager, 500)
  testSplitWorkSinceStart(sessionManager, 16915.97308304807)
  testSplitCaloriesSinceStart(sessionManager, 21.380905617753342)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)
  testSplitNumberOfStrokes(sessionManager, 26)
  testSplitMinimumPace(sessionManager, 132.3175856307246)
  testSplitAveragePace(sessionManager, 126.04330450464926)
  testSplitMaximumPace(sessionManager, 121.4244967719201)
  testSplitMinimumLinearVelocity(sessionManager, 3.7787872081902485)
  testSplitAverageLinearVelocity(sessionManager, 3.9668906013294576)
  testSplitMaximumLinearVelocity(sessionManager, 4.117785235208213)
  testSplitMinimumPower(sessionManager, 151.08898444599478)
  testSplitAveragePower(sessionManager, 175.69706315753768)
  testSplitMaximumPower(sessionManager, 195.68893992339216)
  testSplitMinimumStrokedistance(sessionManager, 9.199351375038782)
  testSplitAverageStrokedistance(sessionManager, 9.746772864700318)
  testSplitMaximumStrokedistance(sessionManager, 9.906993788503808)
  testSplitMinimumStrokerate(sessionManager, 23.174387764436602)
  testSplitAverageStrokerate(sessionManager, 24.46011598727192)
  testSplitMaximumStrokerate(sessionManager, 26.84163443333606)
  testSplitMinimumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSplitAverageDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSplitMaximumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
})

/**
 * @description Test behaviour for the SportsTech WRX700 in a single interval session with a Time target, which will not be reached (test of stopping behaviour)
 */
test('Sportstech_WRX700_09: A 2400 sec session with premature stop for SportsTech WRX700 should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700)
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
  const sessionManager = createSessionManager(testConfig)

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'time',
    targetDistance: 0,
    targetTime: 2400,
    split: {
      type: 'distance',
      targetDistance: 500
    }
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testSessionType(sessionManager, 'time')
  testSessionMovingTimeTarget(sessionManager, 2400)
  testIntervalType(sessionManager, 'time')
  testIntervalMovingTimeTarget(sessionManager, 2400)
  testSplitType(sessionManager, 'distance')
  testSplitDistanceTarget(sessionManager, 500)

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets_session.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, true) // There were no timeouts yet
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 2340.0100514160117)
  testTotalLinearDistance(sessionManager, 8406.084229545408)
  testTotalWork(sessionManager, 487699.09367508633)
  testTotalCalories(sessionManager, 659.476164927607)
  testTotalCaloriesPerMinute(sessionManager, 17.199317176667705)
  testTotalCaloriesPerHour (sessionManager, 1031.959030600064)
  testTotalNumberOfStrokes(sessionManager, 845)
  testStrokeState(sessionManager, 'Recovery')
  testStrokeWork(sessionManager, 395.80950222397223)
  testStrokeCalories(sessionManager, 0.5966066672311777)
  testCycleDistance(sessionManager, 9.553172581771296)
  testCycleStrokeRate(sessionManager, 22.763981039266426)
  testCycleDuration(sessionManager, 2.635742838500164)
  testCycleLinearVelocity(sessionManager, 3.624974543637083)
  testCyclePace(sessionManager, 137.93200310265624)
  testCyclePower(sessionManager, 134.02976389064236)
  testDriveLastStartTime (sessionManager, 2336.8188294280117)
  testDriveDuration(sessionManager, 1.3936550620001071)
  testDriveLength(sessionManager, 1.5393804002590334)
  testDriveDistance(sessionManager, 4.953496894251904)
  testDriveAverageHandleForce(sessionManager, 210.6300325410566)
  testDrivePeakHandleForce(sessionManager, 352.68327935116827)
  testRecoveryDuration(sessionManager, 1.251141552000263)
  testDragFactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)

  // Test session metrics
  testSessionType(sessionManager, 'time')
  testSessionState(sessionManager, 'Rowing')
  testSessionTime(sessionManager, 2340.0100514160117)
  testSessionMovingTimeTarget(sessionManager, 2400)
  testSessionMovingTimeToEnd(sessionManager, 59.98994858398828)
  testSessionMovingTimeProjectedEnd(sessionManager, 2400)
  testSessionTimeSpentTotal(sessionManager, 2340.0100514160117)
  testSessionTimeSpentMoving(sessionManager, 2340.0100514160117)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 8406.084229545408)
  testSessionDistanceToEnd(sessionManager, undefined)
  testSessionDistanceTarget(sessionManager, undefined)
  testSessionDistanceProjectedEnd(sessionManager, 8620.743372892788)
  testSessionWorkSinceStart(sessionManager, 487699.09367508633)
  testSessionCaloriesSinceStart(sessionManager, 659.476164927607)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 845)
  testSessionMinimumPace(sessionManager, 241.8898638189788)
  testSessionAveragePace(sessionManager, 139.1854987124342)
  testSessionMaximumPace(sessionManager, 114.36541624043336)
  testSessionMinimumLinearVelocity(sessionManager, 2.067056436784722)
  testSessionAverageLinearVelocity(sessionManager, 3.5923282570767716)
  testSessionMaximumLinearVelocity(sessionManager, 4.37195103586942)
  testSessionMinimumPower(sessionManager, 24.73144671899844)
  testSessionAveragePower(sessionManager, 137.31551165546605)
  testSessionMaximumPower(sessionManager, 234.15919484264248)
  testSessionMinimumStrokedistance(sessionManager, 8.137887754842472)
  testSessionAverageStrokedistance(sessionManager, 9.936566278218478)
  testSessionMaximumStrokedistance(sessionManager, 12.383742235629555)
  testSessionMinimumStrokerate(sessionManager, 11.507551179373843)
  testSessionAverageStrokerate(sessionManager, 21.978699599238304)
  testSessionMaximumStrokerate(sessionManager, 28.507568204527697)
  testSessionMinimumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSessionAverageDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSessionMaximumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)

  // Test interval metrics
  testIntervalNumber(sessionManager, 0)
  testIntervalWorkoutStepNumber(sessionManager, 0)
  testIntervalType(sessionManager, 'time')
  testIntervalTime(sessionManager, 2340.0100514160117)
  testIntervalMovingTimeTarget(sessionManager, 2400)
  testIntervalMovingTimeToEnd(sessionManager, 59.98994858398828)
  testIntervalMovingTimeProjectedEnd(sessionManager, 2400)
  testIntervalTimeSpentTotal(sessionManager, 2340.0100514160117)
  testIntervalTimeSpentMoving(sessionManager, 2340.0100514160117)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 8406.084229545408)
  testIntervalDistanceToEnd(sessionManager, undefined)
  testIntervalDistanceTarget(sessionManager, undefined)
  testIntervalDistanceProjectedEnd(sessionManager, 8620.743372892788)
  testIntervalWorkSinceStart(sessionManager, 487699.09367508633)
  testIntervalCaloriesSinceStart(sessionManager, 659.476164927607)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 845)
  testIntervalMinimumPace(sessionManager, 241.8898638189788)
  testIntervalAveragePace(sessionManager, 139.1854987124342)
  testIntervalMaximumPace(sessionManager, 114.36541624043336)
  testIntervalMinimumLinearVelocity(sessionManager, 2.067056436784722)
  testIntervalAverageLinearVelocity(sessionManager, 3.5923282570767716)
  testIntervalMaximumLinearVelocity(sessionManager, 4.37195103586942)
  testIntervalMinimumPower(sessionManager, 24.73144671899844)
  testIntervalAveragePower(sessionManager, 137.31551165546605)
  testIntervalMaximumPower(sessionManager, 234.15919484264248)
  testIntervalMinimumStrokedistance(sessionManager, 8.137887754842472)
  testIntervalAverageStrokedistance(sessionManager, 9.936566278218478)
  testIntervalMaximumStrokedistance(sessionManager, 12.383742235629555)
  testIntervalMinimumStrokerate(sessionManager, 11.507551179373843)
  testIntervalAverageStrokerate(sessionManager, 21.978699599238304)
  testIntervalMaximumStrokerate(sessionManager, 28.507568204527697)
  testIntervalMinimumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testIntervalAverageDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testIntervalMaximumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)

  // Test split metrics
  testSplitNumber(sessionManager, 16)
  testSplitType(sessionManager, 'distance')
  testSplitTime(sessionManager, 103.48308819174645)
  testSplitMovingTimeTarget(sessionManager, undefined)
  testSplitMovingTimeToEnd(sessionManager, undefined)
  testSplitMovingTimeProjectedEnd(sessionManager, 129.5021641631215)
  testSplitTimeSpentTotal(sessionManager, 103.48308819174645)
  testSplitTimeSpentMoving(sessionManager, 103.48308819174645)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 406.08422954540765)
  testSplitDistanceToEnd(sessionManager, 93.91577045459235)
  testSplitDistanceTarget(sessionManager, 500)
  testSplitDistanceProjectedEnd(sessionManager, 500)
  testSplitWorkSinceStart(sessionManager, 26704.123301906104)
  testSplitCaloriesSinceStart(sessionManager, 34.03654479932061)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)
  testSplitNumberOfStrokes(sessionManager, 41)
  testSplitMinimumPace(sessionManager, 137.93200310265624)
  testSplitAveragePace(sessionManager, 127.41579291024296)
  testSplitMaximumPace(sessionManager, 121.4244967719201)
  testSplitMinimumLinearVelocity(sessionManager, 3.624974543637083)
  testSplitAverageLinearVelocity(sessionManager, 3.924160330362038)
  testSplitMaximumLinearVelocity(sessionManager, 4.117785235208213)
  testSplitMinimumPower(sessionManager, 134.02976389064236)
  testSplitAveragePower(sessionManager, 172.0743823122024)
  testSplitMaximumPower(sessionManager, 195.68893992339216)
  testSplitMinimumStrokedistance(sessionManager, 9.199351375038782)
  testSplitAverageStrokedistance(sessionManager, 9.732214638190051)
  testSplitMaximumStrokedistance(sessionManager, 9.906993788503808)
  testSplitMinimumStrokerate(sessionManager, 22.763981039266426)
  testSplitAverageStrokerate(sessionManager, 24.325048492560988)
  testSplitMaximumStrokerate(sessionManager, 26.84163443333606)
  testSplitMinimumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSplitAverageDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
  testSplitMaximumDragfactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
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

  const sessionManager = createSessionManager(testConfig)

  testSessionType(sessionManager, 'justrow')
  testIntervalType(sessionManager, 'justrow')
  testSplitType(sessionManager, 'justrow')

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'distance',
    targetDistance: 500,
    split: {
      type: 'distance',
      targetDistance: 100
    }
  }
  intervalSettings[1] = {
    type: 'distance',
    targetDistance: 9000,
    split: {
      type: 'distance',
      targetDistance: 100
    }
  }
  intervalSettings[2] = {
    type: 'distance',
    targetDistance: 250,
    split: {
      type: 'distance',
      targetDistance: 50
    }
  }

  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testSessionType(sessionManager, 'distance')
  testSessionDistanceTarget(sessionManager, 9750)
  testIntervalType(sessionManager, 'distance')
  testIntervalDistanceTarget(sessionManager, 500)
  testSplitType(sessionManager, 'distance')
  testSplitDistanceTarget(sessionManager, 100)

  testSessionState(sessionManager, 'WaitingForStart')
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/Topiom_V2_1magnet.csv', realtime: false, loop: false })

  // Test Instantanuous metrics
  testIsMoving(sessionManager, false)
  testIsDriveStart(sessionManager, false)
  testIsRecoveryStart(sessionManager, false)
  testIsSessionStart(sessionManager, false)
  testIsIntervalEnd(sessionManager, false)
  testIsSplitEnd(sessionManager, false)
  testIsPauseStart(sessionManager, false)
  testIsPauseEnd(sessionManager, false)
  testIsSessionStop(sessionManager, false)
  testTotalMovingTime(sessionManager, 2432.9155719999935)
  testTotalLinearDistance(sessionManager, 9750.32925067486)
  testTotalWork(sessionManager, 389658.6272505622)
  testTotalCalories(sessionManager, 573.8464188576778)
  testTotalCaloriesPerMinute(sessionManager, 14.089001689755378)
  testTotalCaloriesPerHour (sessionManager, 845.3401013853281)
  testTotalNumberOfStrokes(sessionManager, 1197)
  testStrokeState(sessionManager, 'Stopped')
  testStrokeWork(sessionManager, undefined)
  testStrokeCalories(sessionManager, undefined)
  testCycleDistance(sessionManager, undefined)
  testCycleStrokeRate(sessionManager, undefined)
  testCycleDuration(sessionManager, undefined)
  testCycleLinearVelocity(sessionManager, undefined)
  testCyclePace(sessionManager, Infinity)
  testCyclePower(sessionManager, undefined)
  testDriveLastStartTime (sessionManager, 2431.637963999994)
  testDriveDuration(sessionManager, undefined)
  testDriveLength(sessionManager, undefined)
  testDriveDistance(sessionManager, undefined)
  testDriveAverageHandleForce(sessionManager, undefined)
  testDrivePeakHandleForce(sessionManager, undefined)
  testRecoveryDuration(sessionManager, undefined)
  testDragFactor(sessionManager, rowerProfiles.Topiom_V2.dragFactor)

  // Test session metrics
  testSessionType(sessionManager, 'distance')
  testSessionState(sessionManager, 'Stopped')
  testSessionTime(sessionManager, 2432.9155719999935)
  testSessionMovingTimeTarget(sessionManager, undefined)
  testSessionMovingTimeToEnd(sessionManager, undefined)
  testSessionMovingTimeProjectedEnd(sessionManager, undefined) // ToDo: this shouldn't happen here
  testSessionTimeSpentTotal(sessionManager, 2432.9155719999935)
  testSessionTimeSpentMoving(sessionManager, 2432.9155719999935)
  testSessionTimeSpentRest(sessionManager, 0)
  testSessionDistance(sessionManager, 9750.32925067486)
  testSessionDistanceToEnd(sessionManager, -0.32925067486030457)
  testSessionDistanceTarget(sessionManager, 9750)
  testSessionDistanceProjectedEnd(sessionManager, 9750)
  testSessionWorkSinceStart(sessionManager, 389658.6272505622)
  testSessionCaloriesSinceStart(sessionManager, 573.8464188576778)
  testSessionCaloriesTarget(sessionManager, undefined)
  testSessionCaloriesToEnd(sessionManager, undefined)
  testSessionNumberOfStrokes(sessionManager, 1197)
  testSessionMinimumPace(sessionManager, 147.9541799693056)
  testSessionAveragePace(sessionManager, 124.76068804710371)
  testSessionMaximumPace(sessionManager, 111.12145640036526)
  testSessionMinimumLinearVelocity(sessionManager, 3.3794246306777502)
  testSessionAverageLinearVelocity(sessionManager, 4.00767267178924)
  testSessionMaximumLinearVelocity(sessionManager, 4.499581054792191)
  testSessionMinimumPower(sessionManager, 108.06531570463927)
  testSessionAveragePower(sessionManager, 181.19846622634458)
  testSessionMaximumPower(sessionManager, 255.1001602742786)
  testSessionMinimumStrokedistance(sessionManager, 6.972670768262592)
  testSessionAverageStrokedistance(sessionManager, 8.145903250004125)
  testSessionMaximumStrokedistance(sessionManager, 10.142066572018908)
  testSessionMinimumStrokerate(sessionManager, 22.84859530644136)
  testSessionAverageStrokerate(sessionManager, 29.608922791741428)
  testSessionMaximumStrokerate(sessionManager, 34.282599466678214)
  testSessionMinimumDragfactor(sessionManager, rowerProfiles.Topiom_V2.dragFactor)
  testSessionAverageDragfactor(sessionManager, rowerProfiles.Topiom_V2.dragFactor)
  testSessionMaximumDragfactor(sessionManager, rowerProfiles.Topiom_V2.dragFactor)
  testSessionNumberOfIntervals(sessionManager, 3)

  // Test interval metrics
  testIntervalNumber(sessionManager, 2)
  testIntervalWorkoutStepNumber(sessionManager, 2)
  testIntervalType(sessionManager, 'distance')
  testIntervalTime(sessionManager, 64.48709848756016)
  testIntervalMovingTimeTarget(sessionManager, undefined)
  testIntervalMovingTimeToEnd(sessionManager, undefined)
  testIntervalMovingTimeProjectedEnd(sessionManager, undefined)
  testIntervalTimeSpentTotal(sessionManager, 64.48709848756016)
  testIntervalTimeSpentMoving(sessionManager, 64.48709848756016)
  testIntervalTimeSpentRest(sessionManager, 0)
  testIntervalDistance(sessionManager, 250.3292506748603)
  testIntervalDistanceToEnd(sessionManager, -0.32925067486030457)
  testIntervalDistanceTarget(sessionManager, 250)
  testIntervalDistanceProjectedEnd(sessionManager, 250)
  testIntervalWorkSinceStart(sessionManager, 9227.220060500782)
  testIntervalCaloriesSinceStart(sessionManager, 14.161753503011823)
  testIntervalCaloriesTarget(sessionManager, undefined)
  testIntervalCaloriesToEnd(sessionManager, undefined)
  testIntervalNumberOfStrokes(sessionManager, 32)
  testIntervalMinimumPace(sessionManager, 133.61334401029237)
  testIntervalAveragePace(sessionManager, 128.8045610205559)
  testIntervalMaximumPace(sessionManager, 123.55398008655672)
  testIntervalMinimumLinearVelocity(sessionManager, 3.742141203811833)
  testIntervalAverageLinearVelocity(sessionManager, 3.8818501149210474)
  testIntervalMaximumLinearVelocity(sessionManager, 4.046814191252447)
  testIntervalMinimumPower(sessionManager, 146.73036837002923)
  testIntervalAveragePower(sessionManager, 163.8471136333915)
  testIntervalMaximumPower(sessionManager, 185.5762542665804)
  testIntervalMinimumStrokedistance(sessionManager, 7.60654992901347)
  testIntervalAverageStrokedistance(sessionManager, 7.879605567491548)
  testIntervalMaximumStrokedistance(sessionManager, 8.874308250516695)
  testIntervalMinimumStrokerate(sessionManager, 25.698286695229694)
  testIntervalAverageStrokerate(sessionManager, 29.621301413174997)
  testIntervalMaximumStrokerate(sessionManager, 31.92042026424608)
  testIntervalMinimumDragfactor(sessionManager, rowerProfiles.Topiom_V2.dragFactor)
  testIntervalAverageDragfactor(sessionManager, rowerProfiles.Topiom_V2.dragFactor)
  testIntervalMaximumDragfactor(sessionManager, rowerProfiles.Topiom_V2.dragFactor)

  // Test split metrics
  testSplitNumber(sessionManager, 99)
  testSplitType(sessionManager, 'distance')
  testSplitTime(sessionManager, 12.648056983593506)
  testSplitMovingTimeTarget(sessionManager, undefined)
  testSplitMovingTimeToEnd(sessionManager, undefined)
  testSplitMovingTimeProjectedEnd(sessionManager, undefined)
  testSplitTimeSpentTotal(sessionManager, 12.648056983593506)
  testSplitTimeSpentMoving(sessionManager, 12.648056983593506)
  testSplitTimeSpentRest(sessionManager, 0)
  testSplitDistance(sessionManager, 50.329250674860305)
  testSplitDistanceToEnd(sessionManager, -0.32925067486030457)
  testSplitDistanceTarget(sessionManager, 50)
  testSplitDistanceProjectedEnd(sessionManager, 50)
  testSplitWorkSinceStart(sessionManager, 2029.636451979808)
  testSplitCaloriesSinceStart(sessionManager, 2.9585661590861037)
  testSplitCaloriesTarget(sessionManager, undefined)
  testSplitCaloriesToEnd(sessionManager, undefined)
  testSplitNumberOfStrokes(sessionManager, 6)
  testSplitMinimumPace(sessionManager, 130.63855511990764)
  testSplitAveragePace(sessionManager, 125.65314219859098)
  testSplitMaximumPace(sessionManager, 124.33928429500929)
  testSplitMinimumLinearVelocity(sessionManager, 3.8273540268496618)
  testSplitAverageLinearVelocity(sessionManager, 3.9792080902343465)
  testSplitMaximumLinearVelocity(sessionManager, 4.02125525199013)
  testSplitMinimumPower(sessionManager, 156.98409507930535)
  testSplitAveragePower(sessionManager, 170.9494558731423)
  testSplitMaximumPower(sessionManager, 182.073722133524)
  testSplitMinimumStrokedistance(sessionManager, 7.60654992901347)
  testSplitAverageStrokedistance(sessionManager, 7.968766592300473)
  testSplitMaximumStrokedistance(sessionManager, 8.874308250516695)
  testSplitMinimumStrokerate(sessionManager, 26.504301316804746)
  testSplitAverageStrokerate(sessionManager, 29.73253731594018)
  testSplitMaximumStrokerate(sessionManager, 31.490574870944158)
  testSplitMinimumDragfactor(sessionManager, rowerProfiles.Topiom_V2.dragFactor)
  testSplitAverageDragfactor(sessionManager, rowerProfiles.Topiom_V2.dragFactor)
  testSplitMaximumDragfactor(sessionManager, rowerProfiles.Topiom_V2.dragFactor)
})

/**
 * @todo Add tests for rest intervals
 */

function testSessionState (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().sessionState === expectedValue, `session state should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} is ${sessionManager.getMetrics().sessionState}`)

  switch (expectedValue) {
    case ('Stopped'):
      if (sessionManager.getMetrics().metricsContext.isSessionStop) { assert.ok(!sessionManager.getMetrics().metricsContext.isMoving, `isMoving must be false if session state is ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime}`) }
      break
    case ('Paused'):
      assert.ok(!sessionManager.getMetrics().metricsContext.isSessionStop, `isSessionStop must be false if session state is ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime}`)
      break
    case ('WaitingForStart'):
      assert.ok(!sessionManager.getMetrics().metricsContext.isSessionStop, `isSessionStop must be false if session state is ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime}`)
      break
    // No default
  }
}

function testTotalMovingTime (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().totalMovingTime === expectedValue, `totalMovingTime should be ${expectedValue} sec at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().totalMovingTime}`)
}

function testIsMoving (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().metricsContext.isMoving === expectedValue, `isMoving should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().metricsContext.isMoving}`)
}

function testIsDriveStart (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().metricsContext.isDriveStart === expectedValue, `isDriveStart should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().metricsContext.isDriveStart}`)
}

function testIsRecoveryStart (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().metricsContext.isRecoveryStart === expectedValue, `isRecoveryStart should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().metricsContext.isRecoveryStart}`)
}

function testIsSessionStart (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().metricsContext.isSessionStart === expectedValue, `isSessionStart should be ${expectedValue} at ${sessionManager.getMetrics().metricsContext.isSessionStart} seconds, is ${sessionManager.getMetrics().metricsContext.isSessionStart}`)
}

function testIsIntervalEnd (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().metricsContext.isIntervalEnd === expectedValue, `isIntervalEnd should be ${expectedValue} at ${sessionManager.getMetrics().metricsContext.isSessionStart} seconds, is ${sessionManager.getMetrics().metricsContext.isIntervalEnd}`)
}

function testIsSplitEnd (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().metricsContext.isSplitEnd === expectedValue, `isSplitEnd should be ${expectedValue} at ${sessionManager.getMetrics().metricsContext.isSessionStart} seconds, is ${sessionManager.getMetrics().metricsContext.isSplitEnd}`)
}

function testIsPauseStart (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().metricsContext.isPauseStart === expectedValue, `isPauseStart should be ${expectedValue} at ${sessionManager.getMetrics().metricsContext.isSessionStart} seconds, is ${sessionManager.getMetrics().metricsContext.isPauseStart}`)
}

function testIsPauseEnd (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().metricsContext.isPauseEnd === expectedValue, `isPauseEnd should be ${expectedValue} at ${sessionManager.getMetrics().metricsContext.isSessionStart} seconds, is ${sessionManager.getMetrics().metricsContext.isPauseEnd}`)
}

function testIsSessionStop (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().metricsContext.isSessionStop === expectedValue, `isSessionStop should be ${expectedValue} at ${sessionManager.getMetrics().metricsContext.isSessionStart} seconds, is ${sessionManager.getMetrics().metricsContext.isSessionStop}`)
}

function testStrokeState (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().strokeState === expectedValue, `strokeState should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().strokeState}`)
}

function testTotalNumberOfStrokes (sessionManager, expectedValue) {
  // Please note there is a stroke 0
  assert.ok(sessionManager.getMetrics().totalNumberOfStrokes === expectedValue, `totalNumberOfStrokes should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().totalNumberOfStrokes}`)
}

function testTotalLinearDistance (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().totalLinearDistance === expectedValue, `totalLinearDistance should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().totalLinearDistance}`)
}

function testTotalWork (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().totalWork === expectedValue, `totalWork should be ${expectedValue} Joules at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().totalWork}`)
}

function testTotalCalories (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().totalCalories === expectedValue, `totalCalories should be ${expectedValue} kCal at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().totalCalories}`)
}

function testTotalCaloriesPerMinute (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().totalCaloriesPerMinute === expectedValue, `totalCaloriesPerMinute should be ${expectedValue} kCal at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().totalCaloriesPerMinute}`)
}

function testTotalCaloriesPerHour (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().totalCaloriesPerHour === expectedValue, `totalCaloriesPerHour should be ${expectedValue} kCal at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().totalCaloriesPerHour}`)
}

function testStrokeWork (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().strokeWork === expectedValue, ` should be ${expectedValue} Joules at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().strokeWork}`)
}

function testStrokeCalories (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().strokeCalories === expectedValue, `strokeCalories should be ${expectedValue} kCal at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().strokeCalories}`)
}

function testCycleDistance (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().cycleDistance === expectedValue, `cycleDistance should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().cycleDistance}`)
}

function testCycleStrokeRate (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().cycleStrokeRate === expectedValue, ` should be ${expectedValue} SPM at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().cycleStrokeRate}`)
}

function testCycleDuration (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().cycleDuration === expectedValue, `cycleDuration should be ${expectedValue} sec at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().cycleDuration}`)
}

function testCycleLinearVelocity (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().cycleLinearVelocity === expectedValue, `cycleLinearVelocity should be ${expectedValue} m/s at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().cycleLinearVelocity}`)
}

function testCyclePace (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().cyclePace === expectedValue, `cyclePace should be ${expectedValue} sec/500m at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().cyclePace}`)
}

function testCyclePower (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().cyclePower === expectedValue, `cyclePower should be ${expectedValue} Watt at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().cyclePower}`)
}

function testDriveLastStartTime (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().driveLastStartTime === expectedValue, `driveLastStartTime should be ${expectedValue} sec at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().driveLastStartTime}`)
}

function testDriveDuration (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().driveDuration === expectedValue, `driveDuration should be ${expectedValue} sec at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().driveDuration}`)
}

function testDriveLength (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().driveLength === expectedValue, `driveLength should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().driveLength}`)
}

function testDriveDistance (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().driveDistance === expectedValue, `driveDistance should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().driveDistance}`)
}

function testDriveAverageHandleForce (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().driveAverageHandleForce === expectedValue, `driveAverageHandleForce should be ${expectedValue} Newton at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().driveAverageHandleForce}`)
}

function testDrivePeakHandleForce (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().drivePeakHandleForce === expectedValue, `drivePeakHandleForce should be ${expectedValue} Newton at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().drivePeakHandleForce}`)
}

function testRecoveryDuration (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().recoveryDuration === expectedValue, `recoveryDuration should be ${expectedValue} sec at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().recoveryDuration}`)
}

function testDragFactor (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().dragFactor === expectedValue, `dragFactor should be ${expectedValue} N*m*s^2 at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().dragFactor}`)
}

function testSessionType (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.type === expectedValue, `Session type should be ${expectedValue}, is ${sessionManager.getMetrics().workout.type}`)
}

function testSessionTime (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.movingTime.sinceStart === expectedValue, `Session moving time should be ${expectedValue} seconds at ${sessionManager.getMetrics().workout.movingTime.sinceStart} seconds`)
}

function testSessionMovingTimeTarget (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.movingTime.target === expectedValue, `workout.movingTime.target should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().workout.movingTime.target}`)
}

function testSessionMovingTimeToEnd (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.movingTime.toEnd === expectedValue, `workout.movingTime.toEnd should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().workout.movingTime.toEnd}`)
}

function testSessionMovingTimeProjectedEnd (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.movingTime.projectedEnd === expectedValue, `workout.movingTime.projectedEnd should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().workout.movingTime.projectedEnd}`)
}

function testSessionTimeSpentTotal (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.timeSpent.total === expectedValue, `workout.timeSpent.total should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().workout.timeSpent.total}`)
}

function testSessionTimeSpentMoving (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.timeSpent.moving === expectedValue, `workout.timeSpent.moving should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().workout.timeSpent.moving}`)
}

function testSessionTimeSpentRest (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.timeSpent.rest === expectedValue, `workout.timeSpent.rest should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().workout.timeSpent.rest}`)
}

function testSessionDistance (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.distance.fromStart === expectedValue, `Session distance should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().workout.distance.fromStart} meters`)
}

function testSessionDistanceToEnd (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.distance.toEnd === expectedValue, `workout.distance.toEnd should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().workout.distance.toEnd}`)
}

function testSessionDistanceTarget (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.distance.target === expectedValue, `workout.distance.target should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().workout.distance.target}`)
}

function testSessionDistanceProjectedEnd (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.distance.projectedEnd === expectedValue, `workout.distance.projectedEnd should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().workout.distance.projectedEnd}`)
}

function testSessionWorkSinceStart (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.work.sinceStart === expectedValue, `workout.work.sinceStart should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().workout.work.sinceStart}`)
}

function testSessionCaloriesSinceStart (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.calories.sinceStart === expectedValue, `workout.calories.sinceStart should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().workout.calories.sinceStart}`)
}

function testSessionCaloriesTarget (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.calories.target === expectedValue, `workout.calories.target should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().workout.calories.target}`)
}

function testSessionCaloriesToEnd (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.calories.toEnd === expectedValue, `workout.calories.toEnd should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().workout.calories.toEnd}`)
}

function testSessionNumberOfStrokes (sessionManager, expectedValue) {
  // Please note there is a stroke 0
  assert.ok(sessionManager.getMetrics().workout.numberOfStrokes === expectedValue, `Session numberOfStrokes should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().workout.numberOfStrokes}`)
}

function testSessionAveragePace (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.pace.average === expectedValue, `Session average pace should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().workout.pace.average} sec/500 meters`)
}

function testSessionMinimumPace (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.pace.minimum === expectedValue, `Session minimum pace should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().workout.pace.minimum} sec/500 meters`)
}

function testSessionMaximumPace (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.pace.maximum === expectedValue, `Session maximum pace should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().workout.pace.maximum} sec/500 meters`)
}

function testSessionMinimumLinearVelocity (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.linearVelocity.minimum === expectedValue, `workout.linearVelocity.minimum should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().workout.linearVelocity.minimum}`)
}

function testSessionAverageLinearVelocity (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.linearVelocity.average === expectedValue, `workout.linearVelocity.average should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().workout.linearVelocity.average}`)
}

function testSessionMaximumLinearVelocity (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.linearVelocity.maximum === expectedValue, `workout.linearVelocity.maximum should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().workout.linearVelocity.maximum}`)
}

function testSessionAveragePower (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.power.average === expectedValue, `Session average power should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().workout.power.average} Watt`)
}

function testSessionMinimumPower (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.power.minimum === expectedValue, `Session minimum power should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().workout.power.minimum} Watt`)
}

function testSessionMaximumPower (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.power.maximum === expectedValue, `Session maximum power should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().workout.power.maximum} Watt`)
}

function testSessionAverageStrokedistance (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.strokeDistance.average === expectedValue, `Session average strokeDistance should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().workout.strokeDistance.average} meters`)
}

function testSessionMinimumStrokedistance (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.strokeDistance.minimum === expectedValue, `Session minimum strokeDistance should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().workout.strokeDistance.minimum} meters`)
}

function testSessionMaximumStrokedistance (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.strokeDistance.maximum === expectedValue, `Session maximum strokeDistance should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().workout.strokeDistance.maximum} meters`)
}

function testSessionAverageStrokerate (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.strokerate.average === expectedValue, `Session average strokerate should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().workout.strokerate.average} SPM`)
}

function testSessionMinimumStrokerate (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.strokerate.minimum === expectedValue, `Session minimum strokerate should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().workout.strokerate.minimum} SPM`)
}

function testSessionMaximumStrokerate (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.strokerate.maximum === expectedValue, `Session maximum strokerate should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().workout.strokerate.maximum} SPM`)
}

function testSessionAverageDragfactor (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.dragfactor.average === expectedValue, `Session average dragfactor should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().workout.dragfactor.average}`)
}

function testSessionMinimumDragfactor (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.dragfactor.minimum === expectedValue, `Session minimum dragfactor should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().workout.dragfactor.minimum}`)
}

function testSessionMaximumDragfactor (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.dragfactor.maximum === expectedValue, `Session maximum dragfactor should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().workout.dragfactor.maximum}`)
}

function testSessionNumberOfIntervals (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().workout.numberOfIntervals === expectedValue, `workout.numberOfIntervals should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().workout.numberOfIntervals}`)
}

function testIntervalNumber (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.workoutStepNumber === expectedValue, `Last interval number should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().interval.workoutStepNumber}`)
}

function testIntervalWorkoutStepNumber (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.workoutStepNumber === expectedValue, `interval.workoutStepNumber should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().interval.workoutStepNumber}`)
}

function testIntervalType (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.type === expectedValue, `Interval type should be ${expectedValue}, is ${sessionManager.getMetrics().interval.type}`)
}

function testIntervalTime (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.movingTime.sinceStart === expectedValue, `Last interval moving time should be ${expectedValue} seconds at ${sessionManager.getMetrics().interval.movingTime.sinceStart} seconds`)
}

function testIntervalMovingTimeTarget (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.movingTime.target === expectedValue, `interval.movingTime.target should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().interval.movingTime.target}`)
}

function testIntervalMovingTimeToEnd (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.movingTime.toEnd === expectedValue, `interval.movingTime.toEnd should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().interval.movingTime.toEnd}`)
}

function testIntervalMovingTimeProjectedEnd (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.movingTime.projectedEnd === expectedValue, `interval.movingTime.projectedEnd should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().interval.movingTime.projectedEnd}`)
}

function testIntervalTimeSpentTotal (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.timeSpent.total === expectedValue, `interval.timeSpent.total should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().interval.timeSpent.total}`)
}

function testIntervalTimeSpentMoving (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.timeSpent.moving === expectedValue, `interval.timeSpent.moving should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().interval.timeSpent.moving}`)
}

function testIntervalTimeSpentRest (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.timeSpent.rest === expectedValue, `interval.timeSpent.rest should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().interval.timeSpent.rest}`)
}

function testIntervalDistance (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.distance.fromStart === expectedValue, `Last interval distance should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().interval.distance.fromStart} meters`)
}

function testIntervalDistanceToEnd (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.distance.toEnd === expectedValue, `interval.distance.toEnd should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().interval.distance.toEnd}`)
}

function testIntervalDistanceTarget (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.distance.target === expectedValue, `interval.distance.target should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().interval.distance.target}`)
}

function testIntervalDistanceProjectedEnd (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.distance.projectedEnd === expectedValue, `interval.distance.projectedEnd should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().interval.distance.projectedEnd}`)
}

function testIntervalWorkSinceStart (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.work.sinceStart === expectedValue, `interval.work.sinceStart should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().interval.work.sinceStart}`)
}

function testIntervalCaloriesSinceStart (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.calories.sinceStart === expectedValue, `interval.calories.sinceStart should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().interval.calories.sinceStart}`)
}

function testIntervalCaloriesTarget (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.calories.target === expectedValue, `interval.calories.target should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().interval.calories.target}`)
}

function testIntervalCaloriesToEnd (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.calories.toEnd === expectedValue, `interval.calories.toEnd should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().interval.calories.toEnd}`)
}

function testIntervalNumberOfStrokes (sessionManager, expectedValue) {
  // Please note there is a stroke 0
  assert.ok(sessionManager.getMetrics().interval.numberOfStrokes === expectedValue, `Interval numberOfStrokes should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().interval.numberOfStrokes}`)
}

function testIntervalAveragePace (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.pace.average === expectedValue, `Last interval average pace should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().interval.pace.average} sec/500 meters`)
}

function testIntervalMinimumPace (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.pace.minimum === expectedValue, `Last interval minimum pace should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().interval.pace.minimum} sec/500 meters`)
}

function testIntervalMaximumPace (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.pace.maximum === expectedValue, `Last interval maximum pace should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().interval.pace.maximum} sec/500 meters`)
}

function testIntervalMinimumLinearVelocity (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.linearVelocity.minimum === expectedValue, `interval.linearVelocity.minimum should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().interval.linearVelocity.minimum}`)
}

function testIntervalAverageLinearVelocity (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.linearVelocity.average === expectedValue, `interval.linearVelocity.average should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().interval.linearVelocity.average}`)
}

function testIntervalMaximumLinearVelocity (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.linearVelocity.maximum === expectedValue, `interval.linearVelocity.maximum should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().interval.linearVelocity.maximum}`)
}

function testIntervalAveragePower (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.power.average === expectedValue, `Last interval average power should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().interval.power.average} Watt`)
}

function testIntervalMinimumPower (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.power.minimum === expectedValue, `Last interval minimum power should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().interval.power.minimum} Watt`)
}

function testIntervalMaximumPower (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.power.maximum === expectedValue, `Last interval maximum power should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().interval.power.maximum} Watt`)
}

function testIntervalAverageStrokedistance (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.strokeDistance.average === expectedValue, `Last interval average strokeDistance should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().interval.strokeDistance.average} meters`)
}

function testIntervalMinimumStrokedistance (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.strokeDistance.minimum === expectedValue, `Last interval minimum strokeDistance should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().interval.strokeDistance.minimum} meters`)
}

function testIntervalMaximumStrokedistance (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.strokeDistance.maximum === expectedValue, `Last interval maximum strokeDistance should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().interval.strokeDistance.maximum} meters`)
}

function testIntervalAverageStrokerate (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.strokerate.average === expectedValue, `Last interval average strokerate should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().interval.strokerate.average} SPM`)
}

function testIntervalMinimumStrokerate (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.strokerate.minimum === expectedValue, `Last interval minimum strokerate should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().interval.strokerate.minimum} SPM`)
}

function testIntervalMaximumStrokerate (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.strokerate.maximum === expectedValue, `Last interval maximum strokerate should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().interval.strokerate.maximum} SPM`)
}

function testIntervalAverageDragfactor (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.dragfactor.average === expectedValue, `Last interval average dragfactor should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().interval.dragfactor.average}`)
}

function testIntervalMinimumDragfactor (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.dragfactor.minimum === expectedValue, `Last interval minimum dragfactor should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().interval.dragfactor.minimum}`)
}

function testIntervalMaximumDragfactor (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().interval.dragfactor.maximum === expectedValue, `Last interval maximum dragfactor should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().interval.dragfactor.maximum}`)
}

function testSplitNumber (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.number === expectedValue, `Last split number should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().split.number}`)
}

function testSplitType (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.type === expectedValue, `Split type should be ${expectedValue}, is ${sessionManager.getMetrics().split.type}`)
}

function testSplitTime (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.movingTime.sinceStart === expectedValue, `Last split moving time should be ${expectedValue} seconds at ${sessionManager.getMetrics().split.movingTime.sinceStart} seconds`)
}

function testSplitMovingTimeTarget (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.movingTime.target === expectedValue, `split.movingTime.target should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().split.movingTime.target}`)
}

function testSplitMovingTimeToEnd (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.movingTime.toEnd === expectedValue, `split.movingTime.toEnd should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().split.movingTime.toEnd}`)
}

function testSplitMovingTimeProjectedEnd (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.movingTime.projectedEnd === expectedValue, `split.movingTime.projectedEnd should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().split.movingTime.projectedEnd}`)
}

function testSplitTimeSpentTotal (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.timeSpent.total === expectedValue, `split.timeSpent.total should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().split.timeSpent.total}`)
}

function testSplitTimeSpentMoving (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.timeSpent.moving === expectedValue, `split.timeSpent.moving should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().split.timeSpent.moving}`)
}

function testSplitTimeSpentRest (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.timeSpent.rest === expectedValue, `split.timeSpent.rest should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().split.timeSpent.rest}`)
}

function testSplitDistance (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.distance.fromStart === expectedValue, `Last split distance should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().split.distance.fromStart} meters`)
}

function testSplitDistanceToEnd (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.distance.toEnd === expectedValue, `split.distance.toEnd should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().split.distance.toEnd}`)
}

function testSplitDistanceTarget (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.distance.target === expectedValue, `split.distance.target should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().split.distance.target}`)
}

function testSplitDistanceProjectedEnd (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.distance.projectedEnd === expectedValue, `split.distance.projectedEnd should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().split.distance.projectedEnd}`)
}

function testSplitWorkSinceStart (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.work.sinceStart === expectedValue, `split.work.sinceStart should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().split.work.sinceStart}`)
}

function testSplitCaloriesSinceStart (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.calories.sinceStart === expectedValue, `split.calories.sinceStart should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().split.calories.sinceStart}`)
}

function testSplitCaloriesTarget (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.calories.target === expectedValue, `split.calories.target should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().split.calories.target}`)
}

function testSplitCaloriesToEnd (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.calories.toEnd === expectedValue, `split.calories.toEnd should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().split.calories.toEnd}`)
}

function testSplitNumberOfStrokes (sessionManager, expectedValue) {
  // Please note there is a stroke 0
  assert.ok(sessionManager.getMetrics().split.numberOfStrokes === expectedValue, `Split numberOfStrokes should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().split.numberOfStrokes}`)
}

function testSplitAveragePace (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.pace.average === expectedValue, `Last split average pace should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().split.pace.average} sec/500 meters`)
}

function testSplitMinimumPace (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.pace.minimum === expectedValue, `Last split minimum pace should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().split.pace.minimum} sec/500 meters`)
}

function testSplitMaximumPace (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.pace.maximum === expectedValue, `Last split maximum pace should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().split.pace.maximum} sec/500 meters`)
}

function testSplitMinimumLinearVelocity (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.linearVelocity.minimum === expectedValue, `split.linearVelocity.minimum should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().split.linearVelocity.minimum}`)
}

function testSplitAverageLinearVelocity (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.linearVelocity.average === expectedValue, `split.linearVelocity.average should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().split.linearVelocity.average}`)
}

function testSplitMaximumLinearVelocity (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.linearVelocity.maximum === expectedValue, `split.linearVelocity.maximum should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} seconds, is ${sessionManager.getMetrics().split.linearVelocity.maximum}`)
}

function testSplitAveragePower (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.power.average === expectedValue, `Last split average power should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().split.power.average} Watt`)
}

function testSplitMinimumPower (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.power.minimum === expectedValue, `Last split minimum power should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().split.power.minimum} Watt`)
}

function testSplitMaximumPower (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.power.maximum === expectedValue, `Last split maximum power should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().split.power.maximum} Watt`)
}

function testSplitAverageStrokedistance (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.strokeDistance.average === expectedValue, `Last split average strokeDistance should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().split.strokeDistance.average} meters`)
}

function testSplitMinimumStrokedistance (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.strokeDistance.minimum === expectedValue, `Last split minimum strokeDistance should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().split.strokeDistance.minimum} meters`)
}

function testSplitMaximumStrokedistance (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.strokeDistance.maximum === expectedValue, `Last split maximum strokeDistance should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().split.strokeDistance.maximum} meters`)
}

function testSplitAverageStrokerate (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.strokerate.average === expectedValue, `Last split average strokerate should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().split.strokerate.average} SPM`)
}

function testSplitMinimumStrokerate (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.strokerate.minimum === expectedValue, `Last split minimum strokerate should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().split.strokerate.minimum} SPM`)
}

function testSplitMaximumStrokerate (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.strokerate.maximum === expectedValue, `Last split maximum strokerate should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().split.strokerate.maximum} SPM`)
}

function testSplitAverageDragfactor (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.dragfactor.average === expectedValue, `Last split average dragfactor should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().split.dragfactor.average}`)
}

function testSplitMinimumDragfactor (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.dragfactor.minimum === expectedValue, `Last split minimum dragfactor should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().split.dragfactor.minimum}`)
}

function testSplitMaximumDragfactor (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().split.dragfactor.maximum === expectedValue, `Last split maximum dragfactor should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().split.dragfactor.maximum}`)
}

function reportAll (sessionManager) { // eslint-disable-line no-unused-vars
  assert.ok(0, `time: ${sessionManager.getMetrics().totalMovingTime}, state ${sessionManager.getMetrics().strokeState}, No Strokes: ${sessionManager.getMetrics().totalNumberOfStrokes}, Lin Distance: ${sessionManager.getMetrics().totalLinearDistance}, cycle dur: ${sessionManager.getMetrics().cycleDuration}, cycle Lin Dist: ${sessionManager.getMetrics().cycleLinearDistance}, Lin Velocity: ${sessionManager.getMetrics().cycleLinearVelocity}, Power: ${sessionManager.getMetrics().cyclePower}, Drive Dur: ${sessionManager.getMetrics().driveDuration}, Drive Lin. Dist. ${sessionManager.driveDistance}, Drive Length: ${sessionManager.getMetrics().driveLength}, Av. Handle Force: ${sessionManager.getMetrics().driveAverageHandleForce}, Peak Handle Force: ${sessionManager.getMetrics().drivePeakHandleForce}, Rec. Dur: ${sessionManager.getMetrics().recoveryDuration}, Dragfactor: ${sessionManager.getMetrics().dragFactor}, Inst Handle Power: ${sessionManager.getMetrics().instantHandlePower}`)
}

test.run()
