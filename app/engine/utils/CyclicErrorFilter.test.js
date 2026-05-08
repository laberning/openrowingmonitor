'use strict'
/**
 * @copyright [OpenRowingMonitor]{@link https://github.com/JaapvanEkris/openrowingmonitor}
 *
 * @file This tests all functions of the CyclicErrorCorrection filter
 */
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { createCyclicErrorFilter } from './CyclicErrorFilter.js'
import { createTSLinearSeries } from './TSLinearSeries.js'

test('Correct behaviour of the filter directly after initialisation, withou filter updates, including domain filter behaviour and sync with flank', () => {
  const baseRowerConfig = {
    numOfImpulsesPerRevolution: 2,
    flankLength: 4,
    autoAdjustDragFactor: true,
    systematicErrorAgressiveness: 1.0,
    systematicErrorNumberOfDatapoints: 20,
    minimumTimeBetweenImpulses: 0.5,
    maximumTimeBetweenImpulses: 1
  }
  const baseRegressionFunction = createTSLinearSeries(20)

  let cleanCurrentDt
  let currentDtAtSeriesBegin
  const CECFilter = createCyclicErrorFilter(baseRowerConfig, baseRegressionFunction)
  // As no changes have been made to the filter profiles, one would expect that clean = raw values, and a Goodness of Fit of 1 inside the domain
  cleanCurrentDt = CECFilter.applyFilter(1.6, 5)
  testCleanValueEquals(cleanCurrentDt, 1.6)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.000001)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, undefined)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, undefined)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0)
  cleanCurrentDt = CECFilter.applyFilter(1.5, 6)
  testCleanValueEquals(cleanCurrentDt, 1.5)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.000001)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, undefined)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, undefined)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0)
  cleanCurrentDt = CECFilter.applyFilter(1.4, 7)
  testCleanValueEquals(cleanCurrentDt, 1.4)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.04000000000000007)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, undefined)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, undefined)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0)
  cleanCurrentDt = CECFilter.applyFilter(1.3, 8)
  testCleanValueEquals(cleanCurrentDt, 1.3)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.15999999999999992)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 1.6)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 1.6)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0.000001)
  cleanCurrentDt = CECFilter.applyFilter(1.2, 9)
  testCleanValueEquals(cleanCurrentDt, 1.2)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.3600000000000001)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 1.5)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 1.5)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0.000001)
  cleanCurrentDt = CECFilter.applyFilter(1.1, 10)
  testCleanValueEquals(cleanCurrentDt, 1.1)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.6399999999999997)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 1.4)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 1.4)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0.04000000000000007)
  cleanCurrentDt = CECFilter.applyFilter(1.0, 11)
  testCleanValueEquals(cleanCurrentDt, 1.0)
  testGoodnessOfFitEquals(cleanCurrentDt, 1.0)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 1.3)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 1.3)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0.15999999999999992)
  cleanCurrentDt = CECFilter.applyFilter(0.9, 12)
  testCleanValueEquals(cleanCurrentDt, 0.9)
  testGoodnessOfFitEquals(cleanCurrentDt, 1.0)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 1.2)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 1.2)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0.3600000000000001)
  cleanCurrentDt = CECFilter.applyFilter(0.8, 13)
  testCleanValueEquals(cleanCurrentDt, 0.8)
  testGoodnessOfFitEquals(cleanCurrentDt, 1.0)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 1.1)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 1.1)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0.6399999999999997)
  cleanCurrentDt = CECFilter.applyFilter(0.7, 14)
  testCleanValueEquals(cleanCurrentDt, 0.7)
  testGoodnessOfFitEquals(cleanCurrentDt, 1.0)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 1.0)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 1.0)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 1.0)
  cleanCurrentDt = CECFilter.applyFilter(0.6, 15)
  testCleanValueEquals(cleanCurrentDt, 0.6)
  testGoodnessOfFitEquals(cleanCurrentDt, 1.0)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 0.9)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 0.9)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 1.0)
  cleanCurrentDt = CECFilter.applyFilter(0.5, 16)
  testCleanValueEquals(cleanCurrentDt, 0.5)
  testGoodnessOfFitEquals(cleanCurrentDt, 1.0)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 0.8)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 0.8)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 1.0)
  cleanCurrentDt = CECFilter.applyFilter(0.4, 17)
  testCleanValueEquals(cleanCurrentDt, 0.4)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.6400000000000001)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 0.7)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 0.7)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 1.0)
  cleanCurrentDt = CECFilter.applyFilter(0.3, 18)
  testCleanValueEquals(cleanCurrentDt, 0.3)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.36)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 0.6)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 0.6)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 1.0)
  cleanCurrentDt = CECFilter.applyFilter(0.2, 19)
  testCleanValueEquals(cleanCurrentDt, 0.2)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.16000000000000003)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 0.5)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 0.5)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 1.0)
  cleanCurrentDt = CECFilter.applyFilter(0.1, 20)
  testCleanValueEquals(cleanCurrentDt, 0.1)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.03999999999999998)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 0.4)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 0.4)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0.6400000000000001)
  cleanCurrentDt = CECFilter.applyFilter(0.0, 21)
  testCleanValueEquals(cleanCurrentDt, 0.0)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.000001)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 0.3)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 0.3)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0.36)
  cleanCurrentDt = CECFilter.applyFilter(-0.1, 22)
  testCleanValueEquals(cleanCurrentDt, -0.1)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.000001)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 0.2)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 0.2)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0.16000000000000003)
})

test('Correct behaviour of the filter after exposing it to an updated filter, agressiveness 1.0', () => {
  const baseRowerConfig = {
    numOfImpulsesPerRevolution: 2,
    flankLength: 2,
    autoAdjustDragFactor: true,
    systematicErrorAgressiveness: 1.0,
    systematicErrorNumberOfDatapoints: 20,
    minimumTimeBetweenImpulses: 0,
    maximumTimeBetweenImpulses: 25
  }

  const baseRegressionFunction = createTSLinearSeries(24)
  let cleanCurrentDt = []
  const CECFilter = createCyclicErrorFilter(baseRowerConfig, baseRegressionFunction)

  // Initialize the Linear regressor to create a function where y = x
  let i = 0
  while (i < 24) {
    baseRegressionFunction.push(i, i)
    i++
  }

  testRegressorSlopeEquals(baseRegressionFunction, 1) // Ideal value 1.0
  testRegressorInterceptEquals(baseRegressionFunction, 0) // Ideal value 0
  testRegressorGoodnessOfFitEquals(baseRegressionFunction, 1) // Ideal value 1

  // Initialise the starting point
  cleanCurrentDt[0] = CECFilter.applyFilter(0, 0)

  // Complete dataset, which will be reused for each cycle. In essence y = x, where
  // - the even datapoints are multipied by 1.1 (so correction factor should become 1/1.1 = 0.9)
  // - the odd datapoints are multipied by 0.9 (so correction factor should become 1/0.9 = 1.1)
  let testDataArray = []
  testDataArray[0] = 0
  testDataArray[1] = 0.9
  testDataArray[2] = 2.2
  testDataArray[3] = 2.7
  testDataArray[4] = 4.4
  testDataArray[5] = 4.5
  testDataArray[6] = 6.6
  testDataArray[7] = 6.3
  testDataArray[8] = 8.8
  testDataArray[9] = 8.1
  testDataArray[10] = 11.0
  testDataArray[11] = 9.9
  testDataArray[12] = 13.2
  testDataArray[13] = 11.7
  testDataArray[14] = 15.4
  testDataArray[15] = 13.5
  testDataArray[16] = 17.6
  testDataArray[17] = 15.3
  testDataArray[18] = 19.8
  testDataArray[19] = 17.1
  testDataArray[20] = 22.0
  testDataArray[21] = 18.9
  testDataArray[22] = 24.2
  testDataArray[23] = 20.7

  // Injecting the datapoints.
  // The even datapoints are multipied by 1.1 (so correction factor should become 1/1.1 = 0.9)
  // the odd datapoints are multipied by 0.9 (so correction factor is 1/0.9 = 1.1)
  for (let i = 0; i < testDataArray.length; i++) {
    CECFilter.recordRawDatapoint(i, i, testDataArray[i])
  }

  // Process the datapoints, filling the entire array
  for (let i = 0; i < Math.ceil(testDataArray.length / 2); i++) {
    CECFilter.processNextRawDatapoint()
  }

  // Filter the total series of raw datapoints
  for (let i = 0; i < testDataArray.length; i++) {
    cleanCurrentDt[i] = CECFilter.applyFilter(testDataArray[i], (30 + i))
  }

  // Check the results
  // For even magnets, the correction factor should be 0.9
  // For odd magnets, the correction factor should be 1.1
  testCleanValueObject(cleanCurrentDt[0], 0.021405367123935835, 0.9999370176071775) // Insterted value 0.0, ideal value 0.0
  testCleanValueObject(cleanCurrentDt[1], 0.9698421280169801, 1.0000000000000027) // Insterted value 0.9, ideal value 1.0
  testCleanValueObject(cleanCurrentDt[2], 1.9983559345572512, 0.9999370176071775) // Insterted value 2.2, ideal value 2.0
  testCleanValueObject(cleanCurrentDt[3], 2.952337118298812, 1.0000000000000027) // Insterted value 2.7, ideal value 3.0
  testCleanValueObject(cleanCurrentDt[4], 3.9753065019905667, 0.9999370176071775) // Insterted value 4.4, ideal Value 4.0
  testCleanValueObject(cleanCurrentDt[5], 4.934832108580643, 1.0000000000000027) // Insterted value 4.5, ideal value 5.0
  testCleanValueObject(cleanCurrentDt[6], 5.952257069423881, 0.9999370176071775) // Insterted value 6.6, ideal value 6.0
  testCleanValueObject(cleanCurrentDt[7], 6.917327098862476, 1.0000000000000027) // Insterted value 6.3, ideal value 7.0
  testCleanValueObject(cleanCurrentDt[8], 7.929207636857198, 0.9999370176071775) // Insterted value 8.8, ideal Value 8.0
  testCleanValueObject(cleanCurrentDt[9], 8.899822089144307, 1.0000000000000027) // Insterted value 8.1, ideal value 9.0
  testCleanValueObject(cleanCurrentDt[10], 9.906158204290513, 0.9999370176071775) // Insterted value 11.0, ideal value 10.0
  testCleanValueObject(cleanCurrentDt[11], 10.882317079426139, 1.0000000000000027) // Insterted value 9.9, ideal value 11.0
  testCleanValueObject(cleanCurrentDt[12], 11.883108771723826, 0.9999370176071775) // Insterted value 13.2, ideal Value 12.0
  testCleanValueObject(cleanCurrentDt[13], 12.864812069707972, 1.0000000000000027) // Insterted value 11.7, ideal value 13.0
  testCleanValueObject(cleanCurrentDt[14], 13.860059339157145, 0.9999370176071775) // Insterted value 15.4, ideal Value 14.0
  testCleanValueObject(cleanCurrentDt[15], 14.847307059989802, 1.0000000000000027) // Insterted value 13.5, ideal value 15.0
  testCleanValueObject(cleanCurrentDt[16], 15.83700990659046, 0.9999370176071775) // Insterted value 17.6, ideal value 16.0
  testCleanValueObject(cleanCurrentDt[17], 16.829802050271635, 1.0000000000000027) /// Insterted value 15.3, ideal value 17.0
  testCleanValueObject(cleanCurrentDt[18], 17.813960474023773, 0.9999370176071775) // Insterted value 19.8, ideal Value 18.0
  testCleanValueObject(cleanCurrentDt[19], 18.812297040553467, 1.0000000000000027) // Insterted value 17.1, ideal value 19.0
  testCleanValueObject(cleanCurrentDt[20], 19.79091104145709, 0.9999370176071775) // Insterted value 22.0, ideal Value 20.0
  testCleanValueObject(cleanCurrentDt[21], 20.794792030835296, 1.0000000000000027) // Insterted value 18.9, ideal value 21.0
  testCleanValueObject(cleanCurrentDt[22], 21.767861608890403, 0.9999370176071775) // Insterted value 24.2, ideal Value 22.0
  testCleanValueObject(cleanCurrentDt[23], 22.77728702111713, 1.0000000000000027) // Insterted value 20.7, ideal value 23.0

  baseRegressionFunction.reset()

  // Here we feed the cleaned data into the regression function to see the result
  for (let i = 0; i < cleanCurrentDt.length; i++) {
    baseRegressionFunction.push(i + 30, cleanCurrentDt[i].clean, cleanCurrentDt[i].goodnessOfFit)
  }

  testRegressorSlopeEquals(baseRegressionFunction, 0.9898437735589946) // Ideal value 1.0
  testRegressorInterceptEquals(baseRegressionFunction, -29.69566275016495) // Ideal value -30
  testRegressorGoodnessOfFitEquals(baseRegressionFunction, 0.9999973816413857) // Ideal value 1
})

