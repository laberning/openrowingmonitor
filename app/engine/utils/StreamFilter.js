'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
/**
 * This keeps a series of specified length, which we can ask for an moving median
 * This is used by RowingStatistics.js to aggregate over multiple stroke phasee
 */
import { createLabelledBinarySearchTree } from './BinarySearchTree.js'

export function createStreamFilter (maxLength, defaultValue) {
  let lastRawDatapoint = defaultValue
  let cleanDatapoint = defaultValue
  let position = 0
  let bst = createLabelledBinarySearchTree()

  function push (dataPoint) {
    if (dataPoint !== undefined && !isNaN(dataPoint)) {
      lastRawDatapoint = dataPoint
      if (maxLength > 0) {
        position = (position + 1) % maxLength
        bst.remove(position)
        bst.push(position, dataPoint, 1)
      } else {
        bst.push(position, dataPoint, 1)
      }
      cleanDatapoint = bst.median()
    }
  }

  function raw () {
    return lastRawDatapoint
  }

  function clean () {
    if (bst.size() > 0) {
      // The series contains sufficient values to be valid
      return cleanDatapoint
    } else {
      // The array isn't sufficiently filled
      return defaultValue
    }
  }

  function reliable () {
    return bst.size() > 0
  }

  function reset () {
    bst.reset()
    lastRawDatapoint = defaultValue
    cleanDatapoint = defaultValue
  }

  return {
    push,
    raw,
    clean,
    reliable,
    reset
  }
}
