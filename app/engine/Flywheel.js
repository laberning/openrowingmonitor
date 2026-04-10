'use strict'
/**
 * @copyright [OpenRowingMonitor]{@link https://github.com/JaapvanEkris/openrowingmonitor}
 *
 * @file This models the flywheel with all of its attributes, which we can also test for being powered
 *
 * All times and distances are defined as being before the beginning of the flank, as RowingEngine's metrics
 * solely depend on times and angular positions before the flank (as they are to be certain to belong to a specific
 * drive or recovery phase).
 *
 * The calculation of angular velocity and acceleration is based on regression analysis, as the second derivative tends to be
 * quite fragile when small errors are thrown in the mix. The physics behind this approach can be found in https://physics.info/motion-equations/
 * which is intended for simple linear motion, but the formula are identical when applied to angular distances, velocities and
 * accelerations.
 * @see {@link See also https://github.com/JaapvanEkris/openrowingmonitor/blob/main/docs/physics_openrowingmonitor.md#determining-the-angular-velocity-and-angular-acceleration-of-the-flywheel|this approach}
 *
 * Please note: The array contains a buffer of flankLenght measured currentDt's, BEFORE they are actually processed
 *
 * Please note2: This implements Linear regression to obtain the drag factor. We deliberatly DO NOT include the flank data
 * as we don't know wether they will belong to a Drive or Recovery phase. So we include things which we know for certain that
 * are part of a specific phase, i.e. dirtyDataPoints[flankLength], which will be eliminated from the flank
 */
import loglevel from 'loglevel'
import { createCyclicErrorFilter } from './utils/CyclicErrorFilter.js'
import { createTSLinearSeries } from './utils/TSLinearSeries.js'
import { createWeighedSeries } from './utils/WeighedSeries.js'
import { createMovingRegressor } from './utils/MovingWindowRegressor.js'

const log = loglevel.getLogger('RowingEngine')

/**
 * @param {object} rowerSettings - The rower settings configuration object
 * @param {integer} rowerSettings.numOfImpulsesPerRevolution - Number of impulses per flywheel revolution
 * @param {integer} rowerSettings.flankLength - Length of the flank used
 * @param {float} rowerSettings.minimumRecoveryTime - Minimum time a recovery should last (seconds)
 * @param {float} rowerSettings.maximumStrokeTimeBeforePause - Minimum time that has to pass after the last drive for a pause to kick in (seconds)
 * @param {float} rowerSettings.flywheelInertia - Inertia of the flywheel
 * @param {float} rowerSettings.dragFactor - (initial) Dragfactor
 * @param {boolean} rowerSettings.autoAdjustDragFactor - Indicates if the Flywheel.js is allowed to automatically adjust dragfactor (false turns the filter off)
 * @param {float} rowerSettings.minimumDragQuality - Minimum Goodness Of Fit before the calculated dragfactor is accepted
 * @param {integer} rowerSettings.dragFactorSmoothing - Number of recoveries to be weighed in the current dragfactor
 * @param {boolean} rowerSettings.autoAdjustRecoverySlope - Allow OpenRowingMonitor to adjust the recoverySlope based on the previous recoveries (and thus dragfactor)
 * @param {float} rowerSettings.minimumRecoverySlope - (initial) recpvery slope
 * @param {float} rowerSettings.autoAdjustRecoverySlopeMargin - Margin to be maintained for the automatically adjusted recovery slope
 * @param {float} rowerSettings.minimumStrokeQuality - Minimum Goodness Of Fit for a slope to be considered reliable for stroke detection
 * @param {float} rowerSettings.sprocketRadius - Radius of the driving sprocket (centimeters)
 * @param {float} rowerSettings.minimumForceBeforeStroke - Minimum force for the flywheel to be considered powered (Newton)
 * @param {float} rowerSettings.systematicErrorAgressiveness - Agressiveness of the systematic error correction algorithm (0 turns the filter off)
 * @param {float} rowerSettings.minimumTimeBetweenImpulses - minimum expected time between impulses (in seconds)
 * @param {float} rowerSettings.maximumTimeBetweenImpulses - maximum expected time between impulses (in seconds)
 */