test('Correct behaviour of the filter after exposing it to an updated filter, agressiveness 1.1', () => {
  const baseRowerConfig = {
    numOfImpulsesPerRevolution: 2,
    flankLength: 2,
    autoAdjustDragFactor: true,
    systematicErrorAgressiveness: 1.1,
    systematicErrorNumberOfDatapoints: 20,
    minimumTimeBetweenImpulses: 0,
    maximumTimeBetweenImpulses: 25
  }

  const baseRegressionFunction = createTSLinearSeries(20)
  let cleanCurrentDt = []
  const CECFilter = createCyclicErrorFilter(baseRowerConfig, baseRegressionFunction)

  // Initialize the Linear regressor to create a function where y = x
  let i = 0
  while (i < 20) {
    baseRegressionFunction.push(i, i)
    i++
  }

  // Initialise the starting point
  cleanCurrentDt[0] = CECFilter.applyFilter(0, 0)

  // Complete dataset, which will be reused for each cycle. In essence y = x, where
  // - the even datapoints are multipied by 1.1 (so correction factor should become 1/1.1 = 0.9)
  // - the odd datapoints are multipied by 0.9 (so correction factor should become 1/0.9 = 1.1)
  let testDataArray = []
  testDataArray[0] = 0
  testDataArray[1] = 0.9
  testDataArray[2] = 2.2
  testDataArray[3] = 2.7
  testDataArray[4] = 4.4
  testDataArray[5] = 4.5
  testDataArray[6] = 6.6
  testDataArray[7] = 6.3
  testDataArray[8] = 8.8
  testDataArray[9] = 8.1
  testDataArray[10] = 11.0
  testDataArray[11] = 9.9
  testDataArray[12] = 13.2
  testDataArray[13] = 11.7
  testDataArray[14] = 15.4
  testDataArray[15] = 13.5
  testDataArray[16] = 17.6
  testDataArray[17] = 15.3
  testDataArray[18] = 19.8
  testDataArray[19] = 17.1
  testDataArray[20] = 22.0
  testDataArray[21] = 18.9
  testDataArray[22] = 24.2
  testDataArray[23] = 20.7

  // Injecting the datapoints.
  // The even datapoints are multipied by 1.1 (so correction factor should become 1/1.1 = 0.9)
  // the odd datapoints are multipied by 0.9 (so correction factor is 1/0.9 = 1.1)
  for (let i = 0; i < testDataArray.length; i++) {
    baseRegressionFunction.push(i, testDataArray[i], 1)
    CECFilter.recordRawDatapoint(i, i, testDataArray[i])
  }

  testRegressorSlopeEquals(baseRegressionFunction, 0.9000000000000004) // Ideal value 1.0
  testRegressorInterceptEquals(baseRegressionFunction, 0.3999999999999986) // Ideal value 0
  testRegressorGoodnessOfFitEquals(baseRegressionFunction, 0.9072021143822042) // Ideal value 1

  // Process the datapoints, filling the entire array
  for (let i = 0; i < Math.ceil(testDataArray.length / 2); i++) {
    CECFilter.processNextRawDatapoint()
  }

  // Filter the total series of raw datapoints
  for (let i = 0; i < testDataArray.length; i++) {
    cleanCurrentDt[i] = CECFilter.applyFilter(testDataArray[i], (30 + i))
  }

  // Check the results
  // For even magnets, the correction factor should be 0.9
  // For odd magnets, the correction factor should be 1.1
  testCleanValueObject(cleanCurrentDt[0], -0.07458906182676267, 0.0009997575806960865) // Insterted value 0.0, ideal value 0.0
  testCleanValueObject(cleanCurrentDt[1], 1.0599883242320103, 1) // Insterted value 0.9, ideal value 1.0
  testCleanValueObject(cleanCurrentDt[2], 1.9166571856270798, 0.9997575806960866) // Insterted value 2.2, ideal value 2.0
  testCleanValueObject(cleanCurrentDt[3], 3.0307868490425056, 1) // Insterted value 2.7, ideal value 3.0
  testCleanValueObject(cleanCurrentDt[4], 3.907903433080922, 0.9997575806960866) // Insterted value 4.4, ideal Value 4.0
  testCleanValueObject(cleanCurrentDt[5], 5.001585373853001, 1) // Insterted value 4.5, ideal value 5.0
  testCleanValueObject(cleanCurrentDt[6], 5.899149680534764, 0.9997575806960866) // Insterted value 6.6, ideal value 6.0
  testCleanValueObject(cleanCurrentDt[7], 6.972383898663496, 1) // Insterted value 6.3, ideal value 7.0
  testCleanValueObject(cleanCurrentDt[8], 7.890395927988607, 0.9997575806960866) // Insterted value 8.8, ideal Value 8.0
  testCleanValueObject(cleanCurrentDt[9], 8.94318242347399, 1) // Insterted value 8.1, ideal value 9.0
  testCleanValueObject(cleanCurrentDt[10], 9.88164217544245, 0.9997575806960866) // Insterted value 11.0, ideal value 10.0
  testCleanValueObject(cleanCurrentDt[11], 10.913980948284486, 1) // Insterted value 9.9, ideal value 11.0
  testCleanValueObject(cleanCurrentDt[12], 11.872888422896292, 0.9997575806960866) // Insterted value 13.2, ideal Value 12.0
  testCleanValueObject(cleanCurrentDt[13], 12.884779473094982, 1) // Insterted value 11.7, ideal value 13.0
  testCleanValueObject(cleanCurrentDt[14], 13.864134670350134, 0.9997575806960866) // Insterted value 15.4, ideal Value 14.0
  testCleanValueObject(cleanCurrentDt[15], 14.855577997905476, 1) // Insterted value 13.5, ideal value 15.0
  testCleanValueObject(cleanCurrentDt[16], 15.855380917803977, 0.9997575806960866) // Insterted value 17.6, ideal value 16.0
  testCleanValueObject(cleanCurrentDt[17], 16.826376522715975, 1) /// Insterted value 15.3, ideal value 17.0
  testCleanValueObject(cleanCurrentDt[18], 17.846627165257818, 0.9997575806960866) // Insterted value 19.8, ideal Value 18.0
  testCleanValueObject(cleanCurrentDt[19], 18.79717504752647, 1) // Insterted value 17.1, ideal value 19.0
  testCleanValueObject(cleanCurrentDt[20], 19.83787341271166, 0.9997575806960866) // Insterted value 22.0, ideal Value 20.0
  testCleanValueObject(cleanCurrentDt[21], 20.767973572336963, 1) // Insterted value 18.9, ideal value 21.0
  testCleanValueObject(cleanCurrentDt[22], 21.8291196601655, 0.9997575806960866) // Insterted value 24.2, ideal Value 22.0
  testCleanValueObject(cleanCurrentDt[23], 22.738772097147457, 1) // Insterted value 20.7, ideal value 23.0

  baseRegressionFunction.reset()

  // Here we feed the cleaned data into the regression function to see the result
  for (let i = 0; i < cleanCurrentDt.length; i++) {
    baseRegressionFunction.push(i + 30, cleanCurrentDt[i].clean, cleanCurrentDt[i].goodnessOfFit)
  }

  testRegressorSlopeEquals(baseRegressionFunction, 0.9905660245066289) // Ideal value 1.0
  testRegressorInterceptEquals(baseRegressionFunction, -29.719893104892826) // Ideal value -30
  testRegressorGoodnessOfFitEquals(baseRegressionFunction, 0.9999726186786235) // Ideal value 1
})

