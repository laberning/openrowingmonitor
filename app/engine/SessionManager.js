'use strict'
/**
 * @copyright [OpenRowingMonitor]{@link https://github.com/JaapvanEkris/openrowingmonitor}
 *
 * @file This Module calculates the workout, interval and split specific metrics, as well as guards their boundaries
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/blob/main/docs/Architecture.md#sessionmanagerjs|the description}
 */
/* eslint-disable max-lines -- This handles quite a complex state machine with three levels of workout segments, not much we can do about it */
import { EventEmitter } from 'events'
import { createRowingStatistics } from './RowingStatistics.js'
import { createWorkoutSegment } from './utils/workoutSegment.js'

import loglevel from 'loglevel'
const log = loglevel.getLogger('RowingEngine')

export function createSessionManager (config) {
  const emitter = new EventEmitter()
  const rowingStatistics = createRowingStatistics(config)
  const session = createWorkoutSegment(config)
  const interval = createWorkoutSegment(config)
  const split = createWorkoutSegment(config)
  let metrics = {}
  let lastBroadcastedMetrics = {}
  let pauseTimer
  let pauseCountdownTimer = 0
  let watchdogTimer
  const watchdogTimout = 1000 * config.rowerSettings.maximumStrokeTimeBeforePause // Pause timeout in miliseconds
  let sessionState = 'WaitingForStart'
  let intervalSettings = []
  let currentIntervalNumber = -1
  let splitNumber = -1
  let isUnplannedPause = false
  let splitRemainder = null

  metrics = refreshMetrics()
  setIntervalParameters([{ type: 'justrow' }])
  emitMetrics(metrics)
  lastBroadcastedMetrics = { ...metrics }

  /**
   * This function handles all incomming commands. As all commands are broadasted to all managers, we need to filter here what is relevant
   * for the RowingEngine and what is not
   *
   * @param {Command} Name of the command to be executed by the commandhandler
   * @param {unknown} data for executing the command
   *
   * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/blob/main/docs/Architecture.md#command-flow|The command flow documentation}
   */
  function handleCommand (commandName, data) {
    resetMetricsSessionContext(lastBroadcastedMetrics)
    switch (commandName) {
      case ('updateIntervalSettings'):
        if (sessionState !== 'Rowing') {
          setIntervalParameters(data)
        } else {
          log.debug(`SessionManager, time: ${metrics.totalMovingTime}, rejected new interval settings as session was already in progress`)
        }
        emitMetrics(lastBroadcastedMetrics)
        break
      case ('start'):
        if (sessionState !== 'Rowing') {
          clearTimeout(pauseTimer)
          StartOrResumeTraining()
          sessionState = 'WaitingForStart'
          emitMetrics(lastBroadcastedMetrics)
        }
        break
      case ('startOrResume'):
        if (sessionState !== 'Rowing' && sessionState !== 'WaitingForStart') {
          clearTimeout(pauseTimer)
          StartOrResumeTraining()
          sessionState = 'Paused'
          emitMetrics(lastBroadcastedMetrics)
        }
        break
      case ('pause'):
        if (sessionState === 'Rowing') {
          pauseTraining(lastBroadcastedMetrics)
          lastBroadcastedMetrics = refreshMetrics() // as the pause button is forced, we need to fetch the zero'ed metrics
          lastBroadcastedMetrics.metricsContext.isPauseStart = true
          sessionState = 'Paused'
          isUnplannedPause = true
          emitMetrics(lastBroadcastedMetrics)
        }
        break
      case ('stop'):
        if (sessionState === 'Rowing') {
          clearTimeout(pauseTimer)
          stopTraining(lastBroadcastedMetrics)
          lastBroadcastedMetrics.metricsContext.isSessionStop = true
          sessionState = 'Stopped'
          emitMetrics(lastBroadcastedMetrics)
        }
        break
      case ('reset'):
        clearTimeout(pauseTimer)
        if (sessionState === 'Rowing') {
          sessionState = 'Stopped'
          lastBroadcastedMetrics.metricsContext.isSessionStop = true
          emitMetrics(lastBroadcastedMetrics)
        }
        resetTraining(lastBroadcastedMetrics)
        lastBroadcastedMetrics = refreshMetrics() // as the engine is reset, we need to fetch the zero'ed metrics
        sessionState = 'WaitingForStart'
        emitMetrics(lastBroadcastedMetrics)
        break
      case 'switchBlePeripheralMode':
        break
      case 'switchAntPeripheralMode':
        break
      case 'switchHrmMode':
        break
      case 'refreshPeripheralConfig':
        break
      case 'upload':
        break
      case 'shutdown':
        clearTimeout(pauseTimer)
        stopTraining(lastBroadcastedMetrics)
        if (sessionState === 'Rowing') {
          lastBroadcastedMetrics.metricsContext.isSessionStop = true
          sessionState = 'Stopped'
          emitMetrics(lastBroadcastedMetrics)
        }
        break
      default:
        log.error(`Recieved unknown command: ${commandName}`)
    }
  }

  function refreshMetrics () {
    const baseMetrics = rowingStatistics.getMetrics()
    resetMetricsSessionContext(baseMetrics)
    baseMetrics.timestamp = new Date()
    return baseMetrics
  }

  function StartOrResumeTraining () {
    rowingStatistics.allowStartOrResumeTraining()
  }

  function stopTraining (baseMetrics) {
    clearTimeout(watchdogTimer)
    session.push(baseMetrics)
    interval.push(baseMetrics)
    split.push(baseMetrics)
    rowingStatistics.stopTraining()
  }

  // clear the metrics in case the user pauses rowing
  function pauseTraining (baseMetrics) {
    clearTimeout(watchdogTimer)
    session.push(baseMetrics)
    interval.push(baseMetrics)
    split.push(baseMetrics)
    rowingStatistics.pauseTraining()
  }

  function resetTraining (baseMetrics) {
    stopTraining(baseMetrics)
    rowingStatistics.resetTraining()
    rowingStatistics.allowStartOrResumeTraining()
    intervalSettings = null
    intervalSettings = []
    currentIntervalNumber = -1
    pauseCountdownTimer = 0
    splitNumber = -1
    metrics = refreshMetrics()
    lastBroadcastedMetrics = { ...metrics }
    sessionState = 'WaitingForStart'
    session.reset()
    interval.reset()
    split.reset()
    setIntervalParameters([{ type: 'justrow' }])
    isUnplannedPause = false
    splitRemainder = null
    emitMetrics(metrics)
  }

  /**
   * This function processes the currentDt and guards the session, interval and split boundaries
   *
   * @param {float} time between two impulses in seconds
   *
   * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/blob/main/docs/Architecture.md#session-interval-and-split-boundaries-in-sessionmanagerjs|The session, interval and split setup}
   * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/blob/main/docs/Architecture.md#sessionstates-in-sessionmanagerjs|The states maintained}
   * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/blob/main/docs/Architecture.md#rowing-metrics-flow|the flags set}
   */
  /* eslint-disable max-statements, complexity -- This handles quite a complex state machine with three levels of workout segments, not much we can do about it */
  function handleRotationImpulse (currentDt) {
    let temporaryDatapoint

    // Clear the watchdog as we got a currentDt, we'll set it at the end again
    clearTimeout(watchdogTimer)

    // Provide the rower with new data
    metrics = rowingStatistics.handleRotationImpulse(currentDt)
    resetMetricsSessionContext(metrics)
    if (sessionState === 'Rowing' && split.getStartTimestamp() !== undefined && split.movingTimeSinceStart(metrics) >= 0) {
      // If we are moving, timestamps should be based on movingTime as it is more accurate and consistent for the consumers
      metrics.timestamp = new Date(split.getStartTimestamp().getTime() + (split.movingTimeSinceStart(metrics) * 1000))
    } else {
      metrics.timestamp = new Date()
    }

    if (metrics.metricsContext.isMoving && (metrics.metricsContext.isDriveStart || metrics.metricsContext.isRecoveryStart)) {
      session.push(metrics)
      interval.push(metrics)
      split.push(metrics)
    }

    // This is the core of the finite state machine that defines all session state transitions
    switch (true) {
      case (sessionState === 'WaitingForStart' && metrics.metricsContext.isMoving === true):
        StartOrResumeTraining()
        sessionState = 'Rowing'
        metrics.metricsContext.isSessionStart = true
        // eslint-disable-next-line no-case-declarations -- Code clarity outweighs lint rules
        const startTimestamp = new Date(metrics.timestamp.getTime() - metrics.totalMovingTime * 1000)
        session.setStartTimestamp(startTimestamp)
        interval.setStartTimestamp(startTimestamp)
        split.setStartTimestamp(startTimestamp)
        emitMetrics(metrics)
        break
      case (sessionState === 'WaitingForStart'):
        // We can't change into the "Rowing" state since we are waiting for a drive phase that didn't come
        emitMetrics(metrics)
        break
      case (sessionState === 'Paused' && metrics.metricsContext.isMoving === true && isUnplannedPause):
        // It was a spontanuous pause
        StartOrResumeTraining()
        sessionState = 'Rowing'
        metrics.metricsContext.isPauseEnd = true
        emitMetrics(metrics)
        isUnplannedPause = false
        activateNextSplitParameters(metrics)
        break
      case (sessionState === 'Paused' && metrics.metricsContext.isMoving === true):
        // We are leaving a planned rest interval
        StartOrResumeTraining()
        sessionState = 'Rowing'
        metrics.metricsContext.isPauseEnd = true
        metrics.metricsContext.isIntervalEnd = true
        emitMetrics(metrics)
        activateNextIntervalParameters(metrics)
        break
      case (sessionState === 'Paused'):
        // We are in a paused state, and didn't see a drive, so nothing to do here
        emitMetrics(metrics)
        break
      case (sessionState !== 'Stopped' && metrics.strokeState === 'Stopped'):
        // We do not need to refetch the metrics as RowingStatistics will already have zero-ed the metrics when strokeState = 'Stopped'
        // This is intended behaviour, as the rower/flywheel indicate the rower has stopped somehow
        stopTraining(metrics)
        sessionState = 'Stopped'
        metrics.metricsContext.isSessionStop = true
        emitMetrics(metrics)
        break
      case (sessionState === 'Stopped'):
        // We are in a stopped state, and will remain there
        sessionState = 'Stopped'
        emitMetrics(metrics)
        break
      case (sessionState === 'Rowing' && metrics.strokeState === 'WaitingForDrive'):
        // This is an unplanned pause
        // We do not need to refetch the metrics as RowingStatistics will already have zero-ed the metrics when strokeState = 'WaitingForDrive'
        pauseTraining(metrics)
        sessionState = 'Paused'
        isUnplannedPause = true
        splitRemainder = split.remainder(metrics)
        metrics.metricsContext.isPauseStart = true
        metrics.metricsContext.isSplitEnd = true
        emitMetrics(metrics)
        addUnplannedRestSplit(metrics)
        break
      case (sessionState === 'Rowing' && metrics.metricsContext.isMoving && interval.isEndReached(metrics) && isNextIntervalActive()):
        // The next interval is an active one, so we just keep on going
        // As we typically overshoot our interval target, we project the intermediate value
        temporaryDatapoint = interval.interpolateEnd(lastBroadcastedMetrics, metrics)
        sessionState = 'Rowing'
        if (temporaryDatapoint.modified) {
          // The intermediate datapoint is actually different
          temporaryDatapoint.metricsContext.isIntervalEnd = true
          temporaryDatapoint.metricsContext.isSplitEnd = true
          emitMetrics(temporaryDatapoint)
          activateNextIntervalParameters(temporaryDatapoint)
          emitMetrics(metrics)
        } else {
          metrics.metricsContext.isIntervalEnd = true
          metrics.metricsContext.isSplitEnd = true
          emitMetrics(metrics)
          activateNextIntervalParameters(metrics)
        }
        break
      case (sessionState === 'Rowing' && metrics.metricsContext.isMoving && interval.isEndReached(metrics) && isNextIntervalAvailable()):
        // There is a next interval, but it is a rest interval, so we forcefully stop the session
        // As we typically overshoot our interval target, we project the intermediate value
        sessionState = 'Paused'
        isUnplannedPause = false
        temporaryDatapoint = interval.interpolateEnd(lastBroadcastedMetrics, metrics)
        if (temporaryDatapoint.modified) {
          // The intermediate datapoint is actually different
          temporaryDatapoint.metricsContext.isIntervalEnd = true
          temporaryDatapoint.metricsContext.isSplitEnd = true
          temporaryDatapoint.metricsContext.isPauseStart = true
          emitMetrics(temporaryDatapoint)
          activateNextIntervalParameters(temporaryDatapoint)
        } else {
          metrics.metricsContext.isIntervalEnd = true
          metrics.metricsContext.isSplitEnd = true
          metrics.metricsContext.isPauseStart = true
          emitMetrics(metrics)
          activateNextIntervalParameters(metrics)
        }

        if (interval.timeToEnd(metrics) > 0) {
          // If a minimal pause timer has been set, we need to make sure the user obeys that
          pauseCountdownTimer = interval.timeToEnd(temporaryDatapoint)
          stopTraining(temporaryDatapoint)
          pauseTimer = setTimeout(onPauseTimer, 100)
        } else {
          // No minimal pause time has been set, so we pause the engine. In this state automatically activates the session again upon the next drive
          pauseCountdownTimer = 0
          pauseTraining(temporaryDatapoint)
        }
        metrics = refreshMetrics() // Here we want to switch to a zero-ed message as the flywheel has stopped
        break
      case (sessionState === 'Rowing' && metrics.metricsContext.isMoving && interval.isEndReached(metrics)):
        // Here we do NOT want zero the metrics, as we want to keep the metrics we had when we crossed the finishline
        stopTraining(metrics)
        sessionState = 'Stopped'
        temporaryDatapoint = interval.interpolateEnd(lastBroadcastedMetrics, metrics)
        if (temporaryDatapoint.modified) {
          temporaryDatapoint.metricsContext.isSessionStop = true
          emitMetrics(temporaryDatapoint)
        } else {
          metrics.metricsContext.isSessionStop = true
          emitMetrics(metrics)
        }
        break
      case (sessionState === 'Rowing' && metrics.metricsContext.isMoving && split.isEndReached(metrics)):
        sessionState = 'Rowing'
        temporaryDatapoint = split.interpolateEnd(lastBroadcastedMetrics, metrics)
        if (temporaryDatapoint.modified) {
          temporaryDatapoint.metricsContext.isSplitEnd = true
          emitMetrics(temporaryDatapoint)
          activateNextSplitParameters(temporaryDatapoint)
          emitMetrics(metrics)
        } else {
          metrics.metricsContext.isSplitEnd = true
          emitMetrics(metrics)
          activateNextSplitParameters(metrics)
        }
        break
      case (sessionState === 'Rowing' && metrics.metricsContext.isMoving):
        sessionState = 'Rowing'
        emitMetrics(metrics)
        break
      default:
        log.error(`SessionManager: Time: ${metrics.totalMovingTime}, combination of ${sessionState} and state ${metrics.strokeState} is not captured by Finite State Machine`)
    }

    if (sessionState === 'Rowing' && metrics.metricsContext.isMoving) {
      watchdogTimer = setTimeout(onWatchdogTimeout, watchdogTimout)
    }
    lastBroadcastedMetrics = { ...metrics }
  }
  /* eslint-enable max-statements, complexity */

  // Basic metricContext structure
  function resetMetricsSessionContext (metricsToReset) {
    metricsToReset.metricsContext.isSessionStart = false
    metricsToReset.metricsContext.isIntervalEnd = false
    metricsToReset.metricsContext.isSplitEnd = false
    metricsToReset.metricsContext.isPauseStart = false
    metricsToReset.metricsContext.isPauseEnd = false
    metricsToReset.metricsContext.isSessionStop = false
  }

  function setIntervalParameters (intervalParameters) {
    intervalSettings = null
    intervalSettings = intervalParameters
    currentIntervalNumber = -1
    splitNumber = -1
    splitRemainder = null
    if (intervalSettings.length > 0) {
      log.info(`SessionManager: Workout plan recieved with ${intervalSettings.length} interval(s)`)
      metrics = refreshMetrics()

      session.setStart(metrics)
      session.summarize(intervalParameters)

      activateNextIntervalParameters(metrics)
      emitMetrics(metrics)
    } else {
      // intervalParameters were empty, lets log this odd situation
      log.error('SessionManager: Recieved workout plan containing no intervals')
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

  function isNextIntervalActive () {
    // This function tests whether there is a next interval available
    if (currentIntervalNumber > -1 && intervalSettings.length > 0 && intervalSettings.length > (currentIntervalNumber + 1)) {
      return (intervalSettings[currentIntervalNumber + 1].type !== 'rest')
    } else {
      return false
    }
  }

  function activateNextIntervalParameters (baseMetrics) {
    if (intervalSettings.length > 0 && intervalSettings.length > (currentIntervalNumber + 1)) {
      // This function sets the interval parameters in absolute distances/times
      // Thus the interval target always is a projected "finishline" from the current position
      currentIntervalNumber++
      log.info(`Activating interval settings for interval ${currentIntervalNumber + 1} of ${intervalSettings.length}`)
      interval.setStart(baseMetrics)
      interval.setEnd(intervalSettings[currentIntervalNumber])

      // As the interval has changed, we need to reset the split metrics
      splitRemainder = null
      activateNextSplitParameters(baseMetrics)
    } else {
      log.error('SessionManager: expected a next interval, but did not find one!')
    }
  }

  function activateNextSplitParameters (baseMetrics) {
    splitNumber++
    log.debug(`Activating split settings for split ${splitNumber + 1}`)
    split.setStart(baseMetrics)
    if (splitRemainder !== null && sessionState === 'Rowing') {
      // We have a part of the split still have to complete
      split.setEnd(splitRemainder)
      splitRemainder = null
    } else {
      split.setEnd(interval.getSplit())
    }
  }

  function addUnplannedRestSplit (baseMetrics) {
    splitNumber++
    log.info(`Adding unplanned rest split, split number ${splitNumber + 1}`)
    split.setStart(baseMetrics)
    split.setEnd({ type: 'rest' })
  }

  function onPauseTimer () {
    pauseCountdownTimer = pauseCountdownTimer - 0.1
    if (pauseCountdownTimer > 0) {
      // The countdowntimer still has some time left on it
      pauseTimer = setTimeout(onPauseTimer, 100)
      lastBroadcastedMetrics.timestamp = new Date()
    } else {
      // The timer has run out
      pauseTraining(lastBroadcastedMetrics)
      sessionState = 'Paused'
      lastBroadcastedMetrics = refreshMetrics()
      pauseCountdownTimer = 0
      log.debug(`Time: ${lastBroadcastedMetrics.totalMovingTime}, rest interval ended`)
    }
    emitMetrics(lastBroadcastedMetrics)
  }

  function emitMetrics (metricsToEmit) {
    enrichMetrics(metricsToEmit)
    emitter.emit('metricsUpdate', metricsToEmit)
  }

  function enrichMetrics (metricsToEnrich) {
    metricsToEnrich.sessionState = sessionState
    metricsToEnrich.pauseCountdownTime = Math.max(pauseCountdownTimer, 0) // Time left on the countdown timer
    metricsToEnrich.metricsContext.isUnplannedPause = isUnplannedPause // Indication for the PM5 emulator to distinguish between planned and unplanned pauses
    metricsToEnrich.workout = session.metrics(metricsToEnrich)
    metricsToEnrich.interval = interval.metrics(metricsToEnrich)
    metricsToEnrich.interval.workoutStepNumber = Math.max(currentIntervalNumber, 0) // Interval number, to keep in sync with the workout plan
    metricsToEnrich.split = split.metrics(metricsToEnrich)
    metricsToEnrich.split.number = splitNumber
  }

  function onWatchdogTimeout () {
    pauseTraining(lastBroadcastedMetrics)
    metrics = refreshMetrics()
    log.error(`Time: ${metrics.totalMovingTime}, Forced a session pause due to unexpeted flywheel stop, exceeding the maximumStrokeTimeBeforePause (i.e. ${watchdogTimout / 1000} seconds) without new datapoints`)
    sessionState = 'Paused'
    isUnplannedPause = true
    metrics.metricsContext.isPauseStart = true
    metrics.metricsContext.isSplitEnd = true
    session.push(metrics)
    interval.push(metrics)
    split.push(metrics)
    emitMetrics(metrics)
    activateNextSplitParameters(metrics)
    lastBroadcastedMetrics = { ...metrics }
  }

  /**
   * @returns all metrics in the session manager
   * @remark FOR TESTING PURPOSSES ONLY!
   */
  function getMetrics () {
    clearTimeout(watchdogTimer)
    enrichMetrics(metrics)
    return metrics
  }

  return Object.assign(emitter, {
    handleCommand,
    handleRotationImpulse,
    getMetrics
  })
}
