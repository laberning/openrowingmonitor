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
const log = loglevel.getLogger('RowingEngine')

function createRowingStatistics (config, session) {
  const numOfDataPointsForAveraging = config.numOfPhasesForAveragingScreenData
  const webUpdateInterval = Math.min(config.webUpdateInterval, 2000)
  const peripheralUpdateInterval = Math.min(config.peripheralUpdateInterval, 1000)
  const emitter = new EventEmitter()
  const rower = createRower(config.rowerSettings)
  const minimumStrokeTime = config.rowerSettings.minimumRecoveryTime + config.rowerSettings.minimumDriveTime
  const maximumStrokeTime = config.rowerSettings.maximumStrokeTimeBeforePause
  const cycleDuration = createStreamFilter(numOfDataPointsForAveraging, (minimumStrokeTime + maximumStrokeTime) / 2)
  const cycleDistance = createStreamFilter(numOfDataPointsForAveraging, 0)
  const cyclePower = createStreamFilter(numOfDataPointsForAveraging, 0)
  const cycleLinearVelocity = createStreamFilter(numOfDataPointsForAveraging, 0)
  let sessionStatus = 'WaitingForStart'
  let heartrateResetTimer
  let totalLinearDistance = 0.0
  let totalMovingTime = 0
  let totalNumberOfStrokes = 0
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
  let heartrateBatteryLevel = 0
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
      case (sessionStatus === 'Rowing' && lastStrokeState === 'Recovery' && rower.strokeState() === 'Drive' && intervalTargetReached()):
        updateContinousMetrics()
        updateCycleMetrics()
        handleRecoveryEnd()
        emitMetrics('intervalTargetReached')
        break
      case (sessionStatus === 'Rowing' && lastStrokeState === 'Recovery' && rower.strokeState() === 'Drive'):
        updateContinousMetrics()
        updateCycleMetrics()
        handleRecoveryEnd()
        emitMetrics('recoveryFinished')
        break
      case (sessionStatus === 'Rowing' && lastStrokeState === 'Drive' && rower.strokeState() === 'Recovery' && intervalTargetReached()):
        updateContinousMetrics()
        updateCycleMetrics()
        handleDriveEnd()
        emitMetrics('intervalTargetReached')
        break
      case (sessionStatus === 'Rowing' && lastStrokeState === 'Drive' && rower.strokeState() === 'Recovery'):
        updateContinousMetrics()
        updateCycleMetrics()
        handleDriveEnd()
        emitMetrics('driveFinished')
        break
      case (sessionStatus === 'Rowing' && intervalTargetReached()):
        updateContinousMetrics()
        emitMetrics('intervalTargetReached')
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
    totalNumberOfStrokes = -1
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
    recoveryDuration.push(rower.recoveryDuration())
    dragFactor = rower.recoveryDragFactor()

    // based on: http://eodg.atm.ox.ac.uk/user/dudhia/rowing/physics/ergometer.html#section11
    strokeCalories = (4 * cyclePower.clean() + 350) * (cycleDuration.clean()) / 4200
    strokeWork = cyclePower.clean() * cycleDuration.clean()
    const totalCalories = calories.yAtSeriesEnd() + strokeCalories
    calories.push(totalMovingTime, totalCalories)
  }

  // initiated when a new heart rate value is received from heart rate sensor
  function handleHeartrateMeasurement (value) {
    // set the heart rate to zero if we did not receive a value for some time
    if (heartrateResetTimer)clearInterval(heartrateResetTimer)
    heartrateResetTimer = setTimeout(() => {
      heartrate = 0
      heartrateBatteryLevel = 0
    }, 6000)
    heartrate = value.heartrate
    heartrateBatteryLevel = value.batteryLevel
  }

  function intervalTargetReached () {
    if ((session.targetDistance > 0 && rower.totalLinearDistanceSinceStart() >= session.targetDistance) || (session.targetTime > 0 && rower.totalMovingTimeSinceStart() >= session.targetTime)) {
      return true
    } else {
      return false
    }
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
    const cyclePace = cycleLinearVelocity.clean() !== 0 && cycleLinearVelocity.raw() > 0 && sessionStatus === 'Rowing' ? (500.0 / cycleLinearVelocity.clean()) : Infinity
    return {
      sessiontype: session.targetDistance > 0 ? 'Distance' : (session.targetTime > 0 ? 'Time' : 'JustRow'),
      sessionStatus,
      strokeState: rower.strokeState(),
      totalMovingTime: totalMovingTime > 0 ? totalMovingTime : 0,
      totalMovingTimeFormatted: session.targetTime > 0 ? secondsToTimeString(Math.round(Math.max(session.targetTime - totalMovingTime, 0))) : secondsToTimeString(Math.round(totalMovingTime)),
      totalNumberOfStrokes: totalNumberOfStrokes > 0 ? totalNumberOfStrokes : 0,
      totalLinearDistance: totalLinearDistance > 0 ? totalLinearDistance : 0, // meters
      totalLinearDistanceFormatted: session.targetDistance > 0 ? Math.max(session.targetDistance - totalLinearDistance, 0) : totalLinearDistance,
      strokeCalories: strokeCalories > 0 ? strokeCalories : 0, // kCal
      strokeWork: strokeWork > 0 ? strokeWork : 0, // Joules
      totalCalories: calories.yAtSeriesEnd() > 0 ? calories.yAtSeriesEnd() : 0, // kcal
      totalCaloriesPerMinute: totalMovingTime > 60 ? caloriesPerPeriod(totalMovingTime - 60, totalMovingTime) : caloriesPerPeriod(0, 60),
      totalCaloriesPerHour: totalMovingTime > 3600 ? caloriesPerPeriod(totalMovingTime - 3600, totalMovingTime) : caloriesPerPeriod(0, 3600),
      cycleDuration: cycleDuration.clean() > minimumStrokeTime && cycleDuration.clean() < maximumStrokeTime && cycleLinearVelocity.raw() > 0 && sessionStatus === 'Rowing' ? cycleDuration.clean() : NaN, // seconds
      cycleStrokeRate: cycleDuration.clean() > minimumStrokeTime && cycleLinearVelocity.raw() > 0 && sessionStatus === 'Rowing' ? (60.0 / cycleDuration.clean()) : 0, // strokeRate in SPM
      cycleDistance: cycleDistance.raw() > 0 && cycleLinearVelocity.raw() > 0 && sessionStatus === 'Rowing' ? cycleDistance.clean() : 0, // meters
      cycleLinearVelocity: cycleLinearVelocity.clean() > 0 && cycleLinearVelocity.raw() > 0 && sessionStatus === 'Rowing' ? cycleLinearVelocity.clean() : 0, // m/s
      cyclePace: cycleLinearVelocity.raw() > 0 ? cyclePace : Infinity, // seconds/500m
      cyclePaceFormatted: cycleLinearVelocity.raw() > 0 ? secondsToTimeString(Math.round(cyclePace)) : Infinity,
      cyclePower: cyclePower.clean() > 0 && cycleLinearVelocity.raw() > 0 && sessionStatus === 'Rowing' ? cyclePower.clean() : 0, // watts
      cycleProjectedEndTime: session.targetDistance > 0 ? distanceOverTime.projectY(session.targetDistance) : session.targetTime,
      cycleProjectedEndLinearDistance: session.targetTime > 0 ? distanceOverTime.projectX(session.targetTime) : session.targetDistance,
      driveDuration: driveDuration.clean() >= config.rowerSettings.minimumDriveTime && totalNumberOfStrokes > 0 && sessionStatus === 'Rowing' ? driveDuration.clean() : NaN, // seconds
      driveLength: driveLength.clean() > 0 && sessionStatus === 'Rowing' ? driveLength.clean() : NaN, // meters of chain movement
      driveDistance: driveDistance.clean() >= 0 && sessionStatus === 'Rowing' ? driveDistance.clean() : NaN, // meters
      driveAverageHandleForce: driveAverageHandleForce.clean() > 0 && sessionStatus === 'Rowing' ? driveAverageHandleForce.clean() : NaN,
      drivePeakHandleForce: drivePeakHandleForce.clean() > 0 && sessionStatus === 'Rowing' ? drivePeakHandleForce.clean() : NaN,
      driveHandleForceCurve: drivePeakHandleForce.clean() > 0 && sessionStatus === 'Rowing' ? driveHandleForceCurve.lastCompleteCurve() : [NaN],
      driveHandleVelocityCurve: drivePeakHandleForce.clean() > 0 && sessionStatus === 'Rowing' ? driveHandleVelocityCurve.lastCompleteCurve() : [NaN],
      driveHandlePowerCurve: drivePeakHandleForce.clean() > 0 && sessionStatus === 'Rowing' ? driveHandlePowerCurve.lastCompleteCurve() : [NaN],
      recoveryDuration: recoveryDuration.clean() >= config.rowerSettings.minimumRecoveryTime && totalNumberOfStrokes > 0 && sessionStatus === 'Rowing' ? recoveryDuration.clean() : NaN, // seconds
      dragFactor: dragFactor > 0 ? dragFactor : config.rowerSettings.dragFactor, // Dragfactor
      instantPower: instantPower > 0 && rower.strokeState() === 'Drive' ? instantPower : 0,
      heartrate: heartrate > 30 ? heartrate : undefined,
      heartrateBatteryLevel: heartrateBatteryLevel > 0 ? heartrateBatteryLevel : undefined // BE AWARE, changing undefined to NaN kills the GUI!!!
    }
  }

  // converts a timeStamp in seconds to a human readable hh:mm:ss format
  function secondsToTimeString (secondsTimeStamp) {
    if (secondsTimeStamp === Infinity) return '∞'
    const hours = Math.floor(secondsTimeStamp / 60 / 60)
    const minutes = Math.floor(secondsTimeStamp / 60) - (hours * 60)
    const seconds = Math.floor(secondsTimeStamp % 60)
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
  }

  function caloriesPerPeriod (periodBegin, periodEnd) {
    const beginCalories = calories.projectX(periodBegin)
    const endCalories = calories.projectX(periodEnd)
    return (endCalories - beginCalories)
  }

  return Object.assign(emitter, {
    handleHeartrateMeasurement,
    handleRotationImpulse,
    pause: pauseTraining,
    stop: stopTraining,
    resume: allowResumeTraining,
    reset: resetTraining
  })
}

export { createRowingStatistics }
