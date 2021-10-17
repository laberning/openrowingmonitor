'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Creates the WebServer which serves the static assets and communicates with the clients
  via WebSockets
*/
import { WebSocket, WebSocketServer } from 'ws'
import finalhandler from 'finalhandler'
import http from 'http'
import serveStatic from 'serve-static'
import log from 'loglevel'
import EventEmitter from 'events'

function createWebServer () {
  const emitter = new EventEmitter()
  const port = process.env.PORT || 80
  const serve = serveStatic('./build', { index: ['index.html'] })

  const server = http.createServer((req, res) => {
    serve(req, res, finalhandler(req, res))
  })

  server.listen(port, (err) => {
    if (err) throw err
    log.info(`webserver running on port ${port}`)
  })

  const wss = new WebSocketServer({ server })

  wss.on('connection', function connection (ws) {
    log.debug('websocket client connected')
    emitter.emit('clientConnected', ws)
    ws.on('message', function incoming (data) {
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
    ws.on('close', function () {
      log.debug('websocket client disconnected')
    })
  })

  function notifyClients (message) {
    const messageString = JSON.stringify(message)
    wss.clients.forEach(function each (client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageString)
      }
    })
  }

  return Object.assign(emitter, {
    notifyClients
  })
}

export { createWebServer }
