'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This models the flywheel with all of its attributes, which we can also test for being powered

  All times and distances are defined as being before the beginning of the flank, as RowingEngine's metrics
  solely depend on times and angular positions before the flank (as they are to be certain to belong to a specific
  drive or recovery phase).

  Please note: The array contains a buffer of flankLenght measured currentDt's, BEFORE they are actually processed

  Please note2: This implements Linear regression to obtain the drag factor. We deliberatly DO NOT include the flank data
  as we don't know wether they will belong to a Drive or Recovery phase. So we include things which we know for certain that
  are part of a specific phase, i.e. dirtyDataPoints[flankLength], which will be eliminated from the flank

  The calculation of angular velocity and acceleration is based on Quadratic Regression, as the second derivative tends to be
  quite fragile when small errors are thrown in the mix. The math behind this approach can be found in https://physics.info/motion-equations/
  which is intended for simple linear motion, but the formula are identical when applied to angular distances, velocities and
  accelerations.
*/

import loglevel from 'loglevel'
import { createStreamFilter } from './utils/StreamFilter.js'
import { createOLSLinearSeries } from './utils/OLSLinearSeries.js'
import { createTSQuadraticSeries } from './utils/FullTSQuadraticSeries.js'
import { createWeighedSeries } from './utils/WeighedSeries.js'

const log = loglevel.getLogger('RowingEngine')

