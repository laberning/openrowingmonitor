'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
/**
 * Creates the WebServer which serves the static assets and communicates with the clients via WebSockets
 */
import { WebSocket, WebSocketServer } from 'ws'
import finalhandler from 'finalhandler'
import http from 'http'
import serveStatic from 'serve-static'
import log from 'loglevel'
import EventEmitter from 'events'

export function createWebServer (config) {
  const emitter = new EventEmitter()
  const port = process.env.PORT || 80
  const serve = serveStatic('./build', { index: ['index.html'] })
  let timer = setTimeout(timeBasedPresenter, config.webUpdateInterval)
  let lastKnownMetrics
  let heartRate
  let heartRateBatteryLevel
  resetLastKnownMetrics()

  const server = http.createServer((req, res) => {
    serve(req, res, finalhandler(req, res))
  })

  server.listen(port, (err) => {
    if (err) { throw err }
    log.info(`webserver running on port ${port}`)
  })

  const wss = new WebSocketServer({ server })

  wss.on('connection', function connection (client) {
    log.debug('websocket client connected')
    notifyClient(client, 'config', getConfig())
    notifyClient(client, 'metrics', lastKnownMetrics)
    client.on('message', function incoming (data) {
      try {
        const message = JSON.parse(data)
        if (message) {
          emitter.emit('messageReceived', message)
        } else {
          log.warn(`invalid message received: ${data}`)
        }
      } catch (err) {
        log.error(err)
      }
    })
    client.on('close', function close () {
      log.debug('websocket client disconnected')
    })
  })

  // This function handles all incomming commands. As all commands are broadasted to all application parts,
  // we need to filter here what the webserver will react to and what it will ignore
  // The start...reset commands are handled by the RowingEngine and the result will be reported by the metrics update, so we ignore them here
  /* eslint-disable-next-line no-unused-vars -- this is part of the standardised handleCommand interface */
  function handleCommand (commandName, data) {
    switch (commandName) {
      case ('updateIntervalSettings'):
        break
      case ('start'):
        break
      case ('startOrResume'):
        break
      case ('pause'):
        break
      case ('stop'):
        break
      case ('reset'):
        resetLastKnownMetrics()
        notifyClients('metrics', lastKnownMetrics)
        break
      case 'switchBlePeripheralMode':
        break
      case 'switchAntPeripheralMode':
        break
      case 'switchHrmMode':
        break
      case 'refreshPeripheralConfig':
        notifyClients('config', getConfig())
        break
      case 'upload':
        break
      case 'shutdown':
        break
      default:
        log.error(`WebServer: Recieved unknown command: ${commandName}`)
    }
  }

  function presentRowingMetrics (metrics) {
    if (metrics.metricsContext === undefined) { return }
    switch (true) {
      case (metrics.metricsContext.isSessionStart):
        notifyClients('metrics', metrics)
        break
      case (metrics.metricsContext.isSessionStop):
        notifyClients('metrics', metrics)
        break
      case (metrics.metricsContext.isIntervalEnd):
        notifyClients('metrics', metrics)
        break
      case (metrics.metricsContext.isPauseStart):
        notifyClients('metrics', metrics)
        break
      case (metrics.metricsContext.isPauseEnd):
        notifyClients('metrics', metrics)
        break
      case (metrics.metricsContext.isDriveStart):
        notifyClients('metrics', metrics)
        break
      case (metrics.metricsContext.isRecoveryStart):
        notifyClients('metrics', metrics)
        break
      // no default
    }
    lastKnownMetrics = metrics
  }

  // initiated when a new heart rate value is received from heart rate sensor
  async function presentHeartRate (value) {
    heartRate = value.heartrate
    heartRateBatteryLevel = value.batteryLevel
  }

  // Make sure that the GUI is updated with the latest metrics even when no fresh data arrives
  function timeBasedPresenter () {
    notifyClients('metrics', lastKnownMetrics)
  }

  /**
   * @param {Metrics} metrics
   */
  function addHeartRateToMetrics (metrics) {
    if (heartRate !== undefined) {
      metrics.heartrate = heartRate
    } else {
      metrics.heartrate = undefined
    }
    if (heartRateBatteryLevel !== undefined) {
      metrics.heartRateBatteryLevel = heartRateBatteryLevel
    } else {
      metrics.heartRateBatteryLevel = undefined
    }
  }

  function notifyClient (client, type, data) {
    const messageString = JSON.stringify({ type, data })
    if (wss.clients.has(client)) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageString)
      }
    } else {
      log.error('trying to send message to a client that does not exist')
    }
  }

  function notifyClients (type, data) {
    clearTimeout(timer)
    if (type === 'metrics') { addHeartRateToMetrics(data) }
    const messageString = JSON.stringify({ type, data })
    wss.clients.forEach(function each (client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageString)
      }
    })
    timer = setTimeout(timeBasedPresenter, config.webUpdateInterval)
  }

  function getConfig () {
    return {
      blePeripheralMode: config.bluetoothMode,
      antPeripheralMode: config.antPlusMode,
      hrmPeripheralMode: config.heartRateMode,
      uploadEnabled: ((config.userSettings.strava.allowUpload && !config.userSettings.strava.autoUpload) || (config.userSettings.intervals.allowUpload && !config.userSettings.intervals.autoUpload) || (config.userSettings.rowsAndAll.allowUpload && !config.userSettings.rowsAndAll.autoUpload)),
      shutdownEnabled: !!config.shutdownCommand
    }
  }

  function resetLastKnownMetrics () {
    lastKnownMetrics = {
      strokeState: 'WaitingForDrive',
      sessionState: 'WaitingForStart',
      totalMovingTime: 0,
      pauseCountdownTime: 0,
      totalNumberOfStrokes: 0,
      totalLinearDistance: 0,
      cyclePace: Infinity,
      cyclePower: 0,
      cycleStrokeRate: 0,
      driveLength: 0,
      driveDuration: 0,
      driveHandleForceCurve: [],
      driveDistance: 0,
      recoveryDuration: 0,
      dragFactor: undefined,
      interval: {
        type: 'justrow',
        movingTime: {
          sinceStart: 0,
          toEnd: 0
        },
        distance: {
          fromStart: 0,
          toEnd: 0
        }
      }
    }
  }

  return Object.assign(emitter, {
    presentRowingMetrics,
    presentHeartRate,
    handleCommand
  })
}
