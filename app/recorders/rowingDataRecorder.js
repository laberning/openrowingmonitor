'use strict'
/**
 * @copyright {@link https://github.com/JaapvanEkris/openrowingmonitor|OpenRowingMonitor}
 *
 * @file This Module captures the metrics of a rowing session and persists them into a RowingData format
 * It provides a RowingData file content, and some metadata for the filewriter and the file-uploaders
 */
import log from 'loglevel'
import { createInfiniteSeriesMetrics } from '../engine/utils/InfiniteSeriesMetrics.js'
import { createVO2max } from './utils/VO2max.js'

export function createRowingDataRecorder (config) {
  const type = 'csv'
  const postfix = '_rowingData'
  const presentationName = 'RowingData'
  const VO2max = createVO2max(config)
  const drag = createInfiniteSeriesMetrics()
  let startTime
  let splitNumber = 0
  let heartRate = 0
  let strokes = []
  let postExerciseHR = []
  let lastMetrics = {}
  let rowingDataFileContent
  let rowingDataFileContentIsCurrent = true
  let allDataHasBeenWritten = true

  // This function handles all incomming commands. As all commands are broadasted to all application parts,
  // we need to filter here what the WorkoutRecorder will react to and what it will ignore
  /* eslint-disable-next-line no-unused-vars -- standardised recorder interface where the command payload is not relevant for this recorder */
  async function handleCommand (commandName, data) {
    switch (commandName) {
      case ('updateIntervalSettings'):
        break
      case ('reset'):
      case ('shutdown'):
        if (lastMetrics !== undefined && !!lastMetrics.metricsContext && lastMetrics.metricsContext.isMoving === true && (strokes.length > 0) && (lastMetrics.totalMovingTime > strokes[strokes.length - 1].totalMovingTime)) {
          addMetricsToStrokesArray(lastMetrics)
        }
        break
      default:
        log.error(`RowingDataRecorder: Recieved unknown command: ${commandName}`)
    }
  }

  // initiated when a new heart rate value is received from heart rate sensor
  async function recordHeartRate (value) {
    heartRate = value.heartrate
  }

  function recordRowingMetrics (metrics) {
    switch (true) {
      case (metrics.metricsContext.isSessionStart):
        if (startTime === undefined) {
          startTime = metrics.timestamp
        }
        addMetricsToStrokesArray(metrics)
        break
      case (metrics.metricsContext.isSessionStop && lastMetrics.sessionState !== 'Stopped'):
        addMetricsToStrokesArray(metrics)
        postExerciseHR = null
        postExerciseHR = []
        measureRecoveryHR()
        break
      case (metrics.metricsContext.isIntervalEnd):
        addMetricsToStrokesArray(metrics)
        splitNumber++
        break
      case (metrics.metricsContext.isPauseStart && lastMetrics.sessionState === 'Rowing'):
        addMetricsToStrokesArray(metrics)
        postExerciseHR = null
        postExerciseHR = []
        measureRecoveryHR()
        break
      case (metrics.metricsContext.isPauseEnd):
        splitNumber++
        addMetricsToStrokesArray(metrics)
        break
      case (metrics.metricsContext.isSplitEnd):
        addMetricsToStrokesArray(metrics)
        splitNumber++
        break
      case (metrics.metricsContext.isDriveStart):
        addMetricsToStrokesArray(metrics)
        break
      // no default
    }
    lastMetrics = metrics
  }

  function addMetricsToStrokesArray (metrics) {
    strokes.push({})
    const strokeNumber = strokes.length - 1
    strokes[strokeNumber].totalNumberOfStrokes = metrics.totalNumberOfStrokes
    strokes[strokeNumber].rowingDataSplitNumber = splitNumber
    strokes[strokeNumber].timestamp = metrics.timestamp
    strokes[strokeNumber].totalMovingTime = metrics.totalMovingTime
    if (heartRate !== undefined && heartRate > 0) {
      strokes[strokeNumber].heartrate = heartRate
    } else {
      strokes[strokeNumber].heartrate = undefined
    }
    strokes[strokeNumber].totalLinearDistance = metrics.totalLinearDistance
    strokes[strokeNumber].cycleStrokeRate = metrics.cycleStrokeRate
    strokes[strokeNumber].cycleLinearVelocity = metrics.cycleLinearVelocity
    strokes[strokeNumber].cyclePace = metrics.cyclePace
    strokes[strokeNumber].cyclePower = metrics.cyclePower
    strokes[strokeNumber].cycleDistance = metrics.cycleDistance
    strokes[strokeNumber].driveDuration = metrics.driveDuration
    strokes[strokeNumber].driveLength = metrics.driveLength
    strokes[strokeNumber].recoveryDuration = metrics.recoveryDuration
    strokes[strokeNumber].totalCalories = metrics.totalCalories
    strokes[strokeNumber].dragFactor = metrics.dragFactor
    strokes[strokeNumber].drivePeakHandleForce = metrics.drivePeakHandleForce
    strokes[strokeNumber].drivePeakHandleForceNormalizedPosition = metrics.drivePeakHandleForceNormalizedPosition
    strokes[strokeNumber].driveAverageHandleForce = metrics.driveAverageHandleForce
    strokes[strokeNumber].driveHandleForceCurve = metrics.driveHandleForceCurve
    strokes[strokeNumber].driveHandleVelocityCurve = metrics.driveHandleVelocityCurve
    strokes[strokeNumber].driveHandlePowerCurve = metrics.driveHandlePowerCurve
    VO2max.push(metrics, heartRate)
    if (!isNaN(metrics.dragFactor) && metrics.dragFactor > 0) { drag.push(metrics.dragFactor) }
    allDataHasBeenWritten = false
    rowingDataFileContentIsCurrent = false
  }

  async function fileContent () {
    const RowingData = await workoutToRowingData(strokes)
    if (RowingData === undefined) {
      log.error('error creating RowingData file content')
      return undefined
    } else {
      return RowingData
    }
  }

  /* eslint-disable complexity -- a lot of complexity is introduced due to defensive programming the output written to file */
  async function workoutToRowingData (strokedata) {
    // The file content is filled and hasn't changed
    let currentstroke

    if (rowingDataFileContentIsCurrent === true && rowingDataFileContent !== undefined) { return rowingDataFileContent }

    // Required file header, please note this includes a typo and odd spaces as the specification demands it!
    let RowingData = ',index, Stroke Number, lapIdx,TimeStamp (sec), ElapsedTime (sec), HRCur (bpm),DistanceMeters, Cadence (stokes/min), Stroke500mPace (sec/500m), Power (watts), StrokeDistance (meters),' +
      ' DriveTime (ms), DriveLength (meters), StrokeRecoveryTime (ms),Speed, Horizontal (meters), Calories (kCal), DragFactor, PeakDriveForce (N), PeakForcePositionNorm, AverageDriveForce (N),' +
      'Handle_Force_(N),Handle_Velocity_(m/s),Handle_Power_(W)\n'

    // Add the strokes
    let i = 0
    while (i < strokedata.length) {
      currentstroke = strokedata[i]
      // Add the strokes
      RowingData += `${(i + 1).toFixed(0)},${(i + 1).toFixed(0)},${currentstroke.totalNumberOfStrokes.toFixed(0)},${currentstroke.rowingDataSplitNumber.toFixed(0)},${(currentstroke.timestamp / 1000).toFixed(3)},` +
        `${currentstroke.totalMovingTime.toFixed(5)},${(currentstroke.heartrate !== undefined ? currentstroke.heartrate.toFixed(0) : NaN)},${currentstroke.totalLinearDistance.toFixed(1)},` +
        `${currentstroke.cycleStrokeRate > 0 ? currentstroke.cycleStrokeRate.toFixed(1) : NaN},${(currentstroke.totalNumberOfStrokes > 0 && currentstroke.cyclePace > 0 ? currentstroke.cyclePace.toFixed(2) : NaN)},${(currentstroke.totalNumberOfStrokes > 0 && currentstroke.cyclePower > 0 ? currentstroke.cyclePower.toFixed(0) : NaN)},` +
        `${currentstroke.cycleDistance > 0 ? currentstroke.cycleDistance.toFixed(2) : NaN},${currentstroke.driveDuration > 0 ? (currentstroke.driveDuration * 1000).toFixed(0) : NaN},${(currentstroke.totalNumberOfStrokes > 0 && currentstroke.driveLength ? currentstroke.driveLength.toFixed(2) : NaN)},${currentstroke.recoveryDuration > 0 ? (currentstroke.recoveryDuration * 1000).toFixed(0) : NaN},` +
        `${(currentstroke.totalNumberOfStrokes > 0 && currentstroke.cycleLinearVelocity > 0 ? currentstroke.cycleLinearVelocity.toFixed(2) : NaN)},${currentstroke.totalLinearDistance.toFixed(1)},${currentstroke.totalCalories.toFixed(1)},${currentstroke.dragFactor > 0 ? currentstroke.dragFactor.toFixed(1) : NaN},` +
        `${(currentstroke.totalNumberOfStrokes > 0 && currentstroke.drivePeakHandleForce > 0 ? currentstroke.drivePeakHandleForce.toFixed(1) : NaN)}, ${(currentstroke.totalNumberOfStrokes > 0 && currentstroke.drivePeakHandleForceNormalizedPosition > 0 ? currentstroke.drivePeakHandleForceNormalizedPosition.toFixed(1) : NaN)}, ${(currentstroke.totalNumberOfStrokes > 0 && currentstroke.driveAverageHandleForce > 0 ? currentstroke.driveAverageHandleForce.toFixed(1) : NaN)},"${currentstroke.driveAverageHandleForce > 0 ? currentstroke.driveHandleForceCurve.map((value) => value.toFixed(2)) : NaN}",` +
        `"${currentstroke.driveAverageHandleForce > 0 ? currentstroke.driveHandleVelocityCurve.map((value) => value.toFixed(3)) : NaN}","${currentstroke.driveAverageHandleForce > 0 ? currentstroke.driveHandlePowerCurve.map((value) => value.toFixed(1)) : NaN}"\n`
      i++
    }
    rowingDataFileContent = RowingData
    rowingDataFileContentIsCurrent = true
    return rowingDataFileContent
  }
  /* eslint-enable complexity */

  function measureRecoveryHR () {
    // This function is called when the rowing session is stopped. postExerciseHR[0] is the last measured excercise HR
    // Thus postExerciseHR[1] is Recovery HR after 1 min, etc..
    if (!isNaN(heartRate) && config.userSettings.restingHR <= heartRate && heartRate <= config.userSettings.maxHR) {
      log.debug(`*** RowingData HRR-${postExerciseHR.length}: ${heartRate}`)
      postExerciseHR.push(heartRate)
      if (postExerciseHR.length < 4) {
        // We haven't got three post-exercise HR measurements yet, let's schedule the next measurement
        setTimeout(measureRecoveryHR, 60000)
      } else {
        log.debug('*** Skipped HRR measurement')
      }
    }
  }

  function minimumDataAvailable () {
    const minimumRecordingTimeInSeconds = 10
    if (strokes.length > 2) {
      const strokeTimeTotal = strokes[strokes.length - 1].totalMovingTime
      return (strokeTimeTotal > minimumRecordingTimeInSeconds)
    } else {
      return (false)
    }
  }

  function totalRecordedDistance () {
    if (minimumDataAvailable() && strokes[strokes.length - 1].totalLinearDistance > 0) {
      return strokes[strokes.length - 1].totalLinearDistance
    } else {
      return 0
    }
  }

  function totalRecordedMovingTime () {
    if (minimumDataAvailable() && strokes[strokes.length - 1].totalMovingTime > 0) {
      return strokes[strokes.length - 1].totalMovingTime
    } else {
      return 0
    }
  }

  function sessionDrag () {
    return drag.average()
  }

  function sessionVO2Max () {
    if (VO2max.result() > 10 && VO2max.result() < 60) {
      return VO2max.result()
    } else {
      return undefined
    }
  }

  function sessionHRR () {
    if (postExerciseHR.length > 1 && (postExerciseHR[0] > (0.7 * config.userSettings.maxHR))) {
      // Recovery Heartrate is only defined when the last excercise HR is above 70% of the maximum Heartrate
      return postExerciseHR
    } else {
      return []
    }
  }

  function reset () {
    startTime = undefined
    heartRate = 0
    strokes = null
    strokes = []
    rowingDataFileContent = null
    rowingDataFileContent = {}
    postExerciseHR = null
    postExerciseHR = []
    VO2max.reset()
    drag.reset()
    lastMetrics = null
    lastMetrics = {}
    allDataHasBeenWritten = true
  }

  return {
    handleCommand,
    recordRowingMetrics,
    recordHeartRate,
    minimumDataAvailable,
    fileContent,
    type,
    postfix,
    presentationName,
    totalRecordedDistance,
    totalRecordedMovingTime,
    sessionDrag,
    sessionVO2Max,
    sessionHRR,
    allDataHasBeenWritten,
    reset
  }
}