test('Correct behaviour of the filter after exposing it to an updated filter with noisy linear regressor, agressiveness 1.0', () => {
  const baseRowerConfig = {
    numOfImpulsesPerRevolution: 2,
    flankLength: 2,
    autoAdjustDragFactor: true,
    systematicErrorAgressiveness: 1.0,
    systematicErrorNumberOfDatapoints: 20,
    minimumTimeBetweenImpulses: 0,
    maximumTimeBetweenImpulses: 25
  }

  const baseRegressionFunction = createTSLinearSeries()
  let cleanCurrentDt = []
  const CECFilter = createCyclicErrorFilter(baseRowerConfig, baseRegressionFunction)

  // Initialise the starting point
  cleanCurrentDt[0] = CECFilter.applyFilter(0, 0)

  // Complete dataset, which will be reused for each cycle. In essence y = x, where
  // - the even datapoints are multipied by 1.1 (so correction factor should become 1/1.1 = 0.9)
  // - the odd datapoints are multipied by 0.9 (so correction factor should become 1/0.9 = 1.1)
  let testDataArray = []
  testDataArray[0] = 0
  testDataArray[1] = 0.9
  testDataArray[2] = 2.2
  testDataArray[3] = 2.7
  testDataArray[4] = 4.4
  testDataArray[5] = 4.5
  testDataArray[6] = 6.6
  testDataArray[7] = 6.3
  testDataArray[8] = 8.8
  testDataArray[9] = 8.1
  testDataArray[10] = 11.0
  testDataArray[11] = 9.9
  testDataArray[12] = 13.2
  testDataArray[13] = 11.7
  testDataArray[14] = 15.4
  testDataArray[15] = 13.5
  testDataArray[16] = 17.6
  testDataArray[17] = 15.3
  testDataArray[18] = 19.8
  testDataArray[19] = 17.1
  testDataArray[20] = 22.0
  testDataArray[21] = 18.9
  testDataArray[22] = 24.2
  testDataArray[23] = 20.7

  // Injecting the datapoints.
  for (let i = 0; i < testDataArray.length; i++) {
    baseRegressionFunction.push(i, testDataArray[i], 1)
    CECFilter.recordRawDatapoint(i, i, testDataArray[i])
  }

  testRegressorSlopeEquals(baseRegressionFunction, 0.9000000000000004) // Ideal value 1.0
  testRegressorInterceptEquals(baseRegressionFunction, -1.6653345369377348e-16) // Ideal value 0
  testRegressorGoodnessOfFitEquals(baseRegressionFunction, 0.9305410182055288) // Ideal value 1

  // Process the datapoints, filling the entire array
  for (let i = 0; i < Math.ceil(testDataArray.length / 2); i++) {
    CECFilter.processNextRawDatapoint()
  }

  // Filter the total series of raw datapoints
  cleanCurrentDt = []
  for (let i = 0; i < testDataArray.length; i++) {
    cleanCurrentDt[i] = CECFilter.applyFilter(testDataArray[i], (60 + i))
  }

  // Check the results
  // For even magnets, the correction factor should be 0.9
  // For odd magnets, the correction factor should be 1.1
  testCleanValueObject(cleanCurrentDt[0], 0.04672198397237463, 0.9996128305851867) // Insterted value 0.0, ideal value 0.0
  testCleanValueObject(cleanCurrentDt[1], 0.9464106093514552, 0.9999999999999972) // Insterted value 0.9, ideal value 1.0
  testCleanValueObject(cleanCurrentDt[2], 2.019064533625233, 0.9996128305851867) // Insterted value 2.2, ideal value 2.0
  testCleanValueObject(cleanCurrentDt[3], 2.9326757959991148, 0.9999999999999972) // Insterted value 2.7, ideal value 3.0
  testCleanValueObject(cleanCurrentDt[4], 3.9914070832780917, 0.9996128305851867) // Insterted value 4.4, ideal Value 4.0
  testCleanValueObject(cleanCurrentDt[5], 4.918940982646774, 0.9999999999999972) // Insterted value 4.5, ideal value 5.0
  testCleanValueObject(cleanCurrentDt[6], 5.96374963293095, 0.9996128305851867) // Insterted value 6.6, ideal value 6.0
  testCleanValueObject(cleanCurrentDt[7], 6.905206169294433, 0.9999999999999972) // Insterted value 6.3, ideal value 7.0
  testCleanValueObject(cleanCurrentDt[8], 7.936092182583809, 0.9996128305851867) // Insterted value 8.8, ideal Value 8.0
  testCleanValueObject(cleanCurrentDt[9], 8.891471355942093, 0.9999999999999972) // Insterted value 8.1, ideal value 9.0
  testCleanValueObject(cleanCurrentDt[10], 9.90843473223667, 0.9996128305851867) // Insterted value 11.0, ideal value 10.0
  testCleanValueObject(cleanCurrentDt[11], 10.877736542589753, 0.9999999999999972) // Insterted value 9.9, ideal value 11.0
  testCleanValueObject(cleanCurrentDt[12], 11.880777281889527, 0.9996128305851867) // Insterted value 13.2, ideal Value 12.0
  testCleanValueObject(cleanCurrentDt[13], 12.864001729237412, 0.9999999999999972) // Insterted value 11.7, ideal value 13.0
  testCleanValueObject(cleanCurrentDt[14], 13.853119831542385, 0.9996128305851867) // Insterted value 15.4, ideal Value 14.0
  testCleanValueObject(cleanCurrentDt[15], 14.850266915885072, 0.9999999999999972) // Insterted value 13.5, ideal value 15.0
  testCleanValueObject(cleanCurrentDt[16], 15.825462381195244, 0.9996128305851867) // Insterted value 17.6, ideal value 16.0
  testCleanValueObject(cleanCurrentDt[17], 16.836532102532733, 0.9999999999999972) /// Insterted value 15.3, ideal value 17.0
  testCleanValueObject(cleanCurrentDt[18], 17.797804930848105, 0.9996128305851867) // Insterted value 19.8, ideal Value 18.0
  testCleanValueObject(cleanCurrentDt[19], 18.82279728918039, 0.9999999999999972) // Insterted value 17.1, ideal value 19.0
  testCleanValueObject(cleanCurrentDt[20], 19.770147480500963, 0.9996128305851867) // Insterted value 22.0, ideal Value 20.0
  testCleanValueObject(cleanCurrentDt[21], 20.80906247582805, 0.9999999999999972) // Insterted value 18.9, ideal value 21.0
  testCleanValueObject(cleanCurrentDt[22], 21.74249003015382, 0.9996128305851867) // Insterted value 24.2, ideal Value 22.0
  testCleanValueObject(cleanCurrentDt[23], 22.795327662475707, 0.9999999999999972) // Insterted value 20.7, ideal value 23.0

  baseRegressionFunction.reset()
  CECFilter.clearDatapointBuffer()

  // Here we feed the cleaned data back in, simulating an active filter for the second round
  for (let i = 0; i < cleanCurrentDt.length; i++) {
    baseRegressionFunction.push(i + 30, cleanCurrentDt[i].clean, cleanCurrentDt[i].goodnessOfFit)
    CECFilter.recordRawDatapoint(i + 30, i + 30, cleanCurrentDt[i].clean)
  }

  testRegressorSlopeEquals(baseRegressionFunction, 0.9896205322062969) // Ideal value 1.0
  testRegressorInterceptEquals(baseRegressionFunction, -29.689681155633355) // Ideal value -30
  testRegressorGoodnessOfFitEquals(baseRegressionFunction, 0.9999865281655795) // Ideal value 1

  // Process the datapoints, filling the entire array
  for (let i = 0; i < Math.ceil(testDataArray.length / 2); i++) {
    CECFilter.processNextRawDatapoint()
  }

  // Filter the total series of raw datapoints
  cleanCurrentDt = []
  for (let i = 0; i < testDataArray.length; i++) {
    cleanCurrentDt[i] = CECFilter.applyFilter(testDataArray[i], (60 + i))
  }

  // Check the results
  // For even magnets, the correction factor should be 0.9
  // For odd magnets, the correction factor should be 1.1
  testCleanValueObject(cleanCurrentDt[0], -0.11435354528323852, 0.0009676341499669797) // Insterted value 0.0, ideal value 0.0
  testCleanValueObject(cleanCurrentDt[1], 1.0212581225579935, 1.0000000000000029) // Insterted value 0.9, ideal value 1.0
  testCleanValueObject(cleanCurrentDt[2], 2.0687685991562463, 0.9676341499669797) // Insterted value 2.2, ideal value 2.0
  testCleanValueObject(cleanCurrentDt[3], 2.835067277107504, 1.0000000000000029) // Insterted value 2.7, ideal value 3.0
  testCleanValueObject(cleanCurrentDt[4], 4.251890743595731, 0.9676341499669797) // Insterted value 4.4, ideal Value 4.0
  testCleanValueObject(cleanCurrentDt[5], 4.648876431657014, 1.0000000000000029) // Insterted value 4.5, ideal value 5.0
  testCleanValueObject(cleanCurrentDt[6], 6.4350128880352155, 0.9676341499669797) // Insterted value 6.6, ideal value 6.0
  testCleanValueObject(cleanCurrentDt[7], 6.462685586206524, 1.0000000000000029) // Insterted value 6.3, ideal value 7.0
  testCleanValueObject(cleanCurrentDt[8], 8.6181350324747, 0.9676341499669797) // Insterted value 8.8, ideal Value 8.0
  testCleanValueObject(cleanCurrentDt[9], 8.276494740756034, 1.0000000000000029) // Insterted value 8.1, ideal value 9.0
  testCleanValueObject(cleanCurrentDt[10], 10.801257176914186, 0.9676341499669797) // Insterted value 11.0, ideal value 10.0
  testCleanValueObject(cleanCurrentDt[11], 10.090303895305546, 1.0000000000000029) // Insterted value 9.9, ideal value 11.0
  testCleanValueObject(cleanCurrentDt[12], 12.98437932135367, 0.9676341499669797) // Insterted value 13.2, ideal Value 12.0
  testCleanValueObject(cleanCurrentDt[13], 11.904113049855054, 1.0000000000000029) // Insterted value 11.7, ideal value 13.0
  testCleanValueObject(cleanCurrentDt[14], 15.167501465793155, 0.9676341499669797) // Insterted value 15.4, ideal Value 14.0
  testCleanValueObject(cleanCurrentDt[15], 13.717922204404564, 1.0000000000000029) // Insterted value 13.5, ideal value 15.0
  testCleanValueObject(cleanCurrentDt[16], 17.35062361023264, 0.9676341499669797) // Insterted value 17.6, ideal value 16.0
  testCleanValueObject(cleanCurrentDt[17], 15.531731358954076, 1.0000000000000029) /// Insterted value 15.3, ideal value 17.0
  testCleanValueObject(cleanCurrentDt[18], 19.533745754672122, 0.9676341499669797) // Insterted value 19.8, ideal Value 18.0
  testCleanValueObject(cleanCurrentDt[19], 17.345540513503586, 1.0000000000000029) // Insterted value 17.1, ideal value 19.0
  testCleanValueObject(cleanCurrentDt[20], 21.71686789911161, 0.9676341499669797) // Insterted value 22.0, ideal Value 20.0
  testCleanValueObject(cleanCurrentDt[21], 19.159349668053093, 1.0000000000000029) // Insterted value 18.9, ideal value 21.0
  testCleanValueObject(cleanCurrentDt[22], 23.899990043551092, 0.9676341499669797) // Insterted value 24.2, ideal Value 22.0
  testCleanValueObject(cleanCurrentDt[23], 20.973158822602603, 1.0000000000000029) // Insterted value 20.7, ideal value 23.0

  baseRegressionFunction.reset()
  CECFilter.clearDatapointBuffer()

  // Here we feed the cleaned data back in, simulating an active filter for the third round
  for (let i = 0; i < testDataArray.length; i++) {
    baseRegressionFunction.push(i + 60, cleanCurrentDt[i].clean, cleanCurrentDt[i].goodnessOfFit)
    CECFilter.recordRawDatapoint(i + 60, i + 60, cleanCurrentDt[i].clean)
  }

  testRegressorSlopeEquals(baseRegressionFunction, 0.9069045772747553) // Ideal value 1.0
  testRegressorInterceptEquals(baseRegressionFunction, -54.29992109120207) // Ideal value -60
  testRegressorGoodnessOfFitEquals(baseRegressionFunction, 0.9434603025111108) // Ideal value 1

  // Process the datapoints, filling the entire array
  for (let i = 0; i < Math.ceil(testDataArray.length / 2); i++) {
    CECFilter.processNextRawDatapoint()
  }

  // Filter the total series of raw datapoints
  cleanCurrentDt = []
  for (let i = 0; i < testDataArray.length; i++) {
    cleanCurrentDt[i] = CECFilter.applyFilter(testDataArray[i], (90 + i))
  }

  // Check the results
  // For even magnets, the correction factor should be 0.9
  // For odd magnets, the correction factor should be 1.1
  testCleanValueObject(cleanCurrentDt[0], 0.17647294859759807, 0.9789888647494898) // Insterted value 0.0, ideal value 0.0
  testCleanValueObject(cleanCurrentDt[1], 0.8033914749345807, 0.999999732411779) // Insterted value 0.9, ideal value 1.0
  testCleanValueObject(cleanCurrentDt[2], 2.181248802185604, 0.9789888647494898) // Insterted value 2.2, ideal value 2.0
  testCleanValueObject(cleanCurrentDt[3], 2.7631203219989384, 0.999999732411779) // Insterted value 2.7, ideal value 3.0
  testCleanValueObject(cleanCurrentDt[4], 4.186024655773609, 0.9789888647494898) // Insterted value 4.4, ideal Value 4.0
  testCleanValueObject(cleanCurrentDt[5], 4.722849169063296, 0.999999732411779) // Insterted value 4.5, ideal value 5.0
  testCleanValueObject(cleanCurrentDt[6], 6.1908005093616145, 0.9789888647494898) // Insterted value 6.6, ideal value 6.0
  testCleanValueObject(cleanCurrentDt[7], 6.6825780161276525, 0.999999732411779) // Insterted value 6.3, ideal value 7.0
  testCleanValueObject(cleanCurrentDt[8], 8.19557636294962, 0.9789888647494898) // Insterted value 8.8, ideal Value 8.0
  testCleanValueObject(cleanCurrentDt[9], 8.642306863192012, 0.999999732411779) // Insterted value 8.1, ideal value 9.0
  testCleanValueObject(cleanCurrentDt[10], 10.200352216537624, 0.9789888647494898) // Insterted value 11.0, ideal value 10.0
  testCleanValueObject(cleanCurrentDt[11], 10.60203571025637, 0.999999732411779) // Insterted value 9.9, ideal value 11.0
  testCleanValueObject(cleanCurrentDt[12], 12.20512807012563, 0.9789888647494898) // Insterted value 13.2, ideal Value 12.0
  testCleanValueObject(cleanCurrentDt[13], 12.561764557320725, 0.999999732411779) // Insterted value 11.7, ideal value 13.0
  testCleanValueObject(cleanCurrentDt[14], 14.209903923713636, 0.9789888647494898) // Insterted value 15.4, ideal Value 14.0
  testCleanValueObject(cleanCurrentDt[15], 14.521493404385083, 0.999999732411779) // Insterted value 13.5, ideal value 15.0
  testCleanValueObject(cleanCurrentDt[16], 16.214679777301644, 0.9789888647494898) // Insterted value 17.6, ideal value 16.0
  testCleanValueObject(cleanCurrentDt[17], 16.48122225144944, 0.999999732411779) /// Insterted value 15.3, ideal value 17.0
  testCleanValueObject(cleanCurrentDt[18], 18.219455630889648, 0.9789888647494898) // Insterted value 19.8, ideal Value 18.0
  testCleanValueObject(cleanCurrentDt[19], 18.440951098513796, 0.999999732411779) // Insterted value 17.1, ideal value 19.0
  testCleanValueObject(cleanCurrentDt[20], 20.224231484477652, 0.9789888647494898) // Insterted value 22.0, ideal Value 20.0
  testCleanValueObject(cleanCurrentDt[21], 20.400679945578155, 0.999999732411779) // Insterted value 18.9, ideal value 21.0
  testCleanValueObject(cleanCurrentDt[22], 22.229007338065657, 0.9789888647494898) // Insterted value 24.2, ideal Value 22.0
  testCleanValueObject(cleanCurrentDt[23], 22.360408792642513, 0.999999732411779) // Insterted value 20.7, ideal value 23.0

  baseRegressionFunction.reset()

  // Here we feed the cleaned data into the regression function to see the result
  for (let i = 0; i < cleanCurrentDt.length; i++) {
    baseRegressionFunction.push(i + 90, cleanCurrentDt[i].clean, cleanCurrentDt[i].goodnessOfFit)
  }

  testRegressorSlopeEquals(baseRegressionFunction, 0.9798644235321792) // Ideal value 1.0
  testRegressorInterceptEquals(baseRegressionFunction, -88.36427106649371) // Ideal value -90
  testRegressorGoodnessOfFitEquals(baseRegressionFunction, 0.9959349205421492) // Ideal value 1
})

