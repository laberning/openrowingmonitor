'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This is currently a very simple Web UI that displays the training metrics. Does not use any bundling
  or transpiling yet.
*/
// eslint-disable-next-line no-unused-vars
export function createApp () {
  const fields = ['strokesTotal', 'distanceTotal', 'caloriesTotal', 'power', 'splitFormatted', 'strokesPerMinute', 'durationTotalFormatted', 'peripheralMode']
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
    distanceTotal: (value) => value >= 10000 ? { value: (value / 1000).toFixed(1), unit: 'km' } : { value, unit: 'm' }
  }
  const standalone = (window.location.hash === '#:standalone:')

  if (standalone) {
    document.getElementById('closeButton').style.display = 'inline-block'
  } else {
    document.getElementById('fullscreenButton').style.display = 'inline-block'
  }

  let socket

  initWebsocket()
  resetFields()
  requestWakeLock()

  function initWebsocket () {
  // use the native websocket implementation of browser to communicate with backend
  // eslint-disable-next-line no-undef
    socket = new WebSocket(`ws://${location.host}`)

    socket.addEventListener('open', (event) => {
      console.log('websocket openend')
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

        for (const [key, value] of Object.entries(data)) {
          if (fields.includes(key)) {
            const valueFormatted = fieldFormatter[key] ? fieldFormatter[key](value) : value
            if (valueFormatted.value && valueFormatted.unit) {
              document.getElementById(key).innerHTML = valueFormatted.value
              document.getElementById(`${key}Unit`).innerHTML = valueFormatted.unit
            } else {
              document.getElementById(key).innerHTML = valueFormatted
            }
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
    // eslint-disable-next-line no-undef
    const noSleep = new NoSleep()
    checkAlwaysOn()
    document.addEventListener('click', function enableNoSleep () {
      document.removeEventListener('click', enableNoSleep, false)
      noSleep.enable().then(checkAlwaysOn)
    }, false)

    function checkAlwaysOn () {
      if (noSleep.isEnabled) {
        document.getElementById('alwaysOnHint').style.display = 'none'
      } else {
        document.getElementById('alwaysOnHint').style.display = 'grid'
      }
    }
  }

  function resetFields () {
    for (const key of fields) {
      document.getElementById(key).innerHTML = '--'
    }
  }

  function toggleFullscreen () {
    const fullscreenElement = document.getElementById('dashboard')
    if (!document.fullscreenElement) {
      fullscreenElement.requestFullscreen({ navigationUI: 'hide' })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  function close () {
    window.close()
  }

  function reset () {
    resetFields()
    if (socket)socket.send(JSON.stringify({ command: 'reset' }))
  }

  function switchPeripheralMode () {
    if (socket)socket.send(JSON.stringify({ command: 'switchPeripheralMode' }))
  }

  return {
    toggleFullscreen,
    reset,
    close,
    switchPeripheralMode
  }
}
