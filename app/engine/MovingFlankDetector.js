'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  A Detector used to test for up-going and down-going flanks

  Please note: The array contains flankLength + 1 measured currentDt's, thus flankLength number of flanks between them
  They are arranged that dataPoints[0] is the youngest, and dataPoints[flankLength] the oldest
*/
import loglevel from 'loglevel'
import { createMovingAverager } from './averager/MovingAverager.js'
const log = loglevel.getLogger('RowingEngine')

function createMovingFlankDetector (rowerSettings) {
  const angularDisplacementPerImpulse = (2.0 * Math.PI) / rowerSettings.numOfImpulsesPerRevolution
  const dirtyDataPoints = new Array(rowerSettings.flankLength + 1)
  dirtyDataPoints.fill(rowerSettings.maximumTimeBetweenImpulses)
  const cleanDataPoints = new Array(rowerSettings.flankLength + 1)
  cleanDataPoints.fill(rowerSettings.maximumTimeBetweenImpulses)
  const angularVelocity = new Array(rowerSettings.flankLength + 1)
  angularVelocity.fill(angularDisplacementPerImpulse / rowerSettings.minimumTimeBetweenImpulses)
  const angularAcceleration = new Array(rowerSettings.flankLength + 1)
  angularAcceleration.fill(0.1)
  const movingAverage = createMovingAverager(rowerSettings.smoothing, rowerSettings.maximumTimeBetweenImpulses)
  let numberOfSequentialCorrections = 0
  const maxNumberOfSequentialCorrections = (rowerSettings.smoothing >= 2 ? rowerSettings.smoothing : 2)

  function pushValue (dataPoint) {
    // add the new dataPoint to the array, we have to move data points starting at the oldest ones
    let i = rowerSettings.flankLength
    while (i > 0) {
      // older data points are moved toward the higher numbers
      dirtyDataPoints[i] = dirtyDataPoints[i - 1]
      cleanDataPoints[i] = cleanDataPoints[i - 1]
      angularVelocity[i] = angularVelocity[i - 1]
      angularAcceleration[i] = angularAcceleration[i - 1]
      i = i - 1
    }
    dirtyDataPoints[0] = dataPoint

    // reduce noise in the measurements by applying some sanity checks
    // noise filter on the value of dataPoint: it should be within sane levels and should not deviate too much from the previous reading
    if (dataPoint < rowerSettings.minimumTimeBetweenImpulses || dataPoint > rowerSettings.maximumTimeBetweenImpulses) {
      // impulseTime is outside plausible ranges, so we assume it is close to the previous clean one
      log.debug(`noise filter corrected currentDt, ${dataPoint} was not between minimumTimeBetweenImpulses and maximumTimeBetweenImpulses, changed to ${cleanDataPoints[1]}`)
      dataPoint = cleanDataPoints[1]
    }

    // lets test if pushing this value would fit the curve we are looking for
    movingAverage.pushValue(dataPoint)

    if (movingAverage.getAverage() > (rowerSettings.maximumDownwardChange * cleanDataPoints[1]) && movingAverage.getAverage() < (rowerSettings.maximumUpwardChange * cleanDataPoints[1])) {
      numberOfSequentialCorrections = 0
    } else {
      // impulses are outside plausible ranges
      if (numberOfSequentialCorrections <= maxNumberOfSequentialCorrections) {
        // We haven't made too many corrections, so we assume it is close to the previous one
        log.debug(`noise filter corrected currentDt, ${dataPoint} was too much of an accelleration/decelleration with respect to ${movingAverage.getAverage()}, changed to previous value, ${cleanDataPoints[1]}`)
        movingAverage.replaceLastPushedValue(cleanDataPoints[1])
      } else {
        // We made too many corrections (typically, one currentDt is too long, the next is to short or vice versa), let's allow the algorithm to pick it up otherwise we might get stuck
        log.debug(`noise filter wanted to corrected currentDt (${dataPoint} sec), but it had already made ${numberOfSequentialCorrections} corrections, filter temporarily disabled`)
      }
      numberOfSequentialCorrections = numberOfSequentialCorrections + 1
    }

    // determine the moving average, to reduce noise
    cleanDataPoints[0] = movingAverage.getAverage()

    // determine the derived data
    if (cleanDataPoints[0] > 0) {
      angularVelocity[0] = angularDisplacementPerImpulse / cleanDataPoints[0]
      angularAcceleration[0] = (angularVelocity[0] - angularVelocity[1]) / cleanDataPoints[0]
    } else {
      log.error('Impuls of 0 seconds encountered, this should not be possible (division by 0 prevented)')
      angularVelocity[0] = 0
      angularAcceleration[0] = 0
    }
  }

  function isFlywheelUnpowered () {
    let numberOfErrors = 0
    if (rowerSettings.naturalDeceleration < 0) {
      // A valid natural deceleration of the flywheel has been provided, this has to be maintained for a flank length
      // to count as an indication for an unpowered flywheel
      // Please note that angularAcceleration[] contains flank-information already, so we need to check from
      // rowerSettings.flankLength -1 until 0 flanks
      let i = rowerSettings.flankLength - 1
      while (i >= 0) {
        if (angularAcceleration[i] > rowerSettings.naturalDeceleration) {
          // There seems to be some power present, so we detected an error
          numberOfErrors = numberOfErrors + 1
        }
        i = i - 1
      }
    } else {
      // No valid natural deceleration has been provided, we rely on pure deceleration for recovery detection
      let i = rowerSettings.flankLength
      while (i > 0) {
        if (cleanDataPoints[i] >= cleanDataPoints[i - 1]) {
          // Oldest interval (dataPoints[i]) is larger than the younger one (datapoint[i-1], as the distance is
          // fixed, we are accelerating
          numberOfErrors = numberOfErrors + 1
        }
        i = i - 1
      }
    }
    if (numberOfErrors > rowerSettings.numberOfErrorsAllowed) {
      return false
    } else {
      return true
    }
  }

  function isFlywheelPowered () {
    let numberOfErrors = 0
    if (rowerSettings.naturalDeceleration < 0) {
      // A valid natural deceleration of the flywheel has been provided, this has to be consistently encountered
      // for a flank length to count as an indication of a powered flywheel
      // Please note that angularAcceleration[] contains flank-information already, so we need to check from
      // rowerSettings.flankLength -1 until 0 flanks
      let i = rowerSettings.flankLength - 1
      while (i >= 0) {
        if (angularAcceleration[i] < rowerSettings.naturalDeceleration) {
          // Some deceleration is below the natural deceleration, so we detected an error
          numberOfErrors = numberOfErrors + 1
        }
        i = i - 1
      }
    } else {
      // No valid natural deceleration of the flywheel has been provided, we rely on pure acceleration for stroke detection
      let i = rowerSettings.flankLength
      while (i > 1) {
        if (cleanDataPoints[i] < cleanDataPoints[i - 1]) {
          // Oldest interval (dataPoints[i]) is shorter than the younger one (datapoint[i-1], as the distance is fixed, we
          // discovered a deceleration
          numberOfErrors = numberOfErrors + 1
        }
        i = i - 1
      }
      if (cleanDataPoints[1] <= cleanDataPoints[0]) {
        // We handle the last measurement more specifically: at least the youngest measurement must be really accelerating
        // This prevents when the currentDt "flatlines" (i.e. error correction kicks in) a ghost-stroke is detected
        numberOfErrors = numberOfErrors + 1
      }
    }
    if (numberOfErrors > rowerSettings.numberOfErrorsAllowed) {
      return false
    } else {
      return true
    }
  }

  function timeToBeginOfFlank () {
    // We expect the curve to bend between dirtyDataPoints[rowerSettings.flankLength] and dirtyDataPoints[rowerSettings.flankLength+1],
    // as acceleration FOLLOWS the start of the pulling the handle, we assume it must have started before that
    let i = rowerSettings.flankLength
    let total = 0.0
    while (i >= 0) {
      total += dirtyDataPoints[i]
      i = i - 1
    }
    return total
  }

  function noImpulsesToBeginFlank () {
    return rowerSettings.flankLength
  }

  function impulseLengthAtBeginFlank () {
    // As this is fed into the speed calculation where small changes have big effects, and we typically use it when
    // the curve is in a plateau, we return the cleaned data and not the dirty data
    // Regardless of the way to determine the acceleration, cleanDataPoints[rowerSettings.flankLength] is always the
    // impulse at the beginning of the flank being investigated
    return cleanDataPoints[rowerSettings.flankLength]
  }

  function accelerationAtBeginOfFlank () {
    return angularAcceleration[rowerSettings.flankLength - 1]
  }

  return {
    pushValue,
    isFlywheelUnpowered,
    isFlywheelPowered,
    timeToBeginOfFlank,
    noImpulsesToBeginFlank,
    impulseLengthAtBeginFlank,
    accelerationAtBeginOfFlank
  }
}

export { createMovingFlankDetector }
