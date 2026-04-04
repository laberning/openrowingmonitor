'use strict'
/**
 * @copyright [OpenRowingMonitor]{@link https://github.com/JaapvanEkris/openrowingmonitor}
 *
 * @file This constains all tests for the WLS Linear Series
 */
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { createWLSLinearSeries } from './WLSLinearSeries.js'

test('Correct behaviour of a series after initialisation', () => {
  const dataSeries = createWLSLinearSeries(3)
  testLength(dataSeries, 0)
  testXAtSeriesBegin(dataSeries, 0)
  testYAtSeriesBegin(dataSeries, 0)
  testXAtSeriesEnd(dataSeries, 0)
  testYAtSeriesEnd(dataSeries, 0)
  testNumberOfXValuesAbove(dataSeries, 0, 0)
  testNumberOfYValuesAbove(dataSeries, 0, 0)
  testNumberOfXValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfYValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfXValuesAbove(dataSeries, 10, 0)
  testNumberOfYValuesAbove(dataSeries, 10, 0)
  testNumberOfXValuesEqualOrBelow(dataSeries, 10, 0)
  testNumberOfYValuesEqualOrBelow(dataSeries, 10, 0)
  testXSum(dataSeries, 0)
  testYSum(dataSeries, 0)
  testSlopeEquals(dataSeries, 0)
  testInterceptEquals(dataSeries, 0)
  testGoodnessOfFitEquals(dataSeries, 0)
})

test('Correct behaviour of a series after several puhed values, function y = 3x - 6, noisefree, 1 datapoint', () => {
  const dataSeries = createWLSLinearSeries(3)
  testLength(dataSeries, 0)
  dataSeries.push(5, 9, 1)
  testLength(dataSeries, 1)
  testXAtSeriesBegin(dataSeries, 5)
  testYAtSeriesBegin(dataSeries, 9)
  testXAtSeriesEnd(dataSeries, 5)
  testYAtSeriesEnd(dataSeries, 9)
  testNumberOfXValuesAbove(dataSeries, 0, 1)
  testNumberOfYValuesAbove(dataSeries, 0, 1)
  testNumberOfXValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfYValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfXValuesAbove(dataSeries, 10, 0)
  testNumberOfYValuesAbove(dataSeries, 10, 0)
  testNumberOfXValuesEqualOrBelow(dataSeries, 10, 1)
  testNumberOfYValuesEqualOrBelow(dataSeries, 10, 1)
  testXSum(dataSeries, 5)
  testYSum(dataSeries, 9)
  testSlopeEquals(dataSeries, 0)
  testInterceptEquals(dataSeries, 0)
  testGoodnessOfFitEquals(dataSeries, 0)
})

test('Correct behaviour of a series after several puhed values, function y = 3x - 6, noisefree, 2 datapoints', () => {
  const dataSeries = createWLSLinearSeries(3)
  dataSeries.push(5, 9, 1)
  dataSeries.push(3, 3, 1)
  testLength(dataSeries, 2)
  testXAtSeriesBegin(dataSeries, 5)
  testYAtSeriesBegin(dataSeries, 9)
  testXAtSeriesEnd(dataSeries, 3)
  testYAtSeriesEnd(dataSeries, 3)
  testNumberOfXValuesAbove(dataSeries, 0, 2)
  testNumberOfYValuesAbove(dataSeries, 0, 2)
  testNumberOfXValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfYValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfXValuesAbove(dataSeries, 10, 0)
  testNumberOfYValuesAbove(dataSeries, 10, 0)
  testNumberOfXValuesEqualOrBelow(dataSeries, 10, 2)
  testNumberOfYValuesEqualOrBelow(dataSeries, 10, 2)
  testXSum(dataSeries, 8)
  testYSum(dataSeries, 12)
  testSlopeEquals(dataSeries, 3)
  testInterceptEquals(dataSeries, -6)
  testGoodnessOfFitEquals(dataSeries, 1)
})

test('Correct behaviour of a series after several puhed values, function y = 3x - 6, noisefree, 3 datapoints', () => {
  const dataSeries = createWLSLinearSeries(3)
  dataSeries.push(5, 9, 1)
  dataSeries.push(3, 3, 1)
  dataSeries.push(4, 6, 1)
  testLength(dataSeries, 3)
  testXAtSeriesBegin(dataSeries, 5)
  testYAtSeriesBegin(dataSeries, 9)
  testXAtSeriesEnd(dataSeries, 4)
  testYAtSeriesEnd(dataSeries, 6)
  testNumberOfXValuesAbove(dataSeries, 0, 3)
  testNumberOfYValuesAbove(dataSeries, 0, 3)
  testNumberOfXValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfYValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfXValuesAbove(dataSeries, 10, 0)
  testNumberOfYValuesAbove(dataSeries, 10, 0)
  testNumberOfXValuesEqualOrBelow(dataSeries, 10, 3)
  testNumberOfYValuesEqualOrBelow(dataSeries, 10, 3)
  testXSum(dataSeries, 12)
  testYSum(dataSeries, 18)
  testSlopeEquals(dataSeries, 3)
  testInterceptEquals(dataSeries, -6)
  testGoodnessOfFitEquals(dataSeries, 1)
})

