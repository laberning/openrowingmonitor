'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This Module calculates the training specific metrics.
*/
import { EventEmitter } from 'events'
import { createRower } from './Rower.js'
import { createOLSLinearSeries } from './utils/OLSLinearSeries.js'
import { createStreamFilter } from './utils/StreamFilter.js'
import { createCurveAligner } from './utils/CurveAligner.js'

import loglevel from 'loglevel'
import { secondsToTimeString } from '../tools/Helper.js'
const log = loglevel.getLogger('RowingEngine')

function createRowingStatistics (config) {
  const numOfDataPointsForAveraging = config.numOfPhasesForAveragingScreenData
  const webUpdateInterval = config.webUpdateInterval
  const peripheralUpdateInterval = config.peripheralUpdateInterval
  const emitter = new EventEmitter()
  const rower = createRower(config.rowerSettings)
  const minimumStrokeTime = config.rowerSettings.minimumRecoveryTime + config.rowerSettings.minimumDriveTime
  const maximumStrokeTime = config.rowerSettings.maximumStrokeTimeBeforePause
  const cycleDuration = createStreamFilter(numOfDataPointsForAveraging, (minimumStrokeTime + maximumStrokeTime) / 2)
  const cycleDistance = createStreamFilter(numOfDataPointsForAveraging, 0)
  const cyclePower = createStreamFilter(numOfDataPointsForAveraging, 0)
  const cycleLinearVelocity = createStreamFilter(numOfDataPointsForAveraging, 0)
  let sessionStatus = 'WaitingForStart'
  let intervalSettings = []
  let currentIntervalNumber = -1
  let intervalTargetDistance = 0
  let intervalTargetTime = 0
  let intervalPrevAccumulatedDistance = 0
  let intervalPrevAccumulatedTime = 0
  let heartRateResetTimer
  let totalLinearDistance = 0.0
  let totalMovingTime = 0
  let totalNumberOfStrokes = 0
  let driveLastStartTime = 0
  let strokeCalories = 0
  let strokeWork = 0
  const calories = createOLSLinearSeries()
  const distanceOverTime = createOLSLinearSeries(Math.min(4, numOfDataPointsForAveraging))
  const driveDuration = createStreamFilter(numOfDataPointsForAveraging, config.rowerSettings.minimumDriveTime)
  const driveLength = createStreamFilter(numOfDataPointsForAveraging, 1.1)
  const driveDistance = createStreamFilter(numOfDataPointsForAveraging, 3)
  const recoveryDuration = createStreamFilter(numOfDataPointsForAveraging, config.rowerSettings.minimumRecoveryTime)
  const driveAverageHandleForce = createStreamFilter(numOfDataPointsForAveraging, 0.0)
  const drivePeakHandleForce = createStreamFilter(numOfDataPointsForAveraging, 0.0)
  const driveHandleForceCurve = createCurveAligner(config.rowerSettings.minumumForceBeforeStroke)
  const driveHandleVelocityCurve = createCurveAligner(1.0)
  const driveHandlePowerCurve = createCurveAligner(50)
  let dragFactor = config.rowerSettings.dragFactor
  let heartrate = 0
  let heartRateBatteryLevel = 0
  const postExerciseHR = []
  let instantPower = 0.0
  let lastStrokeState = 'WaitingForDrive'

  // send metrics to the web clients periodically
  setInterval(emitWebMetrics, webUpdateInterval)

  // notify bluetooth peripherall each second (even if data did not change)
  // todo: the FTMS protocol also supports that peripherals deliver a preferred update interval
  // we could respect this and set the update rate accordingly
  setInterval(emitPeripheralMetrics, peripheralUpdateInterval)

  function handleRotationImpulse (currentDt) {
    // Provide the rower with new data
    rower.handleRotationImpulse(currentDt)

    // This is the core of the finite state machine that defines all state transitions
    switch (true) {
      case (sessionStatus === 'WaitingForStart' && rower.strokeState() === 'Drive'):
        sessionStatus = 'Rowing'
        startTraining()
        updateContinousMetrics()
        emitMetrics('recoveryFinished')
        break
      case (sessionStatus === 'Paused' && rower.strokeState() === 'Drive'):
        sessionStatus = 'Rowing'
        resumeTraining()
        updateContinousMetrics()
        emitMetrics('recoveryFinished')
        break
      case (sessionStatus !== 'Stopped' && rower.strokeState() === 'Stopped'):
        sessionStatus = 'Stopped'
        // We need to emit the metrics AFTER the sessionstatus changes to anything other than "Rowing", which forces most merics to zero
        // This is intended behaviour, as the rower/flywheel indicate the rower has stopped somehow
        stopTraining()
        break
      case (sessionStatus === 'Rowing' && rower.strokeState() === 'WaitingForDrive'):
        sessionStatus = 'Paused'
        pauseTraining()
        break
      case (sessionStatus === 'Rowing' && lastStrokeState === 'Recovery' && rower.strokeState() === 'Drive' && isIntervalTargetReached() && isNextIntervalAvailable()):
        updateContinousMetrics()
        updateCycleMetrics()
        handleRecoveryEnd()
        activateNextIntervalParameters()
        emitMetrics('intervalTargetReached')
        break
      case (sessionStatus === 'Rowing' && lastStrokeState === 'Recovery' && rower.strokeState() === 'Drive' && isIntervalTargetReached()):
        updateContinousMetrics()
        updateCycleMetrics()
        handleRecoveryEnd()
        stopTraining()
        break
      case (sessionStatus === 'Rowing' && lastStrokeState === 'Recovery' && rower.strokeState() === 'Drive'):
        updateContinousMetrics()
        updateCycleMetrics()
        handleRecoveryEnd()
        emitMetrics('recoveryFinished')
        break
      case (sessionStatus === 'Rowing' && lastStrokeState === 'Drive' && rower.strokeState() === 'Recovery' && isIntervalTargetReached() && isNextIntervalAvailable()):
        updateContinousMetrics()
        updateCycleMetrics()
        handleDriveEnd()
        activateNextIntervalParameters()
        emitMetrics('intervalTargetReached')
        break
      case (sessionStatus === 'Rowing' && lastStrokeState === 'Drive' && rower.strokeState() === 'Recovery' && isIntervalTargetReached()):
        updateContinousMetrics()
        updateCycleMetrics()
        handleDriveEnd()
        stopTraining()
        break
      case (sessionStatus === 'Rowing' && lastStrokeState === 'Drive' && rower.strokeState() === 'Recovery'):
        updateContinousMetrics()
        updateCycleMetrics()
        handleDriveEnd()
        emitMetrics('driveFinished')
        break
      case (sessionStatus === 'Rowing' && isIntervalTargetReached() && isNextIntervalAvailable()):
        updateContinousMetrics()
        activateNextIntervalParameters()
        emitMetrics('intervalTargetReached')
        break
      case (sessionStatus === 'Rowing' && isIntervalTargetReached()):
        updateContinousMetrics()
        stopTraining()
        break
      case (sessionStatus === 'Rowing'):
        updateContinousMetrics()
        break
      case (sessionStatus === 'Paused'):
        // We are in a paused state, we won't update any metrics
        break
      case (sessionStatus === 'WaitingForStart'):
        // We can't change into the "Rowing" state since we are waiting for a drive phase that didn't come
        break
      case (sessionStatus === 'Stopped'):
        // We are in a stopped state, so we won't update any metrics
        break
      default:
        log.error(`Time: ${rower.totalMovingTimeSinceStart()}, state ${rower.strokeState()} found in the Rowing Statistics, which is not captured by Finite State Machine`)
    }
    lastStrokeState = rower.strokeState()
  }

  function startTraining () {
    rower.allowMovement()
  }

  function allowResumeTraining () {
    rower.allowMovement()
    sessionStatus = 'WaitingForStart'
  }

  function resumeTraining () {
    rower.allowMovement()
  }

  function stopTraining () {
    rower.stopMoving()
    lastStrokeState = 'Stopped'
    // Emitting the metrics BEFORE the sessionstatus changes to anything other than "Rowing" forces most merics to zero
    // As there are more than one way to this method, we FIRST emit the metrics and then set them to zero
    // If they need to be forced to zero (as the flywheel seems to have stopped), this status has to be set before the call
    emitMetrics('rowingStopped')
    sessionStatus = 'Stopped'
    postExerciseHR.splice(0, postExerciseHR.length)
    measureRecoveryHR()
  }

  // clear the metrics in case the user pauses rowing
  function pauseTraining () {
    log.debug('*** Paused rowing ***')
    rower.pauseMoving()
    cycleDuration.reset()
    cycleDistance.reset()
    cyclePower.reset()
    cycleLinearVelocity.reset()
    lastStrokeState = 'WaitingForDrive'
    // We need to emit the metrics BEFORE the sessionstatus changes to anything other than "Rowing", as it forces most merics to zero
    emitMetrics('rowingPaused')
    sessionStatus = 'Paused'
    postExerciseHR.splice(0, postExerciseHR.length)
    measureRecoveryHR()
  }

  function resetTraining () {
    stopTraining()
    rower.reset()
    calories.reset()
    rower.allowMovement()
    totalMovingTime = 0
    totalLinearDistance = 0.0
    intervalSettings = []
    currentIntervalNumber = -1
    intervalTargetDistance = 0
    intervalTargetTime = 0
    intervalPrevAccumulatedDistance = 0
    intervalPrevAccumulatedTime = 0
    totalNumberOfStrokes = -1
    driveLastStartTime = 0
    distanceOverTime.reset()
    driveDuration.reset()
    cycleDuration.reset()
    cycleDistance.reset()
    cyclePower.reset()
    strokeCalories = 0
    strokeWork = 0
    postExerciseHR.splice(0, postExerciseHR.length)
    cycleLinearVelocity.reset()
    lastStrokeState = 'WaitingForDrive'
    emitMetrics('rowingPaused')
    sessionStatus = 'WaitingForStart'
  }

  // initiated when updating key statistics
  function updateContinousMetrics () {
    totalMovingTime = rower.totalMovingTimeSinceStart()
    totalLinearDistance = rower.totalLinearDistanceSinceStart()
    instantPower = rower.instantHandlePower()
  }

  function updateCycleMetrics () {
    distanceOverTime.push(rower.totalMovingTimeSinceStart(), rower.totalLinearDistanceSinceStart())
    if (rower.cycleDuration() < maximumStrokeTime && rower.cycleDuration() > minimumStrokeTime) {
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
    driveDuration.push(rower.driveDuration())
    driveLength.push(rower.driveLength())
    driveDistance.push(rower.driveLinearDistance())
    driveAverageHandleForce.push(rower.driveAverageHandleForce())
    drivePeakHandleForce.push(rower.drivePeakHandleForce())
    driveHandleForceCurve.push(rower.driveHandleForceCurve())
    driveHandleVelocityCurve.push(rower.driveHandleVelocityCurve())
    driveHandlePowerCurve.push(rower.driveHandlePowerCurve())
  }

  // initiated when the stroke state changes
  function handleRecoveryEnd () {
    totalNumberOfStrokes = rower.totalNumberOfStrokes()
    driveLastStartTime = rower.driveLastStartTime()
    recoveryDuration.push(rower.recoveryDuration())
    dragFactor = rower.recoveryDragFactor()

    // based on: http://eodg.atm.ox.ac.uk/user/dudhia/rowing/physics/ergometer.html#section11
    strokeCalories = (4 * cyclePower.clean() + 350) * (cycleDuration.clean()) / 4200
    strokeWork = cyclePower.clean() * cycleDuration.clean()
    const totalCalories = calories.yAtSeriesEnd() + strokeCalories
    calories.push(totalMovingTime, totalCalories)
  }

  function setIntervalParameters (intervalParameters) {
    intervalSettings = intervalParameters
    currentIntervalNumber = -1
    if (intervalSettings.length > 0) {
      log.info(`Workout recieved with ${intervalSettings.length} interval(s)`)
      activateNextIntervalParameters()
    } else {
      // intervalParameters were empty, lets log this odd situation
      log.error('Recieved workout containing no intervals')
    }
  }

  function isIntervalTargetReached () {
    // This tests wether the end of the current interval is reached
    if ((intervalTargetDistance > 0 && rower.totalLinearDistanceSinceStart() >= intervalTargetDistance) || (intervalTargetTime > 0 && rower.totalMovingTimeSinceStart() >= intervalTargetTime)) {
      return true
    } else {
      return false
    }
  }

  function isNextIntervalAvailable () {
    // This function tests whether there is a next interval available
    if (currentIntervalNumber > -1 && intervalSettings.length > 0 && intervalSettings.length > (currentIntervalNumber + 1)) {
      return true
    } else {
      return false
    }
  }

  function activateNextIntervalParameters () {
    if (intervalSettings.length > 0 && intervalSettings.length > (currentIntervalNumber + 1)) {
      // This function sets the interval parameters in absolute distances/times
      // Thus the interval target always is a projected "finishline" from the current position
      intervalPrevAccumulatedTime = rower.totalMovingTimeSinceStart()
      intervalPrevAccumulatedDistance = rower.totalLinearDistanceSinceStart()

      currentIntervalNumber++
      if (intervalSettings[currentIntervalNumber].targetDistance > 0) {
        // A target distance is set
        intervalTargetTime = 0
        intervalTargetDistance = intervalPrevAccumulatedDistance + intervalSettings[currentIntervalNumber].targetDistance
        log.info(`Interval settings for interval ${currentIntervalNumber + 1} of ${intervalSettings.length}: Distance target ${intervalSettings[currentIntervalNumber].targetDistance} meters`)
      } else {
        // A target time is set
        intervalTargetTime = intervalPrevAccumulatedTime + intervalSettings[currentIntervalNumber].targetTime
        intervalTargetDistance = 0
        log.info(`Interval settings for interval ${currentIntervalNumber + 1} of ${intervalSettings.length}: time target ${secondsToTimeString(intervalSettings[currentIntervalNumber].targetTime)} minutes`)
      }
    } else {
      log.error('Interval error: there is no next interval!')
    }
  }

  // initiated when a new heart rate value is received from heart rate sensor
  function handleHeartRateMeasurement (value) {
    // set the heart rate to zero if we did not receive a value for some time
    if (heartRateResetTimer)clearInterval(heartRateResetTimer)
    heartRateResetTimer = setTimeout(() => {
      heartrate = 0
      heartRateBatteryLevel = 0
    }, 6000)
    heartrate = value.heartrate
    heartRateBatteryLevel = value.batteryLevel
  }

  function measureRecoveryHR () {
    // This function is called when the rowing session is stopped. postExerciseHR[0] is the last measured excercise HR
    // Thus postExerciseHR[1] is Recovery HR after 1 min, etc..
    if (heartrate !== undefined && heartrate > config.userSettings.restingHR && sessionStatus !== 'Rowing') {
      log.debug(`*** HRR-${postExerciseHR.length}: ${heartrate}`)
      postExerciseHR.push(heartrate)
      if ((postExerciseHR.length > 1) && (postExerciseHR.length <= 4)) {
        // We skip reporting postExerciseHR[0] and only report measuring postExerciseHR[1], postExerciseHR[2], postExerciseHR[3]
        emitter.emit('HRRecoveryUpdate', postExerciseHR)
      }
      if (postExerciseHR.length < 4) {
        // We haven't got three post-exercise HR measurements yet, let's schedule the next measurement
        setTimeout(measureRecoveryHR, 60000)
      }
    }
  }

  function emitWebMetrics () {
    emitMetrics('webMetricsUpdate')
  }

  function emitPeripheralMetrics () {
    emitMetrics('peripheralMetricsUpdate')
  }

  function emitMetrics (emitType = 'webMetricsUpdate') {
    emitter.emit(emitType, getMetrics())
  }

  function getMetrics () {
    const cyclePace = cycleLinearVelocity.clean() !== 0 && sessionStatus === 'Rowing' ? (500.0 / cycleLinearVelocity.clean()) : Infinity
    return {
      sessiontype: intervalTargetDistance > 0 ? 'Distance' : (intervalTargetTime > 0 ? 'Time' : 'JustRow'),
      sessionStatus,
      strokeState: rower.strokeState(),
      totalMovingTime: totalMovingTime > 0 ? totalMovingTime : 0,
      totalNumberOfStrokes: totalNumberOfStrokes > 0 ? totalNumberOfStrokes : 0,
      totalLinearDistance: totalLinearDistance > 0 ? totalLinearDistance : 0, // meters
      intervalNumber: Math.max(currentIntervalNumber + 1, 0), // Interval number
      intervalMovingTime: totalMovingTime - intervalPrevAccumulatedTime,
      intervalTargetTime: intervalTargetTime > intervalPrevAccumulatedTime ? intervalTargetTime - intervalPrevAccumulatedTime : 0,
      intervalLinearDistance: totalLinearDistance - intervalPrevAccumulatedDistance,
      intervalTargetDistance: intervalTargetDistance > intervalPrevAccumulatedDistance ? intervalTargetDistance - intervalPrevAccumulatedDistance : 0,
      strokeCalories: strokeCalories > 0 ? strokeCalories : 0, // kCal
      strokeWork: strokeWork > 0 ? strokeWork : 0, // Joules
      totalCalories: calories.yAtSeriesEnd() > 0 ? calories.yAtSeriesEnd() : 0, // kcal
      totalCaloriesPerMinute: totalMovingTime > 60 ? caloriesPerPeriod(totalMovingTime - 60, totalMovingTime) : caloriesPerPeriod(0, 60),
      totalCaloriesPerHour: totalMovingTime > 3600 ? caloriesPerPeriod(totalMovingTime - 3600, totalMovingTime) : caloriesPerPeriod(0, 3600),
      cycleDuration: cycleDuration.clean() > minimumStrokeTime && cycleDuration.clean() < maximumStrokeTime && cycleLinearVelocity.raw() > 0 && sessionStatus === 'Rowing' ? cycleDuration.clean() : NaN, // seconds
      cycleStrokeRate: cycleDuration.clean() > minimumStrokeTime && cycleLinearVelocity.raw() > 0 && sessionStatus === 'Rowing' ? (60.0 / cycleDuration.clean()) : 0, // strokeRate in SPM
      cycleDistance: cycleDistance.raw() > 0 && cycleLinearVelocity.raw() > 0 && sessionStatus === 'Rowing' ? cycleDistance.clean() : 0, // meters
      cycleLinearVelocity: cycleLinearVelocity.clean() > 0 && sessionStatus === 'Rowing' ? cycleLinearVelocity.clean() : 0, // m/s
      cyclePace: cycleLinearVelocity.clean() > 0 && sessionStatus === 'Rowing' ? cyclePace : Infinity, // seconds/500m
      cyclePower: cyclePower.clean() > 0 && cycleLinearVelocity.raw() > 0 && sessionStatus === 'Rowing' ? cyclePower.clean() : 0, // watts
      cycleProjectedEndTime: intervalTargetDistance > 0 ? distanceOverTime.projectY(intervalTargetDistance) : intervalTargetTime,
      cycleProjectedEndLinearDistance: intervalTargetTime > 0 ? distanceOverTime.projectX(intervalTargetTime) : intervalTargetDistance,
      driveLastStartTime: driveLastStartTime > 0 ? driveLastStartTime : 0,
      driveDuration: driveDuration.clean() >= config.rowerSettings.minimumDriveTime && totalNumberOfStrokes > 0 && sessionStatus === 'Rowing' ? driveDuration.clean() : NaN, // seconds
      driveLength: driveLength.clean() > 0 && sessionStatus === 'Rowing' ? driveLength.clean() : NaN, // meters of chain movement
      driveDistance: driveDistance.clean() >= 0 && sessionStatus === 'Rowing' ? driveDistance.clean() : NaN, // meters
      driveAverageHandleForce: driveAverageHandleForce.clean() > 0 && sessionStatus === 'Rowing' ? driveAverageHandleForce.clean() : NaN,
      drivePeakHandleForce: drivePeakHandleForce.clean() > 0 && sessionStatus === 'Rowing' ? drivePeakHandleForce.clean() : NaN,
      driveHandleForceCurve: drivePeakHandleForce.clean() > 0 && sessionStatus === 'Rowing' ? driveHandleForceCurve.lastCompleteCurve() : [],
      driveHandleVelocityCurve: drivePeakHandleForce.clean() > 0 && sessionStatus === 'Rowing' ? driveHandleVelocityCurve.lastCompleteCurve() : [],
      driveHandlePowerCurve: drivePeakHandleForce.clean() > 0 && sessionStatus === 'Rowing' ? driveHandlePowerCurve.lastCompleteCurve() : [],
      recoveryDuration: recoveryDuration.clean() >= config.rowerSettings.minimumRecoveryTime && totalNumberOfStrokes > 0 && sessionStatus === 'Rowing' ? recoveryDuration.clean() : NaN, // seconds
      dragFactor: dragFactor > 0 ? dragFactor : config.rowerSettings.dragFactor, // Dragfactor
      instantPower: instantPower > 0 && rower.strokeState() === 'Drive' ? instantPower : 0,
      heartrate: heartrate > 30 ? heartrate : 0,
      heartRateBatteryLevel
    }
  }

  function caloriesPerPeriod (periodBegin, periodEnd) {
    const beginCalories = calories.projectX(periodBegin)
    const endCalories = calories.projectX(periodEnd)
    return (endCalories - beginCalories)
  }

  return Object.assign(emitter, {
    handleHeartRateMeasurement,
    handleRotationImpulse,
    setIntervalParameters,
    pause: pauseTraining,
    stop: stopTraining,
    resume: allowResumeTraining,
    reset: resetTraining
  })
}

export { createRowingStatistics }
