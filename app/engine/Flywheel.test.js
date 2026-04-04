'use strict'
/**
 * @copyright {@link https://github.com/JaapvanEkris/openrowingmonitor|OpenRowingMonitor}
 *
 * @file Tests of the Flywheel object
 */
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { deepMerge } from '../tools/Helper.js'
import { replayRowingSession } from '../recorders/RowingReplayer.js'
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
  systematicErrorAgressiveness: 0,
  systematicErrorNumberOfDatapoints: 1,
  minimumStrokeQuality: 0.36,
  minimumForceBeforeStroke: 10,
  minimumRecoverySlope: 0.00070,
  autoAdjustRecoverySlope: true,
  autoAdjustRecoverySlopeMargin: 0.15,
  minimumDriveTime: 0.40,
  minimumRecoveryTime: 0.90,
  flywheelInertia: 0.1031,
  magicConstant: 2.8
}

/**
 * @description Test behaviour for no datapoints
 */
test('Init_01: Correct Flywheel behaviour at initialisation', () => {
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
  testIsPowered(flywheel, false)
})

/**
 * @todo Test behaviour for one datapoint
 */

/**
 * @todo Test behaviour for perfect upgoing flank
 */

/**
 * @todo Test behaviour for perfect downgoing flank
 */

/**
 * @description Test of the integration of the underlying FullTSQuadraticEstimator object
 * This uses the same data as the function y = 2 x^2 + 4 * x
 */
test('Theoretical_01: Test of correct algorithmic integration of FullTSQuadraticEstimator and Flywheel object for quadratic function f(x) = 2 * x^2 + 4 * x', () => {
  const testConfig = {
    numOfImpulsesPerRevolution: 6,
    sprocketRadius: 1,
    maximumStrokeTimeBeforePause: 6.0,
    dragFactor: 10,
    autoAdjustDragFactor: false,
    minimumDragQuality: 0.95,
    dragFactorSmoothing: 3,
    minimumTimeBetweenImpulses: 0,
    maximumTimeBetweenImpulses: 1,
    flankLength: 12,
    systematicErrorAgressiveness: 0,
    systematicErrorNumberOfDatapoints: 1,
    minimumStrokeQuality: 0.36,
    minimumForceBeforeStroke: 0,
    minimumRecoverySlope: 0.00070,
    autoAdjustRecoverySlope: false,
    autoAdjustRecoverySlopeMargin: 0.15,
    minimumDriveTime: 0.40,
    minimumRecoveryTime: 0.90,
    flywheelInertia: 0.1031,
    magicConstant: 2.8
  }
  const flywheel = createFlywheel(testConfig) // Please note, Datapoint 0 is automatically added by this initialisation
  flywheel.maintainStateAndMetrics()
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.234341433963188) // Datapoint 1
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.196461680094298) // Datapoint 2
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.172567188397595) // Datapoint 3
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.155718979643243) // Datapoint 4
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.143013206725950) // Datapoint 5
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.132987841748253) // Datapoint 6
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.124815090780014) // Datapoint 7
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.117986192571703) // Datapoint 8
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.112168841458569) // Datapoint 9
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.107135523306685) // Datapoint 10
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.102724506937187) // Datapoint 11
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.098817239158663) // Datapoint 12
  testDeltaTime(flywheel, 0) // Values from Datapoint 0 are now passsing through
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 4.000000000000004)
  testAngularAcceleration(flywheel, 3.99999999999998)
  flywheel.pushValue(0.095324565640171) // Datapoint 13
  testDeltaTime(flywheel, 0.234341433963188) // Values from Datapoint 1 are now passsing through
  testSpinningTime(flywheel, 0.234341433963188)
  testAngularPosition(flywheel, 1.0471975511965976)
  testAngularVelocity(flywheel, 4.937365735852752)
  testAngularAcceleration(flywheel, 3.999999999999979)
  flywheel.pushValue(0.092177973027300) // Datapoint 14
  testDeltaTime(flywheel, 0.196461680094298) // Values from Datapoint 2 are now passsing through
  testSpinningTime(flywheel, 0.430803114057486)
  testAngularPosition(flywheel, 2.0943951023931953)
  testAngularVelocity(flywheel, 5.723212456229939)
  testAngularAcceleration(flywheel, 3.999999999999979)
  flywheel.pushValue(0.089323823233014) // Datapoint 15
  testDeltaTime(flywheel, 0.172567188397595) // Values from Datapoint 3 are now passsing through
  testSpinningTime(flywheel, 0.6033703024550809)
  testAngularPosition(flywheel, 3.141592653589793)
  testAngularVelocity(flywheel, 6.413481209820315)
  testAngularAcceleration(flywheel, 3.9999999999999787)
  flywheel.pushValue(0.086719441920360) // Datapoint 16
  testDeltaTime(flywheel, 0.155718979643243) // Values from Datapoint 4 are now passsing through
  testSpinningTime(flywheel, 0.7590892820983239)
  testAngularPosition(flywheel, 4.1887902047863905)
  testAngularVelocity(flywheel, 7.036357128393282)
  testAngularAcceleration(flywheel, 3.999999999999977)
  flywheel.pushValue(0.084330395149166) // Datapoint 17
  testDeltaTime(flywheel, 0.143013206725950) // Values from Datapoint 5 are now passsing through
  testSpinningTime(flywheel, 0.9021024888242739)
  testAngularPosition(flywheel, 5.235987755982988)
  testAngularVelocity(flywheel, 7.608409955297075)
  testAngularAcceleration(flywheel, 3.999999999999975)
  flywheel.pushValue(0.082128549835466) // Datapoint 18
  testDeltaTime(flywheel, 0.132987841748253) // Values from Datapoint 6 are now passsing through
  testSpinningTime(flywheel, 1.035090330572527)
  testAngularPosition(flywheel, 6.283185307179586)
  testAngularVelocity(flywheel, 8.140361322290087)
  testAngularAcceleration(flywheel, 3.9999999999999782)
  flywheel.pushValue(0.080090664596669) // Datapoint 19
  testDeltaTime(flywheel, 0.124815090780014) // Values from Datapoint 7 are now passsing through
  testSpinningTime(flywheel, 1.159905421352541)
  testAngularPosition(flywheel, 7.330382858376184)
  testAngularVelocity(flywheel, 8.639621685410138)
  testAngularAcceleration(flywheel, 3.99999999999998)
  flywheel.pushValue(0.078197347646078) // Datapoint 20
  testDeltaTime(flywheel, 0.117986192571703) // Values from Datapoint 8 are now passsing through
  testSpinningTime(flywheel, 1.277891613924244)
  testAngularPosition(flywheel, 8.377580409572781)
  testAngularVelocity(flywheel, 9.111566455696952)
  testAngularAcceleration(flywheel, 3.999999999999985)
  flywheel.pushValue(0.076432273828253) // Datapoint 21
  testDeltaTime(flywheel, 0.112168841458569) // Values from Datapoint 9 are now passsing through
  testSpinningTime(flywheel, 1.390060455382813)
  testAngularPosition(flywheel, 9.42477796076938)
  testAngularVelocity(flywheel, 9.560241821531228)
  testAngularAcceleration(flywheel, 3.9999999999999845)
  flywheel.pushValue(0.074781587915460) // Datapoint 22
  testDeltaTime(flywheel, 0.107135523306685) // Values from Datapoint 10 are now passsing through
  testSpinningTime(flywheel, 1.4971959786894982)
  testAngularPosition(flywheel, 10.471975511965976)
  testAngularVelocity(flywheel, 9.98878391475797)
  testAngularAcceleration(flywheel, 3.99999999999998)
  flywheel.pushValue(0.073233443959153) // Datapoint 23
  testDeltaTime(flywheel, 0.102724506937187) // Values from Datapoint 11 are now passsing through
  testSpinningTime(flywheel, 1.599920485626685)
  testAngularPosition(flywheel, 11.519173063162574)
  testAngularVelocity(flywheel, 10.399681942506724)
  testAngularAcceleration(flywheel, 3.999999999999972)
  flywheel.pushValue(0.071777645486524) // Datapoint 24
  testDeltaTime(flywheel, 0.098817239158663) // Values from Datapoint 12 are now passsing through
  testSpinningTime(flywheel, 1.6987377247853481)
  testAngularPosition(flywheel, 12.566370614359172)
  testAngularVelocity(flywheel, 10.794950899141375)
  testAngularAcceleration(flywheel, 3.99999999999996)
  flywheel.pushValue(0.070405361445316) // Datapoint 25
  testDeltaTime(flywheel, 0.095324565640171) // Values from Datapoint 13 are now passsing through
  testSpinningTime(flywheel, 1.794062290425519)
  testAngularPosition(flywheel, 13.613568165555769)
  testAngularVelocity(flywheel, 11.17624916170206)
  testAngularAcceleration(flywheel, 3.9999999999999463)
  flywheel.pushValue(0.069108899742145) // Datapoint 26
  testDeltaTime(flywheel, 0.092177973027300) // Values from Datapoint 14 are now passsing through
  testSpinningTime(flywheel, 1.886240263452819)
  testAngularPosition(flywheel, 14.660765716752367)
  testAngularVelocity(flywheel, 11.544961053811264)
  testAngularAcceleration(flywheel, 3.999999999999933)
  flywheel.pushValue(0.067881525062373) // Datapoint 27
  testDeltaTime(flywheel, 0.089323823233014) // Values from Datapoint 15 are now passsing through
  testSpinningTime(flywheel, 1.975564086685833)
  testAngularPosition(flywheel, 15.707963267948964)
  testAngularVelocity(flywheel, 11.902256346743307)
  testAngularAcceleration(flywheel, 3.9999999999999245)
  flywheel.pushValue(0.066717311088441) // Datapoint 28
  testDeltaTime(flywheel, 0.086719441920360) // Values from Datapoint 16 are now passsing through
  testSpinningTime(flywheel, 2.062283528606193)
  testAngularPosition(flywheel, 16.755160819145562)
  testAngularVelocity(flywheel, 12.249134114424734)
  testAngularAcceleration(flywheel, 3.9999999999999245)
  flywheel.pushValue(0.065611019694526) // Datapoint 29
  testDeltaTime(flywheel, 0.084330395149166) // Values from Datapoint 17 are now passsing through
  testSpinningTime(flywheel, 2.1466139237553588)
  testAngularPosition(flywheel, 17.80235837034216)
  testAngularVelocity(flywheel, 12.586455695021384)
  testAngularAcceleration(flywheel, 3.9999999999999396)
  flywheel.pushValue(0.064558001484125) // Datapoint 30
  testDeltaTime(flywheel, 0.082128549835466) // Values from Datapoint 18 are now passsing through
  testSpinningTime(flywheel, 2.228742473590825)
  testAngularPosition(flywheel, 18.84955592153876)
  testAngularVelocity(flywheel, 12.914969894363232)
  testAngularAcceleration(flywheel, 3.9999999999999574)
  flywheel.pushValue(0.063554113352442) // Datapoint 31
  testDeltaTime(flywheel, 0.080090664596669) // Values from Datapoint 19 are now passsing through
  testSpinningTime(flywheel, 2.308833138187494)
  testAngularPosition(flywheel, 19.896753472735355)
  testAngularVelocity(flywheel, 13.235332552749886)
  testAngularAcceleration(flywheel, 3.9999999999999867)
})

