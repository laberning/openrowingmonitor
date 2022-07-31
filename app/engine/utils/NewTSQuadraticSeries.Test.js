'use strict'
/*
  Open Rowing Monitor, https://github.com/jaapvanekris/openrowingmonitor

  This tests the Quadratic Regression algorithm. As the tested Theil-Senn estimator is an approximation, we have to accept some slack
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { createTSQuadraticSeries } from './NewTSQuadraticSeries.js'

// ToDo: Test startup behaviour

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
  assert.ok(dataSeries.coefficientA() === 2, `coefficientA should be 2, is ${dataSeries.coefficientA()}`)
  assert.ok(dataSeries.coefficientB() === 2, `coefficientB should be 2, is ${dataSeries.coefficientB()}`)
  assert.ok(dataSeries.coefficientC() === 2, `coefficientC should be 2, is ${dataSeries.coefficientC()}`)
  // ToDo: Test after moving several points
})

test('Quadratic Approximation on a perfect noisefree function y = 2 * Math.pow(x, 2) + 2 * x + 2, with 10 datapoints andsome data shifting', () => {
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
  assert.ok(dataSeries.coefficientA() === 2, `coefficientA should be 2, is ${dataSeries.coefficientA()}`)
  assert.ok(dataSeries.coefficientB() === 2, `coefficientB should be 2, is ${dataSeries.coefficientB()}`)
  assert.ok(dataSeries.coefficientC() === 2, `coefficientC should be 2, is ${dataSeries.coefficientC()}`)
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
  assert.ok(dataSeries.coefficientA() === 2, `coefficientA should be 2, is ${dataSeries.coefficientA()}`)
  assert.ok(dataSeries.coefficientB() === 2, `coefficientB should be 2, is ${dataSeries.coefficientB()}`)
  assert.ok(dataSeries.coefficientC() === 2, `coefficientC should be 2, is ${dataSeries.coefficientC()}`)
  // ToDo: Test after moving several points
})

test('Quadratic Approximation on a perfect noisefree function y = 4 * Math.pow(x, 2) + 4 * x + 4', () => {
  // Data based on 4 x^2 + 4 x + 4
  const dataSeries = createTSQuadraticSeries(22)
  dataSeries.push(-11, 444)
  dataSeries.push(-10, 364)
  dataSeries.push(-9, 292)
  dataSeries.push(-8, 228)
  dataSeries.push(-7, 172)
  dataSeries.push(-6, 124)
  dataSeries.push(-5, 84)
  dataSeries.push(-4, 52)
  dataSeries.push(-3, 28)
  dataSeries.push(-2, 12)
  dataSeries.push(-1, 4)
  dataSeries.push(0, 4)
  dataSeries.push(1, 12)
  dataSeries.push(2, 28)
  dataSeries.push(3, 52)
  dataSeries.push(4, 84)
  dataSeries.push(5, 124)
  dataSeries.push(6, 172)
  dataSeries.push(7, 228)
  dataSeries.push(8, 292)
  dataSeries.push(9, 364)
  dataSeries.push(10, 444)
  assert.ok(dataSeries.coefficientA() === 4, `coefficientA should be 4, is ${dataSeries.coefficientA()}`)
  assert.ok(dataSeries.coefficientB() === 4, `coefficientB should be 4, is ${dataSeries.coefficientB()}`)
  assert.ok(dataSeries.coefficientC() === 4, `coefficientC should be 4, is ${dataSeries.coefficientC()}`)
})

test('Quadratic Approximation on a function with some noise (+/- 1)', () => {
  // Data based on 4 x^2 + 4 x + 4
  const dataSeries = createTSQuadraticSeries(22)
  dataSeries.push(-11, 443)
  dataSeries.push(-10, 365)
  dataSeries.push(-9, 291)
  dataSeries.push(-8, 229)
  dataSeries.push(-7, 171)
  dataSeries.push(-6, 125)
  dataSeries.push(-5, 83)
  dataSeries.push(-4, 53)
  dataSeries.push(-3, 27)
  dataSeries.push(-2, 13)
  dataSeries.push(-1, 3)
  dataSeries.push(0, 5)
  dataSeries.push(1, 11)
  dataSeries.push(2, 29)
  dataSeries.push(3, 51)
  dataSeries.push(4, 85)
  dataSeries.push(5, 123)
  dataSeries.push(6, 173)
  dataSeries.push(7, 227)
  dataSeries.push(8, 293)
  dataSeries.push(9, 363)
  dataSeries.push(10, 444)
  assert.ok(dataSeries.coefficientA() === 4, `coefficientA should be 4, is ${dataSeries.coefficientA()}`)
  assert.ok(dataSeries.coefficientB() === 4, `coefficientB should be 4, is ${dataSeries.coefficientB()}`)
  assert.ok(dataSeries.coefficientC() === 3, `coefficientC should be 3, is ${dataSeries.coefficientC()}`) // We get a 3 instead of 4, which is quite acceptable (especially since ORM ignores the C)
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
  assert.ok(dataSeries.coefficientA() === -0.17623095238095243, `coefficientA should be -0.17623095238095243, is ${dataSeries.coefficientA()}`) // In the example, the TI084 results in -0.1737141137, which we consider acceptably close
  assert.ok(dataSeries.coefficientB() === 15.008079945054948, `coefficientB should be 15.008079945054948, is ${dataSeries.coefficientB()}`) // In the example, the TI084 results in 14.52117133, which we consider acceptably close
  assert.ok(dataSeries.coefficientC() === -35.80254560439562, `coefficientC should be -35.80254560439562, is ${dataSeries.coefficientC()}`) // In the example, the TI084 results in -21.89774466, which we consider acceptably close
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
  assert.ok(dataSeries.coefficientA() === 1.0666666666666667, `coefficientA should be 1.0666666666666667, is ${dataSeries.coefficientA()}`) // The example results in 1.1071 for OLS, which we consider acceptably close
  assert.ok(dataSeries.coefficientB() === 0.833333333333333, `coefficientB should be 0.833333333333333, is ${dataSeries.coefficientB()}`) // The example results in 1 for OLS, which we consider acceptably close
  assert.ok(dataSeries.coefficientC() === 0.39999999999999947, `coefficientC should be 0.39999999999999947, is ${dataSeries.coefficientC()}`) // The example results in 0.5714 for OLS, which we consider acceptably close
})

test('Quadratic TS Estimation should be decent for standard real-life example from Unii Berlin with some noise without the vertex being part of the dataset', () => {
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
  assert.ok(dataSeries.coefficientA() === -3.1827927919154013, `coefficientA should be -3.1827927919154013, is ${dataSeries.coefficientA()}`)
  assert.ok(dataSeries.coefficientB() === 1.634722701306206, `coefficientB should be 1.634722701306206, is ${dataSeries.coefficientB()}`)
  assert.ok(dataSeries.coefficientC() === 0.11864001198418168, `coefficientC should be 0.11864001198418168, is ${dataSeries.coefficientC()}`)
})

test('Quadratic TS Estimation should result in a line for y = x (edge case!)', () => {
  // As ORM might encounter straight lines, we need to test this as well
  const dataSeries = createTSQuadraticSeries(7)
  dataSeries.push(0, 0)
  dataSeries.push(1, 1)
  dataSeries.push(2, 2)
  dataSeries.push(3, 3)
  dataSeries.push(4, 4)
  dataSeries.push(5, 5)
  dataSeries.push(6, 6)
  assert.ok(dataSeries.coefficientA() === 0, `coefficientA should be 0, is ${dataSeries.coefficientA()}`)
  assert.ok(dataSeries.coefficientB() === 1, `coefficientB should be 1, is ${dataSeries.coefficientB()}`)
  assert.ok(dataSeries.coefficientC() === 0, `coefficientC should be 0, is ${dataSeries.coefficientC()}`)
})

// ToDo: Test after reset

test.run()