test('Correct behaviour of the filter after exposing it to an updated filter with very noisy linear regressor (2.5%), five rounds, agressiveness 1.0, size two recoveries', () => {
  const baseRowerConfig = {
    numOfImpulsesPerRevolution: 2,
    flankLength: 2,
    autoAdjustDragFactor: true,
    systematicErrorAgressiveness: 1.0,
    systematicErrorNumberOfDatapoints: 44,
    minimumTimeBetweenImpulses: 0,
    maximumTimeBetweenImpulses: 25
  }

  const baseRegressionFunction = createTSLinearSeries()

  // Complete dataset, which will be reused for each cycle. In essence y = x, where
  // - the even datapoints are multipied by 1.025 (so correction factor should become 1/1.025 = 0.975)
  // - the odd datapoints are multipied by 0.975 (so correction factor should become 1/0.975 = 1.025)
  let testDataArray = []
  testDataArray[0] = 0
  testDataArray[1] = 0.975
  testDataArray[2] = 2.05
  testDataArray[3] = 2.925
  testDataArray[4] = 4.1
  testDataArray[5] = 4.875
  testDataArray[6] = 6.15
  testDataArray[7] = 6.825
  testDataArray[8] = 8.2
  testDataArray[9] = 8.775
  testDataArray[10] = 10.25
  testDataArray[11] = 10.725
  testDataArray[12] = 12.3
  testDataArray[13] = 12.675
  testDataArray[14] = 14.35
  testDataArray[15] = 14.625
  testDataArray[16] = 16.4
  testDataArray[17] = 16.575
  testDataArray[18] = 18.45
  testDataArray[19] = 18.525
  testDataArray[20] = 20.5
  testDataArray[21] = 20.475
  testDataArray[22] = 22.55
  testDataArray[23] = 22.425

  let cleanCurrentDt = []
  const CECFilter = createCyclicErrorFilter(baseRowerConfig, baseRegressionFunction)

  // Initialise the starting point
  cleanCurrentDt[0] = CECFilter.applyFilter(0, 0)

  // Inecting the datapoints.
  for (let i = 0; i < testDataArray.length; i++) {
    baseRegressionFunction.push(i, testDataArray[i], 1)
    CECFilter.recordRawDatapoint(i, i, testDataArray[i])
  }

  testRegressorSlopeEquals(baseRegressionFunction, 0.9750000000000002) // Ideal value 1.0
  testRegressorInterceptEquals(baseRegressionFunction, -1.1102230246251565e-16) // Ideal value 0
  testRegressorGoodnessOfFitEquals(baseRegressionFunction, 0.9955838667130681) // Ideal value 1

  // Process the datapoints, filling the entire array
  for (let i = 0; i < Math.ceil(testDataArray.length / 2); i++) {
    CECFilter.processNextRawDatapoint()
  }

  // Filter the total series of raw datapoints
  for (let i = 0; i < testDataArray.length; i++) {
    cleanCurrentDt[i] = CECFilter.applyFilter(testDataArray[i], (30 + i))
  }

  // Check the results
  // For even magnets, the correction factor should be 0.975
  // For odd magnets, the correction factor should be 1.025
  testCleanValueObject(cleanCurrentDt[0], 0.07798414227743293, 0.998111300912531) // Insterted value 0.0, ideal value 0.0
  testCleanValueObject(cleanCurrentDt[1], 0.9207031877969449, 0.9999999999999996) // Insterted value 0.975, ideal value 1.0
  testCleanValueObject(cleanCurrentDt[2], 2.078180012377459, 0.998111300912531) // Insterted value 2.05, ideal value 2.0
  testCleanValueObject(cleanCurrentDt[3], 2.918077847945701, 0.9999999999999996) // Insterted value 2.925, ideal Value 3.0
  testCleanValueObject(cleanCurrentDt[4], 4.078375882477486, 0.998111300912531) // Insterted value 4.1, ideal value 4.0
  testCleanValueObject(cleanCurrentDt[5], 4.915452508094456, 0.9999999999999996) // Insterted value 4.875, ideal value 5.0
  testCleanValueObject(cleanCurrentDt[6], 6.0785717525775125, 0.998111300912531) // Insterted value 6.15, ideal value 6.0
  testCleanValueObject(cleanCurrentDt[7], 6.912827168243212, 0.9999999999999996) // Insterted value 6.825, ideal Value 7.0
  testCleanValueObject(cleanCurrentDt[8], 8.078767622677539, 0.998111300912531) // Insterted value 8.2, ideal value 8.0
  testCleanValueObject(cleanCurrentDt[9], 8.910201828391969, 0.9999999999999996) // Insterted value 8.775, ideal value 9.0
  testCleanValueObject(cleanCurrentDt[10], 10.078963492777564, 0.998111300912531) // Insterted value 10.25, ideal value 10.0
  testCleanValueObject(cleanCurrentDt[11], 10.907576488540725, 0.9999999999999996) // Insterted value 9.9, ideal Value 11.0
  testCleanValueObject(cleanCurrentDt[12], 12.079159362877592, 0.998111300912531) // Insterted value 12.3, ideal value 12.0
  testCleanValueObject(cleanCurrentDt[13], 12.90495114868948, 0.9999999999999996) // Insterted value 12.675, ideal Value 13.0
  testCleanValueObject(cleanCurrentDt[14], 14.079355232977617, 0.998111300912531) // Insterted value 14.35, ideal value 14.0
  testCleanValueObject(cleanCurrentDt[15], 14.902325808838237, 0.9999999999999996) // Insterted value 14.625, ideal value 15.0
  testCleanValueObject(cleanCurrentDt[16], 16.079551103077645, 0.998111300912531) /// Insterted value 16.4, ideal value 16.0
  testCleanValueObject(cleanCurrentDt[17], 16.899700468986993, 0.9999999999999996) // Insterted value 16.575, ideal Value 17.0
  testCleanValueObject(cleanCurrentDt[18], 18.07974697317767, 0.998111300912531) // Insterted value 18.45, ideal value 18.0
  testCleanValueObject(cleanCurrentDt[19], 18.897075129135747, 0.9999999999999996) // Insterted value 18.525, ideal Value 19.0
  testCleanValueObject(cleanCurrentDt[20], 20.079942843277696, 0.998111300912531) // Insterted value 20.5, ideal value 20.0
  testCleanValueObject(cleanCurrentDt[21], 20.894449789284508, 0.9999999999999996) // Insterted value 20.475, ideal Value 21.0
  testCleanValueObject(cleanCurrentDt[22], 22.080138713377725, 0.998111300912531) // Insterted value 22.55, ideal value 22.0
  testCleanValueObject(cleanCurrentDt[23], 22.891824449433262, 0.9999999999999996) // Insterted value 22.425, ideal Value 23.0

  baseRegressionFunction.reset()
  CECFilter.clearDatapointBuffer()

  // Here we feed the cleaned data back in, simulating an active filter for the second round
  for (let i = 0; i < cleanCurrentDt.length; i++) {
    baseRegressionFunction.push(i + 30, cleanCurrentDt[i].clean, cleanCurrentDt[i].goodnessOfFit)
    CECFilter.recordRawDatapoint(i + 30, i + 30, cleanCurrentDt[i].clean)
  }

  testRegressorSlopeEquals(baseRegressionFunction, 0.9986873300743783) // Ideal value 1.0
  testRegressorInterceptEquals(baseRegressionFunction, -30.03860404450878) // Ideal value -30
  testRegressorGoodnessOfFitEquals(baseRegressionFunction, 0.9996915637935856) // Ideal value 1

  // Process the datapoints, filling the entire array
  for (let i = 0; i < Math.ceil(testDataArray.length / 2); i++) {
    CECFilter.processNextRawDatapoint()
  }

  // Filter the total series of raw datapoints
  cleanCurrentDt = []
  for (let i = 0; i < testDataArray.length; i++) {
    cleanCurrentDt[i] = CECFilter.applyFilter(testDataArray[i], (60 + i))
  }

  // Check the results
  // For even magnets, the correction factor should be 0.975
  // For odd magnets, the correction factor should be 1.025
  testCleanValueObject(cleanCurrentDt[0], 0.0004610382453504281, 0.9984930452162009) // Insterted value 0.0, ideal value 0.0
  testCleanValueObject(cleanCurrentDt[1], 0.9895477238267641, 0.9999999999999988) // Insterted value 0.975, ideal value 1.0
  testCleanValueObject(cleanCurrentDt[2], 2.0189041538885966, 0.9984930452162009) // Insterted value 2.05, ideal value 2.0
  testCleanValueObject(cleanCurrentDt[3], 2.9695652479709933, 0.9999999999999988) // Insterted value 2.925, ideal Value 3.0
  testCleanValueObject(cleanCurrentDt[4], 4.037347269531843, 0.9984930452162009) // Insterted value 4.1, ideal value 4.0
  testCleanValueObject(cleanCurrentDt[5], 4.949582772115224, 0.9999999999999988) // Insterted value 4.875, ideal value 5.0
  testCleanValueObject(cleanCurrentDt[6], 6.05579038517509, 0.9984930452162009) // Insterted value 6.15, ideal value 6.0
  testCleanValueObject(cleanCurrentDt[7], 6.929600296259453, 0.9999999999999988) // Insterted value 6.825, ideal Value 7.0
  testCleanValueObject(cleanCurrentDt[8], 8.074233500818334, 0.9984930452162009) // Insterted value 8.2, ideal value 8.0
  testCleanValueObject(cleanCurrentDt[9], 8.909617820403682, 0.9999999999999988) // Insterted value 8.775, ideal value 9.0
  testCleanValueObject(cleanCurrentDt[10], 10.092676616461583, 0.9984930452162009) // Insterted value 10.25, ideal value 10.0
  testCleanValueObject(cleanCurrentDt[11], 10.889635344547912, 0.9999999999999988) // Insterted value 9.9, ideal Value 11.0
  testCleanValueObject(cleanCurrentDt[12], 12.111119732104829, 0.9984930452162009) // Insterted value 12.3, ideal value 12.0
  testCleanValueObject(cleanCurrentDt[13], 12.86965286869214, 0.9999999999999988) // Insterted value 12.675, ideal Value 13.0
  testCleanValueObject(cleanCurrentDt[14], 14.129562847748074, 0.9984930452162009) // Insterted value 14.35, ideal value 14.0
  testCleanValueObject(cleanCurrentDt[15], 14.849670392836371, 0.9999999999999988) // Insterted value 14.625, ideal value 15.0
  testCleanValueObject(cleanCurrentDt[16], 16.14800596339132, 0.9984930452162009) /// Insterted value 16.4, ideal value 16.0
  testCleanValueObject(cleanCurrentDt[17], 16.8296879169806, 0.9999999999999988) // Insterted value 16.575, ideal Value 17.0
  testCleanValueObject(cleanCurrentDt[18], 18.166449079034567, 0.9984930452162009) // Insterted value 18.45, ideal value 18.0
  testCleanValueObject(cleanCurrentDt[19], 18.809705441124827, 0.9999999999999988) // Insterted value 18.525, ideal Value 19.0
  testCleanValueObject(cleanCurrentDt[20], 20.18489219467782, 0.9984930452162009) // Insterted value 20.5, ideal value 20.0
  testCleanValueObject(cleanCurrentDt[21], 20.789722965269057, 0.9999999999999988) // Insterted value 20.475, ideal Value 21.0
  testCleanValueObject(cleanCurrentDt[22], 22.203335310321062, 0.9984930452162009) // Insterted value 22.55, ideal value 22.0
  testCleanValueObject(cleanCurrentDt[23], 22.76974048941329, 0.9999999999999988) // Insterted value 22.425, ideal Value 23.0

  baseRegressionFunction.reset()
  CECFilter.clearDatapointBuffer()

  // Here we feed the cleaned data back in, simulating an active filter for the third round
  for (let i = 0; i < testDataArray.length; i++) {
    baseRegressionFunction.push(i + 60, cleanCurrentDt[i].clean, cleanCurrentDt[i].goodnessOfFit)
    CECFilter.recordRawDatapoint(i + 60, i + 60, cleanCurrentDt[i].clean)
  }

  testRegressorSlopeEquals(baseRegressionFunction, 0.9900087620721152) // Ideal value 1.0
  testRegressorInterceptEquals(baseRegressionFunction, -59.40098676257226) // Ideal value -60
  testRegressorGoodnessOfFitEquals(baseRegressionFunction, 0.9993449445830219) // Ideal value 1

  // Process the datapoints, filling the entire array
  for (let i = 0; i < Math.ceil(testDataArray.length / 2); i++) {
    CECFilter.processNextRawDatapoint()
  }

  // Filter the total series of raw datapoints
  cleanCurrentDt = []
  for (let i = 0; i < testDataArray.length; i++) {
    cleanCurrentDt[i] = CECFilter.applyFilter(testDataArray[i], (90 + i))
  }

  // Check the results
  // For even magnets, the correction factor should be 0.975
  // For odd magnets, the correction factor should be 1.025
  testCleanValueObject(cleanCurrentDt[0], -0.04374546672531451, 0.000998517840162373) // Insterted value 0.0, ideal value 0.0
  testCleanValueObject(cleanCurrentDt[1], 1.0277375627805918, 0.9999999999999986) // Insterted value 0.975, ideal value 1.0
  testCleanValueObject(cleanCurrentDt[2], 1.9873480749020505, 0.9985178401623731) // Insterted value 2.05, ideal value 2.0
  testCleanValueObject(cleanCurrentDt[3], 2.9957217548911466, 0.9999999999999986) // Insterted value 2.925, ideal Value 3.0
  testCleanValueObject(cleanCurrentDt[4], 4.018441616529415, 0.9985178401623731) // Insterted value 4.1, ideal value 4.0
  testCleanValueObject(cleanCurrentDt[5], 4.963705947001702, 0.9999999999999986) // Insterted value 4.875, ideal value 5.0
  testCleanValueObject(cleanCurrentDt[6], 6.04953515815678, 0.9985178401623731) // Insterted value 6.15, ideal value 6.0
  testCleanValueObject(cleanCurrentDt[7], 6.931690139112257, 0.9999999999999986) // Insterted value 6.825, ideal Value 7.0
  testCleanValueObject(cleanCurrentDt[8], 8.080628699784146, 0.9985178401623731) // Insterted value 8.2, ideal value 8.0
  testCleanValueObject(cleanCurrentDt[9], 8.899674331222812, 0.9999999999999986) // Insterted value 8.775, ideal value 9.0
  testCleanValueObject(cleanCurrentDt[10], 10.111722241411512, 0.9985178401623731) // Insterted value 10.25, ideal value 10.0
  testCleanValueObject(cleanCurrentDt[11], 10.867658523333366, 0.9999999999999986) // Insterted value 9.9, ideal Value 11.0
  testCleanValueObject(cleanCurrentDt[12], 12.142815783038875, 0.9985178401623731) // Insterted value 12.3, ideal value 12.0
  testCleanValueObject(cleanCurrentDt[13], 12.835642715443923, 0.9999999999999986) // Insterted value 12.675, ideal Value 13.0
  testCleanValueObject(cleanCurrentDt[14], 14.17390932466624, 0.9985178401623731) // Insterted value 14.35, ideal value 14.0
  testCleanValueObject(cleanCurrentDt[15], 14.803626907554477, 0.9999999999999986) // Insterted value 14.625, ideal value 15.0
  testCleanValueObject(cleanCurrentDt[16], 16.205002866293604, 0.9985178401623731) /// Insterted value 16.4, ideal value 16.0
  testCleanValueObject(cleanCurrentDt[17], 16.771611099665034, 0.9999999999999986) // Insterted value 16.575, ideal Value 17.0
  testCleanValueObject(cleanCurrentDt[18], 18.236096407920968, 0.9985178401623731) // Insterted value 18.45, ideal value 18.0
  testCleanValueObject(cleanCurrentDt[19], 18.739595291775586, 0.9999999999999986) // Insterted value 18.525, ideal Value 19.0
  testCleanValueObject(cleanCurrentDt[20], 20.267189949548335, 0.9985178401623731) // Insterted value 20.5, ideal value 20.0
  testCleanValueObject(cleanCurrentDt[21], 20.707579483886143, 0.9999999999999986) // Insterted value 20.475, ideal Value 21.0
  testCleanValueObject(cleanCurrentDt[22], 22.2982834911757, 0.9985178401623731) // Insterted value 22.55, ideal value 22.0
  testCleanValueObject(cleanCurrentDt[23], 22.675563675996695, 0.9999999999999986) // Insterted value 22.425, ideal Value 23.0

  baseRegressionFunction.reset()
  CECFilter.clearDatapointBuffer()

  // Here we feed the cleaned data back in, simulating an active filter for the fourth round
  for (let i = 0; i < testDataArray.length; i++) {
    baseRegressionFunction.push(i + 90, cleanCurrentDt[i].clean, cleanCurrentDt[i].goodnessOfFit)
    CECFilter.recordRawDatapoint(i + 90, i + 90, cleanCurrentDt[i].clean)
  }

  testRegressorSlopeEquals(baseRegressionFunction, 0.9858676025117252) // Ideal value 1.0
  testRegressorInterceptEquals(baseRegressionFunction, -88.68996527869929) // Ideal value -90
  testRegressorGoodnessOfFitEquals(baseRegressionFunction, 0.9987903972764073) // Ideal value 1

  // Process the datapoints, filling the entire array
  for (let i = 0; i < Math.ceil(testDataArray.length / 2); i++) {
    CECFilter.processNextRawDatapoint()
  }

  // Filter the total series of raw datapoints
  cleanCurrentDt = []
  for (let i = 0; i < testDataArray.length; i++) {
    cleanCurrentDt[i] = CECFilter.applyFilter(testDataArray[i], (120 + i))
  }

  // Check the results
  // For even magnets, the correction factor should be 0.975
  // For odd magnets, the correction factor should be 1.025
  testCleanValueObject(cleanCurrentDt[0], 0.011546556256249143, 0.999828493131169) // Insterted value 0.0, ideal value 0.0
  testCleanValueObject(cleanCurrentDt[1], 0.9740276581705011, 0.9999963158472918) // Insterted value 0.975, ideal value 1.0
  testCleanValueObject(cleanCurrentDt[2], 2.0393135925897483, 0.999828493131169) // Insterted value 2.05, ideal value 2.0
  testCleanValueObject(cleanCurrentDt[3], 2.9451760870240014, 0.9999963158472918) // Insterted value 2.925, ideal Value 3.0
  testCleanValueObject(cleanCurrentDt[4], 4.0670806289232475, 0.999828493131169) // Insterted value 4.1, ideal value 4.0
  testCleanValueObject(cleanCurrentDt[5], 4.916324515877502, 0.9999963158472918) // Insterted value 4.875, ideal value 5.0
  testCleanValueObject(cleanCurrentDt[6], 6.094847665256749, 0.999828493131169) // Insterted value 6.15, ideal value 6.0
  testCleanValueObject(cleanCurrentDt[7], 6.887472944731003, 0.9999963158472918) // Insterted value 6.825, ideal Value 7.0
  testCleanValueObject(cleanCurrentDt[8], 8.122614701590246, 0.999828493131169) // Insterted value 8.2, ideal value 8.0
  testCleanValueObject(cleanCurrentDt[9], 8.858621373584505, 0.9999963158472918) // Insterted value 8.775, ideal value 9.0
  testCleanValueObject(cleanCurrentDt[10], 10.150381737923746, 0.999828493131169) // Insterted value 10.25, ideal value 10.0
  testCleanValueObject(cleanCurrentDt[11], 10.829769802438003, 0.9999963158472918) // Insterted value 9.9, ideal Value 11.0
  testCleanValueObject(cleanCurrentDt[12], 12.178148774257249, 0.999828493131169) // Insterted value 12.3, ideal value 12.0
  testCleanValueObject(cleanCurrentDt[13], 12.800918231291504, 0.9999963158472918) // Insterted value 12.675, ideal Value 13.0
  testCleanValueObject(cleanCurrentDt[14], 14.205915810590746, 0.999828493131169) // Insterted value 14.35, ideal value 14.0
  testCleanValueObject(cleanCurrentDt[15], 14.772066660145004, 0.9999963158472918) // Insterted value 14.625, ideal value 15.0
  testCleanValueObject(cleanCurrentDt[16], 16.233682846924243, 0.999828493131169) /// Insterted value 16.4, ideal value 16.0
  testCleanValueObject(cleanCurrentDt[17], 16.743215088998504, 0.9999963158472918) // Insterted value 16.575, ideal Value 17.0
  testCleanValueObject(cleanCurrentDt[18], 18.261449883257747, 0.999828493131169) // Insterted value 18.45, ideal value 18.0
  testCleanValueObject(cleanCurrentDt[19], 18.714363517852004, 0.9999963158472918) // Insterted value 18.525, ideal Value 19.0
  testCleanValueObject(cleanCurrentDt[20], 20.289216919591244, 0.999828493131169) // Insterted value 20.5, ideal value 20.0
  testCleanValueObject(cleanCurrentDt[21], 20.685511946705507, 0.9999963158472918) // Insterted value 20.475, ideal Value 21.0
  testCleanValueObject(cleanCurrentDt[22], 22.316983955924744, 0.999828493131169) // Insterted value 22.55, ideal value 22.0
  testCleanValueObject(cleanCurrentDt[23], 22.656660375559007, 0.9999963158472918) // Insterted value 22.425, ideal Value 23.0

  baseRegressionFunction.reset()
  CECFilter.clearDatapointBuffer()

  // Here we feed the cleaned data back in, simulating an active filter for the fifth round
  for (let i = 0; i < testDataArray.length; i++) {
    baseRegressionFunction.push(i + 120, cleanCurrentDt[i].clean, cleanCurrentDt[i].goodnessOfFit)
    CECFilter.recordRawDatapoint(i + 120, i + 120, cleanCurrentDt[i].clean)
  }

  testRegressorSlopeEquals(baseRegressionFunction, 0.9855742144267506) // Ideal value 1.0
  testRegressorInterceptEquals(baseRegressionFunction, -118.28045228746632) // Ideal value -120
  testRegressorGoodnessOfFitEquals(baseRegressionFunction, 0.9984287342267387) // Ideal value 1

  // Process the datapoints, filling the entire array
  for (let i = 0; i < Math.ceil(testDataArray.length / 2); i++) {
    CECFilter.processNextRawDatapoint()
  }

  // Filter the total series of raw datapoints
  cleanCurrentDt = []
  for (let i = 0; i < testDataArray.length; i++) {
    cleanCurrentDt[i] = CECFilter.applyFilter(testDataArray[i], (150 + i))
  }

  // Check the results
  // For even magnets, the correction factor should be 0.975
  // For odd magnets, the correction factor should be 1.025
  testCleanValueObject(cleanCurrentDt[0], 0.016961253232687414, 0.9998674965045421) // Insterted value 0.0, ideal value 0.0
  testCleanValueObject(cleanCurrentDt[1], 0.9716673210063268, 0.9999963182131966) // Insterted value 0.975, ideal value 1.0
  testCleanValueObject(cleanCurrentDt[2], 2.0383063022686048, 0.9998674965045421) // Insterted value 2.05, ideal value 2.0
  testCleanValueObject(cleanCurrentDt[3], 2.948924469484355, 0.9999963182131966) // Insterted value 2.925, ideal Value 3.0
  testCleanValueObject(cleanCurrentDt[4], 4.059651351304522, 0.9998674965045421) // Insterted value 4.1, ideal value 4.0
  testCleanValueObject(cleanCurrentDt[5], 4.926181617962383, 0.9999963182131966) // Insterted value 4.875, ideal value 5.0
  testCleanValueObject(cleanCurrentDt[6], 6.08099640034044, 0.9998674965045421) // Insterted value 6.15, ideal value 6.0
  testCleanValueObject(cleanCurrentDt[7], 6.903438766440412, 0.9999963182131966) // Insterted value 6.825, ideal Value 7.0
  testCleanValueObject(cleanCurrentDt[8], 8.102341449376356, 0.9998674965045421) // Insterted value 8.2, ideal value 8.0
  testCleanValueObject(cleanCurrentDt[9], 8.88069591491844, 0.9999963182131966) // Insterted value 8.775, ideal value 9.0
  testCleanValueObject(cleanCurrentDt[10], 10.123686498412273, 0.9998674965045421) // Insterted value 10.25, ideal value 10.0
  testCleanValueObject(cleanCurrentDt[11], 10.857953063396469, 0.9999963182131966) // Insterted value 9.9, ideal Value 11.0
  testCleanValueObject(cleanCurrentDt[12], 12.145031547448191, 0.9998674965045421) // Insterted value 12.3, ideal value 12.0
  testCleanValueObject(cleanCurrentDt[13], 12.835210211874497, 0.9999963182131966) // Insterted value 12.675, ideal Value 13.0
  testCleanValueObject(cleanCurrentDt[14], 14.166376596484108, 0.9998674965045421) // Insterted value 14.35, ideal value 14.0
  testCleanValueObject(cleanCurrentDt[15], 14.812467360352525, 0.9999963182131966) // Insterted value 14.625, ideal value 15.0
  testCleanValueObject(cleanCurrentDt[16], 16.187721645520025, 0.9998674965045421) /// Insterted value 16.4, ideal value 16.0
  testCleanValueObject(cleanCurrentDt[17], 16.789724508830556, 0.9999963182131966) // Insterted value 16.575, ideal Value 17.0
  testCleanValueObject(cleanCurrentDt[18], 18.20906669455594, 0.9998674965045421) // Insterted value 18.45, ideal value 18.0
  testCleanValueObject(cleanCurrentDt[19], 18.76698165730858, 0.9999963182131966) // Insterted value 18.525, ideal Value 19.0
  testCleanValueObject(cleanCurrentDt[20], 20.23041174359186, 0.9998674965045421) // Insterted value 20.5, ideal value 20.0
  testCleanValueObject(cleanCurrentDt[21], 20.744238805786612, 0.9999963182131966) // Insterted value 20.475, ideal Value 21.0
  testCleanValueObject(cleanCurrentDt[22], 22.251756792627777, 0.9998674965045421) // Insterted value 22.55, ideal value 22.0
  testCleanValueObject(cleanCurrentDt[23], 22.72149595426464, 0.9999963182131966) // Insterted value 22.425, ideal Value 23.0

  baseRegressionFunction.reset()
  CECFilter.clearDatapointBuffer()

  // Here we feed the cleaned data back in, simulating an active filter for the fifth round
  for (let i = 0; i < testDataArray.length; i++) {
    baseRegressionFunction.push(i + 150, cleanCurrentDt[i].clean, cleanCurrentDt[i].goodnessOfFit)
    CECFilter.recordRawDatapoint(i + 150, i + 150, cleanCurrentDt[i].clean)
  }

  testRegressorSlopeEquals(baseRegressionFunction, 0.9886285742390144) // Ideal value 1.0
  testRegressorInterceptEquals(baseRegressionFunction, -148.31124738908483) // Ideal value -150
  testRegressorGoodnessOfFitEquals(baseRegressionFunction, 0.9989578675850752) // Ideal value 1

  // Process the datapoints, filling the entire array
  for (let i = 0; i < Math.ceil(testDataArray.length / 2); i++) {
    CECFilter.processNextRawDatapoint()
  }

  // Filter the total series of raw datapoints
  cleanCurrentDt = []
  for (let i = 0; i < testDataArray.length; i++) {
    cleanCurrentDt[i] = CECFilter.applyFilter(testDataArray[i], (180 + i))
  }

  // Check the results
  // For even magnets, the correction factor should be 0.975
  // For odd magnets, the correction factor should be 1.025
  testCleanValueObject(cleanCurrentDt[0], -0.006379262258864122, 0.0009999378001708077) // Insterted value 0.0, ideal value 0.0
  testCleanValueObject(cleanCurrentDt[1], 0.9937784051556133, 0.9999989846805964) // Insterted value 0.975, ideal value 1.0
  testCleanValueObject(cleanCurrentDt[2], 2.0175507449838657, 0.9999378001708076) // Insterted value 2.05, ideal value 2.0
  testCleanValueObject(cleanCurrentDt[3], 2.9685766909491123, 0.9999989846805964) // Insterted value 2.925, ideal Value 3.0
  testCleanValueObject(cleanCurrentDt[4], 4.041480752226596, 0.9999378001708076) // Insterted value 4.1, ideal value 4.0
  testCleanValueObject(cleanCurrentDt[5], 4.943374976742612, 0.9999989846805964) // Insterted value 4.875, ideal value 5.0
  testCleanValueObject(cleanCurrentDt[6], 6.0654107594693265, 0.9999378001708076) // Insterted value 6.15, ideal value 6.0
  testCleanValueObject(cleanCurrentDt[7], 6.91817326253611, 0.9999989846805964) // Insterted value 6.825, ideal Value 7.0
  testCleanValueObject(cleanCurrentDt[8], 8.089340766712056, 0.9999378001708076) // Insterted value 8.2, ideal value 8.0
  testCleanValueObject(cleanCurrentDt[9], 8.892971548329609, 0.9999989846805964) // Insterted value 8.775, ideal value 9.0
  testCleanValueObject(cleanCurrentDt[10], 10.113270773954786, 0.9999378001708076) // Insterted value 10.25, ideal value 10.0
  testCleanValueObject(cleanCurrentDt[11], 10.867769834123107, 0.9999989846805964) // Insterted value 9.9, ideal Value 11.0
  testCleanValueObject(cleanCurrentDt[12], 12.137200781197517, 0.9999378001708076) // Insterted value 12.3, ideal value 12.0
  testCleanValueObject(cleanCurrentDt[13], 12.842568119916606, 0.9999989846805964) // Insterted value 12.675, ideal Value 13.0
  testCleanValueObject(cleanCurrentDt[14], 14.161130788440246, 0.9999378001708076) // Insterted value 14.35, ideal value 14.0
  testCleanValueObject(cleanCurrentDt[15], 14.817366405710104, 0.9999989846805964) // Insterted value 14.625, ideal value 15.0
  testCleanValueObject(cleanCurrentDt[16], 16.185060795682976, 0.9999378001708076) /// Insterted value 16.4, ideal value 16.0
  testCleanValueObject(cleanCurrentDt[17], 16.792164691503604, 0.9999989846805964) // Insterted value 16.575, ideal Value 17.0
  testCleanValueObject(cleanCurrentDt[18], 18.208990802925705, 0.9999378001708076) // Insterted value 18.45, ideal value 18.0
  testCleanValueObject(cleanCurrentDt[19], 18.7669629772971, 0.9999989846805964) // Insterted value 18.525, ideal Value 19.0
  testCleanValueObject(cleanCurrentDt[20], 20.232920810168437, 0.9999378001708076) // Insterted value 20.5, ideal value 20.0
  testCleanValueObject(cleanCurrentDt[21], 20.741761263090602, 0.9999989846805964) // Insterted value 20.475, ideal Value 21.0
  testCleanValueObject(cleanCurrentDt[22], 22.256850817411166, 0.9999378001708076) // Insterted value 22.55, ideal value 22.0
  testCleanValueObject(cleanCurrentDt[23], 22.7165595488841, 0.9999989846805964) // Insterted value 22.425, ideal Value 23.0

  baseRegressionFunction.reset()
  CECFilter.clearDatapointBuffer()

  // Here we feed the cleaned data back in, simulating an active filter for the fifth round
  for (let i = 0; i < testDataArray.length; i++) {
    baseRegressionFunction.push(i + 180, cleanCurrentDt[i].clean, cleanCurrentDt[i].goodnessOfFit)
  }

  testRegressorSlopeEquals(baseRegressionFunction, 0.9873991428967495) // Ideal value 1.0
  testRegressorInterceptEquals(baseRegressionFunction, -177.72546645915602) // Ideal value -180
  testRegressorGoodnessOfFitEquals(baseRegressionFunction, 0.9988695699423202) // Ideal value 1
})