/**
 * @description Test of the integration of the underlying FullTSQuadraticEstimator object
 * The data follows the function y = X^3 + 2 * x^2 + 4 * x
 * To test if multiple quadratic regressions can decently approximate a cubic function
 */
test('Theoretical_02: Test of correct algorithmic integration of FullTSQuadraticEstimator and Flywheel object for cubic function f(x) = X^3 + 2 * x^2 + 4 * x', () => {
  const testConfig = {
    numOfImpulsesPerRevolution: 6,
    sprocketRadius: 1,
    maximumStrokeTimeBeforePause: 6.0,
    dragFactor: 10,
    autoAdjustDragFactor: false,
    minimumDragQuality: 0.95,
    dragFactorSmoothing: 3,
    minimumTimeBetweenImpulses: 0,
    maximumTimeBetweenImpulses: 1,
    flankLength: 12,
    systematicErrorAgressiveness: 0,
    systematicErrorNumberOfDatapoints: 1,
    minimumStrokeQuality: 0.36,
    minimumForceBeforeStroke: 0,
    minimumRecoverySlope: 0.00070,
    autoAdjustRecoverySlope: false,
    autoAdjustRecoverySlopeMargin: 0.15,
    minimumDriveTime: 0.40,
    minimumRecoveryTime: 0.90,
    flywheelInertia: 0.1031,
    magicConstant: 2.8
  }
  const flywheel = createFlywheel(testConfig) // Please note, Datapoint 0 is automatically added by this initialisation
  flywheel.maintainStateAndMetrics()
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.231815755285445) // Datapoint 1
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.186170118209325) // Datapoint 2
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.155673811324399) // Datapoint 3
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.134264409859047) // Datapoint 4
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.118490308292909) // Datapoint 5
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.106396192260267) // Datapoint 6
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.096822693623239) // Datapoint 7
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.08904704613513) // Datapoint 8
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.08259777558252) // Datapoint 9
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.077155055952201) // Datapoint 10
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.072494552013330) // Datapoint 11
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.068454336759262) // Datapoint 12
  testDeltaTime(flywheel, 0) // Values from Datapoint 0 are now passsing through
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 3.1619218560691382) // Theoretical value: 4
  testAngularAcceleration(flywheel, 7.251023549310239) // Theoretical value: 4
  flywheel.pushValue(0.064914611722656) // Datapoint 13
  testDeltaTime(flywheel, 0.231815755285445) // Values from Datapoint 1 are now passsing through
  testSpinningTime(flywheel, 0.231815755285445)
  testAngularPosition(flywheel, 1.0471975511965976)
  testAngularVelocity(flywheel, 4.7950174071704375) // Theoretical value: 5.088478654, error: -6,64%
  testAngularAcceleration(flywheel, 7.324931550092107) // Theoretical value: 5.390894532, error: 38,46%
  flywheel.pushValue(0.061784830519864) // Datapoint 14
  testDeltaTime(flywheel, 0.186170118209325) // Values from Datapoint 2 are now passsing through
  testSpinningTime(flywheel, 0.41798587349477)
  testAngularPosition(flywheel, 2.0943951023931953)
  testAngularVelocity(flywheel, 6.098616558470422) // Theoretical value: 6.196080065, error: -2,14%
  testAngularAcceleration(flywheel, 7.6561044943826655) // Theoretical value: 6.507915241, error: 18,21%
  flywheel.pushValue(0.058995265576639) // Datapoint 15
  testDeltaTime(flywheel, 0.155673811324399) // Values from Datapoint 3 are now passsing through
  testSpinningTime(flywheel, 0.5736596848191691)
  testAngularPosition(flywheel, 3.141592653589793)
  testAngularVelocity(flywheel, 7.261045146876231) // Theoretical value: 7.281895041, error: -0,79%
  testAngularAcceleration(flywheel, 8.125127482273879) // Theoretical value: 7.441958109, error: 9,49%
  flywheel.pushValue(0.056491331538715) // Datapoint 16
  testDeltaTime(flywheel, 0.134264409859047) // Values from Datapoint 4 are now passsing through
  testSpinningTime(flywheel, 0.707924094678216)
  testAngularPosition(flywheel, 4.1887902047863905)
  testAngularVelocity(flywheel, 8.335452316712825) // Theoretical value: 8.33516595, error: -0,42%
  testAngularAcceleration(flywheel, 8.591085532405152) // Theoretical value: 8.247544568, error: 4,32%
  flywheel.pushValue(0.054229670373632) // Datapoint 17
  testDeltaTime(flywheel, 0.118490308292909) // Values from Datapoint 5 are now passsing through
  testSpinningTime(flywheel, 0.826414402971125)
  testAngularPosition(flywheel, 5.235987755982988)
  testAngularVelocity(flywheel, 9.346198019520214) // Theoretical value: 9.354539908, error: -0,44%
  testAngularAcceleration(flywheel, 9.058162877855903) // Theoretical value: 8.958486418, error: 1,06%
  flywheel.pushValue(0.052175392433679) // Datapoint 18
  testDeltaTime(flywheel, 0.106396192260267) // Values from Datapoint 6 are now passsing through
  testSpinningTime(flywheel, 0.932810595231392)
  testAngularPosition(flywheel, 6.283185307179586)
  testAngularVelocity(flywheel, 10.314972131734738) // Theoretical value: 10.3416492, error: -0,56%
  testAngularAcceleration(flywheel, 9.531782371110172) // Theoretical value: 9.596863571, error: -0,95%
  flywheel.pushValue(0.05030009417797) // Datapoint 19
  testDeltaTime(flywheel, 0.096822693623239) // Values from Datapoint 7 are now passsing through
  testSpinningTime(flywheel, 1.029633288854631)
  testAngularPosition(flywheel, 7.330382858376184)
  testAngularVelocity(flywheel, 11.253026452431792) // Theoretical value: 11.29896728, error: -0,68%
  testAngularAcceleration(flywheel, 10.006689891934712) // Theoretical value: 10.17779973, error: -2,15%
  flywheel.pushValue(0.04858040892819) // Datapoint 20
  testDeltaTime(flywheel, 0.08904704613513) // Values from Datapoint 8 are now passsing through
  testSpinningTime(flywheel, 1.118680334989761)
  testAngularPosition(flywheel, 8.377580409572781)
  testAngularVelocity(flywheel, 12.167114512288897) // Theoretical value: 12.22905842, error: -0,76%
  testAngularAcceleration(flywheel, 10.479926499860289) // Theoretical value: 10.71208201, error: -2,78%
  flywheel.pushValue(0.046996930546829) // Datapoint 21
  testDeltaTime(flywheel, 0.08259777558252) // Values from Datapoint 9 are now passsing through
  testSpinningTime(flywheel, 1.201278110572281)
  testAngularPosition(flywheel, 9.42477796076938)
  testAngularVelocity(flywheel, 13.062289353874645) // Theoretical value: 13.13431974, error: -0,79%
  testAngularAcceleration(flywheel, 10.945741904208647) // Theoretical value: 11.20766866, error: -3,03%
  flywheel.pushValue(0.045533402601137) // Datapoint 22
  testDeltaTime(flywheel, 0.077155055952201) // Values from Datapoint 10 are now passsing through
  testSpinningTime(flywheel, 1.278433166524482)
  testAngularPosition(flywheel, 10.471975511965976)
  testAngularVelocity(flywheel, 13.94075092506632) // Theoretical value: 14.01690675, error: -0,78%
  testAngularAcceleration(flywheel, 11.403650671998298) // Theoretical value: 11.670599, error: -2,98%
  flywheel.pushValue(0.044176099545603) // Datapoint 23
  testDeltaTime(flywheel, 0.072494552013330) // Values from Datapoint 11 are now passsing through
  testSpinningTime(flywheel, 1.350927718537812)
  testAngularPosition(flywheel, 11.519173063162574)
  testAngularVelocity(flywheel, 14.80669498176648) // Theoretical value: 14.87872798, error: -0,69%
  testAngularAcceleration(flywheel, 11.856689681955814) // Theoretical value: 12.10556631, error: -2,69%
  flywheel.pushValue(0.042913348809906) // Datapoint 24
  testDeltaTime(flywheel, 0.068454336759262) // Values from Datapoint 12 are now passsing through
  testSpinningTime(flywheel, 1.419382055297074)
  testAngularPosition(flywheel, 12.566370614359172)
  testAngularVelocity(flywheel, 15.659331443649155) // Theoretical value: 15.72146448, error: -0,57%
  testAngularAcceleration(flywheel, 12.303309060000915) // Theoretical value: 12.51629233, error: -2,22%
  flywheel.pushValue(0.041735157665124) // Datapoint 25
  testDeltaTime(flywheel, 0.064914611722656) // Values from Datapoint 13 are now passsing through, so we cleared all startup noise
  testSpinningTime(flywheel, 1.484296667019730)
  testAngularPosition(flywheel, 13.613568165555769)
  testAngularVelocity(flywheel, 16.492736768968747) // Theoretical value: 16.54659646, error: -0,47%
  testAngularAcceleration(flywheel, 12.721354618621062) // Theoretical value: 12.90578, error: -1,86%
  flywheel.pushValue(0.040632918960300) // Datapoint 26
  testDeltaTime(flywheel, 0.061784830519864) // Values from Datapoint 14 are now passsing through
  testSpinningTime(flywheel, 1.546081497539594)
  testAngularPosition(flywheel, 14.660765716752367)
  testAngularVelocity(flywheel, 17.307691210719753) // Theoretical value: 17.35542998, error: -0,40%
  testAngularAcceleration(flywheel, 13.11397255097641) // Theoretical value: 13.27648899, error: -1,59%
  flywheel.pushValue(0.039599176898486) // Datapoint 27
  testDeltaTime(flywheel, 0.058995265576639) // Values from Datapoint 15 are now passsing through
  testSpinningTime(flywheel, 1.605076763116233)
  testAngularPosition(flywheel, 15.707963267948964)
  testAngularVelocity(flywheel, 18.10649398672465) // Theoretical value: 18.1491213, error: -0,34%
  testAngularAcceleration(flywheel, 13.486098587071863) // Theoretical value: 13.63046058, error: -1,38%
  flywheel.pushValue(0.038627438996519) // Datapoint 28
  testDeltaTime(flywheel, 0.056491331538715) // Values from Datapoint 16 are now passsing through
  testSpinningTime(flywheel, 1.661568094654948)
  testAngularPosition(flywheel, 16.755160819145562)
  testAngularVelocity(flywheel, 18.890426542395847) // Theoretical value: 18.92869798, error: -0,29%
  testAngularAcceleration(flywheel, 13.840428977171639) // Theoretical value: 13.96940857, error: -1,20%
  flywheel.pushValue(0.037712023914259) // Datapoint 29
  testDeltaTime(flywheel, 0.054229670373632) // Values from Datapoint 17 are now passsing through
  testSpinningTime(flywheel, 1.715797765028580)
  testAngularPosition(flywheel, 17.80235837034216)
  testAngularVelocity(flywheel, 19.660398675998614) // Theoretical value: 19.69507697, error: -0,26%
  testAngularAcceleration(flywheel, 14.178743620219855) // Theoretical value: 14.29478659, error: -1,06%
  flywheel.pushValue(0.036847937394809) // Datapoint 30
  testDeltaTime(flywheel, 0.052175392433679) // Values from Datapoint 18 are now passsing through
  testSpinningTime(flywheel, 1.767973157462259)
  testAngularPosition(flywheel, 18.84955592153876)
  testAngularVelocity(flywheel, 20.41744737019342) // Theoretical value: 20.44907989, error: -0,23%
  testAngularAcceleration(flywheel, 14.502790132816358) // Theoretical value: 14.60783894, error: -0,94%
  flywheel.pushValue(0.036030770419579) // Datapoint 31
  testDeltaTime(flywheel, 0.05030009417797) // Values from Datapoint 19 are now passsing through
  testSpinningTime(flywheel, 1.8182732516402291)
  testAngularPosition(flywheel, 19.896753472735355)
  testAngularVelocity(flywheel, 21.162376267362376) // Theoretical value: 21.19144586, error: -0,20%
  testAngularAcceleration(flywheel, 14.813903373334538) // Theoretical value: 14.90963951, error: -0,83%
})

