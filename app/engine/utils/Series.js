'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This creates a series with a maximum number of values
  It allows for determining the Average, Median, Number of Positive, number of Negative
*/

function createSeries (maxSeriesLength) {
  const seriesArray = []
  let seriesSum = 0
  let numPos = 0
  let numNeg = 0

  function push (value) {
    if (maxSeriesLength > 0 && seriesArray.length >= maxSeriesLength) {
      // The maximum of the array has been reached, we have to create room by removing the first
      // value from the array
      seriesSum -= seriesArray[0]
      if (seriesArray[0] > 0) {
        numPos--
      } else {
        numNeg--
      }
      seriesArray.shift()
    }
    seriesArray.push(value)
    seriesSum += value
    if (value > 0) {
      numPos++
    } else {
      numNeg++
    }
  }

  function length () {
    return seriesArray.length
  }

  function atSeriesBegin () {
    if (seriesArray.length > 0) {
      return seriesArray[0]
    } else {
      return 0
    }
  }

  function atSeriesEnd () {
    if (seriesArray.length > 0) {
      return seriesArray[seriesArray.length - 1]
    } else {
      return 0
    }
  }

  function get (position) {
    if (position >= 0 && position < seriesArray.length) {
      return seriesArray[position]
    } else {
      return undefined
    }
  }

  function numberOfValuesAbove (testedValue) {
    if (testedValue === 0) {
      return numPos
    } else {
      let i = seriesArray.length - 1
      let count = 0
      while (i >= 0) {
        if (seriesArray[i] > testedValue) {
          count++
        }
        i--
      }
      return count
    }
  }

  function numberOfValuesEqualOrBelow (testedValue) {
    if (testedValue === 0) {
      return numNeg
    } else {
      let i = seriesArray.length - 1
      let count = 0
      while (i >= 0) {
        if (seriesArray[i] <= testedValue) {
          count++
        }
        i--
      }
      return count
    }
  }

  function sum () {
    return seriesSum
  }

  function average () {
    if (seriesArray.length > 0) {
      return seriesSum / seriesArray.length
    } else {
      return 0
    }
  }

  function minimum () {
    if (seriesArray.length > 0) {
      return Math.min(...seriesArray)
    } else {
      return 0
    }
  }

  function maximum () {
    if (seriesArray.length > 0) {
      return Math.max(...seriesArray)
    } else {
      return 0
    }
  }

  function median () {
    if (seriesArray.length > 0) {
      const mid = Math.floor(seriesArray.length / 2)
      const sortedArray = [...seriesArray].sort((a, b) => a - b)
      return seriesArray.length % 2 !== 0 ? sortedArray[mid] : (sortedArray[mid - 1] + sortedArray[mid]) / 2
    } else {
      return 0
    }
  }

  function series () {
    if (seriesArray.length > 0) {
      return seriesArray
    } else {
      return []
    }
  }

  function reset () {
    seriesArray.splice(0, seriesArray.length)
    seriesSum = 0
    numPos = 0
    numNeg = 0
  }

  return {
    push,
    length,
    atSeriesBegin,
    atSeriesEnd,
    get,
    numberOfValuesAbove,
    numberOfValuesEqualOrBelow,
    sum,
    average,
    minimum,
    maximum,
    median,
    series,
    reset
  }
}

export { createSeries }
