'use strict'
/**
 * @copyright {@link https://github.com/JaapvanEkris/openrowingmonitor|OpenRowingMonitor}
 *
 * @file  This Module creates a persistent, consistent and user presentable set of metrics.
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/blob/main/docs/Architecture.md#rowingstatisticsjs|the architecture description}
 */
import { createRower } from './Rower.js'
import { createWLSLinearSeries } from './utils/WLSLinearSeries.js'
import { createStreamFilter } from './utils/StreamFilter.js'
import { createCurveAligner } from './utils/CurveAligner.js'

import loglevel from 'loglevel'
const log = loglevel.getLogger('RowingEngine')

export function createRowingStatistics (config) {
  const numOfDataPointsForAveraging = config.numOfPhasesForAveragingScreenData // Used for metrics updated twice per cycle
  const halfNumOfDataPointsForAveraging = Math.round(numOfDataPointsForAveraging / 2) // Used for metrics updated twice per cycle
  const rower = createRower(config.rowerSettings)
  const minimumStrokeTime = config.rowerSettings.minimumRecoveryTime + config.rowerSettings.minimumDriveTime
  const maximumStrokeTime = config.rowerSettings.maximumStrokeTimeBeforePause
  const cycleDuration = createStreamFilter(numOfDataPointsForAveraging, undefined)
  const cycleDistance = createStreamFilter(numOfDataPointsForAveraging, undefined)
  const cyclePower = createStreamFilter(numOfDataPointsForAveraging, undefined)
  const cycleLinearVelocity = createStreamFilter(numOfDataPointsForAveraging, undefined)
  let metricsContext
  let totalLinearDistance = 0.0
  let totalMovingTime = 0
  let totalNumberOfStrokes = -1
  let driveLastStartTime = 0
  let strokeCalories = 0
  let totalCalories = 0
  let strokeWork = 0
  let totalWork = 0
  const calories = createWLSLinearSeries()
  const driveDuration = createStreamFilter(halfNumOfDataPointsForAveraging, undefined)
  const driveLength = createStreamFilter(halfNumOfDataPointsForAveraging, undefined)
  const driveDistance = createStreamFilter(halfNumOfDataPointsForAveraging, undefined)
  const recoveryDuration = createStreamFilter(halfNumOfDataPointsForAveraging, undefined)
  const driveAverageHandleForce = createStreamFilter(halfNumOfDataPointsForAveraging, undefined)
  const drivePeakHandleForce = createStreamFilter(halfNumOfDataPointsForAveraging, undefined)
  const drivePeakHandleForceNormalizedPosition = createStreamFilter(halfNumOfDataPointsForAveraging, undefined)
  const driveHandleForceCurve = createCurveAligner(config.rowerSettings.minimumForceBeforeStroke)
  const driveHandleVelocityCurve = createCurveAligner(1.0)
  const driveHandlePowerCurve = createCurveAligner(50)
  let dragFactor
  let instantPower = 0.0
  let lastStrokeState = 'WaitingForDrive'

  resetMetricsContext()

  function allowStartOrResumeTraining () {
    rower.allowMovement()
  }

  function stopTraining () {
    rower.stopMoving()
    lastStrokeState = 'Stopped'
  }

  // clear the metrics in case the user pauses rowing
  function pauseTraining () {
    rower.pauseMoving()
    metricsContext.isMoving = false
    cycleDuration.reset()
    cycleDistance.reset()
    cyclePower.reset()
    cycleLinearVelocity.reset()
    lastStrokeState = 'WaitingForDrive'
  }

  function resetTraining () {
    stopTraining()
    rower.reset()
    calories.reset()
    rower.allowMovement()
    totalMovingTime = 0
    totalLinearDistance = 0.0
    totalNumberOfStrokes = -1
    driveLastStartTime = 0
    driveDuration.reset()
    recoveryDuration.reset()
    driveLength.reset()
    driveDistance.reset()
    driveAverageHandleForce.reset()
    drivePeakHandleForce.reset()
    drivePeakHandleForceNormalizedPosition.reset()
    driveHandleForceCurve.reset()
    driveHandleVelocityCurve.reset()
    driveHandlePowerCurve.reset()
    cycleDuration.reset()
    cycleDistance.reset()
    cyclePower.reset()
    totalCalories = 0
    strokeCalories = 0
    totalWork = 0
    strokeWork = 0
    dragFactor = undefined
    cycleLinearVelocity.reset()
    lastStrokeState = 'WaitingForDrive'
    resetMetricsContext()
  }

  /**
   * Calculates the linear metrics based on a currentDt
   *
   * @param {float} time between two impulses in seconds
   *
   * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/blob/new-ble-api/docs/Architecture.md#rowingstatisticsjs|the architecture description}
  */
  function handleRotationImpulse (currentDt) {
    // Provide the rower with new data
    rower.handleRotationImpulse(currentDt)

    resetMetricsContext()

    // This is the core of the finite state machine that defines all state transitions
    switch (true) {
      case (lastStrokeState === 'WaitingForDrive' && rower.strokeState() === 'Drive'):
        updateContinousMetrics()
        metricsContext.isMoving = true
        metricsContext.isDriveStart = true
        break
      case (lastStrokeState === 'WaitingForDrive' && rower.strokeState() === 'Recovery'):
        updateContinousMetrics()
        metricsContext.isMoving = true
        metricsContext.isRecoveryStart = true
        break
      case (lastStrokeState === 'WaitingForDrive'):
        // We can't change into the "Rowing" state since we are waiting for a drive phase that didn't come
        metricsContext.isMoving = false // This has the disired side-effect that the many of the reported instanous metrics are zero-ed
        break
      case (lastStrokeState !== 'Stopped' && rower.strokeState() === 'Stopped'):
        metricsContext.isMoving = false // This has the disired side-effect that the many of the reported instanous metrics are zero-ed
        // This is intended behaviour, as the rower/flywheel indicate the rower has stopped somehow. So zero-ing all metrics fits that state better then a last know good state
        break
      case (lastStrokeState === 'Stopped'):
        metricsContext.isMoving = false
        // We are in a stopped state, so we won't update any metrics
        // This is a permanent state, regardless of current action of the flywheel
        break
      case (lastStrokeState !== 'WaitingForDrive' && rower.strokeState() === 'WaitingForDrive'):
        metricsContext.isMoving = false // This has the desired side-effect that the many of the reported instanous metrics are zero-ed
        // Please note, the sessionmanager will trigger a pause based on this condition
        break
      // From this point on, we can be certain that the LastStrokeState and rower.strokeState() aren't 'Stopped' or 'WaitingForDrive', so we are processing an active stroke
      case (lastStrokeState === 'Recovery' && rower.strokeState() === 'Drive'):
        updateContinousMetrics()
        updateCycleMetrics()
        handleRecoveryEnd()
        metricsContext.isMoving = true
        metricsContext.isDriveStart = true
        break
      case (lastStrokeState === 'Recovery' && rower.strokeState() === 'Recovery'):
        updateContinousMetrics()
        metricsContext.isMoving = true
        break
      case (lastStrokeState === 'Drive' && rower.strokeState() === 'Recovery'):
        updateContinousMetrics()
        updateCycleMetrics()
        handleDriveEnd()
        metricsContext.isMoving = true
        metricsContext.isRecoveryStart = true
        break
      case (lastStrokeState === 'Drive' && rower.strokeState() === 'Drive'):
        updateContinousMetrics()
        metricsContext.isMoving = true
        break
      default:
        log.error(`Time: ${rower.totalMovingTimeSinceStart()}, combination of last stroke state ${lastStrokeState} and state ${rower.strokeState()} found in the Rowing Statistics, which is not captured by Finite State Machine`)
    }
    lastStrokeState = rower.strokeState()
    return allMetrics()
  }

  // Basic metricContext structure
  function resetMetricsContext () {
    metricsContext = {
      isMoving: false,
      isDriveStart: false,
      isRecoveryStart: false
    }
  }

  // initiated when updating key statistics
  function updateContinousMetrics () {
    totalMovingTime = Math.max(totalMovingTime, rower.totalMovingTimeSinceStart())
    totalLinearDistance = Math.max(totalLinearDistance, rower.totalLinearDistanceSinceStart())
    instantPower = rower.instantHandlePower()
    totalWork = Math.max(totalWork, rower.totalFlywheelWorkSinceStart())
    totalCalories = ((4 * totalWork) + (350 * totalMovingTime)) / 4200
  }

  function updateCycleMetrics () {
    if (rower.cycleDuration() !== undefined && rower.cycleDuration() < maximumStrokeTime && rower.cycleDuration() > minimumStrokeTime && totalNumberOfStrokes > 0) {
      // stroke duration has to be credible to be accepted
      cycleDuration.push(rower.cycleDuration())
      cycleDistance.push(rower.cycleLinearDistance())
      cycleLinearVelocity.push(rower.cycleLinearVelocity())
      cyclePower.push(rower.cyclePower())
    } else {
      log.debug(`*** Stroke duration of ${rower.cycleDuration()} sec is considered unreliable, skipped update cycle statistics`)
    }
  }

  function handleDriveEnd () {
    if (rower.driveDuration() !== undefined) {
      driveDuration.push(rower.driveDuration())
      driveLength.push(rower.driveLength())
      driveDistance.push(rower.driveLinearDistance())
      driveAverageHandleForce.push(rower.driveAverageHandleForce())
      drivePeakHandleForce.push(rower.drivePeakHandleForce())
      drivePeakHandleForceNormalizedPosition.push(rower.drivePeakHandleForceNormalizedPosition())
      driveHandleForceCurve.push(rower.driveHandleForceCurve())
      driveHandleVelocityCurve.push(rower.driveHandleVelocityCurve())
      driveHandlePowerCurve.push(rower.driveHandlePowerCurve())
      // based on: http://eodg.atm.ox.ac.uk/user/dudhia/rowing/physics/ergometer.html#section11
      strokeWork = rower.driveFlywheelWork()
      strokeCalories = ((4 * rower.driveFlywheelWork()) + (350 * cycleDuration.clean())) / 4200
      if (cyclePower.reliable() && cycleDuration.reliable()) {
        calories.push(totalMovingTime, totalCalories, 1)
      }
    }
  }

  // initiated when the stroke state changes
  function handleRecoveryEnd () {
    totalNumberOfStrokes = rower.totalNumberOfStrokes()
    driveLastStartTime = rower.driveLastStartTime()
    if (rower.recoveryDuration() !== undefined) {
      recoveryDuration.push(rower.recoveryDuration())
    }
    if (rower.recoveryDuration() !== undefined && rower.recoveryDragFactor() !== undefined) {
      dragFactor = rower.recoveryDragFactor()
    } else {
      dragFactor = undefined
    }

    if (cyclePower.reliable() && cycleDuration.reliable()) {
      calories.push(totalMovingTime, totalCalories, 1)
    }
  }

  /* eslint-disable complexity -- As this is the central metric being delivered to all consumers, who need to accept this at face value, we need a lot of defensive coding */
  function allMetrics () {
    const cyclePace = cycleLinearVelocity.clean() !== 0 && cycleLinearVelocity.raw() > 0 && metricsContext.isMoving === true ? (500.0 / cycleLinearVelocity.clean()) : Infinity
    return {
      metricsContext,
      strokeState: rower.strokeState(),
      totalMovingTime: totalMovingTime > 0 ? totalMovingTime : 0,
      totalNumberOfStrokes: totalNumberOfStrokes > 0 ? totalNumberOfStrokes : 0,
      totalLinearDistance: totalLinearDistance > 0 ? totalLinearDistance : 0, // meters
      totalWork: totalWork > 0 ? totalWork : 0, // Joules
      strokeCalories: strokeCalories > 0 && metricsContext.isMoving === true ? strokeCalories : undefined, // kCal
      strokeWork: strokeWork > 0 && metricsContext.isMoving === true ? strokeWork : undefined, // Joules
      totalCalories: totalCalories > 0 ? totalCalories : 0, // kcal
      totalCaloriesPerMinute: totalMovingTime > 60 ? caloriesPerPeriod(totalMovingTime - 60, totalMovingTime) : caloriesPerPeriod(0, 60),
      totalCaloriesPerHour: totalMovingTime > 3600 ? caloriesPerPeriod(totalMovingTime - 3600, totalMovingTime) : caloriesPerPeriod(0, 3600),
      cycleDuration: cycleDuration.reliable() && cycleDuration.clean() > minimumStrokeTime && cycleDuration.clean() < maximumStrokeTime && cycleLinearVelocity.raw() > 0 && totalNumberOfStrokes > 0 && metricsContext.isMoving === true ? cycleDuration.clean() : undefined, // seconds
      cycleStrokeRate: cycleDuration.reliable() && cycleDuration.clean() > minimumStrokeTime && cycleDuration.clean() < maximumStrokeTime && cycleLinearVelocity.raw() > 0 && totalNumberOfStrokes > 0 && metricsContext.isMoving === true ? (60.0 / cycleDuration.clean()) : undefined, // strokeRate in SPM
      cycleDistance: cycleDistance.reliable() && cycleDistance.raw() > 0 && cycleLinearVelocity.raw() > 0 && metricsContext.isMoving === true ? cycleDistance.clean() : undefined, // meters
      cycleLinearVelocity: cycleLinearVelocity.reliable() && cycleLinearVelocity.clean() > 0 && cycleLinearVelocity.raw() > 0 && metricsContext.isMoving === true ? cycleLinearVelocity.clean() : undefined, // m/s
      cyclePace: cycleLinearVelocity.reliable() && cycleLinearVelocity.clean() > 0 && metricsContext.isMoving === true ? cyclePace : Infinity, // seconds/500m
      cyclePower: cyclePower.reliable() && cyclePower.clean() > 0 && cycleLinearVelocity.raw() > 0 && metricsContext.isMoving === true ? cyclePower.clean() : undefined, // watts
      driveLastStartTime: driveLastStartTime > 0 ? driveLastStartTime : 0,
      driveDuration: driveDuration.reliable() && driveDuration.clean() >= config.rowerSettings.minimumDriveTime && totalNumberOfStrokes > 0 && metricsContext.isMoving === true ? driveDuration.clean() : undefined, // seconds
      driveLength: driveLength.reliable() && driveLength.clean() > 0 && metricsContext.isMoving === true ? driveLength.clean() : undefined, // meters of chain movement
      driveDistance: driveDistance.reliable() && driveDistance.clean() >= 0 && metricsContext.isMoving === true ? driveDistance.clean() : undefined, // meters
      driveAverageHandleForce: driveAverageHandleForce.clean() > 0 && metricsContext.isMoving === true ? driveAverageHandleForce.clean() : undefined,
      drivePeakHandleForce: drivePeakHandleForce.clean() > 0 && metricsContext.isMoving === true ? drivePeakHandleForce.clean() : undefined,
      drivePeakHandleForceNormalizedPosition: drivePeakHandleForceNormalizedPosition.clean() > 0 && metricsContext.isMoving === true ? drivePeakHandleForceNormalizedPosition.clean() : undefined,
      driveHandleForceCurve: drivePeakHandleForce.clean() > 0 && metricsContext.isMoving === true ? driveHandleForceCurve.lastCompleteCurve() : [],
      driveHandleVelocityCurve: drivePeakHandleForce.clean() > 0 && metricsContext.isMoving === true ? driveHandleVelocityCurve.lastCompleteCurve() : [],
      driveHandlePowerCurve: drivePeakHandleForce.clean() > 0 && metricsContext.isMoving === true ? driveHandlePowerCurve.lastCompleteCurve() : [],
      recoveryDuration: recoveryDuration.reliable() && recoveryDuration.clean() >= config.rowerSettings.minimumRecoveryTime && totalNumberOfStrokes > 0 && metricsContext.isMoving === true ? recoveryDuration.clean() : undefined, // seconds
      dragFactor: dragFactor > 0 ? dragFactor : undefined, // Dragfactor
      instantPower: instantPower > 0 && rower.strokeState() === 'Drive' ? instantPower : 0
    }
  }
  /* eslint-enable complexity */

  function caloriesPerPeriod (periodBegin, periodEnd) {
    const beginCalories = calories.projectX(periodBegin)
    const endCalories = calories.projectX(periodEnd)
    return (endCalories - beginCalories)
  }

  return {
    handleRotationImpulse,
    allowStartOrResumeTraining,
    stopTraining,
    pauseTraining,
    resetTraining,
    getMetrics: allMetrics
  }
}