/**
 * @description Test of the integration of the underlying FullTSQuadraticEstimator object
 * The data follows the function y = X^3 + 2 * x^2 + 4 * x with a +/-0.0001 sec injected noise in currentDt
 * To test if multiple quadratic regressions can decently approximate a cubic function with noise
 * Please note:  theoretical values are based on the perfect function (i.e. without noise)
 */
test('Theoretical_03: Test of correct algorithmic integration of FullTSQuadraticEstimator and Flywheel object for cubic function f(x) = X^3 + 2 * x^2 + 4 * x with +/- 0.0001 error', () => {
  const testConfig = {
    numOfImpulsesPerRevolution: 6,
    sprocketRadius: 1,
    maximumStrokeTimeBeforePause: 6.0,
    dragFactor: 10,
    autoAdjustDragFactor: false,
    minimumDragQuality: 0.95,
    dragFactorSmoothing: 3,
    minimumTimeBetweenImpulses: 0,
    maximumTimeBetweenImpulses: 1,
    flankLength: 12,
    systematicErrorAgressiveness: 0,
    systematicErrorNumberOfDatapoints: 1,
    minimumStrokeQuality: 0.36,
    minimumForceBeforeStroke: 0,
    minimumRecoverySlope: 0.00070,
    autoAdjustRecoverySlope: false,
    autoAdjustRecoverySlopeMargin: 0.15,
    minimumDriveTime: 0.40,
    minimumRecoveryTime: 0.90,
    flywheelInertia: 0.1031,
    magicConstant: 2.8
  }
  const flywheel = createFlywheel(testConfig) // Please note, Datapoint 0 is automatically added by this initialisation
  flywheel.maintainStateAndMetrics()
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.231915755285445) // Datapoint 1
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.186070118209325) // Datapoint 2
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.155773811324398) // Datapoint 3
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.134164409859047) // Datapoint 4
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.118590308292909) // Datapoint 5
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.106296192260267) // Datapoint 6
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.096922693623239) // Datapoint 7
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.08894704613513) // Datapoint 8
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.08269777558252) // Datapoint 9
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.077055055952201) // Datapoint 10
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.07259455201333) // Datapoint 11
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.068354336759262) // Datapoint 12
  testDeltaTime(flywheel, 0) // Values from Datapoint 0 are now passsing through
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 3.1651252708296993) // Theoretical value: 4
  testAngularAcceleration(flywheel, 7.2468812808500696) // Theoretical value: 4
  flywheel.pushValue(0.065014611722656) // Datapoint 13
  testDeltaTime(flywheel, 0.231915755285445) // Values from Datapoint 1 are now passsing through
  testSpinningTime(flywheel, 0.231915755285445)
  testAngularPosition(flywheel, 1.0471975511965976)
  testAngularVelocity(flywheel, 4.7981896825575205) // Theoretical value: 5.088478654, error: -6.58%
  testAngularAcceleration(flywheel, 7.320784012928006) // Theoretical value: 5.390894532, error: 38.38%
  flywheel.pushValue(0.061684830519864) // Datapoint 14
  testDeltaTime(flywheel, 0.186070118209325) // Values from Datapoint 2 are now passsing through
  testSpinningTime(flywheel, 0.41798587349477)
  testAngularPosition(flywheel, 2.0943951023931953)
  testAngularVelocity(flywheel, 6.100352571838149) // Theoretical value: 6.196080065, error: -2.11%
  testAngularAcceleration(flywheel, 7.650380140052492) // Theoretical value: 6.507915241, error: 18.14%
  flywheel.pushValue(0.059095265576639) // Datapoint 15
  testDeltaTime(flywheel, 0.155773811324398) // Values from Datapoint 3 are now passsing through
  testSpinningTime(flywheel, 0.573759684819168)
  testAngularPosition(flywheel, 3.141592653589793)
  testAngularVelocity(flywheel, 7.262664999379819) // Theoretical value: 7.281895041, error: -0.77%
  testAngularAcceleration(flywheel, 8.117964017032822) // Theoretical value: 7.441958109, error: 9.40%
  flywheel.pushValue(0.056391331538715) // Datapoint 16
  testDeltaTime(flywheel, 0.134164409859047) // Values from Datapoint 4 are now passsing through
  testSpinningTime(flywheel, 0.7079240946782149)
  testAngularPosition(flywheel, 4.1887902047863905)
  testAngularVelocity(flywheel, 8.335671487914347) // Theoretical value: 8.33516595, error: -0.42%
  testAngularAcceleration(flywheel, 8.58427221387106) // Theoretical value: 8.247544568, error: 4.24%
  flywheel.pushValue(0.054329670373632) // Datapoint 17
  testDeltaTime(flywheel, 0.118590308292909) // Values from Datapoint 5 are now passsing through
  testSpinningTime(flywheel, 0.8265144029711239)
  testAngularPosition(flywheel, 5.235987755982988)
  testAngularVelocity(flywheel, 9.347109926263196) // Theoretical value: 9.354539908, error: -0.44%
  testAngularAcceleration(flywheel, 9.052626876076234) // Theoretical value: 8.958486418, error: 1.00%
  flywheel.pushValue(0.052075392433679) // Datapoint 18
  testDeltaTime(flywheel, 0.106296192260267) // Values from Datapoint 6 are now passsing through
  testSpinningTime(flywheel, 0.9328105952313909)
  testAngularPosition(flywheel, 6.283185307179586)
  testAngularVelocity(flywheel, 10.314706935144432) // Theoretical value: 10.3416492, error: -0.56%
  testAngularAcceleration(flywheel, 9.52653469078407) // Theoretical value: 9.596863571, error: -1.00%
  flywheel.pushValue(0.05040009417797) // Datapoint 19
  testDeltaTime(flywheel, 0.096922693623239) // Values from Datapoint 7 are now passsing through
  testSpinningTime(flywheel, 1.0297332888546298)
  testAngularPosition(flywheel, 7.330382858376184)
  testAngularVelocity(flywheel, 11.253653421461035) // Theoretical value: 11.29896728, error: -0.67%
  testAngularAcceleration(flywheel, 10.001358612662711) // Theoretical value: 10.17779973, error: -2.21%
  flywheel.pushValue(0.04848040892819) // Datapoint 20
  testDeltaTime(flywheel, 0.08894704613513) // Values from Datapoint 8 are now passsing through
  testSpinningTime(flywheel, 1.1186803349897598)
  testAngularPosition(flywheel, 8.377580409572781)
  testAngularVelocity(flywheel, 12.166767447463288) // Theoretical value: 12.22905842, error: -0.76%
  testAngularAcceleration(flywheel, 10.47394441606818) // Theoretical value: 10.71208201, error: -2.84%
  flywheel.pushValue(0.047096930546829) // Datapoint 21
  testDeltaTime(flywheel, 0.08269777558252) // Values from Datapoint 9 are now passsing through
  testSpinningTime(flywheel, 1.2013781105722798)
  testAngularPosition(flywheel, 9.42477796076938)
  testAngularVelocity(flywheel, 13.062997567333893) // Theoretical value: 13.13431974, error: -0.79%
  testAngularAcceleration(flywheel, 10.940063240068076) // Theoretical value: 11.20766866, error: -3.08%
  flywheel.pushValue(0.045433402601137) // Datapoint 22
  testDeltaTime(flywheel, 0.077055055952201) // Values from Datapoint 10 are now passsing through
  testSpinningTime(flywheel, 1.2784331665244808)
  testAngularPosition(flywheel, 10.471975511965976)
  testAngularVelocity(flywheel, 13.940480188006552) // Theoretical value: 14.01690675, error: -0.78%
  testAngularAcceleration(flywheel, 11.397389413208364) // Theoretical value: 11.670599, error: -3.04%
  flywheel.pushValue(0.044276099545603) // Datapoint 23
  testDeltaTime(flywheel, 0.07259455201333) // Values from Datapoint 11 are now passsing through
  testSpinningTime(flywheel, 1.3510277185378108)
  testAngularPosition(flywheel, 11.519173063162574)
  testAngularVelocity(flywheel, 14.807840698982423) // Theoretical value: 14.87872798, error: -0.68%
  testAngularAcceleration(flywheel, 11.848780564150369) // Theoretical value: 12.10556631, error: -2.76%
  flywheel.pushValue(0.042813348809906) // Datapoint 24
  testDeltaTime(flywheel, 0.068354336759262) // Values from Datapoint 12 are now passsing through
  testSpinningTime(flywheel, 1.4193820552970728)
  testAngularPosition(flywheel, 12.566370614359172)
  testAngularVelocity(flywheel, 15.65917726721796) // Theoretical value: 15.72146448, error: -0.57%
  testAngularAcceleration(flywheel, 12.293943915780252) // Theoretical value: 12.51629233, error: -2.30%
  flywheel.pushValue(0.041835157665124) // Datapoint 25
  testDeltaTime(flywheel, 0.065014611722656) // Values from Datapoint 13 are now passsing through, so we cleared all startup noise
  testSpinningTime(flywheel, 1.4843966670197288)
  testAngularPosition(flywheel, 13.613568165555769)
  testAngularVelocity(flywheel, 16.49447250537608) // Theoretical value: 16.54659646, error: -0.46%
  testAngularAcceleration(flywheel, 12.710407075508567) // Theoretical value: 12.90578, error: -1.95%
  flywheel.pushValue(0.040532918960300) // Datapoint 26
  testDeltaTime(flywheel, 0.061684830519864) // Values from Datapoint 14 are now passsing through
  testSpinningTime(flywheel, 1.546081497539593)
  testAngularPosition(flywheel, 14.660765716752367)
  testAngularVelocity(flywheel, 17.308891329044464) // Theoretical value: 17.35542998, error: -0.39%
  testAngularAcceleration(flywheel, 13.100466914875906) // Theoretical value: 13.27648899, error: -1.70%
  flywheel.pushValue(0.039699176898486) // Datapoint 27
  testDeltaTime(flywheel, 0.059095265576639) // Values from Datapoint 15 are now passsing through
  testSpinningTime(flywheel, 1.605176763116232)
  testAngularPosition(flywheel, 15.707963267948964)
  testAngularVelocity(flywheel, 18.109702829774772) // Theoretical value: 18.1491213, error: -0.32%
  testAngularAcceleration(flywheel, 13.469377816872242) // Theoretical value: 13.63046058, error: -1.51%
  flywheel.pushValue(0.038527438996519) // Datapoint 28
  testDeltaTime(flywheel, 0.056391331538715) // Values from Datapoint 16 are now passsing through
  testSpinningTime(flywheel, 1.661568094654947)
  testAngularPosition(flywheel, 16.755160819145562)
  testAngularVelocity(flywheel, 18.892749084779705) // Theoretical value: 18.92869798, error: -0.28%
  testAngularAcceleration(flywheel, 13.819955339924142) // Theoretical value: 13.96940857, error: -1.35%
  flywheel.pushValue(0.037812023914259) // Datapoint 29
  testDeltaTime(flywheel, 0.054329670373632) // Values from Datapoint 17 are now passsing through
  testSpinningTime(flywheel, 1.715897765028579)
  testAngularPosition(flywheel, 17.80235837034216)
  testAngularVelocity(flywheel, 19.664430174199474) // Theoretical value: 19.69507697, error: -0.24%
  testAngularAcceleration(flywheel, 14.154531841302834) // Theoretical value: 14.29478659, error: -1.23%
  flywheel.pushValue(0.036747937394809) // Datapoint 30
  testDeltaTime(flywheel, 0.052075392433679) // Values from Datapoint 18 are now passsing through
  testSpinningTime(flywheel, 1.767973157462258)
  testAngularPosition(flywheel, 18.84955592153876)
  testAngularVelocity(flywheel, 20.419916102229333) // Theoretical value: 20.44907989, error: -0.21%
  testAngularAcceleration(flywheel, 14.474639639378996) // Theoretical value: 14.60783894, error: -1.13%
  flywheel.pushValue(0.036130770419579) // Datapoint 31
  testDeltaTime(flywheel, 0.05040009417797) // Values from Datapoint 19 are now passsing through
  testSpinningTime(flywheel, 1.818373251640228)
  testAngularPosition(flywheel, 19.896753472735355)
  testAngularVelocity(flywheel, 21.16654168342182) // Theoretical value: 21.19144586, error: -0.18%
  testAngularAcceleration(flywheel, 14.782028789603949) // Theoretical value: 14.90963951, error: -1.05%
})

