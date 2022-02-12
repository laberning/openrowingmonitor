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

  wss.on('connection', function connection (client) {
    log.debug('websocket client connected')
    emitter.emit('clientConnected', client)
    client.on('message', function incoming (data) {
      try {
        const message = JSON.parse(data)
        if (message) {
          emitter.emit('messageReceived', message, client)
        } else {
          log.warn(`invalid message received: ${data}`)
        }
      } catch (err) {
        log.error(err)
      }
    })
    client.on('close', function () {
      log.debug('websocket client disconnected')
    })
  })

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
    const messageString = JSON.stringify({ type, data })
    wss.clients.forEach(function each (client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageString)
      }
    })
  }

  return Object.assign(emitter, {
    notifyClient,
    notifyClients
  })
}

export { createWebServer }
