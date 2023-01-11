'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Merges the different config files and presents the configuration to the application
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
  checkRangeValue(configToCheck.loglevel.default, 'loglevel.default', ['trace', 'debug', 'info', 'warn', 'error', 'silent'], true, 'error')
  checkRangeValue(configToCheck.loglevel.RowingEngine, 'loglevel.RowingEngine', ['trace', 'debug', 'info', 'warn', 'error', 'silent'], true, 'error')
  checkIntegerValue(configToCheck.gpioPin, 'gpioPin', 1, 27, false, false, null)
  checkIntegerValue(configToCheck.gpioPriority, 'gpioPriority', -7, 0, true, true, 0)
  checkIntegerValue(configToCheck.gpioMinimumPulseLength, 'gpioMinimumPulseLength', 1, 100000, false, true, 0)
  checkIntegerValue(configToCheck.gpioPollingInterval, 'gpioPollingInterval', 1, 10, false, true, 10)
  checkRangeValue(configToCheck.gpioPollingInterval, 'gpioPollingInterval', [1, 2, 5, 10], true, 10)
  checkRangeValue(configToCheck.gpioTriggeredFlank, 'gpioTriggeredFlank', ['Up', 'Down', 'Both'], false, null)
  checkIntegerValue(configToCheck.appPriority, 'appPriority', configToCheck.gpioPriority, 0, true, true, 0)
  checkIntegerValue(configToCheck.webUpdateInterval, 'webUpdateInterval', 80, 1000, false, true, 1000)
  checkBinaryValue(configToCheck.heartrateMonitorBLE, 'heartrateMonitorBLE', true, true)
  checkBinaryValue(configToCheck.heartrateMonitorANT, 'heartrateMonitorANT', true, false)
  checkRangeValue(configToCheck.bluetoothMode, 'bluetoothMode', ['off', 'PM5', 'FTMS', 'FTMSBIKE', 'CPS', 'CSC'], true, 'FTMS')
  checkIntegerValue(configToCheck.peripheralUpdateInterval, 'peripheralUpdateInterval', 80, 1000, false, true, 1000)
  checkIntegerValue(configToCheck.numOfPhasesForAveragingScreenData, 'numOfPhasesForAveragingScreenData', 2, null, false, true, 4)
  checkBinaryValue(configToCheck.createRowingDataFiles, 'createRowingDataFiles', true, true)
  checkBinaryValue(configToCheck.createRawDataFiles, 'createRawDataFiles', true, true)
  checkBinaryValue(configToCheck.gzipRawDataFiles, 'gzipRawDataFiles', true, false)
  checkBinaryValue(configToCheck.createTcxFiles, 'createTcxFiles', true, true)
  checkBinaryValue(configToCheck.gzipTcxFiles, 'gzipTcxFiles', true, false)
  checkFloatValue(configToCheck.userSettings.restingHR, 'userSettings.restingHR', 30, 220, false, true, 40)
  checkFloatValue(configToCheck.userSettings.maxHR, 'userSettings.maxHR', configToCheck.userSettings.restingHR, 220, false, true, 220)
  if (configToCheck.createTcxFiles) {
    checkFloatValue(configToCheck.userSettings.minPower, 'userSettings.minPower', 1, 500, false, true, 50)
    checkFloatValue(configToCheck.userSettings.maxPower, 'userSettings.maxPower', 100, 6000, false, true, 500)
    checkFloatValue(configToCheck.userSettings.distanceCorrectionFactor, 'userSettings.distanceCorrectionFactor', 0, 50, false, true, 5)
    checkFloatValue(configToCheck.userSettings.weight, 'userSettings.weight', 25, 500, false, true, 80)
    checkRangeValue(configToCheck.userSettings.sex, 'userSettings.sex', ['male', 'female'], true, 'male')
    checkBinaryValue(configToCheck.userSettings.highlyTrained, 'userSettings.highlyTrained', true, false)
  }
  checkIntegerValue(configToCheck.rowerSettings.numOfImpulsesPerRevolution, 'rowerSettings.numOfImpulsesPerRevolution', 1, null, false, false, null)
  checkIntegerValue(configToCheck.rowerSettings.flankLength, 'rowerSettings.flankLength', 3, null, false, false, null)
  checkFloatValue(configToCheck.rowerSettings.sprocketRadius, 'rowerSettings.sprocketRadius', 0, 20, false, true, 3)
  checkFloatValue(configToCheck.rowerSettings.minimumTimeBetweenImpulses, 'rowerSettings.minimumTimeBetweenImpulses', 0, 3, false, false, null)
  checkFloatValue(configToCheck.rowerSettings.maximumTimeBetweenImpulses, 'rowerSettings.maximumTimeBetweenImpulses', configToCheck.rowerSettings.minimumTimeBetweenImpulses, 3, false, false, null)
  checkFloatValue(configToCheck.rowerSettings.smoothing, 'rowerSettings.smoothing', 1, 1000000, false, true, 1)
  checkFloatValue(configToCheck.rowerSettings.dragFactor, 'rowerSettings.dragFactor', 1, 1000000, false, false, null)
  checkBinaryValue(configToCheck.rowerSettings.autoAdjustDragFactor, 'rowerSettings.autoAdjustDragFactor', true, false)
  checkIntegerValue(configToCheck.rowerSettings.dragFactorSmoothing, 'rowerSettings.dragFactorSmoothing', 1, 1000, false, true, 1)
  if (configToCheck.rowerSettings.autoAdjustDragFactor) {
    checkFloatValue(configToCheck.rowerSettings.minimumDragQuality, 'rowerSettings.minimumDragQuality', 0, 1, true, true, 0)
  }
  checkFloatValue(configToCheck.rowerSettings.flywheelInertia, 'rowerSettings.flywheelInertia', 0, 2, false, false, null)
  checkFloatValue(configToCheck.rowerSettings.minumumForceBeforeStroke, 'rowerSettings.minumumForceBeforeStroke', 0, 500, true, true, 0)
  checkFloatValue(configToCheck.rowerSettings.minumumRecoverySlope, 'rowerSettings.minumumRecoverySlope', 0, 2, true, true, 0)
  checkFloatValue(configToCheck.rowerSettings.minimumStrokeQuality, 'rowerSettings.minimumStrokeQuality', 0, 1, true, true, 0)
  checkBinaryValue(configToCheck.rowerSettings.autoAdjustRecoverySlope, 'rowerSettings.autoAdjustRecoverySlope', true, false)
  if (!configToCheck.rowerSettings.autoAdjustDragFactor && configToCheck.rowerSettings.autoAdjustRecoverySlope) {
    log.error('Configuration Error: rowerSettings.autoAdjustRecoverySlope can not be true when configToCheck.rowerSettings.autoAdjustDragFactor is false, ignoring request')
  }
  if (configToCheck.rowerSettings.autoAdjustDragFactor && configToCheck.rowerSettings.autoAdjustRecoverySlope) {
    checkFloatValue(configToCheck.rowerSettings.autoAdjustRecoverySlopeMargin, 'autoAdjustRecoverySlopeMargin', 0, 1, false, true, 1)
  }
  checkFloatValue(configToCheck.rowerSettings.minimumDriveTime, 'rowerSettings.minimumDriveTime', 0, 6, false, true, 0.001)
  checkFloatValue(configToCheck.rowerSettings.minimumRecoveryTime, 'rowerSettings.minimumRecoveryTime', 0, 6, false, true, 0.001)
  checkFloatValue(configToCheck.rowerSettings.maximumStrokeTimeBeforePause, 'rowerSettings.maximumStrokeTimeBeforePause', 3, 60, false, true, 6)
  checkFloatValue(configToCheck.rowerSettings.magicConstant, 'rowerSettings.magicConstant', 0, 28, false, true, 2.8)
}