test('Correct behaviour of a series after several puhed values, function y = 3x - 6, noisefree, 4 datapoints', () => {
  const dataSeries = createWLSLinearSeries(3)
  dataSeries.push(5, 9, 1)
  dataSeries.push(3, 3, 1)
  dataSeries.push(4, 6, 1)
  dataSeries.push(6, 12, 1)
  testLength(dataSeries, 3)
  testXAtSeriesBegin(dataSeries, 3)
  testYAtSeriesBegin(dataSeries, 3)
  testXAtSeriesEnd(dataSeries, 6)
  testYAtSeriesEnd(dataSeries, 12)
  testNumberOfXValuesAbove(dataSeries, 0, 3)
  testNumberOfYValuesAbove(dataSeries, 0, 3)
  testNumberOfXValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfYValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfXValuesAbove(dataSeries, 10, 0)
  testNumberOfYValuesAbove(dataSeries, 10, 1)
  testNumberOfXValuesEqualOrBelow(dataSeries, 10, 3)
  testNumberOfYValuesEqualOrBelow(dataSeries, 10, 2)
  testXSum(dataSeries, 13)
  testYSum(dataSeries, 21)
  testSlopeEquals(dataSeries, 3)
  testInterceptEquals(dataSeries, -6)
  testGoodnessOfFitEquals(dataSeries, 1)
})

test('Correct behaviour of an unweighted series after several puhed values, function y = 3x - 6, noisefree, 5 datapoints', () => {
  const dataSeries = createWLSLinearSeries(3)
  dataSeries.push(5, 9, 1)
  dataSeries.push(3, 3, 1)
  dataSeries.push(4, 6, 1)
  dataSeries.push(6, 12, 1)
  dataSeries.push(1, -3, 1)
  testLength(dataSeries, 3)
  testXAtSeriesBegin(dataSeries, 4)
  testYAtSeriesBegin(dataSeries, 6)
  testXAtSeriesEnd(dataSeries, 1)
  testYAtSeriesEnd(dataSeries, -3)
  testNumberOfXValuesAbove(dataSeries, 0, 3)
  testNumberOfYValuesAbove(dataSeries, 0, 2)
  testNumberOfXValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfYValuesEqualOrBelow(dataSeries, 0, 1)
  testNumberOfXValuesAbove(dataSeries, 10, 0)
  testNumberOfYValuesAbove(dataSeries, 10, 1)
  testNumberOfXValuesEqualOrBelow(dataSeries, 10, 3)
  testNumberOfYValuesEqualOrBelow(dataSeries, 10, 2)
  testXSum(dataSeries, 11)
  testYSum(dataSeries, 15)
  testSlopeEquals(dataSeries, 3)
  testInterceptEquals(dataSeries, -6)
  testGoodnessOfFitEquals(dataSeries, 1)
})

test('Correct behaviour of a uniformly weighted series after several puhed values, function y = 3x - 6, noisefree, 5 datapoints', () => {
  const dataSeries = createWLSLinearSeries(3)
  dataSeries.push(5, 9, 0.5)
  dataSeries.push(3, 3, 0.5)
  dataSeries.push(4, 6, 0.5)
  dataSeries.push(6, 12, 0.5)
  dataSeries.push(1, -3, 0.5)
  testLength(dataSeries, 3)
  testXAtSeriesBegin(dataSeries, 4)
  testYAtSeriesBegin(dataSeries, 6)
  testXAtSeriesEnd(dataSeries, 1)
  testYAtSeriesEnd(dataSeries, -3)
  testNumberOfXValuesAbove(dataSeries, 0, 3)
  testNumberOfYValuesAbove(dataSeries, 0, 2)
  testNumberOfXValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfYValuesEqualOrBelow(dataSeries, 0, 1)
  testNumberOfXValuesAbove(dataSeries, 10, 0)
  testNumberOfYValuesAbove(dataSeries, 10, 1)
  testNumberOfXValuesEqualOrBelow(dataSeries, 10, 3)
  testNumberOfYValuesEqualOrBelow(dataSeries, 10, 2)
  testXSum(dataSeries, 11)
  testYSum(dataSeries, 15)
  testSlopeEquals(dataSeries, 3)
  testInterceptEquals(dataSeries, -6)
  testGoodnessOfFitEquals(dataSeries, 1)
})

