'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
/**
 * @file Contains all mapping functions needed to map the internal ORM state to the externally communicated Concept2 PM5 states
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/blob/main/docs/PM5_Interface.md|for the entire interface description}
 */
/* eslint-disable no-unreachable -- the breaks after the returns trigger this, but there is a lot to say for being systematic about this */
/* eslint-disable complexity -- There are a lot of decission tables needed to thread this needle */
import { DurationTypes, IntervalTypes, OperationalStates, RowingState, StrokeState, WorkoutState, WorkoutTypes } from './../csafe-service/CsafeCommandsMapping.js'

/**
 * PM5 uses 128bit UUIDs that are always prefixed and suffixed the same way
 * @param {string} uuid
 */
export function toC2128BitUUID (uuid) {
  return `CE06${uuid}-43E5-11E4-916C-0800200C9A66`
}

/**
 * Converts the internal workout/interval/split structure to C2's OBJ_WORKOUTTYPE_T
 * Is used by characteristics:
 * - status-characteristics/GeneralStatusCharacteristic.js (0x0031)
 * - session-characteristics/WorkoutSummaryCharacteristic.js (0x0039)
 */
export function toC2WorkoutType (baseMetrics) {
  const splitPresent = (baseMetrics.split.type === 'distance' || baseMetrics.split.type === 'time' || baseMetrics.split.type === 'calories')
  switch (true) {
    case (baseMetrics.workout.numberOfIntervals === 1 && baseMetrics.workout.type === 'justrow' && baseMetrics.split.type === 'justrow'):
      return WorkoutTypes.WORKOUTTYPE_JUSTROW_NOSPLITS
      break
    case (baseMetrics.workout.numberOfIntervals === 1 && baseMetrics.workout.type === 'justrow' && splitPresent):
      return WorkoutTypes.WORKOUTTYPE_JUSTROW_SPLITS
      break
    case (baseMetrics.workout.numberOfIntervals === 1 && baseMetrics.workout.type === 'distance' && baseMetrics.split.type === 'distance' && baseMetrics.interval.distance.target === baseMetrics.split.distance.target):
      // There is just a single split with the same size as the interval
      return WorkoutTypes.WORKOUTTYPE_FIXEDDIST_NOSPLITS
      break
    case (baseMetrics.workout.numberOfIntervals === 1 && baseMetrics.workout.type === 'distance' && splitPresent):
      return WorkoutTypes.WORKOUTTYPE_FIXEDDIST_SPLITS
      break
    case (baseMetrics.workout.numberOfIntervals === 1 && baseMetrics.workout.type === 'time' && baseMetrics.split.type === 'time' && baseMetrics.interval.movingTime.target === baseMetrics.split.movingTime.target):
      // There is just a single split with the same size as the interval
      return WorkoutTypes.WORKOUTTYPE_FIXEDTIME_NOSPLITS
      break
    case (baseMetrics.workout.numberOfIntervals === 1 && baseMetrics.workout.type === 'time' && splitPresent):
      return WorkoutTypes.WORKOUTTYPE_FIXEDTIME_SPLITS
      break
    case (baseMetrics.workout.numberOfIntervals === 1 && baseMetrics.workout.type === 'calories' && splitPresent):
      return WorkoutTypes.WORKOUTTYPE_FIXEDCALORIE_SPLITS
      break
    case (baseMetrics.workout.numberOfIntervals > 1 && baseMetrics.workout.type === 'justrow'):
      return WorkoutTypes.WORKOUTTYPE_VARIABLE_INTERVAL
      break
    case (baseMetrics.workout.numberOfIntervals > 1 && baseMetrics.workout.type === 'distance'):
      return WorkoutTypes.WORKOUTTYPE_FIXEDDIST_INTERVAL
      break
    case (baseMetrics.workout.numberOfIntervals > 1 && baseMetrics.workout.type === 'time'):
      return WorkoutTypes.WORKOUTTYPE_FIXEDTIME_INTERVAL
      break
    case (baseMetrics.workout.numberOfIntervals > 1 && baseMetrics.workout.type === 'calories'):
      return WorkoutTypes.WORKOUTTYPE_FIXEDCALS_INTERVAL
      break
    default:
      return WorkoutTypes.WORKOUTTYPE_JUSTROW_NOSPLITS
  }
}

