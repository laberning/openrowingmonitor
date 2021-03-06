'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This start file is currently a mess, as this currently is the devlopment playground to plug
  everything together while figuring out the physics and model of the application.
  todo: refactor this as we progress
*/
import { createRowingMachinePeripheral } from './ble/RowingMachinePeripheral.js'
import { createRowingEngine } from './engine/RowingEngine.js'
import { createRowingStatistics } from './engine/RowingStatistics.js'
// import { recordRowingSession } from './tools/RowingRecorder.js'
// import readline from 'readline'
// import fs from 'fs'
import { fork } from 'child_process'
import WebSocket from 'ws'
import finalhandler from 'finalhandler'
import http from 'http'
import serveStatic from 'serve-static'

let websocket
// recordRowingSession('recordings/wrx700_2magnets.csv')
const peripheral = createRowingMachinePeripheral({
  simulateIndoorBike: true
})

peripheral.on('controlPoint', (event) => {
  if (event?.req?.name === 'requestControl') {
    event.res = true
  } else if (event?.req?.name === 'reset') {
    console.log('reset requested')
    rowingStatistics.reset()
    peripheral.notifyStatus({ name: 'reset' })
    event.res = true
  // todo: we could use these controls once we implement a concept of a rowing session
  } else if (event?.req?.name === 'stop') {
    console.log('stop requested')
    peripheral.notifyStatus({ name: 'stoppedOrPausedByUser' })
    event.res = true
  } else if (event?.req?.name === 'pause') {
    console.log('pause requested')
    peripheral.notifyStatus({ name: 'stoppedOrPausedByUser' })
    event.res = true
  } else if (event?.req?.name === 'startOrResume') {
    console.log('startOrResume requested')
    peripheral.notifyStatus({ name: 'startedOrResumedByUser' })
    event.res = true
  } else {
    console.log('unhandled Command', event.req)
  }
})

const gpioTimerService = fork('./app/gpio/GpioTimerService.js')
gpioTimerService.on('message', (dataPoint) => {
  // console.log(dataPoint)
  rowingEngine.handleRotationImpulse(dataPoint)
})

const rowingEngine = createRowingEngine()
const rowingStatistics = createRowingStatistics()
rowingEngine.notify(rowingStatistics)

rowingStatistics.on('strokeFinished', (data) => {
  console.log(`stroke: ${data.strokesTotal}, dur: ${data.strokeTime}s, power: ${data.power}w` +
  `, split: ${data.splitFormatted}, ratio: ${data.powerRatio}, dist: ${data.distanceTotal}m` +
  `, cal: ${data.caloriesTotal}kcal, SPM: ${data.strokesPerMinute}, speed: ${data.speed}km/h`)

  const metrics = {
    strokesTotal: data.strokesTotal,
    distanceTotal: data.distanceTotal,
    caloriesTotal: data.caloriesTotal,
    power: data.power,
    splitFormatted: data.splitFormatted,
    split: data.split,
    strokesPerMinute: data.strokesPerMinute,
    speed: data.speed
  }

  if (websocket) {
    websocket.send(JSON.stringify(metrics))
  }
  peripheral.notifyData(metrics)
})

rowingStatistics.on('durationUpdate', (data) => {
  if (websocket) {
    websocket.send(JSON.stringify({
      durationTotal: data.durationTotal
    }))
  }
})

const port = process.env.PORT || 80
const serve = serveStatic('./app/client', { index: ['index.html'] })

const server = http.createServer((req, res) => {
  serve(req, res, finalhandler(req, res))
})

server.listen(port)

const wss = new WebSocket.Server({ server })

wss.on('connection', function connection (ws) {
  websocket = ws
  ws.on('message', function incoming (data) {
    try {
      const message = JSON.parse(data)
      if (message && message.command === 'reset') {
        rowingStatistics.reset()
        peripheral.notifyStatus({ name: 'reset' })
      } else {
        console.log(`invalid command received: ${data}`)
      }
    } catch (err) {
      console.log(err)
    }
  })
/*
  ws.send(JSON.stringify({
    strokesTotal: 15,
    distanceTotal: 206,
    caloriesTotal: 51,
    power: 174,
    split: '02:30',
    strokesPerMinute: 14
  }))
  */
})

/*
const readInterface = readline.createInterface({
  input: fs.createReadStream('recordings/wrx700_2magnets.csv')
})

readInterface.on('line', function (line) {
  rowingEngine.handleRotationImpulse(parseFloat(line))
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
    distanceTotal: simDistance += 10.1,
    caloriesTotal: simCalories += 0.3,
    power: 80 + 20 * (Math.random() - 0.5),
    splitFormatted: 160 + 20 * (Math.random() - 0.5),
    split: 80 + 20 * (Math.random() - 0.5),
    strokesPerMinute: 10 + 20 * (Math.random() - 0.5),
    speed: (15 + 20 * (Math.random() - 0.5)).toFixed(2)
  }
  // console.log(metrics)
  peripheral.notifyData(metrics)
}
*/