test('Correct behaviour of the filter after exposing it to an updated filter with an extremely noisy linear regressor (10%), five rounds, agressiveness 1.0, size two recoveries', () => {
  const baseRowerConfig = {
    numOfImpulsesPerRevolution: 2,
    flankLength: 2,
    autoAdjustDragFactor: true,
    systematicErrorAgressiveness: 1.0,
    systematicErrorNumberOfDatapoints: 44,
    minimumTimeBetweenImpulses: 0,
    maximumTimeBetweenImpulses: 25
  }

  const baseRegressionFunction = createTSLinearSeries()

  // Complete dataset, which will be reused for each cycle. In essence y = x, where
  // - the even datapoints are multipied by 1.1 (so correction factor should become 1/1.1 = 0.9)
  // - the odd datapoints are multipied by 0.9 (so correction factor should become 1/0.9 = 1.1)
  let testDataArray = []
  testDataArray[0] = 0
  testDataArray[1] = 0.9
  testDataArray[2] = 2.2
  testDataArray[3] = 2.7
  testDataArray[4] = 4.4
  testDataArray[5] = 4.5
  testDataArray[6] = 6.6
  testDataArray[7] = 6.3
  testDataArray[8] = 8.8
  testDataArray[9] = 8.1
  testDataArray[10] = 11.0
  testDataArray[11] = 9.9
  testDataArray[12] = 13.2
  testDataArray[13] = 11.7
  testDataArray[14] = 15.4
  testDataArray[15] = 13.5
  testDataArray[16] = 17.6
  testDataArray[17] = 15.3
  testDataArray[18] = 19.8
  testDataArray[19] = 17.1
  testDataArray[20] = 22.0
  testDataArray[21] = 18.9
  testDataArray[22] = 24.2
  testDataArray[23] = 20.7

  let cleanCurrentDt = []
  const CECFilter = createCyclicErrorFilter(baseRowerConfig, baseRegressionFunction)

  // Initialise the starting point
  cleanCurrentDt[0] = CECFilter.applyFilter(0, 0)

  // Inecting the datapoints.
  for (let i = 0; i < testDataArray.length; i++) {
    baseRegressionFunction.push(i, testDataArray[i], 1)
    CECFilter.recordRawDatapoint(i, i, testDataArray[i])
  }

  testRegressorSlopeEquals(baseRegressionFunction, 0.9000000000000004) // Ideal value 1.0
  testRegressorInterceptEquals(baseRegressionFunction, -1.6653345369377348e-16) // Ideal value 0
  testRegressorGoodnessOfFitEquals(baseRegressionFunction, 0.9305410182055288) // Ideal value 1

  // Process the datapoints, filling the entire array
  for (let i = 0; i < Math.ceil(testDataArray.length / 2); i++) {
    CECFilter.processNextRawDatapoint()
  }

  // Filter the total series of raw datapoints
  for (let i = 0; i < testDataArray.length; i++) {
    cleanCurrentDt[i] = CECFilter.applyFilter(testDataArray[i], (30 + i))
  }

  // Check the results
  // For even magnets, the correction factor should be 0.9
  // For odd magnets, the correction factor should be 1.1
  testCleanValueObject(cleanCurrentDt[0], 0.3077186553798185, 0.9664251040857723) // Insterted value 0.0, ideal value 0.0
  testCleanValueObject(cleanCurrentDt[1], 0.6774521098766918, 1) // Insterted value 0.9, ideal value 1.0
  testCleanValueObject(cleanCurrentDt[2], 2.2995234514194602, 0.9664251040857723) // Insterted value 2.2, ideal value 2.0
  testCleanValueObject(cleanCurrentDt[3], 2.6477936403897124, 1) // Insterted value 2.7, ideal Value 3.0
  testCleanValueObject(cleanCurrentDt[4], 4.291328247459102, 0.9664251040857723) // Insterted value 4.4, ideal value 4.0
  testCleanValueObject(cleanCurrentDt[5], 4.6181351709027325, 1) // Insterted value 4.5, ideal value 5.0
  testCleanValueObject(cleanCurrentDt[6], 6.283133043498744, 0.9664251040857723) // Insterted value 6.6, ideal value 6.0
  testCleanValueObject(cleanCurrentDt[7], 6.588476701415753, 1) // Insterted value 6.3, ideal Value 7.0
  testCleanValueObject(cleanCurrentDt[8], 8.274937839538387, 0.9664251040857723) // Insterted value 8.8, ideal value 8.0
  testCleanValueObject(cleanCurrentDt[9], 8.558818231928772, 1) // Insterted value 8.1, ideal value 9.0
  testCleanValueObject(cleanCurrentDt[10], 10.266742635578028, 0.9664251040857723) // Insterted value 11.0, ideal value 10.0
  testCleanValueObject(cleanCurrentDt[11], 10.529159762441793, 1) // Insterted value 9.9, ideal Value 11.0
  testCleanValueObject(cleanCurrentDt[12], 12.25854743161767, 0.9664251040857723) // Insterted value 13.2, ideal value 12.0
  testCleanValueObject(cleanCurrentDt[13], 12.499501292954815, 1) // Insterted value 11.7, ideal Value 13.0
  testCleanValueObject(cleanCurrentDt[14], 14.250352227657311, 0.9664251040857723) // Insterted value 15.4, ideal value 14.0
  testCleanValueObject(cleanCurrentDt[15], 14.469842823467832, 1) // Insterted value 13.5, ideal value 15.0
  testCleanValueObject(cleanCurrentDt[16], 16.242157023696954, 0.9664251040857723) /// Insterted value 17.6, ideal value 16.0
  testCleanValueObject(cleanCurrentDt[17], 16.440184353980854, 1) // Insterted value 15.3, ideal Value 17.0
  testCleanValueObject(cleanCurrentDt[18], 18.233961819736592, 0.9664251040857723) // Insterted value 19.8, ideal value 18.0
  testCleanValueObject(cleanCurrentDt[19], 18.410525884493875, 1) // Insterted value 17.1, ideal Value 19.0
  testCleanValueObject(cleanCurrentDt[20], 20.225766615776237, 0.9664251040857723) // Insterted value 22.0, ideal value 20.0
  testCleanValueObject(cleanCurrentDt[21], 20.380867415006893, 1) // Insterted value 18.9, ideal Value 21.0
  testCleanValueObject(cleanCurrentDt[22], 22.217571411815875, 0.9664251040857723) // Insterted value 24.2, ideal value 22.0
  testCleanValueObject(cleanCurrentDt[23], 22.351208945519915, 1) // Insterted value 20.7, ideal Value 23.0

  baseRegressionFunction.reset()
  CECFilter.clearDatapointBuffer()

  // Here we feed the cleaned data back in, simulating an active filter for the second round
  for (let i = 0; i < cleanCurrentDt.length; i++) {
    baseRegressionFunction.push(i + 30, cleanCurrentDt[i].clean, cleanCurrentDt[i].goodnessOfFit)
    CECFilter.recordRawDatapoint(i + 30, i + 30, cleanCurrentDt[i].clean)
  }

  testRegressorSlopeEquals(baseRegressionFunction, 0.9851707652565104) // Ideal value 1.0
  testRegressorInterceptEquals(baseRegressionFunction, -29.86284161307513) // Ideal value -30
  testRegressorGoodnessOfFitEquals(baseRegressionFunction, 0.9942898519652195) // Ideal value 1

  // Process the datapoints, filling the entire array
  for (let i = 0; i < Math.ceil(testDataArray.length / 2); i++) {
    CECFilter.processNextRawDatapoint()
  }

  // Filter the total series of raw datapoints
  cleanCurrentDt = []
  for (let i = 0; i < testDataArray.length; i++) {
    cleanCurrentDt[i] = CECFilter.applyFilter(testDataArray[i], (60 + i))
  }

  // Check the results
  // For even magnets, the correction factor should be 0.9
  // For odd magnets, the correction factor should be 1.1
  testCleanValueObject(cleanCurrentDt[0], 0.011558401819693557, 0.9787788846517882) // Insterted value 0.0, ideal value 0.0
  testCleanValueObject(cleanCurrentDt[1], 0.9419626485844151, 0.999999999999998) // Insterted value 0.9, ideal value 1.0
  testCleanValueObject(cleanCurrentDt[2], 2.0807291674985406, 0.9787788846517882) // Insterted value 2.2, ideal value 2.0
  testCleanValueObject(cleanCurrentDt[3], 2.8490047493926327, 0.999999999999998) // Insterted value 2.7, ideal Value 3.0
  testCleanValueObject(cleanCurrentDt[4], 4.149899933177388, 0.9787788846517882) // Insterted value 4.4, ideal value 4.0
  testCleanValueObject(cleanCurrentDt[5], 4.756046850200849, 0.999999999999998) // Insterted value 4.5, ideal value 5.0
  testCleanValueObject(cleanCurrentDt[6], 6.219070698856234, 0.9787788846517882) // Insterted value 6.6, ideal value 6.0
  testCleanValueObject(cleanCurrentDt[7], 6.663088951009066, 0.999999999999998) // Insterted value 6.3, ideal Value 7.0
  testCleanValueObject(cleanCurrentDt[8], 8.288241464535082, 0.9787788846517882) // Insterted value 8.8, ideal value 8.0
  testCleanValueObject(cleanCurrentDt[9], 8.570131051817283, 0.999999999999998) // Insterted value 8.1, ideal value 9.0
  testCleanValueObject(cleanCurrentDt[10], 10.357412230213926, 0.9787788846517882) // Insterted value 11.0, ideal value 10.0
  testCleanValueObject(cleanCurrentDt[11], 10.477173152625502, 0.999999999999998) // Insterted value 9.9, ideal Value 11.0
  testCleanValueObject(cleanCurrentDt[12], 12.426582995892772, 0.9787788846517882) // Insterted value 13.2, ideal value 12.0
  testCleanValueObject(cleanCurrentDt[13], 12.384215253433718, 0.999999999999998) // Insterted value 11.7, ideal Value 13.0
  testCleanValueObject(cleanCurrentDt[14], 14.49575376157162, 0.9787788846517882) // Insterted value 15.4, ideal value 14.0
  testCleanValueObject(cleanCurrentDt[15], 14.291257354241937, 0.999999999999998) // Insterted value 13.5, ideal value 15.0
  testCleanValueObject(cleanCurrentDt[16], 16.564924527250472, 0.9787788846517882) /// Insterted value 17.6, ideal value 16.0
  testCleanValueObject(cleanCurrentDt[17], 16.198299455050154, 0.999999999999998) // Insterted value 15.3, ideal Value 17.0
  testCleanValueObject(cleanCurrentDt[18], 18.634095292929317, 0.9787788846517882) // Insterted value 19.8, ideal value 18.0
  testCleanValueObject(cleanCurrentDt[19], 18.10534155585837, 0.999999999999998) // Insterted value 17.1, ideal Value 19.0
  testCleanValueObject(cleanCurrentDt[20], 20.70326605860816, 0.9787788846517882) // Insterted value 22.0, ideal value 20.0
  testCleanValueObject(cleanCurrentDt[21], 20.012383656666586, 0.999999999999998) // Insterted value 18.9, ideal Value 21.0
  testCleanValueObject(cleanCurrentDt[22], 22.77243682428701, 0.9787788846517882) // Insterted value 24.2, ideal value 22.0
  testCleanValueObject(cleanCurrentDt[23], 21.919425757474805, 0.999999999999998) // Insterted value 20.7, ideal Value 23.0

  baseRegressionFunction.reset()
  CECFilter.clearDatapointBuffer()

  // Here we feed the cleaned data back in, simulating an active filter for the third round
  for (let i = 0; i < testDataArray.length; i++) {
    baseRegressionFunction.push(i + 60, cleanCurrentDt[i].clean, cleanCurrentDt[i].goodnessOfFit)
    CECFilter.recordRawDatapoint(i + 60, i + 60, cleanCurrentDt[i].clean)
  }

  testRegressorSlopeEquals(baseRegressionFunction, 0.953521050404109) // Ideal value 1.0
  testRegressorInterceptEquals(baseRegressionFunction, -57.222821426066226) // Ideal value -60
  testRegressorGoodnessOfFitEquals(baseRegressionFunction, 0.9879313385536389) // Ideal value 1

  // Process the datapoints, filling the entire array
  for (let i = 0; i < Math.ceil(testDataArray.length / 2); i++) {
    CECFilter.processNextRawDatapoint()
  }

  // Filter the total series of raw datapoints
  cleanCurrentDt = []
  for (let i = 0; i < testDataArray.length; i++) {
    cleanCurrentDt[i] = CECFilter.applyFilter(testDataArray[i], (90 + i))
  }

  // For even magnets, the correction factor should be 0.9
  // For odd magnets, the correction factor should be 1.1
  testCleanValueObject(cleanCurrentDt[0], -0.14308049211288923, 0.000980907789229585) // Insterted value 0.0, ideal value 0.0
  testCleanValueObject(cleanCurrentDt[1], 1.077866513953529, 1.0000000000000016) // Insterted value 0.9, ideal value 1.0
  testCleanValueObject(cleanCurrentDt[2], 1.9718870100544368, 0.9809077892295849) // Insterted value 2.2, ideal value 2.0
  testCleanValueObject(cleanCurrentDt[3], 2.9474385576348094, 1.0000000000000016) // Insterted value 2.7, ideal Value 3.0
  testCleanValueObject(cleanCurrentDt[4], 4.0868545122217625, 0.9809077892295849) // Insterted value 4.4, ideal value 4.0
  testCleanValueObject(cleanCurrentDt[5], 4.817010601316088, 1.0000000000000016) // Insterted value 4.5, ideal value 5.0
  testCleanValueObject(cleanCurrentDt[6], 6.201822014389088, 0.9809077892295849) // Insterted value 6.6, ideal value 6.0
  testCleanValueObject(cleanCurrentDt[7], 6.686582644997368, 1.0000000000000016) // Insterted value 6.3, ideal Value 7.0
  testCleanValueObject(cleanCurrentDt[8], 8.316789516556415, 0.9809077892295849) // Insterted value 8.8, ideal value 8.0
  testCleanValueObject(cleanCurrentDt[9], 8.556154688678646, 1.0000000000000016) // Insterted value 8.1, ideal value 9.0
  testCleanValueObject(cleanCurrentDt[10], 10.43175701872374, 0.9809077892295849) // Insterted value 11.0, ideal value 10.0
  testCleanValueObject(cleanCurrentDt[11], 10.425726732359927, 1.0000000000000016) // Insterted value 9.9, ideal Value 11.0
  testCleanValueObject(cleanCurrentDt[12], 12.546724520891066, 0.9809077892295849) // Insterted value 13.2, ideal value 12.0
  testCleanValueObject(cleanCurrentDt[13], 12.295298776041207, 1.0000000000000016) // Insterted value 11.7, ideal Value 13.0
  testCleanValueObject(cleanCurrentDt[14], 14.661692023058393, 0.9809077892295849) // Insterted value 15.4, ideal value 14.0
  testCleanValueObject(cleanCurrentDt[15], 14.164870819722486, 1.0000000000000016) // Insterted value 13.5, ideal value 15.0
  testCleanValueObject(cleanCurrentDt[16], 16.776659525225718, 0.9809077892295849) // Insterted value 17.6, ideal value 16.0
  testCleanValueObject(cleanCurrentDt[17], 16.03444286340377, 1.0000000000000016) // Insterted value 15.3, ideal Value 17.0
  testCleanValueObject(cleanCurrentDt[18], 18.891627027393042, 0.9809077892295849) // Insterted value 19.8, ideal value 18.0
  testCleanValueObject(cleanCurrentDt[19], 17.90401490708505, 1.0000000000000016) // Insterted value 17.1, ideal Value 19.0
  testCleanValueObject(cleanCurrentDt[20], 21.006594529560367, 0.9809077892295849) // Insterted value 22.0, ideal value 20.0
  testCleanValueObject(cleanCurrentDt[21], 19.773586950766326, 1.0000000000000016) // Insterted value 18.9, ideal Value 21.0
  testCleanValueObject(cleanCurrentDt[22], 23.12156203172769, 0.9809077892295849) // Insterted value 24.2, ideal value 22.0
  testCleanValueObject(cleanCurrentDt[23], 21.643158994447607, 1.0000000000000016) // Insterted value 20.7, ideal Value 23.0

  baseRegressionFunction.reset()
  CECFilter.clearDatapointBuffer()

  // Here we feed the cleaned data back in, simulating an active filter for the fourth round
  for (let i = 0; i < testDataArray.length; i++) {
    baseRegressionFunction.push(i + 90, cleanCurrentDt[i].clean, cleanCurrentDt[i].goodnessOfFit)
    CECFilter.recordRawDatapoint(i + 90, i + 90, cleanCurrentDt[i].clean)
  }

  testRegressorSlopeEquals(baseRegressionFunction, 0.9375037235566221) // Ideal value 1.0
  testRegressorInterceptEquals(baseRegressionFunction, -84.24040773313105) // Ideal value -90
  testRegressorGoodnessOfFitEquals(baseRegressionFunction, 0.9790156172582558) // Ideal value 1

  // Process the datapoints, filling the entire array
  for (let i = 0; i < Math.ceil(testDataArray.length / 2); i++) {
    CECFilter.processNextRawDatapoint()
  }

  // Filter the total series of raw datapoints
  cleanCurrentDt = []
  for (let i = 0; i < testDataArray.length; i++) {
    cleanCurrentDt[i] = CECFilter.applyFilter(testDataArray[i], (120 + i))
  }

  // For even magnets, the correction factor should be 0.9
  // For odd magnets, the correction factor should be 1.1
  testCleanValueObject(cleanCurrentDt[0], 0.03206505953318455, 0.9972877714154669) // Insterted value 0.0, ideal value 0.0
  testCleanValueObject(cleanCurrentDt[1], 0.9079830315244277, 0.9999916969142686) // Insterted value 0.9, ideal value 1.0
  testCleanValueObject(cleanCurrentDt[2], 2.1341697258368013, 0.9972877714154669) // Insterted value 2.2, ideal value 2.0
  testCleanValueObject(cleanCurrentDt[3], 2.7880792136396524, 0.9999916969142686) // Insterted value 2.7, ideal Value 3.0
  testCleanValueObject(cleanCurrentDt[4], 4.236274392140419, 0.9972877714154669) // Insterted value 4.4, ideal value 4.0
  testCleanValueObject(cleanCurrentDt[5], 4.668175395754876, 0.9999916969142686) // Insterted value 4.5, ideal value 5.0
  testCleanValueObject(cleanCurrentDt[6], 6.338379058444035, 0.9972877714154669) // Insterted value 6.6, ideal value 6.0
  testCleanValueObject(cleanCurrentDt[7], 6.5482715778701, 0.9999916969142686) // Insterted value 6.3, ideal Value 7.0
  testCleanValueObject(cleanCurrentDt[8], 8.440483724747653, 0.9972877714154669) // Insterted value 8.8, ideal value 8.0
  testCleanValueObject(cleanCurrentDt[9], 8.428367759985326, 0.9999916969142686) // Insterted value 8.1, ideal value 9.0
  testCleanValueObject(cleanCurrentDt[10], 10.542588391051268, 0.9972877714154669) // Insterted value 11.0, ideal value 10.0
  testCleanValueObject(cleanCurrentDt[11], 10.30846394210055, 0.9999916969142686) // Insterted value 9.9, ideal Value 11.0
  testCleanValueObject(cleanCurrentDt[12], 12.644693057354885, 0.9972877714154669) // Insterted value 13.2, ideal value 12.0
  testCleanValueObject(cleanCurrentDt[13], 12.188560124215774, 0.9999916969142686) // Insterted value 11.7, ideal Value 13.0
  testCleanValueObject(cleanCurrentDt[14], 14.746797723658501, 0.9972877714154669) // Insterted value 15.4, ideal value 14.0
  testCleanValueObject(cleanCurrentDt[15], 14.068656306330999, 0.9999916969142686) // Insterted value 13.5, ideal value 15.0
  testCleanValueObject(cleanCurrentDt[16], 16.84890238996212, 0.9972877714154669) // Insterted value 17.6, ideal value 16.0
  testCleanValueObject(cleanCurrentDt[17], 15.948752488446225, 0.9999916969142686) // Insterted value 15.3, ideal Value 17.0
  testCleanValueObject(cleanCurrentDt[18], 18.951007056265738, 0.9972877714154669) // Insterted value 19.8, ideal value 18.0
  testCleanValueObject(cleanCurrentDt[19], 17.82884867056145, 0.9999916969142686) // Insterted value 17.1, ideal Value 19.0
  testCleanValueObject(cleanCurrentDt[20], 21.05311172256935, 0.9972877714154669) // Insterted value 22.0, ideal value 20.0
  testCleanValueObject(cleanCurrentDt[21], 19.70894485267667, 0.9999916969142686) // Insterted value 18.9, ideal Value 21.0
  testCleanValueObject(cleanCurrentDt[22], 23.15521638887297, 0.9972877714154669) // Insterted value 24.2, ideal value 22.0
  testCleanValueObject(cleanCurrentDt[23], 21.589041034791894, 0.9999916969142686) // Insterted value 20.7, ideal Value 23.0

  baseRegressionFunction.reset()
  CECFilter.clearDatapointBuffer()

  // Here we feed the cleaned data back in, simulating an active filter for the fifth round
  for (let i = 0; i < testDataArray.length; i++) {
    baseRegressionFunction.push(i + 120, cleanCurrentDt[i].clean, cleanCurrentDt[i].goodnessOfFit)
    CECFilter.recordRawDatapoint(i + 120, i + 120, cleanCurrentDt[i].clean)
  }

  testRegressorSlopeEquals(baseRegressionFunction, 0.9400480910576124) // Ideal value 1.0
  testRegressorInterceptEquals(baseRegressionFunction, -112.83783598644666) // Ideal value -120
  testRegressorGoodnessOfFitEquals(baseRegressionFunction, 0.9764199727099291) // Ideal value 1

  // Process the datapoints, filling the entire array
  for (let i = 0; i < Math.ceil(testDataArray.length / 2); i++) {
    CECFilter.processNextRawDatapoint()
  }

  // Filter the total series of raw datapoints
  cleanCurrentDt = []
  for (let i = 0; i < testDataArray.length; i++) {
    cleanCurrentDt[i] = CECFilter.applyFilter(testDataArray[i], (150 + i))
  }

  // For even magnets, the correction factor should be 0.9
  // For odd magnets, the correction factor should be 1.1
  testCleanValueObject(cleanCurrentDt[0], 0.05349387468532712, 0.9987707492830576) // Insterted value 0.0, ideal value 0.0
  testCleanValueObject(cleanCurrentDt[1], 0.89627054250747, 0.9999916675735381) // Insterted value 0.9, ideal value 1.0
  testCleanValueObject(cleanCurrentDt[2], 2.1318475215473804, 0.9987707492830576) // Insterted value 2.2, ideal value 2.0
  testCleanValueObject(cleanCurrentDt[3], 2.795799376893064, 0.9999916675735381) // Insterted value 2.7, ideal Value 3.0
  testCleanValueObject(cleanCurrentDt[4], 4.210201168409434, 0.9987707492830576) // Insterted value 4.4, ideal value 4.0
  testCleanValueObject(cleanCurrentDt[5], 4.6953282112786585, 0.9999916675735381) // Insterted value 4.5, ideal value 5.0
  testCleanValueObject(cleanCurrentDt[6], 6.288554815271485, 0.9987707492830576) // Insterted value 6.6, ideal value 6.0
  testCleanValueObject(cleanCurrentDt[7], 6.594857045664252, 0.9999916675735381) // Insterted value 6.3, ideal Value 7.0
  testCleanValueObject(cleanCurrentDt[8], 8.366908462133539, 0.9987707492830576) // Insterted value 8.8, ideal value 8.0
  testCleanValueObject(cleanCurrentDt[9], 8.494385880049848, 0.9999916675735381) // Insterted value 8.1, ideal value 9.0
  testCleanValueObject(cleanCurrentDt[10], 10.445262108995593, 0.9987707492830576) // Insterted value 11.0, ideal value 10.0
  testCleanValueObject(cleanCurrentDt[11], 10.393914714435441, 0.9999916675735381) // Insterted value 9.9, ideal Value 11.0
  testCleanValueObject(cleanCurrentDt[12], 12.523615755857643, 0.9987707492830576) // Insterted value 13.2, ideal value 12.0
  testCleanValueObject(cleanCurrentDt[13], 12.293443548821035, 0.9999916675735381) // Insterted value 11.7, ideal Value 13.0
  testCleanValueObject(cleanCurrentDt[14], 14.601969402719698, 0.9987707492830576) // Insterted value 15.4, ideal value 14.0
  testCleanValueObject(cleanCurrentDt[15], 14.192972383206628, 0.9999916675735381) // Insterted value 13.5, ideal value 15.0
  testCleanValueObject(cleanCurrentDt[16], 16.68032304958175, 0.9987707492830576) // Insterted value 17.6, ideal value 16.0
  testCleanValueObject(cleanCurrentDt[17], 16.092501217592222, 0.9999916675735381) // Insterted value 15.3, ideal Value 17.0
  testCleanValueObject(cleanCurrentDt[18], 18.758676696443803, 0.9987707492830576) // Insterted value 19.8, ideal value 18.0
  testCleanValueObject(cleanCurrentDt[19], 17.992030051977817, 0.9999916675735381) // Insterted value 17.1, ideal Value 19.0
  testCleanValueObject(cleanCurrentDt[20], 20.83703034330586, 0.9987707492830576) // Insterted value 22.0, ideal value 20.0
  testCleanValueObject(cleanCurrentDt[21], 19.89155888636341, 0.9999916675735381) // Insterted value 18.9, ideal Value 21.0
  testCleanValueObject(cleanCurrentDt[22], 22.91538399016791, 0.9987707492830576) // Insterted value 24.2, ideal value 22.0
  testCleanValueObject(cleanCurrentDt[23], 21.791087720749005, 0.9999916675735381) // Insterted value 20.7, ideal Value 23.0

  baseRegressionFunction.reset()
  CECFilter.clearDatapointBuffer()

  // Here we feed the cleaned data back in, simulating an active filter for the fifth round
  for (let i = 0; i < testDataArray.length; i++) {
    baseRegressionFunction.push(i + 150, cleanCurrentDt[i].clean, cleanCurrentDt[i].goodnessOfFit)
    CECFilter.recordRawDatapoint(i + 150, i + 150, cleanCurrentDt[i].clean)
  }

  testRegressorSlopeEquals(baseRegressionFunction, 0.9497644171927973) // Ideal value 1.0
  testRegressorInterceptEquals(baseRegressionFunction, -142.5181564536049) // Ideal value -150
  testRegressorGoodnessOfFitEquals(baseRegressionFunction, 0.9833890292686881) // Ideal value 1
})

