'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Starts the central manager in a forked thread since noble does not like
  to run in the same thread as bleno
*/
import EventEmitter from 'node:events'
import child_process from 'child_process'

function createBleHrmPeripheral () {
  const emitter = new EventEmitter()

  const bleHrmProcess = child_process.fork('./app/peripherals/ble/hrm/HrmService.js')

  bleHrmProcess.on('message', (heartRateMeasurement) => {
    emitter.emit('heartRateMeasurement', heartRateMeasurement)
  })

  function destroy () {
    return new Promise(resolve => {
      bleHrmProcess.kill()
      bleHrmProcess.removeAllListeners()
      resolve()
    })
  }

  return Object.assign(emitter, {
    destroy
  })
}

export { createBleHrmPeripheral }
