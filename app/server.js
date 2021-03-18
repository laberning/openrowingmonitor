'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This start file is currently a mess, as this currently is the devlopment playground to plug
  everything together while figuring out the physics and model of the application.
  todo: refactor this as we progress
*/
import { fork } from 'child_process'
import WebSocket from 'ws'
import finalhandler from 'finalhandler'
import http from 'http'
import serveStatic from 'serve-static'
import log from 'loglevel'
import { createFtmsPeripheral } from './ble/FtmsPeripheral.js'
// eslint-disable-next-line no-unused-vars
import { createPm5Peripheral } from './ble/Pm5Peripheral.js'
import { createRowingEngine } from './engine/RowingEngine.js'
import { createRowingStatistics } from './engine/RowingStatistics.js'
// eslint-disable-next-line no-unused-vars
import { recordRowingSession, replayRowingSession } from './tools/RowingRecorder.js'

// sets the global log level
log.setLevel(log.levels.INFO)
// some modules can be set individually to filter noise
log.getLogger('RowingEngine').setLevel(log.levels.INFO)

const peripheral = createFtmsPeripheral({
  simulateIndoorBike: false
})

// the simulation of a C2 PM5 is not finished yet
// const peripheral = createPm5Peripheral()

peripheral.on('controlPoint', (event) => {
  if (event?.req?.name === 'requestControl') {
    event.res = true
  } else if (event?.req?.name === 'reset') {
    log.debug('reset requested')
    rowingStatistics.reset()
    peripheral.notifyStatus({ name: 'reset' })
    event.res = true
  // todo: we could use these controls once we implement a concept of a rowing session
  } else if (event?.req?.name === 'stop') {
    log.debug('stop requested')
    peripheral.notifyStatus({ name: 'stoppedOrPausedByUser' })
    event.res = true
  } else if (event?.req?.name === 'pause') {
    log.debug('pause requested')
    peripheral.notifyStatus({ name: 'stoppedOrPausedByUser' })
    event.res = true
  } else if (event?.req?.name === 'startOrResume') {
    log.debug('startOrResume requested')
    peripheral.notifyStatus({ name: 'startedOrResumedByUser' })
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
  `, cal: ${data.caloriesTotal}kcal, SPM: ${data.strokesPerMinute}, speed: ${data.speed}km/h`)

  const metrics = {
    durationTotal: data.durationTotal,
    durationTotalFormatted: data.durationTotalFormatted,
    strokesTotal: data.strokesTotal,
    distanceTotal: data.distanceTotal,
    caloriesTotal: data.caloriesTotal,
    power: data.power,
    splitFormatted: data.splitFormatted,
    split: data.split,
    strokesPerMinute: data.strokesPerMinute,
    speed: data.speed,
    strokeState: data.strokeState
  }
  notifyWebClients(metrics)
  peripheral.notifyData(metrics)
})

rowingStatistics.on('rowingPaused', (data) => {
  const metrics = {
    durationTotal: data.durationTotal,
    durationTotalFormatted: data.durationTotalFormatted,
    strokesTotal: data.strokesTotal,
    distanceTotal: data.distanceTotal,
    caloriesTotal: data.caloriesTotal,
    strokesPerMinute: 0,
    power: 0,
    // todo: setting split to 0 might be dangerous, depending on what the client does with this
    splitFormatted: '00:00',
    split: 0,
    speed: 0,
    strokeState: 'RECOVERY'
  }
  notifyWebClients(metrics)
  peripheral.notifyData(metrics)
})

rowingStatistics.on('durationUpdate', (data) => {
  notifyWebClients({
    durationTotalFormatted: data.durationTotalFormatted
  })
})

const port = process.env.PORT || 80
const serve = serveStatic('./app/client', { index: ['index.html'] })

const server = http.createServer((req, res) => {
  serve(req, res, finalhandler(req, res))
})

server.listen(port)

const wss = new WebSocket.Server({ server })

wss.on('connection', function connection (ws) {
  log.debug('websocket client connected')
  ws.on('message', function incoming (data) {
    try {
      const message = JSON.parse(data)
      if (message && message.command === 'reset') {
        rowingStatistics.reset()
        peripheral.notifyStatus({ name: 'reset' })
      } else {
        log.info(`invalid command received: ${data}`)
      }
    } catch (err) {
      log.error(err)
    }
  })
  ws.on('close', function () {
    log.debug('websocket client disconnected')
  })
})

function notifyWebClients (message) {
  const messageString = JSON.stringify(message)
  wss.clients.forEach(function each (client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageString)
    }
  })
}

// recordRowingSession('recordings/wrx700_2magnets.csv')
/*
replayRowingSession(rowingEngine.handleRotationImpulse, {
  filename: 'recordings/wrx700_2magnets.csv',
  realtime: true,
  loop: true
})
*/

// for temporary simulation of usage
/*
setInterval(simulateRowing, 2000)
let simStroke = 0
let simDistance = 0.0
let simCalories = 0.0
function simulateRowing () {
  const metrics = {
    strokesTotal: simStroke++,
    distanceTotal: Math.round(simDistance += 10.1),
    caloriesTotal: Math.round(simCalories += 0.3),
    power: Math.round(80 + 20 * (Math.random() - 0.5)),
    splitFormatted: '02:30',
    split: Math.round(80 + 20 * (Math.random() - 0.5)),
    strokesPerMinute: Math.round(10 + 20 * (Math.random() - 0.5)),
    speed: Math.round((15 + 20 * (Math.random() - 0.5)).toFixed(2))
  }
  peripheral.notifyData(metrics)
  notifyWebClients(metrics)
}
*/