function createFlywheel (rowerSettings) {
  const angularDisplacementPerImpulse = (2.0 * Math.PI) / rowerSettings.numOfImpulsesPerRevolution
  const flankLength = rowerSettings.flankLength
  const minimumDragFactorSamples = Math.floor(rowerSettings.minimumRecoveryTime / rowerSettings.maximumTimeBetweenImpulses)
  const minumumTorqueBeforeStroke = rowerSettings.minumumForceBeforeStroke * (rowerSettings.sprocketRadius / 100)
  const currentDt = createStreamFilter(rowerSettings.smoothing, rowerSettings.maximumTimeBetweenImpulses)
  const _deltaTime = createOLSLinearSeries(flankLength)
  const _angularDistance = createTSQuadraticSeries(flankLength)
  const _angularVelocityMatrix = []
  const _angularAccelerationMatrix = []
  const drag = createStreamFilter(rowerSettings.dragFactorSmoothing, (rowerSettings.dragFactor / 1000000))
  const recoveryDeltaTime = createOLSLinearSeries()
  const strokedetectionMinimalGoodnessOfFit = rowerSettings.minimumStrokeQuality
  const minumumRecoverySlope = createStreamFilter(rowerSettings.dragFactorSmoothing, rowerSettings.minumumRecoverySlope)
  let _deltaTimeBeforeFlank
  let _angularVelocityAtBeginFlank
  let _angularVelocityBeforeFlank
  let _angularAccelerationAtBeginFlank
  let _angularAccelerationBeforeFlank
  let _torqueAtBeginFlank
  let _torqueBeforeFlank
  let inRecoveryPhase
  let maintainMetrics
  let totalNumberOfImpulses
  let totalTimeSpinning
  let currentCleanTime
  let currentRawTime
  let currentAngularDistance
  reset()

  function pushValue (dataPoint) {
    if (isNaN(dataPoint) || dataPoint < 0 || dataPoint > rowerSettings.maximumStrokeTimeBeforePause) {
      // This typicaly happends after a pause, we need to fix this as it throws off all time calculations
      log.debug(`*** WARNING: currentDt of ${dataPoint} sec isn't between 0 and maximumStrokeTimeBeforePause (${rowerSettings.maximumStrokeTimeBeforePause} sec)`)
      dataPoint = currentDt.clean()
    }

    if (dataPoint > rowerSettings.maximumTimeBetweenImpulses && maintainMetrics) {
      // This shouldn't happen, but let's log it to clarify there is some issue going on here
      log.debug(`*** WARNING: currentDt of ${dataPoint} sec is above maximumTimeBetweenImpulses (${rowerSettings.maximumTimeBetweenImpulses} sec)`)
    }

    if (dataPoint < rowerSettings.minimumTimeBetweenImpulses && maintainMetrics) {
      // This shouldn't happen, but let's log it to clarify there is some issue going on here
      log.debug(`*** WARNING: currentDt of ${dataPoint} sec is below minimumTimeBetweenImpulses (${rowerSettings.minimumTimeBetweenImpulses} sec)`)
    }

    currentDt.push(dataPoint)

    if (maintainMetrics && (_deltaTime.length() >= flankLength)) {
      // If we maintain metrics, update the angular position, spinning time of the flywheel and the associated metrics,
      // Also we nend feed the Drag calculation. We need to do this, BEFORE the array shifts, as the valueAtSeriesBeginvalue
      // value before the shift is certain to be part of a specific rowing phase (i.e. Drive or Recovery), once the buffer is filled completely
      totalNumberOfImpulses += 1
      _deltaTimeBeforeFlank = _deltaTime.yAtSeriesBegin()
      totalTimeSpinning += _deltaTimeBeforeFlank
      _angularVelocityBeforeFlank = _angularVelocityAtBeginFlank
      _angularAccelerationBeforeFlank = _angularAccelerationAtBeginFlank
      _torqueBeforeFlank = _torqueAtBeginFlank

      // Feed the drag calculation,  as we didn't reset the Semaphore in the previous cycle based on the current flank
      if (inRecoveryPhase) {
        recoveryDeltaTime.push(totalTimeSpinning, _deltaTimeBeforeFlank)
      }
    } else {
      _deltaTimeBeforeFlank = 0
      _angularVelocityBeforeFlank = 0
      _angularAccelerationBeforeFlank = 0
      _torqueBeforeFlank = 0
    }

    // Let's feed the stroke detection algorithm
    // Please note that deltaTime MUST use dirty data to be ale to use the OLS algorithms effictively (Otherwise the Goodness of Fit can't be used as a filter!)
    currentRawTime += currentDt.raw()
    currentAngularDistance += angularDisplacementPerImpulse
    _deltaTime.push(currentRawTime, currentDt.raw())

    // Next are the metrics that are needed for more advanced metrics, like the foce curve
    currentCleanTime += currentDt.clean()
    _angularDistance.push(currentCleanTime, currentAngularDistance)

    // Let's update the matrix and  calculate the angular velocity and acceleration
    if (_angularVelocityMatrix.length >= flankLength) {
      // The angularVelocityMatrix has reached its maximum length
      _angularVelocityMatrix.shift()
      _angularAccelerationMatrix.shift()
    }

    // Let's make room for a new set of values for angular velocity and acceleration
    _angularVelocityMatrix[_angularVelocityMatrix.length] = createWeighedSeries()
    _angularAccelerationMatrix[_angularAccelerationMatrix.length] = createWeighedSeries()

    let i = 0
    const goodnessOfFit = _angularDistance.goodnessOfFit()

    while (i < _angularVelocityMatrix.length) {
      _angularVelocityMatrix[i].push(_angularDistance.firstDerivativeAtPosition(i), goodnessOfFit)
      _angularAccelerationMatrix[i].push(_angularDistance.secondDerivativeAtPosition(i), goodnessOfFit)
      i++
    }

    _angularVelocityAtBeginFlank = _angularVelocityMatrix[0].weighedAverage()
    _angularAccelerationAtBeginFlank = _angularAccelerationMatrix[0].weighedAverage()

    // And finally calculate the torque
    _torqueAtBeginFlank = (rowerSettings.flywheelInertia * _angularAccelerationAtBeginFlank + drag.clean() * Math.pow(_angularVelocityAtBeginFlank, 2))
  }

  function maintainStateOnly () {
    maintainMetrics = false
  }

  function maintainStateAndMetrics () {
    maintainMetrics = true
  }

  function markRecoveryPhaseStart () {
    inRecoveryPhase = true
    recoveryDeltaTime.reset()
  }

  function markRecoveryPhaseCompleted () {
    // Completion of the recovery phase
    inRecoveryPhase = false

    // Calculation of the drag-factor
    if (rowerSettings.autoAdjustDragFactor && recoveryDeltaTime.length() > minimumDragFactorSamples && recoveryDeltaTime.slope() > 0 && (!drag.reliable() || recoveryDeltaTime.goodnessOfFit() >= rowerSettings.minimumDragQuality)) {
      drag.push(slopeToDrag(recoveryDeltaTime.slope()))
      log.debug(`*** Calculated drag factor: ${(slopeToDrag(recoveryDeltaTime.slope()) * 1000000).toFixed(4)}, no. samples: ${recoveryDeltaTime.length()}, Goodness of Fit: ${recoveryDeltaTime.goodnessOfFit().toFixed(4)}`)
      if (rowerSettings.autoAdjustRecoverySlope) {
        // We are allowed to autoadjust stroke detection slope as well, so let's do that
        minumumRecoverySlope.push((1 - rowerSettings.autoAdjustRecoverySlopeMargin) * recoveryDeltaTime.slope())
        log.debug(`*** Calculated recovery slope: ${recoveryDeltaTime.slope().toFixed(6)}, Goodness of Fit: ${recoveryDeltaTime.goodnessOfFit().toFixed(4)}`)
      } else {
        // We aren't allowed to adjust the slope, let's report the slope to help help the user configure it
        log.debug(`*** Calculated recovery slope: ${recoveryDeltaTime.slope().toFixed(6)}, Goodness of Fit: ${recoveryDeltaTime.goodnessOfFit().toFixed(4)}, not used as autoAdjustRecoverySlope isn't set to true`)
      }
    } else {
      if (!rowerSettings.autoAdjustDragFactor) {
        // autoAdjustDampingConstant = false, thus the update is skipped, but let's log the dragfactor anyway
        log.debug(`*** Calculated drag factor: ${(slopeToDrag(recoveryDeltaTime.slope()) * 1000000).toFixed(4)}, slope: ${recoveryDeltaTime.slope().toFixed(8)}, not used because autoAdjustDragFactor is not true`)
      } else {
        log.debug(`*** Calculated drag factor: ${(slopeToDrag(recoveryDeltaTime.slope()) * 1000000).toFixed(4)}, not used because reliability was too low. no. samples: ${recoveryDeltaTime.length()}, fit: ${recoveryDeltaTime.goodnessOfFit().toFixed(4)}`)
      }
    }
  }

  function spinningTime () {
    // This function returns the time the flywheel is spinning in seconds BEFORE the beginning of the flank
    return totalTimeSpinning
  }

  function deltaTime () {
    return _deltaTimeBeforeFlank
  }

  function angularPosition () {
    // This function returns the absolute angular position of the flywheel in Radians BEFORE the beginning of the flank
    return totalNumberOfImpulses * angularDisplacementPerImpulse
  }

  function angularVelocity () {
    // This function returns the angular velocity of the flywheel in Radians/sec BEFORE the flank
    if (maintainMetrics && (_deltaTime.length() >= flankLength)) {
      return Math.max(0, _angularVelocityBeforeFlank)
    } else {
      return 0
    }
  }

  function angularAcceleration () {
    // This function returns the angular acceleration of the flywheel in Radians/sec^2 BEFORE the flanl
    if (maintainMetrics && (_deltaTime.length() >= flankLength)) {
      return _angularAccelerationBeforeFlank
    } else {
      return 0
    }
  }

  function torque () {
    if (maintainMetrics && (_deltaTime.length() >= flankLength)) {
      return _torqueBeforeFlank
    } else {
      return 0
    }
  }

  function dragFactor () {
    // Ths function returns the current dragfactor of the flywheel
    return drag.clean()
  }

  function isDwelling () {
    // Check if the flywheel is spinning down beyond a recovery phase indicating that the rower has stopped rowing
    // We conclude this based on
    // * A decelerating flywheel as the slope of the CurrentDt's goes up
    // * All CurrentDt's in the flank are above the maximum
    if (_deltaTime.slope() > 0 && deltaTimesAbove(rowerSettings.maximumTimeBetweenImpulses)) {
      return true
    } else {
      return false
    }
  }

  function isAboveMinimumSpeed () {
    // Check if the flywheel has reached its minimum speed. We conclude this based on all CurrentDt's in the flank are below
    // the maximum, indicating a sufficiently fast flywheel
    if (deltaTimesEqualorBelow(rowerSettings.maximumTimeBetweenImpulses)) {
      return true
    } else {
      return false
    }
  }

  function isUnpowered () {
    if (deltaTimeSlopeAbove(minumumRecoverySlope.clean()) && torqueAbsent() && _deltaTime.length() >= flankLength) {
      // We reached the minimum number of increasing currentDt values
      // log.info(`*** INFO: recovery detected based on due to slope exceeding recoveryslope = ${deltaTimeSlopeAbove(minumumRecoverySlope.clean())}, exceeding minumumForceBeforeStroke = ${torqueAbsent()}`)
      return true
    } else {
      return false
    }
  }

  function isPowered () {
    if ((deltaTimeSlopeBelow(minumumRecoverySlope.clean()) && torquePresent()) || _deltaTime.length() < flankLength) {
      return true
    } else {
      return false
    }
  }

  function deltaTimesAbove (threshold) {
    if (_deltaTime.minimumY() >= threshold && _deltaTime.length() >= flankLength) {
      return true
    } else {
      return false
    }
  }

  function deltaTimesEqualorBelow (threshold) {
    if (_deltaTime.maximumY() <= threshold && _deltaTime.length() >= flankLength) {
      return true
    } else {
      return false
    }
  }

  function deltaTimeSlopeBelow (threshold) {
    // This is a typical indication that the flywheel is accelerating. We use the slope of successive currentDt's
    // A (more) negative slope indicates a powered flywheel. When set to 0, it determines whether the DeltaT's are decreasing
    // When set to a value below 0, it will become more stringent. In automatic, a percentage of the current slope (i.e. dragfactor) is used
    if (_deltaTime.slope() < threshold && _deltaTime.length() >= flankLength) {
      return true
    } else {
      return false
    }
  }

  function deltaTimeSlopeAbove (threshold) {
    // This is a typical indication that the flywheel is deccelerating. We use the slope of successive currentDt's
    // A (more) positive slope indicates a unpowered flywheel. When set to 0,  it determines whether the DeltaT's are increasing
    // When set to a value below 0, it will become more stringent as it will detect a power inconsistent with the drag
    // Typically, a percentage of the current slope (i.e. dragfactor) is use
    if (_deltaTime.slope() >= threshold && _deltaTime.goodnessOfFit() >= strokedetectionMinimalGoodnessOfFit && _deltaTime.length() >= flankLength) {
      return true
    } else {
      return false
    }
  }

  function torquePresent () {
    // This is a typical indication that the flywheel is decelerating which might work on some machines: successive currentDt's are increasing
    if (_torqueAtBeginFlank > minumumTorqueBeforeStroke) {
      return true
    } else {
      return false
    }
  }

  function torqueAbsent () {
    // This is a typical indication that the flywheel is Accelerating which might work on some machines: successive currentDt's are decreasing
    if (_torqueAtBeginFlank < minumumTorqueBeforeStroke) {
      return true
    } else {
      return false
    }
  }

  function slopeToDrag (slope) {
    return ((slope * rowerSettings.flywheelInertia) / angularDisplacementPerImpulse)
  }

  function reset () {
    maintainMetrics = false
    inRecoveryPhase = false
    drag.reset()
    recoveryDeltaTime.reset()
    _deltaTime.reset()
    _angularDistance.reset()
    totalNumberOfImpulses = 0
    totalTimeSpinning = 0
    currentCleanTime = 0
    currentRawTime = 0
    currentAngularDistance = 0
    _deltaTime.push(0, 0)
    _angularDistance.push(0, 0)
    _deltaTimeBeforeFlank = 0
    _angularVelocityBeforeFlank = 0
    _angularAccelerationBeforeFlank = 0
    _torqueAtBeginFlank = 0
    _torqueBeforeFlank = 0
  }

  return {
    pushValue,
    maintainStateOnly,
    maintainStateAndMetrics,
    markRecoveryPhaseStart,
    markRecoveryPhaseCompleted,
    spinningTime,
    deltaTime,
    angularPosition,
    angularVelocity,
    angularAcceleration,
    torque,
    dragFactor,
    isDwelling,
    isAboveMinimumSpeed,
    isUnpowered,
    isPowered,
    reset
  }
}

export { createFlywheel }