/**
 * @todo Test behaviour with noise CEC filter active
 */

/**
 * @description Test behaviour for perfect stroke
 */
test('Theoretical_04: Correct Flywheel behaviour for a noisefree stroke', () => {
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
  testIsPowered(flywheel, false)
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
  testAngularPosition(flywheel, 7.330382858376184)
  testAngularVelocity(flywheel, 94.88636656676766)
  testAngularAcceleration(flywheel, 28.483961147946758)
  testTorque(flywheel, 3.9270728759800413)
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
  testAngularPosition(flywheel, 23.03834612632515)
  testAngularVelocity(flywheel, 97.06865123831865)
  testAngularAcceleration(flywheel, -32.75873752642214)
  testTorque(flywheel, -2.340970303119225)
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
  testAngularPosition(flywheel, 38.746309394274114)
  testAngularVelocity(flywheel, 52.0369112052433)
  testAngularAcceleration(flywheel, -172.04934534879823)
  testTorque(flywheel, -17.440425091405032)
  testDragFactor(flywheel, 0.00011)
  testIsDwelling(flywheel, true)
  testIsUnpowered(flywheel, true)
  testIsPowered(flywheel, false)
})

/**
 * @todo Test behaviour for noisy upgoing flank
 */

/**
 * @todo Test behaviour for noisy downgoing flank
 */

