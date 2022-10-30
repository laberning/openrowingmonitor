'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This start file is currently a mess, as this currently is the devlopment playground to plug
  everything together while figuring out the physics and model of the application.
  todo: refactor this as we progress
*/
import os from 'os'
import child_process from 'child_process'
import { promisify } from 'util'
import log from 'loglevel'
import config from './tools/ConfigManager.js'
import { createRowingStatistics } from './engine/RowingStatistics.js'
import { createWebServer } from './WebServer.js'
import { createPeripheralManager } from './ble/PeripheralManager.js'
import { createAntManager } from './ant/AntManager.js'
// eslint-disable-next-line no-unused-vars
import { replayRowingSession } from './tools/RowingRecorder.js'
import { createWorkoutRecorder } from './engine/WorkoutRecorder.js'
import { createWorkoutUploader } from './engine/WorkoutUploader.js'
const exec = promisify(child_process.exec)

// set the log levels
log.setLevel(config.loglevel.default)
for (const [loggerName, logLevel] of Object.entries(config.loglevel)) {
  if (loggerName !== 'default') {
    log.getLogger(loggerName).setLevel(logLevel)
  }
}

log.info(`==== Open Rowing Monitor ${process.env.npm_package_version || ''} ====\n`)

if (config.appPriority) {
  // setting the (near-real-time?) priority for the main process, to prevent blocking the GPIO thread
  const mainPriority = Math.min((config.appPriority), 0)
  log.debug(`Setting priority for the main server thread to ${mainPriority}`)
  try {
    // setting priority of current process
    os.setPriority(mainPriority)
  } catch (err) {
    log.debug('need root permission to set priority of main server thread')
  }
}

// a hook for setting session parameters that the rower has to obey
// Hopefully this will be filled through the WebGUI or through the BLE interface (PM5-BLE can do this...)
// When set, ORM will terminate the session after reaching the target. If not set, it will behave as usual (a "Just row" session).
// When set, the GUI will behave similar to a PM5 in that it counts down from the target to 0
const session = {
  targetDistance: 0, // Target distance in meters
  targetTime: 0 // Target time in seconds
}

log.info(`Session settings: distance limit: ${(session.targetDistance > 0 ? `${session.targetDistance} meters` : 'none')}, time limit: ${(session.targetTime > 0 ? `${session.targetTime} seconds` : 'none')}\n`)

const peripheralManager = createPeripheralManager()

peripheralManager.on('control', (event) => {
  switch (event?.req?.name) {
    case 'requestControl':
      event.res = true
      break
    case 'reset':
      log.debug('reset requested')
      resetWorkout()
      event.res = true
      break
    // todo: we could use these controls once we implement a concept of a rowing session
    case 'stop':
      log.debug('stop requested')
      stopWorkout()
      peripheralManager.notifyStatus({ name: 'stoppedOrPausedByUser' })
      event.res = true
      break
    case 'pause':
      log.debug('pause requested')
      pauseWorkout()
      peripheralManager.notifyStatus({ name: 'stoppedOrPausedByUser' })
      event.res = true
      break
    case 'startOrResume':
      log.debug('startOrResume requested')
      resumeWorkout()
      peripheralManager.notifyStatus({ name: 'startedOrResumedByUser' })
      event.res = true
      break
    case 'peripheralMode':
      webServer.notifyClients('config', getConfig())
      event.res = true
      break
    default:
      log.info('unhandled Command', event.req)
  }
})

function pauseWorkout () {
  rowingStatistics.pause()
}

function stopWorkout () {
  rowingStatistics.stop()
}

function resumeWorkout () {
  rowingStatistics.resume()
}

function resetWorkout () {
  workoutRecorder.reset()
  rowingStatistics.reset()
  peripheralManager.notifyStatus({ name: 'reset' })
}

const gpioTimerService = child_process.fork('./app/gpio/GpioTimerService.js')
gpioTimerService.on('message', handleRotationImpulse)

function handleRotationImpulse (dataPoint) {
  workoutRecorder.recordRotationImpulse(dataPoint)
  rowingStatistics.handleRotationImpulse(dataPoint)
}

const rowingStatistics = createRowingStatistics(config, session)
const workoutRecorder = createWorkoutRecorder()
const workoutUploader = createWorkoutUploader(workoutRecorder)

rowingStatistics.on('driveFinished', (metrics) => {
  webServer.notifyClients('metrics', metrics)
  peripheralManager.notifyMetrics('strokeStateChanged', metrics)
})

rowingStatistics.on('recoveryFinished', (metrics) => {
  logMetrics(metrics)
  webServer.notifyClients('metrics', metrics)
  peripheralManager.notifyMetrics('strokeFinished', metrics)
  workoutRecorder.recordStroke(metrics)
})