/**
 * Converts the internal workout/interval/split structure to C2's OBJ_INTERVALTYPE_T
 * Is used by characteristics:
 * - status-characteristics/GeneralStatusCharacteristic.js (0x0031)
 */
export function toC2IntervalTypeGeneralStatus (baseMetrics) {
  // ToDo: this is a simplification, as ORM allows to mix different interval types and C2 does not. We might need to adress this based on the overall workout-type (which is a s>
  switch (true) {
    case (baseMetrics.sessionState === 'Paused' && !baseMetrics.metricsContext.isUnplannedPause):
      return IntervalTypes.INTERVALTYPE_REST
      break
    case (baseMetrics.interval.type === 'distance'):
      return IntervalTypes.INTERVALTYPE_DIST
      break
    case (baseMetrics.interval.type === 'time'):
      return IntervalTypes.INTERVALTYPE_TIME
      break
    case (baseMetrics.interval.type === 'calories'):
      return IntervalTypes.INTERVALTYPE_CALORIE
      break
    default:
      return IntervalTypes.INTERVALTYPE_NONE
  }
}

/**
 * Converts the internal workout/interval/split structure to C2's OBJ_INTERVALTYPE_T
 * Is used by characteristics:
 * - session-characteristics/SplitDataCharacteristic.js (0x0037)
 * - session-characteristics/AdditionalWorkoutSummaryCharacteristic.js (0x003A)
 */
export function toC2IntervalType (baseMetrics) {
  // ToDo: this is a simplification, as ORM allows to mix different interval types and C2 does not. We might need to adress this based on the overall workout-type (which is a summary of all intervals)
  switch (true) {
    case (baseMetrics.interval.type === 'distance'):
      return IntervalTypes.INTERVALTYPE_DIST
      break
    case (baseMetrics.interval.type === 'time'):
      return IntervalTypes.INTERVALTYPE_TIME
      break
    case (baseMetrics.interval.type === 'calories'):
      return IntervalTypes.INTERVALTYPE_CALORIE
      break
    case (baseMetrics.interval.type === 'rest' && baseMetrics.interval.movingTime.target > 0):
      return IntervalTypes.INTERVALTYPE_REST
      break
    case (baseMetrics.interval.type === 'rest'):
      return IntervalTypes.INTERVALTYPE_RESTUNDEFINED
      break
    default:
      return IntervalTypes.INTERVALTYPE_NONE
  }
}

/**
 * Converts the internal workout state to C2's OBJ_WORKOUTSTATE_T
 * Is used by characteristics:
 * - status-characteristics/GeneralStatusCharacteristic.js (0031)
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/blob/main/docs/PM5_Interface.md#0x0031-general-status|the description of desired behaviour}
 */