/**
 * @todo Test behaviour for noisy stroke
 */

/**
 * @todo Test drag factor calculation
 */

/**
 * @todo Test Dynamic stroke detection
 */

/**
 * @description Test behaviour for not maintaining metrics
 */
test('Theoretical_05: Correct Flywheel behaviour at maintainStateOnly', () => {
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
  testIsPowered(flywheel, false)
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

/**
 * @description Test against a theoretical model, based on perfect clean data, as described in
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/discussions/215|this discussion}
 */
test('Theoretical_06: Correct Flywheel behaviour with perfect clean data', async () => {
  const flywheel = createFlywheel(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Theoretical_Model))
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testDragFactor(flywheel, (rowerProfiles.Theoretical_Model.dragFactor / 1000000))
  flywheel.maintainStateAndMetrics()

  // Inject the data
  await replayRowingSession(flywheel.pushValue, { filename: 'recordings/Theoretical_Simulation_Clean.csv', realtime: false, loop: false })

  testSpinningTime(flywheel, 98.9709819388311)
  testAngularPosition(flywheel, 7972.314957259698)
  testDeltaTime(flywheel, 0.05977130668982511)
  testAngularVelocity(flywheel, 17.531701264128273)
  testAngularAcceleration(flywheel, -0.3470957714275053)
  testTorque(flywheel, -0.013843769373297968)
  testIsDwelling(flywheel, true)
  testIsUnpowered(flywheel, true)
  testIsPowered(flywheel, false)
  testDragFactor(flywheel, (rowerProfiles.Theoretical_Model.dragFactor / 1000000)) // As Flywheel.js doesn't detect strokes (this is a function of Rower.js), the dragcalculation shouldn't be triggered
})

/**
 * @description Test against a theoretical model, based on noise-injected data, as described in
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/discussions/215|this discussion}
 */
test('Theoretical_07: Correct Flywheel behaviour with noise-injected data', async () => {
  const flywheel = createFlywheel(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Theoretical_Model))
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testDragFactor(flywheel, (rowerProfiles.Theoretical_Model.dragFactor / 1000000))
  flywheel.maintainStateAndMetrics()

  // Inject the data
  await replayRowingSession(flywheel.pushValue, { filename: 'recordings/Theoretical_Simulation_Random_Noise.csv', realtime: false, loop: false })

  testSpinningTime(flywheel, 248.53909245603822)
  testAngularPosition(flywheel, 21826.738559590685)
  testDeltaTime(flywheel, 0.09678841914560446)
  testAngularVelocity(flywheel, 10.812632937564636)
  testAngularAcceleration(flywheel, -0.1402363382869548)
  testTorque(flywheel, -0.0060875713516336544)
  testIsDwelling(flywheel, true)
  testIsUnpowered(flywheel, true)
  testIsPowered(flywheel, false)
  testDragFactor(flywheel, (rowerProfiles.Theoretical_Model.dragFactor / 1000000)) // As Flywheel.js doesn't detect strokes (this is a function of Rower.js), the dragcalculation shouldn't be triggered
})