rowingStatistics.on('webMetricsUpdate', (metrics) => {
  webServer.notifyClients('metrics', metrics)
})

rowingStatistics.on('peripheralMetricsUpdate', (metrics) => {
  peripheralManager.notifyMetrics('metricsUpdate', metrics)
})

rowingStatistics.on('rowingPaused', (metrics) => {
  logMetrics(metrics)
  workoutRecorder.recordStroke(metrics)
  workoutRecorder.handlePause()
  webServer.notifyClients('metrics', metrics)
  peripheralManager.notifyMetrics('metricsUpdate', metrics)
})

rowingStatistics.on('intervalTargetReached', (metrics) => {
  // This is called when the RowingStatistics conclude the target is reached
  // This isn't the most optimal solution yet, as this interval is the only one set. A logcal extansion would be
  // to provide a next intervaltarget. Thus, the use case of a next interval has to be implemented as well
  // (i.e. setting a new interval target). For now, this interval is the one and only so we stop.
  stopWorkout()
})

rowingStatistics.on('rowingStopped', (metrics) => {
  // This is called when the rowingmachine is stopped for some reason, could be reaching the end of the session,
  // could be user intervention
  logMetrics(metrics)
  workoutRecorder.recordStroke(metrics)
  webServer.notifyClients('metrics', metrics)
  peripheralManager.notifyMetrics('metricsUpdate', metrics)
  workoutRecorder.writeRecordings(metrics)
})

if (config.heartrateMonitorBLE) {
  const bleCentralService = child_process.fork('./app/ble/CentralService.js')
  bleCentralService.on('message', (heartrateMeasurement) => {
    rowingStatistics.handleHeartrateMeasurement(heartrateMeasurement)
  })
}

if (config.heartrateMonitorANT) {
  const antManager = createAntManager()
  antManager.on('heartrateMeasurement', (heartrateMeasurement) => {
    rowingStatistics.handleHeartrateMeasurement(heartrateMeasurement)
  })
}

workoutUploader.on('authorizeStrava', (data, client) => {
  webServer.notifyClient(client, 'authorizeStrava', data)
})

workoutUploader.on('resetWorkout', () => {
  resetWorkout()
})

const webServer = createWebServer()
webServer.on('messageReceived', async (message, client) => {
  switch (message.command) {
    case 'switchPeripheralMode':
      peripheralManager.switchPeripheralMode()
      break
    case 'reset':
      resetWorkout()
      break
    case 'uploadTraining':
      workoutUploader.upload(client)
      break
    case 'shutdown':
      await shutdown()
      break
    case 'stravaAuthorizationCode':
      workoutUploader.stravaAuthorizationCode(message.data)
      break
    default:
      log.warn('invalid command received:', message)
  }
})

webServer.on('clientConnected', (client) => {
  webServer.notifyClient(client, 'config', getConfig())
})

// todo: extract this into some kind of state manager
function getConfig () {
  return {
    peripheralMode: peripheralManager.getPeripheralMode(),
    stravaUploadEnabled: !!config.stravaClientId && !!config.stravaClientSecret,
    shutdownEnabled: !!config.shutdownCommand
  }
}

// This shuts down the pi, use with caution!
async function shutdown () {
  stopWorkout()
  if (getConfig().shutdownEnabled) {
    console.info('shutting down device...')
    try {
      const { stdout, stderr } = await exec(config.shutdownCommand)
      if (stderr) {
        log.error('can not shutdown: ', stderr)
      }
      log.info(stdout)
    } catch (error) {
      log.error('can not shutdown: ', error)
    }
  }
}

function logMetrics (metrics) {
  log.info(`stroke: ${metrics.totalNumberOfStrokes}, dist: ${metrics.totalLinearDistance.toFixed(1)}m, speed: ${metrics.cycleLinearVelocity.toFixed(2)}m/s` +
  `, pace: ${metrics.cyclePaceFormatted}/500m, power: ${Math.round(metrics.cyclePower)}W, cal: ${metrics.totalCalories.toFixed(1)}kcal` +
  `, SPM: ${metrics.cycleStrokeRate.toFixed(1)}, drive dur: ${metrics.driveDuration.toFixed(2)}s, rec. dur: ${metrics.recoveryDuration.toFixed(2)}s` +
  `, stroke dur: ${metrics.cycleDuration.toFixed(2)}s`)
}

/*
replayRowingSession(handleRotationImpulse, {
//  filename: 'recordings/2021/04/rx800_2021-04-21_1845_Rowing_30Minutes_Damper8.csv', // 30 minutes, damper 10
  realtime: true,
  loop: false
})
*/
