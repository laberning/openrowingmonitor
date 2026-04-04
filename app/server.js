'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
/* eslint-disable camelcase -- Some imports simply don't use camelCase */
import os from 'os'
import child_process from 'child_process'
import { promisify } from 'util'
import log from 'loglevel'
import config from './tools/ConfigManager.js'
import { createSessionManager } from './engine/SessionManager.js'
import { createWebServer } from './WebServer.js'
import { createPeripheralManager } from './peripherals/PeripheralManager.js'
import { createRecordingManager } from './recorders/recordingManager.js'
/* eslint-disable-next-line no-unused-vars -- replayRowingSession shouldn't be used in a production environments */
import { replayRowingSession } from './recorders/RowingReplayer.js'

const exec = promisify(child_process.exec)

const shutdownEnabled = !!config.shutdownCommand

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
    log.error('Could not set priority of main server thread (perhaps root permission is missing?):', err)
  }
}

const peripheralManager = createPeripheralManager(config)

peripheralManager.on('control', (event) => {
  log.debug(`Server: peripheral requested ${event?.req?.name}`)
  handleCommand(event?.req?.name, event?.req?.data)
  event.res = true
})

peripheralManager.on('heartRateMeasurement', (heartRateMeasurement) => {
  // As the peripheralManager already has this info, it will enrich metrics based on the data internally
  recordingManager.recordHeartRate(heartRateMeasurement)
  webServer.presentHeartRate(heartRateMeasurement)
})

const gpioTimerService = child_process.fork('./app/gpio/GpioTimerService.js')
gpioTimerService.on('message', handleRotationImpulse)

// Be aware, both the GPIO as well as the replayer use this as an entrypoint!
function handleRotationImpulse (dataPoint) {
  recordingManager.recordRotationImpulse(dataPoint)
  sessionManager.handleRotationImpulse(dataPoint)
}

const recordingManager = createRecordingManager(config)

const sessionManager = createSessionManager(config)

sessionManager.on('metricsUpdate', (metrics) => {
  webServer.presentRowingMetrics(metrics)
  recordingManager.recordMetrics(metrics)
  peripheralManager.notifyMetrics(metrics)
})

const webServer = createWebServer(config)
webServer.on('messageReceived', async (message) => {
  log.debug(`server: webclient requested ${message.command}`)
  await handleCommand(message.command, message.data)
})

async function handleCommand (command, data) {
  switch (command) {
    case 'shutdown':
      if (shutdownEnabled) {
        await shutdownApp()
        await shutdownPi()
      } else {
        log.error('Shutdown requested, but shutdown is disabled')
      }
      break
    case 'reset':
      // The initial sessionmanager stop and order of commands is important to prevent race conditions between the recordingManager and sessionMananager during resets
      // If the sessionManager starts a new session too soon, recorders will miss the initial metrics broadcast, and crash as there is data added to a lap that hasn't started
      await sessionManager.handleCommand(command, data)
      await webServer.handleCommand(command, data)
      await peripheralManager.handleCommand(command, data)
      await recordingManager.handleCommand(command, data)
      break
    default:
      sessionManager.handleCommand(command, data)
      recordingManager.handleCommand(command, data)
      peripheralManager.handleCommand(command, data)
      webServer.handleCommand(command, data)
  }
}

// This shuts down the pi hardware, use with caution!
async function shutdownPi () {
  log.info('shutting down device...')
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

process.once('SIGINT', async (signal) => {
  log.debug(`${signal} signal was received, shutting down gracefully`)
  await shutdownApp()
  process.exit(0)
})

process.once('SIGTERM', async (signal) => {
  log.debug(`${signal} signal was received, shutting down gracefully`)
  await shutdownApp()
  process.exit(0)
})

process.once('uncaughtException', async (error) => {
  log.error('Uncaught Exception:', error)
  await shutdownApp()
  process.exit(1)
})

// This shuts down the pi, use with caution!
async function shutdownApp () {
  // As we are shutting down, we need to make sure things are closed down nicely and save what we can
  gpioTimerService.kill()
  await recordingManager.handleCommand('shutdown')
  // We don't want to wait for the peripherals to close, as then an unresponsive peripheral will block the shutdown process that can remedy it
  peripheralManager.handleCommand('shutdown')
}

/* Uncomment the following lines to simulate a session
setTimeout(function() {
  replayRowingSession(handleRotationImpulse, {
    filename: 'recordings/Concept2_RowErg_Session_2000meters.csv', // Concept 2, 2000 meter session
    realtime: true,
    loop: true
  })
}, 30000)
*/