/**
 * @description Test against a theoretical model, based on a simulation of magnet positioning errors, as described in
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/discussions/215|this discussion}
 * Magnet errors -0.01, +0.1, +0.2, -0.2, -0.1, +0.01 degrees
 */
test('Theoretical_08: Correct Flywheel behaviour with structural magnet errors', async () => {
  const flywheel = createFlywheel(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Theoretical_Model))
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testDragFactor(flywheel, (rowerProfiles.Theoretical_Model.dragFactor / 1000000))
  flywheel.maintainStateAndMetrics()

  // Inject the data
  await replayRowingSession(flywheel.pushValue, { filename: 'recordings/Theoretical_Simulation_Systematic_Noise.csv', realtime: false, loop: false })

  testSpinningTime(flywheel, 248.5384526565442)
  testAngularPosition(flywheel, 21826.738559590685)
  testDeltaTime(flywheel, 0.09696462739685785)
  testAngularVelocity(flywheel, 10.811915344241925)
  testAngularAcceleration(flywheel, -0.1416257800887151)
  testTorque(flywheel, -0.0062277096749287116)
  testIsDwelling(flywheel, true)
  testIsUnpowered(flywheel, true)
  testIsPowered(flywheel, false)
  testDragFactor(flywheel, (rowerProfiles.Theoretical_Model.dragFactor / 1000000)) // As Flywheel.js doesn't detect strokes (this is a function of Rower.js), the dragcalculation shouldn't be triggered
})

