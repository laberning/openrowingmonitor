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