export function toC2WorkoutState (baseMetrics) {
  // ToDo: this is a simplification, as there are some interval transitions in this state which can be identified based on the state. But we first have to see how intervals behave
  switch (true) {
    case (baseMetrics.sessionState === 'WaitingForStart'):
      return WorkoutState.WORKOUTSTATE_WAITTOBEGIN
      break
    case (!baseMetrics.metricsContext.isUnplannedPause && baseMetrics.metricsContext.isPauseEnd && baseMetrics.split.type === 'distance'):
      return WorkoutState.WORKOUTSTATE_INTERVALRESTENDTOWORKDISTANCE
      break
    case (!baseMetrics.metricsContext.isUnplannedPause && baseMetrics.metricsContext.isPauseEnd && baseMetrics.split.type === 'time'):
      return WorkoutState.WORKOUTSTATE_INTERVALRESTENDTOWORKTIME
      break
    case (baseMetrics.sessionState === 'Rowing' && baseMetrics.workout.numberOfIntervals === 1 && baseMetrics.workout.type === 'distance' && baseMetrics.split.type === 'distance'):
      // Session with a single distance interval with multiple splits
      return WorkoutState.WORKOUTSTATE_WORKOUTROW
      break
    case (baseMetrics.sessionState === 'Rowing' && baseMetrics.split.type === 'distance'):
      // Session containing multiple intervals
      return WorkoutState.WORKOUTSTATE_INTERVALWORKDISTANCE
      break
    case (baseMetrics.metricsContext.isUnplannedPause && baseMetrics.workout.numberOfIntervals === 1 && baseMetrics.workout.type === 'distance'):
      // Unplanned pause in a session with a single distance interval with multiple splits
      return WorkoutState.WORKOUTSTATE_WORKOUTROW
      break
    case (baseMetrics.metricsContext.isUnplannedPause && baseMetrics.interval.type === 'distance'):
      // Unplanned pause in a session containing multiple intervals
      return WorkoutState.WORKOUTSTATE_INTERVALWORKDISTANCE
      break
    case (baseMetrics.sessionState === 'Rowing' && baseMetrics.workout.numberOfIntervals === 1 && baseMetrics.workout.type === 'time' && baseMetrics.split.type === 'time'):
      // Session with a single time interval with multiple splits
      return WorkoutState.WORKOUTSTATE_WORKOUTROW
      break
    case (baseMetrics.sessionState === 'Rowing' && baseMetrics.split.type === 'time'):
      // Session containing multiple intervals
      return WorkoutState.WORKOUTSTATE_INTERVALWORKTIME
      break
    case (baseMetrics.metricsContext.isUnplannedPause && baseMetrics.workout.numberOfIntervals === 1 && baseMetrics.workout.type === 'time'):
      // Unplanned pause in a session with a single time interval with multiple splits
      return WorkoutState.WORKOUTSTATE_WORKOUTROW
      break
    case (baseMetrics.metricsContext.isUnplannedPause && baseMetrics.interval.type === 'time'):
      // Unplanned pause in a session containing multiple intervals
      return WorkoutState.WORKOUTSTATE_INTERVALWORKTIME
      break
    case (baseMetrics.sessionState === 'Rowing' || baseMetrics.metricsContext.isUnplannedPause):
      return WorkoutState.WORKOUTSTATE_WORKOUTROW
      break
    case (!baseMetrics.metricsContext.isUnplannedPause && baseMetrics.sessionState === 'Paused' && baseMetrics.metricsContext.isPauseStart):
      return WorkoutState.WORKOUTSTATE_INTERVALWORKDISTANCETOREST
      break
    case (baseMetrics.sessionState === 'Paused' && !baseMetrics.metricsContext.isUnplannedPause):
      return WorkoutState.WORKOUTSTATE_INTERVALREST
      break
    case (baseMetrics.sessionState === 'Stopped'):
      return WorkoutState.WORKOUTSTATE_WORKOUTEND
      break
    default:
      return WorkoutState.WORKOUTSTATE_WAITTOBEGIN
  }
}

/**
 * Converts the internal rowing state to C2's OBJ_ROWINGSTATE_T
 * Is used by characteristics:
 * - status-characteristics/GeneralStatusCharacteristic.js (0031)
 */
export function toC2RowingState (baseMetrics) {
  switch (true) {
    case (baseMetrics.sessionState === 'WaitingForStart'):
      return RowingState.ROWINGSTATE_INACTIVE
      break
    case (baseMetrics.sessionState === 'Rowing'):
      return RowingState.ROWINGSTATE_ACTIVE
      break
    case (baseMetrics.metricsContext.isUnplannedPause):
      return RowingState.ROWINGSTATE_INACTIVE
      break
    case (baseMetrics.sessionState === 'Paused'):
      return RowingState.ROWINGSTATE_INACTIVE
      break
    case (baseMetrics.sessionState === 'Stopped'):
      return RowingState.ROWINGSTATE_INACTIVE
      break
    default:
      return RowingState.ROWINGSTATE_INACTIVE
  }
}

/**
 * Converts the internal stroke state to C2's OBJ_STROKESTATE_T
 * Is used by characteristics:
 * - status-characteristics/GeneralStatusCharacteristic.js (0031)
 */
export function toC2StrokeState (baseMetrics) {
  switch (true) {
    case (baseMetrics.sessionState === 'Paused'):
      return StrokeState.STROKESTATE_WAITING_FOR_WHEEL_TO_ACCELERATE_STATE
      break
    case (baseMetrics.strokeState === 'WaitingForDrive'):
      return StrokeState.STROKESTATE_WAITING_FOR_WHEEL_TO_REACH_MIN_SPEED_STATE
      break
    case (baseMetrics.strokeState === 'Drive' && baseMetrics.metricsContext.isDriveStart):
      return StrokeState.STROKESTATE_WAITING_FOR_WHEEL_TO_ACCELERATE_STATE
      break
    case (baseMetrics.strokeState === 'Drive'):
      return StrokeState.STROKESTATE_DRIVING_STATE
      break
    case (baseMetrics.strokeState === 'Recovery' && baseMetrics.metricsContext.isRecoveryStart):
      return StrokeState.STROKESTATE_DWELLING_AFTER_DRIVE_STATE
      break
    case (baseMetrics.strokeState === 'Recovery'):
      return StrokeState.STROKESTATE_RECOVERY_STATE
      break
    case (baseMetrics.strokeState === 'Stopped'):
      return StrokeState.STROKESTATE_WAITING_FOR_WHEEL_TO_REACH_MIN_SPEED_STATE
      break
    default:
      return StrokeState.STROKESTATE_WAITING_FOR_WHEEL_TO_REACH_MIN_SPEED_STATE
  }
}

