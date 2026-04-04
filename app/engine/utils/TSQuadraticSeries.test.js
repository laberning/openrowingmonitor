'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
/**
 * This tests the Quadratic Theil-Senn Regression algorithm. As regression is an estimation and methods have biasses,
 * we need to accept some slack with respect to real-life examples
 */
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { createTSQuadraticSeries } from './TSQuadraticSeries.js'

/**
 * This series of tests focusses on testing the reliability of the quadratic estimator algorithm
 */
test('Quadratic Approximation startup behaviour', () => {
  const dataSeries = createTSQuadraticSeries(10)
  testCoefficientA(dataSeries, 0)
  testCoefficientB(dataSeries, 0)
  testCoefficientC(dataSeries, 0)
  dataSeries.push(-1, 2)
  testCoefficientA(dataSeries, 0)
  testCoefficientB(dataSeries, 0)
  testCoefficientC(dataSeries, 0)
  dataSeries.push(0, 2)
  testCoefficientA(dataSeries, 0)
  testCoefficientB(dataSeries, 0)
  testCoefficientC(dataSeries, 0)
  dataSeries.push(1, 6)
  testCoefficientA(dataSeries, 2)
  testCoefficientB(dataSeries, 2)
  testCoefficientC(dataSeries, 2)
})

test('Quadratic Approximation on a perfect noisefree function y = 2 * Math.pow(x, 2) + 2 * x + 2, 21 datapoints', () => {
  // Data based on 2 x^2 + 2 x + 2
  const dataSeries = createTSQuadraticSeries(21)
  dataSeries.push(-10, 182)
  dataSeries.push(-9, 146)
  dataSeries.push(-8, 114)
  dataSeries.push(-7, 86)
  dataSeries.push(-6, 62)
  dataSeries.push(-5, 42)
  dataSeries.push(-4, 26)
  dataSeries.push(-3, 14) // Pi ;)
  dataSeries.push(-2, 6)
  dataSeries.push(-1, 2)
  dataSeries.push(0, 2)
  dataSeries.push(1, 6)
  dataSeries.push(2, 14)
  dataSeries.push(3, 26)
  dataSeries.push(4, 42)
  dataSeries.push(5, 62)
  dataSeries.push(6, 86)
  dataSeries.push(7, 114)
  dataSeries.push(8, 146)
  dataSeries.push(9, 182)
  dataSeries.push(10, 222)
  testCoefficientA(dataSeries, 2)
  testCoefficientB(dataSeries, 2)
  testCoefficientC(dataSeries, 2)
  testGoodnessOfFitEquals(dataSeries, 1)
})

test('Quadratic Approximation on a perfect noisefree function y = 2 * Math.pow(x, 2) + 2 * x + 2, with 10 datapoints and some shifting in the series', () => {
  // Data based on 2 x^2 + 2 x + 2, split the dataset in two to see its behaviour when it is around the Vertex
  const dataSeries = createTSQuadraticSeries(10)
  dataSeries.push(-10, 182)
  dataSeries.push(-9, 146)
  dataSeries.push(-8, 114)
  dataSeries.push(-7, 86)
  dataSeries.push(-6, 62)
  dataSeries.push(-5, 42)
  dataSeries.push(-4, 26)
  dataSeries.push(-3, 14) // Pi ;)
  dataSeries.push(-2, 6)
  dataSeries.push(-1, 2)
  dataSeries.push(0, 2)
  testCoefficientA(dataSeries, 2)
  testCoefficientB(dataSeries, 2)
  testCoefficientC(dataSeries, 2)
  testGoodnessOfFitEquals(dataSeries, 1)
  dataSeries.push(1, 6)
  dataSeries.push(2, 14)
  dataSeries.push(3, 26)
  dataSeries.push(4, 42)
  dataSeries.push(5, 62)
  dataSeries.push(6, 86)
  dataSeries.push(7, 114)
  dataSeries.push(8, 146)
  dataSeries.push(9, 182)
  dataSeries.push(10, 222)
  testCoefficientA(dataSeries, 2)
  testCoefficientB(dataSeries, 2)
  testCoefficientC(dataSeries, 2)
  testGoodnessOfFitEquals(dataSeries, 1)
})

test('Quadratic Approximation on function y = 4 * Math.pow(x, 2) + 4 * x + 4, noisefree', () => {
  // Data based on 4 x^2 + 4 x + 4
  const dataSeries = createTSQuadraticSeries(11)
  dataSeries.push(-11, 444)
  dataSeries.push(-10, 364)
  dataSeries.push(-9, 292)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 4)
  testGoodnessOfFitEquals(dataSeries, 1)
  dataSeries.push(-8, 228)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 4)
  testGoodnessOfFitEquals(dataSeries, 1)
  dataSeries.push(-7, 172)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 4)
  testGoodnessOfFitEquals(dataSeries, 1)
  dataSeries.push(-6, 124)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 4)
  testGoodnessOfFitEquals(dataSeries, 1)
  dataSeries.push(-5, 84)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 4)
  testGoodnessOfFitEquals(dataSeries, 1)
  dataSeries.push(-4, 52)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 4)
  testGoodnessOfFitEquals(dataSeries, 1)
  dataSeries.push(-3, 28)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 4)
  testGoodnessOfFitEquals(dataSeries, 1)
  dataSeries.push(-2, 12)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 4)
  testGoodnessOfFitEquals(dataSeries, 1)
  dataSeries.push(-1, 4)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 4)
  testGoodnessOfFitEquals(dataSeries, 1)
  dataSeries.push(0, 4)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 4)
  testGoodnessOfFitEquals(dataSeries, 1)
  dataSeries.push(1, 12)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 4)
  testGoodnessOfFitEquals(dataSeries, 1)
  dataSeries.push(2, 28)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 4)
  testGoodnessOfFitEquals(dataSeries, 1)
  dataSeries.push(3, 52)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 4)
  testGoodnessOfFitEquals(dataSeries, 1)
  dataSeries.push(4, 84)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 4)
  testGoodnessOfFitEquals(dataSeries, 1)
  dataSeries.push(5, 124)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 4)
  testGoodnessOfFitEquals(dataSeries, 1)
  dataSeries.push(6, 172)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 4)
  testGoodnessOfFitEquals(dataSeries, 1)
  dataSeries.push(7, 228)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 4)
  testGoodnessOfFitEquals(dataSeries, 1)
  dataSeries.push(8, 292)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 4)
  testGoodnessOfFitEquals(dataSeries, 1)
  dataSeries.push(9, 364)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 4)
  testGoodnessOfFitEquals(dataSeries, 1)
  dataSeries.push(10, 444)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 4)
  testGoodnessOfFitEquals(dataSeries, 1)
})

test('Quadratic Approximation on function y = 4 * Math.pow(x, 2) + 4 * x + 4, with some noise (+/- 1)', () => {
  // Data based on 4 x^2 + 4 x + 4
  const dataSeries = createTSQuadraticSeries(11)
  dataSeries.push(-11, 443)
  dataSeries.push(-10, 365)
  dataSeries.push(-9, 291)
  testCoefficientA(dataSeries, 2)
  testCoefficientB(dataSeries, -36)
  testCoefficientC(dataSeries, -195)
  testGoodnessOfFitEquals(dataSeries, 1)
  dataSeries.push(-8, 229)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4.333333333333334)
  testCoefficientC(dataSeries, 7.166666666666671)
  testGoodnessOfFitEquals(dataSeries, 0.9998746217034155)
  dataSeries.push(-7, 171)
  testCoefficientA(dataSeries, 3.3333333333333335)
  testCoefficientB(dataSeries, -7.999999999999991)
  testCoefficientC(dataSeries, -48.33333333333328)
  testGoodnessOfFitEquals(dataSeries, 0.9998468647471163)
  dataSeries.push(-6, 125)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 4)
  testGoodnessOfFitEquals(dataSeries, 0.9999165499911914)
  dataSeries.push(-5, 83)
  testCoefficientA(dataSeries, 3.8666666666666667)
  testCoefficientB(dataSeries, 1.8666666666666671)
  testCoefficientC(dataSeries, -4.333333333333336) // This is quite acceptable as ORM ignores the C
  testGoodnessOfFitEquals(dataSeries, 0.9999366117119067)
  dataSeries.push(-4, 53)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 4)
  testGoodnessOfFitEquals(dataSeries, 0.9999402806808002)
  dataSeries.push(-3, 27)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 3)
  testGoodnessOfFitEquals(dataSeries, 0.9999042318865254)
  dataSeries.push(-2, 13)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 4)
  testGoodnessOfFitEquals(dataSeries, 0.9999495097395712)
  dataSeries.push(-1, 3)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 3)
  testGoodnessOfFitEquals(dataSeries, 0.9999117149452151)
  dataSeries.push(0, 5)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 5)
  testGoodnessOfFitEquals(dataSeries, 0.9998721709098177)
  dataSeries.push(1, 11)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 3)
  testGoodnessOfFitEquals(dataSeries, 0.9997996371611135)
  dataSeries.push(2, 29)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 5)
  testGoodnessOfFitEquals(dataSeries, 0.9996545703483187)
  dataSeries.push(3, 51)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 3)
  testGoodnessOfFitEquals(dataSeries, 0.9993201651380683)
  dataSeries.push(4, 85)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 5)
  testGoodnessOfFitEquals(dataSeries, 0.9987227718173796)
  dataSeries.push(5, 123)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 3)
  testGoodnessOfFitEquals(dataSeries, 0.9986961263098004)
  dataSeries.push(6, 173)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 5)
  testGoodnessOfFitEquals(dataSeries, 0.9993274803746546)
  dataSeries.push(7, 227)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 3)
  testGoodnessOfFitEquals(dataSeries, 0.9996526505917571)
  dataSeries.push(8, 293)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 5)
  testGoodnessOfFitEquals(dataSeries, 0.9998002774328024)
  dataSeries.push(9, 363)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 3) // We get a 3 instead of 4, which is quite acceptable (especially since ORM ignores the C)
  testGoodnessOfFitEquals(dataSeries, 0.9998719089295779)
  dataSeries.push(10, 444)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 4)
  testGoodnessOfFitEquals(dataSeries, 0.9999558104799866)
})

test('Quadratic Approximation on function y = 4 * Math.pow(x, 2) + 4 * x + 4, with some noise (+/- 1) and spikes (+/- 9)', () => {
  // Data based on 4 x^2 + 4 x + 4
  const dataSeries = createTSQuadraticSeries(11)
  dataSeries.push(-11, 443)
  dataSeries.push(-10, 365)
  dataSeries.push(-9, 291)
  dataSeries.push(-8, 229)
  dataSeries.push(-7, 171)
  dataSeries.push(-6, 125)
  dataSeries.push(-5, 83)
  dataSeries.push(-4, 53)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 4)
  testGoodnessOfFitEquals(dataSeries, 0.9999402806808002)
  dataSeries.push(-3, 37) // FIRST SPIKE +9
  testCoefficientA(dataSeries, 4.215277777777778)
  testCoefficientB(dataSeries, 7.694940476190471)
  testCoefficientC(dataSeries, 18.816964285714235)
  testGoodnessOfFitEquals(dataSeries, 0.9997971509015441)
  dataSeries.push(-2, 3) // SECOND SPIKE -9
  testCoefficientA(dataSeries, 3.9714285714285715)
  testCoefficientB(dataSeries, 3.6000000000000036) // Coefficient B seems to take a hit anyway
  testCoefficientC(dataSeries, 2.842857142857163) // We get a 2.8 instead of 4, which is quite acceptable (especially since ORM ignores the C)
  testGoodnessOfFitEquals(dataSeries, 0.9991656951087963)
  dataSeries.push(-1, 3)
  testCoefficientA(dataSeries, 3.9555555555555557)
  testCoefficientB(dataSeries, 3.37777777777778)
  testCoefficientC(dataSeries, 2.4222222222222243)
  testGoodnessOfFitEquals(dataSeries, 0.9992769580376006)
  dataSeries.push(0, 5)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 5)
  testGoodnessOfFitEquals(dataSeries, 0.9988530568930122)
  dataSeries.push(1, 11)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 3)
  testGoodnessOfFitEquals(dataSeries, 0.9982053643291688)
  dataSeries.push(2, 29)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 5)
  testGoodnessOfFitEquals(dataSeries, 0.9969166946967148)
  dataSeries.push(3, 51)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 3)
  testGoodnessOfFitEquals(dataSeries, 0.9939797134586851)
  dataSeries.push(4, 85)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 5)
  testGoodnessOfFitEquals(dataSeries, 0.9888468297958631)
  dataSeries.push(5, 123)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 3)
  testGoodnessOfFitEquals(dataSeries, 0.9886212128178015)
  dataSeries.push(6, 173)
  testCoefficientA(dataSeries, 4.044444444444444)
  testCoefficientB(dataSeries, 3.822222222222223)
  testCoefficientC(dataSeries, 3.577777777777783)
  testGoodnessOfFitEquals(dataSeries, 0.9945681627011398)
  dataSeries.push(7, 227)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 3)
  testGoodnessOfFitEquals(dataSeries, 0.9968997006175546)
  dataSeries.push(8, 293)
  testCoefficientA(dataSeries, 3.9047619047619047)
  testCoefficientB(dataSeries, 4.888888888888889)
  testCoefficientC(dataSeries, 2.9682539682539684) // This is quite acceptable as ORM ignores the C
  testGoodnessOfFitEquals(dataSeries, 0.9995034675221599)
  dataSeries.push(9, 363)
  testCoefficientA(dataSeries, 4) // These results match up 100% with the previous test, showing that a spike has no carry over effects
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 3)
  testGoodnessOfFitEquals(dataSeries, 0.9998719089295779)
  dataSeries.push(10, 444)
  testCoefficientA(dataSeries, 4)
  testCoefficientB(dataSeries, 4)
  testCoefficientC(dataSeries, 4)
  testGoodnessOfFitEquals(dataSeries, 0.9999558104799866)
})

test('Quadratic TS Estimation should be decent for standard real-life example from MathBits with some noise', () => {
  // Data based on https://mathbits.com/MathBits/TISection/Statistics2/quadratic.html
  const dataSeries = createTSQuadraticSeries(13)
  dataSeries.push(10, 115.6)
  dataSeries.push(15, 157.2)
  dataSeries.push(20, 189.2)
  dataSeries.push(24, 220.8)
  dataSeries.push(30, 253.8)
  dataSeries.push(34, 269.2)
  dataSeries.push(40, 284.8)
  dataSeries.push(45, 285.0)
  dataSeries.push(48, 277.4)
  dataSeries.push(50, 269.2)
  dataSeries.push(58, 244.2)
  dataSeries.push(60, 231.4)
  dataSeries.push(64, 180.4)
  testCoefficientA(dataSeries, -0.17702838827838824) // In the example, the TI084 results in -0.1737141137, which we consider acceptably close
  testCoefficientB(dataSeries, 14.929144536019532) // In the example, the TI084 results in 14.52117133, which we consider acceptably close
  testCoefficientC(dataSeries, -31.325531135531037) // In the example, the TI084 results in -21.89774466, which we consider acceptably close
  testGoodnessOfFitEquals(dataSeries, 0.9781087883163964)
})

test('Quadratic TS Estimation should be decent for standard real-life example from VarsityTutors with some noise', () => {
  // Test based on https://www.varsitytutors.com/hotmath/hotmath_help/topics/quadratic-regression
  const dataSeries = createTSQuadraticSeries(7)
  dataSeries.push(-3, 7.5)
  dataSeries.push(-2, 3)
  dataSeries.push(-1, 0.5)
  dataSeries.push(0, 1)
  dataSeries.push(1, 3)
  dataSeries.push(2, 6)
  dataSeries.push(3, 14)
  testCoefficientA(dataSeries, 1.0833333333333333) // The example results in 1.1071 for OLS, which we consider acceptably close
  testCoefficientB(dataSeries, 1.0833333333333333) // The example results in 1 for OLS, which we consider acceptably close
  testCoefficientC(dataSeries, 0.8333333333333335) // The example results in 0.5714 for OLS, which we consider acceptably close
  testGoodnessOfFitEquals(dataSeries, 0.9851153039832286)
})

