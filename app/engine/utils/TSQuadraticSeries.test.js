'use strict'
/*
  Open Rowing Monitor, https://github.com/jaapvanekris/openrowingmonitor

  This tests the Quadratic Regression algorithm. As the tested Theil-Senn estimator is an approximation, we have to accept some slack
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { createTSQuadraticSeries } from './TSQuadraticSeries.js'

test('Quadratic Approximation on a perfect noisefree function', () => {
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
})

test('Quadratic Approximation should be decent for standard example 1 with some noise', () => {
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
  assert.ok(dataSeries.coefficientA() === -0.17623095238095238, `coefficientA should be -0.17623095238095238, is ${dataSeries.coefficientA()}`) // In the example, the TI084 results in -0.1737141137, which we consider acceptably close
  assert.ok(dataSeries.coefficientB() === 15.008079945054945, `coefficientB should be 15.008079945054945, is ${dataSeries.coefficientB()}`) // In the example, the TI084 results in 14.52117133, which we consider acceptably close
  assert.ok(dataSeries.coefficientC() === -35.802545604395675, `coefficientC should be -35.802545604395675, is ${dataSeries.coefficientC()}`) // In the example, the TI084 results in -21.89774466, which we consider acceptably close
})

test.run()