/**
 * Converts the internal rowing state to C2's DurationType
 * Is used by characteristics:
 * - status-characteristics/GeneralStatusCharacteristic.js (0031)
 */
export function toC2DurationType (baseMetrics) {
  switch (true) {
    case (baseMetrics.workout.type === 'justrow'):
      return DurationTypes.CSAFE_TIME_DURATION
      break
    case (baseMetrics.workout.type === 'time'):
      return DurationTypes.CSAFE_TIME_DURATION
      break
    case (baseMetrics.workout.type === 'distance'):
      return DurationTypes.CSAFE_DISTANCE_DURATION
      break
    case (baseMetrics.workout.type === 'calories'):
      return DurationTypes.CSAFE_CALORIES_DURATION
      break
    default:
      return DurationTypes.CSAFE_TIME_DURATION
  }
}

/**
 * Converts the internal rowing state to C2's OBJ_OPERATIONALSTATE_T
 * Is used by characteristics:
 * status-characteristics/AdditionalStatus3Characteristic.js (003E)
 */
export function toC2OperationalState (baseMetrics) {
  switch (true) {
    case (baseMetrics.sessionState === 'WaitingForStart'):
      return OperationalStates.OPERATIONALSTATE_READY
      break
    case (baseMetrics.sessionState === 'Rowing'):
      return OperationalStates.OPERATIONALSTATE_WORKOUT
      break
    case (baseMetrics.sessionState === 'Paused'):
      return OperationalStates.OPERATIONALSTATE_PAUSE
      break
    case (baseMetrics.sessionState === 'Stopped'):
      return OperationalStates.OPERATIONALSTATE_IDLE
      break
    default:
      return OperationalStates.OPERATIONALSTATE_READY
  }
}

/**
 * Used to manage planned pauses, which are handled at the Interval level. Concept2 essentially glues the planned rest interval to the active interval
 * The active interval (and thus underlying split) can only contain moving time, as Concept2 considers even an unplanned pause as moving time
 * The planned paused interval (and thus underlying split) can only contain rest time.
 */
export function appendPauseIntervalToActiveInterval (activeMetrics, pauseMetrics) {
  const result = { ...pauseMetrics }
  result.interval = activeMetrics.interval
  result.interval.workoutStepNumber = pauseMetrics.interval.workoutStepNumber
  result.interval.timeSpent.moving = activeMetrics.interval.timeSpent.moving
  result.interval.timeSpent.rest = pauseMetrics.interval.timeSpent.rest
  result.interval.timeSpent.total = activeMetrics.interval.timeSpent.moving + pauseMetrics.interval.timeSpent.rest
  result.split = activeMetrics.split
  result.split.C2number = pauseMetrics.split.C2number
  result.split.timeSpent.moving = activeMetrics.split.timeSpent.moving
  result.split.timeSpent.rest = pauseMetrics.split.timeSpent.rest
  result.split.timeSpent.total = activeMetrics.split.timeSpent.moving + pauseMetrics.split.timeSpent.rest
  return result
}

/**
 * Used to manage unplanned pauses, which are handled at the split level alone. Concept2 essentially ignores these, but in ORM these become three splits
 * It is used in two scenario's: 1. appending the pause split to the first active split 2. Add the first active split and the pause to the second active split
 * In these cases, all time is considered moving time, and NOT rest, so we have to treat it as such
 */
