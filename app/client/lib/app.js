'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Initialization file of the Open Rowing Monitor App
*/

import NoSleep from 'nosleep.js'

export function createApp (app) {
  const fields = ['strokesTotal', 'distanceTotal', 'caloriesTotal', 'power', 'heartrate',
    'splitFormatted', 'strokesPerMinute', 'durationTotalFormatted', 'peripheralMode']
  // todo: formatting should happen in the related components (i.e.) PerformanceDashboard
  const fieldFormatter = {
    peripheralMode: (value) => {
      if (value === 'PM5') {
        return 'C2 PM5'
      } else if (value === 'FTMSBIKE') {
        return 'FTMS Bike'
      } else {
        return 'FTMS Rower'
      }
    },
    distanceTotal: (value) => value >= 10000
      ? { value: (value / 1000).toFixed(1), unit: 'km' }
      : { value: Math.round(value), unit: 'm' },
    caloriesTotal: (value) => Math.round(value),
    power: (value) => Math.round(value),
    strokesPerMinute: (value) => Math.round(value)
  }
  const mode = window.location.hash
  const appMode = mode === '#:standalone:' ? 'STANDALONE' : mode === '#:kiosk:' ? 'KIOSK' : ''
  app.updateState({ ...app.getState(), appMode })

  const metrics = {}

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

    socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data)

        let activeFields = fields
        // if we are in reset state only update heart rate and peripheral mode
        if (data.strokesTotal === 0) {
          activeFields = ['heartrate', 'peripheralMode']
        }

        // todo: formatting should happen in the related components (i.e.) PerformanceDashboard
        for (const [key, value] of Object.entries(data)) {
          if (activeFields.includes(key)) {
            const valueFormatted = fieldFormatter[key] ? fieldFormatter[key](value) : value
            if (valueFormatted.value !== undefined && valueFormatted.unit !== undefined) {
              metrics[key] = {
                value: valueFormatted.value,
                unit: valueFormatted.unit
              }
            } else {
              metrics[key] = {
                value: valueFormatted
              }
            }
          }
        }

        app.updateState({ ...app.getState(), metrics })
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
    for (const key of fields.filter((elem) => elem !== 'peripheralMode' && elem !== 'heartrate')) {
      metrics[key] = { value: '--' }
    }
    app.updateState({ ...app.getState(), metrics })
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
