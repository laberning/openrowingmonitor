'use strict'
/*
  Open Rowing Monitor, https://github.com/jaapvanekris/openrowingmonitor

  This Module calculates the training specific VO2Max metrics. It is based on formula's found on the web.
*/

import { createBucketedLinearSeries } from './utils/BucketedLinearSeries.js'

import loglevel from 'loglevel'
const log = loglevel.getLogger('RowingEngine')

function createVoMax (config) {
  const bucketedLinearSeries = createBucketedLinearSeries(config)
  const minimumValidBrackets = 5.0
  const offset = 90

  function calculateVOMax (metrics) {
    let projectedVOTwoMax = 0
    let interpolatedVOTwoMax = 0

    if (metrics[0].heartrate !== undefined && metrics[metrics.length - 1].heartrate !== undefined && metrics[metrics.length - 1].heartrate >= config.userSettings.restingHR) {
      projectedVOTwoMax = extrapolatedVOMax(metrics)
    }

    interpolatedVOTwoMax = interpolatedVOMax(metrics)

    if (projectedVOTwoMax >= 10 && projectedVOTwoMax <= 60 && interpolatedVOTwoMax >= 10 && interpolatedVOTwoMax <= 60) {
      // Both VO2Max calculations have delivered a valid and credible result
      log.debug(`--- VO2Max calculation delivered two credible results Extrapolated VO2Max: ${projectedVOTwoMax.toFixed(1)} and Interpolated VO2Max: ${interpolatedVOTwoMax.toFixed(1)}`)
      return ((projectedVOTwoMax + interpolatedVOTwoMax) / 2)
    } else {
      // One of the calculations has delivered an invalid result
      if (interpolatedVOTwoMax >= 10 && interpolatedVOTwoMax <= 60) {
        // Interpolation has delivered a credible result
        log.debug(`--- VO2Max calculation delivered one credible result, the Interpolated VO2Max: ${interpolatedVOTwoMax.toFixed(1)}. The Extrapolated VO2Max: ${projectedVOTwoMax.toFixed(1)} was unreliable`)
        return interpolatedVOTwoMax
      } else {
        // Interpolation hasn't delivered a credible result
        if (projectedVOTwoMax >= 10 && projectedVOTwoMax <= 60) {
          // Extrapolation did deliver a credible result
          log.debug(`--- VO2Max calculation delivered one credible result, the Extrapolated VO2Max: ${projectedVOTwoMax.toFixed(1)}. Interpolated VO2Max: ${interpolatedVOTwoMax.toFixed(1)} was unreliable`)
          return projectedVOTwoMax
        } else {
          // No credible results at all!
          log.debug(`--- VO2Max calculation did not deliver any credible results Extrapolated VO2Max: ${projectedVOTwoMax.toFixed(1)}, Interpolated VO2Max: ${interpolatedVOTwoMax.toFixed(1)}`)
          return 0
        }
      }
    }
  }

  function extrapolatedVOMax (metrics) {
    // This implements the extrapolation-based VO2Max determination
    // Which is based on the extrapolated maximum power output based on the correlation between heartrate and power,
    // Underlying formula's can be found here: https://sportcoaching.co.nz/how-does-garmin-calculate-vo2-max/
    let ProjectedVOTwoMax
    let i = 0
    while (i < metrics.length && metrics[i].totalMovingTime < offset) {
      // We skip the first timeperiod as it only depicts the change from a resting HR to a working HR
      i++
    }
    while (i < metrics.length) {
      if (metrics[i].heartrate !== undefined && metrics[i].heartrate >= config.userSettings.restingHR && metrics[i].heartrate <= config.userSettings.maxHR && metrics[i].cyclePower !== undefined && metrics[i].cyclePower >= config.userSettings.minPower && metrics[i].cyclePower <= config.userSettings.maxPower) {
        // The data looks credible, lets add it
        bucketedLinearSeries.push(metrics[i].heartrate, metrics[i].cyclePower)
      }
      i++
    }

    // All Datapoints have been added, now we determine the projected power
    if (bucketedLinearSeries.numberOfSamples() >= minimumValidBrackets) {
      const projectedPower = bucketedLinearSeries.projectX(config.userSettings.maxHR)
      if (projectedPower <= config.userSettings.maxPower && projectedPower >= bucketedLinearSeries.maxEncounteredY()) {
        ProjectedVOTwoMax = ((14.72 * projectedPower) + 250.39) / config.userSettings.weight
        log.debug(`--- VO2Max Goodness of Fit: ${bucketedLinearSeries.goodnessOfFit().toFixed(6)}, projected power ${projectedPower.toFixed(1)} Watt, extrapolated VO2Max: ${ProjectedVOTwoMax.toFixed(1)}`)
      } else {
        ProjectedVOTwoMax = ((14.72 * bucketedLinearSeries.maxEncounteredY()) + 250.39) / config.userSettings.weight
        log.debug(`--- VO2Max maximum encountered power: ${bucketedLinearSeries.maxEncounteredY().toFixed(1)} Watt, extrapolated VO2Max: ${ProjectedVOTwoMax.toFixed(1)}`)
      }
    } else {
      log.debug(`--- VO2Max extrapolation failed as there were not enough valid brackets: ${bucketedLinearSeries.numberOfSamples()}`)
      ProjectedVOTwoMax = 0
    }
    return ProjectedVOTwoMax
  }

  function interpolatedVOMax (metrics) {
    // Thisis  based on research done by concept2, https://www.concept2.com/indoor-rowers/training/calculators/vo2max-calculator,
    // which determines the VO2Max based on the 2K speed
    const distance = metrics[metrics.length - 1].totalLinearDistance
    const time = metrics[metrics.length - 1].totalMovingTime
    const projectedTwoKPace = interpolatePace(time, distance, 2000)
    const projectedTwoKTimeInMinutes = (4 * projectedTwoKPace) / 60
    let Y = 0

    log.debug(`--- VO2Max Interpolated 2K pace: ${Math.floor(projectedTwoKPace / 60)}:${(projectedTwoKPace % 60).toFixed(1)}`)
    // This implements the table with formulas found at https://www.concept2.com/indoor-rowers/training/calculators/vo2max-calculator
    if (config.userSettings.highlyTrained) {
      // Highly trained
      if (config.userSettings.sex === 'male') {
        // Highly trained male
        if (config.userSettings.weight > 75) {
          // Highly trained male, above 75 Kg
          Y = 15.7 - (1.5 * projectedTwoKTimeInMinutes)
        } else {
          // Highly trained male, equal or below 75 Kg
          Y = 15.1 - (1.5 * projectedTwoKTimeInMinutes)
        }
      } else {
        // Highly trained female
        if (config.userSettings.weight > 61.36) {
          // Highly trained female, above 61.36 Kg
          Y = 14.9 - (1.5 * projectedTwoKTimeInMinutes)
        } else {
          // Highly trained female, equal or below 61.36 Kg
          Y = 14.6 - (1.5 * projectedTwoKTimeInMinutes)
        }
      }
    } else {
      // Not highly trained
      if (config.userSettings.sex === 'male') {
        // Not highly trained male
        Y = 10.7 - (0.9 * projectedTwoKTimeInMinutes)
      } else {
        // Not highly trained female
        Y = 10.26 - (0.93 * projectedTwoKTimeInMinutes)
      }
    }
    return (Y * 1000) / config.userSettings.weight
  }

  function interpolatePace (origintime, origindistance, targetdistance) {
    // We interpolate the 2K speed based on Paul's Law: https://paulergs.weebly.com/blog/a-quick-explainer-on-pauls-law
    let originpace = 0

    if (origintime > 0 && origindistance > 0 && targetdistance > 0) {
      originpace = (500 * origintime) / origindistance
      return (originpace + (5 * Math.log2(targetdistance / origindistance)))
    } else {
      return 0
    }
  }

 function averageObservedHR () {
    bucketedLinearSeries.averageEncounteredX()
  }

  function maxObservedHR () {
    bucketedLinearSeries.maxEncounteredX()
  }

  function reset () {
    bucketedLinearSeries.reset()
  }

  return {
    calculateVOMax,
    averageObservedHR,
    maxObservedHR,
    reset
  }
}

export { createVoMax }