test('Quadratic TS Estimation should be decent for standard example from VTUPulse with some noise, without the vertex being part of the dataset', () => {
  // Test based on https://www.vtupulse.com/machine-learning/quadratic-polynomial-regression-model-solved-example/
  const dataSeries = createTSQuadraticSeries(5)
  dataSeries.push(3, 2.5)
  dataSeries.push(4, 3.3)
  dataSeries.push(5, 3.8)
  dataSeries.push(6, 6.5)
  dataSeries.push(7, 11.5)
  testCoefficientA(dataSeries, 0.8583333333333334) // The example results in 0.7642857 for OLS, which we consider acceptably close given the small sample size
  testCoefficientB(dataSeries, -6.420833333333334) // The example results in -5.5128571 for OLS, which we consider acceptably close given the small sample size
  testCoefficientC(dataSeries, 14.387500000000003) // The example results in 12.4285714 for OLS, which we consider acceptably close given the small sample size
  testGoodnessOfFitEquals(dataSeries, 0.9825283785404673)
})

test('Quadratic TS Estimation should be decent for standard real-life example from Uni Berlin with some noise without the vertex being part of the dataset', () => {
  // Test based on https://www.geo.fu-berlin.de/en/v/soga/Basics-of-statistics/Linear-Regression/Polynomial-Regression/Polynomial-Regression---An-example/index.html
  const dataSeries = createTSQuadraticSeries(25)
  dataSeries.push(0.001399613, -0.23436656)
  dataSeries.push(0.971629779, 0.64689524)
  dataSeries.push(0.579119475, -0.92635765)
  dataSeries.push(0.335693937, 0.13000706)
  dataSeries.push(0.736736086, -0.89294863)
  dataSeries.push(0.492572335, 0.33854780)
  dataSeries.push(0.737133774, -1.24171910)
  dataSeries.push(0.563693769, -0.22523318)
  dataSeries.push(0.877603280, -0.12962722)
  dataSeries.push(0.141426545, 0.37632006)
  dataSeries.push(0.307203910, 0.30299077)
  dataSeries.push(0.024509308, -0.21162739)
  dataSeries.push(0.843665029, -0.76468719)
  dataSeries.push(0.771206067, -0.90455412)
  dataSeries.push(0.149670258, 0.77097952)
  dataSeries.push(0.359605608, 0.56466366)
  dataSeries.push(0.049612895, 0.18897607)
  dataSeries.push(0.409898906, 0.32531750)
  dataSeries.push(0.935457898, -0.78703491)
  dataSeries.push(0.149476207, 0.80585375)
  dataSeries.push(0.234315216, 0.62944986)
  dataSeries.push(0.455297119, 0.02353327)
  dataSeries.push(0.102696671, 0.27621694)
  dataSeries.push(0.715372314, -1.20379729)
  dataSeries.push(0.681745393, -0.83059624)
  testCoefficientA(dataSeries, -2.030477132951317)
  testCoefficientB(dataSeries, 0.5976858995201227)
  testCoefficientC(dataSeries, 0.17630021024409503)
  testGoodnessOfFitEquals(dataSeries, 0.23921110548689295)
})

test('Quadratic TS Estimation should be decent for standard real-life example from Statology.org with some noise and chaotic X values', () => {
  // Test based on https://www.statology.org/quadratic-regression-r/
  const dataSeries = createTSQuadraticSeries(11)
  dataSeries.push(6, 14)
  dataSeries.push(9, 28)
  dataSeries.push(12, 50)
  dataSeries.push(14, 70)
  dataSeries.push(30, 89)
  dataSeries.push(35, 94)
  dataSeries.push(40, 90)
  dataSeries.push(47, 75)
  dataSeries.push(51, 59)
  dataSeries.push(55, 44)
  dataSeries.push(60, 27)
  testCoefficientA(dataSeries, -0.10119047619047619) // The example results in -0.1012 for R after two rounds, which we consider acceptably close
  testCoefficientB(dataSeries, 6.801190476190477) // The example results in 6.7444 for R after two rounds, which we consider acceptably close
  testCoefficientC(dataSeries, -21.126190476190516) // The example results in 18.2536 for R after two rounds, but for ORM, this factor is irrelevant
  testGoodnessOfFitEquals(dataSeries, 0.9571127392718894)
})

test('Quadratic TS Estimation should be decent for standard real-life example from StatsDirect.com with some noise and chaotic X values', () => {
  // Test based on https://www.statsdirect.com/help/regression_and_correlation/polynomial.htm
  const dataSeries = createTSQuadraticSeries(10)
  dataSeries.push(1290, 1182)
  dataSeries.push(1350, 1172)
  dataSeries.push(1470, 1264)
  dataSeries.push(1600, 1493)
  dataSeries.push(1710, 1571)
  dataSeries.push(1840, 1711)
  dataSeries.push(1980, 1804)
  dataSeries.push(2230, 1840)
  dataSeries.push(2400, 1956)
  dataSeries.push(2930, 1954)
  testCoefficientA(dataSeries, -0.00046251263566907585) // The example results in -0.00045 through QR decomposition by Givens rotations, which we consider acceptably close
  testCoefficientB(dataSeries, 2.441798780934297) // The example results in 2.39893 for QR decomposition by Givens rotations, which we consider acceptably close
  testCoefficientC(dataSeries, -1235.044997485239) // The example results in -1216.143887 for QR decomposition by Givens rotations, but for ORM, this factor is irrelevant
  testGoodnessOfFitEquals(dataSeries, 0.9790379024208455)
})

test('Quadratic Approximation with a clean function and a reset', () => {
  // Data based on 2 x^2 + 2 x + 2
  const dataSeries = createTSQuadraticSeries(10)
  dataSeries.push(-10, 182)
  dataSeries.push(-9, 146)
  dataSeries.push(-8, 114)
  dataSeries.push(-7, 86)
  dataSeries.push(-6, 62)
  dataSeries.push(-5, 42)
  testCoefficientA(dataSeries, 2)
  testCoefficientB(dataSeries, 2)
  testCoefficientC(dataSeries, 2)
  testGoodnessOfFitEquals(dataSeries, 1)
  dataSeries.push(-4, 26)
  dataSeries.push(-3, 14) // Pi ;)
  dataSeries.push(-2, 6)
  dataSeries.push(-1, 2)
  dataSeries.push(0, 2)
  dataSeries.push(1, 6)
  dataSeries.push(2, 14)
  testCoefficientA(dataSeries, 2)
  testCoefficientB(dataSeries, 2)
  testCoefficientC(dataSeries, 2)
  testGoodnessOfFitEquals(dataSeries, 1)
  dataSeries.push(3, 26)
  dataSeries.push(4, 42)
  dataSeries.push(5, 62)
  dataSeries.push(6, 86)
  dataSeries.push(7, 114)
  dataSeries.push(8, 146)
  dataSeries.push(9, 182)
  dataSeries.push(10, 222)
  testCoefficientA(dataSeries, 2)
  testCoefficientB(dataSeries, 2)
  testCoefficientC(dataSeries, 2)
  testGoodnessOfFitEquals(dataSeries, 1)
  dataSeries.reset()
  testCoefficientA(dataSeries, 0)
  testCoefficientB(dataSeries, 0)
  testCoefficientC(dataSeries, 0)
  testGoodnessOfFitEquals(dataSeries, 0)
  dataSeries.push(-1, 2)
  testCoefficientA(dataSeries, 0)
  testCoefficientB(dataSeries, 0)
  testCoefficientC(dataSeries, 0)
  testGoodnessOfFitEquals(dataSeries, 0)
  dataSeries.push(0, 2)
  testCoefficientA(dataSeries, 0)
  testCoefficientB(dataSeries, 0)
  testCoefficientC(dataSeries, 0)
  testGoodnessOfFitEquals(dataSeries, 0)
  dataSeries.push(1, 6)
  testCoefficientA(dataSeries, 2)
  testCoefficientB(dataSeries, 2)
  testCoefficientC(dataSeries, 2)
  testGoodnessOfFitEquals(dataSeries, 1)
})

test('Quadratic TS Estimation should result in a straight line for function y = x', () => {
  // As ORM will encounter straight lines (when forces are balanced on the flywheel, there is no acceleration/deceleration), so we need to test this as well
  const dataSeries = createTSQuadraticSeries(7)
  dataSeries.push(0, 0)
  dataSeries.push(1, 1)
  dataSeries.push(2, 2)
  dataSeries.push(3, 3)
  dataSeries.push(4, 4)
  dataSeries.push(5, 5)
  dataSeries.push(6, 6)
  testCoefficientA(dataSeries, 0)
  testCoefficientB(dataSeries, 1)
  testCoefficientC(dataSeries, 0)
  testGoodnessOfFitEquals(dataSeries, 1)
})

/**
 * This group tests the results of the functions actually used. Please note: these exact same tests are also used in Flywheel.test.js
 */
/**
 * The data of the underlying test is based on y = pow(x, 2) + 4 x, where we have a spacing in y of 1/3th pi (i.e. a 6 magnet flywheel)
 * and a flankLength of 12 (2 * magnets), as this is what Flywheel.test.js will use. CurrentDt's are mentioned in the comment behind the line
 * So the first derivative should follow y' = 4x + 4, and the second derivative  y'' = 4,
 */