/* eslint-disable complexity -- This simulates a complex function, not much we can do about it */
test('Correct behaviour of the filter after exposing it to an updated filter with noisy linear regressor (2.5%), five rounds, agressiveness 1.0, size two recoveries on a RowErg', () => {
  const baseRowerConfig = {
    numOfImpulsesPerRevolution: 6,
    flankLength: 2,
    autoAdjustDragFactor: true,
    systematicErrorAgressiveness: 1.0,
    systematicErrorNumberOfDatapoints: 440,
    minimumTimeBetweenImpulses: 0,
    maximumTimeBetweenImpulses: 230
  }

  const baseRegressionFunction = createTSLinearSeries()

  // Complete dataset, which will be reused for each cycle. In essence y = x, where
  // - the even datapoints are multipied by 1.1 (so correction factor should become 1/1.1 = 0.9)
  // - the odd datapoints are multipied by 0.9 (so correction factor should become 1/0.9 = 1.1)
  let testDataArray = []
  for (let i = 0; i < 220; i++) {
    switch (i % 6) {
      case 0:
        testDataArray[i] = 1.0125 * i
        break
      case 1:
        testDataArray[i] = 1.025 * i
        break
      case 2:
        testDataArray[i] = 1.0125 * i
        break
      case 3:
        testDataArray[i] = 0.9877 * i
        break
      case 4:
        testDataArray[i] = 0.9756 * i
        break
      case 5:
        testDataArray[i] = 0.9877 * i
        break
      // No default
    }
  }

  let cleanCurrentDt = []
  const CECFilter = createCyclicErrorFilter(baseRowerConfig, baseRegressionFunction)

  // Initialise the starting point
  cleanCurrentDt[0] = CECFilter.applyFilter(0, 0)

  // Inecting the datapoints.
  for (let i = 0; i < testDataArray.length; i++) {
    baseRegressionFunction.push(i, testDataArray[i], 1)
    CECFilter.recordRawDatapoint(i, i, testDataArray[i])
  }

  testRegressorSlopeEquals(baseRegressionFunction, 1.0008698172472872) // Ideal value 1.0
  testRegressorInterceptEquals(baseRegressionFunction, 0.01163018275271277) // Ideal value 0
  testRegressorGoodnessOfFitEquals(baseRegressionFunction, 0.9987940622596934) // Ideal value 1

  // Process the datapoints, filling the entire array
  for (let i = 0; i < Math.ceil(testDataArray.length / 2); i++) {
    CECFilter.processNextRawDatapoint()
  }

  // Filter the total series of raw datapoints
  for (let i = 0; i < testDataArray.length; i++) {
    cleanCurrentDt[i] = CECFilter.applyFilter(testDataArray[i], (250 + i))
  }

  baseRegressionFunction.reset()
  CECFilter.clearDatapointBuffer()

  // Here we feed the cleaned data back in, simulating an active filter for the second round
  for (let i = 0; i < cleanCurrentDt.length; i++) {
    baseRegressionFunction.push(i + 250, cleanCurrentDt[i].clean, cleanCurrentDt[i].goodnessOfFit)
    CECFilter.recordRawDatapoint(i + 250, i + 250, cleanCurrentDt[i].clean)
  }

  testRegressorSlopeEquals(baseRegressionFunction, 0.9994796184812487) // Ideal value 1.0
  testRegressorInterceptEquals(baseRegressionFunction, -249.87103176967827) // Ideal value -250
  testRegressorGoodnessOfFitEquals(baseRegressionFunction, 0.9969663083924543) // Ideal value 1

  // Process the datapoints, filling the entire array
  for (let i = 0; i < Math.ceil(testDataArray.length / 2); i++) {
    CECFilter.processNextRawDatapoint()
  }

  // Filter the total series of raw datapoints
  cleanCurrentDt = []
  for (let i = 0; i < testDataArray.length; i++) {
    cleanCurrentDt[i] = CECFilter.applyFilter(testDataArray[i], (500 + i))
  }

  baseRegressionFunction.reset()
  CECFilter.clearDatapointBuffer()

  // Here we feed the cleaned data back in, simulating an active filter for the third round
  for (let i = 0; i < testDataArray.length; i++) {
    baseRegressionFunction.push(i + 500, cleanCurrentDt[i].clean, cleanCurrentDt[i].goodnessOfFit)
    CECFilter.recordRawDatapoint(i + 500, i + 500, cleanCurrentDt[i].clean)
  }

  testRegressorSlopeEquals(baseRegressionFunction, 0.9997525129403375) // Ideal value 1.0
  testRegressorInterceptEquals(baseRegressionFunction, -499.91268495067095) // Ideal value -500
  testRegressorGoodnessOfFitEquals(baseRegressionFunction, 0.9977841039000378) // Ideal value 1

  // Process the datapoints, filling the entire array
  for (let i = 0; i < Math.ceil(testDataArray.length / 2); i++) {
    CECFilter.processNextRawDatapoint()
  }

  // Filter the total series of raw datapoints
  cleanCurrentDt = []
  for (let i = 0; i < testDataArray.length; i++) {
    cleanCurrentDt[i] = CECFilter.applyFilter(testDataArray[i], (750 + i))
  }

  baseRegressionFunction.reset()
  CECFilter.clearDatapointBuffer()

  // Here we feed the cleaned data back in, simulating an active filter for the fourth round
  for (let i = 0; i < testDataArray.length; i++) {
    baseRegressionFunction.push(i + 750, cleanCurrentDt[i].clean, cleanCurrentDt[i].goodnessOfFit)
    CECFilter.recordRawDatapoint(i + 750, i + 750, cleanCurrentDt[i].clean)
  }

  testRegressorSlopeEquals(baseRegressionFunction, 1.0005226479777438) // Ideal value 1.0
  testRegressorInterceptEquals(baseRegressionFunction, -750.338863719227) // Ideal value -750
  testRegressorGoodnessOfFitEquals(baseRegressionFunction, 0.9970610601990529) // Ideal value 1

  // Process the datapoints, filling the entire array
  for (let i = 0; i < Math.ceil(testDataArray.length / 2); i++) {
    CECFilter.processNextRawDatapoint()
  }

  // Filter the total series of raw datapoints
  cleanCurrentDt = []
  for (let i = 0; i < testDataArray.length; i++) {
    cleanCurrentDt[i] = CECFilter.applyFilter(testDataArray[i], (1000 + i))
  }

  baseRegressionFunction.reset()
  CECFilter.clearDatapointBuffer()

  // Here we feed the cleaned data back in, simulating an active filter for the fifth round
  for (let i = 0; i < testDataArray.length; i++) {
    baseRegressionFunction.push(i + 1000, cleanCurrentDt[i].clean, cleanCurrentDt[i].goodnessOfFit)
    CECFilter.recordRawDatapoint(i + 1000, i + 1000, cleanCurrentDt[i].clean)
  }

  testRegressorSlopeEquals(baseRegressionFunction, 0.9993768090584058) // Ideal value 1.0
  testRegressorInterceptEquals(baseRegressionFunction, -999.3987560436793) // Ideal value -1000
  testRegressorGoodnessOfFitEquals(baseRegressionFunction, 0.9974086881750074) // Ideal value 1

  // Process the datapoints, filling the entire array
  for (let i = 0; i < Math.ceil(testDataArray.length / 2); i++) {
    CECFilter.processNextRawDatapoint()
  }

  // Filter the total series of raw datapoints
  cleanCurrentDt = []
  for (let i = 0; i < testDataArray.length; i++) {
    cleanCurrentDt[i] = CECFilter.applyFilter(testDataArray[i], (1250 + i))
  }

  baseRegressionFunction.reset()
  CECFilter.clearDatapointBuffer()

  // Here we feed the cleaned data back in, simulating an active filter for the fifth round
  for (let i = 0; i < testDataArray.length; i++) {
    baseRegressionFunction.push(i + 1250, cleanCurrentDt[i].clean, cleanCurrentDt[i].goodnessOfFit)
    CECFilter.recordRawDatapoint(i + 1250, i + 1250, cleanCurrentDt[i].clean)
  }

  testRegressorSlopeEquals(baseRegressionFunction, 1.000640000128456) // Ideal value 1.0
  testRegressorInterceptEquals(baseRegressionFunction, -1250.8126695381957) // Ideal value -1250
  testRegressorGoodnessOfFitEquals(baseRegressionFunction, 0.9974581657430908) // Ideal value 1

  // Process the datapoints, filling the entire array
  for (let i = 0; i < Math.ceil(testDataArray.length / 2); i++) {
    CECFilter.processNextRawDatapoint()
  }

  // Filter the total series of raw datapoints
  cleanCurrentDt = []
  for (let i = 0; i < testDataArray.length; i++) {
    cleanCurrentDt[i] = CECFilter.applyFilter(testDataArray[i], (1500 + i))
  }

  baseRegressionFunction.reset()
  CECFilter.clearDatapointBuffer()

  // Here we feed the cleaned data back in, simulating an active filter for the fifth round
  for (let i = 0; i < testDataArray.length; i++) {
    baseRegressionFunction.push(i + 1500, cleanCurrentDt[i].clean, cleanCurrentDt[i].goodnessOfFit)
  }

  testRegressorSlopeEquals(baseRegressionFunction, 1.0009288898929578) // Ideal value 1.0
  testRegressorInterceptEquals(baseRegressionFunction, -1501.3667593727203) // Ideal value -1500
  testRegressorGoodnessOfFitEquals(baseRegressionFunction, 0.9975644504176134) // Ideal value 1
})
/* eslint-enable complexity */

