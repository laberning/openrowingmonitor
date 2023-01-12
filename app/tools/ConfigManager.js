'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Merges the different config files and presents the configuration to the application
  Checks the config for plausibilit, fixes the errors when needed
*/
import defaultConfig from '../../config/default.config.js'
import { deepMerge } from './Helper.js'
import log from 'loglevel'

async function getConfig () {
  let customConfig
  try {
    customConfig = await import('../../config/config.js')
  } catch (exception) {}
  return customConfig !== undefined ? deepMerge(defaultConfig, customConfig.default) : defaultConfig
}

function checkConfig (configToCheck) {
  checkRangeValue(configToCheck.loglevel, 'default', ['trace', 'debug', 'info', 'warn', 'error', 'silent'], true, 'error')
  checkRangeValue(configToCheck.loglevel, 'RowingEngine', ['trace', 'debug', 'info', 'warn', 'error', 'silent'], true, 'error')
  checkIntegerValue(configToCheck, 'gpioPin', 1, 27, false, false, null)
  checkIntegerValue(configToCheck, 'gpioPriority', -7, 0, true, true, 0)
  checkIntegerValue(configToCheck, 'gpioMinimumPulseLength', 1, null, false, true, 0)
  checkIntegerValue(configToCheck, 'gpioPollingInterval', 1, 10, false, true, 10)
  checkRangeValue(configToCheck, 'gpioPollingInterval', [1, 2, 5, 10], true, 10)
  checkRangeValue(configToCheck, 'gpioTriggeredFlank', ['Up', 'Down', 'Both'], false, null)
  checkIntegerValue(configToCheck, 'appPriority', configToCheck.gpioPriority, 0, true, true, 0)
  checkIntegerValue(configToCheck, 'webUpdateInterval', 80, 1000, false, true, 1000)
  checkBinaryValue(configToCheck, 'heartrateMonitorBLE', true, true)
  checkBinaryValue(configToCheck, 'heartrateMonitorANT', true, false)
  checkRangeValue(configToCheck, 'bluetoothMode', ['off', 'PM5', 'FTMS', 'FTMSBIKE', 'CPS', 'CSC'], true, 'FTMS')
  checkIntegerValue(configToCheck, 'peripheralUpdateInterval', 80, 1000, false, true, 1000)
  checkIntegerValue(configToCheck, 'numOfPhasesForAveragingScreenData', 2, null, false, true, 4)
  checkBinaryValue(configToCheck, 'createRowingDataFiles', true, true)
  checkBinaryValue(configToCheck, 'createRawDataFiles', true, true)
  checkBinaryValue(configToCheck, 'gzipRawDataFiles', true, false)
  checkBinaryValue(configToCheck, 'createTcxFiles', true, true)
  checkBinaryValue(configToCheck, 'gzipTcxFiles', true, false)
  checkFloatValue(configToCheck.userSettings, 'restingHR', 30, 220, false, true, 40)
  checkFloatValue(configToCheck.userSettings, 'maxHR', configToCheck.userSettings.restingHR, 220, false, true, 220)
  if (configToCheck.createTcxFiles) {
    checkFloatValue(configToCheck.userSettings, 'minPower', 1, 500, false, true, 50)
    checkFloatValue(configToCheck.userSettings, 'maxPower', 100, 6000, false, true, 500)
    checkFloatValue(configToCheck.userSettings, 'distanceCorrectionFactor', 0, 50, false, true, 5)
    checkFloatValue(configToCheck.userSettings, 'weight', 25, 500, false, true, 80)
    checkRangeValue(configToCheck.userSettings, 'sex', ['male', 'female'], true, 'male')
    checkBinaryValue(configToCheck.userSettings, 'highlyTrained', true, false)
  }
  checkIntegerValue(configToCheck.rowerSettings, 'numOfImpulsesPerRevolution', 1, null, false, false, null)
  checkIntegerValue(configToCheck.rowerSettings, 'flankLength', 3, null, false, false, null)
  checkFloatValue(configToCheck.rowerSettings, 'sprocketRadius', 0, 20, false, true, 3)
  checkFloatValue(configToCheck.rowerSettings, 'minimumTimeBetweenImpulses', 0, 3, false, false, null)
  checkFloatValue(configToCheck.rowerSettings, 'maximumTimeBetweenImpulses', configToCheck.rowerSettings.minimumTimeBetweenImpulses, 3, false, false, null)
  checkFloatValue(configToCheck.rowerSettings, 'smoothing', 1, null, false, true, 1)
  checkFloatValue(configToCheck.rowerSettings, 'dragFactor', 1, null, false, false, null)
  checkBinaryValue(configToCheck.rowerSettings, 'autoAdjustDragFactor', true, false)
  checkIntegerValue(configToCheck.rowerSettings, 'dragFactorSmoothing', 1, null, false, true, 1)
  if (configToCheck.rowerSettings.autoAdjustDragFactor) {
    checkFloatValue(configToCheck.rowerSettings, 'minimumDragQuality', 0, 1, true, true, 0)
  }
  checkFloatValue(configToCheck.rowerSettings, 'flywheelInertia', 0, null, false, false, null)
  checkFloatValue(configToCheck.rowerSettings, 'minumumForceBeforeStroke', 0, 500, true, true, 0)
  checkFloatValue(configToCheck.rowerSettings, 'minumumRecoverySlope', 0, null, true, true, 0)
  checkFloatValue(configToCheck.rowerSettings, 'minimumStrokeQuality', 0, 1, true, true, 0)
  checkBinaryValue(configToCheck.rowerSettings, 'autoAdjustRecoverySlope', true, false)
  if (!configToCheck.rowerSettings.autoAdjustDragFactor && configToCheck.rowerSettings.autoAdjustRecoverySlope) {
    log.error('Configuration Error: rowerSettings.autoAdjustRecoverySlope can not be true when rowerSettings.autoAdjustDragFactor is false, ignoring request')
  }
  if (configToCheck.rowerSettings.autoAdjustDragFactor && configToCheck.rowerSettings.autoAdjustRecoverySlope) {
    checkFloatValue(configToCheck.rowerSettings, 'autoAdjustRecoverySlopeMargin', 0, 1, false, true, 1)
  }
  checkFloatValue(configToCheck.rowerSettings, 'minimumDriveTime', 0, null, false, true, 0.001)
  checkFloatValue(configToCheck.rowerSettings, 'minimumRecoveryTime', 0, null, false, true, 0.001)
  checkFloatValue(configToCheck.rowerSettings, 'maximumStrokeTimeBeforePause', 3, 60, false, true, 6)
  checkFloatValue(configToCheck.rowerSettings, 'magicConstant', 0, null, false, true, 2.8)
}