/* eslint-disable max-statements -- There are a lot of metrics to be be copied */
export function mergeTwoSplits (firstMetrics, secondMetrics) {
  const result = { ...secondMetrics }
  result.split.C2number = secondMetrics.split.C2number
  result.split.workoutStepNumber = secondMetrics.split.workoutStepNumber
  result.split.numberOfStrokes = firstMetrics.split.numberOfStrokes + secondMetrics.split.numberOfStrokes
  result.split.distance.absoluteStart = firstMetrics.split.distance.absoluteStart
  result.split.distance.fromStart = firstMetrics.split.distance.fromStart + secondMetrics.split.distance.fromStart
  result.split.movingTime.absoluteStart = firstMetrics.split.movingTime.absoluteStart
  result.split.movingTime.sinceStart = firstMetrics.split.movingTime.sinceStart + secondMetrics.split.movingTime.sinceStart
  result.split.timeSpent.total = firstMetrics.split.timeSpent.total + secondMetrics.split.timeSpent.total
  result.split.timeSpent.moving = result.split.timeSpent.total // C2's definition of moving time essentially equates it to total time for splits with unplanned pauses
  result.split.timeSpent.rest = 0 // C2's definition of moving time does not allow for rest time due to unplanned pause
  result.split.linearVelocity.average = result.split.timeSpent.moving > 0 ? (result.split.distance.fromStart / result.split.timeSpent.total) : 0
  result.split.linearVelocity.minimum = Math.min(firstMetrics.split.linearVelocity.minimum, secondMetrics.split.linearVelocity.minimum)
  result.split.linearVelocity.maximum = Math.max(firstMetrics.split.linearVelocity.maximum, secondMetrics.split.linearVelocity.maximum)
  result.split.pace.average = linearVelocityToPace(result.interval.linearVelocity.average)
  result.split.pace.minimum = Math.max(firstMetrics.split.pace.minimum, secondMetrics.split.pace.minimum) // Be aware: largest number is slowest pace
  result.split.pace.maximum = Math.min(firstMetrics.split.pace.maximum, secondMetrics.split.pace.maximum) // Be aware: biggest number is fastest pace
  result.split.power.average = result.split.timeSpent.total > 0 ? ((firstMetrics.split.power.average * firstMetrics.split.timeSpent.total) + (secondMetrics.split.power.average * secondMetrics.split.timeSpent.total)) / result.split.timeSpent.total : 0
  result.split.power.minimum = Math.min(firstMetrics.split.power.minimum, secondMetrics.split.power.minimum)
  result.split.power.maximum = Math.max(firstMetrics.split.power.maximum, secondMetrics.split.power.maximum)
  result.split.strokeDistance.average = result.split.numberOfStrokes > 0 ? (result.split.distance.fromStart / result.split.numberOfStrokes) : 0
  result.split.strokeDistance.minimum = Math.min(firstMetrics.split.strokeDistance.minimum, secondMetrics.split.strokeDistance.minimum)
  result.split.strokeDistance.maximum = Math.max(firstMetrics.split.strokeDistance.maximum, secondMetrics.split.strokeDistance.maximum)
  result.split.strokerate.average = result.split.timeSpent.total > 0 ? ((result.split.numberOfStrokes * 60) / result.split.timeSpent.total) : 0
  result.split.strokerate.minimum = Math.min(firstMetrics.split.strokerate.minimum, secondMetrics.split.strokerate.minimum)
  result.split.strokerate.maximum = Math.max(firstMetrics.split.strokerate.maximum, secondMetrics.split.strokerate.maximum)
  result.split.dragfactor.average = secondMetrics.interval.dragfactor.average
  result.split.dragfactor.minimum = Math.min(firstMetrics.split.dragfactor.minimum, secondMetrics.split.dragfactor.minimum)
  result.split.dragfactor.maximum = Math.max(firstMetrics.split.dragfactor.maximum, secondMetrics.split.dragfactor.maximum)
  result.split.calories.totalSpent = firstMetrics.split.calories.totalSpent + secondMetrics.split.calories.totalSpent
  result.split.calories.averagePerHour = result.split.timeSpent.moving > 0 ? ((firstMetrics.split.calories.averagePerHour * firstMetrics.split.timeSpent.total) + (secondMetrics.split.calories.averagePerHour * secondMetrics.split.timeSpent.total)) / result.split.timeSpent.total : 0
  return result
}
/* eslint-enable max-statements */

/**
 * @param {float} linear velocity
 * @returns {float} pace per 500 meters
 */
function linearVelocityToPace (linearVel) {
  if (!isNaN(linearVel) && linearVel > 0) {
    return (500.0 / linearVel)
  } else {
    return undefined
  }
}