export function createFlywheel (rowerSettings) {
  const angularDisplacementPerImpulse = (2.0 * Math.PI) / rowerSettings.numOfImpulsesPerRevolution
  const flankLength = rowerSettings.flankLength
  const minimumDragFactorSamples = Math.floor(rowerSettings.minimumRecoveryTime / rowerSettings.maximumTimeBetweenImpulses)
  const minimumAngularVelocity = angularDisplacementPerImpulse / rowerSettings.maximumTimeBetweenImpulses
  const minimumTorqueBeforeStroke = rowerSettings.minimumForceBeforeStroke * (rowerSettings.sprocketRadius / 100)
  const _angularDistance = createMovingRegressor(flankLength)
  const _deltaTime = createTSLinearSeries(flankLength)
  const drag = createWeighedSeries(rowerSettings.dragFactorSmoothing, (rowerSettings.dragFactor / 1000000))
  const recoveryDeltaTime = createTSLinearSeries()
  const cyclicErrorFilter = createCyclicErrorFilter(rowerSettings, recoveryDeltaTime)
  const strokedetectionMinimalGoodnessOfFit = rowerSettings.minimumStrokeQuality
  const minimumRecoverySlope = createWeighedSeries(rowerSettings.dragFactorSmoothing, rowerSettings.minimumRecoverySlope)
  let rawTime = 0
  let rawNumberOfImpulses = 0
  let totalTimeSpinning = 0
  let totalNumberOfImpulses = 0
  let _totalWork = 0
  let _deltaTimeBeforeFlank = {}
  let _angularVelocityAtBeginFlank
  let _angularVelocityBeforeFlank
  let _angularAccelerationAtBeginFlank
  let _angularAccelerationBeforeFlank
  let _torqueAtBeginFlank
  let _torqueBeforeFlank
  let inRecoveryPhase
  let maintainMetrics
  reset()

  /**
   * @param {float} dataPoint - The lenght of the impuls (currentDt) in seconds
   * @description This function is called from Rower.js each time the sensor detected an impulse. It transforms this (via the buffers) into a robust flywheel position, speed and acceleration.
   * It also calculates dragfactor and provides the indicators for stroke detection.
   */
  /* eslint-disable max-statements -- we need to maintain a lot of metrics in the main loop, nothing we can do about that */
  function pushValue (dataPoint) {
    if (isNaN(dataPoint) || dataPoint < 0 || dataPoint > rowerSettings.maximumStrokeTimeBeforePause) {
      // This typicaly happends after a pause, we need to fix this as it throws off all time calculations
      log.debug(`*** WARNING: currentDt of ${dataPoint} sec isn't between 0 and maximumStrokeTimeBeforePause (${rowerSettings.maximumStrokeTimeBeforePause} sec), value skipped`)
      return
    }

    if (dataPoint > rowerSettings.maximumTimeBetweenImpulses && maintainMetrics) {
      // This shouldn't happen, but let's log it to clarify there is some issue going on here
      log.debug(`*** WARNING: currentDt of ${dataPoint} sec is above maximumTimeBetweenImpulses (${rowerSettings.maximumTimeBetweenImpulses} sec)`)
    }

    if (dataPoint < rowerSettings.minimumTimeBetweenImpulses) {
      if (_deltaTime.length() >= flankLength && maintainMetrics) {
        // We are in a normal operational mode, so this shouldn't happen, but let's log it to clarify there is some issue going on here, but accept the value as the TS estimator can handle it
        log.debug(`*** WARNING: currentDt of ${dataPoint} sec is below minimumTimeBetweenImpulses (${rowerSettings.minimumTimeBetweenImpulses} sec)`)
      } else {
        // This is probably due to the start-up noise of a slow but accelerating flywheel as the flink isn't filled or we aren't maintaining metrics
        log.debug(`*** WARNING: currentDt of ${dataPoint} sec is below minimumTimeBetweenImpulses (${rowerSettings.minimumTimeBetweenImpulses} sec) in a startup phase, value skipped, consider udjusting the gpio debounce filter`)
        return
      }
    }

    if (maintainMetrics && (_deltaTime.length() >= flankLength)) {
      // If we maintain metrics, update the angular position, spinning time of the flywheel and the associated metrics,
      // Also we nend feed the Drag calculation. We need to do this, BEFORE the array shifts, as the valueAtSeriesBeginvalue
      // value before the shift is certain to be part of a specific rowing phase (i.e. Drive or Recovery), once the buffer is filled completely
      totalNumberOfImpulses += 1

      _deltaTimeBeforeFlank = cyclicErrorFilter.atSeriesBegin()
      totalTimeSpinning += _deltaTimeBeforeFlank.clean
      _angularVelocityBeforeFlank = _angularVelocityAtBeginFlank
      _angularAccelerationBeforeFlank = _angularAccelerationAtBeginFlank
      // As drag is recalculated at the begin of the drive, we need to recalculate the torque
      _torqueBeforeFlank = (rowerSettings.flywheelInertia * _angularAccelerationBeforeFlank + drag.weighedAverage() * Math.pow(_angularVelocityBeforeFlank, 2))

      if (inRecoveryPhase) {
        // Feed the drag calculation, as we didn't reset the Semaphore in the previous cycle based on the current flank
        recoveryDeltaTime.push(totalTimeSpinning, _deltaTimeBeforeFlank.clean, _deltaTimeBeforeFlank.goodnessOfFit)
        // Feed the systematic error filter buffer
        cyclicErrorFilter.recordRawDatapoint(totalNumberOfImpulses, totalTimeSpinning, _deltaTimeBeforeFlank.raw)
      } else {
        // Accumulate the energy total as we are in the drive phase
        _totalWork += Math.max(_torqueBeforeFlank * angularDisplacementPerImpulse, 0)
        // Process a value in the systematic error filter buffer. We need to do this slowly to prevent radical changes which might disturbe the force curve etc.
        cyclicErrorFilter.processNextRawDatapoint()
      }
    } else {
      _deltaTimeBeforeFlank.clean = 0
      _angularVelocityBeforeFlank = 0
      _angularAccelerationBeforeFlank = 0
      _torqueBeforeFlank = 0
    }

    const cleanCurrentDt = cyclicErrorFilter.applyFilter(dataPoint, totalNumberOfImpulses + flankLength)
    rawTime += cleanCurrentDt.clean
    rawNumberOfImpulses++
    const currentAngularDistance = rawNumberOfImpulses * angularDisplacementPerImpulse

    // Let's feed the stroke detection algorithm
    _deltaTime.push(rawTime, cleanCurrentDt.clean, cleanCurrentDt.goodnessOfFit)

    // Calculate the metrics that are needed for more advanced metrics, like the foce curve
    _angularDistance.push(rawTime, currentAngularDistance, cleanCurrentDt.goodnessOfFit)
    _angularVelocityAtBeginFlank = _angularDistance.firstDerivative(0)
    _angularAccelerationAtBeginFlank = _angularDistance.secondDerivative(0)
    _torqueAtBeginFlank = (rowerSettings.flywheelInertia * _angularAccelerationAtBeginFlank + drag.weighedAverage() * Math.pow(_angularVelocityAtBeginFlank, 2))
  }
  /* eslint-enable max-statements */

  /**
   * @description Function to handle the start of a pause/stop based on a trigger from Rower.js
   */
  function maintainStateOnly () {
    maintainMetrics = false
  }

  /**
   * @description Function to handle the end of a pause/stop based on a trigger from Rower.js
   */
  function maintainStateAndMetrics () {
    maintainMetrics = true
    cyclicErrorFilter.resetFilterConfiguration()
  }

  /**
   * @description Function to handle the start of the recovery phase based on a trigger from Rower.js
   */
  function markRecoveryPhaseStart () {
    inRecoveryPhase = true
    recoveryDeltaTime.reset()
    cyclicErrorFilter.clearDatapointBuffer()
  }

  /**
   * @description Function to handle the completion of the recovery phase based on a trigger from Rower.js
   */
  function markRecoveryPhaseCompleted () {
    inRecoveryPhase = false

    // Calculation of the drag-factor
    if (rowerSettings.autoAdjustDragFactor && recoveryDeltaTime.length() > minimumDragFactorSamples && recoveryDeltaTime.slope() > 0 && (!drag.reliable() || recoveryDeltaTime.goodnessOfFit() >= rowerSettings.minimumDragQuality)) {
      drag.push(slopeToDrag(recoveryDeltaTime.slope()), recoveryDeltaTime.goodnessOfFit())

      log.debug(`*** Calculated drag factor: ${(slopeToDrag(recoveryDeltaTime.slope()) * 1000000).toFixed(4)}, no. samples: ${recoveryDeltaTime.length()}, Goodness of Fit: ${recoveryDeltaTime.goodnessOfFit().toFixed(4)}`)
      if (rowerSettings.autoAdjustRecoverySlope) {
        // We are allowed to autoadjust stroke detection slope as well, so let's do that
        minimumRecoverySlope.push((1 - rowerSettings.autoAdjustRecoverySlopeMargin) * recoveryDeltaTime.slope(), recoveryDeltaTime.goodnessOfFit())
        log.info(`*** Calculated recovery slope: ${recoveryDeltaTime.slope().toFixed(6)}, Goodness of Fit: ${recoveryDeltaTime.goodnessOfFit().toFixed(4)}`)
      } else {
        // We aren't allowed to adjust the slope, let's report the slope to help help the user configure it
        log.info(`*** Calculated recovery slope: ${recoveryDeltaTime.slope().toFixed(6)}, Goodness of Fit: ${recoveryDeltaTime.goodnessOfFit().toFixed(4)}, not used as autoAdjustRecoverySlope isn't set to true`)
      }
    } else {
      // As the drag calculation is considered unreliable, we must skip updating the systematic error filter that depends on it
      if (!rowerSettings.autoAdjustDragFactor) {
        // autoAdjustDampingConstant = false, thus the update is skipped, but let's log the dragfactor anyway
        log.debug(`*** Calculated drag factor: ${(slopeToDrag(recoveryDeltaTime.slope()) * 1000000).toFixed(4)}, slope: ${recoveryDeltaTime.slope().toFixed(8)}, not used because autoAdjustDragFactor is not true`)
      } else {
        log.debug(`*** Calculated drag factor: ${(slopeToDrag(recoveryDeltaTime.slope()) * 1000000).toFixed(4)}, not used because reliability was too low. no. samples: ${recoveryDeltaTime.length()}, fit: ${recoveryDeltaTime.goodnessOfFit().toFixed(4)}`)
        cyclicErrorFilter.forceFlushDatapointBuffer()
      }
    }
  }

  /**
   * @returns {float} the time the flywheel is spinning in seconds BEFORE the beginning of the flank
   */
  function spinningTime () {
    return totalTimeSpinning
  }

  /**
   * @returns {float} the total energy produced onto the flywheel in Joules BEFORE the beginning of the flank
   */
  function totalWork () {
    return Math.max(_totalWork, 0)
  }

  /**
   * @returns {float} the current DeltaTime BEFORE the flank
   */
  function deltaTime () {
    return _deltaTimeBeforeFlank.clean
  }

  /**
   * @returns {float} the absolute angular position of the flywheel in Radians BEFORE the beginning of the flank
   * Please observe that the first datapoint shouldstart at 0
   */
  function angularPosition () {
    return (Math.max(totalNumberOfImpulses, 0) * angularDisplacementPerImpulse)
  }

  /**
   * @returns {float} the angular velocity of the flywheel in Radians/sec BEFORE the flank
   */
  function angularVelocity () {
    if (maintainMetrics && (_deltaTime.length() >= flankLength)) {
      return Math.max(0, _angularVelocityBeforeFlank)
    } else {
      return 0
    }
  }

  /**
   * @returns {float} the angular acceleration of the flywheel in Radians/sec^2 BEFORE the flank
   */
  function angularAcceleration () {
    if (maintainMetrics && (_deltaTime.length() >= flankLength)) {
      return _angularAccelerationBeforeFlank
    } else {
      return 0
    }
  }

  /**
   * @returns {float} the torque on the flywheel in N/m BEFORE the flank
   */
  function torque () {
    if (maintainMetrics && (_deltaTime.length() >= flankLength)) {
      return _torqueBeforeFlank
    } else {
      return 0
    }
  }

  /**
   * @returns {float} the current dragfactor of the flywheel
   */
  function dragFactor () {
    return drag.weighedAverage()
  }

  /**
   * @returns {boolean} whether the dragfactor is considered reliable, based on measurements instead of a default value
   * We can't use reliable() as a filter on the dragFactor() function as Rower.js always needs some dragfactor for most calculations
   */
  function dragFactorIsReliable () {
    if (rowerSettings.autoAdjustDragFactor) {
      return drag.reliable()
    } else {
      return true
    }
  }

  /**
   * @returns {boolean} indicator of the flywheel is spinning down beyond a recovery phase indicating that the rower has stopped rowing
   * We conclude this based on
   * - The angular velocity at the begin of the flank is above the minimum angular velocity (dependent on maximumTimeBetweenImpulses)
   * - The entire flank has a positive trend, i.e. the flywheel is decelerating consistent with the dragforce being present
   */
  function isDwelling () {
    if (_angularVelocityAtBeginFlank < minimumAngularVelocity && deltaTimeSlopeAbove(minimumRecoverySlope.weighedAverage())) {
      return true
    } else {
      return false
    }
  }

  /**
   * @returns {boolean} indicator if the flywheel has reached its minimum speed, and that it isn't flywheel noise. We conclude this based on the first element in the flank
   * as this angular velocity is created by all curves that are in that flank and having an acceleration in the rest of the flank
   */
  function isAboveMinimumSpeed () {
    if ((_angularVelocityAtBeginFlank >= minimumAngularVelocity) && (_deltaTime.Y.atSeriesBegin() <= rowerSettings.maximumTimeBetweenImpulses) && (_deltaTime.Y.atSeriesBegin() > rowerSettings.minimumTimeBetweenImpulses)) {
      return true
    } else {
      return false
    }
  }

  /**
   * @returns {boolean} indicator if the flywheel is unpowered
   * We consider the flywheel unpowered when there is an acceleration consistent with the drag being the only forces AND no torque being seen
   * As in the first stroke drag is unreliable for automatic drag updating machines, torque can't be used when drag indicates it is unreliable for these machines
   */
  function isUnpowered () {
    if (deltaTimeSlopeAbove(minimumRecoverySlope.weighedAverage()) && (torqueAbsent() || (rowerSettings.autoAdjustDragFactor && !drag.reliable()))) {
      return true
    } else {
      return false
    }
  }

  /**
   * @returns {boolean} indicator if the flywheel is powered
   */
  function isPowered () {
    if (deltaTimeSlopeBelow(minimumRecoverySlope.weighedAverage()) && torquePresent()) {
      return true
    } else {
      return false
    }
  }

  /**
   * @param {float} threshold - Maximum slope
   * @returns {boolean} indicator if the currentDt slope is below the specified slope
   * This is a typical indication that the flywheel is accelerating. We use the slope of successive currentDt's
   * A (more) negative slope indicates a powered flywheel. When set to 0, it determines whether the DeltaT's are decreasing
   * When set to a value below 0, it will become more stringent. In automatic, a percentage of the current slope (i.e. dragfactor) is used
   * Please note, as this acceleration isn't linear, _deltaTime.goodnessOfFit() will not be good by definition, so we need omit it
   */
  function deltaTimeSlopeBelow (threshold) {
    if (_deltaTime.slope() < threshold && _deltaTime.length() >= flankLength) {
      return true
    } else {
      return false
    }
  }

  /**
   * @param {float} threshold - Maximum slope
   * @returns {boolean} indicator if the currentDt slope is above the specified slope
   * This is a typical indication that the flywheel is deccelerating. We use the slope of successive currentDt's
   * A (more) positive slope indicates a unpowered flywheel. When set to 0,  it determines whether the DeltaT's are increasing
   * When set to a value below 0, it will become more stringent as it will detect a power inconsistent with the drag
   * Typically, a percentage of the current slope (i.e. dragfactor) is use
   */
  function deltaTimeSlopeAbove (threshold) {
    if (_deltaTime.slope() >= threshold && _deltaTime.goodnessOfFit() >= strokedetectionMinimalGoodnessOfFit && _deltaTime.length() >= flankLength) {
      return true
    } else {
      return false
    }
  }

  /**
   * @returns {boolean} indicator if there is a torque present at the beginning of the flank above the minimum torque
   * This is a typical indication that the flywheel is accelerating: the torque is above a certain threshold (so a force is present on the handle)
   */
  function torquePresent () {
    if (_torqueAtBeginFlank >= minimumTorqueBeforeStroke) {
      return true
    } else {
      return false
    }
  }

  /**
   * @returns {boolean} indicator if there is a torque present at the beginning of the flank below the minimum torque
   * This is a typical indication that the flywheel is decelerating: the torque is below a certain threshold (so a force is absent on the handle)
   * We need to consider the situation rowerSettings.autoAdjustDragFactor && !drag.reliable() as a high default dragfactor (as set via config) blocks the
   * detection of the first recovery based on Torque, and thus the calculation of the true dragfactor in that setting.
   * This let the recovery detection fall back onto slope-based stroke detection only for the first stroke (until drag is calculated reliably)
   */
  function torqueAbsent () {
    if (_torqueAtBeginFlank < minimumTorqueBeforeStroke) {
      return true
    } else {
      return false
    }
  }

  /**
   * @param {float} slope - Recovery slope to be converted
   * @returns {float} Dragfactor to be used in all calculations
   * @description Helper function to convert a recovery slope into a dragfactor
   */
  function slopeToDrag (slope) {
    return ((slope * rowerSettings.flywheelInertia) / angularDisplacementPerImpulse)
  }

  /**
   * @description This function is used for clearing all data, returning the flywheel.js to its initial state
   */
  function reset () {
    maintainMetrics = false
    inRecoveryPhase = false
    rawTime = 0
    rawNumberOfImpulses = 0
    totalTimeSpinning = 0
    totalNumberOfImpulses = -1
    _totalWork = 0
    drag.reset()
    cyclicErrorFilter.reset()
    cyclicErrorFilter.applyFilter(0, flankLength - 1)
    recoveryDeltaTime.reset()
    _deltaTime.reset()
    _angularDistance.reset()
    _deltaTime.push(0, 0)
    _angularDistance.push(0, 0)
    _deltaTimeBeforeFlank.clean = 0
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
    totalWork,
    deltaTime,
    angularPosition,
    angularVelocity,
    angularAcceleration,
    torque,
    dragFactor,
    dragFactorIsReliable,
    isDwelling,
    isAboveMinimumSpeed,
    isUnpowered,
    isPowered,
    reset
  }
}