function checkIntegerValue (parameter, parameterName, minimumValue, maximumvalue, allowZero, allowRepair, defaultValue) {
  let errors = 0
  switch (true) {
    case (parameter === undefined):
      log.error(`Configuration Error: ${parameterName} isn't defined`)
      errors++
      break
    case (!Number.isInteger(parameter)):
      log.error(`Configuration Error: ${parameterName} should be an integer value, encountered ${parameter}`)
      errors++
      break
    case (minimumValue != null && parameter < minimumValue):
      log.error(`Configuration Error: ${parameterName} should be at least ${minimumValue}, encountered ${parameter}`)
      errors++
      break
    case (maximumvalue != null && parameter > maximumvalue):
      log.error(`Configuration Error: ${parameterName} can't be above ${maximumvalue}, encountered ${parameter}`)
      errors++
      break
    case (!allowZero && parameter == 0):
      log.error(`Configuration Error: ${parameterName} can't be zero`)
      errors++
      break
    default:
      // No error detected :)
  }
  if (errors > 0) {
    // Errors were made
    if (allowRepair) {
      log.error(`   resolved by setting ${parameterName} to ${defaultValue}`)
      // ToDo: fix this by making the function call a call by reference!!!
      parameter = defaultValue
    } else {
      log.error(`As ${parameterName} is a fatal parameter, I'm exiting`)
      process.exit(9)
    }
  }
}