test('Quadratic Approximation on a perfect noisefree function y = 2 * Math.pow(x, 2) + 4 * x + 2, 32 datapoints', () => {
  const dataSeries = createTSQuadraticSeries(12)
  testLength(dataSeries, 0)
  testIsReliable(dataSeries, false)
  testGoodnessOfFitEquals(dataSeries, 0)
  testLocalGoodnessOfFit (dataSeries, 0, 0)
  dataSeries.push(0.000000000000000, 0.000000000000000) // Datapoint 0, no currentDt
  testLength(dataSeries, 1)
  testIsReliable(dataSeries, false)
  testGoodnessOfFitEquals(dataSeries, 0)
  testLocalGoodnessOfFit (dataSeries, 0, 0)
  dataSeries.push(0.234341433963188, 1.047197551196600) // Datapoint 1, currentDt = 0,234341433963188
  testLength(dataSeries, 2)
  testIsReliable(dataSeries, false)
  testGoodnessOfFitEquals(dataSeries, 0)
  testLocalGoodnessOfFit(dataSeries, 0, 0)
  testLocalGoodnessOfFit(dataSeries, 1, 0)
  dataSeries.push(0.430803114057485, 2.094395102393200) // Datapoint 2, currentDt = 0,196461680094298
  testLength(dataSeries, 3)
  testIsReliable(dataSeries, true)
  testCoefficientA(dataSeries, 2.000000000000049)
  testCoefficientB(dataSeries, 3.999999999999996)
  testCoefficientC(dataSeries, 0)
  testGoodnessOfFitEquals(dataSeries, 1)
  testFirstDerivativeAtPosition(dataSeries, 0, 3.999999999999996) // datapoint 0
  testSecondDerivativeAtPosition(dataSeries, 0, 4.000000000000098)
  testLocalGoodnessOfFit(dataSeries, 0, 1)
  testFirstDerivativeAtPosition(dataSeries, 1, 4.9373657358527705) // datapoint 1
  testSecondDerivativeAtPosition(dataSeries, 1, 4.000000000000098)
  testLocalGoodnessOfFit(dataSeries, 1, 1)
  testFirstDerivativeAtPosition(dataSeries, 2, 5.723212456229978) // datapoint 2
  testSecondDerivativeAtPosition(dataSeries, 2, 4.000000000000098)
  testLocalGoodnessOfFit(dataSeries, 2, 1)
  dataSeries.push(0.603370302455080, 3.141592653589790) // Datapoint 3, currentDt = 0,172567188397595
  testLength(dataSeries, 4)
  testIsReliable(dataSeries, true)
  testCoefficientA(dataSeries, 1.9999999999999454)
  testCoefficientB(dataSeries, 4.000000000000037)
  testCoefficientC(dataSeries, -1.3322676295501878e-15)
  testGoodnessOfFitEquals(dataSeries, 1)
  testFirstDerivativeAtPosition(dataSeries, 0, 4.000000000000037) // datapoint 0
  testSecondDerivativeAtPosition(dataSeries, 0, 3.9999999999998908)
  testLocalGoodnessOfFit(dataSeries, 0, 1)
  testFirstDerivativeAtPosition(dataSeries, 1, 4.937365735852763) // datapoint 1
  testSecondDerivativeAtPosition(dataSeries, 1, 3.9999999999998908)
  testLocalGoodnessOfFit(dataSeries, 1, 1)
  testFirstDerivativeAtPosition(dataSeries, 2, 5.7232124562299305) // datapoint 2
  testSecondDerivativeAtPosition(dataSeries, 2, 3.9999999999998908)
  testLocalGoodnessOfFit(dataSeries, 2, 1)
  testFirstDerivativeAtPosition(dataSeries, 3, 6.413481209820292) // datapoint 3
  testSecondDerivativeAtPosition(dataSeries, 3, 3.9999999999998908)
  testLocalGoodnessOfFit(dataSeries, 3, 1)
  dataSeries.push(0.759089282098323, 4.188790204786390) // Datapoint 4, currentDt = 0,155718979643243
  testLength(dataSeries, 5)
  testIsReliable(dataSeries, true)
  testCoefficientA(dataSeries, 1.9999999999999871)
  testCoefficientB(dataSeries, 4.0000000000000115)
  testCoefficientC(dataSeries, 0)
  testGoodnessOfFitEquals(dataSeries, 1)
  testFirstDerivativeAtPosition(dataSeries, 0, 4.0000000000000115) // datapoint 0
  testSecondDerivativeAtPosition(dataSeries, 0, 3.9999999999999742)
  testLocalGoodnessOfFit(dataSeries, 0, 1)
  testFirstDerivativeAtPosition(dataSeries, 1, 4.937365735852757) // datapoint 1
  testSecondDerivativeAtPosition(dataSeries, 1, 3.9999999999999742)
  testLocalGoodnessOfFit(dataSeries, 1, 1)
  testFirstDerivativeAtPosition(dataSeries, 2, 5.72321245622994) // datapoint 2
  testSecondDerivativeAtPosition(dataSeries, 2, 3.9999999999999742)
  testLocalGoodnessOfFit(dataSeries, 2, 1)
  testFirstDerivativeAtPosition(dataSeries, 3, 6.413481209820317) // datapoint 3
  testSecondDerivativeAtPosition(dataSeries, 3, 3.9999999999999742)
  testLocalGoodnessOfFit(dataSeries, 3, 1)
  testFirstDerivativeAtPosition(dataSeries, 4, 7.036357128393284) // datapoint 4
  testSecondDerivativeAtPosition(dataSeries, 4, 3.9999999999999742)
  testLocalGoodnessOfFit(dataSeries, 4, 1)
  dataSeries.push(0.902102488824273, 5.235987755982990) // Datapoint 5, currentDt = 0,143013206725950
  testLength(dataSeries, 6)
  testIsReliable(dataSeries, true)
  testCoefficientA(dataSeries, 2)
  testCoefficientB(dataSeries, 4.000000000000002)
  testCoefficientC(dataSeries, 1.0547118733938987e-15)
  testGoodnessOfFitEquals(dataSeries, 1)
  testFirstDerivativeAtPosition(dataSeries, 0, 4.000000000000002) // datapoint 0
  testSecondDerivativeAtPosition(dataSeries, 0, 4)
  testLocalGoodnessOfFit(dataSeries, 0, 1)
  testFirstDerivativeAtPosition(dataSeries, 1, 4.937365735852754) // datapoint 1
  testSecondDerivativeAtPosition(dataSeries, 1, 4)
  testLocalGoodnessOfFit(dataSeries, 1, 1)
  testFirstDerivativeAtPosition(dataSeries, 2, 5.723212456229942) // datapoint 2
  testSecondDerivativeAtPosition(dataSeries, 2, 4)
  testLocalGoodnessOfFit(dataSeries, 2, 1)
  testFirstDerivativeAtPosition(dataSeries, 3, 6.413481209820322) // datapoint 3
  testSecondDerivativeAtPosition(dataSeries, 3, 4)
  testLocalGoodnessOfFit(dataSeries, 3, 1)
  testFirstDerivativeAtPosition(dataSeries, 4, 7.036357128393294) // datapoint 4
  testSecondDerivativeAtPosition(dataSeries, 4, 4)
  testLocalGoodnessOfFit(dataSeries, 4, 1)
  testFirstDerivativeAtPosition(dataSeries, 5, 7.608409955297094) // datapoint 5
  testSecondDerivativeAtPosition(dataSeries, 5, 4)
  testLocalGoodnessOfFit(dataSeries, 5, 1)
  dataSeries.push(1.035090330572530, 6.283185307179590) // Datapoint 6, currentDt = 0,132987841748253
  testLength(dataSeries, 7)
  testIsReliable(dataSeries, true)
  testCoefficientA(dataSeries, 1.9999999999999525)
  testCoefficientB(dataSeries, 4.000000000000037)
  testCoefficientC(dataSeries, 0)
  testGoodnessOfFitEquals(dataSeries, 1)
  testFirstDerivativeAtPosition(dataSeries, 0, 4.000000000000037) // datapoint 0
  testSecondDerivativeAtPosition(dataSeries, 0, 3.999999999999905)
  testLocalGoodnessOfFit(dataSeries, 0, 1)
  testFirstDerivativeAtPosition(dataSeries, 1, 4.937365735852767) // datapoint 1
  testSecondDerivativeAtPosition(dataSeries, 1, 3.999999999999905)
  testLocalGoodnessOfFit(dataSeries, 1, 1)
  testFirstDerivativeAtPosition(dataSeries, 2, 5.723212456229937) // datapoint 2
  testSecondDerivativeAtPosition(dataSeries, 2, 3.999999999999905)
  testLocalGoodnessOfFit(dataSeries, 2, 1)
  testFirstDerivativeAtPosition(dataSeries, 3, 6.413481209820301) // datapoint 3
  testSecondDerivativeAtPosition(dataSeries, 3, 3.999999999999905)
  testLocalGoodnessOfFit(dataSeries, 3, 1)
  testFirstDerivativeAtPosition(dataSeries, 4, 7.0363571283932576) // datapoint 4
  testSecondDerivativeAtPosition(dataSeries, 4, 3.999999999999905)
  testLocalGoodnessOfFit(dataSeries, 4, 1)
  testFirstDerivativeAtPosition(dataSeries, 5, 7.608409955297043) // datapoint 5
  testSecondDerivativeAtPosition(dataSeries, 5, 3.999999999999905)
  testLocalGoodnessOfFit(dataSeries, 5, 1)
  testFirstDerivativeAtPosition(dataSeries, 6, 8.140361322290058) // datapoint 6
  testSecondDerivativeAtPosition(dataSeries, 6, 3.999999999999905)
  testLocalGoodnessOfFit(dataSeries, 6, 1)
  dataSeries.push(1.159905421352540, 7.330382858376180) // Datapoint 7, currentDt = 0,124815090780014
  testLength(dataSeries, 8)
  testIsReliable(dataSeries, true)
  testCoefficientA(dataSeries, 1.9999999999999734)
  testCoefficientB(dataSeries, 4.000000000000025)
  testCoefficientC(dataSeries, -6.661338147750939e-16)
  testGoodnessOfFitEquals(dataSeries, 1)
  testFirstDerivativeAtPosition(dataSeries, 0, 4.000000000000025) // datapoint 0
  testSecondDerivativeAtPosition(dataSeries, 0, 3.9999999999999467)
  testLocalGoodnessOfFit(dataSeries, 0, 1)
  testFirstDerivativeAtPosition(dataSeries, 1, 4.937365735852764) // datapoint 1
  testSecondDerivativeAtPosition(dataSeries, 1, 3.9999999999999467)
  testLocalGoodnessOfFit(dataSeries, 1, 1)
  testFirstDerivativeAtPosition(dataSeries, 2, 5.723212456229942) // datapoint 2
  testSecondDerivativeAtPosition(dataSeries, 2, 3.9999999999999467)
  testLocalGoodnessOfFit(dataSeries, 2, 1)
  testFirstDerivativeAtPosition(dataSeries, 3, 6.413481209820313) // datapoint 3
  testSecondDerivativeAtPosition(dataSeries, 3, 3.9999999999999467)
  testLocalGoodnessOfFit(dataSeries, 3, 1)
  testFirstDerivativeAtPosition(dataSeries, 4, 7.036357128393277) // datapoint 4
  testSecondDerivativeAtPosition(dataSeries, 4, 3.9999999999999467)
  testLocalGoodnessOfFit(dataSeries, 4, 1)
  testFirstDerivativeAtPosition(dataSeries, 5, 7.608409955297069) // datapoint 5
  testSecondDerivativeAtPosition(dataSeries, 5, 3.9999999999999467)
  testLocalGoodnessOfFit(dataSeries, 5, 1)
  testFirstDerivativeAtPosition(dataSeries, 6, 8.14036132229009) // datapoint 6
  testSecondDerivativeAtPosition(dataSeries, 6, 3.9999999999999467)
  testLocalGoodnessOfFit(dataSeries, 6, 1)
  testFirstDerivativeAtPosition(dataSeries, 7, 8.639621685410123) // datapoint 7
  testSecondDerivativeAtPosition(dataSeries, 7, 3.9999999999999467)
  testLocalGoodnessOfFit(dataSeries, 7, 1)
  dataSeries.push(1.27789161392424, 8.37758040957278) // Datapoint 8, currentDt = 0,117986192571703
  testLength(dataSeries, 9)
  testIsReliable(dataSeries, true)
  testCoefficientA(dataSeries, 2.000000000000002)
  testCoefficientB(dataSeries, 3.999999999999999)
  testCoefficientC(dataSeries, 1.7763568394002505e-15)
  testGoodnessOfFitEquals(dataSeries, 1)
  testFirstDerivativeAtPosition(dataSeries, 0, 3.999999999999999) // datapoint 0
  testSecondDerivativeAtPosition(dataSeries, 0, 4.000000000000004)
  testLocalGoodnessOfFit(dataSeries, 0, 1)
  testFirstDerivativeAtPosition(dataSeries, 1, 4.937365735852752) // datapoint 1
  testSecondDerivativeAtPosition(dataSeries, 1, 4.000000000000004)
  testLocalGoodnessOfFit(dataSeries, 1, 1)
  testFirstDerivativeAtPosition(dataSeries, 2, 5.723212456229941) // datapoint 2
  testSecondDerivativeAtPosition(dataSeries, 2, 4.000000000000004)
  testLocalGoodnessOfFit(dataSeries, 2, 1)
  testFirstDerivativeAtPosition(dataSeries, 3, 6.413481209820322) // datapoint 3
  testSecondDerivativeAtPosition(dataSeries, 3, 4.000000000000004)
  testLocalGoodnessOfFit(dataSeries, 3, 1)
  testFirstDerivativeAtPosition(dataSeries, 4, 7.036357128393295) // datapoint 4
  testSecondDerivativeAtPosition(dataSeries, 4, 4.000000000000004)
  testLocalGoodnessOfFit(dataSeries, 4, 1)
  testFirstDerivativeAtPosition(dataSeries, 5, 7.608409955297095) // datapoint 5
  testSecondDerivativeAtPosition(dataSeries, 5, 4.000000000000004)
  testLocalGoodnessOfFit(dataSeries, 5, 1)
  testFirstDerivativeAtPosition(dataSeries, 6, 8.140361322290124) // datapoint 6
  testSecondDerivativeAtPosition(dataSeries, 6, 4.000000000000004)
  testLocalGoodnessOfFit(dataSeries, 6, 1)
  testFirstDerivativeAtPosition(dataSeries, 7, 8.639621685410164) // datapoint 7
  testSecondDerivativeAtPosition(dataSeries, 7, 4.000000000000004)
  testLocalGoodnessOfFit(dataSeries, 7, 1)
  testFirstDerivativeAtPosition(dataSeries, 8, 9.111566455696964) // datapoint 8
  testSecondDerivativeAtPosition(dataSeries, 8, 4.000000000000004)
  testLocalGoodnessOfFit(dataSeries, 8, 1)
  dataSeries.push(1.39006045538281, 9.42477796076938) // Datapoint 9, currentDt = 0,112168841458569
  testLength(dataSeries, 10)
  testIsReliable(dataSeries, true)
  testCoefficientA(dataSeries, 2.000000000000008)
  testCoefficientB(dataSeries, 3.999999999999994)
  testCoefficientC(dataSeries, 2.220446049250313e-15)
  testGoodnessOfFitEquals(dataSeries, 1)
  testFirstDerivativeAtPosition(dataSeries, 0, 3.999999999999994) // datapoint 0
  testSecondDerivativeAtPosition(dataSeries, 0, 4.000000000000016)
  testLocalGoodnessOfFit(dataSeries, 0, 1)
  testFirstDerivativeAtPosition(dataSeries, 1, 4.937365735852749) // datapoint 1
  testSecondDerivativeAtPosition(dataSeries, 1, 4.000000000000016)
  testLocalGoodnessOfFit(dataSeries, 1, 1)
  testFirstDerivativeAtPosition(dataSeries, 2, 5.723212456229941) // datapoint 2
  testSecondDerivativeAtPosition(dataSeries, 2, 4.000000000000016)
  testLocalGoodnessOfFit(dataSeries, 2, 1)
  testFirstDerivativeAtPosition(dataSeries, 3, 6.413481209820324) // datapoint 3
  testSecondDerivativeAtPosition(dataSeries, 3, 4.000000000000016)
  testLocalGoodnessOfFit(dataSeries, 3, 1)
  testFirstDerivativeAtPosition(dataSeries, 4, 7.036357128393298) // datapoint 4
  testSecondDerivativeAtPosition(dataSeries, 4, 4.000000000000016)
  testLocalGoodnessOfFit(dataSeries, 4, 1)
  testFirstDerivativeAtPosition(dataSeries, 5, 7.6084099552971) // datapoint 5
  testSecondDerivativeAtPosition(dataSeries, 5, 4.000000000000016)
  testLocalGoodnessOfFit(dataSeries, 5, 1)
  testFirstDerivativeAtPosition(dataSeries, 6, 8.140361322290131) // datapoint 6
  testSecondDerivativeAtPosition(dataSeries, 6, 4.000000000000016)
  testLocalGoodnessOfFit(dataSeries, 6, 1)
  testFirstDerivativeAtPosition(dataSeries, 7, 8.639621685410173) // datapoint 7
  testSecondDerivativeAtPosition(dataSeries, 7, 4.000000000000016)
  testLocalGoodnessOfFit(dataSeries, 7, 1)
  testFirstDerivativeAtPosition(dataSeries, 8, 9.111566455696973) // datapoint 8
  testSecondDerivativeAtPosition(dataSeries, 8, 4.000000000000016)
  testLocalGoodnessOfFit(dataSeries, 8, 1)
  testFirstDerivativeAtPosition(dataSeries, 9, 9.560241821531257) // datapoint 9
  testSecondDerivativeAtPosition(dataSeries, 9, 4.000000000000016)
  testLocalGoodnessOfFit(dataSeries, 9, 1)
  dataSeries.push(1.4971959786895, 10.471975511966) // Datapoint 10, currentDt = 0,107135523306685
  testLength(dataSeries, 11)
  testIsReliable(dataSeries, true)
  testCoefficientA(dataSeries, 1.9999999999999885)
  testCoefficientB(dataSeries, 4.00000000000001)
  testCoefficientC(dataSeries, 0)
  testGoodnessOfFitEquals(dataSeries, 1)
  testFirstDerivativeAtPosition(dataSeries, 0, 4.00000000000001) // datapoint 0
  testSecondDerivativeAtPosition(dataSeries, 0, 3.999999999999977)
  testLocalGoodnessOfFit(dataSeries, 0, 1)
  testFirstDerivativeAtPosition(dataSeries, 1, 4.937365735852756) // datapoint 1
  testSecondDerivativeAtPosition(dataSeries, 1, 3.999999999999977)
  testLocalGoodnessOfFit(dataSeries, 1, 1)
  testFirstDerivativeAtPosition(dataSeries, 2, 5.723212456229939) // datapoint 2
  testSecondDerivativeAtPosition(dataSeries, 2, 3.999999999999977)
  testLocalGoodnessOfFit(dataSeries, 2, 1)
  testFirstDerivativeAtPosition(dataSeries, 3, 6.413481209820317) // datapoint 3
  testSecondDerivativeAtPosition(dataSeries, 3, 3.999999999999977)
  testLocalGoodnessOfFit(dataSeries, 3, 1)
  testFirstDerivativeAtPosition(dataSeries, 4, 7.036357128393284) // datapoint 4
  testSecondDerivativeAtPosition(dataSeries, 4, 3.999999999999977)
  testLocalGoodnessOfFit(dataSeries, 4, 1)
  testFirstDerivativeAtPosition(dataSeries, 5, 7.6084099552970805) // datapoint 5
  testSecondDerivativeAtPosition(dataSeries, 5, 3.999999999999977)
  testLocalGoodnessOfFit(dataSeries, 5, 1)
  testFirstDerivativeAtPosition(dataSeries, 6, 8.140361322290106) // datapoint 6
  testSecondDerivativeAtPosition(dataSeries, 6, 3.999999999999977)
  testLocalGoodnessOfFit(dataSeries, 6, 1)
  testFirstDerivativeAtPosition(dataSeries, 7, 8.639621685410143) // datapoint 7
  testSecondDerivativeAtPosition(dataSeries, 7, 3.999999999999977)
  testLocalGoodnessOfFit(dataSeries, 7, 1)
  testFirstDerivativeAtPosition(dataSeries, 8, 9.111566455696941) // datapoint 8
  testSecondDerivativeAtPosition(dataSeries, 8, 3.999999999999977)
  testLocalGoodnessOfFit(dataSeries, 8, 1)
  testFirstDerivativeAtPosition(dataSeries, 9, 9.560241821531218) // datapoint 9
  testSecondDerivativeAtPosition(dataSeries, 9, 3.999999999999977)
  testLocalGoodnessOfFit(dataSeries, 9, 1)
  testFirstDerivativeAtPosition(dataSeries, 10, 9.988783914757974) // datapoint 10
  testSecondDerivativeAtPosition(dataSeries, 10, 3.999999999999977)
  testLocalGoodnessOfFit(dataSeries, 10, 1)
  dataSeries.push(1.59992048562668, 11.5191730631626) // Datapoint 11, currentDt = 0,102724506937187
  testLength(dataSeries, 12)
  testIsReliable(dataSeries, true)
  testCoefficientA(dataSeries, 2.000000000000018)
  testCoefficientB(dataSeries, 3.9999999999999805)
  testCoefficientC(dataSeries, 5.329070518200751e-15)
  testGoodnessOfFitEquals(dataSeries, 1)
  testFirstDerivativeAtPosition(dataSeries, 0, 3.9999999999999805) // datapoint 0
  testSecondDerivativeAtPosition(dataSeries, 0, 4.000000000000036)
  testLocalGoodnessOfFit(dataSeries, 0, 1)
  testFirstDerivativeAtPosition(dataSeries, 1, 4.937365735852741) // datapoint 1
  testSecondDerivativeAtPosition(dataSeries, 1, 4.000000000000036)
  testLocalGoodnessOfFit(dataSeries, 1, 1)
  testFirstDerivativeAtPosition(dataSeries, 2, 5.723212456229936) // datapoint 2
  testSecondDerivativeAtPosition(dataSeries, 2, 4.000000000000036)
  testLocalGoodnessOfFit(dataSeries, 2, 1)
  testFirstDerivativeAtPosition(dataSeries, 3, 6.413481209820322) // datapoint 3
  testSecondDerivativeAtPosition(dataSeries, 3, 4.000000000000036)
  testLocalGoodnessOfFit(dataSeries, 3, 1)
  testFirstDerivativeAtPosition(dataSeries, 4, 7.0363571283933) // datapoint 4
  testSecondDerivativeAtPosition(dataSeries, 4, 4.000000000000036)
  testLocalGoodnessOfFit(dataSeries, 4, 1)
  testFirstDerivativeAtPosition(dataSeries, 5, 7.608409955297105) // datapoint 5
  testSecondDerivativeAtPosition(dataSeries, 5, 4.000000000000036)
  testLocalGoodnessOfFit(dataSeries, 5, 1)
  testFirstDerivativeAtPosition(dataSeries, 6, 8.140361322290138) // datapoint 6
  testSecondDerivativeAtPosition(dataSeries, 6, 4.000000000000036)
  testLocalGoodnessOfFit(dataSeries, 6, 1)
  testFirstDerivativeAtPosition(dataSeries, 7, 8.639621685410184) // datapoint 7
  testSecondDerivativeAtPosition(dataSeries, 7, 4.000000000000036)
  testLocalGoodnessOfFit(dataSeries, 7, 1)
  testFirstDerivativeAtPosition(dataSeries, 8, 9.111566455696988) // datapoint 8
  testSecondDerivativeAtPosition(dataSeries, 8, 4.000000000000036)
  testLocalGoodnessOfFit(dataSeries, 8, 1)
  testFirstDerivativeAtPosition(dataSeries, 9, 9.560241821531271) // datapoint 9
  testSecondDerivativeAtPosition(dataSeries, 9, 4.000000000000036)
  testLocalGoodnessOfFit(dataSeries, 9, 1)
  testFirstDerivativeAtPosition(dataSeries, 10, 9.988783914758034) // datapoint 10
  testSecondDerivativeAtPosition(dataSeries, 10, 4.000000000000036)
  testLocalGoodnessOfFit(dataSeries, 10, 1)
  testFirstDerivativeAtPosition(dataSeries, 11, 10.39968194250676) // datapoint 11
  testSecondDerivativeAtPosition(dataSeries, 11, 4.000000000000036)
  testLocalGoodnessOfFit(dataSeries, 11, 1)
  dataSeries.push(1.69873772478535, 12.5663706143592) // Datapoint 12, currentDt = 0,098817239158663
  testLength(dataSeries, 12)
  testIsReliable(dataSeries, true)
  testCoefficientA(dataSeries, 2.0000000000000124)
  testCoefficientB(dataSeries, 3.999999999999981)
  testCoefficientC(dataSeries, 8.215650382226158e-15)
  testGoodnessOfFitEquals(dataSeries, 1)
  testFirstDerivativeAtPosition(dataSeries, 0, 4.9373657358527385) // datapoint 1, the series had shifted and pushed out datapoint 0
  testSecondDerivativeAtPosition(dataSeries, 0, 4.000000000000025)
  testLocalGoodnessOfFit(dataSeries, 0, 1)
  testFirstDerivativeAtPosition(dataSeries, 1, 5.723212456229931) // datapoint 2
  testSecondDerivativeAtPosition(dataSeries, 1, 4.000000000000025)
  testLocalGoodnessOfFit(dataSeries, 1, 1)
  testFirstDerivativeAtPosition(dataSeries, 2, 6.413481209820317) // datapoint 3
  testSecondDerivativeAtPosition(dataSeries, 2, 4.000000000000025)
  testLocalGoodnessOfFit(dataSeries, 2, 1)
  testFirstDerivativeAtPosition(dataSeries, 3, 7.036357128393292) // datapoint 4
  testSecondDerivativeAtPosition(dataSeries, 3, 4.000000000000025)
  testLocalGoodnessOfFit(dataSeries, 3, 1)
  testFirstDerivativeAtPosition(dataSeries, 4, 7.608409955297096) // datapoint 5
  testSecondDerivativeAtPosition(dataSeries, 4, 4.000000000000025)
  testLocalGoodnessOfFit(dataSeries, 4, 1)
  testFirstDerivativeAtPosition(dataSeries, 5, 8.140361322290127) // datapoint 6
  testSecondDerivativeAtPosition(dataSeries, 5, 4.000000000000025)
  testLocalGoodnessOfFit(dataSeries, 5, 1)
  testFirstDerivativeAtPosition(dataSeries, 6, 8.63962168541017) // datapoint 7
  testSecondDerivativeAtPosition(dataSeries, 6, 4.000000000000025)
  testLocalGoodnessOfFit(dataSeries, 6, 1)
  testFirstDerivativeAtPosition(dataSeries, 7, 9.111566455696973) // datapoint 8
  testSecondDerivativeAtPosition(dataSeries, 7, 4.000000000000025)
  testLocalGoodnessOfFit(dataSeries, 7, 1)
  testFirstDerivativeAtPosition(dataSeries, 8, 9.560241821531255) // datapoint 9
  testSecondDerivativeAtPosition(dataSeries, 8, 4.000000000000025)
  testLocalGoodnessOfFit(dataSeries, 8, 1)
  testFirstDerivativeAtPosition(dataSeries, 9, 9.988783914758018) // datapoint 10
  testSecondDerivativeAtPosition(dataSeries, 9, 4.000000000000025)
  testLocalGoodnessOfFit(dataSeries, 9, 1)
  testFirstDerivativeAtPosition(dataSeries, 10, 10.39968194250674) // datapoint 11
  testSecondDerivativeAtPosition(dataSeries, 10, 4.000000000000025)
  testLocalGoodnessOfFit(dataSeries, 10, 1)
  testFirstDerivativeAtPosition(dataSeries, 11, 10.794950899141423) // datapoint 12
  testSecondDerivativeAtPosition(dataSeries, 11, 4.000000000000025)
  testLocalGoodnessOfFit(dataSeries, 11, 1)
  dataSeries.push(1.79406229042552, 13.6135681655558) // Datapoint 13, currentDt = 0,095324565640171
  testLength(dataSeries, 12)
  testIsReliable(dataSeries, true)
  testCoefficientA(dataSeries, 2.0000000000000204)
  testCoefficientB(dataSeries, 3.9999999999999565)
  testCoefficientC(dataSeries, 2.0650148258027912e-14)
  testGoodnessOfFitEquals(dataSeries, 1)
  testFirstDerivativeAtPosition(dataSeries, 0, 5.7232124562299145) // datapoint 2, as datapoint 1 was pushed out
  testSecondDerivativeAtPosition(dataSeries, 0, 4.000000000000041)
  testLocalGoodnessOfFit(dataSeries, 0, 1)
  testFirstDerivativeAtPosition(dataSeries, 1, 6.413481209820302) // datapoint 3
  testSecondDerivativeAtPosition(dataSeries, 1, 4.000000000000041)
  testLocalGoodnessOfFit(dataSeries, 1, 1)
  testFirstDerivativeAtPosition(dataSeries, 2, 7.03635712839328) // datapoint 4
  testSecondDerivativeAtPosition(dataSeries, 2, 4.000000000000041)
  testLocalGoodnessOfFit(dataSeries, 2, 1)
  testFirstDerivativeAtPosition(dataSeries, 3, 7.608409955297086) // datapoint 5
  testSecondDerivativeAtPosition(dataSeries, 3, 4.000000000000041)
  testLocalGoodnessOfFit(dataSeries, 3, 1)
  testFirstDerivativeAtPosition(dataSeries, 4, 8.140361322290119) // datapoint 6
  testSecondDerivativeAtPosition(dataSeries, 4, 4.000000000000041)
  testLocalGoodnessOfFit(dataSeries, 4, 1)
  testFirstDerivativeAtPosition(dataSeries, 5, 8.639621685410162) // datapoint 7
  testSecondDerivativeAtPosition(dataSeries, 5, 4.000000000000041)
  testLocalGoodnessOfFit(dataSeries, 5, 1)
  testFirstDerivativeAtPosition(dataSeries, 6, 9.11156645569697) // datapoint 8
  testSecondDerivativeAtPosition(dataSeries, 6, 4.000000000000041)
  testLocalGoodnessOfFit(dataSeries, 6, 1)
  testFirstDerivativeAtPosition(dataSeries, 7, 9.560241821531253) // datapoint 9
  testSecondDerivativeAtPosition(dataSeries, 7, 4.000000000000041)
  testLocalGoodnessOfFit(dataSeries, 7, 1)
  testFirstDerivativeAtPosition(dataSeries, 8, 9.988783914758017) // datapoint 10
  testSecondDerivativeAtPosition(dataSeries, 8, 4.000000000000041)
  testLocalGoodnessOfFit(dataSeries, 8, 1)
  testFirstDerivativeAtPosition(dataSeries, 9, 10.399681942506742) // datapoint 11
  testSecondDerivativeAtPosition(dataSeries, 9, 4.000000000000041)
  testLocalGoodnessOfFit(dataSeries, 9, 1)
  testFirstDerivativeAtPosition(dataSeries, 10, 10.794950899141426) // datapoint 12
  testSecondDerivativeAtPosition(dataSeries, 10, 4.000000000000041)
  testLocalGoodnessOfFit(dataSeries, 10, 1)
  testFirstDerivativeAtPosition(dataSeries, 11, 11.17624916170211) // datapoint 13
  testSecondDerivativeAtPosition(dataSeries, 11, 4.000000000000041)
  testLocalGoodnessOfFit(dataSeries, 11, 1)
  dataSeries.push(1.88624026345282, 14.6607657167524) // Datapoint 14, currentDt = 0,092177973027300
  testLength(dataSeries, 12)
  testIsReliable(dataSeries, true)
  testCoefficientA(dataSeries, 1.999999999999996)
  testCoefficientB(dataSeries, 4.000000000000007)
  testCoefficientC(dataSeries, -3.9968028886505635e-15)
  testGoodnessOfFitEquals(dataSeries, 1)
  testFirstDerivativeAtPosition(dataSeries, 0, 6.413481209820322) // datapoint 3, as datapoint 2 was pushed out
  testSecondDerivativeAtPosition(dataSeries, 0, 3.999999999999992)
  testLocalGoodnessOfFit(dataSeries, 0, 1)
  testFirstDerivativeAtPosition(dataSeries, 1, 7.036357128393293) // datapoint 4
  testSecondDerivativeAtPosition(dataSeries, 1, 3.999999999999992)
  testLocalGoodnessOfFit(dataSeries, 1, 1)
  testFirstDerivativeAtPosition(dataSeries, 2, 7.608409955297092) // datapoint 5
  testSecondDerivativeAtPosition(dataSeries, 2, 3.999999999999992)
  testLocalGoodnessOfFit(dataSeries, 2, 1)
  testFirstDerivativeAtPosition(dataSeries, 3, 8.140361322290119) // datapoint 6
  testSecondDerivativeAtPosition(dataSeries, 3, 3.999999999999992)
  testLocalGoodnessOfFit(dataSeries, 3, 1)
  testFirstDerivativeAtPosition(dataSeries, 4, 8.639621685410159) // datapoint 7
  testSecondDerivativeAtPosition(dataSeries, 4, 3.999999999999992)
  testLocalGoodnessOfFit(dataSeries, 4, 1)
  testFirstDerivativeAtPosition(dataSeries, 5, 9.111566455696956) // datapoint 8
  testSecondDerivativeAtPosition(dataSeries, 5, 3.999999999999992)
  testLocalGoodnessOfFit(dataSeries, 5, 1)
  testFirstDerivativeAtPosition(dataSeries, 6, 9.560241821531235) // datapoint 9
  testSecondDerivativeAtPosition(dataSeries, 6, 3.999999999999992)
  testLocalGoodnessOfFit(dataSeries, 6, 1)
  testFirstDerivativeAtPosition(dataSeries, 7, 9.988783914757995) // datapoint 10
  testSecondDerivativeAtPosition(dataSeries, 7, 3.999999999999992)
  testLocalGoodnessOfFit(dataSeries, 7, 1)
  testFirstDerivativeAtPosition(dataSeries, 8, 10.399681942506714) // datapoint 11
  testSecondDerivativeAtPosition(dataSeries, 8, 3.999999999999992)
  testLocalGoodnessOfFit(dataSeries, 8, 1)
  testFirstDerivativeAtPosition(dataSeries, 9, 10.794950899141394) // datapoint 12
  testSecondDerivativeAtPosition(dataSeries, 9, 3.999999999999992)
  testLocalGoodnessOfFit(dataSeries, 9, 1)
  testFirstDerivativeAtPosition(dataSeries, 10, 11.176249161702072) // datapoint 13
  testSecondDerivativeAtPosition(dataSeries, 10, 3.999999999999992)
  testLocalGoodnessOfFit(dataSeries, 10, 1)
  testFirstDerivativeAtPosition(dataSeries, 11, 11.54496105381127) // datapoint 14
  testSecondDerivativeAtPosition(dataSeries, 11, 3.999999999999992)
  testLocalGoodnessOfFit(dataSeries, 11, 1)
  dataSeries.push(1.97556408668583, 15.707963267949) // Datapoint 15, currentDt = 0,089323823233014
  testLength(dataSeries, 12)
  testIsReliable(dataSeries, true)
  testCoefficientA(dataSeries, 2.000000000000044)
  testCoefficientB(dataSeries, 3.999999999999893)
  testCoefficientC(dataSeries, 5.88418203051333e-14)
  testGoodnessOfFitEquals(dataSeries, 1)
  testFirstDerivativeAtPosition(dataSeries, 0, 7.036357128393252) // datapoint 4, as datapoint 3 was pushed out
  testSecondDerivativeAtPosition(dataSeries, 0, 4.000000000000088)
  testLocalGoodnessOfFit(dataSeries, 0, 1)
  testFirstDerivativeAtPosition(dataSeries, 1, 7.6084099552970645) // datapoint 5
  testSecondDerivativeAtPosition(dataSeries, 1, 4.000000000000088)
  testLocalGoodnessOfFit(dataSeries, 1, 1)
  testFirstDerivativeAtPosition(dataSeries, 2, 8.140361322290104) // datapoint 6
  testSecondDerivativeAtPosition(dataSeries, 2, 4.000000000000088)
  testLocalGoodnessOfFit(dataSeries, 2, 1)
  testFirstDerivativeAtPosition(dataSeries, 3, 8.639621685410155) // datapoint 7
  testSecondDerivativeAtPosition(dataSeries, 3, 4.000000000000088)
  testLocalGoodnessOfFit(dataSeries, 3, 1)
  testFirstDerivativeAtPosition(dataSeries, 4, 9.111566455696966) // datapoint 8
  testSecondDerivativeAtPosition(dataSeries, 4, 4.000000000000088)
  testLocalGoodnessOfFit(dataSeries, 4, 1)
  testFirstDerivativeAtPosition(dataSeries, 5, 9.560241821531255) // datapoint 9
  testSecondDerivativeAtPosition(dataSeries, 5, 4.000000000000088)
  testLocalGoodnessOfFit(dataSeries, 5, 1)
  testFirstDerivativeAtPosition(dataSeries, 6, 9.988783914758024) // datapoint 10
  testSecondDerivativeAtPosition(dataSeries, 6, 4.000000000000088)
  testLocalGoodnessOfFit(dataSeries, 6, 1)
  testFirstDerivativeAtPosition(dataSeries, 7, 10.399681942506753) // datapoint 11
  testSecondDerivativeAtPosition(dataSeries, 7, 4.000000000000088)
  testLocalGoodnessOfFit(dataSeries, 7, 1)
  testFirstDerivativeAtPosition(dataSeries, 8, 10.794950899141442) // datapoint 12
  testSecondDerivativeAtPosition(dataSeries, 8, 4.000000000000088)
  testLocalGoodnessOfFit(dataSeries, 8, 1)
  testFirstDerivativeAtPosition(dataSeries, 9, 11.176249161702131) // datapoint 13
  testSecondDerivativeAtPosition(dataSeries, 9, 4.000000000000088)
  testLocalGoodnessOfFit(dataSeries, 9, 1)
  testFirstDerivativeAtPosition(dataSeries, 10, 11.544961053811338) // datapoint 14
  testSecondDerivativeAtPosition(dataSeries, 10, 4.000000000000088)
  testLocalGoodnessOfFit(dataSeries, 10, 1)
  testFirstDerivativeAtPosition(dataSeries, 11, 11.902256346743387) // datapoint 15
  testSecondDerivativeAtPosition(dataSeries, 11, 4.000000000000088)
  testLocalGoodnessOfFit(dataSeries, 11, 1)
  dataSeries.push(2.06228352860619, 16.7551608191456) // Datapoint 16, currentDt = 0,086719441920360
  testLength(dataSeries, 12)
  testIsReliable(dataSeries, true)
  testCoefficientA(dataSeries, 2.000000000000065)
  testCoefficientB(dataSeries, 3.9999999999998357)
  testCoefficientC(dataSeries, 9.769962616701378e-14)
  testGoodnessOfFitEquals(dataSeries, 1)
  testFirstDerivativeAtPosition(dataSeries, 0, 7.608409955297045) // datapoint 5
  testSecondDerivativeAtPosition(dataSeries, 0, 4.00000000000013)
  testLocalGoodnessOfFit(dataSeries, 0, 1)
  testFirstDerivativeAtPosition(dataSeries, 1, 8.14036132229009) // datapoint 6
  testSecondDerivativeAtPosition(dataSeries, 1, 4.00000000000013)
  testLocalGoodnessOfFit(dataSeries, 1, 1)
  testFirstDerivativeAtPosition(dataSeries, 2, 8.639621685410145) // datapoint 7
  testSecondDerivativeAtPosition(dataSeries, 2, 4.00000000000013)
  testLocalGoodnessOfFit(dataSeries, 2, 1)
  testFirstDerivativeAtPosition(dataSeries, 3, 9.111566455696963) // datapoint 8
  testSecondDerivativeAtPosition(dataSeries, 3, 4.00000000000013)
  testLocalGoodnessOfFit(dataSeries, 3, 1)
  testFirstDerivativeAtPosition(dataSeries, 4, 9.560241821531257) // datapoint 9
  testSecondDerivativeAtPosition(dataSeries, 4, 4.00000000000013)
  testLocalGoodnessOfFit(dataSeries, 4, 1)
  testFirstDerivativeAtPosition(dataSeries, 5, 9.98878391475803) // datapoint 10
  testSecondDerivativeAtPosition(dataSeries, 5, 4.00000000000013)
  testLocalGoodnessOfFit(dataSeries, 5, 1)
  testFirstDerivativeAtPosition(dataSeries, 6, 10.399681942506763) // datapoint 11
  testSecondDerivativeAtPosition(dataSeries, 6, 4.00000000000013)
  testLocalGoodnessOfFit(dataSeries, 6, 1)
  testFirstDerivativeAtPosition(dataSeries, 7, 10.794950899141455) // datapoint 12
  testSecondDerivativeAtPosition(dataSeries, 7, 4.00000000000013)
  testLocalGoodnessOfFit(dataSeries, 7, 1)
  testFirstDerivativeAtPosition(dataSeries, 8, 11.176249161702149) // datapoint 13
  testSecondDerivativeAtPosition(dataSeries, 8, 4.00000000000013)
  testLocalGoodnessOfFit(dataSeries, 8, 1)
  testFirstDerivativeAtPosition(dataSeries, 9, 11.54496105381136) // datapoint 14
  testSecondDerivativeAtPosition(dataSeries, 9, 4.00000000000013)
  testLocalGoodnessOfFit(dataSeries, 9, 1)
  testFirstDerivativeAtPosition(dataSeries, 10, 11.90225634674341) // datapoint 15
  testSecondDerivativeAtPosition(dataSeries, 10, 4.00000000000013)
  testLocalGoodnessOfFit(dataSeries, 10, 1)
  testFirstDerivativeAtPosition(dataSeries, 11, 12.249134114424862) // datapoint 16
  testSecondDerivativeAtPosition(dataSeries, 11, 4.00000000000013)
  testLocalGoodnessOfFit(dataSeries, 11, 1)
  dataSeries.push(2.14661392375536, 17.8023583703422) // Datapoint 17, currentDt = 0,084330395149166
  testLength(dataSeries, 12)
  testIsReliable(dataSeries, true)
  testCoefficientA(dataSeries, 1.999999999999992)
  testCoefficientB(dataSeries, 4.00000000000005)
  testCoefficientC(dataSeries, -6.084022174945858e-14)
  testGoodnessOfFitEquals(dataSeries, 1)
  testFirstDerivativeAtPosition(dataSeries, 0, 8.140361322290154) // datapoint 6
  testSecondDerivativeAtPosition(dataSeries, 0, 3.999999999999984)
  testLocalGoodnessOfFit(dataSeries, 0, 1)
  testFirstDerivativeAtPosition(dataSeries, 1, 8.63962168541019) // datapoint 7
  testSecondDerivativeAtPosition(dataSeries, 1, 3.999999999999984)
  testLocalGoodnessOfFit(dataSeries, 1, 1)
  testFirstDerivativeAtPosition(dataSeries, 2, 9.11156645569699) // datapoint 8
  testSecondDerivativeAtPosition(dataSeries, 2, 3.999999999999984)
  testLocalGoodnessOfFit(dataSeries, 2, 1)
  testFirstDerivativeAtPosition(dataSeries, 3, 9.560241821531267) // datapoint 9
  testSecondDerivativeAtPosition(dataSeries, 3, 3.999999999999984)
  testLocalGoodnessOfFit(dataSeries, 3, 1)
  testFirstDerivativeAtPosition(dataSeries, 4, 9.988783914758026) // datapoint 10
  testSecondDerivativeAtPosition(dataSeries, 4, 3.999999999999984)
  testLocalGoodnessOfFit(dataSeries, 4, 1)
  testFirstDerivativeAtPosition(dataSeries, 5, 10.399681942506744) // datapoint 11
  testSecondDerivativeAtPosition(dataSeries, 5, 3.999999999999984)
  testLocalGoodnessOfFit(dataSeries, 5, 1)
  testFirstDerivativeAtPosition(dataSeries, 6, 10.794950899141423) // datapoint 12
  testSecondDerivativeAtPosition(dataSeries, 6, 3.999999999999984)
  testLocalGoodnessOfFit(dataSeries, 6, 1)
  testFirstDerivativeAtPosition(dataSeries, 7, 11.176249161702101) // datapoint 13
  testSecondDerivativeAtPosition(dataSeries, 7, 3.999999999999984)
  testLocalGoodnessOfFit(dataSeries, 7, 1)
  testFirstDerivativeAtPosition(dataSeries, 8, 11.5449610538113) // datapoint 14
  testSecondDerivativeAtPosition(dataSeries, 8, 3.999999999999984)
  testLocalGoodnessOfFit(dataSeries, 8, 1)
  testFirstDerivativeAtPosition(dataSeries, 9, 11.902256346743338) // datapoint 15
  testSecondDerivativeAtPosition(dataSeries, 9, 3.999999999999984)
  testLocalGoodnessOfFit(dataSeries, 9, 1)
  testFirstDerivativeAtPosition(dataSeries, 10, 12.249134114424775) // datapoint 16
  testSecondDerivativeAtPosition(dataSeries, 10, 3.999999999999984)
  testLocalGoodnessOfFit(dataSeries, 10, 1)
  testFirstDerivativeAtPosition(dataSeries, 11, 12.586455695021456) // datapoint 17
  testSecondDerivativeAtPosition(dataSeries, 11, 3.999999999999984)
  testLocalGoodnessOfFit(dataSeries, 11, 1)
  dataSeries.push(2.22874247359082, 18.8495559215388) // Datapoint 18, currentDt = 0,082128549835466
  testLength(dataSeries, 12)
  testIsReliable(dataSeries, true)
  testCoefficientA(dataSeries, 2.0000000000001164)
  testCoefficientB(dataSeries, 3.999999999999644)
  testCoefficientC(dataSeries, 2.686739719592879e-13)
  testGoodnessOfFitEquals(dataSeries, 1)
  testFirstDerivativeAtPosition(dataSeries, 0, 8.639621685410074) // datapoint 7
  testSecondDerivativeAtPosition(dataSeries, 0, 4.000000000000233)
  testLocalGoodnessOfFit(dataSeries, 0, 1)
  testFirstDerivativeAtPosition(dataSeries, 1, 9.111566455696902) // datapoint 8
  testSecondDerivativeAtPosition(dataSeries, 1, 4.000000000000233)
  testLocalGoodnessOfFit(dataSeries, 1, 1)
  testFirstDerivativeAtPosition(dataSeries, 2, 9.560241821531207) // datapoint 9
  testSecondDerivativeAtPosition(dataSeries, 2, 4.000000000000233)
  testLocalGoodnessOfFit(dataSeries, 2, 1)
  testFirstDerivativeAtPosition(dataSeries, 3, 9.988783914757992) // datapoint 10
  testSecondDerivativeAtPosition(dataSeries, 3, 4.000000000000233)
  testLocalGoodnessOfFit(dataSeries, 3, 1)
  testFirstDerivativeAtPosition(dataSeries, 4, 10.399681942506735) // datapoint 11
  testSecondDerivativeAtPosition(dataSeries, 4, 4.000000000000233)
  testLocalGoodnessOfFit(dataSeries, 4, 1)
  testFirstDerivativeAtPosition(dataSeries, 5, 10.794950899141439) // datapoint 12
  testSecondDerivativeAtPosition(dataSeries, 5, 4.000000000000233)
  testLocalGoodnessOfFit(dataSeries, 5, 1)
  testFirstDerivativeAtPosition(dataSeries, 6, 11.176249161702142) // datapoint 13
  testSecondDerivativeAtPosition(dataSeries, 6, 4.000000000000233)
  testLocalGoodnessOfFit(dataSeries, 6, 1)
  testFirstDerivativeAtPosition(dataSeries, 7, 11.544961053811363) // datapoint 14
  testSecondDerivativeAtPosition(dataSeries, 7, 4.000000000000233)
  testLocalGoodnessOfFit(dataSeries, 7, 1)
  testFirstDerivativeAtPosition(dataSeries, 8, 11.902256346743425) // datapoint 15
  testSecondDerivativeAtPosition(dataSeries, 8, 4.000000000000233)
  testLocalGoodnessOfFit(dataSeries, 8, 1)
  testFirstDerivativeAtPosition(dataSeries, 9, 12.249134114424884) // datapoint 16
  testSecondDerivativeAtPosition(dataSeries, 9, 4.000000000000233)
  testLocalGoodnessOfFit(dataSeries, 9, 1)
  testFirstDerivativeAtPosition(dataSeries, 10, 12.586455695021584) // datapoint 17
  testSecondDerivativeAtPosition(dataSeries, 10, 4.000000000000233)
  testLocalGoodnessOfFit(dataSeries, 10, 1)
  testFirstDerivativeAtPosition(dataSeries, 11, 12.914969894363441) // datapoint 18
  testSecondDerivativeAtPosition(dataSeries, 11, 4.000000000000233)
  testLocalGoodnessOfFit(dataSeries, 11, 1)
  dataSeries.push(2.30883313818749, 19.8967534727354) // Datapoint 19, currentDt = 0,080090664596669
  testLength(dataSeries, 12)
  testIsReliable(dataSeries, true)
  testCoefficientA(dataSeries, 2.0000000000001563)
  testCoefficientB(dataSeries, 3.999999999999474)
  testCoefficientC(dataSeries, 4.3787196091216174e-13)
  testGoodnessOfFitEquals(dataSeries, 1)
  testFirstDerivativeAtPosition(dataSeries, 0, 9.111566455696835) // datapoint 8
  testSecondDerivativeAtPosition(dataSeries, 0, 4.000000000000313)
  testLocalGoodnessOfFit(dataSeries, 0, 1)
  testFirstDerivativeAtPosition(dataSeries, 1, 9.560241821531148) // datapoint 9
  testSecondDerivativeAtPosition(dataSeries, 1, 4.000000000000313)
  testLocalGoodnessOfFit(dataSeries, 1, 1)
  testFirstDerivativeAtPosition(dataSeries, 2, 9.988783914757942) // datapoint 10
  testSecondDerivativeAtPosition(dataSeries, 2, 4.000000000000313)
  testLocalGoodnessOfFit(dataSeries, 2, 1)
  testFirstDerivativeAtPosition(dataSeries, 3, 10.399681942506694) // datapoint 11
  testSecondDerivativeAtPosition(dataSeries, 3, 4.000000000000313)
  testLocalGoodnessOfFit(dataSeries, 3, 1)
  testFirstDerivativeAtPosition(dataSeries, 4, 10.794950899141405) // datapoint 12
  testSecondDerivativeAtPosition(dataSeries, 4, 4.000000000000313)
  testLocalGoodnessOfFit(dataSeries, 4, 1)
  testFirstDerivativeAtPosition(dataSeries, 5, 11.176249161702115) // datapoint 13
  testSecondDerivativeAtPosition(dataSeries, 5, 4.000000000000313)
  testLocalGoodnessOfFit(dataSeries, 5, 1)
  testFirstDerivativeAtPosition(dataSeries, 6, 11.544961053811344) // datapoint 14
  testSecondDerivativeAtPosition(dataSeries, 6, 4.000000000000313)
  testLocalGoodnessOfFit(dataSeries, 6, 1)
  testFirstDerivativeAtPosition(dataSeries, 7, 11.90225634674341) // datapoint 15
  testSecondDerivativeAtPosition(dataSeries, 7, 4.000000000000313)
  testLocalGoodnessOfFit(dataSeries, 7, 1)
  testFirstDerivativeAtPosition(dataSeries, 8, 12.249134114424878) // datapoint 16
  testSecondDerivativeAtPosition(dataSeries, 8, 4.000000000000313)
  testLocalGoodnessOfFit(dataSeries, 8, 1)
  testFirstDerivativeAtPosition(dataSeries, 9, 12.586455695021586) // datapoint 17
  testSecondDerivativeAtPosition(dataSeries, 9, 4.000000000000313)
  testLocalGoodnessOfFit(dataSeries, 9, 1)
  testFirstDerivativeAtPosition(dataSeries, 10, 12.91496989436345) // datapoint 18
  testSecondDerivativeAtPosition(dataSeries, 10, 4.000000000000313)
  testLocalGoodnessOfFit(dataSeries, 10, 1)
  testFirstDerivativeAtPosition(dataSeries, 11, 13.235332552750155) // datapoint 19
  testSecondDerivativeAtPosition(dataSeries, 11, 4.000000000000313)
  testLocalGoodnessOfFit(dataSeries, 11, 1)
  dataSeries.push(2.38703048583357, 20.943951023932) // Datapoint 20, currentDt = 0,078197347646078
  testLength(dataSeries, 12)
  testIsReliable(dataSeries, true)
  testCoefficientA(dataSeries, 2.000000000000047)
  testCoefficientB(dataSeries, 3.9999999999998614)
  testCoefficientC(dataSeries, 1.0125233984581428e-13)
  testGoodnessOfFitEquals(dataSeries, 1)
  testFirstDerivativeAtPosition(dataSeries, 0, 9.560241821531232) // datapoint 9
  testSecondDerivativeAtPosition(dataSeries, 0, 4.000000000000094)
  testLocalGoodnessOfFit(dataSeries, 0, 1)
  testFirstDerivativeAtPosition(dataSeries, 1, 9.988783914758002) // datapoint 10
  testSecondDerivativeAtPosition(dataSeries, 1, 4.000000000000094)
  testLocalGoodnessOfFit(dataSeries, 1, 1)
  testFirstDerivativeAtPosition(dataSeries, 2, 10.399681942506732) // datapoint 11
  testSecondDerivativeAtPosition(dataSeries, 2, 4.000000000000094)
  testLocalGoodnessOfFit(dataSeries, 2, 1)
  testFirstDerivativeAtPosition(dataSeries, 3, 10.794950899141421) // datapoint 12
  testSecondDerivativeAtPosition(dataSeries, 3, 4.000000000000094)
  testLocalGoodnessOfFit(dataSeries, 3, 1)
  testFirstDerivativeAtPosition(dataSeries, 4, 11.17624916170211) // datapoint 13
  testSecondDerivativeAtPosition(dataSeries, 4, 4.000000000000094)
  testLocalGoodnessOfFit(dataSeries, 4, 1)
  testFirstDerivativeAtPosition(dataSeries, 5, 11.544961053811319) // datapoint 14
  testSecondDerivativeAtPosition(dataSeries, 5, 4.000000000000094)
  testLocalGoodnessOfFit(dataSeries, 5, 1)
  testFirstDerivativeAtPosition(dataSeries, 6, 11.902256346743368) // datapoint 15
  testSecondDerivativeAtPosition(dataSeries, 6, 4.000000000000094)
  testLocalGoodnessOfFit(dataSeries, 6, 1)
  testFirstDerivativeAtPosition(dataSeries, 7, 12.249134114424814) // datapoint 16
  testSecondDerivativeAtPosition(dataSeries, 7, 4.000000000000094)
  testLocalGoodnessOfFit(dataSeries, 7, 1)
  testFirstDerivativeAtPosition(dataSeries, 8, 12.586455695021504) // datapoint 17
  testSecondDerivativeAtPosition(dataSeries, 8, 4.000000000000094)
  testLocalGoodnessOfFit(dataSeries, 8, 1)
  testFirstDerivativeAtPosition(dataSeries, 9, 12.91496989436335) // datapoint 18
  testSecondDerivativeAtPosition(dataSeries, 9, 4.000000000000094)
  testLocalGoodnessOfFit(dataSeries, 9, 1)
  testFirstDerivativeAtPosition(dataSeries, 10, 13.235332552750037) // datapoint 19
  testSecondDerivativeAtPosition(dataSeries, 10, 4.000000000000094)
  testLocalGoodnessOfFit(dataSeries, 10, 1)
  testFirstDerivativeAtPosition(dataSeries, 11, 13.548121943334367) // datapoint 20
  testSecondDerivativeAtPosition(dataSeries, 11, 4.000000000000094)
  testLocalGoodnessOfFit(dataSeries, 11, 1)
  dataSeries.push(2.46346275966182, 21.9911485751286) // Datapoint 21, currentDt = 0,076432273828253
  testLength(dataSeries, 12)
  testIsReliable(dataSeries, true)
  testCoefficientA(dataSeries, 2.000000000000006)
  testCoefficientB(dataSeries, 4.000000000000021)
  testCoefficientC(dataSeries, -4.618527782440651e-14)
  testGoodnessOfFitEquals(dataSeries, 1)
  testFirstDerivativeAtPosition(dataSeries, 0, 9.98878391475804) // datapoint 10
  testSecondDerivativeAtPosition(dataSeries, 0, 4.000000000000012)
  testLocalGoodnessOfFit(dataSeries, 0, 1)
  testFirstDerivativeAtPosition(dataSeries, 1, 10.39968194250676) // datapoint 11
  testSecondDerivativeAtPosition(dataSeries, 1, 4.000000000000012)
  testLocalGoodnessOfFit(dataSeries, 1, 1)
  testFirstDerivativeAtPosition(dataSeries, 2, 10.794950899141442) // datapoint 12
  testSecondDerivativeAtPosition(dataSeries, 2, 4.000000000000012)
  testLocalGoodnessOfFit(dataSeries, 2, 1)
  testFirstDerivativeAtPosition(dataSeries, 3, 11.176249161702124) // datapoint 13
  testSecondDerivativeAtPosition(dataSeries, 3, 4.000000000000012)
  testLocalGoodnessOfFit(dataSeries, 3, 1)
  testFirstDerivativeAtPosition(dataSeries, 4, 11.544961053811324) // datapoint 14
  testSecondDerivativeAtPosition(dataSeries, 4, 4.000000000000012)
  testLocalGoodnessOfFit(dataSeries, 4, 1)
  testFirstDerivativeAtPosition(dataSeries, 5, 11.902256346743366) // datapoint 15
  testSecondDerivativeAtPosition(dataSeries, 5, 4.000000000000012)
  testLocalGoodnessOfFit(dataSeries, 5, 1)
  testFirstDerivativeAtPosition(dataSeries, 6, 12.249134114424805) // datapoint 16
  testSecondDerivativeAtPosition(dataSeries, 6, 4.000000000000012)
  testLocalGoodnessOfFit(dataSeries, 6, 1)
  testFirstDerivativeAtPosition(dataSeries, 7, 12.586455695021488) // datapoint 17
  testSecondDerivativeAtPosition(dataSeries, 7, 4.000000000000012)
  testLocalGoodnessOfFit(dataSeries, 7, 1)
  testFirstDerivativeAtPosition(dataSeries, 8, 12.91496989436333) // datapoint 18
  testSecondDerivativeAtPosition(dataSeries, 8, 4.000000000000012)
  testLocalGoodnessOfFit(dataSeries, 8, 1)
  testFirstDerivativeAtPosition(dataSeries, 9, 13.235332552750009) // datapoint 19
  testSecondDerivativeAtPosition(dataSeries, 9, 4.000000000000012)
  testLocalGoodnessOfFit(dataSeries, 9, 1)
  testFirstDerivativeAtPosition(dataSeries, 10, 13.548121943334332) // datapoint 20
  testSecondDerivativeAtPosition(dataSeries, 10, 4.000000000000012)
  testLocalGoodnessOfFit(dataSeries, 10, 1)
  testFirstDerivativeAtPosition(dataSeries, 11, 13.853851038647331) // datapoint 21
  testSecondDerivativeAtPosition(dataSeries, 11, 4.000000000000012)
  testLocalGoodnessOfFit(dataSeries, 11, 1)
  dataSeries.push(2.53824434757728, 23.0383461263251) // Datapoint 22, currentDt = 0,074781587915460
  testLength(dataSeries, 12)
  testIsReliable(dataSeries, true)
  testCoefficientA(dataSeries, 1.9999999999998974)
  testCoefficientB(dataSeries, 4.000000000000433)
  testCoefficientC(dataSeries, -4.1877612488860905e-13)
  testGoodnessOfFitEquals(dataSeries, 1)
  testFirstDerivativeAtPosition(dataSeries, 0, 10.399681942506824) // datapoint 11
  testSecondDerivativeAtPosition(dataSeries, 0, 3.999999999999795)
  testLocalGoodnessOfFit(dataSeries, 0, 1)
  testFirstDerivativeAtPosition(dataSeries, 1, 10.794950899141485) // datapoint 12
  testSecondDerivativeAtPosition(dataSeries, 1, 3.999999999999795)
  testLocalGoodnessOfFit(dataSeries, 1, 1)
  testFirstDerivativeAtPosition(dataSeries, 2, 11.176249161702145) // datapoint 13
  testSecondDerivativeAtPosition(dataSeries, 2, 3.999999999999795)
  testLocalGoodnessOfFit(dataSeries, 2, 1)
  testFirstDerivativeAtPosition(dataSeries, 3, 11.544961053811326) // datapoint 14
  testSecondDerivativeAtPosition(dataSeries, 3, 3.999999999999795)
  testLocalGoodnessOfFit(dataSeries, 3, 1)
  testFirstDerivativeAtPosition(dataSeries, 4, 11.902256346743348) // datapoint 15
  testSecondDerivativeAtPosition(dataSeries, 4, 3.999999999999795)
  testLocalGoodnessOfFit(dataSeries, 4, 1)
  testFirstDerivativeAtPosition(dataSeries, 5, 12.24913411442477) // datapoint 16
  testSecondDerivativeAtPosition(dataSeries, 5, 3.999999999999795)
  testLocalGoodnessOfFit(dataSeries, 5, 1)
  testFirstDerivativeAtPosition(dataSeries, 6, 12.586455695021433) // datapoint 17
  testSecondDerivativeAtPosition(dataSeries, 6, 3.999999999999795)
  testLocalGoodnessOfFit(dataSeries, 6, 1)
  testFirstDerivativeAtPosition(dataSeries, 7, 12.914969894363256) // datapoint 18
  testSecondDerivativeAtPosition(dataSeries, 7, 3.999999999999795)
  testLocalGoodnessOfFit(dataSeries, 7, 1)
  testFirstDerivativeAtPosition(dataSeries, 8, 13.235332552749918) // datapoint 19
  testSecondDerivativeAtPosition(dataSeries, 8, 3.999999999999795)
  testLocalGoodnessOfFit(dataSeries, 8, 1)
  testFirstDerivativeAtPosition(dataSeries, 9, 13.548121943334223) // datapoint 20
  testSecondDerivativeAtPosition(dataSeries, 9, 3.999999999999795)
  testLocalGoodnessOfFit(dataSeries, 9, 1)
  testFirstDerivativeAtPosition(dataSeries, 10, 13.853851038647207) // datapoint 21
  testSecondDerivativeAtPosition(dataSeries, 10, 3.999999999999795)
  testLocalGoodnessOfFit(dataSeries, 10, 1)
  testFirstDerivativeAtPosition(dataSeries, 11, 14.152977390309033) // datapoint 22
  testSecondDerivativeAtPosition(dataSeries, 11, 3.999999999999795)
  testLocalGoodnessOfFit(dataSeries, 11, 1)
  dataSeries.push(2.61147779153643, 24.0855436775217) // Datapoint 23, currentDt = 0,073233443959153
  testLength(dataSeries, 12)
  testIsReliable(dataSeries, true)
  testCoefficientA(dataSeries, 1.9999999999997056)
  testCoefficientB(dataSeries, 4.000000000001288)
  testCoefficientC(dataSeries, -1.3553602684623911e-12)
  testGoodnessOfFitEquals(dataSeries, 1)
  testFirstDerivativeAtPosition(dataSeries, 0, 10.794950899141687) // datapoint 12
  testSecondDerivativeAtPosition(dataSeries, 0, 3.999999999999411)
  testLocalGoodnessOfFit(dataSeries, 0, 1)
  testFirstDerivativeAtPosition(dataSeries, 1, 11.176249161702312) // datapoint 13
  testSecondDerivativeAtPosition(dataSeries, 1, 3.999999999999411)
  testLocalGoodnessOfFit(dataSeries, 1, 1)
  testFirstDerivativeAtPosition(dataSeries, 2, 11.544961053811456) // datapoint 14
  testSecondDerivativeAtPosition(dataSeries, 2, 3.999999999999411)
  testLocalGoodnessOfFit(dataSeries, 2, 1)
  testFirstDerivativeAtPosition(dataSeries, 3, 11.902256346743444) // datapoint 15
  testSecondDerivativeAtPosition(dataSeries, 3, 3.999999999999411)
  testLocalGoodnessOfFit(dataSeries, 3, 1)
  testFirstDerivativeAtPosition(dataSeries, 4, 12.249134114424832) // datapoint 16
  testSecondDerivativeAtPosition(dataSeries, 4, 3.999999999999411)
  testLocalGoodnessOfFit(dataSeries, 4, 1)
  testFirstDerivativeAtPosition(dataSeries, 5, 12.586455695021463) // datapoint 17
  testSecondDerivativeAtPosition(dataSeries, 5, 3.999999999999411)
  testLocalGoodnessOfFit(dataSeries, 5, 1)
  testFirstDerivativeAtPosition(dataSeries, 6, 12.914969894363255) // datapoint 18
  testSecondDerivativeAtPosition(dataSeries, 6, 3.999999999999411)
  testLocalGoodnessOfFit(dataSeries, 6, 1)
  testFirstDerivativeAtPosition(dataSeries, 7, 13.235332552749888) // datapoint 19
  testSecondDerivativeAtPosition(dataSeries, 7, 3.999999999999411)
  testLocalGoodnessOfFit(dataSeries, 7, 1)
  testFirstDerivativeAtPosition(dataSeries, 8, 13.548121943334163) // datapoint 20
  testSecondDerivativeAtPosition(dataSeries, 8, 3.999999999999411)
  testLocalGoodnessOfFit(dataSeries, 8, 1)
  testFirstDerivativeAtPosition(dataSeries, 9, 13.853851038647116) // datapoint 21
  testSecondDerivativeAtPosition(dataSeries, 9, 3.999999999999411)
  testLocalGoodnessOfFit(dataSeries, 9, 1)
  testFirstDerivativeAtPosition(dataSeries, 10, 14.152977390308914) // datapoint 22
  testSecondDerivativeAtPosition(dataSeries, 10, 3.999999999999411)
  testLocalGoodnessOfFit(dataSeries, 10, 1)
  testFirstDerivativeAtPosition(dataSeries, 11, 14.44591116614547) // datapoint 23
  testSecondDerivativeAtPosition(dataSeries, 11, 3.999999999999411)
  testLocalGoodnessOfFit(dataSeries, 11, 1)
  dataSeries.push(2.68325543702296, 25.1327412287183) // Datapoint 24, currentDt = 0,071777645486524
  testLength(dataSeries, 12)
  testIsReliable(dataSeries, true)
  testCoefficientA(dataSeries, 1.999999999999476)
  testCoefficientB(dataSeries, 4.000000000002281)
  testCoefficientC(dataSeries, -2.4211743721025414e-12)
  testGoodnessOfFitEquals(dataSeries, 1)
  testFirstDerivativeAtPosition(dataSeries, 0, 11.17624916170248) // datapoint 13
  testSecondDerivativeAtPosition(dataSeries, 0, 3.999999999998952)
  testLocalGoodnessOfFit(dataSeries, 0, 1)
  testFirstDerivativeAtPosition(dataSeries, 1, 11.544961053811583) // datapoint 14
  testSecondDerivativeAtPosition(dataSeries, 1, 3.999999999998952)
  testLocalGoodnessOfFit(dataSeries, 1, 1)
  testFirstDerivativeAtPosition(dataSeries, 2, 11.902256346743531) // datapoint 15
  testSecondDerivativeAtPosition(dataSeries, 2, 3.999999999998952)
  testLocalGoodnessOfFit(dataSeries, 2, 1)
  testFirstDerivativeAtPosition(dataSeries, 3, 12.249134114424878) // datapoint 16
  testSecondDerivativeAtPosition(dataSeries, 3, 3.999999999998952)
  testLocalGoodnessOfFit(dataSeries, 3, 1)
  testFirstDerivativeAtPosition(dataSeries, 4, 12.58645569502147) // datapoint 17
  testSecondDerivativeAtPosition(dataSeries, 4, 3.999999999998952)
  testLocalGoodnessOfFit(dataSeries, 4, 1)
  testFirstDerivativeAtPosition(dataSeries, 5, 12.914969894363225) // datapoint 18
  testSecondDerivativeAtPosition(dataSeries, 5, 3.999999999998952)
  testLocalGoodnessOfFit(dataSeries, 5, 1)
  testFirstDerivativeAtPosition(dataSeries, 6, 13.23533255274982) // datapoint 19
  testSecondDerivativeAtPosition(dataSeries, 6, 3.999999999998952)
  testLocalGoodnessOfFit(dataSeries, 6, 1)
  testFirstDerivativeAtPosition(dataSeries, 7, 13.54812194333406) // datapoint 20
  testSecondDerivativeAtPosition(dataSeries, 7, 3.999999999998952)
  testLocalGoodnessOfFit(dataSeries, 7, 1)
  testFirstDerivativeAtPosition(dataSeries, 8, 13.85385103864698) // datapoint 21
  testSecondDerivativeAtPosition(dataSeries, 8, 3.999999999998952)
  testLocalGoodnessOfFit(dataSeries, 8, 1)
  testFirstDerivativeAtPosition(dataSeries, 9, 14.15297739030874) // datapoint 22
  testSecondDerivativeAtPosition(dataSeries, 9, 3.999999999998952)
  testLocalGoodnessOfFit(dataSeries, 9, 1)
  testFirstDerivativeAtPosition(dataSeries, 10, 14.445911166145263) // datapoint 23
  testSecondDerivativeAtPosition(dataSeries, 10, 3.999999999998952)
  testLocalGoodnessOfFit(dataSeries, 10, 1)
  testFirstDerivativeAtPosition(dataSeries, 11, 14.733021748091309) // datapoint 24
  testSecondDerivativeAtPosition(dataSeries, 11, 3.999999999998952)
  testLocalGoodnessOfFit(dataSeries, 11, 1)
  dataSeries.push(2.75366079846827, 26.1799387799149) // Datapoint 25, currentDt = 0,070405361445316
  testLength(dataSeries, 12)
  testIsReliable(dataSeries, true)
  testCoefficientA(dataSeries, 1.999999999999619)
  testCoefficientB(dataSeries, 4.000000000001693)
  testCoefficientC(dataSeries, -1.822542117224657e-12)
  testGoodnessOfFitEquals(dataSeries, 1)
  testFirstDerivativeAtPosition(dataSeries, 0, 11.544961053811535) // datapoint 14
  testSecondDerivativeAtPosition(dataSeries, 0, 3.999999999999238)
  testLocalGoodnessOfFit(dataSeries, 0, 1)
  testFirstDerivativeAtPosition(dataSeries, 1, 11.902256346743506) // datapoint 15
  testSecondDerivativeAtPosition(dataSeries, 1, 3.999999999999238)
  testLocalGoodnessOfFit(dataSeries, 1, 1)
  testFirstDerivativeAtPosition(dataSeries, 2, 12.24913411442488) // datapoint 16
  testSecondDerivativeAtPosition(dataSeries, 2, 3.999999999999238)
  testLocalGoodnessOfFit(dataSeries, 2, 1)
  testFirstDerivativeAtPosition(dataSeries, 3, 12.586455695021497) // datapoint 17
  testSecondDerivativeAtPosition(dataSeries, 3, 3.999999999999238)
  testLocalGoodnessOfFit(dataSeries, 3, 1)
  testFirstDerivativeAtPosition(dataSeries, 4, 12.914969894363274) // datapoint 18
  testSecondDerivativeAtPosition(dataSeries, 4, 3.999999999999238)
  testLocalGoodnessOfFit(dataSeries, 4, 1)
  testFirstDerivativeAtPosition(dataSeries, 5, 13.235332552749894) // datapoint 19
  testSecondDerivativeAtPosition(dataSeries, 5, 3.999999999999238)
  testLocalGoodnessOfFit(dataSeries, 5, 1)
  testFirstDerivativeAtPosition(dataSeries, 6, 13.548121943334154) // datapoint 20
  testSecondDerivativeAtPosition(dataSeries, 6, 3.999999999999238)
  testLocalGoodnessOfFit(dataSeries, 6, 1)
  testFirstDerivativeAtPosition(dataSeries, 7, 13.853851038647095) // datapoint 21
  testSecondDerivativeAtPosition(dataSeries, 7, 3.999999999999238)
  testLocalGoodnessOfFit(dataSeries, 7, 1)
  testFirstDerivativeAtPosition(dataSeries, 8, 14.152977390308878) // datapoint 22
  testSecondDerivativeAtPosition(dataSeries, 8, 3.999999999999238)
  testLocalGoodnessOfFit(dataSeries, 8, 1)
  testFirstDerivativeAtPosition(dataSeries, 9, 14.445911166145423) // datapoint 23
  testSecondDerivativeAtPosition(dataSeries, 9, 3.999999999999238)
  testLocalGoodnessOfFit(dataSeries, 9, 1)
  testFirstDerivativeAtPosition(dataSeries, 10, 14.733021748091488) // datapoint 24
  testSecondDerivativeAtPosition(dataSeries, 10, 3.999999999999238)
  testLocalGoodnessOfFit(dataSeries, 10, 1)
  testFirstDerivativeAtPosition(dataSeries, 11, 15.014643193872676) // datapoint 25
  testSecondDerivativeAtPosition(dataSeries, 11, 3.999999999999238)
  testLocalGoodnessOfFit(dataSeries, 11, 1)
  dataSeries.push(2.82276969821042, 27.2271363311115) // Datapoint 26, currentDt = 0,069108899742145
  testLength(dataSeries, 12)
  testIsReliable(dataSeries, true)
  testCoefficientA(dataSeries, 1.9999999999996692)
  testCoefficientB(dataSeries, 4.000000000001454)
  testCoefficientC(dataSeries, -1.538325022920617e-12)
  testGoodnessOfFitEquals(dataSeries, 1)
  testFirstDerivativeAtPosition(dataSeries, 0, 11.902256346743467) // datapoint 15
  testSecondDerivativeAtPosition(dataSeries, 0, 3.9999999999993383)
  testLocalGoodnessOfFit(dataSeries, 0, 1)
  testFirstDerivativeAtPosition(dataSeries, 1, 12.249134114424848) // datapoint 16
  testSecondDerivativeAtPosition(dataSeries, 1, 3.9999999999993383)
  testLocalGoodnessOfFit(dataSeries, 1, 1)
  testFirstDerivativeAtPosition(dataSeries, 2, 12.586455695021474) // datapoint 17
  testSecondDerivativeAtPosition(dataSeries, 2, 3.9999999999993383)
  testLocalGoodnessOfFit(dataSeries, 2, 1)
  testFirstDerivativeAtPosition(dataSeries, 3, 12.91496989436326) // datapoint 18
  testSecondDerivativeAtPosition(dataSeries, 3, 3.9999999999993383)
  testLocalGoodnessOfFit(dataSeries, 3, 1)
  testFirstDerivativeAtPosition(dataSeries, 4, 13.235332552749885) // datapoint 19
  testSecondDerivativeAtPosition(dataSeries, 4, 3.9999999999993383)
  testLocalGoodnessOfFit(dataSeries, 4, 1)
  testFirstDerivativeAtPosition(dataSeries, 5, 13.548121943334156) // datapoint 20
  testSecondDerivativeAtPosition(dataSeries, 5, 3.9999999999993383)
  testLocalGoodnessOfFit(dataSeries, 5, 1)
  testFirstDerivativeAtPosition(dataSeries, 6, 13.853851038647104) // datapoint 21
  testSecondDerivativeAtPosition(dataSeries, 6, 3.9999999999993383)
  testLocalGoodnessOfFit(dataSeries, 6, 1)
  testFirstDerivativeAtPosition(dataSeries, 7, 14.152977390308894) // datapoint 22
  testSecondDerivativeAtPosition(dataSeries, 7, 3.9999999999993383)
  testLocalGoodnessOfFit(dataSeries, 7, 1)
  testFirstDerivativeAtPosition(dataSeries, 8, 14.445911166145446) // datapoint 23
  testSecondDerivativeAtPosition(dataSeries, 8, 3.9999999999993383)
  testLocalGoodnessOfFit(dataSeries, 8, 1)
  testFirstDerivativeAtPosition(dataSeries, 9, 14.733021748091517) // datapoint 24
  testSecondDerivativeAtPosition(dataSeries, 9, 3.9999999999993383)
  testLocalGoodnessOfFit(dataSeries, 9, 1)
  testFirstDerivativeAtPosition(dataSeries, 10, 15.014643193872711) // datapoint 25
  testSecondDerivativeAtPosition(dataSeries, 10, 3.9999999999993383)
  testLocalGoodnessOfFit(dataSeries, 10, 1)
  testFirstDerivativeAtPosition(dataSeries, 11, 15.291078792841265) // datapoint 26
  testSecondDerivativeAtPosition(dataSeries, 11, 3.9999999999993383)
  testLocalGoodnessOfFit(dataSeries, 11, 1)
  dataSeries.push(2.89065122327279, 28.2743338823081) // Datapoint 27, currentDt = 0,067881525062373
  testLength(dataSeries, 12)
  testIsReliable(dataSeries, true)
  testCoefficientA(dataSeries, 1.9999999999999296)
  testCoefficientB(dataSeries, 4.0000000000002345)
  testCoefficientC(dataSeries, -1.341149413747189e-13)
  testGoodnessOfFitEquals(dataSeries, 1)
  testFirstDerivativeAtPosition(dataSeries, 0, 12.249134114424704) // datapoint 16
  testSecondDerivativeAtPosition(dataSeries, 0, 3.9999999999998592)
  testLocalGoodnessOfFit(dataSeries, 0, 1)
  testFirstDerivativeAtPosition(dataSeries, 1, 12.586455695021373) // datapoint 17
  testSecondDerivativeAtPosition(dataSeries, 1, 3.9999999999998592)
  testLocalGoodnessOfFit(dataSeries, 1, 1)
  testFirstDerivativeAtPosition(dataSeries, 2, 12.9149698943632) // datapoint 18
  testSecondDerivativeAtPosition(dataSeries, 2, 3.9999999999998592)
  testLocalGoodnessOfFit(dataSeries, 2, 1)
  testFirstDerivativeAtPosition(dataSeries, 3, 13.235332552749869) // datapoint 19
  testSecondDerivativeAtPosition(dataSeries, 3, 3.9999999999998592)
  testLocalGoodnessOfFit(dataSeries, 3, 1)
  testFirstDerivativeAtPosition(dataSeries, 4, 13.548121943334179) // datapoint 20
  testSecondDerivativeAtPosition(dataSeries, 4, 3.9999999999998592)
  testLocalGoodnessOfFit(dataSeries, 4, 1)
  testFirstDerivativeAtPosition(dataSeries, 5, 13.853851038647168) // datapoint 21
  testSecondDerivativeAtPosition(dataSeries, 5, 3.9999999999998592)
  testLocalGoodnessOfFit(dataSeries, 5, 1)
  testFirstDerivativeAtPosition(dataSeries, 6, 14.152977390308997) // datapoint 22
  testSecondDerivativeAtPosition(dataSeries, 6, 3.9999999999998592)
  testLocalGoodnessOfFit(dataSeries, 6, 1)
  testFirstDerivativeAtPosition(dataSeries, 7, 14.445911166145587) // datapoint 23
  testSecondDerivativeAtPosition(dataSeries, 7, 3.9999999999998592)
  testLocalGoodnessOfFit(dataSeries, 7, 1)
  testFirstDerivativeAtPosition(dataSeries, 8, 14.733021748091696) // datapoint 24
  testSecondDerivativeAtPosition(dataSeries, 8, 3.9999999999998592)
  testLocalGoodnessOfFit(dataSeries, 8, 1)
  testFirstDerivativeAtPosition(dataSeries, 9, 15.014643193872928) // datapoint 25
  testSecondDerivativeAtPosition(dataSeries, 9, 3.9999999999998592)
  testLocalGoodnessOfFit(dataSeries, 9, 1)
  testFirstDerivativeAtPosition(dataSeries, 10, 15.291078792841516) // datapoint 26
  testSecondDerivativeAtPosition(dataSeries, 10, 3.9999999999998592)
  testLocalGoodnessOfFit(dataSeries, 10, 1)
  testFirstDerivativeAtPosition(dataSeries, 11, 15.562604893090988) // datapoint 27
  testSecondDerivativeAtPosition(dataSeries, 11, 3.9999999999998592)
  testLocalGoodnessOfFit(dataSeries, 11, 1)
  dataSeries.push(2.95736853436123, 29.3215314335047) // Datapoint 28, currentDt = 0,066717311088441
  testLength(dataSeries, 12)
  testIsReliable(dataSeries, true)
  testCoefficientA(dataSeries, 2.0000000000001585)
  testCoefficientB(dataSeries, 3.999999999999079)
  testCoefficientC(dataSeries, 1.3224976669334865e-12)
  testGoodnessOfFitEquals(dataSeries, 1)
  testFirstDerivativeAtPosition(dataSeries, 0, 12.5864556950212) // datapoint 17
  testSecondDerivativeAtPosition(dataSeries, 0, 4.000000000000317)
  testLocalGoodnessOfFit(dataSeries, 0, 1)
  testFirstDerivativeAtPosition(dataSeries, 1, 12.914969894363065) // datapoint 18
  testSecondDerivativeAtPosition(dataSeries, 1, 4.000000000000317)
  testLocalGoodnessOfFit(dataSeries, 1, 1)
  testFirstDerivativeAtPosition(dataSeries, 2, 13.235332552749771) // datapoint 19
  testSecondDerivativeAtPosition(dataSeries, 2, 4.000000000000317)
  testLocalGoodnessOfFit(dataSeries, 2, 1)
  testFirstDerivativeAtPosition(dataSeries, 3, 13.548121943334117) // datapoint 20
  testSecondDerivativeAtPosition(dataSeries, 3, 4.000000000000317)
  testLocalGoodnessOfFit(dataSeries, 3, 1)
  testFirstDerivativeAtPosition(dataSeries, 4, 13.85385103864714) // datapoint 21
  testSecondDerivativeAtPosition(dataSeries, 4, 4.000000000000317)
  testLocalGoodnessOfFit(dataSeries, 4, 1)
  testFirstDerivativeAtPosition(dataSeries, 5, 14.152977390309005) // datapoint 22
  testSecondDerivativeAtPosition(dataSeries, 5, 4.000000000000317)
  testLocalGoodnessOfFit(dataSeries, 5, 1)
  testFirstDerivativeAtPosition(dataSeries, 6, 14.445911166145628) // datapoint 23
  testSecondDerivativeAtPosition(dataSeries, 6, 4.000000000000317)
  testLocalGoodnessOfFit(dataSeries, 6, 1)
  testFirstDerivativeAtPosition(dataSeries, 7, 14.733021748091769) // datapoint 24
  testSecondDerivativeAtPosition(dataSeries, 7, 4.000000000000317)
  testLocalGoodnessOfFit(dataSeries, 7, 1)
  testFirstDerivativeAtPosition(dataSeries, 8, 15.014643193873034) // datapoint 25
  testSecondDerivativeAtPosition(dataSeries, 8, 4.000000000000317)
  testLocalGoodnessOfFit(dataSeries, 8, 1)
  testFirstDerivativeAtPosition(dataSeries, 9, 15.291078792841653) // datapoint 26
  testSecondDerivativeAtPosition(dataSeries, 9, 4.000000000000317)
  testLocalGoodnessOfFit(dataSeries, 9, 1)
  testFirstDerivativeAtPosition(dataSeries, 10, 15.562604893091155) // datapoint 27
  testSecondDerivativeAtPosition(dataSeries, 10, 4.000000000000317)
  testLocalGoodnessOfFit(dataSeries, 10, 1)
  testFirstDerivativeAtPosition(dataSeries, 11, 15.829474137444937) // datapoint 28
  testSecondDerivativeAtPosition(dataSeries, 11, 4.000000000000317)
  testLocalGoodnessOfFit(dataSeries, 11, 1)
  dataSeries.push(3.02297955405576, 30.3687289847013) // Datapoint 29, currentDt = 0,065611019694526
  testLength(dataSeries, 12)
  testIsReliable(dataSeries, true)
  testCoefficientA(dataSeries, 2.0000000000002034)
  testCoefficientB(dataSeries, 3.9999999999988223)
  testCoefficientC(dataSeries, 1.6857626405908377e-12)
  testGoodnessOfFitEquals(dataSeries, 1)
  testFirstDerivativeAtPosition(dataSeries, 0, 12.914969894363008) // datapoint 18
  testSecondDerivativeAtPosition(dataSeries, 0, 4.000000000000407)
  testLocalGoodnessOfFit(dataSeries, 0, 1)
  testFirstDerivativeAtPosition(dataSeries, 1, 13.235332552749721) // datapoint 19
  testSecondDerivativeAtPosition(dataSeries, 1, 4.000000000000407)
  testLocalGoodnessOfFit(dataSeries, 1, 1)
  testFirstDerivativeAtPosition(dataSeries, 2, 13.548121943334074) // datapoint 20
  testSecondDerivativeAtPosition(dataSeries, 2, 4.000000000000407)
  testLocalGoodnessOfFit(dataSeries, 2, 1)
  testFirstDerivativeAtPosition(dataSeries, 3, 13.853851038647104) // datapoint 21
  testSecondDerivativeAtPosition(dataSeries, 3, 4.000000000000407)
  testLocalGoodnessOfFit(dataSeries, 3, 1)
  testFirstDerivativeAtPosition(dataSeries, 4, 14.152977390308974) // datapoint 22
  testSecondDerivativeAtPosition(dataSeries, 4, 4.000000000000407)
  testLocalGoodnessOfFit(dataSeries, 4, 1)
  testFirstDerivativeAtPosition(dataSeries, 5, 14.445911166145605) // datapoint 23
  testSecondDerivativeAtPosition(dataSeries, 5, 4.000000000000407)
  testLocalGoodnessOfFit(dataSeries, 5, 1)
  testFirstDerivativeAtPosition(dataSeries, 6, 14.733021748091753) // datapoint 24
  testSecondDerivativeAtPosition(dataSeries, 6, 4.000000000000407)
  testLocalGoodnessOfFit(dataSeries, 6, 1)
  testFirstDerivativeAtPosition(dataSeries, 7, 15.014643193873024) // datapoint 25
  testSecondDerivativeAtPosition(dataSeries, 7, 4.000000000000407)
  testLocalGoodnessOfFit(dataSeries, 7, 1)
  testFirstDerivativeAtPosition(dataSeries, 8, 15.291078792841649) // datapoint 26
  testSecondDerivativeAtPosition(dataSeries, 8, 4.000000000000407)
  testLocalGoodnessOfFit(dataSeries, 8, 1)
  testFirstDerivativeAtPosition(dataSeries, 9, 15.562604893091159) // datapoint 27
  testSecondDerivativeAtPosition(dataSeries, 9, 4.000000000000407)
  testLocalGoodnessOfFit(dataSeries, 9, 1)
  testFirstDerivativeAtPosition(dataSeries, 10, 15.829474137444945) // datapoint 28
  testSecondDerivativeAtPosition(dataSeries, 10, 4.000000000000407)
  testLocalGoodnessOfFit(dataSeries, 10, 1)
  testFirstDerivativeAtPosition(dataSeries, 11, 16.091918216223092) // datapoint 29
  testSecondDerivativeAtPosition(dataSeries, 11, 4.000000000000407)
  testLocalGoodnessOfFit(dataSeries, 11, 1)
  dataSeries.push(3.08753755553988, 31.4159265358979) // Datapoint 30, currentDt = 0,064558001484125
  testLength(dataSeries, 12)
  testIsReliable(dataSeries, true)
  testCoefficientA(dataSeries, 2.0000000000004476)
  testCoefficientB(dataSeries, 3.999999999997489)
  testCoefficientC(dataSeries, 3.4852121189032914e-12)
  testGoodnessOfFitEquals(dataSeries, 1)
  testFirstDerivativeAtPosition(dataSeries, 0, 13.235332552749515) // datapoint 19
  testSecondDerivativeAtPosition(dataSeries, 0, 4.000000000000895)
  testLocalGoodnessOfFit(dataSeries, 0, 1)
  testFirstDerivativeAtPosition(dataSeries, 1, 13.548121943333907) // datapoint 20
  testSecondDerivativeAtPosition(dataSeries, 1, 4.000000000000895)
  testLocalGoodnessOfFit(dataSeries, 1, 1)
  testFirstDerivativeAtPosition(dataSeries, 2, 13.853851038646976) // datapoint 21
  testSecondDerivativeAtPosition(dataSeries, 2, 4.000000000000895)
  testLocalGoodnessOfFit(dataSeries, 2, 1)
  testFirstDerivativeAtPosition(dataSeries, 3, 14.15297739030888) // datapoint 22
  testSecondDerivativeAtPosition(dataSeries, 3, 4.000000000000895)
  testLocalGoodnessOfFit(dataSeries, 3, 1)
  testFirstDerivativeAtPosition(dataSeries, 4, 14.445911166145546) // datapoint 23
  testSecondDerivativeAtPosition(dataSeries, 4, 4.000000000000895)
  testLocalGoodnessOfFit(dataSeries, 4, 1)
  testFirstDerivativeAtPosition(dataSeries, 5, 14.73302174809173) // datapoint 24
  testSecondDerivativeAtPosition(dataSeries, 5, 4.000000000000895)
  testLocalGoodnessOfFit(dataSeries, 5, 1)
  testFirstDerivativeAtPosition(dataSeries, 6, 15.014643193873034) // datapoint 25
  testSecondDerivativeAtPosition(dataSeries, 6, 4.000000000000895)
  testLocalGoodnessOfFit(dataSeries, 6, 1)
  testFirstDerivativeAtPosition(dataSeries, 7, 15.291078792841695) // datapoint 26
  testSecondDerivativeAtPosition(dataSeries, 7, 4.000000000000895)
  testLocalGoodnessOfFit(dataSeries, 7, 1)
  testFirstDerivativeAtPosition(dataSeries, 8, 15.562604893091237) // datapoint 27
  testSecondDerivativeAtPosition(dataSeries, 8, 4.000000000000895)
  testLocalGoodnessOfFit(dataSeries, 8, 1)
  testFirstDerivativeAtPosition(dataSeries, 9, 15.829474137445057) // datapoint 28
  testSecondDerivativeAtPosition(dataSeries, 9, 4.000000000000895)
  testLocalGoodnessOfFit(dataSeries, 9, 1)
  testFirstDerivativeAtPosition(dataSeries, 10, 16.091918216223235) // datapoint 29
  testSecondDerivativeAtPosition(dataSeries, 10, 4.000000000000895)
  testLocalGoodnessOfFit(dataSeries, 10, 1)
  testFirstDerivativeAtPosition(dataSeries, 11, 16.350150222159773) // datapoint 30
  testSecondDerivativeAtPosition(dataSeries, 11, 4.000000000000895)
  testLocalGoodnessOfFit(dataSeries, 11, 1)
  dataSeries.push(3.15109166889232, 32.4631240870945) // Datapoint 31, currentDt = 0,063554113352442
  testLength(dataSeries, 12)
  testIsReliable(dataSeries, true)
  testCoefficientA(dataSeries, 2.0000000000006226)
  testCoefficientB(dataSeries, 3.9999999999965214)
  testCoefficientC(dataSeries, 4.8263615326504805e-12)
  testGoodnessOfFitEquals(dataSeries, 1)
  testFirstDerivativeAtPosition(dataSeries, 0, 13.548121943333774) // datapoint 20
  testSecondDerivativeAtPosition(dataSeries, 0, 4.000000000001245)
  testLocalGoodnessOfFit(dataSeries, 0, 1)
  testFirstDerivativeAtPosition(dataSeries, 1, 13.85385103864687) // datapoint 21
  testSecondDerivativeAtPosition(dataSeries, 1, 4.000000000001245)
  testLocalGoodnessOfFit(dataSeries, 1, 1)
  testFirstDerivativeAtPosition(dataSeries, 2, 14.152977390308802) // datapoint 22
  testSecondDerivativeAtPosition(dataSeries, 2, 4.000000000001245)
  testLocalGoodnessOfFit(dataSeries, 2, 1)
  testFirstDerivativeAtPosition(dataSeries, 3, 14.445911166145494) // datapoint 23
  testSecondDerivativeAtPosition(dataSeries, 3, 4.000000000001245)
  testLocalGoodnessOfFit(dataSeries, 3, 1)
  testFirstDerivativeAtPosition(dataSeries, 4, 14.733021748091703) // datapoint 24
  testSecondDerivativeAtPosition(dataSeries, 4, 4.000000000001245)
  testLocalGoodnessOfFit(dataSeries, 4, 1)
  testFirstDerivativeAtPosition(dataSeries, 5, 15.014643193873031) // datapoint 25
  testSecondDerivativeAtPosition(dataSeries, 5, 4.000000000001245)
  testLocalGoodnessOfFit(dataSeries, 5, 1)
  testFirstDerivativeAtPosition(dataSeries, 6, 15.291078792841716) // datapoint 26
  testSecondDerivativeAtPosition(dataSeries, 6, 4.000000000001245)
  testLocalGoodnessOfFit(dataSeries, 6, 1)
  testFirstDerivativeAtPosition(dataSeries, 7, 15.562604893091281) // datapoint 27
  testSecondDerivativeAtPosition(dataSeries, 7, 4.000000000001245)
  testLocalGoodnessOfFit(dataSeries, 7, 1)
  testFirstDerivativeAtPosition(dataSeries, 8, 15.829474137445125) // datapoint 28
  testSecondDerivativeAtPosition(dataSeries, 8, 4.000000000001245)
  testLocalGoodnessOfFit(dataSeries, 8, 1)
  testFirstDerivativeAtPosition(dataSeries, 9, 16.091918216223323) // datapoint 29
  testSecondDerivativeAtPosition(dataSeries, 9, 4.000000000001245)
  testLocalGoodnessOfFit(dataSeries, 9, 1)
  testFirstDerivativeAtPosition(dataSeries, 10, 16.350150222159886) // datapoint 30
  testSecondDerivativeAtPosition(dataSeries, 10, 4.000000000001245)
  testLocalGoodnessOfFit(dataSeries, 10, 1)
  testFirstDerivativeAtPosition(dataSeries, 11, 16.604366675569725) // datapoint 31
  testSecondDerivativeAtPosition(dataSeries, 11, 4.000000000001245)
  testLocalGoodnessOfFit(dataSeries, 11, 1)
})

