'use strict'
/**
 * @copyright {@link https://github.com/JaapvanEkris/openrowingmonitor|OpenRowingMonitor}
 *
 * @file This Module captures the metrics of a rowing session and persists them into the fit format
 * It provides a fit-file content, and some metadata for the filewriter and the file-uploaders
 *
 * We use 'Smart Recording' per stroke as that makes sure that per-stroke data can also be extracted from the file (like work per stroke)
 * @see {@link https://developer.garmin.com/fit/file-types/activity/|the fields and their meaning}.
 * @see {@link https://developer.garmin.com/fit/cookbook/encoding-activity-files/|the description of the filestructure and how timestamps}
 * @see {@link https://forums.garmin.com/developer/fit-sdk/b/news-announcements/posts/important-fit-activity-file-message-change|description of the timestamps for summary messages}
 * @see {@link https://developer.garmin.com/fit/cookbook/durations/|how the different times are defined}
 * We use 'summary last message sequencing' as the stream makes most sense that way
 * Analysis of Garmin files show that splits, laps and strokes are completely disconnected, so we use that loose structure here as well
 * As general timestamp we use the session end time, as that is semantically more sound than Garmin's approach of the session start time
 *
 * BE AWARE: OpenRowingMonitor and Garmin actually use conflicting terminology!
 * - An OpenRowingMonitor Interval is nearly identical as a Garmin Split (aside the handling of unplanned pauses)
 * - An OpenRowingMonitor Split is identical to a Garmin lap
 */
/* eslint-disable camelcase -- Imported parameters are not camelCase */
/* eslint-disable max-lines -- The length is governed by the fit-parameterisation, which we can't control */
import log from 'loglevel'
import { createName } from './utils/decorators.js'
import { createInfiniteSeriesMetrics } from '../engine/utils/InfiniteSeriesMetrics.js'
import { createVO2max } from './utils/VO2max.js'
import { FitWriter, fit_messages } from '@markw65/fit-file-writer'

