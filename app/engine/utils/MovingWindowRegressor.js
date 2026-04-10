'use strict'
/**
 * @copyright [OpenRowingMonitor]{@link https://github.com/JaapvanEkris/openrowingmonitor}
 *
 * @file This implements a Moving Regression Algorithm to obtain a coefficients, first (angular velocity) and
 * second derivative (angular acceleration) at the front of the flank
 */
import { createTSQuadraticSeries } from './TSQuadraticSeries.js'
import { createWeighedSeries } from './WeighedSeries.js'
import { createGaussianWeightFunction } from './Gaussian.js'

export function createMovingRegressor (bandwith) {
  const flankLength = bandwith
  const quadraticTheilSenRegressor = createTSQuadraticSeries(flankLength)
  const gaussianWeight = createGaussianWeightFunction()
  let aMatrix = []
  let bMatrix = []
  let cMatrix = []

  /**
   * @param {float} the x value of the datapoint
   * @param {float} the y value of the datapoint
   */
  function push (x, y, w = 1) {
    quadraticTheilSenRegressor.push(x, y, w)

    // Let's shift the matrix to make room for a new datapoint
    if (aMatrix.length >= flankLength) {
      // The angularVelocityMatrix has reached its maximum length, we need to remove the first element
      aMatrix[0].reset()
      aMatrix[0] = null
      aMatrix.shift()
      bMatrix[0].reset()
      bMatrix[0] = null
      bMatrix.shift()
      cMatrix[0].reset()
      cMatrix[0] = null
      cMatrix.shift()
    }

    // Let's make room for a new set of values for first and second derivatives
    // Please note: a weighed median would work here, but results in much less fluid force curves
    aMatrix[aMatrix.length] = createWeighedSeries(flankLength, 0)
    bMatrix[bMatrix.length] = createWeighedSeries(flankLength, 0)
    cMatrix[cMatrix.length] = createWeighedSeries(flankLength, 0)

    let i = 0
    let weight = 0
    gaussianWeight.setWindowWidth(quadraticTheilSenRegressor.X.atSeriesBegin(), quadraticTheilSenRegressor.X.atSeriesEnd())

    // Let's calculate the first and second derivatives for each datapoint and store them in their matrices
    while (i < aMatrix.length && quadraticTheilSenRegressor.reliable()) {
      weight = quadraticTheilSenRegressor.goodnessOfFit() * quadraticTheilSenRegressor.localGoodnessOfFit(i) * gaussianWeight.weight(quadraticTheilSenRegressor.X.get(i))
      aMatrix[i].push(quadraticTheilSenRegressor.coefficientA(), weight)
      bMatrix[i].push(quadraticTheilSenRegressor.coefficientB(), weight)
      cMatrix[i].push(quadraticTheilSenRegressor.coefficientC(), weight)
      i++
    }
  }

  /**
   * @param {integer} the position in the flank of the requested value (default = 0)
   * @returns {float} the coefficient a of the quadratic function y = a x^2 + b x + c
   */
  function coefficientA (position = 0) {
    if (aMatrix.length === flankLength && position < aMatrix.length) {
      return aMatrix[position].weighedAverage()
    } else {
      return undefined
    }
  }

  /**
   * @param {integer} the position in the flank of the requested value (default = 0)
   * @returns {float} the coefficient b of the quadratic function y = a x^2 + b x + c
   */
  function coefficientB (position = 0) {
    if (bMatrix.length === flankLength && position < aMatrix.length) {
      return bMatrix[position].weighedAverage()
    } else {
      return undefined
    }
  }

  /**
   * @param {integer} the position in the flank of the requested value (default = 0)
   * @returns {float} the coefficient c of the quadratic function y = a x^2 + b x + c
   */
  function coefficientC (position = 0) {
    if (cMatrix.length === flankLength && position < aMatrix.length) {
      return cMatrix[position].weighedAverage()
    } else {
      return undefined
    }
  }

  /**
   * @param {integer} the position in the flank of the requested value (default = 0)
   * @returns {float} the firdt derivative of the quadratic function y = a x^2 + b x + c
   */
  function firstDerivative (position = 0) {
    if (aMatrix.length === flankLength && position < aMatrix.length) {
      return ((aMatrix[position].weighedAverage() * 2 * quadraticTheilSenRegressor.X.get(position)) + bMatrix[position].weighedAverage())
    } else {
      return undefined
    }
  }

  /**
   * @param {integer} the position in the flank of the requested value (default = 0)
   * @returns {float} the second derivative of the quadratic function y = a x^2 + b x + c
   */
  function secondDerivative (position = 0) {
    if (aMatrix.length === flankLength && position < aMatrix.length) {
      return (aMatrix[position].weighedAverage() * 2)
    } else {
      return undefined
    }
  }

  /**
   * @param {integer} the position in the flank of the requested value (default = 0)
   * @param {float} the x to project onto the function
   * @returns {float} the resulting y from the projection
   */
  function projectX (position, x) {
    if (aMatrix[position].length() >= 3) {
      return ((aMatrix[position].weighedAverage() * Math.pow(x, 2)) + (bMatrix[position].weighedAverage() * x) + cMatrix[position].weighedAverage())
    } else {
      return 0
    }
  }

  /**
   * @param {integer} the position in the flank of the requested value (default = 0)
   * @param {float} the y to project onto the function
   * @returns {array} the resulting x's from the projection
   */
  function projectY (position, y) {
    // Calculate the discriminant
    const discriminant = Math.pow(bMatrix[position].weighedAverage(), 2) - (4 * aMatrix[position].weighedAverage() * (cMatrix[position].weighedAverage() - y))

    switch (true) {
      case (aMatrix[position].weighedAverage() === 0 && bMatrix[position].weighedAverage() === 0):
        // The function is a horizontal flat line, let's return the orignal observation
        return [quadraticTheilSenRegressor.X.get(position)]
      case (aMatrix[position].weighedAverage() === 0):
        // The function is a tilted line, we need to handle this to prevent a division by zero
        // eslint-disable-next-line no-case-declarations -- Code clarity outweighs lint rules
        const projection = (y - cMatrix[position].weighedAverage()) / bMatrix[position].weighedAverage()
        return [projection]
      case (discriminant > 0):
        // eslint-disable-next-line no-case-declarations -- Code clarity outweighs lint rules
        const root1 = (-bMatrix[position].weighedAverage() + Math.sqrt(discriminant)) / (2 * aMatrix[position].weighedAverage())
        // eslint-disable-next-line no-case-declarations -- Code clarity outweighs lint rules
        const root2 = (-bMatrix[position].weighedAverage() - Math.sqrt(discriminant)) / (2 * aMatrix[position].weighedAverage())
        return [root1, root2]
      case (discriminant === 0):
        // eslint-disable-next-line no-case-declarations -- Code clarity outweighs lint rules
        const root = -bMatrix[position].weighedAverage() / (2 * aMatrix[position].weighedAverage())
        return [root]
      default:
        return []
    }
  }

  /**
   * Resets the series to its initial state
   */
  function reset () {
    quadraticTheilSenRegressor.reset()
    let i = aMatrix.length
    while (i > 0) {
      aMatrix[0].reset()
      aMatrix[0] = null
      aMatrix.shift()
      i--
    }
    aMatrix = null
    aMatrix = []

    let j = bMatrix.length
    while (j > 0) {
      bMatrix[0].reset()
      bMatrix[0] = null
      bMatrix.shift()
      j--
    }
    bMatrix = null
    bMatrix = []

    let k = cMatrix.length
    while (k > 0) {
      cMatrix[0].reset()
      cMatrix[0] = null
      cMatrix.shift()
      k--
    }
    cMatrix = null
    cMatrix = []
  }

  /**
   * @param {integer} position - position to be retrieved, starting at 0
   * @returns {float} X value at that specific postion in the series
   */
  function Xget (position = 0) {
    if (position < quadraticTheilSenRegressor.length()) {
      return quadraticTheilSenRegressor.X.get(position)
    } else {
      return undefined
    }
  }

  /**
   * @param {integer} position - position to be retrieved, starting at 0
   * @returns {float} Y value at that specific postion in the series
   */
  function Yget (position = 0) {
    if (position < quadraticTheilSenRegressor.length()) {
      return quadraticTheilSenRegressor.Y.get(position)
    } else {
      return undefined
    }
  }

  return {
    push,
    X: {
      get: Xget
    },
    Y: {
      get: Yget
    },
    coefficientA,
    coefficientB,
    coefficientC,
    firstDerivative,
    secondDerivative,
    projectX,
    projectY,
    reset
  }
}