function checkFloatValue (parameter, parameterName, minimumValue, maximumvalue, allowZero, allowRepair, defaultValue) {
  let errors = 0
  switch (true) {
    case (parameter === undefined):
      log.error(`Configuration Error: ${parameterName} isn't defined`)
      errors++
      break
    case (!typeof (parameter) === 'number'):
      log.error(`Configuration Error: ${parameterName} should be a numerical value, encountered ${parameter}`)
      errors++
      break
    case (minimumValue != null && parameter < minimumValue):
      log.error(`Configuration Error: ${parameterName} should be at least ${minimumValue}, encountered ${parameter}`)
      errors++
      break
    case (maximumvalue != null && parameter > maximumvalue):
      log.error(`Configuration Error: ${parameterName} can't be above ${maximumvalue}, encountered ${parameter}`)
      errors++
      break
    case (!allowZero && parameter == 0):
      log.error(`Configuration Error: ${parameterName} can't be zero`)
      errors++
      break
    default:
      // No error detected :)
  }
  if (errors > 0) {
    // Errors were made
    if (allowRepair) {
      log.error(`   resolved by setting ${parameterName} to ${defaultValue}`)
      // ToDo: fix this by making the function call a call by reference!!!
      parameter = defaultValue
    } else {
      log.error(`As ${parameterName} is a fatal parameter, I'm exiting`)
      process.exit(9)
    }
  }
}

function checkBinaryValue (parameter, parameterName, allowRepair, defaultValue) {
  let errors = 0
  switch (true) {
    case (parameter === undefined):
      log.error(`Configuration Error: ${parameterName} isn't defined`)
      errors++
      break
    case (!(parameter === true || parameter === false)):
      log.error(`Configuration Error: ${parameterName} should be either false or true, encountered ${parameter}`)
      errors++
      break
    default:
      // No error detected :)
  }
  if (errors > 0) {
    // Errors were made
    if (allowRepair) {
      log.error(`   resolved by setting ${parameterName} to ${defaultValue}`)
      // ToDo: fix this by making the function call a call by reference!!!
      parameter = defaultValue
    } else {
      log.error(`As ${parameterName} is a fatal parameter, I'm exiting`)
      process.exit(9)
    }
  }
}

function checkRangeValue (parameter, parameterName, range, allowRepair, defaultValue) {
  let errors = 0
  switch (true) {
    case (parameter === undefined):
      log.error(`Configuration Error: ${parameterName} isn't defined`)
      errors++
      break
    case (!range.includes(parameter)):
      log.error(`Configuration Error: ${parameterName} should be come from ${range}, encountered ${parameter}`)
      errors++
      break
    default:
      // No error detected :)
  }
  if (errors > 0) {
    // Errors were made
    if (allowRepair) {
      log.error(`   resolved by setting ${parameterName} to ${defaultValue}`)
      // ToDo: fix this by making the function call a call by reference!!!
      parameter = defaultValue
    } else {
      log.error(`As ${parameterName} is a fatal parameter, I'm exiting`)
      process.exit(9)
    }
  }
}

const config = await getConfig()

checkConfig(config)

export default config
