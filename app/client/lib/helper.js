'use strict'

import { html } from 'lit'
import '../components/DashboardMetric.js'

/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

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
  * Pipe for converting seconds to pace format 00:00
  *
  * @param seconds The actual time in seconds.
*/
export function secondsToPace (seconds) {
  const hours = Math.floor((seconds % 86400) / 3600)
  const mins = Math.floor(((seconds % 86400) % 3600) / 60)

  if (seconds === undefined || seconds === null || seconds === Infinity || isNaN(seconds)) return '--'
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${(Math.round(seconds) % 60)
            .toString()
            .padStart(2, '0')}`
  } else {
    return `${mins}:${(Math.round(seconds) % 60).toString().padStart(2, '0')}`
  }
}

/**
  * Pipe for formatting distance in meters with units
  *
  * @param value The distance in meters.
  * @param showInMiles Boolean whether to use imperial metric (default: false).
*/
export function formatDistance (value, showInMiles = false) {
  if (showInMiles === false) {
    return value >= 10000
      ? { distance: formatNumber((value / 1000), 2), unit: 'km' }
      : { distance: formatNumber(value), unit: 'm' }
  }

  return { distance: formatNumber((value / 1609.344), 2), unit: 'mi' }
}

/**
  * Pipe for formatting numbers to specific decimal
  *
  * @param value The number.
  * @param decimalPlaces The number of decimal places to round to (default: 0).
*/
export function formatNumber (value, decimalPlaces = 0) {
  const decimal = Math.pow(10, decimalPlaces)
  if (value === undefined || value === null || value === Infinity || isNaN(value) || value === 0) { return '--' }

  return Math.round(value * decimal) / decimal
}

export function simpleMetricFactory (value, unit, icon) {
  return html`<dashboard-metric .icon=${icon} .unit=${unit} .value=${value}></dashboard-metric>`
}
