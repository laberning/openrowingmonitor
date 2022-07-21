'use strict'
/*
  Open Rowing Monitor, https://github.com/jaapvanekris/openrowingmonitor

  This Module calculates a bucketed Linear Regression. It assumes a rising line.
*/

import { createOLSLinearSeries } from './OLSLinearSeries.js'

function createBucketedLinearSeries (config) {
  const linearSeries = createOLSLinearSeries()
  const xCutOffInterval = 5.0
  const yCutOffInterval = 7.0
  const minimumValuesInBracket = 6.0

  let xBracketStart = 0.0
  let xBracketEnd = 0.0
  let yBracketStart = 0.0
  let yBracketEnd = 0.0

  let xTotal = 0.0
  let yTotal = 0.0
  let xSum = 0.0
  let ySum = 0.0
  let numberOfValuesInBracket = 0.0
  let numberOfValues = 0.0
  let maxX = 0.0
  let maxY = 0.0

  function push (x, y) {
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
    if ( (yBracketStart <= y) && (y <= yBracketEnd) && (xBracketStart <= x) && (x <= xBracketEnd) ) {
      // We are still in the same <x * y> bracket
      xTotal += x
      yTotal += y
      xSum += x
      ySum += y
      numberOfValuesInBracket += 1
      numberOfValues += 1
    } else {
      // We are outside the current <x * y> bracket
      if (numberOfValuesInBracket >= minimumValuesInBracket) {
        // The latest bracket isn't empty or too shallow, so let's add the average to the dataset
        linearSeries.push((xTotal / numberOfValuesInBracket), (yTotal / numberOfValuesInBracket))
      }

      // Let's determine the position of the next <x * y> bracket
      // First, we determine the x Position
      if (xBracketStart > x) {
        // Looks like we bottomed out below the <power x heartrate> bracket, so lets make the bracket completely below it
        xBracketStart = x - xCutOffInterval
        xBracketEnd = x
      } else {
        // The heartrate probably went up
        xBracketStart = x
        xBracketEnd = x + xCutOffInterval
      }

      // Next, we determine the y position
      if (yBracketStart > y) {
        // Looks like we bottomed out below the <power x heartrate> bracket, so lets make the bracket completely below it
        yBracketStart = y - yCutOffInterval
        yBracketEnd = y
      } else {
        // The power is most likely to go up
        yBracketStart = y
        yBracketEnd = y + yCutOffInterval
      }

      // Let's fill the first datapoint in the new bracket
      xTotal = x
      yTotal = y
      xSum += x
      ySum += y
      numberOfValuesInBracket = 1
      numberOfValues += 1
    }
  }

  function slope () {
    return linearSeries.slope()
  }

  function intercept () {
    return linearSeries.slope()
  }

  function numberOfSamples () {
    return linearSeries.length()
  }

  function goodnessOfFit () {
    // This function returns the R^2 as a goodness of fit indicator
    return linearSeries.goodnessOfFit()
  }

  function projectX (x) {
    return linearSeries.projectX(x)
  }

  function projectY (y) {
    return linearSeries.projectY(y)
  }

  function maxEncounteredX () {
    return maxX
  }

  function maxEncounteredY () {
    return maxY
  }

  function averageEncounteredX () {
    if (numberOfValues > 0) {
      return xSum / numberOfValues
    } else {
      return 0
    }
  }

  function averageEncounteredY () {
    if (numberOfValues > 0) {
      return ySum / numberOfValues
    } else {
      return 0
    }
  }

  function reset () {
    // Nothing to do yet
    linearSeries.reset()
    xBracketStart = 0.0
    xBracketEnd = 0.0
    yBracketStart = 0.0
    yBracketEnd = 0.0
    xTotal = 0.0
    yTotal = 0.0
    xSum = 0.0
    ySum = 0.0
    numberOfValuesInBracket = 0.0
    numberOfValues = 0.0
    maxX = 0.0
    maxY = 0.0
  }

  return {
    push,
    slope,
    intercept,
    numberOfSamples,
    goodnessOfFit,
    projectX,
    projectY,
    maxEncounteredX,
    maxEncounteredY,
    averageEncounteredX,
    averageEncounteredY,
    reset
  }
}

export { createBucketedLinearSeries }
