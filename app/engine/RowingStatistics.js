'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This Module calculates the training specific metrics.
*/
import { EventEmitter } from 'events'
import { createMovingIntervalAverager } from './MovingIntervalAverager.js'
import { createMovingAverager } from './MovingAverager.js'
import { createWeightedAverager } from './WeightedAverager.js'

import loglevel from 'loglevel'
const log = loglevel.getLogger('RowingEngine')

function createRowingStatistics (config) {
  const numOfDataPointsForAveraging = config.numOfPhasesForAveragingScreenData
  const screenUpdateInterval = config.screenUpdateInterval
  const minimumStrokeTime = config.rowerSettings.minimumRecoveryTime + config.rowerSettings.minimumDriveTime
  const maximumStrokeTime = config.rowerSettings.maxCycleTimeBeforePause
  const timeBetweenStrokesBeforePause = maximumStrokeTime * 1000
  const emitter = new EventEmitter()
  const strokeAverager = createMovingAverager(numOfDataPointsForAveraging, (minimumStrokeTime + maximumStrokeTime) / 2)
  const powerAverager = createWeightedAverager(numOfDataPointsForAveraging)
  const speedAverager = createWeightedAverager(numOfDataPointsForAveraging)
  const powerRatioAverager = createWeightedAverager(numOfDataPointsForAveraging)
  const caloriesAveragerMinute = createMovingIntervalAverager(60)
  const caloriesAveragerHour = createMovingIntervalAverager(60 * 60)
  let trainingRunning = false
  let rowingPausedTimer
  let heartrateResetTimer
  let distanceTotal = 0.0
  let durationTotal = 0
  let strokesTotal = 0
  let caloriesTotal = 0.0
  let heartrate
  let heartrateBatteryLevel = 0
  let instantanousTorque = 0.0
  let lastStrokeDistance = 0.0
  let lastStrokeSpeed = 0.0
  let lastStrokeState = 'RECOVERY'
  let lastMetrics = {}

  // send metrics to the clients periodically, if the data has changed
  setInterval(emitMetrics, screenUpdateInterval)
  function emitMetrics () {
    const currentMetrics = getMetrics()
    if (Object.entries(currentMetrics).toString() !== Object.entries(lastMetrics).toString()) {
      emitter.emit('metricsUpdate', currentMetrics)
      lastMetrics = currentMetrics
    }
  }

  // send metrics to the BT-clients periodically, to update the client and prevent a time-out on the connection
  setInterval(emitBTMetrics, 1000)
  function emitBTMetrics () {
    emitter.emit('bluetoothMetricsUpdate', getMetrics())
  }

  function handleStrokeEnd (stroke) {
    if (!trainingRunning) startTraining()

    // if we do not get a stroke for timeBetweenStrokesBeforePause miliseconds we treat this as a rowing pause
    if (rowingPausedTimer)clearInterval(rowingPausedTimer)
    rowingPausedTimer = setTimeout(() => pauseRowing(), timeBetweenStrokesBeforePause)

    // based on: http://eodg.atm.ox.ac.uk/user/dudhia/rowing/physics/ergometer.html#section11
    const calories = (4 * powerAverager.weightedAverage() + 350) * (stroke.duration) / 4200
    durationTotal = stroke.timeSinceStart
    powerAverager.pushValue(stroke.power)
    speedAverager.pushValue(stroke.speed)
    if (stroke.duration < timeBetweenStrokesBeforePause && stroke.duration > minimumStrokeTime) {
      // stroke duration has to be credible to be accepted
      powerRatioAverager.pushValue(stroke.durationDrivePhase / stroke.duration)
      strokeAverager.pushValue(stroke.duration)
      caloriesAveragerMinute.pushValue(calories, stroke.duration)
      caloriesAveragerHour.pushValue(calories, stroke.duration)
    } else {
      log.debug(`*** Stroke duration of ${stroke.duration} sec is considered unreliable, skipped update stroke statistics`)
    }

    caloriesTotal += calories
    distanceTotal = stroke.distance
    lastStrokeDistance = stroke.strokeDistance
    lastStrokeState = stroke.strokeState
    lastStrokeSpeed = stroke.speed
    instantanousTorque = stroke.instantanousTorque
    emitter.emit('strokeFinished', getMetrics())
  }

  // initiated by the rowing engine in case an impulse was not considered
  // because it was too large
  function handlePause (duration) {
    caloriesAveragerMinute.pushValue(0, duration)
    caloriesAveragerHour.pushValue(0, duration)
    emitter.emit('rowingPaused')
  }
  
    // initiated when the stroke state changes
  function handleRecoveryEnd (stroke) {
    // todo: wee need a better mechanism to communicate strokeState updates
    // this is an initial hacky attempt to see if we can use it for the C2-pm5 protocol
    durationTotal = stroke.timeSinceStart
    powerAverager.pushValue(stroke.power)
    speedAverager.pushValue(stroke.speed)
    if (stroke.duration < timeBetweenStrokesBeforePause && stroke.duration > minimumStrokeTime) {
      // stroke duration has to be credible to be accepted
      powerRatioAverager.pushValue(stroke.durationDrivePhase / stroke.duration)
      strokeAverager.pushValue(stroke.duration)
    } else {
      log.debug(`*** Stroke duration of ${stroke.duration} sec is considered unreliable, skipped update stroke statistics`)
    }
    distanceTotal = stroke.distance
    strokesTotal = stroke.numberOfStrokes
    lastStrokeDistance = stroke.strokeDistance
    lastStrokeState = stroke.strokeState
    lastStrokeSpeed = stroke.speed
    instantanousTorque = stroke.instantanousTorque
    emitter.emit('recoveryFinished', getMetrics())
  }

  // initiated when updating key statistics
  function updateKeyMetrics (stroke) {
    durationTotal = stroke.timeSinceStart
    distanceTotal = stroke.distance
    instantanousTorque = stroke.instantanousTorque
  }

  // initiated when new heart rate value is received from heart rate sensor
  function handleHeartrateMeasurement (value) {
    // set the heart rate to zero, if we did not receive a value for some time
    if (heartrateResetTimer)clearInterval(heartrateResetTimer)
    heartrateResetTimer = setTimeout(() => {
      heartrate = 0
      heartrateBatteryLevel = 0
    }, 6000)
    heartrate = value.heartrate
    heartrateBatteryLevel = value.batteryLevel
  }

  function getMetrics () {
    const splitTime = speedAverager.weightedAverage() !== 0 && lastStrokeSpeed > 0 ? (500.0 / speedAverager.weightedAverage()) : Infinity
    return {
      durationTotal,
      durationTotalFormatted: secondsToTimeString(durationTotal),
      strokesTotal,
      distanceTotal: distanceTotal > 0 ? distanceTotal : 0, // meters
      caloriesTotal: caloriesTotal, // kcal
      caloriesPerMinute: caloriesAveragerMinute.average() > 0 ? caloriesAveragerMinute.average() : 0,
      caloriesPerHour: caloriesAveragerHour.average() > 0 ? caloriesAveragerHour.average() : 0,
      strokeTime: strokeAverager.getMovingAverage() > minimumStrokeTime && strokeAverager.getMovingAverage() < maximumStrokeTime && lastStrokeSpeed > 0 ? strokeAverager.getMovingAverage() : Infinity, // seconds
      distance: lastStrokeDistance > 0 && lastStrokeSpeed > 0 ? lastStrokeDistance : 0, // meters
      power: powerAverager.weightedAverage() > 0 && lastStrokeSpeed > 0 ? powerAverager.weightedAverage() : 0, // watts
      split: splitTime, // seconds/500m
      splitFormatted: secondsToTimeString(splitTime),
      powerRatio: powerRatioAverager.weightedAverage() > 0 && lastStrokeSpeed > 0 ? powerRatioAverager.weightedAverage() : 0,
      instantanousTorque: instantanousTorque,
      strokesPerMinute: strokeAverager.getMovingAverage() > minimumStrokeTime && lastStrokeSpeed > 0 ? (60.0 / strokeAverager.getMovingAverage()) : minimumStrokeTime,
      speed: speedAverager.weightedAverage() > 0 && lastStrokeSpeed > 0 ? (speedAverager.weightedAverage() * 3.6) : 0, // km/h
      strokeState: lastStrokeState,
      heartrate,
      heartrateBatteryLevel
    }
  }

  function startTraining () {
    trainingRunning = true
  }

  function stopTraining () {
    trainingRunning = false
    if (rowingPausedTimer)clearInterval(rowingPausedTimer)
  }

  function resetTraining () {
    stopTraining()
    distanceTotal = 0.0
    strokesTotal = 0
    caloriesTotal = 0.0
    durationTotal = 0
    caloriesAveragerMinute.reset()
    caloriesAveragerHour.reset()
    strokeAverager.reset()
    powerAverager.reset()
    speedAverager.reset()
    powerRatioAverager.reset()
  }

  // clear the metrics in case the user pauses rowing
  function pauseRowing () {
    strokeAverager.reset()
    powerAverager.reset()
    speedAverager.reset()
    powerRatioAverager.reset()
    lastStrokeState = 'RECOVERY'
    emitter.emit('rowingPaused')
  }

  // converts a timeStamp in seconds to a human readable hh:mm:ss format
  function secondsToTimeString (secondsTimeStamp) {
    if (secondsTimeStamp === Infinity) return '∞'
    const hours = Math.floor(secondsTimeStamp / 60 / 60)
    const minutes = Math.floor(secondsTimeStamp / 60) - (hours * 60)
    const seconds = Math.floor(secondsTimeStamp % 60)
    let timeString = hours > 0 ? ` ${hours.toString().padStart(2, '0')}:` : ''
    timeString += `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    return timeString
  }

  return Object.assign(emitter, {
    handleStrokeEnd,
    handlePause,
    handleHeartrateMeasurement,
    handleRecoveryEnd,
    updateKeyMetrics,
    reset: resetTraining
  })
}

export { createRowingStatistics }
