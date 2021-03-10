'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This Module calculates the training specific metrics.
*/
import log from 'loglevel'
import { EventEmitter } from 'events'
import { createAverager } from './Averager.js'

// The number of strokes that are considered when averaging the calculated metrics
// Higher values create more stable metrics but make them less responsive
const numOfDataPointsForAveraging = 3

function createRowingStatistics () {
  const emitter = new EventEmitter()
  const strokeAverager = createAverager(numOfDataPointsForAveraging)
  const powerAverager = createAverager(numOfDataPointsForAveraging)
  const speedAverager = createAverager(numOfDataPointsForAveraging)
  const powerRatioAverager = createAverager(numOfDataPointsForAveraging)
  let trainingRunning = false
  let durationTimer
  let rowingPausedTimer
  let distanceTotal = 0.0
  let durationTotal = 0
  let strokesTotal = 0
  let caloriesTotal = 0.0

  function handleStroke (stroke) {
    if (!trainingRunning) startTraining()

    // if we do not get a stroke for 6 seconds we treat this as a rowing pause
    if (rowingPausedTimer)clearInterval(rowingPausedTimer)
    rowingPausedTimer = setTimeout(() => pauseRowing(), 6000)

    powerAverager.pushValue(stroke.power)
    speedAverager.pushValue(stroke.distance / stroke.duration)
    powerRatioAverager.pushValue(stroke.durationDrivePhase / stroke.duration)
    strokeAverager.pushValue(stroke.duration)
    distanceTotal += stroke.distance
    strokesTotal++
    // based on: http://eodg.atm.ox.ac.uk/user/dudhia/rowing/physics/ergometer.html#section11
    caloriesTotal += (4 * powerAverager.weightedAverage() + 350) * (stroke.duration) / 4200

    const splitTime = 500.0 / speedAverager.weightedAverage()

    emitter.emit('strokeFinished', {
      strokesTotal: strokesTotal,
      distanceTotal: Math.round(distanceTotal), // meters
      caloriesTotal: Math.round(caloriesTotal), // kcal
      strokeTime: stroke.duration.toFixed(2), // seconds
      power: Math.round(powerAverager.weightedAverage()), // watts
      split: splitTime, // seconds/500m
      splitFormatted: secondsToTimeString(splitTime),
      powerRatio: powerRatioAverager.weightedAverage().toFixed(2),
      strokesPerMinute: Math.round(60.0 / strokeAverager.weightedAverage()),
      speed: (speedAverager.weightedAverage() * 3.6).toFixed(2) // km/h
    })
  }

  // initiated by the rowing engine in case an impulse was not considered
  // because it was to large
  function handlePause (duration) {
  }

  function startTraining () {
    trainingRunning = true
    startDurationTimer()
  }

  function stopTraining () {
    trainingRunning = false
    stopDurationTimer()
    if (rowingPausedTimer)clearInterval(rowingPausedTimer)
  }

  function resetTraining () {
    stopTraining()
    distanceTotal = 0.0
    strokesTotal = 0
    caloriesTotal = 0.0
    durationTotal = 0
    strokeAverager.reset()
    powerAverager.reset()
    speedAverager.reset()
    powerRatioAverager.reset()
  }

  // clear the displayed metrics in case the user pauses rowing
  function pauseRowing () {
    strokeAverager.reset()
    powerAverager.reset()
    speedAverager.reset()
    powerRatioAverager.reset()
    log.debug('rowing pause detected')
    emitter.emit('rowingPaused', {
      strokesTotal: strokesTotal,
      distanceTotal: Math.round(distanceTotal),
      caloriesTotal: Math.round(caloriesTotal)
    })
  }

  function startDurationTimer () {
    durationTimer = setInterval(() => {
      durationTotal++
      emitter.emit('durationUpdate', { durationTotal: secondsToTimeString(durationTotal) })
    }, 1000)
  }

  function stopDurationTimer () {
    clearInterval(durationTimer)
    durationTimer = undefined
  }

  // converts a timeStamp in seconds to a human readable hh:mm:ss format
  function secondsToTimeString (secondsTimeStamp) {
    const hours = Math.floor(secondsTimeStamp / 60 / 60)
    const minutes = Math.floor(secondsTimeStamp / 60) - (hours * 60)
    const seconds = Math.floor(secondsTimeStamp % 60)
    let timeString = hours > 0 ? ` ${hours.toString().padStart(2, '0')}:` : ''
    timeString += `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    return timeString
  }

  return Object.assign(emitter, {
    handleStroke,
    handlePause,
    reset: resetTraining
  })
}

export { createRowingStatistics }
