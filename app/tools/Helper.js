'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Helper functions
*/

// deeply merges any number of objects into a new object
export function deepMerge (...objects) {
  const isObject = obj => obj && typeof obj === 'object'

  return objects.reduce((prev, obj) => {
    Object.keys(obj).forEach(key => {
      const pVal = prev[key]
      const oVal = obj[key]

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = pVal.concat(...oVal)
      } else if (isObject(pVal) && isObject(oVal)) {
        prev[key] = deepMerge(pVal, oVal)
      } else {
        prev[key] = oVal
      }
    })

    return prev
  }, {})
}

// converts a timeStamp in seconds to a human readable hh:mm:ss format
export function secondsToTimeString (secondsTimeStamp) {
  if (secondsTimeStamp === Infinity) return '∞'
  const hours = Math.floor(secondsTimeStamp / 60 / 60)
  const minutes = Math.floor(secondsTimeStamp / 60) - (hours * 60)
  const seconds = Math.floor(secondsTimeStamp % 60)
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
}

/**
  * Pipe for formatting numbers to specific decimal
  *
  * @param {number} value The number.
  * @param {number} decimalPlaces The number of decimal places to round to (default: 0).
*/
export function formatNumber (value, decimalPlaces = 0) {
  const decimal = Math.pow(10, decimalPlaces)
  if (value === undefined || value === null || value === Infinity || isNaN(value) || value === 0) { return '--' }

  return Math.round(value * decimal) / decimal
}
