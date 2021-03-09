'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This is currently a very simple Web UI that displays the training metrics. Does not use any bundling
  or transpiling yet.
*/
// eslint-disable-next-line no-unused-vars
export function createApp () {
  const fields = ['strokesTotal', 'distanceTotal', 'caloriesTotal', 'power', 'splitFormatted', 'strokesPerMinute', 'durationTotal']

  initWebsocket()
  resetFields()
  requestWakeLock()

  function initWebsocket () {
  // use the native websocket implementation of browser to communicate with backend
  // eslint-disable-next-line no-undef
    const socket = new WebSocket(`ws://${location.host}`)

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
            document.getElementById(key).innerHTML = value
          }
        }
      } catch (err) {
        console.log(err)
      }
    })
  }

  async function requestWakeLock () {
    // use the Wake Lock API to prevent the screen from going to standby
    if (!('wakeLock' in navigator)) {
      console.log('Browser does not support Wake Lock API (or maybe we are not using SSL).' +
      'Now enforcing the screen with a hack, user has to click once for this to work...')
      // Chrome enables the new Wake Lock API only if the connection is secured via SSL
      // This is quite annoying for IoT use cases like this one, where the device sits on the
      // local network and is directly addressed by its IP.
      // In this case the only way of using SSL is by creating a self signed certificate, and
      // that would pop up different warnings in the browser (and also prevents fullscreen via
      // a home screen icon so it can show these warnings). Okay, enough ranting :-)
      // In this case we use the good old hacky way of keeping the screen on via a hidden video.
      // eslint-disable-next-line no-undef
      const noSleep = new NoSleep()
      document.addEventListener('click', function enableNoSleep () {
        document.removeEventListener('click', enableNoSleep, false)
        noSleep.enable()
      }, false)
    } else {
      try {
        await navigator.wakeLock.request('screen')
        console.log('Wake Lock is active')
      } catch (err) {
        console.log(err)
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

  function reset () {
    resetFields()
    socket.send(JSON.stringify({ command: 'reset' }))
  }

  return {
    toggleFullscreen,
    reset
  }
}
