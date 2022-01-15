'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Initialization file of the Open Rowing Monitor App
*/

import NoSleep from 'nosleep.js'

const rowingMetricsFields = ['strokesTotal', 'distanceTotal', 'caloriesTotal', 'power', 'heartrate',
  'heartrateBatteryLevel', 'splitFormatted', 'strokesPerMinute', 'durationTotalFormatted']

export function createApp (app) {
  const mode = window.location.hash
  const appMode = mode === '#:standalone:' ? 'STANDALONE' : mode === '#:kiosk:' ? 'KIOSK' : 'BROWSER'
  app.updateState({ ...app.getState(), appMode })

  let socket

  initWebsocket()
  resetFields()
  requestWakeLock()

  function initWebsocket () {
    // use the native websocket implementation of browser to communicate with backend
    // eslint-disable-next-line no-undef
    socket = new WebSocket(`ws://${location.host}/websocket`)

    socket.addEventListener('open', (event) => {
      console.log('websocket opened')
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

    // todo: we have to use different types of messages to make processing easier
    socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data)

        let activeFields = rowingMetricsFields
        // if we are in reset state only update heart rate
        if (data.strokesTotal === 0) {
          activeFields = ['heartrate']
        }

        const filteredData = Object.keys(data)
          .filter(key => activeFields.includes(key))
          .reduce((obj, key) => {
            obj[key] = data[key]
            return obj
          }, {})

        let updatedState = { ...app.getState(), metrics: filteredData }
        if (data.peripheralMode) {
          updatedState = { ...app.getState(), peripheralMode: data.peripheralMode }
        }
        app.updateState(updatedState)
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
    appState.metrics = Object.keys(appState.metrics)
      .filter(key => key === 'heartrate' || key === 'heartrateBatteryLevel')
      .reduce((obj, key) => {
        obj[key] = appState.metrics[key]
        return obj
      }, {})
    app.updateState(appState)
  }

  function handleAction (action) {
    if (action.command === 'switchPeripheralMode') {
      if (socket)socket.send(JSON.stringify({ command: 'switchPeripheralMode' }))
    } else if (action.command === 'reset') {
      resetFields()
      if (socket)socket.send(JSON.stringify({ command: 'reset' }))
    } else {
      console.error('no handler defined for action', action)
    }
  }

  return {
    handleAction
  }
}
