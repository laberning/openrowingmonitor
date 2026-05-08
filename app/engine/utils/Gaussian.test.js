'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
/**
 * This tests the Gaussian Weight Kernel
 */
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { createGaussianWeightFunction } from './Gaussian.js'

/**
 * Test of the weight function in the basic -1 to +1 domain
 */
test('Test of weight function for basic -1 to +1 domain', () => {
  const gaussianWeight = createGaussianWeightFunction()
  gaussianWeight.setWindowWidth(-1, 1)
  testWeight(gaussianWeight, -1.125, 0)
  testWeight(gaussianWeight, -1, 0.6065306597126334)
  testWeight(gaussianWeight, -0.875, 0.6819407511903481)
  testWeight(gaussianWeight, -0.75, 0.7548396019890073)
  testWeight(gaussianWeight, -0.625, 0.8225775623986646)
  testWeight(gaussianWeight, -0.5, 0.8824969025845955)
  testWeight(gaussianWeight, -0.375, 0.9321024923595276)
  testWeight(gaussianWeight, -0.25, 0.9692332344763441)
  testWeight(gaussianWeight, -0.125, 0.9922179382602435)
  testWeight(gaussianWeight, 0, 1)
  testWeight(gaussianWeight, 0.125, 0.9922179382602435)
  testWeight(gaussianWeight, 0.25, 0.9692332344763441)
  testWeight(gaussianWeight, 0.375, 0.9321024923595276)
  testWeight(gaussianWeight, 0.5, 0.8824969025845955)
  testWeight(gaussianWeight, 0.625, 0.8225775623986646)
  testWeight(gaussianWeight, 0.75, 0.7548396019890073)
  testWeight(gaussianWeight, 0.875, 0.6819407511903481)
  testWeight(gaussianWeight, 1, 0.6065306597126334)
  testWeight(gaussianWeight, 1.125, 0)
})

/**
 * Test of the weight function in the -10 to +10 domain
 */
test('Test of weight function for basic -10 to +10 domain', () => {
  const gaussianWeight = createGaussianWeightFunction()
  gaussianWeight.setWindowWidth(-10, 10)
  testWeight(gaussianWeight, -11.25, 0)
  testWeight(gaussianWeight, -10, 0.6065306597126334)
  testWeight(gaussianWeight, -8.75, 0.6819407511903481)
  testWeight(gaussianWeight, -7.5, 0.7548396019890073)
  testWeight(gaussianWeight, -6.25, 0.8225775623986646)
  testWeight(gaussianWeight, -5, 0.8824969025845955)
  testWeight(gaussianWeight, -3.75, 0.9321024923595276)
  testWeight(gaussianWeight, -2.5, 0.9692332344763441)
  testWeight(gaussianWeight, -1.25, 0.9922179382602435)
  testWeight(gaussianWeight, 0, 1)
  testWeight(gaussianWeight, 1.25, 0.9922179382602435)
  testWeight(gaussianWeight, 2.5, 0.9692332344763441)
  testWeight(gaussianWeight, 3.75, 0.9321024923595276)
  testWeight(gaussianWeight, 5, 0.8824969025845955)
  testWeight(gaussianWeight, 6.25, 0.8225775623986646)
  testWeight(gaussianWeight, 7.5, 0.7548396019890073)
  testWeight(gaussianWeight, 8.75, 0.6819407511903481)
  testWeight(gaussianWeight, 10, 0.6065306597126334)
  testWeight(gaussianWeight, 11.25, 0)
})

/**
 * Test of the weight function in the 100 to 120 domain
 */
test('Test of weight function for basic 100 to +120 domain', () => {
  const gaussianWeight = createGaussianWeightFunction()
  gaussianWeight.setWindowWidth(100, 120)
  testWeight(gaussianWeight, 98.75, 0)
  testWeight(gaussianWeight, 100, 0.6065306597126334)
  testWeight(gaussianWeight, 101.25, 0.6819407511903481)
  testWeight(gaussianWeight, 102.5, 0.7548396019890073)
  testWeight(gaussianWeight, 103.75, 0.8225775623986646)
  testWeight(gaussianWeight, 105, 0.8824969025845955)
  testWeight(gaussianWeight, 106.25, 0.9321024923595276)
  testWeight(gaussianWeight, 107.5, 0.9692332344763441)
  testWeight(gaussianWeight, 108.75, 0.9922179382602435)
  testWeight(gaussianWeight, 110, 1)
  testWeight(gaussianWeight, 111.25, 0.9922179382602435)
  testWeight(gaussianWeight, 112.5, 0.9692332344763441)
  testWeight(gaussianWeight, 113.75, 0.9321024923595276)
  testWeight(gaussianWeight, 115, 0.8824969025845955)
  testWeight(gaussianWeight, 116.25, 0.8225775623986646)
  testWeight(gaussianWeight, 117.5, 0.7548396019890073)
  testWeight(gaussianWeight, 118.75, 0.6819407511903481)
  testWeight(gaussianWeight, 120, 0.6065306597126334)
  testWeight(gaussianWeight, 121.25, 0)
})

function testWeight (weightFunction, xValue, expectedValue) {
  assert.ok(weightFunction.weight(xValue) === expectedValue, `Weight should be should be ${expectedValue} at x = ${xValue}, is ${weightFunction.weight(xValue)}`)
}

test.run()