test('Series with 5 elements, with 2 noisy datapoints, ideal function y = 3x - 6, uniform weights', () => {
  const dataSeries = createWLSLinearSeries(5)
  dataSeries.push(5, 9, 1)
  dataSeries.push(3, 2, 1)
  dataSeries.push(4, 7, 1)
  dataSeries.push(6, 12, 1)
  dataSeries.push(1, -3, 1)
  testSlopeEquals(dataSeries, 3.0675675675675675) // Theoretical noisefree value 3
  testInterceptEquals(dataSeries, -6.256756756756756) // Theoretical noisefree value -6
  testGoodnessOfFitEquals(dataSeries, 0.9863142179006205) // Ideal value 1
  testXProjectionEquals(dataSeries, 1, -3.1891891891891886) // Theoretical noisefree value -3
  testXProjectionEquals(dataSeries, 3, 2.9459459459459456) // Theoretical noisefree value 3
  testXProjectionEquals(dataSeries, 4, 6.013513513513514) // Theoretical noisefree value 6
  testXProjectionEquals(dataSeries, 5, 9.081081081081082) // Theoretical noisefree value 9
  testXProjectionEquals(dataSeries, 6, 12.148648648648647) // Theoretical noisefree value 12
})

test('Series with 5 elements, with 2 noisy datapoints, ideal function y = 3x - 6, non-uniform weights', () => {
  const dataSeries = createWLSLinearSeries(5)
  dataSeries.push(5, 9, 1)
  dataSeries.push(3, 2, 0.5)
  dataSeries.push(4, 7, 0.5)
  dataSeries.push(6, 12, 1)
  dataSeries.push(1, -3, 1)
  testSlopeEquals(dataSeries, 3.034632034632035) // Theoretical noisefree value 3
  testInterceptEquals(dataSeries, -6.134199134199134) // Theoretical noisefree value -6
  testGoodnessOfFitEquals(dataSeries, 0.9926631153882663) // Ideal value 1
  testXProjectionEquals(dataSeries, 1, -3.0995670995670994) // Theoretical noisefree value -3
  testXProjectionEquals(dataSeries, 3, 2.9696969696969706) // Theoretical noisefree value 3
  testXProjectionEquals(dataSeries, 4, 6.004329004329005) // Theoretical noisefree value 6
  testXProjectionEquals(dataSeries, 5, 9.03896103896104) // Theoretical noisefree value 9
  testXProjectionEquals(dataSeries, 6, 12.073593073593075) // Theoretical noisefree value 12
})

// Test based on the Galton dataset, using unweighted (=OLS) regression
// Example found at https://online.stat.psu.edu/stat501/lesson/13/13.1
test('Unweighted series with 7 elements based on Galton dataset (OLS)', () => {
  const dataSeries = createWLSLinearSeries(7)
  dataSeries.push(0.21, 0.1726, 1)
  dataSeries.push(0.2, 0.1707, 1)
  dataSeries.push(0.19, 0.1637, 1)
  dataSeries.push(0.18, 0.164, 1)
  dataSeries.push(0.17, 0.1613, 1)
  dataSeries.push(0.16, 0.1617, 1)
  dataSeries.push(0.15, 0.1598, 1)
  testSlopeEquals(dataSeries, 0.2100000000000111)
  testInterceptEquals(dataSeries, 0.12702857142856944)
  testGoodnessOfFitEquals(dataSeries, 0.8553954556248868)
})

// Test based on the Galton dataset, using weighted (=WLS) regression
// Example found at https://online.stat.psu.edu/stat501/lesson/13/13.1
test('Non-uniformly weighted series with 7 elements based on Galton dataset (WLS)', () => {
  const dataSeries = createWLSLinearSeries(7)
  dataSeries.push(0.21, 0.1726, 2530.272176)
  dataSeries.push(0.2, 0.1707, 2662.5174)
  dataSeries.push(0.19, 0.1637, 2781.783546)
  dataSeries.push(0.18, 0.164, 2410.004991)
  dataSeries.push(0.17, 0.1613, 3655.35019)
  dataSeries.push(0.16, 0.1617, 3935.712498)
  dataSeries.push(0.15, 0.1598, 3217.328273)
  testSlopeEquals(dataSeries, 0.20480116324222641)
  testInterceptEquals(dataSeries, 0.12796416521509518)
  testGoodnessOfFitEquals(dataSeries, 0.8521213232768868)
})