function testLength (series, expectedValue) {
  assert.ok(series.length() === expectedValue, `Expected value for length at X-position ${series.X.atSeriesEnd()} is ${expectedValue}, encountered a ${series.length()}`)
}

function testCoefficientA (series, expectedValue) {
  assert.ok(series.coefficientA() === expectedValue, `Expected value for coefficientA at X-position ${series.X.atSeriesEnd()} is ${expectedValue}, encountered a ${series.coefficientA()}`)
}

function testCoefficientB (series, expectedValue) {
  assert.ok(series.coefficientB() === expectedValue, `Expected value for coefficientB at X-position ${series.X.atSeriesEnd()} is ${expectedValue}, encountered a ${series.coefficientB()}`)
}

function testCoefficientC (series, expectedValue) {
  assert.ok(series.coefficientC() === expectedValue, `Expected value for coefficientC at X-position ${series.X.atSeriesEnd()} is ${expectedValue}, encountered a ${series.coefficientC()}`)
}

function testGoodnessOfFitEquals (series, expectedValue) {
  assert.ok(series.goodnessOfFit() === expectedValue, `Expected goodnessOfFit at X-position ${series.X.atSeriesEnd()} is ${expectedValue}, encountered ${series.goodnessOfFit()}`)
}

function testGoodnessOfFitBetween (series, expectedValueAbove, expectedValueBelow) { // eslint-disable-line no-unused-vars
  assert.ok(series.goodnessOfFit() > expectedValueAbove, `Expected goodnessOfFit at X-position ${series.X.atSeriesEnd()} above ${expectedValueAbove}, encountered ${series.goodnessOfFit()}`)
  assert.ok(series.goodnessOfFit() < expectedValueBelow, `Expected goodnessOfFit at X-position ${series.X.atSeriesEnd()} below ${expectedValueBelow}, encountered ${series.goodnessOfFit()}`)
}

