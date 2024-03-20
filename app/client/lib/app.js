'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Initialization file of the Open Rowing Monitor App
*/

import NoSleep from 'nosleep.js'
import { filterObjectByKeys } from './helper.js'

export function createApp (app) {
  const stravaAuthorizationCode = new URLSearchParams(window.location.search).get('code')

  let socket

  initWebsocket()
  resetFields()
  requestWakeLock()

  function websocketOpened () {
    if (stravaAuthorizationCode) {
      handleStravaAuthorization(stravaAuthorizationCode)
    }
  }

  function handleStravaAuthorization (stravaAuthorizationCode) {
    if (socket)socket.send(JSON.stringify({ command: 'stravaAuthorizationCode', data: stravaAuthorizationCode }))
  }

  let initialWebsocketOpenend = true
  function initWebsocket () {
    // use the native websocket implementation of browser to communicate with backend
    socket = new WebSocket(`ws://${location.host}/websocket`)

    socket.addEventListener('open', (event) => {
      console.log('websocket opened')
      if (initialWebsocketOpenend) {
        websocketOpened()
        initialWebsocketOpenend = false
      }
    })

    socket.addEventListener('error', (error) => {
      console.log('websocket error', error)
      socket.close()
    })

    socket.addEventListener('close', (event) => {
      console.log('websocket closed, attempting reconnect')
      setTimeout(() => {
        initWebsocket()
      }, 1000)
    })

    // todo: we should use different types of messages to make processing easier
    socket.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data)
        if (!message.type) {
          console.error('message does not contain messageType specifier', message)
          return
        }
        const data = message.data
        switch (message.type) {
          case 'config': {
            app.updateState({ ...app.getState(), config: { ...app.getState().config, ...data } })
            break
          }
          case 'metrics': {
            app.updateState({ ...app.getState(), metrics: data })
            break
          }
          case 'authorizeStrava': {
            const currentUrl = encodeURIComponent(window.location.href)
            window.location.href = `https://www.strava.com/oauth/authorize?client_id=${data.stravaClientId}&response_type=code&redirect_uri=${currentUrl}&approval_prompt=force&scope=activity:write`
            break
          }
          default: {
            console.error(`unknown message type: ${message.type}`, message.data)
          }
        }
      } catch (err) {
        console.log(err)
      }
    })
  }

  async function requestWakeLock () {
    // Chrome enables the new Wake Lock API only if the connection is secured via SSL
    // This is quite annoying for IoT use cases like this one, where the device sits on the
    // local network and is directly addressed by its IP.
    // In this case the only way of using SSL is by creating a self signed certificate, and
    // that would pop up different warnings in the browser (and also prevents fullscreen via
    // a home screen icon so it can show these warnings). Okay, enough ranting :-)
    // In this case we use the good old hacky way of keeping the screen on via a hidden video.
    const noSleep = new NoSleep()
    document.addEventListener('click', function enableNoSleep () {
      document.removeEventListener('click', enableNoSleep, false)
      noSleep.enable()
    }, false)
  }

  function resetFields () {
    const appState = app.getState()
    // drop all metrics except heartrate
    app.updateState({ ...appState, metrics: { ...filterObjectByKeys(appState.metrics, ['heartrate', 'heartRateBatteryLevel']) } })
  }

  function handleAction (action) {
    switch (action.command) {
      case 'switchBlePeripheralMode': {
        if (socket)socket.send(JSON.stringify({ command: 'switchBlePeripheralMode' }))
        break
      }
      case 'switchAntPeripheralMode': {
        if (socket)socket.send(JSON.stringify({ command: 'switchAntPeripheralMode' }))
        break
      }
      case 'switchHrmMode': {
        if (socket)socket.send(JSON.stringify({ command: 'switchHrmMode' }))
        break
      }
      case 'reset': {
        resetFields()
        if (socket)socket.send(JSON.stringify({ command: 'reset' }))
        break
      }
      case 'uploadTraining': {
        if (socket)socket.send(JSON.stringify({ command: 'uploadTraining' }))
        break
      }
      case 'shutdown': {
        if (socket)socket.send(JSON.stringify({ command: 'shutdown' }))
        break
      }
      default: {
        console.error('no handler defined for action', action)
      }
    }
  }

  return {
    handleAction
  }
}
