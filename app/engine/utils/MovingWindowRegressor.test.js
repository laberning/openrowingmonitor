'use strict'
/**
 * @copyright [OpenRowingMonitor]{@link https://github.com/JaapvanEkris/openrowingmonitor}
 *
 * @file Tests of the movingRegressor object
 */
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { createMovingRegressor } from './MovingWindowRegressor.js'

function flywheelPosition (position) {
  return ((position * Math.PI) / 3)
}

/**
 * @description Test behaviour for no datapoints
 */
test('Correct movingRegressor behaviour at initialisation', () => {
  const flankLength = 12
  const movingRegressor = createMovingRegressor(flankLength)
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
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
test('Test of correct algorithmic integration of FullTSQuadraticEstimator and movingRegressor object for quadratic function f(x) = 2 * x^2 + 4 * x', () => {
  const flankLength = 12
  const movingRegressor = createMovingRegressor(flankLength)

  movingRegressor.push(0, flywheelPosition(0)) // Datapoint 0
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(0.234341433963188, flywheelPosition(1)) // Datapoint 1
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(0.430803114057485, flywheelPosition(2)) // Datapoint 2
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(0.603370302455080, flywheelPosition(3)) // Datapoint 3
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(0.759089282098323, flywheelPosition(4)) // Datapoint 4
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(0.902102488824273, flywheelPosition(5)) // Datapoint 5
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(1.035090330572530, flywheelPosition(6)) // Datapoint 6
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(1.159905421352540, flywheelPosition(7)) // Datapoint 7
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(1.27789161392424, flywheelPosition(8)) // Datapoint 8
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(1.39006045538281, flywheelPosition(9)) // Datapoint 9
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(1.4971959786895, flywheelPosition(10)) // Datapoint 10
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(1.59992048562668, flywheelPosition(11)) // Datapoint 11
  testFirstDerivative(movingRegressor, 4.0000000000000115) // Values from Datapoint 0 are now passsing through
  testSecondDerivative(movingRegressor, 3.9999999999999933)
  movingRegressor.push(1.69873772478535, flywheelPosition(12)) // Datapoint 12
  testFirstDerivative(movingRegressor, 4.937365735852762) // Values from Datapoint 1 are now passsing through
  testSecondDerivative(movingRegressor, 3.9999999999999925)
  movingRegressor.push(1.79406229042552, flywheelPosition(13)) // Datapoint 13
  testFirstDerivative(movingRegressor, 5.723212456229947) // Values from Datapoint 2 are now passsing through
  testSecondDerivative(movingRegressor, 3.999999999999984)
  movingRegressor.push(1.88624026345282, flywheelPosition(14)) // Datapoint 14
  testFirstDerivative(movingRegressor, 6.413481209820322) // Values from Datapoint 3 are now passsing through
  testSecondDerivative(movingRegressor, 3.9999999999999742)
  movingRegressor.push(1.97556408668583, flywheelPosition(15)) // Datapoint 15
  testFirstDerivative(movingRegressor, 7.036357128393286) // Values from Datapoint 4 are now passsing through
  testSecondDerivative(movingRegressor, 3.9999999999999747)
  movingRegressor.push(2.06228352860619, flywheelPosition(16)) // Datapoint 16
  testFirstDerivative(movingRegressor, 7.608409955297076) // Values from Datapoint 5 are now passsing through
  testSecondDerivative(movingRegressor, 3.999999999999983)
  movingRegressor.push(2.14661392375536, flywheelPosition(17)) // Datapoint 17
  testFirstDerivative(movingRegressor, 8.140361322290104) // Values from Datapoint 6 are now passsing through
  testSecondDerivative(movingRegressor, 3.9999999999999916)
  movingRegressor.push(2.22874247359082, flywheelPosition(18)) // Datapoint 18
  testFirstDerivative(movingRegressor, 8.639621685410132) // Values from Datapoint 7 are now passsing through
  testSecondDerivative(movingRegressor, 4.000000000000013)
  movingRegressor.push(2.30883313818749, flywheelPosition(19)) // Datapoint 19
  testFirstDerivative(movingRegressor, 9.111566455696927) // Values from Datapoint 8 are now passsing through
  testSecondDerivative(movingRegressor, 4.000000000000042)
  movingRegressor.push(2.38703048583357, flywheelPosition(20)) // Datapoint 20
  testFirstDerivative(movingRegressor, 9.560241821531205) // Values from Datapoint 9 are now passsing through
  testSecondDerivative(movingRegressor, 4.000000000000061)
  movingRegressor.push(2.46346275966182, flywheelPosition(21)) // Datapoint 21
  testFirstDerivative(movingRegressor, 9.988783914757967) // Values from Datapoint 10 are now passsing through
  testSecondDerivative(movingRegressor, 4.00000000000007)
  movingRegressor.push(2.53824434757728, flywheelPosition(22)) // Datapoint 22
  testFirstDerivative(movingRegressor, 10.399681942506692) // Values from Datapoint 11 are now passsing through
  testSecondDerivative(movingRegressor, 4.0000000000000835)
  movingRegressor.push(2.61147779153643, flywheelPosition(23)) // Datapoint 23
  testFirstDerivative(movingRegressor, 10.794950899141389) // Values from Datapoint 12 are now passsing through
  testSecondDerivative(movingRegressor, 4.0000000000000915)
  movingRegressor.push(2.68325543702296, flywheelPosition(24)) // Datapoint 24
  testFirstDerivative(movingRegressor, 11.176249161702088) // Values from Datapoint 13 are now passsing through
  testSecondDerivative(movingRegressor, 4.000000000000075)
  movingRegressor.push(2.75366079846827, flywheelPosition(25)) // Datapoint 25
  testFirstDerivative(movingRegressor, 11.544961053811306) // Values from Datapoint 14 are now passsing through
  testSecondDerivative(movingRegressor, 4.000000000000067)
  movingRegressor.push(2.82276969821042, flywheelPosition(26)) // Datapoint 26
  testFirstDerivative(movingRegressor, 11.902256346743357) // Values from Datapoint 15 are now passsing through
  testSecondDerivative(movingRegressor, 4.000000000000058)
  movingRegressor.push(2.89065122327279, flywheelPosition(27)) // Datapoint 27
  testFirstDerivative(movingRegressor, 12.249134114424805) // Values from Datapoint 16 are now passsing through
  testSecondDerivative(movingRegressor, 4.000000000000049)
  movingRegressor.push(2.95736853436123, flywheelPosition(28)) // Datapoint 28
  testFirstDerivative(movingRegressor, 12.586455695021487) // Values from Datapoint 17 are now passsing through
  testSecondDerivative(movingRegressor, 4.000000000000033)
  movingRegressor.push(3.02297955405576, flywheelPosition(29)) // Datapoint 29
  testFirstDerivative(movingRegressor, 12.91496989436332) // Values from Datapoint 18 are now passsing through
  testSecondDerivative(movingRegressor, 4.000000000000027)
  movingRegressor.push(3.08753755553988, flywheelPosition(30)) // Datapoint 30
  testFirstDerivative(movingRegressor, 13.23533255274999) // Values from Datapoint 19 are now passsing through
  testSecondDerivative(movingRegressor, 4.000000000000016)
  movingRegressor.push(3.15109166889232, flywheelPosition(31)) // Datapoint 31
  testFirstDerivative(movingRegressor, 13.548121943334301) // Values from Datapoint 20 are now passsing through
  testSecondDerivative(movingRegressor, 4.000000000000006)
})

/**
 * @description Test of the integration of the underlying FullTSQuadraticEstimator object
 * The data follows the function y = X^3 + 2 * x^2 + 4 * x
 * To test if multiple quadratic regressions can decently approximate a cubic function
 */
test('Test of correct algorithmic integration of FullTSQuadraticEstimator and movingRegressor object for cubic function f(x) = X^3 + 2 * x^2 + 4 * x', () => {
  const flankLength = 12
  const movingRegressor = createMovingRegressor(flankLength)

  movingRegressor.push(0, flywheelPosition(0)) // Datapoint 0
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(0.231815755285445, flywheelPosition(1)) // Datapoint 1
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(0.41798587349477, flywheelPosition(2)) // Datapoint 2
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(0.573659684819169, flywheelPosition(3)) // Datapoint 3
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(0.707924094678216, flywheelPosition(4)) // Datapoint 4
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(0.826414402971124, flywheelPosition(5)) // Datapoint 5
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(0.932810595231392, flywheelPosition(6)) // Datapoint 6
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(1.02963328885463, flywheelPosition(7)) // Datapoint 7
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(1.11868033498976, flywheelPosition(8)) // Datapoint 8
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(1.20127811057228, flywheelPosition(9)) // Datapoint 9
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(1.27843316652448, flywheelPosition(10)) // Datapoint 10
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(1.35092771853781, flywheelPosition(11)) // Datapoint 11
  testFirstDerivative(movingRegressor, 3.1619218560690983) // Datapoint 0, Theoretical value: 4
  testSecondDerivative(movingRegressor, 7.251023549310305) // Datapoint 0, Theoretical value: 4
  movingRegressor.push(1.41938205529707, flywheelPosition(12)) // Datapoint 12
  testFirstDerivative(movingRegressor, 4.795017407170356) // Datapoint 1, Theoretical value: 5.088478654, error: -6,64%
  testSecondDerivative(movingRegressor, 7.324931550092253) // Datapoint 1, Theoretical value: 5.390894532, error: 38,46%
  movingRegressor.push(1.48429666701973, flywheelPosition(13)) // Datapoint 13
  testFirstDerivative(movingRegressor, 6.098616558470358) // Datapoint 2, Theoretical value: 6.196080065, error: -2,14%
  testSecondDerivative(movingRegressor, 7.656104494382835) // Datapoint 2, Theoretical value: 6.507915241, error: 18,21%
  movingRegressor.push(1.54608149753959, flywheelPosition(14)) // Datapoint 14
  testFirstDerivative(movingRegressor, 7.261045146876182) // Datapoint 3, Theoretical value: 7.281895041, error: -0,79%
  testSecondDerivative(movingRegressor, 8.125127482274081) // Datapoint 3,  Theoretical value: 7.441958109, error: 9,49%
  movingRegressor.push(1.60507676311623, flywheelPosition(15)) // Datapoint 15
  testFirstDerivative(movingRegressor, 8.3354523167128) // Datapoint 4, Theoretical value: 8.33516595, error: -0,42%
  testSecondDerivative(movingRegressor, 8.591085532405375) // Datapoint 4, Theoretical value: 8.247544568, error: 4,32%
  movingRegressor.push(1.66156809465495, flywheelPosition(16)) // Datapoint 16
  testFirstDerivative(movingRegressor, 9.346198019520195) // Datapoint 5, Theoretical value: 9.354539908, error: -0,44%
  testSecondDerivative(movingRegressor, 9.05816287785614) // Datapoint 5, Theoretical value: 8.958486418, error: 1,06%
  movingRegressor.push(1.71579776502858, flywheelPosition(17)) // Datapoint 17
  testFirstDerivative(movingRegressor, 10.314972131734764) // Datapoint 6, Theoretical value: 10.3416492, error: -0,56%
  testSecondDerivative(movingRegressor, 9.531782371110388) // Datapoint 6, Theoretical value: 9.596863571, error: -0,95%
  movingRegressor.push(1.76797315746226, flywheelPosition(18)) // Datapoint 18
  testFirstDerivative(movingRegressor, 11.253026452431916) // Datapoint 7, Theoretical value: 11.29896728, error: -0,68%
  testSecondDerivative(movingRegressor, 10.006689891934682) // Datapoint 7, Theoretical value: 10.17779973, error: -2,15%
  movingRegressor.push(1.81827325164023, flywheelPosition(19)) // Datapoint 19
  testFirstDerivative(movingRegressor, 12.167114512288997) // Datapoint 8, Theoretical value: 12.22905842, error: -0,76%
  testSecondDerivative(movingRegressor, 10.479926499860278) // Datapoint 8, Theoretical value: 10.71208201, error: -2,78%
  movingRegressor.push(1.86685366056842, flywheelPosition(20)) // Datapoint 20
  testFirstDerivative(movingRegressor, 13.06228935387478) // Datapoint 9, Theoretical value: 13.13431974, error: -0,79%
  testSecondDerivative(movingRegressor, 10.94574190420843) // Datapoint 9, Theoretical value: 11.20766866, error: -3,03%
  movingRegressor.push(1.91385059111525, flywheelPosition(21)) // Datapoint 21
  testFirstDerivative(movingRegressor, 13.940750925066355) // Datapoint 10, Theoretical value: 14.01690675, error: -0,78%
  testSecondDerivative(movingRegressor, 11.403650671998214) // Datapoint 10, Theoretical value: 11.670599, error: -2,98%
  movingRegressor.push(1.95938399371638, flywheelPosition(22)) // Datapoint 22
  testFirstDerivative(movingRegressor, 14.80669498176647) // Datapoint 11, Theoretical value: 14.87872798, error: -0,69%
  testSecondDerivative(movingRegressor, 11.856689681955745) // Datapoint 11, Theoretical value: 12.10556631, error: -2,69%
  movingRegressor.push(2.00356009326199, flywheelPosition(23)) // Datapoint 23
  testFirstDerivative(movingRegressor, 15.659331443649235) // Datapoint 12, Theoretical value: 15.72146448, error: -0,57%
  testSecondDerivative(movingRegressor, 12.3033090600004) // Datapoint 12, Theoretical value: 12.51629233, error: -2,22%
  movingRegressor.push(2.04647344207189, flywheelPosition(24)) // Datapoint 24
  testFirstDerivative(movingRegressor, 16.492736768968758) // Datapoint 13, Theoretical value: 16.54659646, error: -0,47%
  testSecondDerivative(movingRegressor, 12.721354618620541) // Datapoint 13, Theoretical value: 12.90578, error: -1,86%
  movingRegressor.push(2.08820859973702, flywheelPosition(25)) // Datapoint 25
  testFirstDerivative(movingRegressor, 17.307691210719657) // Datapoint 14, Theoretical value: 17.35542998, error: -0,40%
  testSecondDerivative(movingRegressor, 13.11397255097589) // Datapoint 14, Theoretical value: 13.27648899, error: -1,59%
  movingRegressor.push(2.12884151869732, flywheelPosition(26)) // Datapoint 26
  testFirstDerivative(movingRegressor, 18.106493986724217) // Datapoint 15, Theoretical value: 18.1491213, error: -0,34%
  testSecondDerivative(movingRegressor, 13.486098587072668) // Datapoint 15, Theoretical value: 13.63046058, error: -1,38%
  movingRegressor.push(2.1684406955958, flywheelPosition(27)) // Datapoint 27
  testFirstDerivative(movingRegressor, 18.890426542395396) // Datapoint 16, Theoretical value: 18.92869798, error: -0,29%
  testSecondDerivative(movingRegressor, 13.840428977173227) // Datapoint 16, Theoretical value: 13.96940857, error: -1,20%
  movingRegressor.push(2.20706813459232, flywheelPosition(28)) // Datapoint 28
  testFirstDerivative(movingRegressor, 19.660398675998493) // Datapoint 17, Theoretical value: 19.69507697, error: -0,26%
  testSecondDerivative(movingRegressor, 14.178743620220295) // Datapoint 17, Theoretical value: 14.29478659, error: -1,06%
  movingRegressor.push(2.24478015850658, flywheelPosition(29)) // Datapoint 29
  testFirstDerivative(movingRegressor, 20.41744737019293) // Datapoint 18, Theoretical value: 20.44907989, error: -0,23%
  testSecondDerivative(movingRegressor, 14.502790132819) // Datapoint 18, Theoretical value: 14.60783894, error: -0,94%
  movingRegressor.push(2.28162809590139, flywheelPosition(30)) // Datapoint 30
  testFirstDerivative(movingRegressor, 21.1623762673629) // Datapoint 19, Theoretical value: 21.19144586, error: -0,20%
  testSecondDerivative(movingRegressor, 14.813903373334561) // Datapoint 19, Theoretical value: 14.90963951, error: -0,83%
  movingRegressor.push(2.31765886632097, flywheelPosition(31)) // Datapoint 31
  testFirstDerivative(movingRegressor, 21.89597076848041) // Datapoint 20, Theoretical value: , error: %
  testSecondDerivative(movingRegressor, 15.113402988997308) // Datapoint 20, Theoretical value: , error: %
})

/**
 * @description Test of the integration of the underlying FullTSQuadraticEstimator object
 * The data follows the function y = X^3 + 2 * x^2 + 4 * x with a +/-0.0001 sec injected noise in currentDt
 * To test if multiple quadratic regressions can decently approximate a cubic function with noise
 * Please note: theoretical values are based on the perfect function (i.e. without noise)
 */
test('Test of correct algorithmic integration of FullTSQuadraticEstimator and movingRegressor object for cubic function f(x) = X^3 + 2 * x^2 + 4 * x with +/- 0.0001 error', () => {
  const flankLength = 12
  const movingRegressor = createMovingRegressor(flankLength)

  movingRegressor.push(0, flywheelPosition(0)) // Datapoint 0
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(0.231815755285445, flywheelPosition(1)) // Datapoint 1
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(0.41798587349477, flywheelPosition(2)) // Datapoint 2
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(0.573659684819169, flywheelPosition(3)) // Datapoint 3
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(0.707924094678216, flywheelPosition(4)) // Datapoint 4
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(0.826414402971124, flywheelPosition(5)) // Datapoint 5
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(0.932810595231392, flywheelPosition(6)) // Datapoint 6
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(1.02963328885463, flywheelPosition(7)) // Datapoint 7
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(1.11868033498976, flywheelPosition(8)) // Datapoint 8
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(1.20127811057228, flywheelPosition(9)) // Datapoint 9
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(1.27843316652448, flywheelPosition(10)) // Datapoint 10
  testFirstDerivative(movingRegressor, undefined)
  testSecondDerivative(movingRegressor, undefined)
  movingRegressor.push(1.35092771853781, flywheelPosition(11)) // Datapoint 11
  testFirstDerivative(movingRegressor, 3.1619218560690983) // Datapoint 0, Theoretical value: 4
  testSecondDerivative(movingRegressor, 7.251023549310305) // Datapoint 0, Theoretical value: 4
  movingRegressor.push(1.41938205529707, flywheelPosition(12)) // Datapoint 12
  testFirstDerivative(movingRegressor, 4.795017407170356) // Datapoint 1, Theoretical value: 5.088478654, error: -6.58%
  testSecondDerivative(movingRegressor, 7.324931550092253) // Datapoint 1, Theoretical value: 5.390894532, error: 38.38%
  movingRegressor.push(1.48429666701973, flywheelPosition(13)) // Datapoint 13
  testFirstDerivative(movingRegressor, 6.098616558470358) // Datapoint 2, Theoretical value: 6.196080065, error: -2.11%
  testSecondDerivative(movingRegressor, 7.656104494382835) // Datapoint 2, Theoretical value: 6.507915241, error: 18.14%
  movingRegressor.push(1.54608149753959, flywheelPosition(14)) // Datapoint 14
  testFirstDerivative(movingRegressor, 7.261045146876182) // Datapoint 3, Theoretical value: 7.281895041, error: -0.77%
  testSecondDerivative(movingRegressor, 8.125127482274081) // Datapoint 3, Theoretical value: 7.441958109, error: 9.40%
  movingRegressor.push(1.60507676311623, flywheelPosition(15)) // Datapoint 15
  testFirstDerivative(movingRegressor, 8.3354523167128) // Datapoint 4, Theoretical value: 8.33516595, error: -0.42%
  testSecondDerivative(movingRegressor, 8.591085532405375) // Datapoint 4, Theoretical value: 8.247544568, error: 4.24%
  movingRegressor.push(1.66156809465495, flywheelPosition(16)) // Datapoint 16
  testFirstDerivative(movingRegressor, 9.346198019520195) // Datapoint 5, Theoretical value: 9.354539908, error: -0.44%
  testSecondDerivative(movingRegressor, 9.05816287785614) // Datapoint 5, Theoretical value: 8.958486418, error: 1.00%
  movingRegressor.push(1.71579776502858, flywheelPosition(17)) // Datapoint 17
  testFirstDerivative(movingRegressor, 10.314972131734764) // Datapoint 6, Theoretical value: 10.3416492, error: -0.56%
  testSecondDerivative(movingRegressor, 9.531782371110388) // Datapoint 6, Theoretical value: 9.596863571, error: -1.00%
  movingRegressor.push(1.76797315746226, flywheelPosition(18)) // Datapoint 18
  testFirstDerivative(movingRegressor, 11.253026452431916) // Datapoint 7, Theoretical value: 11.29896728, error: -0.67%
  testSecondDerivative(movingRegressor, 10.006689891934682) // Datapoint 7, Theoretical value: 10.17779973, error: -2.21%
  movingRegressor.push(1.81827325164023, flywheelPosition(19)) // Datapoint 19
  testFirstDerivative(movingRegressor, 12.167114512288997) // Datapoint 8, Theoretical value: 12.22905842, error: -0.76%
  testSecondDerivative(movingRegressor, 10.479926499860278) // Datapoint 8, Theoretical value: 10.71208201, error: -2.84%
  movingRegressor.push(1.86685366056842, flywheelPosition(20)) // Datapoint 20
  testFirstDerivative(movingRegressor, 13.06228935387478) // Datapoint 9, Theoretical value: 13.13431974, error: -0.79%
  testSecondDerivative(movingRegressor, 10.94574190420843) // Datapoint 9, Theoretical value: 11.20766866, error: -3.08%
  movingRegressor.push(1.91385059111525, flywheelPosition(21)) // Datapoint 21
  testFirstDerivative(movingRegressor, 13.940750925066355) // Datapoint 10, Theoretical value: 14.01690675, error: -0.78%
  testSecondDerivative(movingRegressor, 11.403650671998214) // Datapoint 10, Theoretical value: 11.670599, error: -3.04%
  movingRegressor.push(1.95938399371638, flywheelPosition(22)) // Datapoint 22
  testFirstDerivative(movingRegressor, 14.80669498176647) // Datapoint 11, Theoretical value: 14.87872798, error: -0.68%
  testSecondDerivative(movingRegressor, 11.856689681955745) // Datapoint 11, Theoretical value: 12.10556631, error: -2.76%
  movingRegressor.push(2.00356009326199, flywheelPosition(23)) // Datapoint 23
  testFirstDerivative(movingRegressor, 15.659331443649235) // Datapoint 12, Theoretical value: 15.72146448, error: -0.57%
  testSecondDerivative(movingRegressor, 12.3033090600004) // Datapoint 12, Theoretical value: 12.51629233, error: -2.30%
  movingRegressor.push(2.04647344207189, flywheelPosition(24)) // Datapoint 24
  testFirstDerivative(movingRegressor, 16.492736768968758) // Datapoint 13, Theoretical value: 16.54659646, error: -0.46%
  testSecondDerivative(movingRegressor, 12.721354618620541) // Datapoint 13, Theoretical value: 12.90578, error: -1.95%
  movingRegressor.push(2.08820859973702, flywheelPosition(25)) // Datapoint 25
  testFirstDerivative(movingRegressor, 17.307691210719657) // Datapoint 14, Theoretical value: 17.35542998, error: -0.39%
  testSecondDerivative(movingRegressor, 13.11397255097589) // Datapoint 14, Theoretical value: 13.27648899, error: -1.70%
  movingRegressor.push(2.12884151869732, flywheelPosition(26)) // Datapoint 26
  testFirstDerivative(movingRegressor, 18.106493986724217) // Datapoint 15, Theoretical value: 18.1491213, error: -0.32%
  testSecondDerivative(movingRegressor, 13.486098587072668) // Datapoint 15, Theoretical value: 13.63046058, error: -1.51%
  movingRegressor.push(2.1684406955958, flywheelPosition(27)) // Datapoint 27
  testFirstDerivative(movingRegressor, 18.890426542395396) // Datapoint 16, Theoretical value: 18.92869798, error: -0.28%
  testSecondDerivative(movingRegressor, 13.840428977173227) // Datapoint 16, Theoretical value: 13.96940857, error: -1.35%
  movingRegressor.push(2.20706813459232, flywheelPosition(28)) // Datapoint 28
  testFirstDerivative(movingRegressor, 19.660398675998493) // Datapoint 17, Theoretical value: 19.69507697, error: -0.24%
  testSecondDerivative(movingRegressor, 14.178743620220295) // Datapoint 17, Theoretical value: 14.29478659, error: -1.23%
  movingRegressor.push(2.24478015850658, flywheelPosition(29)) // Datapoint 29
  testFirstDerivative(movingRegressor, 20.41744737019293) // Datapoint 18, Theoretical value: 20.44907989, error: -0.21%
  testSecondDerivative(movingRegressor, 14.502790132819) // Datapoint 18, Theoretical value: 14.60783894, error: -1.13%
  movingRegressor.push(2.28162809590139, flywheelPosition(30)) // Datapoint 30
  testFirstDerivative(movingRegressor, 21.1623762673629) // Datapoint 19, Theoretical value: 21.19144586, error: -0.18%
  testSecondDerivative(movingRegressor, 14.813903373334561) // Datapoint 19, Theoretical value: 14.90963951, error: -1.05%
  movingRegressor.push(2.31765886632097, flywheelPosition(31)) // Datapoint 31
  testFirstDerivative(movingRegressor, 21.89597076848041) // Datapoint 20, Theoretical value: 21.19144586, error: -0.18%
  testSecondDerivative(movingRegressor, 15.113402988997308) // Datapoint 20, Theoretical value: 14.90963951, error: -1.05%
})

/**
 * @description Test of the integration of the underlying FullTSQuadraticEstimator object
 * The data follows the function y = (x + 3,22398390803294)^3 + 33,5103216382911
 * To test if multiple quadratic regressions can decently approximate a cubic function
 */
test('Test of correct algorithmic behaviourof FullTSQuadraticEstimator in movingRegressor object for function f(x) = (x + 3,22398390803294)^3 + 33,5103216382911', () => {
  const flankLength = 11
  const movingRegressor = createMovingRegressor(flankLength)

  movingRegressor.push(0, flywheelPosition(0)) // Datapoint 0
  movingRegressor.push(0.0339391931958861, flywheelPosition(1)) // Datapoint 1
  movingRegressor.push(0.0686163387311174, flywheelPosition(2)) // Datapoint 2
  movingRegressor.push(0.104072908191785, flywheelPosition(3)) // Datapoint 3
  movingRegressor.push(0.140354232816639, flywheelPosition(4)) // Datapoint 4
  movingRegressor.push(0.177510015343162, flywheelPosition(5)) // Datapoint 5
  movingRegressor.push(0.215594931499885, flywheelPosition(6)) // Datapoint 6
  movingRegressor.push(0.254669340957169, flywheelPosition(7)) // Datapoint 7
  movingRegressor.push(0.294800132909893, flywheelPosition(8)) // Datapoint 8
  movingRegressor.push(0.336061738566166, flywheelPosition(9)) // Datapoint 9
  movingRegressor.push(0.378537352322414, flywheelPosition(10)) // Datapoint 10
  testFirstDerivative(movingRegressor, 31.15175433824249) // Datapoint: 0, Theoretical value: 31.182216717766, Error: -0.0977%
  testSecondDerivative(movingRegressor, -18.70425512401731) // Datapoint: 0, Theoretical value: -19.3439034481976, Error: -3.3067%
  movingRegressor.push(0.422320416281029, flywheelPosition(11)) // Datapoint 11
  testFirstDerivative(movingRegressor, 30.513098889123356) // Datapoint: 1, Theoretical value: 30.5291558479794, Error: -0.0526%
  testSecondDerivative(movingRegressor, -18.681649183708288) // Datapoint: 1, Theoretical value: -19.1402682890223, Error: -2.3961%
  movingRegressor.push(0.467516440428408, flywheelPosition(12)) // Datapoint 12
  testFirstDerivative(movingRegressor, 29.85986155955904) // Datapoint: 2, Theoretical value: 29.8690334922051, Error: -0.0307%
  testSecondDerivative(movingRegressor, -18.589545542159925) // Datapoint: 2, Theoretical value: -18.9322054158109, Error: -1.8099%
  movingRegressor.push(0.514245255352352, flywheelPosition(13)) // Datapoint 13
  testFirstDerivative(movingRegressor, 29.195872708833107) // Datapoint: 3, Theoretical value: 29.2015339407895, Error: -0.0194%
  testSecondDerivative(movingRegressor, -18.4460337009964) // Datapoint: 3, Theoretical value: -18.7194659990469, Error: -1.4607%
  movingRegressor.push(0.562643829050002, flywheelPosition(14)) // Datapoint 14
  testFirstDerivative(movingRegressor, 28.52198052325988) // Datapoint: 4, Theoretical value: 28.5263159216238, Error: -0.0152%
  testSecondDerivative(movingRegressor, -18.289734522926175) // Datapoint: 4, Theoretical value: -18.5017780512978, Error: -1.1461%
  movingRegressor.push(0.612869829134886, flywheelPosition(15)) // Datapoint 15
  testFirstDerivative(movingRegressor, 27.838071498993234) // Datapoint: 5, Theoretical value: 27.8430095365212, Error: -0.0177%
  testSecondDerivative(movingRegressor, -18.118042271601063) // Datapoint: 5, Theoretical value: -18.2788433561387, Error: -0.8797%
  movingRegressor.push(0.665106184462922, flywheelPosition(16)) // Datapoint 16
  testFirstDerivative(movingRegressor, 27.144243702454105) // Datapoint: 6, Theoretical value: 27.1512127023768, Error: -0.0257%
  testSecondDerivative(movingRegressor, -17.929615535082775) // Datapoint: 6, Theoretical value: -18.0503338591983, Error: -0.6688%
  movingRegressor.push(0.719567008604913, flywheelPosition(17)) // Datapoint 17
  testFirstDerivative(movingRegressor, 26.44064030984685) // Datapoint: 7, Theoretical value: 26.4504869947451, Error: -0.0372%
  testSecondDerivative(movingRegressor, -17.724298552595286) // Datapoint: 7, Theoretical value: -17.8158874024546, Error: -0.5141%
  movingRegressor.push(0.776505412873583, flywheelPosition(18)) // Datapoint 18
  testFirstDerivative(movingRegressor, 25.727388210906753) // Datapoint: 8, Theoretical value: 25.7403527653323, Error: -0.0504%
  testSecondDerivative(movingRegressor, -17.502608958090796) // Datapoint: 8, Theoretical value: -17.5751026507383, Error: -0.4125%
  movingRegressor.push(0.836223994993886, flywheelPosition(19)) // Datapoint 19
  testFirstDerivative(movingRegressor, 25.004447900335343) // Datapoint: 9, Theoretical value: 25.020283370693, Error: -0.0633%
  testSecondDerivative(movingRegressor, -17.265411481197397) // Datapoint: 9, Theoretical value: -17.3275330168006, Error: -0.3585%
  movingRegressor.push(0.899089205013686, flywheelPosition(20)) // Datapoint 20
  testFirstDerivative(movingRegressor, 24.271609293004744) // Datapoint: 10, Theoretical value: 24.2896983042147, Error: -0.0745%
  testSecondDerivative(movingRegressor, -17.01327023725214) // Datapoint: 10, Theoretical value: -17.0726793342632, Error: -0.348%
  movingRegressor.push(0.96555148010585, flywheelPosition(21)) // Datapoint 21
  testFirstDerivative(movingRegressor, 23.528633993819774) // Datapoint: 11, Theoretical value: 23.5479549630465, Error: -0.082%
  testSecondDerivative(movingRegressor, -16.74548308493857) // Datapoint: 11, Theoretical value: -16.8099809505115, Error: -0.3837%
  movingRegressor.push(1.03617422913716, flywheelPosition(22)) // Datapoint 22
  testFirstDerivative(movingRegressor, 22.773623149365505) // Datapoint: 12, Theoretical value: 22.7943386998864, Error: -0.0909%
  testSecondDerivative(movingRegressor, -16.468465526497997) // Datapoint: 12, Theoretical value: -16.5388048056272, Error: -0.4253%
  movingRegressor.push(1.11167688752162, flywheelPosition(23)) // Datapoint 23
  testFirstDerivative(movingRegressor, 22.005733141869783) // Datapoint: 13, Theoretical value: 22.0280506974936, Error: -0.1013%
  testSecondDerivative(movingRegressor, -16.18133180794129) // Datapoint: 13, Theoretical value: -16.2584319160835, Error: -0.4742%
  movingRegressor.push(1.19300131290642, flywheelPosition(24)) // Datapoint 24
  testFirstDerivative(movingRegressor, 21.22397651669105) // Datapoint: 14, Theoretical value: 21.2481930480027, Error: -0.114%
  testSecondDerivative(movingRegressor, -15.883041508980552) // Datapoint: 14, Theoretical value: -15.9680404738976, Error: -0.5323%
  movingRegressor.push(1.28141893909019, flywheelPosition(25)) // Datapoint 25
  testFirstDerivative(movingRegressor, 20.427255162207537) // Datapoint: 15, Theoretical value: 20.4537501990589, Error: -0.1295%
  testSecondDerivative(movingRegressor, -15.572356144457256) // Datapoint: 15, Theoretical value: -15.6666844733883, Error: -0.6021%
  movingRegressor.push(1.37871375938891, flywheelPosition(26)) // Datapoint 26
  testFirstDerivative(movingRegressor, 19.614341957383857) // Datapoint: 16, Theoretical value: 19.6435656125486, Error: -0.1488%
  testSecondDerivative(movingRegressor, -15.247777333845995) // Datapoint: 16, Theoretical value: -15.3532663414201, Error: -0.6871%
  movingRegressor.push(1.48751821514026, flywheelPosition(27)) // Datapoint 27
  testFirstDerivative(movingRegressor, 18.783685853718048) // Datapoint: 17, Theoretical value: 18.8163120184221, Error: -0.1734%
  testSecondDerivative(movingRegressor, -14.907455157933619) // Datapoint: 17, Theoretical value: -15.0265013965682, Error: -0.7922%
  movingRegressor.push(1.61199195401647, flywheelPosition(28)) // Datapoint 28
  testFirstDerivative(movingRegressor, 17.933422588953594) // Datapoint: 18, Theoretical value: 17.9704529528025, Error: -0.2061%
  testSecondDerivative(movingRegressor, -14.54879094209201) // Datapoint: 18, Theoretical value: -14.6848709709561, Error: -0.9267%
  movingRegressor.push(1.75939202047142, flywheelPosition(29)) // Datapoint 29
  testFirstDerivative(movingRegressor, 17.061479737474052) // Datapoint: 19, Theoretical value: 17.1041922069488, Error: -0.2497%
  testSecondDerivative(movingRegressor, -14.168437758362021) // Datapoint: 19, Theoretical value: -14.3265594782343, Error: -1.1037%
  movingRegressor.push(1.94454504624793, flywheelPosition(30)) // Datapoint 30
  testFirstDerivative(movingRegressor, 16.16525797986565) // Datapoint: 20, Theoretical value: 16.2154061403809, Error: -0.3093%
  testSecondDerivative(movingRegressor, -13.763237669973963) // Datapoint: 20, Theoretical value: -13.9493682181155, Error: -1.3343%
  movingRegressor.push(2.20849261046968, flywheelPosition(31)) // Datapoint 31
  testFirstDerivative(movingRegressor, 15.240931059835175) // Datapoint: 21, Theoretical value: 15.3015510945379, Error: -0.3962%
  testSecondDerivative(movingRegressor, -13.326034947566537) // Datapoint: 21, Theoretical value: -13.5505945675625, Error: -1.6572%
  movingRegressor.push(3.22398390803294, flywheelPosition(32)) // Datapoint 32
  testFirstDerivative(movingRegressor, 14.287862296451902) // Datapoint: 22, Theoretical value: 14.3595335732101, Error: -0.4991%
  testSecondDerivative(movingRegressor, -12.86939888687925) // Datapoint: 22, Theoretical value: -13.1268580733747, Error: -1.9613%
  movingRegressor.push(4.2394752055962, flywheelPosition(33)) // Datapoint 33
  testFirstDerivative(movingRegressor, 13.343446992890124) // Datapoint: 23, Theoretical value: 13.3855228467043, Error: -0.3097%
  testSecondDerivative(movingRegressor, -12.593658621633756) // Datapoint: 23, Theoretical value: -12.6738421230679, Error: -0.6068%
  movingRegressor.push(4.50342276981795, flywheelPosition(34)) // Datapoint 34
  testFirstDerivative(movingRegressor, 12.272424425339942) // Datapoint: 24, Theoretical value: 12.3746709051205, Error: -0.8234%
  testSecondDerivative(movingRegressor, -11.943049564910012) // Datapoint: 24, Theoretical value: -12.1858955707591, Error: -1.9677%
  movingRegressor.push(4.68857579559446, flywheelPosition(35)) // Datapoint 35
  testFirstDerivative(movingRegressor, 11.111275577176187) // Datapoint: 25, Theoretical value: 11.3206759756907, Error: -1.8498%
  testSecondDerivative(movingRegressor, -11.10165547134061) // Datapoint: 25, Theoretical value: -11.6553898136565, Error: -4.7286%
  movingRegressor.push(4.83597586204941, flywheelPosition(36)) // Datapoint 36
  testFirstDerivative(movingRegressor, 9.85670546231101) // Datapoint: 26, Theoretical value: 10.2150657644303, Error: -3.5125%
  testSecondDerivative(movingRegressor, -10.131638260894363) // Datapoint: 26, Theoretical value: -11.0716208918642, Error: -8.4727%
  movingRegressor.push(4.96044960092562, flywheelPosition(37)) // Datapoint 37
  testFirstDerivative(movingRegressor, 8.33150256290571) // Datapoint: 27, Theoretical value: 9.04593930777978, Error: -7.9107%
  testSecondDerivative(movingRegressor, -8.90260010296994) // Datapoint: 27, Theoretical value: -10.4187941573561, Error: -14.5446%
  movingRegressor.push(5.06925405667697, flywheelPosition(38)) // Datapoint 38
  testFirstDerivative(movingRegressor, 6.616103614905059) // Datapoint: 28, Theoretical value: 7.79555417944151, Error: -15.1565%
  testSecondDerivative(movingRegressor, -7.485916659905859) // Datapoint: 28, Theoretical value: -9.67195172409882, Error: -22.6092%
  movingRegressor.push(5.16654887697569, flywheelPosition(39)) // Datapoint 39
  testFirstDerivative(movingRegressor, 4.888940778715439) // Datapoint: 29, Theoretical value: 6.43508819133308, Error: -24.0732%
  testSecondDerivative(movingRegressor, -5.956802316997369) // Datapoint: 29, Theoretical value: -8.78755132536914, Error: -32.2443%
  movingRegressor.push(5.25496650315946, flywheelPosition(40)) // Datapoint 40
  testFirstDerivative(movingRegressor, 3.6316979581923494) // Datapoint: 30, Theoretical value: 4.91089140313715, Error: -26.1114%
  testSecondDerivative(movingRegressor, -4.771588801465927) // Datapoint: 30, Theoretical value: -7.67663317071005, Error: -37.9068%
  movingRegressor.push(5.33629092854426, flywheelPosition(41)) // Datapoint 41
  testFirstDerivative(movingRegressor, 2.3077423939611448) // Datapoint: 31, Theoretical value: 3.09366772628014, Error: -25.4724%
  testSecondDerivative(movingRegressor, -3.5593152612469012) // Datapoint: 31, Theoretical value: -6.09294778537956, Error: -41.7127%
  movingRegressor.push(5.41179358692871, flywheelPosition(42)) // Datapoint 42
  testFirstDerivative(movingRegressor, 1.5335044322403928) // Datapoint: 32, Theoretical value: 0
  testSecondDerivative(movingRegressor, 3.8379764035844055e-14) // Datapoint: 32, Theoretical value: 0
  movingRegressor.push(5.48241633596003, flywheelPosition(43)) // Datapoint 43
  testFirstDerivative(movingRegressor, 2.3077423939611457) // Datapoint: 33, Theoretical value: 3.09366772628014, Error: -25.4724%
  testSecondDerivative(movingRegressor, 3.5593152612468977) // Datapoint: 33, Theoretical value: 6.09294778537956, Error: -41.7127%
  movingRegressor.push(5.54887861105219, flywheelPosition(44)) // Datapoint 44
  testFirstDerivative(movingRegressor, 3.6316979581922624) // Datapoint: 34, Theoretical value: 4.91089140313715, Error: -26.1114%
  testSecondDerivative(movingRegressor, 4.771588801466153) // Datapoint: 34, Theoretical value: 7.67663317071005, Error: -37.9068%
  movingRegressor.push(5.61174382107199, flywheelPosition(45)) // Datapoint 45
  testFirstDerivative(movingRegressor, 4.888940778715508) // Datapoint: 35, Theoretical value: 6.43508819133308, Error: -24.0732%
  testSecondDerivative(movingRegressor, 5.956802316997485) // Datapoint: 35, Theoretical value: 8.78755132536914, Error: -32.2443%
  movingRegressor.push(5.6714624031923, flywheelPosition(46)) // Datapoint 46
  testFirstDerivative(movingRegressor, 6.616103614905288) // Datapoint: 36, Theoretical value: 7.79555417944151, Error: -15.1565%
  testSecondDerivative(movingRegressor, 7.485916659905754) // Datapoint: 36, Theoretical value: 9.67195172409882, Error: -22.6092%
  movingRegressor.push(5.72840080746097, flywheelPosition(47)) // Datapoint 47
  testFirstDerivative(movingRegressor, 8.331502562905932) // Datapoint: 37, Theoretical value: 9.04593930777979, Error: -7.9107%
  testSecondDerivative(movingRegressor, 8.902600102969847) // Datapoint: 37, Theoretical value: 10.4187941573561, Error: -14.5446%
  movingRegressor.push(5.78286163160296, flywheelPosition(48)) // Datapoint 48
  testFirstDerivative(movingRegressor, 9.856705462311233) // Datapoint: 38, Theoretical value: 10.2150657644303, Error: -3.5125%
  testSecondDerivative(movingRegressor, 10.131638260894228) // Datapoint: 38, Theoretical value: 11.0716208918642, Error: -8.4727%
  movingRegressor.push(5.83509798693099, flywheelPosition(49)) // Datapoint 49
  testFirstDerivative(movingRegressor, 11.111275577176677) // Datapoint: 39, Theoretical value: 11.3206759756907, Error: -1.8498%
  testSecondDerivative(movingRegressor, 11.101655471339662) // Datapoint: 39, Theoretical value: 11.6553898136565, Error: -4.7286%
  movingRegressor.push(5.88532398701588, flywheelPosition(50)) // Datapoint 50
  testFirstDerivative(movingRegressor, 12.272424425340205) // Datapoint: 40, Theoretical value: 12.3746709051205, Error: -0.8234%
  testSecondDerivative(movingRegressor, 11.943049564909279) // Datapoint: 40, Theoretical value: 12.1858955707591, Error: -1.9677%
  movingRegressor.push(5.93372256071353, flywheelPosition(51)) // Datapoint 51
  testFirstDerivative(movingRegressor, 13.343446992889987) // Datapoint: 41, Theoretical value: 13.3855228467043, Error: -0.3097%
  testSecondDerivative(movingRegressor, 12.593658621633706) // Datapoint: 41, Theoretical value: 12.6738421230679, Error: -0.6068%
  movingRegressor.push(5.98045137563747, flywheelPosition(52)) // Datapoint 52
  testFirstDerivative(movingRegressor, 14.287862296451628) // Datapoint: 42, Theoretical value: 14.3595335732101, Error: -0.4991%
  testSecondDerivative(movingRegressor, 12.869398886878852) // Datapoint: 42, Theoretical value: 13.1268580733747, Error: -1.9613%
  movingRegressor.push(6.02564739978485, flywheelPosition(53)) // Datapoint 53
  testFirstDerivative(movingRegressor, 15.240931059835063) // Datapoint: 43, Theoretical value: 15.3015510945379, Error: -0.3962%
  testSecondDerivative(movingRegressor, 13.326034947565466) // Datapoint: 43, Theoretical value: 13.5505945675625, Error: -1.6572%
  movingRegressor.push(6.06943046374346, flywheelPosition(54)) // Datapoint 54
  testFirstDerivative(movingRegressor, 16.165257979865466) // Datapoint: 44, Theoretical value: 16.2154061403809, Error: -0.3093%
  testSecondDerivative(movingRegressor, 13.763237669972586) // Datapoint: 44, Theoretical value: 13.9493682181155, Error: -1.3343%
  movingRegressor.push(6.11190607749971, flywheelPosition(55)) // Datapoint 55
  testFirstDerivative(movingRegressor, 17.061479737473583) // Datapoint: 45, Theoretical value: 17.1041922069488, Error: -0.2497%
  testSecondDerivative(movingRegressor, 14.16843775836098) // Datapoint: 45, Theoretical value: 14.3265594782343, Error: -1.1037%
  movingRegressor.push(6.15316768315598, flywheelPosition(56)) // Datapoint 56
  testFirstDerivative(movingRegressor, 17.933422588953036) // Datapoint: 46, Theoretical value: 17.9704529528025, Error: -0.2061%
  testSecondDerivative(movingRegressor, 14.548790942092099) // Datapoint: 46, Theoretical value: 14.6848709709561, Error: -0.9267%
  movingRegressor.push(6.19329847510871, flywheelPosition(57)) // Datapoint 57
  testFirstDerivative(movingRegressor, 18.783685853717557) // Datapoint: 47, Theoretical value: 18.8163120184221, Error: -0.1734%
  testSecondDerivative(movingRegressor, 14.907455157934207) // Datapoint: 47, Theoretical value: 15.0265013965682, Error: -0.7922%
  movingRegressor.push(6.23237288456599, flywheelPosition(58)) // Datapoint 58
  testFirstDerivative(movingRegressor, 19.614341957383544) // Datapoint: 48, Theoretical value: 19.6435656125486, Error: -0.1488%
  testSecondDerivative(movingRegressor, 15.247777333846214) // Datapoint: 48, Theoretical value: 15.3532663414201, Error: -0.6871%
  movingRegressor.push(6.27045780072272, flywheelPosition(59)) // Datapoint 59
  testFirstDerivative(movingRegressor, 20.427255162207402) // Datapoint: 49, Theoretical value: 20.4537501990589, Error: -0.1295%
  testSecondDerivative(movingRegressor, 15.572356144456794) // Datapoint: 49, Theoretical value: 15.6666844733883, Error: -0.6021%
  movingRegressor.push(6.30761358324924, flywheelPosition(60)) // Datapoint 60
  testFirstDerivative(movingRegressor, 21.223976516691252) // Datapoint: 50, Theoretical value: 21.2481930480027, Error: -0.114%
  testSecondDerivative(movingRegressor, 15.883041508981133) // Datapoint: 50, Theoretical value: 15.9680404738976, Error: -0.5323%
  movingRegressor.push(6.34389490787409, flywheelPosition(61)) // Datapoint 61
  testFirstDerivative(movingRegressor, 22.005733141870095) // Datapoint: 51, Theoretical value: 22.0280506974936, Error: -0.1013%
  testSecondDerivative(movingRegressor, 16.18133180794123) // Datapoint: 51, Theoretical value: 16.2584319160835, Error: -0.4742%
  movingRegressor.push(6.37935147733476, flywheelPosition(62)) // Datapoint 62
  testFirstDerivative(movingRegressor, 22.77362314936576) // Datapoint: 52, Theoretical value: 22.7943386998864, Error: -2.3204%
  testSecondDerivative(movingRegressor, 16.46846552649644) // Datapoint: 52, Theoretical value: 16.5388048056272, Error: -0.4253%
  movingRegressor.push(6.41402862286999, flywheelPosition(63)) // Datapoint 63
  testFirstDerivative(movingRegressor, 23.528633993819923) // Datapoint: 53, Theoretical value: 23.5479549630465, Error: 0.2272%
  testSecondDerivative(movingRegressor, 16.745483084939668) // Datapoint: 53, Theoretical value: 16.8099809505115, Error: -0.3837%
  movingRegressor.push(6.41402862286999, flywheelPosition(64)) // Datapoint 64
  testFirstDerivative(movingRegressor, 24.271654626903214) // Datapoint: 54, Theoretical value: 24.2896983042147, Error: 1.9476%
  testSecondDerivative(movingRegressor, 17.012520012731436) // Datapoint: 54, Theoretical value: 17.0726793342632, Error: -0.3524%
  movingRegressor.push(6.44796781606588, flywheelPosition(65)) // Datapoint 65
  testFirstDerivative(movingRegressor, 25.003717545806197) // Datapoint: 55, Theoretical value: 25.020283370693, Error: 2.9728%
  testSecondDerivative(movingRegressor, 17.27251336444372) // Datapoint: 55, Theoretical value: 17.3275330168006, Error: -0.3175%
  movingRegressor.push(6.48264496160111, flywheelPosition(66)) // Datapoint 66
  testFirstDerivative(movingRegressor, 25.72670308190149) // Datapoint: 56, Theoretical value: 25.7403527653323, Error: 3.4113%
  testSecondDerivative(movingRegressor, 17.524882364022666) // Datapoint: 56, Theoretical value: 17.5751026507383, Error: -0.2857%
  movingRegressor.push(6.51810153106178, flywheelPosition(67)) // Datapoint 67
  testFirstDerivative(movingRegressor, 26.624349154334766) // Datapoint: 57, Theoretical value: 26.4504869947451, Error: 3.3525%
  testSecondDerivative(movingRegressor, 17.75730877420827) // Datapoint: 57, Theoretical value: 17.8158874024546, Error: -7.2011%
  movingRegressor.push(6.55438285568663, flywheelPosition(68)) // Datapoint 68
  testFirstDerivative(movingRegressor, 27.579555943496985) // Datapoint: 58, Theoretical value: 27.1512127023768, Error: 2.871%
  testSecondDerivative(movingRegressor, 17.955629118247334) // Datapoint: 58, Theoretical value: 18.0503338591983, Error: -23.3038%
  movingRegressor.push(6.59153863821315, flywheelPosition(69)) // Datapoint 69
  testFirstDerivative(movingRegressor, 28.89052571737747) // Datapoint: 59, Theoretical value: 27.8430095365212, Error: 2.0292%
  testSecondDerivative(movingRegressor, 15.665483074845106) // Datapoint: 59, Theoretical value: 18.2788433561387, Error: -38.625%
  movingRegressor.push(6.62962355436988, flywheelPosition(70)) // Datapoint 70
  testFirstDerivative(movingRegressor, 29.951538371892738) // Datapoint: 60, Theoretical value: 28.5263159216238, Error: 0.8795%
  testSecondDerivative(movingRegressor, 12.901462381724917) // Datapoint: 60, Theoretical value: 18.5017780512978, Error: -53.23%
  movingRegressor.push(6.66869796382716, flywheelPosition(71)) // Datapoint 71
  testFirstDerivative(movingRegressor, 30.806657246584255) // Datapoint: 61, Theoretical value: 29.2015339407895, Error: -0.5338%
  testSecondDerivative(movingRegressor, 9.67140666836943) // Datapoint: 61, Theoretical value: 18.7194659990469, Error: -67.1765%
  movingRegressor.push(6.70882875577989, flywheelPosition(72)) // Datapoint 72
  testFirstDerivative(movingRegressor, 31.405396142822518) // Datapoint: 62, Theoretical value: 29.8690334922051, Error: -2.173%
  testSecondDerivative(movingRegressor, 6.000343686171773) // Datapoint: 62, Theoretical value: 18.9322054158109, Error: -80.516%
  movingRegressor.push(6.75009036143616, flywheelPosition(73)) // Datapoint 73
  testFirstDerivative(movingRegressor, 31.70459727805595) // Datapoint: 63, Theoretical value: 30.5291558479794, Error: -4.0058%
  testSecondDerivative(movingRegressor, 1.9206519801849915) // Datapoint: 63, Theoretical value: 19.1402682890223, Error: -93.2941%
  movingRegressor.push(6.79256597519241, flywheelPosition(74)) // Datapoint 74
  testFirstDerivative(movingRegressor, 31.765903811444034) // Datapoint: 64, Theoretical value: 31.182216717766, Error: -6.0163%
  testSecondDerivative(movingRegressor, -1.9932629732984233) // Datapoint: 64, Theoretical value: -19.3439034481976, Error: -106.6353%, This is expected as it is a welding point between two graphs
  movingRegressor.push(6.83634903915102, flywheelPosition(75)) // Datapoint 75
  testFirstDerivative(movingRegressor, 31.56636248448924) // Datapoint: 65, Theoretical value: 30.5291558479794, Error: -3.9942%
  testSecondDerivative(movingRegressor, -6.041241293208837) // Datapoint: 65, Theoretical value: -19.1402682890223, Error: -94.3891%
  movingRegressor.push(6.8815450632984, flywheelPosition(76)) // Datapoint 76
  testFirstDerivative(movingRegressor, 31.068488732359405) // Datapoint: 66, Theoretical value: 29.8690334922051, Error: -2.1371%
  testSecondDerivative(movingRegressor, -9.708056537795159) // Datapoint: 66, Theoretical value: -18.9322054158109, Error: -81.5859%
  movingRegressor.push(6.92827387822234, flywheelPosition(77)) // Datapoint 77
  testFirstDerivative(movingRegressor, 30.315160610570246) // Datapoint: 67, Theoretical value: 29.2015339407895, Error: -0.4733%
  testSecondDerivative(movingRegressor, -12.951751177840897) // Datapoint: 67, Theoretical value: -18.7194659990469, Error: -68.1811%
  movingRegressor.push(6.97667245191999, flywheelPosition(78)) // Datapoint 78
  testFirstDerivative(movingRegressor, 29.199797883477018) // Datapoint: 68, Theoretical value: 28.5263159216238, Error: 0.964%
  testSecondDerivative(movingRegressor, -15.873257856339913) // Datapoint: 68, Theoretical value: -18.5017780512978, Error: -54.1246%
  movingRegressor.push(7.02689845200488, flywheelPosition(79)) // Datapoint 79
  testFirstDerivative(movingRegressor, 27.971567095364264) // Datapoint: 69, Theoretical value: 27.8430095365212, Error: 2.1359%
  testSecondDerivative(movingRegressor, -18.17668918703874) // Datapoint: 69, Theoretical value: -18.2788433561387, Error: -39.3603%
  movingRegressor.push(7.07913480733291, flywheelPosition(80)) // Datapoint 80
  testFirstDerivative(movingRegressor, 27.14327299326837) // Datapoint: 70, Theoretical value: 27.1512127023768, Error: 2.9966%
  testSecondDerivative(movingRegressor, -17.984173147864997) // Datapoint: 70, Theoretical value: -18.0503338591983, Error: -23.8249%
  movingRegressor.push(7.1335956314749, flywheelPosition(81)) // Datapoint 81
  testFirstDerivative(movingRegressor, 26.437672893260455) // Datapoint: 71, Theoretical value: 26.4504869947451, Error: 3.4917%
  testSecondDerivative(movingRegressor, -17.759972771852997) // Datapoint: 71, Theoretical value: -17.8158874024546, Error: -7.4468%
  movingRegressor.push(7.19053403574357, flywheelPosition(82)) // Datapoint 82
  testFirstDerivative(movingRegressor, 25.72556390928743) // Datapoint: 72, Theoretical value: 25.7403527653323, Error: 3.5565%
  testSecondDerivative(movingRegressor, -17.51562527634176) // Datapoint: 72, Theoretical value: -17.5751026507383, Error: -0.3384%
  movingRegressor.push(7.25025261786388, flywheelPosition(83)) // Datapoint 83
  testFirstDerivative(movingRegressor, 25.00442855876365) // Datapoint: 73, Theoretical value: 25.020283370693, Error: 3.1135%
  testSecondDerivative(movingRegressor, -17.264560797969754) // Datapoint: 73, Theoretical value: -17.3275330168006, Error: -0.3634%
  movingRegressor.push(7.31311782788368, flywheelPosition(84)) // Datapoint 84
  testFirstDerivative(movingRegressor, 24.27277785941115) // Datapoint: 74, Theoretical value: 24.2896983042147, Error: 2.0695%
  testSecondDerivative(movingRegressor, -17.007291771200208) // Datapoint: 74, Theoretical value: -17.0726793342632, Error: -0.383%
  movingRegressor.push(7.37958010297584, flywheelPosition(85)) // Datapoint 85
  testFirstDerivative(movingRegressor, 23.52863399382072) // Datapoint: 75, Theoretical value: 23.5479549630465, Error: 0.3114%
  testSecondDerivative(movingRegressor, -16.745483084942506) // Datapoint: 75, Theoretical value: -16.8099809505115, Error: -0.3837%
  movingRegressor.push(7.45020285200716, flywheelPosition(86)) // Datapoint 86
  testFirstDerivative(movingRegressor, 22.7736231493666) // Datapoint: 76, Theoretical value: 22.7943386998864, Error: -2.2989%
  testSecondDerivative(movingRegressor, -16.468465526502353) // Datapoint: 76, Theoretical value: -16.5388048056272, Error: -0.4253%
  movingRegressor.push(7.52570551039161, flywheelPosition(87)) // Datapoint 87
  testFirstDerivative(movingRegressor, 22.00573314187072) // Datapoint: 77, Theoretical value: 22.0280506974936, Error: -0.1013%
  testSecondDerivative(movingRegressor, -16.18133180794765) // Datapoint: 77, Theoretical value: -16.2584319160835, Error: -0.4742%
  movingRegressor.push(7.60702993577641, flywheelPosition(88)) // Datapoint 88
  testFirstDerivative(movingRegressor, 21.22397651669148) // Datapoint: 78, Theoretical value: 21.2481930480027, Error: -0.114%
  testSecondDerivative(movingRegressor, -15.883041508986818) // Datapoint: 78, Theoretical value: -15.9680404738976, Error: -0.5323%
  movingRegressor.push(7.69544756196018, flywheelPosition(89)) // Datapoint 89
  testFirstDerivative(movingRegressor, 20.427255162207473) // Datapoint: 79, Theoretical value: 20.4537501990589, Error: -0.1295%
  testSecondDerivative(movingRegressor, -15.572356144461647) // Datapoint: 79, Theoretical value: -15.6666844733883, Error: -0.6021%
  movingRegressor.push(7.7927423822589, flywheelPosition(90)) // Datapoint 90
  testFirstDerivative(movingRegressor, 19.614341957383232) // Datapoint: 80, Theoretical value: 19.6435656125486, Error: -0.1488%
  testSecondDerivative(movingRegressor, -15.247777333850475) // Datapoint: 80, Theoretical value: -15.3532663414201, Error: -0.6871%
  movingRegressor.push(7.90154683801025, flywheelPosition(91)) // Datapoint 91
  testFirstDerivative(movingRegressor, 18.78368585371763) // Datapoint: 81, Theoretical value: 18.8163120184221, Error: -0.1734%
  testSecondDerivative(movingRegressor, -14.907455157935825) // Datapoint: 81, Theoretical value: -15.0265013965682, Error: -0.7922%
  movingRegressor.push(8.02602057688646, flywheelPosition(92)) // Datapoint 92
  testFirstDerivative(movingRegressor, 17.933422588953093) // Datapoint: 82, Theoretical value: 17.9704529528025, Error: -0.2061%
  testSecondDerivative(movingRegressor, -14.548790942093078) // Datapoint: 82, Theoretical value: -14.6848709709561, Error: -0.9267%
  movingRegressor.push(8.17342064334141, flywheelPosition(93)) // Datapoint 93
  testFirstDerivative(movingRegressor, 17.061479737473306) // Datapoint: 83, Theoretical value: 17.1041922069488, Error: -0.2497%
  testSecondDerivative(movingRegressor, -14.168437758363037) // Datapoint: 83, Theoretical value: -14.3265594782343, Error: -1.1037%
  movingRegressor.push(8.35857366911792, flywheelPosition(94)) // Datapoint 94
  testFirstDerivative(movingRegressor, 16.165257979865217) // Datapoint: 84, Theoretical value: 16.2154061403809, Error: -0.3093%
  testSecondDerivative(movingRegressor, -13.76323766997378) // Datapoint: 84, Theoretical value: -13.9493682181155, Error: -1.3343%
  movingRegressor.push(8.62252123333967, flywheelPosition(95)) // Datapoint 95
  testFirstDerivative(movingRegressor, 15.24093105983495) // Datapoint: 85, Theoretical value: 15.3015510945379, Error: -0.3962%
  testSecondDerivative(movingRegressor, -13.326034947565844) // Datapoint: 85, Theoretical value: -13.5505945675625, Error: -1.6572%
  movingRegressor.push(9.63801253090293, flywheelPosition(96)) // Datapoint 96
  testFirstDerivative(movingRegressor, 14.287862296451593) // Datapoint: 86, Theoretical value: 14.3595335732101, Error: -0.4991%
  testSecondDerivative(movingRegressor, -12.86939888687885) // Datapoint: 86, Theoretical value: -13.1268580733747, Error: -1.9613%
  movingRegressor.push(10.6535038284662, flywheelPosition(97)) // Datapoint 97
  testFirstDerivative(movingRegressor, 13.343446992890279) // Datapoint: 87, Theoretical value: 13.3855228467043, Error: -0.3097%
  testSecondDerivative(movingRegressor, -12.5936586216325) // Datapoint: 87, Theoretical value: -12.6738421230679, Error: -0.6068%
  movingRegressor.push(10.9174513926879, flywheelPosition(98)) // Datapoint 98
  testFirstDerivative(movingRegressor, 12.272424425340773) // Datapoint: 88, Theoretical value: 12.3746709051205, Error: -0.8234%
  testSecondDerivative(movingRegressor, -11.943049564907804) // Datapoint: 88, Theoretical value: -12.1858955707591, Error: -1.9677%
  movingRegressor.push(11.1026044184645, flywheelPosition(99)) // Datapoint 99
  testFirstDerivative(movingRegressor, 11.111275577176826) // Datapoint: 89, Theoretical value: 11.3206759756907, Error: -1.8498%
  testSecondDerivative(movingRegressor, -11.10165547133927) // Datapoint: 89, Theoretical value: -11.6553898136565, Error: -4.7286%
  movingRegressor.push(11.2500044849194, flywheelPosition(100)) // Datapoint 100
  testFirstDerivative(movingRegressor, 9.856705462311382) // Datapoint: 90, Theoretical value: 10.2150657644303, Error: -3.5125%
  testSecondDerivative(movingRegressor, -10.131638260893967) // Datapoint: 90, Theoretical value: -11.0716208918642, Error: -8.4727%
  movingRegressor.push(11.3744782237956, flywheelPosition(101)) // Datapoint 101
  testFirstDerivative(movingRegressor, 8.331502562905783) // Datapoint: 91, Theoretical value: 9.04593930777978, Error: -7.9107%
  testSecondDerivative(movingRegressor, -8.902600102970158) // Datapoint: 91, Theoretical value: -10.4187941573561, Error: -14.5446%
  movingRegressor.push(11.483282679547, flywheelPosition(102)) // Datapoint 102
  testFirstDerivative(movingRegressor, 6.616103614905029) // Datapoint: 92, Theoretical value: 7.79555417944151, Error: -15.1565%
  testSecondDerivative(movingRegressor, -7.485916659905551) // Datapoint: 92, Theoretical value: -9.67195172409882, Error: -22.6092%
  movingRegressor.push(11.5805774998457, flywheelPosition(103)) // Datapoint 103
  testFirstDerivative(movingRegressor, 4.888940778715536) // Datapoint: 93, Theoretical value: 6.43508819133308, Error: -24.0732%
  testSecondDerivative(movingRegressor, -5.956802316997673) // Datapoint: 93, Theoretical value: -8.78755132536914, Error: -32.2443%
  movingRegressor.push(11.6689951260294, flywheelPosition(104)) // Datapoint 104
  testFirstDerivative(movingRegressor, 3.6316979581926674) // Datapoint: 94, Theoretical value: 4.91089140313715, Error: -26.1114%
  testSecondDerivative(movingRegressor, -4.771588801466752) // Datapoint: 94, Theoretical value: -7.67663317071005, Error: -37.9068%
  movingRegressor.push(11.7503195514143, flywheelPosition(105)) // Datapoint 105
  testFirstDerivative(movingRegressor, 2.3077423939613055) // Datapoint: 95, Theoretical value: 3.09366772628014, Error: -25.4724%
  testSecondDerivative(movingRegressor, -3.559315261247479) // Datapoint: 95, Theoretical value: -6.09294778537956, Error: -41.7127%
  movingRegressor.push(11.8258222097987, flywheelPosition(106)) // Datapoint 1066
  testFirstDerivative(movingRegressor, 1.5335044322408324) // Datapoint: 96, Theoretical value: 0
  testSecondDerivative(movingRegressor, -2.0596270771553654e-12) // Datapoint: 96, Theoretical value: 0
  movingRegressor.push(11.89644495883, flywheelPosition(107)) // Datapoint 107
  testFirstDerivative(movingRegressor, 2.307742393960204) // Datapoint: 97, Theoretical value: 3.09366772628014, Error: -25.4724%
  testSecondDerivative(movingRegressor, 3.559315261247989) // Datapoint: 97, Theoretical value: 6.09294778537956, Error: -41.7127%
  movingRegressor.push(11.9629072339222, flywheelPosition(108)) // Datapoint 108
  testFirstDerivative(movingRegressor, 3.6316979581925963) // Datapoint: 98, Theoretical value: 4.91089140313715, Error: -26.1114%
  testSecondDerivative(movingRegressor, 4.771588801465188) // Datapoint: 98, Theoretical value: 7.67663317071005, Error: -37.9068%
  movingRegressor.push(12.025772443942, flywheelPosition(109)) // Datapoint 109
  testFirstDerivative(movingRegressor, 4.888940778716552) // Datapoint: 99, Theoretical value: 6.43508819133308, Error: -24.0732%
  testSecondDerivative(movingRegressor, 5.956802316995809) // Datapoint: 99, Theoretical value: 8.78755132536914, Error: -32.2443%
  movingRegressor.push(12.0854910260623, flywheelPosition(110)) // Datapoint 110
  testFirstDerivative(movingRegressor, 6.616103614905953) // Datapoint: 100, Theoretical value: 7.79555417944151, Error: -15.1565%
  testSecondDerivative(movingRegressor, 7.485916659903175) // Datapoint: 100, Theoretical value: 9.67195172409882, Error: -22.6092%
  movingRegressor.push(12.142429430331, flywheelPosition(111)) // Datapoint 111
  testFirstDerivative(movingRegressor, 8.331502562907502) // Datapoint: 101, Theoretical value: 9.04593930777979, Error: -7.9107%
  testSecondDerivative(movingRegressor, 8.902600102964639) // Datapoint: 101, Theoretical value: 10.4187941573561, Error: -14.5446%
  movingRegressor.push(12.1968902544729, flywheelPosition(112)) // Datapoint 112
  testFirstDerivative(movingRegressor, 9.856705462312902) // Datapoint: 102, Theoretical value: 10.2150657644303, Error: -3.5125%
  testSecondDerivative(movingRegressor, 10.131638260888828) // Datapoint: 102, Theoretical value: 11.0716208918642, Error: -8.4727%
  movingRegressor.push(12.249126609801, flywheelPosition(113)) // Datapoint 113
  testFirstDerivative(movingRegressor, 11.111275577177864) // Datapoint: 103, Theoretical value: 11.3206759756907, Error: -1.8498%
  testSecondDerivative(movingRegressor, 11.101655471333814) // Datapoint: 103, Theoretical value: 11.6553898136565, Error: -4.7286%
  movingRegressor.push(12.2993526098859, flywheelPosition(114)) // Datapoint 114
  testFirstDerivative(movingRegressor, 12.272424425338542) // Datapoint: 104, Theoretical value: 12.3746709051205, Error: -0.8234%
  testSecondDerivative(movingRegressor, 11.943049564906497) // Datapoint: 104, Theoretical value: 12.1858955707591, Error: -1.9677%
  movingRegressor.push(12.3477511835835, flywheelPosition(115)) // Datapoint 115
  testFirstDerivative(movingRegressor, 13.343446992888772) // Datapoint: 105, Theoretical value: 13.3855228467043, Error: -0.3097%
  testSecondDerivative(movingRegressor, 12.59365862163293) // Datapoint: 105, Theoretical value: 12.6738421230679, Error: -0.6068%
  movingRegressor.push(12.3944799985075, flywheelPosition(116)) // Datapoint 116
  testFirstDerivative(movingRegressor, 14.28786229645084) // Datapoint: 106, Theoretical value: 14.3595335732101, Error: -0.4991%
  testSecondDerivative(movingRegressor, 12.86939888687176) // Datapoint: 106, Theoretical value: 13.1268580733747, Error: -1.9613%
  movingRegressor.push(12.4396760226548, flywheelPosition(117)) // Datapoint 117
  testFirstDerivative(movingRegressor, 15.240931059833144) // Datapoint: 107, Theoretical value: 15.3015510945379, Error: -0.3962%
  testSecondDerivative(movingRegressor, 13.32603494755819) // Datapoint: 107, Theoretical value: 13.5505945675625, Error: -1.6572%
  movingRegressor.push(12.4834590866135, flywheelPosition(118)) // Datapoint 118
  testFirstDerivative(movingRegressor, 16.165257979863895) // Datapoint: 108, Theoretical value: 16.2154061403809, Error: -0.3093%
  testSecondDerivative(movingRegressor, 13.763237669965005) // Datapoint: 108, Theoretical value: 13.9493682181155, Error: -1.3343%
  movingRegressor.push(12.5259347003697, flywheelPosition(119)) // Datapoint 119
  testFirstDerivative(movingRegressor, 17.061479737472382) // Datapoint: 109, Theoretical value: 17.1041922069488, Error: -0.2497%
  testSecondDerivative(movingRegressor, 14.16843775835476) // Datapoint: 109, Theoretical value: 14.3265594782343, Error: -1.1037%
  movingRegressor.push(12.567196306026, flywheelPosition(120)) // Datapoint 120
  testFirstDerivative(movingRegressor, 17.933422588952254) // Datapoint: 110, Theoretical value: 17.9704529528025, Error: -0.2061%
  testSecondDerivative(movingRegressor, 14.548790942084981) // Datapoint: 110, Theoretical value: 14.6848709709561, Error: -0.9267%
  movingRegressor.push(12.6073270979787, flywheelPosition(121)) // Datapoint 121
  testFirstDerivative(movingRegressor, 18.783685853716804) // Datapoint: 111, Theoretical value: 18.8163120184221, Error: -0.1734%
  testSecondDerivative(movingRegressor, 14.907455157924247) // Datapoint: 111, Theoretical value: 15.0265013965682, Error: -0.7922%
  movingRegressor.push(12.646401507436, flywheelPosition(122)) // Datapoint 122
  testFirstDerivative(movingRegressor, 19.61434195738164) // Datapoint: 112, Theoretical value: 19.6435656125486, Error: -0.1488%
  testSecondDerivative(movingRegressor, 15.24777733383992) // Datapoint: 112, Theoretical value: 15.3532663414201, Error: -0.6871%
  movingRegressor.push(12.6844864235927, flywheelPosition(123)) // Datapoint 123
  testFirstDerivative(movingRegressor, 20.427255162205995) // Datapoint: 113, Theoretical value: 20.4537501990589, Error: -0.1295%
  testSecondDerivative(movingRegressor, 15.572356144449973) // Datapoint: 113, Theoretical value: 15.6666844733883, Error: -0.6021%
  movingRegressor.push(12.7216422061192, flywheelPosition(124)) // Datapoint 124
  testFirstDerivative(movingRegressor, 21.223976516688566) // Datapoint: 114, Theoretical value: 21.2481930480027, Error: -0.114%
  testSecondDerivative(movingRegressor, 15.883041508982846) // Datapoint: 114, Theoretical value: 15.9680404738976, Error: -0.5323%
  movingRegressor.push(12.7579235307441, flywheelPosition(125)) // Datapoint 125
  testFirstDerivative(movingRegressor, 22.005733141866813) // Datapoint: 115, Theoretical value: 22.0280506974936, Error: -0.1013%
  testSecondDerivative(movingRegressor, 16.181331807938957) // Datapoint: 115, Theoretical value: 16.2584319160835, Error: -0.4742%
  movingRegressor.push(12.7933801002048, flywheelPosition(126)) // Datapoint 126
  testFirstDerivative(movingRegressor, 22.77362314936127) // Datapoint: 116, Theoretical value: 22.7943386998864, Error: -0.0909%
  testSecondDerivative(movingRegressor, 16.468465526509394) // Datapoint: 116, Theoretical value: 16.5388048056272, Error: -0.4253%
  movingRegressor.push(12.82805724574, flywheelPosition(127)) // Datapoint 127
  testFirstDerivative(movingRegressor, 23.528633993818517) // Datapoint: 117, Theoretical value: 23.5479549630465, Error: -0.082%
  testSecondDerivative(movingRegressor, 16.745483084958252) // Datapoint: 117, Theoretical value: 16.8099809505115, Error: -0.3837%
  movingRegressor.push(12.8619964389359, flywheelPosition(128)) // Datapoint 128
  testFirstDerivative(movingRegressor, 24.271609293007685) // Datapoint: 118, Theoretical value: 24.2896983042147, Error: -0.0745%
  testSecondDerivative(movingRegressor, 17.01327023725146) // Datapoint: 118, Theoretical value: 17.0726793342632, Error: -0.348%
  movingRegressor.push(12.8952357296491, flywheelPosition(129)) // Datapoint 129
  testFirstDerivative(movingRegressor, 25.00329039949736) // Datapoint: 119, Theoretical value: 25.020283370693, Error: -0.0679%
  testSecondDerivative(movingRegressor, 17.2725894495434) // Datapoint: 119, Theoretical value: 17.3275330168006, Error: -0.3171%
  movingRegressor.push(12.9278101225835, flywheelPosition(130)) // Datapoint 130
  testFirstDerivative(movingRegressor, 25.724341026843803) // Datapoint: 120, Theoretical value: 25.7403527653323, Error: -0.0622%
  testSecondDerivative(movingRegressor, 17.524103281563516) // Datapoint: 120, Theoretical value: 17.5751026507383, Error: -0.2902%
  movingRegressor.push(12.9597519026518, flywheelPosition(131)) // Datapoint 131
  testFirstDerivative(movingRegressor, 26.43535860745402) // Datapoint: 121, Theoretical value: 26.4504869947451, Error: -0.0572%
  testSecondDerivative(movingRegressor, 17.76839220151102) // Datapoint: 121, Theoretical value: 17.8158874024546, Error: -0.2666%
  movingRegressor.push(12.9910909173424, flywheelPosition(132)) // Datapoint 132
  testFirstDerivative(movingRegressor, 27.13688352453582) // Datapoint: 122, Theoretical value: 27.1512127023768, Error: -0.0528%
  testSecondDerivative(movingRegressor, 18.005968411087238) // Datapoint: 122, Theoretical value: 18.0503338591983, Error: -0.2458%
  movingRegressor.push(13.0218548227995, flywheelPosition(133)) // Datapoint 133
  testFirstDerivative(movingRegressor, 27.829406702835342) // Datapoint: 123, Theoretical value: 27.8430095365212, Error: -0.0489%
  testSecondDerivative(movingRegressor, 18.237286747595334) // Datapoint: 123, Theoretical value: 18.2788433561387, Error: -0.2273%
  movingRegressor.push(13.052069299129, flywheelPosition(134)) // Datapoint 134
  testFirstDerivative(movingRegressor, 28.51337591257476) // Datapoint: 124, Theoretical value: 28.5263159216238, Error: -0.0454%
  testSecondDerivative(movingRegressor, 18.46275340124088) // Datapoint: 124, Theoretical value: 18.5017780512978, Error: -0.2109%
})

// Test behaviour for no datapoints
test('Test of correct algorithmic behaviourof FullTSQuadraticEstimator in movingRegressor object for function f(x) = (x + 2,01853237434599)^5 + 33,5103216382911', () => {
  const flankLength = 11
  const movingRegressor = createMovingRegressor(flankLength)

  movingRegressor.push(0, flywheelPosition(0)) // Datapoint 0
  movingRegressor.push(0.0127765482722895, flywheelPosition(1)) // Datapoint 1
  movingRegressor.push(0.0258871873643309, flywheelPosition(2)) // Datapoint 2
  movingRegressor.push(0.0393522399171293, flywheelPosition(3)) // Datapoint 3
  movingRegressor.push(0.0531940190835751, flywheelPosition(4)) // Datapoint 4
  movingRegressor.push(0.067437102746416, flywheelPosition(5)) // Datapoint 5
  movingRegressor.push(0.0821086572565166, flywheelPosition(6)) // Datapoint 6
  movingRegressor.push(0.0972388219213607, flywheelPosition(7)) // Datapoint 7
  movingRegressor.push(0.112861168581494, flywheelPosition(8)) // Datapoint 8
  movingRegressor.push(0.129013254748914, flywheelPosition(9)) // Datapoint 9
  movingRegressor.push(0.14573729434739, flywheelPosition(10)) // Datapoint 10
  testFirstDerivative(movingRegressor, 82.83414815073293) // Datapoint: 0, Theoretical value: 83.0066489499545, Error: -0.2078%
  testSecondDerivative(movingRegressor, -154.84617912466788) // Datapoint: 0, Theoretical value: -164.489111009377, Error: -5.8624%
  movingRegressor.push(0.163080977673881, flywheelPosition(11)) // Datapoint 11
  testFirstDerivative(movingRegressor, 80.83430671887758) // Datapoint: 1, Theoretical value: 80.924915348848, Error: -0.112%
  testSecondDerivative(movingRegressor, -154.5212766669226) // Datapoint: 1, Theoretical value: -161.385377615499, Error: -4.2532%
  movingRegressor.push(0.181098482654215, flywheelPosition(12)) // Datapoint 12
  testFirstDerivative(movingRegressor, 78.77829854479528) // Datapoint: 2, Theoretical value: 78.8297052108031, Error: -0.0652%
  testSecondDerivative(movingRegressor, -153.1647345450032) // Datapoint: 2, Theoretical value: -158.241328111624, Error: -3.2081%
  movingRegressor.push(0.199851734088548, flywheelPosition(13)) // Datapoint 13
  testFirstDerivative(movingRegressor, 76.68917854978797) // Datapoint: 3, Theoretical value: 76.7204774755507, Error: -0.0408%
  testSecondDerivative(movingRegressor, -151.05377106974638) // Datapoint: 3, Theoretical value: -155.055067784803, Error: -2.5806%
  movingRegressor.push(0.219411988349432, flywheelPosition(14)) // Datapoint 14
  testFirstDerivative(movingRegressor, 74.5731479614624) // Datapoint: 4, Theoretical value: 74.5966498720006, Error: -0.0315%
  testSecondDerivative(movingRegressor, -148.77399328985268) // Datapoint: 4, Theoretical value: -151.824543946359, Error: -2.0093%
  movingRegressor.push(0.239861850988137, flywheelPosition(15)) // Datapoint 15
  testFirstDerivative(movingRegressor, 72.43104307362053) // Datapoint: 5, Theoretical value: 72.4575941879248, Error: -0.0366%
  testSecondDerivative(movingRegressor, -146.291108515136) // Datapoint: 5, Theoretical value: -148.547526597246, Error: -1.519%
  movingRegressor.push(0.261297878827625, flywheelPosition(16)) // Datapoint 16
  testFirstDerivative(movingRegressor, 70.26499879303667) // Datapoint: 6, Theoretical value: 70.3026308003372, Error: -0.0535%
  testSecondDerivative(movingRegressor, -143.58937061930774) // Datapoint: 6, Theoretical value: -145.221585916134, Error: -1.1239%
  movingRegressor.push(0.283833984369796, flywheelPosition(17)) // Datapoint 17
  testFirstDerivative(movingRegressor, 68.07758327384184) // Datapoint: 7, Theoretical value: 68.1310223179495, Error: -0.0784%
  testSecondDerivative(movingRegressor, -140.67035054010483) // Datapoint: 7, Theoretical value: -141.84406590439, Error: -0.8275%
  movingRegressor.push(0.307605962104817, flywheelPosition(18)) // Datapoint 18
  testFirstDerivative(movingRegressor, 65.87145764731441) // Datapoint: 8, Theoretical value: 65.9419661500209, Error: -0.1069%
  testSecondDerivative(movingRegressor, -137.54570192933917) // Datapoint: 8, Theoretical value: -138.412053350131, Error: -0.6259%
  movingRegressor.push(0.332777616653774, flywheelPosition(19)) // Datapoint 19
  testFirstDerivative(movingRegressor, 63.648554184124606) // Datapoint: 9, Theoretical value: 63.7345857676683, Error: -0.135%
  testSecondDerivative(movingRegressor, -134.23327757538945) // Datapoint: 9, Theoretical value: -134.922341047831, Error: -0.5107%
  movingRegressor.push(0.359549232710504, flywheelPosition(20)) // Datapoint 20
  testFirstDerivative(movingRegressor, 61.41000388054417) // Datapoint: 10, Theoretical value: 61.5079203602521, Error: -0.1592%
  testSecondDerivative(movingRegressor, -130.7477684604862) // Datapoint: 10, Theoretical value: -131.371383910936, Error: -0.4747%
  movingRegressor.push(0.388169562514999, flywheelPosition(21)) // Datapoint 21
  testFirstDerivative(movingRegressor, 59.1570731910292) // Datapoint: 11, Theoretical value: 59.2609125050954, Error: -0.1752%
  testSecondDerivative(movingRegressor, -127.08642259785582) // Datapoint: 11, Theoretical value: -127.75524621423, Error: -0.5235%
  movingRegressor.push(0.418953264914326, flywheelPosition(22)) // Datapoint 22
  testFirstDerivative(movingRegressor, 56.88180606989519) // Datapoint: 12, Theoretical value: 56.9923933553014, Error: -0.194%
  testSecondDerivative(movingRegressor, -123.34941561724611) // Datapoint: 12, Theoretical value: -124.069537659016, Error: -0.5804%
  movingRegressor.push(0.452307108879146, flywheelPosition(23)) // Datapoint 23
  testFirstDerivative(movingRegressor, 54.5826015331356) // Datapoint: 13, Theoretical value: 54.7010646957755, Error: -0.2166%
  testSecondDerivative(movingRegressor, -119.53055207765563) // Datapoint: 13, Theoretical value: -120.309335206939, Error: -0.6473%
  movingRegressor.push(0.488770894429097, flywheelPosition(24)) // Datapoint 24
  testFirstDerivative(movingRegressor, 52.25778033833686) // Datapoint: 14, Theoretical value: 52.3854770038019, Error: -0.2438%
  testSecondDerivative(movingRegressor, -115.6226233758796) // Datapoint: 14, Theoretical value: -116.469086585965, Error: -0.7268%
  movingRegressor.push(0.52908442241122, flywheelPosition(25)) // Datapoint 25
  testFirstDerivative(movingRegressor, 49.905473188025454) // Datapoint: 15, Theoretical value: 50.0440023505143, Error: -0.2768%
  testSecondDerivative(movingRegressor, -111.61712925853197) // Datapoint: 15, Theoretical value: -112.542489895293, Error: -0.8222%
  movingRegressor.push(0.574303665896444, flywheelPosition(26)) // Datapoint 26
  testFirstDerivative(movingRegressor, 47.52311022187186) // Datapoint: 16, Theoretical value: 47.6748005513145, Error: -0.3182%
  testSecondDerivative(movingRegressor, -107.50388680814983) // Datapoint: 16, Theoretical value: -108.522341606437, Error: -0.9385%
  movingRegressor.push(0.626017879593542, flywheelPosition(27)) // Datapoint 27
  testFirstDerivative(movingRegressor, 45.107793331419145) // Datapoint: 17, Theoretical value: 45.2757763502753, Error: -0.371%
  testSecondDerivative(movingRegressor, -103.27042724443308) // Datapoint: 17, Theoretical value: -104.400342127248, Error: -1.0823%
  movingRegressor.push(0.686797656295626, flywheelPosition(28)) // Datapoint 28
  testFirstDerivative(movingRegressor, 42.656217000836094) // Datapoint: 18, Theoretical value: 42.8445244981284, Error: -0.4395%
  testSecondDerivative(movingRegressor, -98.8976072195803) // Datapoint: 18, Theoretical value: -100.166843393353, Error: -1.2671%
  movingRegressor.push(0.761258258676804, flywheelPosition(29)) // Datapoint 29
  testFirstDerivative(movingRegressor, 40.16444538212078) // Datapoint: 19, Theoretical value: 40.3782581761556, Error: -0.5295%
  testSecondDerivative(movingRegressor, -94.36804851908964) // Datapoint: 19, Theoretical value: -95.8105157156623, Error: -1.5055%
  movingRegressor.push(0.85918996538624, flywheelPosition(30)) // Datapoint 30
  testFirstDerivative(movingRegressor, 37.625913993605074) // Datapoint: 20, Theoretical value: 37.8737140208996, Error: -0.6543%
  testSecondDerivative(movingRegressor, -89.65680699527465) // Datapoint: 20, Theoretical value: -91.3178996709088, Error: -1.819%
  movingRegressor.push(1.00926618717299, flywheelPosition(31)) // Datapoint 31
  testFirstDerivative(movingRegressor, 35.03463828636044) // Datapoint: 21, Theoretical value: 35.3270234685551, Error: -0.8277%
  testSecondDerivative(movingRegressor, -84.72131405455713) // Datapoint: 21, Theoretical value: -86.6727901598317, Error: -2.2515%
  movingRegressor.push(2.01853237434599, flywheelPosition(32)) // Datapoint 32
  testFirstDerivative(movingRegressor, 32.554704278009275) // Datapoint: 22, Theoretical value: 32.7335342472893, Error: -0.5404%
  testSecondDerivative(movingRegressor, -81.7211071442608) // Datapoint: 22, Theoretical value: -81.8553682135038, Error: -0.1341%
  movingRegressor.push(3.02779856151898, flywheelPosition(33)) // Datapoint 33
  testFirstDerivative(movingRegressor, 30.000816353086208) // Datapoint: 23, Theoretical value: 30.0875556300011, Error: -0.2733%
  testSecondDerivative(movingRegressor, -78.74803078952486) // Datapoint: 23, Theoretical value: -76.8409405553369, Error: 2.563%
  movingRegressor.push(3.17787478330574, flywheelPosition(34)) // Datapoint 34
  testFirstDerivative(movingRegressor, 27.35085176667772) // Datapoint: 24, Theoretical value: 27.3819824840534, Error: -0.0837%
  testSecondDerivative(movingRegressor, -75.79177233150754) // Datapoint: 24, Theoretical value: -71.5980441226457, Error: 6.0231%
  movingRegressor.push(3.27580649001517, flywheelPosition(35)) // Datapoint 35
  testFirstDerivative(movingRegressor, 24.26071071895941) // Datapoint: 25, Theoretical value: 24.6077174058151, Error: -1.395%
  testSecondDerivative(movingRegressor, -70.11339732080359) // Datapoint: 25, Theoretical value: -66.0854711273398, Error: 6.2702%
  movingRegressor.push(3.35026709239635, flywheelPosition(36)) // Datapoint 36
  testFirstDerivative(movingRegressor, 20.837518238274917) // Datapoint: 26, Theoretical value: 21.7527364967177, Error: -4.2193%
  testSecondDerivative(movingRegressor, -63.09857048895648) // Datapoint: 26, Theoretical value: -60.2473455054648, Error: 4.9079%
  movingRegressor.push(3.41104686909844, flywheelPosition(37)) // Datapoint 37
  testFirstDerivative(movingRegressor, 16.553286547446575) // Datapoint: 27, Theoretical value: 18.8004784715502, Error: -12.0216%
  testSecondDerivative(movingRegressor, -53.82083440126937) // Datapoint: 27, Theoretical value: -54.0044029484732, Error: -0.1884%
  movingRegressor.push(3.46276108279553, flywheelPosition(38)) // Datapoint 38
  testFirstDerivative(movingRegressor, 12.04945082759771) // Datapoint: 28, Theoretical value: 15.7268191179949, Error: -23.5492%
  testSecondDerivative(movingRegressor, -44.46299143724117) // Datapoint: 28, Theoretical value: -47.2370928078489, Error: -5.7614%
  movingRegressor.push(3.50798032628076, flywheelPosition(39)) // Datapoint 39
  testFirstDerivative(movingRegressor, 7.995979006137617) // Datapoint: 29, Theoretical value: 12.4936663152318, Error: -36.3269%
  testSecondDerivative(movingRegressor, -35.67688197212385) // Datapoint: 29, Theoretical value: -39.7484244987643, Error: -10.203%
  movingRegressor.push(3.54829385426288, flywheelPosition(40)) // Datapoint 40
  testFirstDerivative(movingRegressor, 4.545499777144109) // Datapoint: 30, Theoretical value: 9.03268562508831, Error: -50.2852%
  testSecondDerivative(movingRegressor, -26.644166155256052) // Datapoint: 30, Theoretical value: -31.164858820935, Error: -14.6531%
  movingRegressor.push(3.58475763981283, flywheelPosition(41)) // Datapoint 41
  testFirstDerivative(movingRegressor, 3.8462783014954773) // Datapoint: 31, Theoretical value: 5.18791555937216, Error: -26.4463%
  testSecondDerivative(movingRegressor, -19.207586578866348) // Datapoint: 31, Theoretical value: -20.5611388761721, Error: -7.4435%
  movingRegressor.push(3.61811148377765, flywheelPosition(42)) // Datapoint 42
  testFirstDerivative(movingRegressor, 3.1383576841321967) // Datapoint: 32, Theoretical value: 0
  testSecondDerivative(movingRegressor, 4.409564582673597e-15) // Datapoint: 32, Theoretical value: 0
  movingRegressor.push(3.64889518617698, flywheelPosition(43)) // Datapoint 43
  testFirstDerivative(movingRegressor, 3.8462783014949977) // Datapoint: 33, Theoretical value: 5.18791555937215, Error: -26.4463%
  testSecondDerivative(movingRegressor, 19.2075865788684) // Datapoint: 33, Theoretical value: 20.5611388761721, Error: -7.4435%
  movingRegressor.push(3.67751551598147, flywheelPosition(44)) // Datapoint 44
  testFirstDerivative(movingRegressor, 4.545499777143718) // Datapoint: 34, Theoretical value: 9.03268562508831, Error: -50.2852%
  testSecondDerivative(movingRegressor, 26.64416615525877) // Datapoint: 34, Theoretical value: 31.164858820935, Error: -14.6531%
  movingRegressor.push(3.7042871320382, flywheelPosition(45)) // Datapoint 45
  testFirstDerivative(movingRegressor, 7.995979006135855) // Datapoint: 35, Theoretical value: 12.4936663152318, Error: -36.3269%
  testSecondDerivative(movingRegressor, 35.67688197213815) // Datapoint: 35, Theoretical value: 39.7484244987643, Error: -10.203%
  movingRegressor.push(3.72945878658716, flywheelPosition(46)) // Datapoint 46
  testFirstDerivative(movingRegressor, 12.049450827592068) // Datapoint: 36, Theoretical value: 15.7268191179949, Error: -23.5492%
  testSecondDerivative(movingRegressor, 44.46299143727433) // Datapoint: 36, Theoretical value: 47.2370928078489, Error: -5.7614%
  movingRegressor.push(3.75323076432218, flywheelPosition(47)) // Datapoint 47
  testFirstDerivative(movingRegressor, 16.55328654744136) // Datapoint: 37, Theoretical value: 18.8004784715502, Error: -12.0216%
  testSecondDerivative(movingRegressor, 53.820834401312524) // Datapoint: 37, Theoretical value: 54.0044029484732, Error: -0.1884%
  movingRegressor.push(3.77576686986435, flywheelPosition(48)) // Datapoint 48
  testFirstDerivative(movingRegressor, 20.837518238271798) // Datapoint: 38, Theoretical value: 21.7527364967177, Error: -4.2193%
  testSecondDerivative(movingRegressor, 63.0985704889981) // Datapoint: 38, Theoretical value: 60.2473455054648, Error: 4.9079%
  movingRegressor.push(3.79720289770384, flywheelPosition(49)) // Datapoint 49
  testFirstDerivative(movingRegressor, 24.260710718959217) // Datapoint: 39, Theoretical value: 24.6077174058151, Error: -1.395%
  testSecondDerivative(movingRegressor, 70.11339732083867) // Datapoint: 39, Theoretical value: 66.0854711273397, Error: 6.2702%
  movingRegressor.push(3.81765276034255, flywheelPosition(50)) // Datapoint 50
  testFirstDerivative(movingRegressor, 27.35085176667826) // Datapoint: 40, Theoretical value: 27.3819824840534, Error: -0.0837%
  testSecondDerivative(movingRegressor, 75.79177233154196) // Datapoint: 40, Theoretical value: 71.5980441226458, Error: 6.0231%
  movingRegressor.push(3.83721301460343, flywheelPosition(51)) // Datapoint 51
  testFirstDerivative(movingRegressor, 30.000816353087885) // Datapoint: 41, Theoretical value: 30.0875556300011, Error: -0.2733%
  testSecondDerivative(movingRegressor, 78.74803078955205) // Datapoint: 41, Theoretical value: 76.8409405553369, Error: 2.563%
  movingRegressor.push(3.85596626603776, flywheelPosition(52)) // Datapoint 52
  testFirstDerivative(movingRegressor, 32.5547042780135) // Datapoint: 42, Theoretical value: 32.7335342472893, Error: -0.5404%
  testSecondDerivative(movingRegressor, 81.72110714427114) // Datapoint: 42, Theoretical value: 81.8553682135038, Error: -0.1341%
  movingRegressor.push(3.8739837710181, flywheelPosition(53)) // Datapoint 53
  testFirstDerivative(movingRegressor, 35.03463828636535) // Datapoint: 43, Theoretical value: 35.3270234685551, Error: -0.8277%
  testSecondDerivative(movingRegressor, 84.72131405455926) // Datapoint: 43, Theoretical value: 86.6727901598316, Error: -2.2515%
  movingRegressor.push(3.89132745434459, flywheelPosition(54)) // Datapoint 54
  testFirstDerivative(movingRegressor, 37.625913993608265) // Datapoint: 44, Theoretical value: 37.8737140208995, Error: -0.6543%
  testSecondDerivative(movingRegressor, 89.65680699528338) // Datapoint: 44, Theoretical value: 91.3178996709088, Error: -1.819%
  movingRegressor.push(3.90805149394306, flywheelPosition(55)) // Datapoint 55
  testFirstDerivative(movingRegressor, 40.16444538212363) // Datapoint: 45, Theoretical value: 40.3782581761556, Error: -0.5295%
  testSecondDerivative(movingRegressor, 94.36804851909604) // Datapoint: 45, Theoretical value: 95.8105157156622, Error: -1.5055%
  movingRegressor.push(3.92420358011048, flywheelPosition(56)) // Datapoint 56
  testFirstDerivative(movingRegressor, 42.656217000838126) // Datapoint: 46, Theoretical value: 42.8445244981284, Error: -0.4395%
  testSecondDerivative(movingRegressor, 98.89760721956821) // Datapoint: 46, Theoretical value: 100.166843393353, Error: -1.2671%
  movingRegressor.push(3.93982592677062, flywheelPosition(57)) // Datapoint 57
  testFirstDerivative(movingRegressor, 45.10779333141892) // Datapoint: 47, Theoretical value: 45.2757763502753, Error: -0.371%
  testSecondDerivative(movingRegressor, 103.27042724442408) // Datapoint: 47, Theoretical value: 104.400342127248, Error: -1.0823%
  movingRegressor.push(3.95495609143546, flywheelPosition(58)) // Datapoint 58
  testFirstDerivative(movingRegressor, 47.5231102218691) // Datapoint: 48, Theoretical value: 47.6748005513145, Error: -0.3182%
  testSecondDerivative(movingRegressor, 107.50388680816235) // Datapoint: 48, Theoretical value: 108.522341606437, Error: -0.9385%
  movingRegressor.push(3.96962764594556, flywheelPosition(59)) // Datapoint 59
  testFirstDerivative(movingRegressor, 49.905473188024416) // Datapoint: 49, Theoretical value: 50.0440023505143, Error: -0.2768%
  testSecondDerivative(movingRegressor, 111.6171292585368) // Datapoint: 49, Theoretical value: 112.542489895293, Error: -0.8222%
  movingRegressor.push(3.9838707296084, flywheelPosition(60)) // Datapoint 60
  testFirstDerivative(movingRegressor, 52.25778033833785) // Datapoint: 50, Theoretical value: 52.3854770038019, Error: -0.2438%
  testSecondDerivative(movingRegressor, 115.62262337587573) // Datapoint: 50, Theoretical value: 116.469086585965, Error: -0.7268%
  movingRegressor.push(3.99771250877485, flywheelPosition(61)) // Datapoint 61
  testFirstDerivative(movingRegressor, 54.582601533135005) // Datapoint: 51, Theoretical value: 54.7010646957755, Error: -0.2166%
  testSecondDerivative(movingRegressor, 119.53055207766285) // Datapoint: 51, Theoretical value: 120.309335206939, Error: -0.6473%
  movingRegressor.push(4.01117756132765, flywheelPosition(62)) // Datapoint 62
  testFirstDerivative(movingRegressor, 56.881806069895106) // Datapoint: 52, Theoretical value: 56.9923933553014, Error: -0.194%
  testSecondDerivative(movingRegressor, 123.34941561724908) // Datapoint: 52, Theoretical value: 124.069537659016, Error: -0.5804%
  movingRegressor.push(4.02428820041969, flywheelPosition(63)) // Datapoint 63
  testFirstDerivative(movingRegressor, 59.15707319103194) // Datapoint: 53, Theoretical value: 59.2609125050953, Error: -0.1752%
  testSecondDerivative(movingRegressor, 127.08642259784997) // Datapoint: 53, Theoretical value: 127.75524621423, Error: -0.5235%
  movingRegressor.push(4.02428820041969, flywheelPosition(64)) // Datapoint 64
  testFirstDerivative(movingRegressor, 61.41026002082708) // Datapoint: 54, Theoretical value: 61.5079203602521, Error: -0.1588%
  testSecondDerivative(movingRegressor, 130.7372321804723) // Datapoint: 54, Theoretical value: 131.371383910936, Error: -0.4827%
  movingRegressor.push(4.03706474869198, flywheelPosition(65)) // Datapoint 65
  testFirstDerivative(movingRegressor, 63.644342254392484) // Datapoint: 55, Theoretical value: 63.7345857676683, Error: -0.1416%
  testSecondDerivative(movingRegressor, 134.33869512072937) // Datapoint: 55, Theoretical value: 134.922341047831, Error: -0.4326%
  movingRegressor.push(4.05017538778402, flywheelPosition(66)) // Datapoint 66
  testFirstDerivative(movingRegressor, 65.86741453755053) // Datapoint: 56, Theoretical value: 65.9419661500209, Error: -0.1131%
  testSecondDerivative(movingRegressor, 137.8780141797187) // Datapoint: 56, Theoretical value: 138.412053350131, Error: -0.3858%
  movingRegressor.push(4.06364044033682, flywheelPosition(67)) // Datapoint 67
  testFirstDerivative(movingRegressor, 68.54444889883757) // Datapoint: 57, Theoretical value: 68.1310223179495, Error: 0.6068%
  testSecondDerivative(movingRegressor, 141.16457001710992) // Datapoint: 57, Theoretical value: 141.84406590439, Error: -0.479%
  movingRegressor.push(4.07748221950326, flywheelPosition(68)) // Datapoint 68
  testFirstDerivative(movingRegressor, 71.3654378949409) // Datapoint: 58, Theoretical value: 70.3026308003372, Error: 1.5118%
  testSecondDerivative(movingRegressor, 143.98144239891764) // Datapoint: 58, Theoretical value: 145.221585916134, Error: -0.854%
  movingRegressor.push(4.0917253031661, flywheelPosition(69)) // Datapoint 69
  testFirstDerivative(movingRegressor, 75.30164018219989) // Datapoint: 59, Theoretical value: 72.4575941879248, Error: 3.9251%
  testSecondDerivative(movingRegressor, 126.07905869782206) // Datapoint: 59, Theoretical value: 148.547526597246, Error: -15.1254%
  movingRegressor.push(4.1063968576762, flywheelPosition(70)) // Datapoint 70
  testFirstDerivative(movingRegressor, 78.57819540283134) // Datapoint: 60, Theoretical value: 74.5966498720006, Error: 5.3374%
  testSecondDerivative(movingRegressor, 103.79601069533149) // Datapoint: 60, Theoretical value: 151.824543946359, Error: -31.6342%
  movingRegressor.push(4.12152702234105, flywheelPosition(71)) // Datapoint 71
  testFirstDerivative(movingRegressor, 81.20994360799062) // Datapoint: 61, Theoretical value: 76.7204774755507, Error: 5.8517%
  testSecondDerivative(movingRegressor, 77.65096540872354) // Datapoint: 61, Theoretical value: 155.055067784803, Error: -49.9204%
  movingRegressor.push(4.13714936900118, flywheelPosition(72)) // Datapoint 72
  testFirstDerivative(movingRegressor, 83.04710562163946) // Datapoint: 62, Theoretical value: 78.829705210803, Error: 5.35%
  testSecondDerivative(movingRegressor, 47.96831078789868) // Datapoint: 62, Theoretical value: 158.241328111624, Error: -69.6866%
  movingRegressor.push(4.1533014551686, flywheelPosition(73)) // Datapoint 73
  testFirstDerivative(movingRegressor, 83.97100662917377) // Datapoint: 63, Theoretical value: 80.924915348848, Error: 3.7641%
  testSecondDerivative(movingRegressor, 14.954334770920239) // Datapoint: 63, Theoretical value: 161.385377615499, Error: -90.7338%
  movingRegressor.push(4.17002549476708, flywheelPosition(74)) // Datapoint 74
  testFirstDerivative(movingRegressor, 84.16754477550508) // Datapoint: 64, Theoretical value: 83.0066489499545, Error: 1.3986%
  testSecondDerivative(movingRegressor, -17.092112574980536) // Datapoint: 64, Theoretical value: -164.489111009377, Error: -89.609%
  movingRegressor.push(4.18736917809357, flywheelPosition(75)) // Datapoint 75
  testFirstDerivative(movingRegressor, 83.5716461621889) // Datapoint: 65, Theoretical value: 80.924915348848, Error: 3.2706%
  testSecondDerivative(movingRegressor, -49.900050401294735) // Datapoint: 65, Theoretical value: -161.385377615499, Error: -69.0802%
  movingRegressor.push(4.2053866830739, flywheelPosition(76)) // Datapoint 76
  testFirstDerivative(movingRegressor, 82.06385360415482) // Datapoint: 66, Theoretical value: 78.8297052108031, Error: 4.1027%
  testSecondDerivative(movingRegressor, -79.55362430561435) // Datapoint: 66, Theoretical value: -158.241328111624, Error: -49.7264%
  movingRegressor.push(4.22413993450824, flywheelPosition(77)) // Datapoint 77
  testFirstDerivative(movingRegressor, 79.76241462500502) // Datapoint: 67, Theoretical value: 76.7204774755507, Error: 3.965%
  testSecondDerivative(movingRegressor, -105.7692377776201) // Datapoint: 67, Theoretical value: -155.055067784803, Error: -31.786%
  movingRegressor.push(4.24370018876912, flywheelPosition(78)) // Datapoint 78
  testFirstDerivative(movingRegressor, 76.41914684790277) // Datapoint: 68, Theoretical value: 74.5966498720006, Error: 2.4431%
  testSecondDerivative(movingRegressor, -129.14752813375634) // Datapoint: 68, Theoretical value: -151.824543946359, Error: -14.9363%
  movingRegressor.push(4.26415005140783, flywheelPosition(79)) // Datapoint 79
  testFirstDerivative(movingRegressor, 72.72961089976661) // Datapoint: 69, Theoretical value: 72.4575941879248, Error: 0.3754%
  testSecondDerivative(movingRegressor, -147.17724519180067) // Datapoint: 69, Theoretical value: -148.547526597246, Error: -0.9225%
  movingRegressor.push(4.28558607924731, flywheelPosition(80)) // Datapoint 80
  testFirstDerivative(movingRegressor, 70.25958290426024) // Datapoint: 70, Theoretical value: 70.3026308003372, Error: -0.0612%
  testSecondDerivative(movingRegressor, -144.4135816996841) // Datapoint: 70, Theoretical value: -145.221585916134, Error: -0.5564%
  movingRegressor.push(4.30812218478948, flywheelPosition(81)) // Datapoint 81
  testFirstDerivative(movingRegressor, 68.06067353487629) // Datapoint: 71, Theoretical value: 68.1310223179495, Error: -0.1033%
  testSecondDerivative(movingRegressor, -141.20668760476255) // Datapoint: 71, Theoretical value: -141.84406590439, Error: -0.4494%
  movingRegressor.push(4.33189416252451, flywheelPosition(82)) // Datapoint 82
  testFirstDerivative(movingRegressor, 65.86108760287186) // Datapoint: 72, Theoretical value: 65.9419661500209, Error: -0.1227%
  testSecondDerivative(movingRegressor, -137.74011344154923) // Datapoint: 72, Theoretical value: -138.412053350131, Error: -0.4855%
  movingRegressor.push(4.35706581707346, flywheelPosition(83)) // Datapoint 83
  testFirstDerivative(movingRegressor, 63.648449832698134) // Datapoint: 73, Theoretical value: 63.7345857676683, Error: -0.1351%
  testSecondDerivative(movingRegressor, -134.22069550066365) // Datapoint: 73, Theoretical value: -134.922341047831, Error: -0.52%
  movingRegressor.push(4.38383743313019, flywheelPosition(84)) // Datapoint 84
  testFirstDerivative(movingRegressor, 61.41665794554547) // Datapoint: 74, Theoretical value: 61.5079203602521, Error: -0.1484%
  testSecondDerivative(movingRegressor, -130.65983476435815) // Datapoint: 74, Theoretical value: -131.371383910936, Error: -0.5416%
  movingRegressor.push(4.41245776293469, flywheelPosition(85)) // Datapoint 85
  testFirstDerivative(movingRegressor, 59.15707319102739) // Datapoint: 75, Theoretical value: 59.2609125050954, Error: -0.1752%
  testSecondDerivative(movingRegressor, -127.08642259788174) // Datapoint: 75, Theoretical value: -127.75524621423, Error: -0.5235%
  movingRegressor.push(4.44324146533401, flywheelPosition(86)) // Datapoint 86
  testFirstDerivative(movingRegressor, 56.881806069896356) // Datapoint: 76, Theoretical value: 56.9923933553014, Error: -0.194%
  testSecondDerivative(movingRegressor, -123.34941561724712) // Datapoint: 76, Theoretical value: -124.069537659016, Error: -0.5804%
  movingRegressor.push(4.47659530929884, flywheelPosition(87)) // Datapoint 87
  testFirstDerivative(movingRegressor, 54.58260153313722) // Datapoint: 77, Theoretical value: 54.7010646957755, Error: -0.2166%
  testSecondDerivative(movingRegressor, -119.53055207765404) // Datapoint: 77, Theoretical value: -120.309335206939, Error: -0.6473%
  movingRegressor.push(4.51305909484878, flywheelPosition(88)) // Datapoint 88
  testFirstDerivative(movingRegressor, 52.257780338337625) // Datapoint: 78, Theoretical value: 52.3854770038019, Error: -0.2438%
  testSecondDerivative(movingRegressor, -115.62262337589141) // Datapoint: 78, Theoretical value: -116.469086585965, Error: -0.7268%
  movingRegressor.push(4.55337262283091, flywheelPosition(89)) // Datapoint 89
  testFirstDerivative(movingRegressor, 49.905473188025326) // Datapoint: 79, Theoretical value: 50.0440023505143, Error: -0.2768%
  testSecondDerivative(movingRegressor, -111.61712925855326) // Datapoint: 79, Theoretical value: -112.542489895293, Error: -0.8222%
  movingRegressor.push(4.59859186631613, flywheelPosition(90)) // Datapoint 90
  testFirstDerivative(movingRegressor, 47.52311022187348) // Datapoint: 80, Theoretical value: 47.6748005513145, Error: -0.3182%
  testSecondDerivative(movingRegressor, -107.50388680816754) // Datapoint: 80, Theoretical value: -108.522341606437, Error: -0.9385%
  movingRegressor.push(4.65030608001323, flywheelPosition(91)) // Datapoint 91
  testFirstDerivative(movingRegressor, 45.10779333141943) // Datapoint: 81, Theoretical value: 45.2757763502753, Error: -0.371%
  testSecondDerivative(movingRegressor, -103.27042724445896) // Datapoint: 81, Theoretical value: -104.400342127248, Error: -1.0823%
  movingRegressor.push(4.71108585671531, flywheelPosition(92)) // Datapoint 92
  testFirstDerivative(movingRegressor, 42.656217000835056) // Datapoint: 82, Theoretical value: 42.8445244981284, Error: -0.4395%
  testSecondDerivative(movingRegressor, -98.89760721960394) // Datapoint: 82, Theoretical value: -100.166843393353, Error: -1.2671%
  movingRegressor.push(4.78554645909649, flywheelPosition(93)) // Datapoint 93
  testFirstDerivative(movingRegressor, 40.164445382119595) // Datapoint: 83, Theoretical value: 40.3782581761556, Error: -0.5295%
  testSecondDerivative(movingRegressor, -94.36804851911774) // Datapoint: 83, Theoretical value: -95.8105157156623, Error: -1.5055%
  movingRegressor.push(4.88347816580593, flywheelPosition(94)) // Datapoint 94
  testFirstDerivative(movingRegressor, 37.62591399360383) // Datapoint: 84, Theoretical value: 37.8737140208996, Error: -0.6543%
  testSecondDerivative(movingRegressor, -89.65680699529587) // Datapoint: 84, Theoretical value: -91.3178996709088, Error: -1.819%
  movingRegressor.push(5.03355438759268, flywheelPosition(95)) // Datapoint 95
  testFirstDerivative(movingRegressor, 35.034638286358415) // Datapoint: 85, Theoretical value: 35.3270234685551, Error: -0.8277%
  testSecondDerivative(movingRegressor, -84.7213140545765) // Datapoint: 85, Theoretical value: -86.6727901598317, Error: -2.2515%
  movingRegressor.push(6.04282057476568, flywheelPosition(96)) // Datapoint 96
  testFirstDerivative(movingRegressor, 32.55470427800782) // Datapoint: 86, Theoretical value: 32.7335342472893, Error: -0.5404%
  testSecondDerivative(movingRegressor, -81.72110714427964) // Datapoint: 86, Theoretical value: -81.8553682135038, Error: -0.1341%
  movingRegressor.push(7.05208676193867, flywheelPosition(97)) // Datapoint 97
  testFirstDerivative(movingRegressor, 30.0008163530847) // Datapoint: 87, Theoretical value: 30.0875556300011, Error: -0.2733%
  testSecondDerivative(movingRegressor, -78.74803078953659) // Datapoint: 87, Theoretical value: -76.8409405553369, Error: 2.563%
  movingRegressor.push(7.20216298372543, flywheelPosition(98)) // Datapoint 98
  testFirstDerivative(movingRegressor, 27.350851766678318) // Datapoint: 88, Theoretical value: 27.3819824840534, Error: -0.0837%
  testSecondDerivative(movingRegressor, -75.7917723315129) // Datapoint: 88, Theoretical value: -71.5980441226457, Error: 6.0231%
  movingRegressor.push(7.30009469043486, flywheelPosition(99)) // Datapoint 99
  testFirstDerivative(movingRegressor, 24.260710718958364) // Datapoint: 89, Theoretical value: 24.6077174058151, Error: -1.395%
  testSecondDerivative(movingRegressor, -70.11339732081393) // Datapoint: 89, Theoretical value: -66.0854711273398, Error: 6.2702%
  movingRegressor.push(7.37455529281604, flywheelPosition(100)) // Datapoint 100
  testFirstDerivative(movingRegressor, 20.837518238273844) // Datapoint: 90, Theoretical value: 21.7527364967177, Error: -4.2193%
  testSecondDerivative(movingRegressor, -63.09857048896637) // Datapoint: 90, Theoretical value: -60.2473455054648, Error: 4.9079%
  movingRegressor.push(7.43533506951812, flywheelPosition(101)) // Datapoint 101
  testFirstDerivative(movingRegressor, 16.55328654744659) // Datapoint: 91, Theoretical value: 18.8004784715502, Error: -12.0216%
  testSecondDerivative(movingRegressor, -53.82083440127297) // Datapoint: 91, Theoretical value: -54.0044029484732, Error: -0.1884%
  movingRegressor.push(7.48704928321522, flywheelPosition(102)) // Datapoint 102
  testFirstDerivative(movingRegressor, 12.04945082759599) // Datapoint: 92, Theoretical value: 15.7268191179949, Error: -23.5492%
  testSecondDerivative(movingRegressor, -44.46299143725113) // Datapoint: 92, Theoretical value: -47.2370928078489, Error: -5.7614%
  movingRegressor.push(7.53226852670045, flywheelPosition(103)) // Datapoint 103
  testFirstDerivative(movingRegressor, 7.995979006137162) // Datapoint: 93, Theoretical value: 12.4936663152318, Error: -36.3269%
  testSecondDerivative(movingRegressor, -35.676881972128726) // Datapoint: 93, Theoretical value: -39.7484244987643, Error: -10.203%
  movingRegressor.push(7.57258205468257, flywheelPosition(104)) // Datapoint 104
  testFirstDerivative(movingRegressor, 4.5454997771441015) // Datapoint: 94, Theoretical value: 9.03268562508831, Error: -50.2852%
  testSecondDerivative(movingRegressor, -26.64416615525746) // Datapoint: 94, Theoretical value: -31.164858820935, Error: -14.6531%
  movingRegressor.push(7.60904584023252, flywheelPosition(105)) // Datapoint 105
  testFirstDerivative(movingRegressor, 3.846278301494735) // Datapoint: 95, Theoretical value: 5.18791555937216, Error: -26.4463%
  testSecondDerivative(movingRegressor, -19.20758657886873) // Datapoint: 95, Theoretical value: -20.5611388761721, Error: -7.4435%
  movingRegressor.push(7.64239968419734, flywheelPosition(106)) // Datapoint 106
  testFirstDerivative(movingRegressor, 3.1383576841322074) // Datapoint: 96, Theoretical value: 0
  testSecondDerivative(movingRegressor, 1.3705117896314261e-14) // Datapoint: 96, Theoretical value: 0
  movingRegressor.push(7.67318338659667, flywheelPosition(107)) // Datapoint 107
  testFirstDerivative(movingRegressor, 3.846278301494692) // Datapoint: 97, Theoretical value: 5.18791555937215, Error: -26.4463%
  testSecondDerivative(movingRegressor, 19.20758657887071) // Datapoint: 97, Theoretical value: 20.5611388761721, Error: -7.4435%
  movingRegressor.push(7.70180371640116, flywheelPosition(108)) // Datapoint 108
  testFirstDerivative(movingRegressor, 4.545499777143846) // Datapoint: 98, Theoretical value: 9.03268562508831, Error: -50.2852%
  testSecondDerivative(movingRegressor, 26.644166155259857) // Datapoint: 98, Theoretical value: 31.164858820935, Error: -14.6531%
  movingRegressor.push(7.72857533245789, flywheelPosition(109)) // Datapoint 109
  testFirstDerivative(movingRegressor, 7.995979006133808) // Datapoint: 99, Theoretical value: 12.4936663152318, Error: -36.3269%
  testSecondDerivative(movingRegressor, 35.67688197214775) // Datapoint: 99, Theoretical value: 39.7484244987643, Error: -10.203%
  movingRegressor.push(7.75374698700685, flywheelPosition(110)) // Datapoint 110
  testFirstDerivative(movingRegressor, 12.049450827602357) // Datapoint: 100, Theoretical value: 15.7268191179949, Error: -23.5492%
  testSecondDerivative(movingRegressor, 44.46299143724677) // Datapoint: 100, Theoretical value: 47.2370928078489, Error: -5.7614%
  movingRegressor.push(7.77751896474187, flywheelPosition(111)) // Datapoint 111
  testFirstDerivative(movingRegressor, 16.55328654745199) // Datapoint: 101, Theoretical value: 18.8004784715502, Error: -12.0216%
  testSecondDerivative(movingRegressor, 53.82083440127187) // Datapoint: 101, Theoretical value: 54.0044029484732, Error: -0.1884%
  movingRegressor.push(7.80005507028404, flywheelPosition(112)) // Datapoint 112
  testFirstDerivative(movingRegressor, 20.837518238281234) // Datapoint: 102, Theoretical value: 21.7527364967177, Error: -4.2193%
  testSecondDerivative(movingRegressor, 63.09857048895572) // Datapoint: 102, Theoretical value: 60.2473455054648, Error: 4.9079%
  movingRegressor.push(7.82149109812353, flywheelPosition(113)) // Datapoint 113
  testFirstDerivative(movingRegressor, 24.260710718966607) // Datapoint: 103, Theoretical value: 24.6077174058151, Error: -1.395%
  testSecondDerivative(movingRegressor, 70.11339732079524) // Datapoint: 103, Theoretical value: 66.0854711273397, Error: 6.2702%
  movingRegressor.push(7.84194096076223, flywheelPosition(114)) // Datapoint 114
  testFirstDerivative(movingRegressor, 27.350851766683718) // Datapoint: 104, Theoretical value: 27.3819824840534, Error: -0.0837%
  testSecondDerivative(movingRegressor, 75.79177233149834) // Datapoint: 104, Theoretical value: 71.5980441226458, Error: 6.0231%
  movingRegressor.push(7.86150121502312, flywheelPosition(115)) // Datapoint 115
  testFirstDerivative(movingRegressor, 30.000816353090613) // Datapoint: 105, Theoretical value: 30.0875556300011, Error: -0.2733%
  testSecondDerivative(movingRegressor, 78.7480307895183) // Datapoint: 105, Theoretical value: 76.8409405553369, Error: 2.563%
  movingRegressor.push(7.88025446645745, flywheelPosition(116)) // Datapoint 116
  testFirstDerivative(movingRegressor, 32.55470427801254) // Datapoint: 106, Theoretical value: 32.7335342472893, Error: -0.5404%
  testSecondDerivative(movingRegressor, 81.72110714425453) // Datapoint: 106, Theoretical value: 81.8553682135038, Error: -0.1341%
  movingRegressor.push(7.89827197143778, flywheelPosition(117)) // Datapoint 117
  testFirstDerivative(movingRegressor, 35.034638286363815) // Datapoint: 107, Theoretical value: 35.3270234685551, Error: -0.8277%
  testSecondDerivative(movingRegressor, 84.72131405454387) // Datapoint: 107, Theoretical value: 86.6727901598316, Error: -2.2515%
  movingRegressor.push(7.91561565476428, flywheelPosition(118)) // Datapoint 118
  testFirstDerivative(movingRegressor, 37.62591399360758) // Datapoint: 108, Theoretical value: 37.8737140208995, Error: -0.6543%
  testSecondDerivative(movingRegressor, 89.65680699524638) // Datapoint: 108, Theoretical value: 91.3178996709088, Error: -1.819%
  movingRegressor.push(7.93233969436275, flywheelPosition(119)) // Datapoint 119
  testFirstDerivative(movingRegressor, 40.16444538212181) // Datapoint: 109, Theoretical value: 40.3782581761556, Error: -0.5295%
  testSecondDerivative(movingRegressor, 94.36804851906145) // Datapoint: 109, Theoretical value: 95.8105157156622, Error: -1.5055%
  movingRegressor.push(7.94849178053017, flywheelPosition(120)) // Datapoint 120
  testFirstDerivative(movingRegressor, 42.656217000836136) // Datapoint: 110, Theoretical value: 42.8445244981284, Error: -0.4395%
  testSecondDerivative(movingRegressor, 98.89760721951238) // Datapoint: 110, Theoretical value: 100.166843393353, Error: -1.2671%
  movingRegressor.push(7.9641141271903, flywheelPosition(121)) // Datapoint 121
  testFirstDerivative(movingRegressor, 45.10779333141909) // Datapoint: 111, Theoretical value: 45.2757763502753, Error: -0.371%
  testSecondDerivative(movingRegressor, 103.27042724435985) // Datapoint: 111, Theoretical value: 104.400342127248, Error: -1.0823%
  movingRegressor.push(7.97924429185515, flywheelPosition(122)) // Datapoint 122
  testFirstDerivative(movingRegressor, 47.52311022187121) // Datapoint: 112, Theoretical value: 47.6748005513145, Error: -0.3182%
  testSecondDerivative(movingRegressor, 107.50388680806326) // Datapoint: 112, Theoretical value: 108.522341606437, Error: -0.9385%
  movingRegressor.push(7.99391584636525, flywheelPosition(123)) // Datapoint 123
  testFirstDerivative(movingRegressor, 49.90547318802419) // Datapoint: 113, Theoretical value: 50.0440023505143, Error: -0.2768%
  testSecondDerivative(movingRegressor, 111.61712925841942) // Datapoint: 113, Theoretical value: 112.542489895293, Error: -0.8222%
  movingRegressor.push(8.00815893002809, flywheelPosition(124)) // Datapoint 124
  testFirstDerivative(movingRegressor, 52.25778033833399) // Datapoint: 114, Theoretical value: 52.3854770038019, Error: -0.2438%
  testSecondDerivative(movingRegressor, 115.62262337575498) // Datapoint: 114, Theoretical value: 116.469086585965, Error: -0.7268%
  movingRegressor.push(8.02200070919454, flywheelPosition(125)) // Datapoint 125
  testFirstDerivative(movingRegressor, 54.582601533131424) // Datapoint: 115, Theoretical value: 54.7010646957755, Error: -0.2166%
  testSecondDerivative(movingRegressor, 119.530552077508) // Datapoint: 115, Theoretical value: 120.309335206939, Error: -0.6473%
  movingRegressor.push(8.03546576174734, flywheelPosition(126)) // Datapoint 126
  testFirstDerivative(movingRegressor, 56.88180606988715) // Datapoint: 116, Theoretical value: 56.9923933553014, Error: -0.194%
  testSecondDerivative(movingRegressor, 123.34941561712556) // Datapoint: 116, Theoretical value: 124.069537659016, Error: -0.5804%
  movingRegressor.push(8.04857640083938, flywheelPosition(127)) // Datapoint 127
  testFirstDerivative(movingRegressor, 59.15707319101773) // Datapoint: 117, Theoretical value: 59.2609125050953, Error: -0.1752%
  testSecondDerivative(movingRegressor, 127.08642259777825) // Datapoint: 117, Theoretical value: 127.75524621423, Error: -0.5235%
  movingRegressor.push(8.06135294911167, flywheelPosition(128)) // Datapoint 128
  testFirstDerivative(movingRegressor, 61.41000388053635) // Datapoint: 118, Theoretical value: 61.5079203602521, Error: -0.1592%
  testSecondDerivative(movingRegressor, 130.74776846040675) // Datapoint: 118, Theoretical value: 131.371383910936, Error: -0.4747%
  movingRegressor.push(8.07381397226209, flywheelPosition(129)) // Datapoint 129
  testFirstDerivative(movingRegressor, 63.64197850554342) // Datapoint: 119, Theoretical value: 63.7345857676683, Error: -0.1453%
  testSecondDerivative(movingRegressor, 134.3388391346595) // Datapoint: 119, Theoretical value: 134.922341047831, Error: -0.4325%
  movingRegressor.push(8.08597647902856, flywheelPosition(130)) // Datapoint 130
  testFirstDerivative(movingRegressor, 65.85414584244677) // Datapoint: 120, Theoretical value: 65.9419661500209, Error: -0.1332%
  testSecondDerivative(movingRegressor, 137.86436162982568) // Datapoint: 120, Theoretical value: 138.412053350131, Error: -0.3957%
  movingRegressor.push(8.09785609325274, flywheelPosition(131)) // Datapoint 131
  testFirstDerivative(movingRegressor, 68.0475404855556) // Datapoint: 121, Theoretical value: 68.1310223179495, Error: -0.1225%
  testSecondDerivative(movingRegressor, 141.32851756189933) // Datapoint: 121, Theoretical value: 141.84406590439, Error: -0.3635%
  movingRegressor.push(8.10946720260155, flywheelPosition(132)) // Datapoint 132
  testFirstDerivative(movingRegressor, 70.22309927953825) // Datapoint: 122, Theoretical value: 70.3026308003372, Error: -0.1131%
  testSecondDerivative(movingRegressor, 144.73503205195712) // Datapoint: 122, Theoretical value: 145.221585916134, Error: -0.335%
  movingRegressor.push(8.1208230876678, flywheelPosition(133)) // Datapoint 133
  testFirstDerivative(movingRegressor, 72.38167464942285) // Datapoint: 123, Theoretical value: 72.4575941879248, Error: -0.1048%
  testSecondDerivative(movingRegressor, 148.0872440238788) // Datapoint: 123, Theoretical value: 148.547526597246, Error: -0.3099%
  movingRegressor.push(8.13193603449435, flywheelPosition(134)) // Datapoint 134
  testFirstDerivative(movingRegressor, 74.52404555335283) // Datapoint: 124, Theoretical value: 74.5966498720006, Error: -0.0973%
  testSecondDerivative(movingRegressor, 151.38816260883686) // Datapoint: 124, Theoretical value: 151.824543946359, Error: -0.2874%
})

function testFirstDerivative (regressor, expectedValue) {
  assert.ok(regressor.firstDerivative(0) === expectedValue, `First derivative should be ${expectedValue} Radians/sec at ${regressor.X.get(0)} sec, is ${regressor.firstDerivative(0)}`)
}

function testSecondDerivative (regressor, expectedValue) {
  assert.ok(regressor.secondDerivative(0) === expectedValue, `Second derivative should be ${expectedValue} Radians/sec^2 at ${regressor.X.get(0)} sec, is ${regressor.secondDerivative(0)}`)
}

test.run()
