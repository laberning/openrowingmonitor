'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Helper functions
*/

// Filters an object so that it only contains the attributes that are defined in a list
export function filterObjectByKeys (object, keys) {
  return Object.keys(object)
    .filter(key => keys.includes(key))
    .reduce((obj, key) => {
      obj[key] = object[key]
      return obj
    }, {})
}

/**
  * Pipe for converting seconds to a human readable time format 00:00
  * @param {number} timeInSeconds The actual time in seconds.
*/
export function secondsToTimeString (timeInSeconds) {
  if (timeInSeconds === undefined || timeInSeconds === null || isNaN(timeInSeconds)) { return '--' }
  if (timeInSeconds === Infinity) { return 'âˆž' }
  const timeInRoundedSeconds = Math.round(timeInSeconds)
  const hours = Math.floor(timeInRoundedSeconds / 3600)
  const minutes = Math.floor(timeInRoundedSeconds / 60) - (hours * 60)
  const seconds = Math.floor(timeInRoundedSeconds % 60)
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
}

/**
  * Pipe for formatting distance in meters with units
  * @param {number} value The distance in meters.
*/
export function formatDistance (value) {
  return value >= 99999.5 ?
    { distance: formatNumber((value / 1000), 2), unit: 'km' } :
    { distance: formatNumber(value), unit: 'm' }
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