/**
 * @description Test behaviour for the C2 Model C
 */
test('C2_ModelC_01: A full session for a Concept2 Model C should produce plausible results', async () => {
  const flywheel = createFlywheel(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Concept2_Model_C))
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testDragFactor(flywheel, (rowerProfiles.Concept2_Model_C.dragFactor / 1000000))
  flywheel.maintainStateAndMetrics()

  await replayRowingSession(flywheel.pushValue, { filename: 'recordings/Concept2_Model_C.csv', realtime: false, loop: false })

  testSpinningTime(flywheel, 181.47141999999985)
  testAngularPosition(flywheel, 15634.659439365203)
  testDeltaTime(flywheel, 0.1269760000000133)
  testAngularVelocity(flywheel, 17.15696419975984)
  testAngularAcceleration(flywheel, 19.214668279855754)
  testTorque(flywheel, 1.9822842933004643)
  testIsDwelling(flywheel, false)
  testIsUnpowered(flywheel, false)
  testIsPowered(flywheel, false)
  testDragFactor(flywheel, (rowerProfiles.Concept2_Model_C.dragFactor / 1000000)) // As Flywheel.js doesn't detect strokes (this is a function of Rower.js), the dragcalculation shouldn't be triggered
})

/**
 * @description Test behaviour for the C2 RowErg
 */
test('C2_RowErg_01: A full session for a Concept2 RowErg should produce plausible results', async () => {
  const flywheel = createFlywheel(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Concept2_RowErg))
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testDragFactor(flywheel, (rowerProfiles.Concept2_RowErg.dragFactor / 1000000))
  flywheel.maintainStateAndMetrics()

  await replayRowingSession(flywheel.pushValue, { filename: 'recordings/Concept2_RowErg_Session_2000meters.csv', realtime: false, loop: false })

  testSpinningTime(flywheel, 591.0432650000008)
  testAngularPosition(flywheel, 65960.87935477128)
  testDeltaTime(flywheel, 0.009975)
  testAngularVelocity(flywheel, 103.61722616806219)
  testAngularAcceleration(flywheel, -10.88942996208896)
  testTorque(flywheel, -0.37568315550441544)
  testIsDwelling(flywheel, false)
  testIsUnpowered(flywheel, false)
  testIsPowered(flywheel, false)
  testDragFactor(flywheel, (rowerProfiles.Concept2_RowErg.dragFactor / 1000000)) // As Flywheel.js doesn't detect strokes (this is a function of Rower.js), the dragcalculation shouldn't be triggered
})

/**
 * @description Test behaviour for the DKN R-320
 */
test('DKN_R320_01: Correct Flywheel behaviour with a DKN R-320', async () => {
  const flywheel = createFlywheel(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.DKN_R320))

  testAngularPosition(flywheel, 0)
  testDragFactor(flywheel, (rowerProfiles.DKN_R320.dragFactor / 1000000))
  flywheel.maintainStateAndMetrics()

  // Inject 10 strokes
  await replayRowingSession(flywheel.pushValue, { filename: 'recordings/DKNR320.csv', realtime: false, loop: false })

  testSpinningTime(flywheel, 22.249536391000003)
  testAngularPosition(flywheel, 490.0884539600077)
  testDeltaTime(flywheel, 0.301283162)
  testAngularVelocity(flywheel, 18.449095403544845)
  testAngularAcceleration(flywheel, -13.540617584449196)
  testTorque(flywheel, -9.827554878438296)
  testIsDwelling(flywheel, false)
  testIsUnpowered(flywheel, true)
  testIsPowered(flywheel, false)
  testDragFactor(flywheel, (rowerProfiles.DKN_R320.dragFactor / 1000000)) // As Flywheel.js doesn't detect strokes (this is a function of Rower.js), the dragcalculation shouldn't be triggered
})

/**
 * @description Test behaviour for the NordicTrack RX800
 */
test('NordicT_RX800_01: Correct Flywheel behaviour with a NordicTrack RX800', async () => {
  const flywheel = createFlywheel(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.NordicTrack_RX800))
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testDragFactor(flywheel, (rowerProfiles.NordicTrack_RX800.dragFactor / 1000000))
  flywheel.maintainStateAndMetrics()

  // Inject data
  await replayRowingSession(flywheel.pushValue, { filename: 'recordings/RX800.csv', realtime: false, loop: false })

  testSpinningTime(flywheel, 22.721492397999985)
  testAngularPosition(flywheel, 1448.2742133048946)
  testDeltaTime(flywheel, 0.027508437)
  testAngularVelocity(flywheel, 56.91429403149175)
  testAngularAcceleration(flywheel, -9.697829866471647)
  testTorque(flywheel, -1.0167810813166995)
  testIsDwelling(flywheel, false)
  testIsUnpowered(flywheel, true)
  testIsPowered(flywheel, false)
  testDragFactor(flywheel, (rowerProfiles.NordicTrack_RX800.dragFactor / 1000000)) // As Flywheel.js doesn't detect strokes (this is a function of Rower.js), the dragcalculation shouldn't be triggered
})

/**
 * @description Test behaviour for the Merarch R50
 */
test('Merarch_R50_01: Correct Flywheel behaviour with a Merarch R50', async () => {
  const flywheel = createFlywheel(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Merach_R50))
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testDragFactor(flywheel, (rowerProfiles.Merach_R50.dragFactor / 1000000))
  flywheel.maintainStateAndMetrics()

  // Inject data
  await replayRowingSession(flywheel.pushValue, { filename: 'recordings/Merach_R50_510m.csv', realtime: false, loop: false })

  testSpinningTime(flywheel, 167.08544299999994)
  testAngularPosition(flywheel, 15104.777478459726)
  testDeltaTime(flywheel, 0.08684500000003936)
  testAngularVelocity(flywheel, 72.08365670111948)
  testAngularAcceleration(flywheel, -6.128049101129095)
  testTorque(flywheel, -0.08746742433423627)
  testIsDwelling(flywheel, true)
  testIsUnpowered(flywheel, true)
  testIsPowered(flywheel, false)
  testDragFactor(flywheel, (rowerProfiles.Merach_R50.dragFactor / 1000000)) // As Flywheel.js doesn't detect strokes (this is a function of Rower.js), the dragcalculation shouldn't be triggered
})