function testLocalGoodnessOfFit (series, position, expectedValue) {
  assert.ok(series.localGoodnessOfFit(position) === expectedValue, `Expected localGoodnessOfFit at X-position ${series.X.atSeriesEnd()} for position ${position} to be ${expectedValue}, encountered ${series.localGoodnessOfFit(position)}`)
}

function testSlope (series, position, expectedValue) { // eslint-disable-line no-unused-vars
  assert.ok(series.slope(position) === expectedValue, `Expected value for Slope-${position} at X-position ${series.X.atSeriesEnd()} (slope at X-position ${series.X.atPosition(position)}) is ${expectedValue}, encountered a ${series.slope(position)}`)
}

function testFirstDerivativeAtPosition (series, position, expectedValue) {
  assert.ok(series.firstDerivativeAtPosition(position) === expectedValue, `Expected value for first derivative for position ${position} at X-position ${series.X.atSeriesEnd()} is ${expectedValue}, encountered a ${series.firstDerivativeAtPosition(position)}`)
}

function testSecondDerivativeAtPosition (series, position, expectedValue) {
  assert.ok(series.secondDerivativeAtPosition(position) === expectedValue, `Expected value for second derivative for position ${position} at X-position ${series.X.atSeriesEnd()} is ${expectedValue}, encountered a ${series.secondDerivativeAtPosition(position)}`)
}

function testIsReliable (series, expectedValue) {
  assert.ok(series.reliable() === expectedValue, `Expected value for isReliable at X-position ${series.X.atSeriesEnd()} is ${expectedValue}, encountered a ${series.reliable()}`)
}

function reportAll (series) { // eslint-disable-line no-unused-vars
  assert.ok(series.coefficientA() === 99, `time: ${series.X.atSeriesEnd()}, coefficientA: ${series.coefficientA()}, coefficientB: ${series.coefficientB()}, coefficientC: ${series.coefficientC()}, Slope-10: ${series.slope(10)}, Slope-9: ${series.slope(9)}, Slope-8: ${series.slope(8)}, Slope-7: ${series.slope(7)}, Slope-6: ${series.slope(6)}, Slope-5: ${series.slope(5)}, Slope-4: ${series.slope(4)}, Slope-3: ${series.slope(3)}, Slope-2: ${series.slope(2)}, Slope-1: ${series.slope(1)}, Slope-0: ${series.slope(0)}`)
}

test.run()