function testCleanValueObject (object, expectedValue, expectedGoodnessOfFit) {
  assert.ok(object.clean === expectedValue, `Expected cleaned currentDt  value to be ${expectedValue}, encountered ${object.clean}`)
  assert.ok(object.goodnessOfFit === expectedGoodnessOfFit, `Expected goodnessOfFit to be ${expectedGoodnessOfFit}, encountered ${object.goodnessOfFit}`)
}

function testCleanValueEquals (object, expectedValue) {
  assert.ok(object.clean === expectedValue, `Expected cleaned currentDt  value to be ${expectedValue}, encountered ${object.clean}`)
}

function testGoodnessOfFitEquals (object, expectedValue) {
  assert.ok(object.goodnessOfFit === expectedValue, `Expected goodnessOfFit to be ${expectedValue}, encountered ${object.goodnessOfFit}`)
}

function testRawValueAtBeginEquals (object, expectedValue) {
  assert.ok(object.raw === expectedValue, `Expected raw value atSeriesBegin() to be ${expectedValue}, encountered ${object.raw}`)
}

function testCleanValueAtBeginEquals (object, expectedValue) {
  assert.ok(object.clean === expectedValue, `Expected clean value atSeriesBegin() to be ${expectedValue}, encountered ${object.clean}`)
}

function testGoodnessOfFitAtBeginEquals (object, expectedValue) {
  assert.ok(object.goodnessOfFit === expectedValue, `Expected goodnessOfFit atSeriesBegin() to be ${expectedValue}, encountered ${object.goodnessOfFit}`)
}

function testRegressorSlopeEquals (series, expectedValue) {
  assert.ok(series.slope() === expectedValue, `Expected regression slope to be ${expectedValue}, encountered a ${series.slope()}`)
}

function testRegressorInterceptEquals (series, expectedValue) {
  assert.ok(series.intercept() === expectedValue, `Expected regression intercept to be ${expectedValue}, encountered ${series.intercept()}`)
}

function testRegressorGoodnessOfFitEquals (series, expectedValue) {
  assert.ok(series.goodnessOfFit() === expectedValue, `Expected regression goodnessOfFit to be ${expectedValue}, encountered ${series.goodnessOfFit()}`)
}

test.run()
