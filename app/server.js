'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This start file is currently a mess, as this currently is the devlopment playground to plug
  everything together while figuring out the physics and model of the application.
  todo: refactor this as we progress
*/
import { fork } from 'child_process'
import log from 'loglevel'
import config from './config.js'
import { createRowingEngine } from './engine/RowingEngine.js'
import { createRowingStatistics } from './engine/RowingStatistics.js'
import { createWebServer } from './WebServer.js'
import { createPeripheralManager } from './ble/PeripheralManager.js'
// eslint-disable-next-line no-unused-vars
import { recordRowingSession, replayRowingSession } from './tools/RowingRecorder.js'

// set the log levels
log.setLevel(config.loglevel.default)
for (const [loggerName, logLevel] of Object.entries(config.loglevel)) {
  if (loggerName !== 'default') {
    log.getLogger(loggerName).setLevel(logLevel)
  }
}

log.info(`==== Open Rowing Monitor ${process.env.npm_package_version} ====\n`)

const peripheralManager = createPeripheralManager()

peripheralManager.on('control', (event) => {
  if (event?.req?.name === 'requestControl') {
    event.res = true
  } else if (event?.req?.name === 'reset') {
    log.debug('reset requested')
    rowingStatistics.reset()
    peripheralManager.notifyStatus({ name: 'reset' })
    event.res = true
  // todo: we could use these controls once we implement a concept of a rowing session
  } else if (event?.req?.name === 'stop') {
    log.debug('stop requested')
    peripheralManager.notifyStatus({ name: 'stoppedOrPausedByUser' })
    event.res = true
  } else if (event?.req?.name === 'pause') {
    log.debug('pause requested')
    peripheralManager.notifyStatus({ name: 'stoppedOrPausedByUser' })
    event.res = true
  } else if (event?.req?.name === 'startOrResume') {
    log.debug('startOrResume requested')
    peripheralManager.notifyStatus({ name: 'startedOrResumedByUser' })
    event.res = true
  } else if (event?.req?.name === 'peripheralMode') {
    webServer.notifyClients({ peripheralMode: event.req.peripheralMode })
    event.res = true
  } else {
    log.info('unhandled Command', event.req)
  }
})

const gpioTimerService = fork('./app/gpio/GpioTimerService.js')
gpioTimerService.on('message', (dataPoint) => {
  rowingEngine.handleRotationImpulse(dataPoint)
})

const rowingEngine = createRowingEngine()
const rowingStatistics = createRowingStatistics()
rowingEngine.notify(rowingStatistics)

rowingStatistics.on('strokeFinished', (data) => {
  log.info(`stroke: ${data.strokesTotal}, dur: ${data.strokeTime}s, power: ${data.power}w` +
  `, split: ${data.splitFormatted}, ratio: ${data.powerRatio}, dist: ${data.distanceTotal}m` +
  `, cal: ${data.caloriesTotal}kcal, SPM: ${data.strokesPerMinute}, speed: ${data.speed}km/h` +
  `, cal/hour: ${data.caloriesPerHour}kcal, cal/minute: ${data.caloriesPerMinute}kcal`)
  const metrics = {
    durationTotal: data.durationTotal,
    durationTotalFormatted: data.durationTotalFormatted,
    strokesTotal: data.strokesTotal,
    distanceTotal: data.distanceTotal,
    caloriesTotal: data.caloriesTotal,
    caloriesPerMinute: data.caloriesPerMinute,
    caloriesPerHour: data.caloriesPerHour,
    power: data.power,
    splitFormatted: data.splitFormatted,
    split: data.split,
    strokesPerMinute: data.strokesPerMinute,
    speed: data.speed,
    strokeState: data.strokeState
  }
  webServer.notifyClients(metrics)
  peripheralManager.notifyMetrics('strokeFinished', metrics)
})

rowingStatistics.on('rowingPaused', (data) => {
  const metrics = {
    durationTotal: data.durationTotal,
    durationTotalFormatted: data.durationTotalFormatted,
    strokesTotal: data.strokesTotal,
    distanceTotal: data.distanceTotal,
    caloriesTotal: data.caloriesTotal,
    caloriesPerMinute: 0,
    caloriesPerHour: 0,
    strokesPerMinute: 0,
    power: 0,
    // todo: setting split to 0 might be dangerous, depending on what the client does with this
    splitFormatted: '00:00',
    split: 0,
    speed: 0,
    strokeState: 'RECOVERY'
  }
  webServer.notifyClients(metrics)
  peripheralManager.notifyMetrics('rowingPaused', metrics)
})

rowingStatistics.on('durationUpdate', (data) => {
  webServer.notifyClients({
    durationTotalFormatted: data.durationTotalFormatted
  })
})

const webServer = createWebServer()
webServer.on('messageReceived', (message) => {
  if (message.command === 'reset') {
    rowingStatistics.reset()
    peripheralManager.notifyStatus({ name: 'reset' })
  } if (message.command === 'switchPeripheralMode') {
    peripheralManager.switchPeripheralMode()
  } else {
    log.warn(`invalid command received: ${message}`)
  }
})

webServer.on('clientConnected', () => {
  webServer.notifyClients({ peripheralMode: peripheralManager.getPeripheralMode() })
})

// recordRowingSession('recordings/wrx700_2magnets.csv')
/*
replayRowingSession(rowingEngine.handleRotationImpulse, {
  filename: 'recordings/wrx700_2magnets.csv',
  realtime: true,
  loop: true
})
*/
