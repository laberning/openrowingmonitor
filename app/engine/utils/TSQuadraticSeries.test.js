'use strict'
/*
  Open Rowing Monitor, https://github.com/jaapvanekris/openrowingmonitor

  This keeps an array, which we can ask for an moving average

  Please note: The array contains maxLenght values
  They are arranged that dataPoints[0] is the oldest, and dataPoints[currentLength] the youngest
*/

'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { createTSQuadraticSeries } from './TSQuadraticSeries.js'

test('Quadratic Approximation should be decent for standard example 1', () => {
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
  assert.ok(dataSeries.coefficientC() === -21.89774466, `coefficientC should be -21.89774466, is ${dataSeries.coefficientC()}`) // In the example, the TI084 results in -0.1737141137, which we consider acceptably close
})

test.run()
