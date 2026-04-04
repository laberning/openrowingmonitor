'use strict'
/**
 * @copyright [OpenRowingMonitor]{@link https://github.com/JaapvanEkris/openrowingmonitor}
 *
 * @file This Module captures the metrics of a rowing session and persists them to the log.
*/
import log from 'loglevel'
import { secondsToTimeString } from '../tools/Helper.js'

export function createLogRecorder () {
  let heartRate = 0
  let lastMetrics = {
    totalMovingTime: 0,
    totalLinearDistance: 0
  }

  /**
   * @description This function handles all incomming commands. Here, the recordingmanager will have filtered
   * all unneccessary commands for us, so we only need to react to 'updateIntervalSettings', 'reset' and 'shutdown'
   */
  // eslint-disable-next-line no-unused-vars -- The payload 'data' will stay empty at all times, but is maintained for interfact consistency across all recorders and command handlers
  async function handleCommand (commandName, data) {
    const currentdate = new Date()
    switch (commandName) {
      case ('updateIntervalSettings'):
        log.info(`Recieved new Intervalsettings at ${currentdate.getHours()}:${currentdate.getMinutes()}`)
        break
      case ('reset'):
        log.info(`OpenRowingMonitor reset at ${currentdate.getHours()}:${currentdate.getMinutes()}, at ${lastMetrics.totalMovingTime.toFixed(5)} seconds,distance ${lastMetrics.totalLinearDistance.toFixed(1)}m`)
        break
      case 'shutdown':
        log.info(`OpenRowingMonitor shutdown at ${currentdate.getHours()}:${currentdate.getMinutes()}, at ${lastMetrics.totalMovingTime.toFixed(5)} seconds,distance ${lastMetrics.totalLinearDistance.toFixed(1)}m`)
        break
      default:
        log.error(`Logecorder: Recieved unknown command: ${commandName}`)
    }
  }

  /**
   * @description initiated when a new heart rate value is received from heart rate sensor
   */
  async function recordHeartRate (value) {
    heartRate = value.heartrate
  }

  /**
   * @description This handles recording metrics to the log at the right moments
   */
  function recordRowingMetrics (metrics) {
    const currentdate = new Date()
    switch (true) {
      case (metrics.metricsContext.isSessionStart):
        log.info(`Rowing started at ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}`)
        break
      case (metrics.metricsContext.isSessionStop):
        logMetrics(metrics)
        log.info(`Rowing ended at ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}, at ${metrics.totalMovingTime.toFixed(5)} seconds,distance ${metrics.totalLinearDistance.toFixed(1)}m`)
        break
      case (metrics.metricsContext.isPauseStart && lastMetrics.sessionState === 'Rowing'):
        logMetrics(metrics)
        log.info(`Rowing stopped/paused at ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}, at ${metrics.totalMovingTime.toFixed(5)} seconds,distance ${metrics.totalLinearDistance.toFixed(1)}m`)
        break
      case (metrics.metricsContext.isPauseStart):
        // We were not rowing, but a pause is triggered. This is the Rowing Engine signaling it is forced into a pause condition
        log.info(`Rowing engine armed again at ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}`)
        break
      case (metrics.metricsContext.isPauseEnd):
        log.info(`Rowing resumed at ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}`)
        break
      case (metrics.metricsContext.isIntervalEnd):
        log.info(`New interval started at ${metrics.totalMovingTime.toFixed(5)} seconds, distance ${metrics.totalLinearDistance.toFixed(1)}m`)
        break
      case (metrics.metricsContext.isSplitEnd):
        log.info(`New split started at ${metrics.totalMovingTime.toFixed(5)} seconds, distance ${metrics.totalLinearDistance.toFixed(1)}m`)
        break
      case (metrics.metricsContext.isDriveStart):
        logMetrics(metrics)
        break
      // no default
    }
    lastMetrics = metrics
  }

  /**
   * @description A helper function to record all relevant metrics
   */
  function logMetrics (metrics) {
    if (heartRate !== undefined && heartRate > 0) {
      log.info(`stroke: ${metrics.totalNumberOfStrokes}, dist: ${metrics.totalLinearDistance.toFixed(1)}m, heartrate ${heartRate} BPM` +
        `, pace: ${metrics.cyclePace > 0 ? secondsToTimeString(metrics.cyclePace) : NaN}/500m, stroke dist: ${metrics.cycleDistance > 0 ? metrics.cycleDistance.toFixed(2) : NaN}m, strokerate: ${metrics.cycleStrokeRate > 0 ? metrics.cycleStrokeRate.toFixed(1) : NaN} SPM` +
        `, drive dur: ${metrics.driveDuration > 0 ? metrics.driveDuration.toFixed(2) : NaN}s, rec. dur: ${metrics.recoveryDuration > 0 ? metrics.recoveryDuration.toFixed(2) : NaN}s, stroke dur: ${metrics.cycleDuration ? metrics.cycleDuration.toFixed(2) : NaN}s`)
    } else {
      log.info(`stroke: ${metrics.totalNumberOfStrokes}, dist: ${metrics.totalLinearDistance.toFixed(1)}m, No heartrate detected` +
        `, pace: ${metrics.cyclePace > 0 ? secondsToTimeString(metrics.cyclePace) : NaN}/500m, stroke dist: ${metrics.cycleDistance > 0 ? metrics.cycleDistance.toFixed(2) : NaN}m, strokerate: ${metrics.cycleStrokeRate > 0 ? metrics.cycleStrokeRate.toFixed(1) : NaN} SPM` +
        `, drive dur: ${metrics.driveDuration > 0 ? metrics.driveDuration.toFixed(2) : NaN}s, rec. dur: ${metrics.recoveryDuration > 0 ? metrics.recoveryDuration.toFixed(2) : NaN}s, stroke dur: ${metrics.cycleDuration ? metrics.cycleDuration.toFixed(2) : NaN}s`)
    }
  }

  return {
    handleCommand,
    recordRowingMetrics,
    recordHeartRate
  }
}