function checkIntegerValue (parameterSection, parameterName, minimumValue, maximumvalue, allowZero, allowRepair, defaultValue) {
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
    case (minimumValue != null && parameterSection[parameterName] < minimumValue):
      log.error(`Configuration Error: ${parameterSection}.${parameterName} should be at least ${minimumValue}, encountered ${parameterSection[parameterName]}`)
      errors++
      break
    case (maximumvalue != null && parameterSection[parameterName] > maximumvalue):
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

function checkFloatValue (parameterSection, parameterName, minimumValue, maximumvalue, allowZero, allowRepair, defaultValue) {
  // PLEASE NOTE: the parameterSection, parameterName seperation is needed to force a call by reference, which is needed for the repair action
  let errors = 0
  switch (true) {
    case (parameterSection[parameterName] === undefined):
      log.error(`Configuration Error: ${parameterSection}.${parameterName} isn't defined`)
      errors++
      break
    case (!typeof (parameterSection[parameterName]) === 'number'):
      log.error(`Configuration Error: ${parameterSection}.${parameterName} should be a numerical value, encountered ${parameterSection[parameterName]}`)
      errors++
      break
    case (minimumValue != null && parameterSection[parameterName] < minimumValue):
      log.error(`Configuration Error: ${parameterSection}.${parameterName} should be at least ${minimumValue}, encountered ${parameterSection[parameterName]}`)
      errors++
      break
    case (maximumvalue != null && parameterSection[parameterName] > maximumvalue):
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

function checkBinaryValue (parameterSection, parameterName, allowRepair, defaultValue) {
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

function checkRangeValue (parameterSection, parameterName, range, allowRepair, defaultValue) {
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

const config = await getConfig()

checkConfig(config)

export default config