test('Correct reset behaviour. Series with 4 datapoints and a reset', () => {
  const dataSeries = createWLSLinearSeries(3)
  dataSeries.push(5, 9, 1)
  dataSeries.push(3, 3, 1)
  dataSeries.push(4, 6, 1)
  dataSeries.push(6, 12, 1)
  dataSeries.reset()
  testLength(dataSeries, 0)
  testXAtSeriesBegin(dataSeries, 0)
  testYAtSeriesBegin(dataSeries, 0)
  testXAtSeriesEnd(dataSeries, 0)
  testYAtSeriesEnd(dataSeries, 0)
  testNumberOfXValuesAbove(dataSeries, 0, 0)
  testNumberOfYValuesAbove(dataSeries, 0, 0)
  testNumberOfXValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfYValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfXValuesAbove(dataSeries, 10, 0)
  testNumberOfYValuesAbove(dataSeries, 10, 0)
  testNumberOfXValuesEqualOrBelow(dataSeries, 10, 0)
  testNumberOfYValuesEqualOrBelow(dataSeries, 10, 0)
  testXSum(dataSeries, 0)
  testYSum(dataSeries, 0)
  testSlopeEquals(dataSeries, 0)
  testInterceptEquals(dataSeries, 0)
  testGoodnessOfFitEquals(dataSeries, 0)
})

function testLength (series, expectedValue) {
  assert.ok(series.length() === expectedValue, `Expected length should be ${expectedValue}, encountered a ${series.length()}`)
}

function testXAtSeriesBegin (series, expectedValue) {
  assert.ok(series.X.atSeriesBegin() === expectedValue, `Expected X.atSeriesBegin to be ${expectedValue}, encountered a ${series.X.atSeriesBegin()}`)
}

function testYAtSeriesBegin (series, expectedValue) {
  assert.ok(series.Y.atSeriesBegin() === expectedValue, `Expected Y.atSeriesBegin to be ${expectedValue}, encountered a ${series.Y.atSeriesBegin()}`)
}

function testXAtSeriesEnd (series, expectedValue) {
  assert.ok(series.X.atSeriesEnd() === expectedValue, `Expected X.atSeriesEnd to be ${expectedValue}, encountered a ${series.X.atSeriesEnd()}`)
}

function testYAtSeriesEnd (series, expectedValue) {
  assert.ok(series.Y.atSeriesEnd() === expectedValue, `Expected Y.atSeriesEnd to be ${expectedValue}, encountered a ${series.Y.atSeriesEnd()}`)
}

function testNumberOfXValuesAbove (series, cutoff, expectedValue) {
  assert.ok(series.X.numberOfValuesAbove(cutoff) === expectedValue, `Expected X.numberOfValuesAbove(${cutoff}) to be ${expectedValue}, encountered a ${series.X.numberOfValuesAbove(cutoff)}`)
}

function testNumberOfYValuesAbove (series, cutoff, expectedValue) {
  assert.ok(series.Y.numberOfValuesAbove(cutoff) === expectedValue, `Expected Y.numberOfValuesAbove(${cutoff}) to be ${expectedValue}, encountered a ${series.Y.numberOfValuesAbove(cutoff)}`)
}

function testNumberOfXValuesEqualOrBelow (series, cutoff, expectedValue) {
  assert.ok(series.X.numberOfValuesEqualOrBelow(cutoff) === expectedValue, `Expected X.numberOfValuesEqualOrBelow(${cutoff}) to be ${expectedValue}, encountered a ${series.X.numberOfValuesEqualOrBelow(cutoff)}`)
}

function testNumberOfYValuesEqualOrBelow (series, cutoff, expectedValue) {
  assert.ok(series.Y.numberOfValuesEqualOrBelow(cutoff) === expectedValue, `Expected Y.numberOfValuesEqualOrBelow(${cutoff}) to be ${expectedValue}, encountered a ${series.Y.numberOfValuesEqualOrBelow(cutoff)}`)
}

function testXSum (series, expectedValue) {
  assert.ok(series.X.sum() === expectedValue, `Expected X.sum to be ${expectedValue}, encountered a ${series.X.sum()}`)
}

function testYSum (series, expectedValue) {
  assert.ok(series.Y.sum() === expectedValue, `Expected y.Sum to be ${expectedValue}, encountered a ${series.Y.sum()}`)
}

function testSlopeEquals (series, expectedValue) {
  assert.ok(series.slope() === expectedValue, `Expected slope to be ${expectedValue}, encountered a ${series.slope()}`)
}

function testInterceptEquals (series, expectedValue) {
  assert.ok(series.intercept() === expectedValue, `Expected intercept to be ${expectedValue}, encountered ${series.intercept()}`)
}

function testGoodnessOfFitEquals (series, expectedValue) {
  assert.ok(series.goodnessOfFit() === expectedValue, `Expected goodnessOfFit to be ${expectedValue}, encountered ${series.goodnessOfFit()}`)
}

function testXProjectionEquals (series, value, expectedValue) {
  assert.ok(series.projectX(value) === expectedValue, `Expected projectX at value ${value} to be ${expectedValue}, encountered ${series.projectX(value)}`)
}

test.run()
