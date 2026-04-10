'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
/**
 * Helper functions
 */

/**
 * Deeply merges any number of objects into a new object
 * @template {object} T
 * @param {...T} objects - Objects to merge.
 * @returns {T} - The merged object
 */
export function deepMerge (...objects) {
  const isObject = /** @type {(obj: T[keyof T]) => obj is object} */ obj => obj && typeof obj === 'object'

  return objects.reduce((/** @type {T} */prev, /** @type {T} */obj) => {
    /** @type {Array<keyof T>} */(Object.keys(obj)).forEach(key => {
      const pVal = prev[key]
      const oVal = obj[key]

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        /** @type {Array<any>} */(prev[key]) = pVal.concat(...oVal)
      } else if (isObject(pVal) && isObject(oVal)) {
        /** @type {object} */(prev[key]) = deepMerge(pVal, oVal)
      } else {
        prev[key] = oVal
      }
    })

    return prev
  }, /** @type {T} */ ({}))
}

// converts a timeStamp in seconds to a human readable hh:mm:ss format
/**
 * @param {number} secondsTimeStamp
 * @returns
 */
export function secondsToTimeString (secondsTimeStamp) {
  if (secondsTimeStamp === Infinity) { return 'âˆž' }
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
  * @param {number} value The number.
  * @param {number} decimalPlaces The number of decimal places to round to (default: 0).
*/
export function formatNumber (value, decimalPlaces = 0) {
  const decimal = Math.pow(10, decimalPlaces)
  if (value === undefined || value === null || value === Infinity || isNaN(value) || value === 0) { return '--' }

  return Math.round(value * decimal) / decimal
}

/**
 * Reverses the property and values of the object making the values properties that allow to access the property name by passing in the value (assuming values are unique)
 * @template {Record<string,number>} T
 * @param {T} object
 * @returns {ReverseKeyValue<Record<T, number>>}
 */
export function swapObjectPropertyValues (object) {
  return Object.fromEntries(Object.entries(object).map(a => a.reverse()))
}

/**
 * @param {Array<number>} array
 */
export function toHexString (array) {
  return array.map((item) => `0x${item.toString(16).padStart(2, '0')}`)
}