export function createFITRecorder (config) {
  const type = 'fit'
  const postfix = '_rowing'
  const presentationName = 'Garmin fit'
  const sessionHRMetrics = createInfiniteSeriesMetrics()
  const splitActiveHRMetrics = createInfiniteSeriesMetrics()
  const splitRestHRMetrics = createInfiniteSeriesMetrics()
  const splitHRMetrics = createInfiniteSeriesMetrics()
  const lapHRMetrics = createInfiniteSeriesMetrics()
  const VO2max = createVO2max(config)
  let heartRate = 0
  let sessionData = {}
  sessionData.workoutplan = []
  sessionData.workoutplan[0] = { type: 'justrow' }
  sessionData.splits = []
  sessionData.laps = []
  sessionData.strokes = []
  sessionData.HR = []
  sessionData.noActiveSplits = 0
  sessionData.noRestSplits = 0
  sessionData.maxForceCurvePointCount = 0
  sessionData.complete = false
  let postExerciseHR = []
  let lastMetrics = {}
  let fitfileContent
  let fitfileContentIsCurrent = true
  let allDataHasBeenWritten = true

  // Definition of undocumented Garmin 'lap_index' field for splits
  const user_messages = {
    split: {
      fields: {
        lap_index: {
          ...fit_messages.session.fields.first_lap_index,
          name: 'lap_index',
          num: 67
        }
      }
    }
  }

  /**
   * @description This function handles all incomming commands. Here, the recordingmanager will have filtered
   * @param {string} commandName - Command given. As all unneccessary commands are filtered for us, so we only need to react to 'updateIntervalSettings', 'reset' and 'shutdown'
   * @param {object} data - The workout schedule (only with 'updateIntervalSettings')
   */
  async function handleCommand (commandName, data) {
    switch (commandName) {
      case ('updateIntervalSettings'):
        if (!lastMetrics.metricsContext.isMoving) {
          setIntervalParameters(data)
        }
        break
      case ('reset'):
      case ('shutdown'):
        if (lastMetrics !== undefined && !!lastMetrics.metricsContext && lastMetrics.metricsContext.isMoving === true && (lastMetrics.totalNumberOfStrokes > 0) && (lastMetrics.totalMovingTime > sessionData.totalMovingTime)) {
          // We apperantly get a shutdown/crash during session
          addMetricsToStrokesArray(lastMetrics)
          calculateLapMetrics(lastMetrics)
          calculateSplitMetrics(lastMetrics)
          calculateSessionMetrics(lastMetrics)
        }
        break
      default:
        log.error(`fitRecorder: Recieved unknown command: ${commandName}`)
    }
  }

  function setIntervalParameters (intervalParameters) {
    if (intervalParameters !== undefined && intervalParameters.length > 0) {
      sessionData.workoutplan = null
      sessionData.workoutplan = intervalParameters
    }
  }

  /**
   * @description This function records and pre-processes the metrics in the structure for he fit-file to be generated
   * @param {object} metrics - The metrics to be recorded
   * @param {float} metrics.timestamp - The time of recording of the metrics (seconds since epoch)
   * @param {object} metrics.metricsContext - Object containing the flags that represent the session and stroke state
   * @param {boolean} metrics.metricsContext.isSessionStart - Are the metrics recorded at the start of a session
   * @param {boolean} metrics.metricsContext.isIntervalEnd - Are the metrics recorded at the end of the ORM Interval (i.e. Garmin Split)
   * @param {boolean} metrics.metricsContext.isSplitEnd - Are the metrics recorded at the end of an ORM split (i.e. Garmin Lap)
   * @param {boolean} metrics.metricsContext.isPauseStart - Are the metrics recorded at the start of a pause
   * @param {boolean} metrics.metricsContext.isPauseEnd - Are the metrics recorded at the end of a pause
   * @param {boolean} metrics.metricsContext.isDriveStart - Are the metrics recorded at the start of the drive (i.e. recovery end, stroke end)
   * @param {boolean} metrics.metricsContext.isSessionStop - Are the metrics recorded at the end of the session (i.e. the last and final metrics report)
   * @param {integer} metrics.totalNumberOfStrokes - The stroke number
   * @param {float} metrics.totalLinearDistance - The total distance travelled (Meters)
   * @param {float} metrics.totalWork - The total work done on the flywheel (Joules)
   * @param {float} metrics.cycleStrokeRate - The current strokerate (Strokes per minute)
   * @param {float} metrics.cyclePower - The power of the last stroke (Watts)
   * @param {float} metrics.cycleLinearVelocity - The average linear velocity across the last stroke (meters/second)
   * @param {float} metrics.cycleDistance - The distance travelled across the last stroke (Meters)
   * @param {float} metrics.driveLength - Length of handle travel during the drive (Meters)
   * @param {float} metrics.driveDuration - Length of the drive (Seconds)
   * @param {float} metrics.recoveryDuration - Length of the recovery (Seconds)
   * @param {float} metrics.driveAverageHandleForce - Average force on the handle during the drive (Newton)
   * @param {float} metrics.drivePeakHandleForce - Peak force on the handle during the drive (Newton)
   * @param {float} metrics.drivePeakHandleForceNormalizedPosition - Postion of the peak force on the handle in the drive (% of drive length)
   * @param {array} metrics.driveHandleForceCurve - Series of forces during the drive (in Newton, x-axis is drivelength)
   * @param {float} metrics.dragFactor - The dragFactor across the last recovery (Newton * meter * second^2)
   * @param {object} metrics.workout - All metrics related to the total workout progress
   * @param {object} metrics.workout.timeSpent - All time-related metrics related to the workout progress
   * @param {float} metrics.workout.timeSpent.total - Total time spent during the workout (moving + rest, in seconds)
   * @param {float} metrics.workout.timeSpent.moving - Total time spent moving during the workout (seconds)
   * @param {float} metrics.workout.timeSpent.rest - Total time spent resting during the workout (seconds)
   * @param {object} metrics.workout.work - All work-related metrics related to the enire workout
   * @param {float} metrics.workout.work.sinceStart - The total work done on the flywheel in the enire workout (Joules)
   * @param {object} metrics.workout.distance - All distance-related metrics related to the workout progress
   * @param {float} metrics.workout.distance.fromStart - Distance traveled in the workout (Meters)
   * @param {integer} metrics.workout.numberOfStrokes - The number of strokes in the entire workout
   * @param {float} metrics.workout.linearVelocity - All velocity-related metrics related to the enire workout
   * @param {float} metrics.workout.linearVelocity.average - The average velocity in the enire workout (Meters per second)
   * @param {float} metrics.workout.linearVelocity.maximum - The maximum velocity in the enire workout (Meters per second)
   * @param {object} metrics.workout.strokerate - All strokerate-related metrics related to the enire workout
   * @param {float} metrics.workout.strokerate.average - The average strokerate in the enire workout (strokes per minute)
   * @param {float} metrics.workout.strokerate.maximum - The maximum strokerate in the enire workout (strokes per minute)
   * @param {object} metrics.workout.strokeDistance - All strokedistance-related metrics related to the enire workout
   * @param {float} metrics.workout.strokeDistance.average - The average stroke distance in the enire workout (meters per stroke)
   * @param {object} metrics.workout.power - All power-related metrics related to the enire workout
   * @param {float} metrics.workout.power.average - The average power in the enire workout (Watts)
   * @param {float} metrics.workout.power.maximum - The maximum power in the enire workout (Watts)
   * @param {object} metrics.workout.power - The power metrics for the workout
   * @param {float} metrics.workout.power.average - The average power in the workout (Watts)
   * @param {float} metrics.workout.power.maximum - The maximum power in the workout (Watts)
   * @param {object} metrics.workout.averageForce - The average handle force in the drive metrics
   * @param {float} metrics.workout.averageForce.average - The average handle force in the drive, averaged across all drives in the workout (Newton)
   * @param {float} metrics.workout.averageForce.maximum - The maximum of the average handle force in the drive encountered in this workout (Newton)
   * @param {float} metrics.workout.dragfactor - The dragFactor metrics for this workout
   * @param {float} metrics.workout.dragfactor.average - The average dragFactor in the workout (Newton * meter * second^2)
   * @param {object} metrics.workout.caloriesSpent - All calorie-related metrics related to the enire workout
   * @param {float} metrics.workout.caloriesSpent.total - The total calories burned (Calories) during the enire workout (moving + rest, in Calories)
   * @param {float} metrics.workout.caloriesSpent.moving - The total calories burned (Calories) during movement in the enire workout (Calories)
   * @param {float} metrics.workout.caloriesSpent.rest - The total calories burned during resting in the enire workout (Calories)
   * @param {object} metrics.interval - All metrics related to the ORM interval progress
   * @param {integer} metrics.interval.workoutStepNumber - Current workoutstep number the ORM interval belongs to
   * @param {string} metrics.interval.type - Type of the interval (i.e. 'distance', 'time' or 'calories')
   * @param {object} metrics.interval.timeSpent - All time-related metrics related to the ORM interval progress
   * @param {object} metrics.interval.timeSpent.total - The total time spent in the ORM interval (i.e. both moving and resting, in seconds)
   * @param {object} metrics.interval.timeSpent.rest - The total time spent resting in the ORM interval (seconds)
   * @param {object} metrics.interval.timeSpent.moving - The total time spent moving in the ORM interval (seconds)
   * @param {float} metrics.interval.distance - All distance-related metrics related to the ORM interval progress
   * @param {float} metrics.interval.distance.fromStart - The total distance travelled (Meters)
   * @param {object} metrics.interval.calories - All calorie-related metrics related to the interval progress
   * @param {float} metrics.interval.calories.sinceStart - The total calories burned (Calories) in the interval
   * @param {object} metrics.interval.caloriesSpent - All calorie-related metrics related to the interval progress
   * @param {float} metrics.interval.caloriesSpent.rest - The total calories burned (Calories) during rest in the interval
   * @param {float} metrics.interval.linearVelocity - All velocity-related metrics related to the ORM interval progress
   * @param {float} metrics.interval.linearVelocity.average - The average velocity in the interval (Meters per second)
   * @param {float} metrics.interval.linearVelocity.maximum - The maximum velocity in the interval (Meters per second)
   * @param {float} metrics.interval.power.average - The average power in the interval (Watts)
   * @param {float} metrics.interval.power.maximum - The maximum power in the interval (Watts)
   * @param {float} metrics.interval.averageForce.average - The average handle force in the drive, averaged across all drives (Newton)
   * @param {float} metrics.interval.averageForce.maximum - The maximum of the average handle force in the drive (Newton)
   * @param {float} metrics.interval.dragfactor.average - The average dragFactor in the interval (Newton * meter * second^2)
   * @param {object} metrics.split.timeSpent - All time-related metrics related to the ORM interval progress
   * @param {object} metrics.split.timeSpent.total - The total time spent in the ORM split (seconds)
   * @param {object} metrics.split.timeSpent.moving - The total time spent moving in the ORM split (seconds)
   * @param {float} metrics.split.distance - All distance-related metrics related to the ORM split progress
   * @param {float} metrics.split.distance.fromStart - The total distance travelled in the ORM split (Meters)
   * @param {object} metrics.split.work - All work-related metrics related to the ORM split progress
   * @param {float} metrics.split.work.sinceStart - The total work done on the flywheel in the split (Joules)
   * @param {float} metrics.split.linearVelocity - All velocity-related metrics related to the ORM split progress
   * @param {float} metrics.split.linearVelocity.average - The average velocity in the split (Meters per second)
   * @param {float} metrics.split.linearVelocity.maximum - The maximum velocity in the split (Meters per second)
   * @param {object} metrics.split.power - The power metrics for the split
   * @param {float} metrics.split.power.average - The average power in the split (Watts)
   * @param {float} metrics.split.power.maximum - The maximum power in the split (Watts)
   * @param {object} metrics.split.averageForce - The average handle force in the drive metrics
   * @param {float} metrics.split.averageForce.average - The average handle force in the drive, averaged across all drives in the split (Newton)
   * @param {float} metrics.split.averageForce.maximum - The maximum of the average handle force in the drive encountered in this split (Newton)
   * @param {float} metrics.split.dragfactor - The dragFactor metrics for this split
   * @param {float} metrics.split.dragfactor.average - The average dragFactor in the split (Newton * meter * second^2)
   * @param {integer} metrics.split.numberOfStrokes - The number of strokes in the split
   * @param {object} metrics.split.strokerate - All strokerate-related metrics related to the ORM split progress
   * @param {float} metrics.split.strokerate.average - The average strokerate in the split (strokes per minute)
   * @param {float} metrics.split.strokerate.maximum - The maximum strokerate in the split (strokes per minute)
   * @param {object} metrics.split.strokeDistance - All strokedistance-related metrics related to the ORM split progress
   * @param {float} metrics.split.strokeDistance.average - The average stroke distance in the split (meters per stroke)
   * @param {object} metrics.split.power - All power-related metrics related to the ORM split progress
   * @param {float} metrics.split.power.average - The average power in the split (Watts)
   * @param {float} metrics.split.power.maximum - The maximum power in the split (Watts)
   * @param {object} metrics.split.caloriesSpent - All calorie-related metrics related to the interval progress
   * @param {float} metrics.split.caloriesSpent.moving - The total calories burned (Calories) during the ORM split
   */
  function recordRowingMetrics (metrics) {
    switch (true) {
      case (metrics.metricsContext.isSessionStart):
        sessionData.startTime = metrics.timestamp
        startSplit(metrics)
        startLap(metrics)
        sessionData.HR = []
        sessionHRMetrics.reset()
        splitActiveHRMetrics.reset()
        splitRestHRMetrics.reset()
        splitHRMetrics.reset()
        lapHRMetrics.reset()
        if (!isNaN(heartRate) && heartRate > 0) {
          sessionData.HR.push({
            heartrate: heartRate,
            timestamp: metrics.timestamp
          })
          sessionHRMetrics.push(heartRate)
          splitHRMetrics.push(heartRate)
          lapHRMetrics.push(heartRate)
        }
        addMetricsToStrokesArray(metrics)
        break
      case (metrics.metricsContext.isSessionStop && lastMetrics.sessionState !== 'Stopped'):
        addMetricsToStrokesArray(metrics)
        calculateLapMetrics(metrics)
        calculateSplitMetrics(metrics)
        calculateSessionMetrics(metrics)
        postExerciseHR = null
        postExerciseHR = []
        measureRecoveryHR()
        break
      case (metrics.metricsContext.isPauseStart && lastMetrics.sessionState === 'Rowing'):
        addMetricsToStrokesArray(metrics)
        calculateLapMetrics(metrics)
        calculateSplitMetrics(metrics)
        calculateSessionMetrics(metrics)
        splitHRMetrics.reset()
        if (!isNaN(heartRate) && heartRate > 0) { splitRestHRMetrics.push(heartRate) }
        postExerciseHR = null
        postExerciseHR = []
        measureRecoveryHR()
        break
      case (metrics.metricsContext.isPauseEnd):
        // The session is resumed, so it was a pause instead of a stop. First add the rest split and lap
        // eslint-disable-next-line no-case-declarations -- Code clarity outweighs lint rules
        const lastActiveSplitEndtime = sessionData.splits[sessionData.splits.length - 1].endTime
        addRestSplit(metrics, lastActiveSplitEndtime)
        addRestLap(metrics, lastActiveSplitEndtime, metrics.interval.workoutStepNumber)
        // Now start a new active split and lap
        splitHRMetrics.reset()
        startSplit(metrics)
        startLap(metrics)
        addMetricsToStrokesArray(metrics)
        break
      case (metrics.metricsContext.isIntervalEnd):
        addMetricsToStrokesArray(metrics) // Add a trackpoint to provide the lap and split with an anchor
        calculateSplitMetrics(metrics)
        calculateLapMetrics(metrics)
        resetLapMetrics()
        splitHRMetrics.reset()
        startSplit(metrics)
        startLap(metrics)
        break
      case (metrics.metricsContext.isSplitEnd):
        addMetricsToStrokesArray(metrics) // Add a trackpoint to provide the lap and split with an anchor
        calculateLapMetrics(metrics)
        resetLapMetrics()
        startLap(metrics)
        break
      case (metrics.metricsContext.isDriveStart):
        addMetricsToStrokesArray(metrics)
        break
      // no default
    }
    lastMetrics = metrics
  }

  /**
   * @description This function records all data related to a specific stroke
   * @param {object} metrics - The metrics to be recorded
   * @param {float} metrics.timestamp - The time of recording of the metrics (seconds since epoch)
   * @param {integer} metrics.totalNumberOfStrokes - The stroke number
   * @param {float} metrics.totalLinearDistance - The total distance travelled (Meters)
   * @param {float} metrics.totalWork - The total work done on the flywheel (Joules)
   * @param {float} metrics.cycleStrokeRate - The current strokerate (Strokes per minute)
   * @param {float} metrics.cyclePower - The power of the last stroke (Watts)
   * @param {float} metrics.cycleLinearVelocity - The average linear velocity across the last stroke (meters/second)
   * @param {float} metrics.cycleDistance - The distance travelled across the last stroke (Meters)
   * @param {float} metrics.driveLength - Length of handle travel during the drive (Meters)
   * @param {float} metrics.driveDuration - Length of the drive (Seconds)
   * @param {float} metrics.recoveryDuration - Length of the recovery (Seconds)
   * @param {float} metrics.driveAverageHandleForce - Average force on the handle during the drive (Newton)
   * @param {float} metrics.drivePeakHandleForce - Peak force on the handle during the drive (Newton)
   * @param {float} metrics.drivePeakHandleForceNormalizedPosition - Postion of the peak force on the handle in the drive (% of drive length)
   * @param {Array} metrics.driveHandleForceCurve - Series of forces during the drive (in Newton, x-axis is drivelength)
   * @param {float} metrics.dragFactor - The dragFactor across the last recovery (Newton * meter * second^2)
   * @param {object} metrics.workout - All metrics related to the total workout progress
   * @param {object} metrics.workout.timeSpent - All time-related metrics related to the workout progress
   * @param {float} metrics.workout.timeSpent.moving - Total time spent moving during the workout (seconds)
   * @param {float} heartRate - The last known heartRate in the stroke
   */
  function addMetricsToStrokesArray (metrics) {
    sessionData.strokes.push({
      timestamp: metrics.timestamp,
      totalNumberOfStrokes: metrics.totalNumberOfStrokes,
      totalLinearDistance: metrics.totalLinearDistance,
      totalWork: metrics.totalWork,
      cycleStrokeRate: metrics.cycleStrokeRate,
      cyclePower: metrics.cyclePower,
      cycleLinearVelocity: metrics.cycleLinearVelocity,
      cycleDistance: metrics.cycleDistance,
      dragFactor: metrics.dragFactor,
      driveLength: metrics.driveLength,
      strokeDriveTime: metrics.driveDuration,
      strokeRecoveryTime: metrics.recoveryDuration,
      peakDriveForce: metrics.drivePeakHandleForce,
      drivePeakHandleForceNormalizedPosition: metrics.drivePeakHandleForceNormalizedPosition,
      averageDriveForce: metrics.driveAverageHandleForce,
      forceCurve: metrics.driveHandleForceCurve,
      ...(!isNaN(heartRate) && heartRate > 0 ? { heartrate: heartRate } : { heartrate: undefined })
    })
    sessionData.totalMovingTime = metrics.workout.timeSpent.moving
    sessionData.maxForceCurvePointCount = Math.max(sessionData.maxForceCurvePointCount, metrics.driveHandleForceCurve.length)
    VO2max.push(metrics, heartRate)
    fitfileContentIsCurrent = false
    allDataHasBeenWritten = false
  }

  /**
   * @description This sets all metrics at the start of an active Garmin split (= ORM Interval)
   * @param {object} metrics - The metrics to be recorded
   * @param {float} metrics.timestamp - The time of recording of the metrics (seconds since epoch)
   * @param {float} metrics.totalMovingTime - Absolute total moving time since start (seconds)
   * @param {float} metrics.totalLinearDistance - The total distance travelled (Meters)
   * @param {object} metrics.workout - All metrics related to the total workout progress
   * @param {object} metrics.workout.caloriesSpent - All calorie-related metrics related to the workout progress
   * @param {float} metrics.workout.caloriesSpent.total - The total calories burned (Calories)
   */
  function startSplit (metrics) {
    sessionData.noActiveSplits++
    const splitnumber = sessionData.splits.length
    sessionData.splits.push({
      startTime: metrics.timestamp,
      splitNumber: splitnumber,
      totalMovingTimeAtStart: metrics.totalMovingTime,
      startDistance: metrics.totalLinearDistance,
      startCalories: metrics.workout.caloriesSpent.total,
      intensity: 'active',
      complete: false
    })
    if (metrics.metricsContext.isSessionStart) {
      sessionData.splits[splitnumber].startLapNumber = 0
    } else {
      // This references the NEXT lap already
      sessionData.splits[splitnumber].startLapNumber = sessionData.laps.length
    }
    splitActiveHRMetrics.reset()
    splitActiveHRMetrics.push(heartRate)
  }

  /**
   * @description This registers all metrics at end of an active Garmin split (= ORM Interval)
   * @param {object} metrics - The metrics to be recorded
   * @param {float} metrics.timestamp - The time of recording of the metrics (seconds since epoch)
   * @param {object} metrics.interval - All metrics related to the ORM interval progress
   * @param {object} metrics.interval.timeSpent - All time-related metrics related to the ORM interval progress
   * @param {object} metrics.interval.timeSpent.total - The total time spent in the ORM interval (i.e. both moving and resting, in seconds)
   * @param {object} metrics.interval.timeSpent.moving - The total time spent moving in the ORM interval (seconds)
   * @param {float} metrics.interval.distance - All distance-related metrics related to the ORM interval progress
   * @param {float} metrics.interval.distance.fromStart - The total distance travelled (Meters)
   * @param {object} metrics.interval.calories - All calorie-related metrics related to the interval progress
   * @param {float} metrics.interval.calories.sinceStart - The total calories burned (Calories) in the interval
   * @param {float} metrics.interval.linearVelocity - All velocity-related metrics related to the ORM interval progress
   * @param {float} metrics.interval.linearVelocity.average - The average velocity in the interval (Meters per second)
   * @param {float} metrics.interval.linearVelocity.maximum - The maximum velocity in the interval (Meters per second)
   * @param {float} metrics.interval.power.average - The average power in the interval (Watts)
   * @param {float} metrics.interval.power.maximum - The maximum power in the interval (Watts)
   * @param {float} metrics.interval.averageForce.average - The average handle force in the drive, averaged across all drives (Newton)
   * @param {float} metrics.interval.averageForce.maximum - The maximum of the average handle force in the drive (Newton)
   * @param {float} metrics.interval.dragfactor.average - The average dragFactor in the interval (Newton * meter * second^2)
   * @param {object} metrics.workout.timeSpent - All time-related metrics related to the workout progress
   * @param {float} metrics.workout.timeSpent.moving - Total time spent moving during the workout (seconds)
   */
  function calculateSplitMetrics (metrics) {
    const splitnumber = sessionData.splits.length - 1
    sessionData.splits[splitnumber].totalTime = metrics.interval.timeSpent.total
    sessionData.splits[splitnumber].totalMovingTime = metrics.interval.timeSpent.moving
    sessionData.splits[splitnumber].totalLinearDistance = metrics.interval.distance.fromStart
    sessionData.splits[splitnumber].calories = metrics.interval.calories.sinceStart
    sessionData.splits[splitnumber].averageSpeed = metrics.interval.linearVelocity.average
    sessionData.splits[splitnumber].maxSpeed = metrics.interval.linearVelocity.maximum
    sessionData.splits[splitnumber].averagePower = metrics.interval.power.average
    sessionData.splits[splitnumber].maximumPower = metrics.interval.power.maximum
    sessionData.splits[splitnumber].averageHandleAvgForce = metrics.interval.averageForce.average
    sessionData.splits[splitnumber].maximumHandleAvgForce = metrics.interval.averageForce.maximum
    sessionData.splits[splitnumber].dragFactor = metrics.interval.dragfactor.average
    sessionData.splits[splitnumber].endTime = metrics.timestamp
    sessionData.splits[splitnumber].averageHR = splitHRMetrics.average()
    sessionData.splits[splitnumber].maximumHR = splitHRMetrics.maximum()
    sessionData.splits[splitnumber].complete = true
    sessionData.totalMovingTime = metrics.workout.timeSpent.moving
  }

  /**
   * @description This registers all metrics for a Garmin rest split (= ORM rest Interval)
   * @param {object} metrics - The metrics to be recorded
   * @param {float} metrics.timestamp - The time of recording of the metrics (seconds since epoch)
   * @param {object} metrics.interval - All metrics related to the ORM interval progress
   * @param {object} metrics.interval.timeSpent - All time-related metrics related to the ORM interval progress
   * @param {object} metrics.interval.timeSpent.rest - The total time spent resting in the ORM interval (seconds)
   * @param {object} metrics.interval.caloriesSpent - All calorie-related metrics related to the interval progress
   * @param {float} metrics.interval.caloriesSpent.rest - The total calories burned (Calories) during rest in the interval
   * @param {float} startTime - The time of the start of the rest split
   */
  function addRestSplit (metrics, startTime) {
    sessionData.noRestSplits++
    const splitnumber = sessionData.splits.length
    sessionData.splits.push({
      startTime: startTime,
      startDistance: metrics.totalLinearDistance,
      splitNumber: splitnumber,
      intensity: 'rest',
      totalTime: metrics.interval.timeSpent.rest,
      calories: metrics.interval.caloriesSpent.rest,
      endTime: metrics.timestamp,
      averageHR: splitHRMetrics.average(),
      maximumHR: splitHRMetrics.maximum(),
      complete: true
    })
    if (metrics.metricsContext.isSessionStart) {
      sessionData.splits[splitnumber].startLapNumber = 0
    } else {
      // This references the NEXT lap already
      sessionData.splits[splitnumber].startLapNumber = sessionData.laps.length
    }
  }

  /**
   * @description This sets all metrics at the start of an active Garmin lap (= ORM split)
   * @param {object} metrics - The metrics to be recorded
   * @param {float} metrics.timestamp - The time of recording of the metrics (seconds since epoch)
   * @param {float} metrics.totalMovingTime - Absolute total moving time since start (seconds)
   */
  function startLap (metrics) {
    resetLapMetrics()
    const lapnumber = sessionData.laps.length
    sessionData.laps.push({
      startTime: metrics.timestamp,
      lapNumber: lapnumber,
      totalMovingTimeAtStart: metrics.totalMovingTime,
      intensity: 'active',
      complete: false
    })
  }

  /**
   * @description This sets all metrics at the end of an active Garmin lap (= ORM split)
   * @param {object} metrics - The metrics to be recorded
   * @param {float} metrics.timestamp - The time of recording of the metrics (seconds since epoch)
   * @param {object} metrics.metricsContext - Object containing the flags that represent the session and stroke state
   * @param {boolean} metrics.metricsContext.isIntervalEnd - Are the metrics recorded at the end of the ORM Interval (i.e. Garmin Split)
   * @param {boolean} metrics.metricsContext.isSplitEnd - Are the metrics recorded at the end of an ORM split (i.e. Garmin Lap)
   * @param {boolean} metrics.metricsContext.isPauseStart - Are the metrics recorded at the start of a pause
   * @param {boolean} metrics.metricsContext.isSessionStop - Are the metrics recorded at the end of the session (i.e. the last and final metrics report)
   * @param {integer} metrics.interval.workoutStepNumber - Current workoutstep number the ORM split belongs to
   * @param {string} metrics.interval.type - Type of the interval (i.e. 'distance', 'time' or 'calories')
   * @param {object} metrics.split.timeSpent - All time-related metrics related to the ORM interval progress
   * @param {object} metrics.split.timeSpent.total - The total time spent in the ORM split (seconds)
   * @param {object} metrics.split.timeSpent.moving - The total time spent moving in the ORM split (seconds)
   * @param {float} metrics.split.distance - All distance-related metrics related to the ORM split progress
   * @param {float} metrics.split.distance.fromStart - The total distance travelled in the ORM split (Meters)
   * @param {object} metrics.split.work - All work-related metrics related to the ORM split progress
   * @param {float} metrics.split.work.sinceStart - The total work done on the flywheel in the split (Joules)
   * @param {float} metrics.split.linearVelocity - All velocity-related metrics related to the ORM split progress
   * @param {float} metrics.split.linearVelocity.average - The average velocity in the split (Meters per second)
   * @param {float} metrics.split.linearVelocity.maximum - The maximum velocity in the split (Meters per second)
   * @param {object} metrics.split.power - The power metrics for the split
   * @param {float} metrics.split.power.average - The average power in the split (Watts)
   * @param {float} metrics.split.power.maximum - The maximum power in the split (Watts)
   * @param {object} metrics.split.averageForce - The average handle force in the drive metrics
   * @param {float} metrics.split.averageForce.average - The average handle force in the drive, averaged across all drives in the split (Newton)
   * @param {float} metrics.split.averageForce.maximum - The maximum of the average handle force in the drive encountered in this split (Newton)
   * @param {float} metrics.split.dragfactor - The dragFactor metrics for this split
   * @param {float} metrics.split.dragfactor.average - The average dragFactor in the split (Newton * meter * second^2)
   * @param {integer} metrics.split.numberOfStrokes - The number of strokes in the split
   * @param {object} metrics.split.strokerate - All strokerate-related metrics related to the ORM split progress
   * @param {float} metrics.split.strokerate.average - The average strokerate in the split (strokes per minute)
   * @param {float} metrics.split.strokerate.maximum - The maximum strokerate in the split (strokes per minute)
   * @param {object} metrics.split.strokeDistance - All strokedistance-related metrics related to the ORM split progress
   * @param {float} metrics.split.strokeDistance.average - The average stroke distance in the split (meters per stroke)
   * @param {object} metrics.split.power - All power-related metrics related to the ORM split progress
   * @param {float} metrics.split.power.average - The average power in the split (Watts)
   * @param {float} metrics.split.power.maximum - The maximum power in the split (Watts)
   * @param {object} metrics.split.caloriesSpent - All calorie-related metrics related to the interval progress
   * @param {float} metrics.split.caloriesSpent.moving - The total calories burned (Calories) during the ORM split
   * @param {object} metrics.workout.timeSpent - All time-related metrics related to the workout progress
   * @param {float} metrics.workout.timeSpent.moving - Total time spent moving during the workout (seconds)
   */
  function calculateLapMetrics (metrics) {
    const lapnumber = sessionData.laps.length - 1
    sessionData.laps[lapnumber].workoutStepNumber = metrics.interval.workoutStepNumber
    sessionData.laps[lapnumber].endTime = metrics.timestamp
    switch (true) {
      case (metrics.metricsContext.isSessionStop && (metrics.interval.type === 'distance' || metrics.interval.type === 'time')):
        // As the workout closure has its own events, we need to close the workout step here
        sessionData.laps[lapnumber].trigger = metrics.interval.type
        sessionData.laps[lapnumber].event = 'session'
        sessionData.laps[lapnumber].type = 'stop'
        break
      case (metrics.metricsContext.isSessionStop && metrics.interval.type === 'calories'):
        // As calories are not considered a trigger by Garmin, we map it onto a general sessionEnd
        sessionData.laps[lapnumber].trigger = 'sessionEnd'
        sessionData.laps[lapnumber].event = 'session'
        sessionData.laps[lapnumber].type = 'stop'
        break
      case (metrics.metricsContext.isSessionStop):
        sessionData.laps[lapnumber].trigger = 'sessionEnd'
        sessionData.laps[lapnumber].event = 'session'
        sessionData.laps[lapnumber].type = 'stop'
        break
      case (metrics.metricsContext.isIntervalEnd && (metrics.interval.type === 'distance' || metrics.interval.type === 'time')):
        sessionData.laps[lapnumber].trigger = metrics.interval.type
        sessionData.laps[lapnumber].event = 'workoutStep'
        sessionData.laps[lapnumber].type = 'stop'
        break
      case (metrics.metricsContext.isIntervalEnd && metrics.interval.type === 'calories'):
        // As calories are not considered a trigger by Garmin, we map it onto a manual change of a workoutstep
        sessionData.laps[lapnumber].trigger = 'manual'
        sessionData.laps[lapnumber].event = 'workoutStep'
        sessionData.laps[lapnumber].type = 'stop'
        break
      case (metrics.metricsContext.isIntervalEnd):
        sessionData.laps[lapnumber].trigger = 'manual'
        sessionData.laps[lapnumber].event = 'workoutStep'
        sessionData.laps[lapnumber].type = 'stop'
        break
      case (metrics.metricsContext.isPauseStart):
        // As metrics.metricsContext.isIntervalEnd === false, we know this is a spontanuous pause and not a planned rest interval
        sessionData.laps[lapnumber].trigger = 'fitnessEquipment'
        sessionData.laps[lapnumber].event = 'lap'
        sessionData.laps[lapnumber].type = 'stop'
        break
      case (metrics.metricsContext.isSplitEnd && (metrics.split.type === 'distance' || metrics.split.type === 'time')):
        sessionData.laps[lapnumber].trigger = metrics.split.type
        sessionData.laps[lapnumber].event = 'lap'
        sessionData.laps[lapnumber].type = 'stop'
        break
      case (metrics.metricsContext.isSplitEnd && metrics.split.type === 'calories'):
        // As calories are not considered a trigger by Garmin, we map it onto a manual change of a lap
        sessionData.laps[lapnumber].trigger = 'manual'
        sessionData.laps[lapnumber].event = 'lap'
        sessionData.laps[lapnumber].type = 'stop'
        break
      case (metrics.metricsContext.isSplitEnd):
        sessionData.laps[lapnumber].trigger = 'manual'
        sessionData.laps[lapnumber].event = 'lap'
        sessionData.laps[lapnumber].type = 'stop'
        break
      default:
        sessionData.laps[lapnumber].trigger = 'manual'
        sessionData.laps[lapnumber].event = 'lap'
        sessionData.laps[lapnumber].type = 'stop'
    }
    sessionData.laps[lapnumber].summary = { ...metrics.split }
    sessionData.laps[lapnumber].minimumHeartrate = lapHRMetrics.minimum()
    sessionData.laps[lapnumber].averageHeartrate = lapHRMetrics.average()
    sessionData.laps[lapnumber].maximumHeartrate = lapHRMetrics.maximum()
    sessionData.laps[lapnumber].complete = true
    sessionData.totalMovingTime = metrics.workout.timeSpent.moving
  }

  /**
   * @description This registers all metrics for a Garmin rest lap (= ORM split)
   * @param {object} metrics.metricsContext - Object containing the flags that represent the session and stroke state
   * @param {boolean} metrics.metricsContext.isIntervalEnd - Are the metrics recorded at the end of the ORM Interval (i.e. Garmin Split)
   */
  function addRestLap (metrics, startTime, workoutStepNo) {
    resetLapMetrics()
    const lapnumber = sessionData.laps.length
    sessionData.laps.push({
      startTime: startTime,
      lapNumber: lapnumber,
      intensity: 'rest',
      workoutStepNumber: workoutStepNo,
      ...(metrics.metricsContext.isIntervalEnd ? { trigger: 'time' } : { trigger: 'fitnessEquipment' }),
      ...(metrics.metricsContext.isIntervalEnd ? { event: 'workoutStep' } : { event: 'lap' }),
      ...(metrics.metricsContext.isIntervalEnd ? { type: 'stop' } : { type: 'start' }),
      endTime: metrics.timestamp,
      averageHeartrate: lapHRMetrics.average(),
      maximumHeartrate: lapHRMetrics.maximum(),
      summary: { ...metrics.split },
      complete: true
    })
    VO2max.handleRestart(metrics.split.timeSpent.moving)
  }

  /**
   * @description Helper function to reset Garmin lap (= ORM split) HR metrics
   */
  function resetLapMetrics () {
    lapHRMetrics.reset()
    if (!isNaN(heartRate) && heartRate > 0) { lapHRMetrics.push(heartRate) }
  }

  /**
   * @description This registers all metrics at end of a session
   * @param {object} metrics.workout.timeSpent - All time-related metrics related to the workout progress
   * @param {float} metrics.workout.timeSpent.total - Total time spent during the workout (moving + rest, in seconds)
   * @param {float} metrics.workout.timeSpent.moving - Total time spent moving during the workout (seconds)
   * @param {float} metrics.workout.timeSpent.rest - Total time spent resting during the workout (seconds)
   * @param {object} metrics.workout.work - All work-related metrics related to the enire workout
   * @param {float} metrics.workout.work.sinceStart - The total work done on the flywheel in the enire workout (Joules)
   * @param {object} metrics.workout.distance - All distance-related metrics related to the workout progress
   * @param {float} metrics.workout.distance.fromStart - Distance traveled in the workout (Meters)
   * @param {integer} metrics.workout.numberOfStrokes - The number of strokes in the entire workout
   * @param {float} metrics.workout.linearVelocity - All velocity-related metrics related to the enire workout
   * @param {float} metrics.workout.linearVelocity.average - The average velocity in the enire workout (Meters per second)
   * @param {float} metrics.workout.linearVelocity.maximum - The maximum velocity in the enire workout (Meters per second)
   * @param {object} metrics.workout.power - The power metrics for the workout
   * @param {float} metrics.workout.power.average - The average power in the workout (Watts)
   * @param {float} metrics.workout.power.maximum - The maximum power in the workout (Watts)
   * @param {object} metrics.workout.averageForce - The average handle force in the drive metrics
   * @param {float} metrics.workout.averageForce.average - The average handle force in the drive, averaged across all drives in the workout (Newton)
   * @param {float} metrics.workout.averageForce.maximum - The maximum of the average handle force in the drive encountered in this workout (Newton)
   * @param {float} metrics.workout.dragfactor - The dragFactor metrics for this workout
   * @param {float} metrics.workout.dragfactor.average - The average dragFactor in the workout (Newton * meter * second^2)
   * @param {object} metrics.workout.strokerate - All strokerate-related metrics related to the enire workout
   * @param {float} metrics.workout.strokerate.average - The average strokerate in the enire workout (strokes per minute)
   * @param {float} metrics.workout.strokerate.maximum - The maximum strokerate in the enire workout (strokes per minute)
   * @param {object} metrics.workout.strokeDistance - All strokedistance-related metrics related to the enire workout
   * @param {float} metrics.workout.strokeDistance.average - The average stroke distance in the enire workout (meters per stroke)
   * @param {object} metrics.workout.power - All power-related metrics related to the enire workout
   * @param {float} metrics.workout.power.average - The average power in the enire workout (Watts)
   * @param {float} metrics.workout.power.maximum - The maximum power in the enire workout (Watts)
   * @param {object} metrics.workout.caloriesSpent - All calorie-related metrics related to the enire workout
   * @param {float} metrics.workout.caloriesSpent.total - The total calories burned (Calories) during the enire workout (moving + rest, in Calories)
   * @param {float} metrics.workout.caloriesSpent.moving - The total calories burned (Calories) during movement in the enire workout (Calories)
   * @param {float} metrics.workout.caloriesSpent.rest - The total calories burned during resting in the enire workout (Calories)
   */
  function calculateSessionMetrics (metrics) {
    sessionData.totalNoLaps = sessionData.laps.length
    sessionData.totalTime = metrics.workout.timeSpent.total
    sessionData.totalMovingTime = metrics.workout.timeSpent.moving
    sessionData.totalRestTime = metrics.workout.timeSpent.rest
    sessionData.totalWork = metrics.workout.work.sinceStart
    sessionData.totalCalories = metrics.workout.caloriesSpent.total
    sessionData.totalMovingCalories = metrics.workout.caloriesSpent.moving
    sessionData.totalRestCalories = metrics.workout.caloriesSpent.rest
    sessionData.totalLinearDistance = metrics.workout.distance.fromStart
    sessionData.totalNumberOfStrokes = metrics.workout.numberOfStrokes
    sessionData.averageLinearVelocity = metrics.workout.linearVelocity.average
    sessionData.maximumLinearVelocity = metrics.workout.linearVelocity.maximum
    sessionData.averagePower = metrics.workout.power.average
    sessionData.maximumPower = metrics.workout.power.maximum
    sessionData.averageHandleAvgForce = metrics.workout.averageForce.average
    sessionData.maximumHandleAvgForce = metrics.workout.averageForce.maximum
    sessionData.averageStrokerate = metrics.workout.strokerate.average
    sessionData.maximumStrokerate = metrics.workout.strokerate.maximum
    sessionData.averageStrokeDistance = metrics.workout.strokeDistance.average
    sessionData.dragFactor = metrics.workout.dragfactor.average
    sessionData.minimumHeartrate = sessionHRMetrics.minimum()
    sessionData.averageHeartrate = sessionHRMetrics.average()
    sessionData.maximumHeartrate = sessionHRMetrics.maximum()
    sessionData.endTime = metrics.timestamp
    sessionData.complete = true
  }

  /**
   * @description Record each new heart rate value when it is received from heart rate sensor
   * @param {float} heartRate - The updated heartrate (in Beats per Minute)
   */
  async function recordHeartRate (value) {
    if (!isNaN(value.heartrate) && value.heartrate > 0 && value.heartrate < 255) {
      if (value.heartrate !== heartRate) {
        let currentTimestamp = new Date()
        sessionData.HR.push({
          heartrate: value.heartrate,
          timestamp: currentTimestamp
        })
      }
      heartRate = value.heartrate
      lapHRMetrics.push(heartRate)
      splitHRMetrics.push(heartRate)
      if (lastMetrics.sessionState === 'Paused') { splitRestHRMetrics.push(heartRate) }
      if (lastMetrics.sessionState === 'Rowing') { splitActiveHRMetrics.push(heartRate) }
      sessionHRMetrics.push(heartRate)
    }
  }

  /**
   * @description This externally exposed function generates the file content for the file writer and uploaders
   */
  async function fileContent () {
    if (Object.keys(lastMetrics).length === 0 || Object.keys(sessionData).length === 0) { return undefined }

    if (sessionData.laps[sessionData.laps.length - 1].complete !== true) {
      addMetricsToStrokesArray(lastMetrics)
      calculateLapMetrics(lastMetrics)
    }

    if (sessionData.splits[sessionData.splits.length - 1].complete !== true) {
      calculateSplitMetrics(lastMetrics)
    }

    if (sessionData.complete !== true) {
      calculateSessionMetrics(lastMetrics)
    }

    const fitData = await workoutToFit(sessionData)
    if (fitData === undefined) {
      log.error('error creating fit file content')
      return undefined
    } else {
      return fitData
    }
  }

  /**
   * @description This function generates the entire fit-file
   * We use 'summary last message sequencing' as the stream makes most sense that way
   */
  async function workoutToFit (workout) {
    // The file content is filled and hasn't changed
    if (fitfileContentIsCurrent === true && fitfileContent !== undefined) { return fitfileContent }

    const fitWriter = new FitWriter()
    const versionNumber = parseInt(process.env.npm_package_version, 10)

    // The file header
    fitWriter.writeMessage(
      'file_id',
      {
        time_created: fitWriter.time(workout.endTime),
        type: 'activity',
        manufacturer: 'concept2',
        product: 0,
        number: 0
      },
      null,
      true
    )

    fitWriter.writeMessage(
      'file_creator',
      {
        software_version: versionNumber
      },
      null,
      true
    )

    // Register the developer data source
    fitWriter.writeMessage(
      'developer_data_id',
      {
        application_id: '42c9182e-23a6-425f-b8fc-316d3d164a6f'
          .replace(/-/g, '')
          .match(/../g)
          .map((s) => parseInt(s, 16)),
        developer_data_index: 0,
        application_version: versionNumber
      },
      null,
      true
    )

    fitWriter.writeMessage(
      'field_description',
      {
        developer_data_index: 0,
        field_definition_number: 0,
        fit_base_type_id: 'uint16',
        field_name: 'DriveLength',
        scale: 100,
        units: 'm'
      },
      null,
      true
    )

    fitWriter.writeMessage(
      'field_description',
      {
        developer_data_index: 0,
        field_definition_number: 1,
        fit_base_type_id: 'uint16',
        field_name: 'StrokeDriveTime',
        scale: 1,
        units: 'ms'
      },
      null,
      true
    )

    // Register each developer field individually
    fitWriter.writeMessage(
      'field_description',
      {
        developer_data_index: 0,
        field_definition_number: 2,
        fit_base_type_id: 'uint16',
        field_name: 'DragFactor',
        scale: 1,
        units: '10^-6 N*m*s^2'
      },
      null,
      true
    )

    fitWriter.writeMessage(
      'field_description',
      {
        developer_data_index: 0,
        field_definition_number: 3,
        fit_base_type_id: 'uint16',
        field_name: 'StrokeRecoveryTime',
        scale: 1,
        units: 'ms'
      },
      null,
      true
    )

    fitWriter.writeMessage(
      'field_description',
      {
        developer_data_index: 0,
        field_definition_number: 6,
        fit_base_type_id: 'uint16',
        field_name: 'AverageDriveForce',
        scale: 10,
        units: 'N'
      },
      null,
      true
    )

    fitWriter.writeMessage(
      'field_description',
      {
        developer_data_index: 0,
        field_definition_number: 7,
        fit_base_type_id: 'uint16',
        field_name: 'PeakDriveForce',
        scale: 10,
        units: 'N'
      },
      null,
      true
    )

    fitWriter.writeMessage(
      'field_description',
      {
        developer_data_index: 0,
        field_definition_number: 17,
        fit_base_type_id: 'uint16',
        field_name: 'PeakForcePositionNorm',
        scale: 100,
        units: '%'
      },
      null,
      true
    )

    fitWriter.writeMessage(
      'field_description',
      {
        developer_data_index: 0,
        field_definition_number: 90,
        fit_base_type_id: 'uint8',
        field_name: 'InstrokeAbscissaType',
        scale: 1
      },
      null,
      true
    )

    fitWriter.writeMessage(
      'field_description',
      {
        developer_data_index: 0,
        field_definition_number: 91,
        fit_base_type_id: 'uint16',
        field_name: 'InstrokeSampleInterval',
        scale: 100,
        units: 'cm'
      },
      null,
      true
    )

    fitWriter.writeMessage(
      'field_description',
      {
        developer_data_index: 0,
        field_definition_number: 92,
        fit_base_type_id: 'uint8',
        field_name: 'InstrokePointCount',
        scale: 1
      },
      null,
      true
    )

    fitWriter.writeMessage(
      'field_description',
      {
        developer_data_index: 0,
        field_definition_number: 60,
        fit_base_type_id: 'uint16',
        array: Math.min(127, sessionData.maxForceCurvePointCount),
        scale: 10,
        field_name: 'HandleForceCurve',
        units: 'N'
      },
      null,
      true
    )

    // Activity summary
    fitWriter.writeMessage(
      'activity',
      {
        timestamp: fitWriter.time(workout.endTime),
        local_timestamp: fitWriter.time(workout.startTime) - workout.startTime.getTimezoneOffset() * 60,
        total_timer_time: workout.totalTime,
        num_sessions: 1,
        event: 'activity',
        event_type: 'stop',
        type: 'manual'
      },
      null,
      true
    )

    fitWriter.writeMessage(
      'device_info',
      {
        timestamp: fitWriter.time(workout.endTime),
        device_index: 0,
        device_type: 0,
        manufacturer: 'concept2'
      },
      null,
      true
    )

    // The below message deliberately leans on the config.userSettings as they might be changed by external sources
    fitWriter.writeMessage(
      'user_profile',
      {
        gender: config.userSettings.sex,
        weight: config.userSettings.weight,
        weight_setting: 'metric',
        resting_heart_rate: config.userSettings.restingHR,
        default_max_heart_rate: config.userSettings.maxHR
      },
      null,
      true
    )

    fitWriter.writeMessage(
      'sport',
      {
        sport: 'rowing',
        sub_sport: 'indoorRowing',
        name: 'Indoor rowing'
      },
      null,
      true
    )

    /*
     * The session summary
     */
    const developerFieldValues = []

    if (workout.dragFactor > 0) {
      developerFieldValues.push({ developer_data_index: 0, field_num: 2, value: workout.dragFactor })
    }

    fitWriter.writeMessage(
      'session',
      {
        timestamp: fitWriter.time(workout.endTime),
        message_index: 0,
        sport: 'rowing',
        sub_sport: 'indoorRowing',
        event: 'session',
        event_type: 'stop',
        trigger: 'activityEnd',
        sport_profile_name: 'Row Indoor',
        start_time: fitWriter.time(workout.startTime),
        total_elapsed_time: workout.totalTime,
        total_timer_time: workout.totalTime,
        total_moving_time: workout.totalMovingTime,
        total_distance: workout.totalLinearDistance,
        total_work: workout.totalWork,
        total_calories: workout.totalCalories,
        total_cycles: workout.totalNumberOfStrokes,
        avg_speed: workout.averageLinearVelocity,
        max_speed: workout.maximumLinearVelocity,
        avg_power: workout.averagePower,
        max_power: workout.maximumPower,
        avg_force: workout.averageHandleAvgForce,
        max_force: workout.maximumHandleAvgForce,
        avg_cadence: workout.averageStrokerate,
        max_cadence: workout.maximumStrokerate,
        ...(workout.minimumHeartrate > 0 ? { min_heart_rate: workout.minimumHeartrate } : {}),
        ...(workout.averageHeartrate > 0 ? { avg_heart_rate: workout.averageHeartrate } : {}),
        ...(workout.maximumHeartrate > 0 ? { max_heart_rate: workout.maximumHeartrate } : {}),
        ...(postExerciseHR[2] > 0 ? { recovery_heart_rate: postExerciseHR[2] } : {}),
        avg_stroke_distance: workout.averageStrokeDistance,
        first_lap_index: 0,
        num_laps: sessionData.totalNoLaps
      },
      developerFieldValues,
      true
    )

    // The workout definition before the start
    await createWorkoutSteps(fitWriter, workout)

    // Write the splits
    await writeSplits(fitWriter, workout)

    // Write the laps
    await writeLaps(fitWriter, workout)

    // Write the events
    await writeEvents(fitWriter, workout)

    await writeRecords(fitWriter, workout)

    await writeHRData(fitWriter, workout)

    await createVO2MaxRecord(fitWriter, workout)

    await addHRR2Event(fitWriter)

    fitfileContent = fitWriter.finish()
    fitfileContentIsCurrent = true
    return fitfileContent
  }

  /**
   * Creation of all splits (= ORM Intervals)
   */
  async function writeSplits (writer, workout) {
    // Write the split summary
    writer.writeMessage(
      'split_summary',
      {
        timestamp: writer.time(sessionData.endTime),
        message_index: 0,
        split_type: 'interval_active',
        num_splits: sessionData.noActiveSplits,
        total_timer_time: workout.totalMovingTime,
        total_distance: workout.totalLinearDistance,
        avg_speed: workout.averageLinearVelocity,
        max_speed: workout.maximumLinearVelocity,
        total_calories: sessionData.totalMovingCalories,
        ...(splitActiveHRMetrics.average() > 0 ? { avg_heart_rate: splitActiveHRMetrics.average() } : {}),
        ...(splitActiveHRMetrics.maximum() > 0 ? { max_heart_rate: splitActiveHRMetrics.maximum() } : {})
      },
      null,
      sessionData.noRestSplits === 0
    )

    if (sessionData.noRestSplits > 0) {
      // There was a pause
      writer.writeMessage(
        'split_summary',
        {
          timestamp: writer.time(sessionData.endTime),
          message_index: 1,
          split_type: 'interval_rest',
          num_splits: sessionData.noRestSplits,
          total_timer_time: sessionData.totalRestTime,
          total_distance: 0,
          avg_speed: 0,
          max_speed: 0,
          total_calories: sessionData.totalRestCalories,
          ...(splitRestHRMetrics.average() > 0 ? { avg_heart_rate: splitRestHRMetrics.average() } : {}),
          ...(splitRestHRMetrics.maximum() > 0 ? { max_heart_rate: splitRestHRMetrics.maximum() } : {})
        },
        null,
        true
      )
    }

    // Create the individual splits
    let i = 0
    while (i < workout.splits.length) {
      if (workout.splits[i].intensity === 'active') {
        // eslint-disable-next-line no-await-in-loop -- This is inevitable if you want to have some decent order in the file
        await createActiveSplit(writer, workout.splits[i])
      } else {
        // This is a rest interval
        // eslint-disable-next-line no-await-in-loop -- This is inevitable if you want to have some decent order in the file
        await createRestSplit(writer, workout.splits[i])
      }
      i++
    }
  }

  /**
   * Creation of the active split (= ORM Interval)
   */
  async function createActiveSplit (writer, splitdata) {
    if (!!splitdata.complete && splitdata.complete) {
      // The split is complete
      const developerFieldValues = []

      if (splitdata.dragFactor > 0) {
        developerFieldValues.push({ developer_data_index: 0, field_num: 2, value: splitdata.dragFactor })
      }

      writer.writeCustomMessage(
        user_messages,
        'split',
        {
          timestamp: writer.time(sessionData.endTime),
          message_index: splitdata.splitNumber,
          lap_index: splitdata.startLapNumber,
          sport: 'rowing',
          sub_sport: 'indoorRowing',
          split_type: 'interval_active',
          total_elapsed_time: splitdata.totalTime,
          total_timer_time: splitdata.totalTime,
          total_moving_time: splitdata.totalMovingTime,
          total_distance: splitdata.totalLinearDistance,
          avg_speed: splitdata.averageSpeed,
          max_speed: splitdata.maxSpeed,
          avg_power: splitdata.averagePower,
          max_power: splitdata.maximumPower,
          total_calories: splitdata.calories,
          start_time: writer.time(splitdata.startTime),
          start_distance: splitdata.startDistance,
          end_time: writer.time(splitdata.endTime),
          ...(splitdata.averageHR > 0 ? { avg_heart_rate: splitdata.averageHR } : {}),
          ...(splitdata.maximumHR > 0 ? { max_heart_rate: splitdata.maximumHR } : {})
        },
        developerFieldValues,
        (splitdata.splitNumber + 1) === (sessionData.noRestSplits + sessionData.noActiveSplits)
      )
    }
  }

  /**
   * Creation of the rest split (=ORM planned Rest Interval)
   */
  async function createRestSplit (writer, splitdata) {
    // First, make sure the rest lap is complete
    if (!!splitdata.complete && splitdata.complete) {
      // Add a rest lap summary
      writer.writeCustomMessage(
        user_messages,
        'split',
        {
          timestamp: writer.time(sessionData.endTime),
          message_index: splitdata.splitNumber,
          lap_index: splitdata.startLapNumber,
          sport: 'rowing',
          sub_sport: 'indoorRowing',
          split_type: 'interval_rest',
          total_elapsed_time: splitdata.totalTime,
          total_timer_time: splitdata.totalTime,
          total_moving_time: 0,
          total_distance: 0,
          avg_speed: 0,
          max_speed: 0,
          avg_power: 0,
          max_power: 0,
          total_calories: splitdata.calories,
          start_time: writer.time(splitdata.startTime),
          start_distance: splitdata.startDistance,
          end_time: writer.time(splitdata.endTime),
          ...(splitdata.averageHR > 0 ? { avg_heart_rate: splitdata.averageHR } : {}),
          ...(splitdata.maximumHR > 0 ? { max_heart_rate: splitdata.maximumHR } : {})
        },
        null,
        (splitdata.splitNumber + 1) === (sessionData.noRestSplits + sessionData.noActiveSplits)
      )
    }
  }

  async function writeLaps (writer, workout) {
    // Write all laps
    let i = 0
    while (i < workout.laps.length) {
      if (workout.laps[i].intensity === 'active') {
        // eslint-disable-next-line no-await-in-loop -- This is inevitable if you want to have some decent order in the file
        await createActiveLap(writer, workout.laps[i])
      } else {
        // This is a rest interval
        // eslint-disable-next-line no-await-in-loop -- This is inevitable if you want to have some decent order in the file
        await createRestLap(writer, workout.laps[i])
      }
      i++
    }
  }

  async function createActiveLap (writer, lapdata) {
    // It is an active lap, after we make sure it is a completed lap, we can write all underlying records
    if (!!lapdata.complete && lapdata.complete) {
      // The split is complete
      const developerFieldValues = []

      if (lapdata.summary.dragfactor.average > 0) {
        developerFieldValues.push({ developer_data_index: 0, field_num: 2, value: lapdata.summary.dragfactor.average })
      }

      writer.writeMessage(
        'lap',
        {
          timestamp: writer.time(sessionData.endTime),
          message_index: lapdata.lapNumber,
          sport: 'rowing',
          sub_sport: 'indoorRowing',
          event: lapdata.event,
          wkt_step_index: lapdata.workoutStepNumber,
          event_type: lapdata.type,
          intensity: lapdata.intensity,
          ...(sessionData.totalNoLaps === (lapdata.lapNumber + 1) ? { lap_trigger: 'sessionEnd' } : { lap_trigger: lapdata.trigger }),
          start_time: writer.time(lapdata.startTime),
          total_elapsed_time: lapdata.summary.timeSpent.total,
          total_timer_time: lapdata.summary.timeSpent.total,
          total_moving_time: lapdata.summary.timeSpent.moving,
          total_distance: lapdata.summary.distance.fromStart,
          total_cycles: lapdata.summary.numberOfStrokes,
          avg_cadence: lapdata.summary.strokerate.average,
          max_cadence: lapdata.summary.strokerate.maximum,
          avg_stroke_distance: lapdata.summary.strokeDistance.average,
          total_work: lapdata.summary.work.sinceStart,
          total_calories: lapdata.summary.caloriesSpent.moving,
          avg_speed: lapdata.summary.linearVelocity.average,
          max_speed: lapdata.summary.linearVelocity.maximum,
          avg_power: lapdata.summary.power.average,
          max_power: lapdata.summary.power.maximum,
          avg_force: lapdata.summary.averageForce.average,
          max_force: lapdata.summary.averageForce.maximum,
          ...(lapdata.minimumHeartrate > 0 ? { min_heart_rate: lapdata.minimumHeartrate } : {}),
          ...(lapdata.averageHeartrate > 0 ? { avg_heart_rate: lapdata.averageHeartrate } : {}),
          ...(lapdata.maximumHeartrate > 0 ? { max_heart_rate: lapdata.maximumHeartrate } : {})
        },
        developerFieldValues,
        sessionData.totalNoLaps === (lapdata.lapNumber + 1)
      )
    }
  }

  async function createRestLap (writer, lapdata) {
    // First, make sure the rest lap is complete
    if (!!lapdata.complete && lapdata.complete) {
      writer.writeMessage(
        'lap',
        {
          timestamp: writer.time(sessionData.endTime),
          message_index: lapdata.lapNumber,
          sport: 'rowing',
          sub_sport: 'indoorRowing',
          event: lapdata.event,
          wkt_step_index: lapdata.workoutStepNumber,
          event_type: lapdata.type,
          intensity: lapdata.intensity,
          lap_trigger: lapdata.trigger,
          start_time: writer.time(lapdata.startTime),
          total_elapsed_time: lapdata.summary.timeSpent.total,
          total_timer_time: lapdata.summary.timeSpent.total,
          total_moving_time: 0,
          total_distance: 0,
          total_cycles: 0,
          avg_cadence: 0,
          max_cadence: 0,
          avg_stroke_distance: 0,
          total_calories: lapdata.summary.caloriesSpent.rest,
          avg_speed: 0,
          max_speed: 0,
          avg_power: 0,
          max_power: 0,
          ...(lapdata.averageHeartrate > 0 ? { avg_heart_rate: lapdata.averageHeartrate } : {}),
          ...(lapdata.maximumHeartrate > 0 ? { max_heart_rate: lapdata.maximumHeartrate } : {})
        },
        null,
        sessionData.totalNoLaps === (lapdata.lapNumber + 1)
      )
    }
  }

  /**
   * Write all events to the FIT-file
   * @ToDo Rewrite this in such a way that during recording an array of events is generated (as preperation for workout targets that can result in underspeed, highHR, etc. events)
   */
  async function writeEvents (writer, workout) {
    // Start of the session
    await addEvent(writer, workout.startTime, 'workout', 'start')
    await addEvent(writer, workout.startTime, 'timer', 'start')

    // Write all rest laps
    let i = 0
    while (i < workout.laps.length) {
      if (workout.laps[i].intensity === 'rest') {
        // This is a rest interval
        // eslint-disable-next-line no-await-in-loop -- This is inevitable if you want to have some decent order in the file
        await addEvent(writer, workout.laps[i].startTime, workout.laps[i].event, 'stop')
        // eslint-disable-next-line no-await-in-loop -- This is inevitable if you want to have some decent order in the file
        await addEvent(writer, workout.laps[i].endTime, 'timer', 'start')
      }
      i++
    }

    // Finish the seesion with a stop event
    await addEvent(writer, workout.endTime, 'timer', 'stopAll')
    await addEvent(writer, workout.endTime, 'workout', 'stop')
  }

  async function addEvent (writer, time, event, eventType) {
    writer.writeMessage(
      'event',
      {
        timestamp: writer.time(time),
        event: event,
        event_type: eventType,
        event_group: 0
      },
      null,
      true
    )
  }

  /**
   * @description This generates the planned workout structure
   * @see {@link https://developer.garmin.com/fit/file-types/workout/|a general description of the workout structure}
   * @see {@link https://developer.garmin.com/fit/cookbook/encoding-workout-files/|a detailed description of the workout structure}
   */
  async function createWorkoutSteps (writer, workout) {
    // The file header
    writer.writeMessage(
      'training_file',
      {
        timestamp: writer.time(sessionData.endTime),
        time_created: writer.time(workout.startTime),
        type: 'workout',
        manufacturer: 'concept2',
        product: 0,
        serial_number: 0
      },
      null,
      true
    )

    const maxWorkoutStepNumber = workout.laps[workout.laps.length - 1].workoutStepNumber
    writer.writeMessage(
      'workout',
      {
        sport: 'rowing',
        sub_sport: 'indoorRowing',
        capabilities: 'fitnessEquipment',
        num_valid_steps: maxWorkoutStepNumber + 1,
        wkt_name: `Indoor rowing ${createName(workout.totalLinearDistance, workout.totalMovingTime)}`
      },
      null,
      true
    )

    let i = 0
    while (i < workout.workoutplan.length && i <= maxWorkoutStepNumber) {
      switch (true) {
        case (workout.workoutplan[i].type === 'distance' && workout.workoutplan[i].targetDistance > 0):
          // A target distance is set
          createWorkoutStep(writer, i, 'distance', workout.workoutplan[i].targetDistance * 100, 'active')
          break
        case (workout.workoutplan[i].type === 'time' && workout.workoutplan[i].targetTime > 0):
          // A target time is set
          createWorkoutStep(writer, i, 'time', workout.workoutplan[i].targetTime * 1000, 'active')
          break
        case (workout.workoutplan[i].type === 'calories' && workout.workoutplan[i].targetCalories > 0):
          // A target time is set
          createWorkoutStep(writer, i, 'calories', workout.workoutplan[i].targetCalories, 'active')
          break
        case (workout.workoutplan[i].type === 'rest' && workout.workoutplan[i].targetTime > 0):
          // A target time is set
          createWorkoutStep(writer, i, 'time', workout.workoutplan[i].targetTime * 1000, 'rest')
          break
        case (workout.workoutplan[i].type === 'justrow'):
          createWorkoutStep(writer, i, 'open', 0, 'active')
          break
        default:
          // Nothing to do here, ignore malformed data
      }
      i++
    }
  }

  /**
   * @description This generates the individual workout steps
   */
  async function createWorkoutStep (writer, stepNumber, durationType, durationValue, intensityValue) {
    writer.writeMessage(
      'workout_step',
      {
        message_index: stepNumber,
        duration_type: durationType,
        ...(durationValue > 0 ? { duration_value: durationValue } : {}),
        intensity: intensityValue
      },
      null,
      true
    )
  }

  /**
   * @description This loops through all recorded strokes and adds them to the fit-structure
   */
  async function writeRecords (writer, workout) {
    // It is an active lap, after we make sure it is a completed lap, we can write all underlying records
    if (!!sessionData.totalMovingTime && sessionData.totalMovingTime > 0 && !!workout.strokes[workout.strokes.length - 1].totalLinearDistance && workout.strokes[workout.strokes.length - 1].totalLinearDistance > 0) {
      let i = 0
      while (i < workout.strokes.length) {
        // eslint-disable-next-line no-await-in-loop -- This is inevitable if you want to have some decent order in the file
        await createTrackPoint(writer, workout.strokes[i])
        i++
      }
    }
  }

  /**
   * @description This creates the individual stroke
   */
  async function createTrackPoint (writer, trackpoint) {
    const developerFieldValues = []
    if (trackpoint.dragFactor > 0) {
      developerFieldValues.push({ developer_data_index: 0, field_num: 2, value: trackpoint.dragFactor })
    }

    if (trackpoint.strokeDriveTime > 0) {
      developerFieldValues.push({ developer_data_index: 0, field_num: 1, value: trackpoint.strokeDriveTime * 1000 })
    }

    if (trackpoint.strokeRecoveryTime > 0) {
      developerFieldValues.push({ developer_data_index: 0, field_num: 3, value: trackpoint.strokeRecoveryTime * 1000 })
    }

    if (trackpoint.driveLength > 0) {
      developerFieldValues.push({ developer_data_index: 0, field_num: 0, value: trackpoint.driveLength * 100 })
    }

    if (trackpoint.averageDriveForce > 0) {
      developerFieldValues.push({ developer_data_index: 0, field_num: 6, value: trackpoint.averageDriveForce })
    }

    if (trackpoint.peakDriveForce > 0) {
      developerFieldValues.push({ developer_data_index: 0, field_num: 7, value: trackpoint.peakDriveForce })
      developerFieldValues.push({ developer_data_index: 0, field_num: 17, value: trackpoint.drivePeakHandleForceNormalizedPosition * 100 })
    }

    if (trackpoint.forceCurve.length > 0 && trackpoint.forceCurve.length < 128) {
      const sampleInterval = trackpoint.driveLength / trackpoint.forceCurve.length
      const paddedForceCurve = Array.from({ length: sessionData.maxForceCurvePointCount }, (_, i) => trackpoint.forceCurve[i] ?? '0')
      developerFieldValues.push({ developer_data_index: 0, field_num: 90, value: 2 })
      developerFieldValues.push({ developer_data_index: 0, field_num: 91, value: sampleInterval * 10000 })
      developerFieldValues.push({ developer_data_index: 0, field_num: 92, value: trackpoint.forceCurve.length })
      developerFieldValues.push({ developer_data_index: 0, field_num: 60, value: paddedForceCurve })
    }

    writer.writeMessage(
      'record',
      {
        timestamp: writer.time(trackpoint.timestamp),
        distance: trackpoint.totalLinearDistance,
        accumulated_power: trackpoint.totalWork,
        total_cycles: trackpoint.totalNumberOfStrokes,
        activity_type: 'fitnessEquipment',
        ...(trackpoint.cycleLinearVelocity > 0 || trackpoint.isPauseStart ? { speed: trackpoint.cycleLinearVelocity } : {}),
        ...(trackpoint.cyclePower > 0 || trackpoint.isPauseStart ? { power: trackpoint.cyclePower } : {}),
        ...(trackpoint.cycleStrokeRate > 0 ? { cadence: trackpoint.cycleStrokeRate } : {}),
        ...(trackpoint.cycleDistance > 0 ? { cycle_length16: trackpoint.cycleDistance } : {}),
        ...(trackpoint.dragFactor > 0 && trackpoint.dragFactor < 255 ? { resistance: trackpoint.dragFactor } : {}), // As the data is stored in an int8, we need to guard against exceeding that
        ...(trackpoint.heartrate !== undefined && trackpoint.heartrate > 0 ? { heart_rate: trackpoint.heartrate } : {}),
        force: trackpoint.averageDriveForce
      },
      developerFieldValues
    )
  }

  /**
   * @description Writes all the individual HR measurements to the file
   */
  async function writeHRData (writer, workout) {
    let i = 0
    let timeSinceStart
    while (i < workout.HR.length) {
      timeSinceStart = workout.HR[i].timestamp.getTime() - workout.HR[0].timestamp.getTime()
      writer.writeMessage(
        'hr',
        {
          timestamp: writer.time(workout.HR[i].timestamp),
          event_timestamp: [timeSinceStart],
          filtered_bpm: [Math.round(workout.HR[i].heartrate)]
        }
      )
      i++
    }
  }

  /**
   * @description This adds the VO2Max data to the FIT-file structure
   */
  async function createVO2MaxRecord (writer, workout) {
    if (!isNaN(VO2max.result()) && VO2max.result() > 10 && VO2max.result() < 60) {
      writer.writeMessage(
        'max_met_data',
        {
          update_time: writer.time(workout.endTime),
          sport: 'rowing',
          sub_sport: 'indoorRowing',
          vo2_max: VO2max.result(),
          max_met_category: 'generic'
        },
        null,
        true
      )
    }
  }

  /**
   * @description This adds the recovery heartrate (after two minutes) data to the FIT-file structure
   */
  async function addHRR2Event (writer) {
    if (postExerciseHR.length >= 2 && !isNaN(postExerciseHR[2]) && postExerciseHR[2] > 0) {
      writer.writeMessage(
        'event',
        {
          timestamp: writer.time(new Date()),
          event: 'recoveryHr',
          event_type: 'marker',
          data: postExerciseHR[2]
        },
        null,
        true
      )
    }
  }

  /**
   * @description This function is called when the rowing session is stopped to record recovery heartrate.
   * postExerciseHR[0] is the last measured excercise HR. Thus postExerciseHR[1] is Recovery HR after 1 min, etc..
   */
  function measureRecoveryHR () {
    if (!isNaN(heartRate) && config.userSettings.restingHR <= heartRate && heartRate <= config.userSettings.maxHR) {
      log.debug(`*** Fit-recorder HRR-${postExerciseHR.length}: ${heartRate}`)
      postExerciseHR.push(heartRate)
      fitfileContentIsCurrent = false
      allDataHasBeenWritten = false
      if (postExerciseHR.length < 4) {
        // We haven't got three post-exercise HR measurements yet, let's schedule the next measurement
        setTimeout(measureRecoveryHR, 60000)
      } else {
        log.debug('*** Skipped HRR measurement')
      }
    }
  }

  /**
   * @description Helper function to determine if FIT-file generation is usefull based on number of strokes and time passed
   */
  function minimumDataAvailable () {
    return (minimumRecordingTimeHasPassed() && minimumNumberOfStrokesHaveCompleted())
  }

  /**
   * @description Helper function to determine if FIT-file generation is usefull based on the number of the total time passed
   */
  function minimumRecordingTimeHasPassed () {
    const minimumRecordingTimeInSeconds = 10
    if (lastMetrics !== undefined && lastMetrics.totalMovingTime !== undefined) {
      const strokeTimeTotal = lastMetrics.totalMovingTime
      return (strokeTimeTotal > minimumRecordingTimeInSeconds)
    } else {
      return false
    }
  }

  /**
   * @description Helper function to determine if FIT-file generation is usefull based on the number of strokes
   */
  function minimumNumberOfStrokesHaveCompleted () {
    const minimumNumberOfStrokes = 2
    if (lastMetrics !== undefined && lastMetrics.totalNumberOfStrokes !== undefined) {
      const noStrokes = lastMetrics.totalNumberOfStrokes
      return (noStrokes > minimumNumberOfStrokes)
    } else {
      return false
    }
  }

  /**
   * @description This function exposes the total recorded distance to the calling context
   */
  function totalRecordedDistance () {
    if (!!sessionData.totalLinearDistance && sessionData.totalLinearDistance > 0) {
      return sessionData.totalLinearDistance
    } else {
      return 0
    }
  }

  /**
   * @description This function exposes the total recorded moving time to the calling context
   */
  function totalRecordedMovingTime () {
    if (!!sessionData.totalMovingTime && sessionData.totalMovingTime > 0) {
      return sessionData.totalMovingTime
    } else {
      return 0
    }
  }

  /**
   * @description This function exposes the average dragfactor to the calling context
   */
  function sessionDrag () {
    return lastMetrics.workout.dragfactor.average
  }

  /**
   * @description This function exposes the calculated VO2Max to the calling context
   */
  function sessionVO2Max () {
    if (VO2max.result() > 10 && VO2max.result() < 60) {
      return VO2max.result()
    } else {
      return undefined
    }
  }

  /**
   * @description This function exposes the Recovery Heartrate to the calling context
   */
  function sessionHRR () {
    if (postExerciseHR.length > 1 && (postExerciseHR[0] > (0.7 * config.userSettings.maxHR))) {
      // Recovery Heartrate is only defined when the last excercise HR is above 70% of the maximum Heartrate
      return postExerciseHR
    } else {
      return []
    }
  }

  /**
   * @description This function resets the fit recorder
   */
  function reset () {
    heartRate = 0
    lapHRMetrics.reset()
    splitHRMetrics.reset()
    splitActiveHRMetrics.reset()
    splitRestHRMetrics.reset()
    sessionHRMetrics.reset()
    sessionData = null
    sessionData = {}
    sessionData.workoutplan = []
    sessionData.workoutplan[0] = { type: 'justrow' }
    sessionData.splits = []
    sessionData.laps = []
    sessionData.strokes = []
    sessionData.HR = []
    sessionData.noActiveSplits = 0
    sessionData.noRestSplits = 0
    sessionData.maxForceCurvePointCount = 0
    sessionData.complete = false
    postExerciseHR = null
    postExerciseHR = []
    VO2max.reset()
    lastMetrics = {}
    fitfileContent = null
    fitfileContentIsCurrent = true
    allDataHasBeenWritten = true
  }

  return {
    handleCommand,
    setIntervalParameters,
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