/**
 * @description Test behaviour for the Oartec Slider
 */
test('Oartec_Slider_01: Correct Flywheel behaviour with a Oartec Slider', async () => {
  const flywheel = createFlywheel(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Oartec_Slider))
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testDragFactor(flywheel, (rowerProfiles.Oartec_Slider.dragFactor / 1000000))
  flywheel.maintainStateAndMetrics()

  // Inject data
  await replayRowingSession(flywheel.pushValue, { filename: 'recordings/Oartec_Slider.csv', realtime: false, loop: false })

  testSpinningTime(flywheel, 67.32300999999995)
  testAngularPosition(flywheel, 5168.967112706406)
  testDeltaTime(flywheel, 0.08461499999998523)
  testAngularVelocity(flywheel, 24.795470297327896)
  testAngularAcceleration(flywheel, -0.9584556279706938)
  testTorque(flywheel, -0.009086457786651847)
  testIsDwelling(flywheel, true)
  testIsUnpowered(flywheel, true)
  testIsPowered(flywheel, false)
  testDragFactor(flywheel, (rowerProfiles.Oartec_Slider.dragFactor / 1000000)) // As Flywheel.js doesn't detect strokes (this is a function of Rower.js), the dragcalculation shouldn't be triggered
})

/**
 * @description Test behaviour for the Schwinn Windrigger
 */
test('Schwinn_Wndrggr_01: Correct Flywheel behaviour with a Schwinn Windrigger', async () => {
  const flywheel = createFlywheel(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Schwinn_Windrigger))
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testDragFactor(flywheel, (rowerProfiles.Schwinn_Windrigger.dragFactor / 1000000))
  flywheel.maintainStateAndMetrics()

  // Inject data
  await replayRowingSession(flywheel.pushValue, { filename: 'recordings/Schwinn_Windrigger.csv', realtime: false, loop: false })

  testSpinningTime(flywheel, 124.52743099999996)
  testAngularPosition(flywheel, 10197.609753552468)
  testDeltaTime(flywheel, 0.53818)
  testAngularVelocity(flywheel, 11.09436351003069)
  testAngularAcceleration(flywheel, -2.1935917561168776)
  testTorque(flywheel, -0.16317885032008017)
  testIsDwelling(flywheel, true)
  testIsUnpowered(flywheel, true)
  testIsPowered(flywheel, false)
  testDragFactor(flywheel, (rowerProfiles.Schwinn_Windrigger.dragFactor / 1000000)) // As Flywheel.js doesn't detect strokes (this is a function of Rower.js), the dragcalculation shouldn't be triggered
})

/**
 * @description Test behaviour for the WRX700
 */
test('Sportstech_WRX700_01: Correct Flywheel behaviour with a SportsTech WRX700', async () => {
  const flywheel = createFlywheel(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700))
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testDragFactor(flywheel, (rowerProfiles.Sportstech_WRX700.dragFactor / 1000000))
  flywheel.maintainStateAndMetrics()

  // Inject 16 strokes
  await replayRowingSession(flywheel.pushValue, { filename: 'recordings/WRX700_2magnets.csv', realtime: false, loop: false })

  testSpinningTime(flywheel, 46.302522627)
  testAngularPosition(flywheel, 738.2742735936014)
  testDeltaTime(flywheel, 0.374942146)
  testAngularVelocity(flywheel, 7.73724815197113)
  testAngularAcceleration(flywheel, -3.4832490689573206)
  testTorque(flywheel, -0.5922590427634897)
  testIsDwelling(flywheel, true)
  testIsUnpowered(flywheel, true)
  testIsPowered(flywheel, false)
  testDragFactor(flywheel, (rowerProfiles.Sportstech_WRX700.dragFactor / 1000000)) // As Flywheel.js doesn't detect strokes (this is a function of Rower.js), the dragcalculation shouldn't be triggered
})

/**
 * @description Test behaviour for the SportsTech WRX700
 */
test('Sportstech_WRX700_02: Correct Flywheel behaviour with a full session on a SportsTech WRX700', async () => {
  const flywheel = createFlywheel(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700))
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testDragFactor(flywheel, (rowerProfiles.Sportstech_WRX700.dragFactor / 1000000))
  flywheel.maintainStateAndMetrics()

  // Inject 846 strokes
  await replayRowingSession(flywheel.pushValue, { filename: 'recordings/WRX700_2magnets_session.csv', realtime: false, loop: false })

  testSpinningTime(flywheel, 2340.0100514160117)
  testAngularPosition(flywheel, 37322.120724646746)
  testDeltaTime(flywheel, 0.381367661)
  testAngularVelocity(flywheel, 7.510250158842609)
  testAngularAcceleration(flywheel, -3.3685328592655774)
  testTorque(flywheel, -0.6204202203225615)
  testIsDwelling(flywheel, true)
  testIsUnpowered(flywheel, true)
  testIsPowered(flywheel, false)
  testDragFactor(flywheel, (rowerProfiles.Sportstech_WRX700.dragFactor / 1000000)) // As Flywheel.js doesn't detect strokes (this is a function of Rower.js), the dragcalculation shouldn't be triggered
})

/**
 * @description Test behaviour for the Topiom V2
 */
test('TopiomV2_01: Correct Flywheel behaviour with a Topiom V2', async () => {
  const flywheel = createFlywheel(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Topiom_V2))
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testDragFactor(flywheel, (rowerProfiles.Topiom_V2.dragFactor / 1000000))
  flywheel.maintainStateAndMetrics()

  // Inject data
  await replayRowingSession(flywheel.pushValue, { filename: 'recordings/Topiom_V2_1magnet.csv', realtime: false, loop: false })

  testSpinningTime(flywheel, 2452.8183219999933)
  testAngularPosition(flywheel, 48562.739239191025)
  testDeltaTime(flywheel, 1.6244899999999802)
  testAngularVelocity(flywheel, 3.570665383502728)
  testAngularAcceleration(flywheel, -0.3302458188366401)
  testTorque(flywheel, 0.02904532439241564)
  testIsDwelling(flywheel, true)
  testIsUnpowered(flywheel, true)
  testIsPowered(flywheel, false)
  testDragFactor(flywheel, (rowerProfiles.Topiom_V2.dragFactor / 1000000)) // As Flywheel.js doesn't detect strokes (this is a function of Rower.js), the dragcalculation shouldn't be triggered
})

/**
 * @todo Test behaviour after reset
 */

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

function reportAll (flywheel) { // eslint-disable-line no-unused-vars
  assert.ok(0, `deltaTime: ${flywheel.deltaTime()}, spinningTime: ${flywheel.spinningTime()}, ang. pos: ${flywheel.angularPosition()}, ang. vel: ${flywheel.angularVelocity()}, Ang. acc: ${flywheel.angularAcceleration()}, Torque: ${flywheel.torque()}, DF: ${flywheel.dragFactor()}`)
}

test.run()
