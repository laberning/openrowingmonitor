'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Merges the different config files and presents the configuration to the application
  Checks the config for plausibilit, fixes the errors when needed
*/
import log from 'loglevel'

/**
 * @param {{[key: string | number | symbol]: any}} parameterSection
 * @param {string} parameterName
 * @param {number | null} minimumValue
 * @param {number | null} maximumvalue
 * @param {boolean} allowZero
 * @param {boolean} allowRepair
 * @param {number | null} defaultValue
 */
// eslint-disable-next-line max-params
export function checkIntegerValue (parameterSection, parameterName, minimumValue, maximumvalue, allowZero, allowRepair, defaultValue) {
  // PLEASE NOTE: the parameterSection, parameterName seperation is needed to force a call by reference, which is needed for the repair action
  let errors = 0
  switch (true) {
    case (parameterSection[parameterName] === undefined):
      log.error(`Configuration Error: ${parameterSection}.${parameterName} isn't defined`)
      errors++
      break
    case (!Number.isInteger(parameterSection[parameterName])):
      log.error(`Configuration Error: ${parameterSection}.${parameterName} should be an integer value, encountered ${parameterSection[parameterName]}`)
      errors++
      break
    case (minimumValue !== null && parameterSection[parameterName] < minimumValue):
      log.error(`Configuration Error: ${parameterSection}.${parameterName} should be at least ${minimumValue}, encountered ${parameterSection[parameterName]}`)
      errors++
      break
    case (maximumvalue !== null && parameterSection[parameterName] > maximumvalue):
      log.error(`Configuration Error: ${parameterSection}.${parameterName} can't be above ${maximumvalue}, encountered ${parameterSection[parameterName]}`)
      errors++
      break
    case (!allowZero && parameterSection[parameterName] === 0):
      log.error(`Configuration Error: ${parameterSection}.${parameterName} can't be zero`)
      errors++
      break
    default:
      // No error detected :)
  }
  if (errors > 0) {
    // Errors were made
    if (allowRepair) {
      log.error(`   resolved by setting ${parameterSection}.${parameterName} to ${defaultValue}`)
      parameterSection[parameterName] = defaultValue
    } else {
      log.error(`   as ${parameterSection}.${parameterName} is a fatal parameter, I'm exiting`)
      process.exit(9)
    }
  }
}

/**
 * @param {{[key: string | number | symbol]: any}} parameterSection
 * @param {string} parameterName
 * @param {number | null} minimumValue
 * @param {number | null} maximumvalue
 * @param {boolean} allowZero
 * @param {boolean} allowRepair
 * @param {number | null} defaultValue
 */
// eslint-disable-next-line max-params
export function checkFloatValue (parameterSection, parameterName, minimumValue, maximumvalue, allowZero, allowRepair, defaultValue) {
  // PLEASE NOTE: the parameterSection, parameterName seperation is needed to force a call by reference, which is needed for the repair action
  let errors = 0
  switch (true) {
    case (parameterSection[parameterName] === undefined):
      log.error(`Configuration Error: ${parameterSection}.${parameterName} isn't defined`)
      errors++
      break
    case (!(typeof (parameterSection[parameterName]) === 'number')):
      log.error(`Configuration Error: ${parameterSection}.${parameterName} should be a numerical value, encountered ${parameterSection[parameterName]}`)
      errors++
      break
    case (minimumValue !== null && parameterSection[parameterName] < minimumValue):
      log.error(`Configuration Error: ${parameterSection}.${parameterName} should be at least ${minimumValue}, encountered ${parameterSection[parameterName]}`)
      errors++
      break
    case (maximumvalue !== null && parameterSection[parameterName] > maximumvalue):
      log.error(`Configuration Error: ${parameterSection}.${parameterName} can't be above ${maximumvalue}, encountered ${parameterSection[parameterName]}`)
      errors++
      break
    case (!allowZero && parameterSection[parameterName] === 0):
      log.error(`Configuration Error: ${parameterSection}.${parameterName} can't be zero`)
      errors++
      break
    default:
      // No error detected :)
  }
  if (errors > 0) {
    // Errors were made
    if (allowRepair) {
      log.error(`   resolved by setting ${parameterSection}.${parameterName} to ${defaultValue}`)
      parameterSection[parameterName] = defaultValue
    } else {
      log.error(`   as ${parameterSection}.${parameterName} is a fatal parameter, I'm exiting`)
      process.exit(9)
    }
  }
}

/**
 * @param {{[key: string | number | symbol]: any}} parameterSection
 * @param {string} parameterName
 * @param {boolean} allowRepair
 * @param {boolean} defaultValue
 */
export function checkBooleanValue (parameterSection, parameterName, allowRepair, defaultValue) {
  // PLEASE NOTE: the parameterSection, parameterName seperation is needed to force a call by reference, which is needed for the repair action
  let errors = 0
  switch (true) {
    case (parameterSection[parameterName] === undefined):
      log.error(`Configuration Error: ${parameterSection}.${parameterName} isn't defined`)
      errors++
      break
    case (!(parameterSection[parameterName] === true || parameterSection[parameterName] === false)):
      log.error(`Configuration Error: ${parameterSection}.${parameterName} should be either false or true, encountered ${parameterSection[parameterName]}`)
      errors++
      break
    default:
      // No error detected :)
  }
  if (errors > 0) {
    // Errors were made
    if (allowRepair) {
      log.error(`   resolved by setting ${parameterSection}.${parameterName} to ${defaultValue}`)
      parameterSection[parameterName] = defaultValue
    } else {
      log.error(`   as ${parameterSection}.${parameterName} is a fatal parameter, I'm exiting`)
      process.exit(9)
    }
  }
}

/**
 * @param {{[key: string | number | symbol]: any}} parameterSection
 * @param {string} parameterName
 * @param {Array<string | number>} range
 * @param {boolean} allowRepair
 * @param {string | number} defaultValue
 */
export function checkRangeValue (parameterSection, parameterName, range, allowRepair, defaultValue) {
  // PLEASE NOTE: the parameterSection, parameterName seperation is needed to force a call by reference, which is needed for the repair action
  let errors = 0
  switch (true) {
    case (parameterSection[parameterName] === undefined):
      log.error(`Configuration Error: ${parameterSection}.${parameterName} isn't defined`)
      errors++
      break
    case (!range.includes(parameterSection[parameterName])):
      log.error(`Configuration Error: ${parameterSection}.${parameterName} should be come from ${range}, encountered ${parameterSection[parameterName]}`)
      errors++
      break
    default:
      // No error detected :)
  }
  if (errors > 0) {
    // Errors were made
    if (allowRepair) {
      log.error(`   resolved by setting ${parameterSection}.${parameterName} to ${defaultValue}`)
      parameterSection[parameterName] = defaultValue
    } else {
      log.error(`   as ${parameterSection}.${parameterName} is a fatal parameter, I'm exiting`)
      process.exit(9)
    }
  }
}
