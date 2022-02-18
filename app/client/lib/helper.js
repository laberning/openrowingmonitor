'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Helper functions
*/

/**
 * Filters an object so that it only contains the attributes that are defined in a list
 * @param {Object} object
 * @param {Array} keys List of allowed attributs
 * @returns Object
 */
export function filterObjectByKeys (object, keys) {
  return Object.keys(object)
    .filter(key => keys.includes(key))
    .reduce((obj, key) => {
      obj[key] = object[key]
      return obj
    }, {})
}

/**
 * Picks a metric from the metrics object and presents its value in a human readable format
 * @param {Object} metrics raw metrics object
 * @param {String} metric selected metric
 * @returns String value of metric in human readable format
 */
export function metricValue (metrics, metric) {
  const formatMap = {
    distanceTotal: (value) => value >= 10000
      ? (value / 1000).toFixed(1)
      : Math.round(value),
    caloriesTotal: (value) => Math.round(value),
    power: (value) => Math.round(value),
    powerRaw: (value) => Math.round(value),
    strokesPerMinute: (value) => Math.round(value),
    instantaneousTorque: (value) => value.toFixed(2),
    powerRatio: (value) => value.toFixed(2)
  }
  if (metrics[metric] === undefined) {
    return '--'
  }
  return formatMap[metric] ? formatMap[metric](metrics[metric]) : metrics[metric]
}

/**
 * Picks a metric from the metrics object and presents its unit in a human readable format
 * @param {Object} metrics raw metrics object
 * @param {String} metric selected metric
 * @returns String value of metric unit in human readable format
 */
export function metricUnit (metrics, metric) {
  const unitMap = {
    distanceTotal: (value) => value >= 10000 ? 'km' : 'm'
  }
  return unitMap[metric] ? unitMap[metric](metrics[metric]) : ''
}
