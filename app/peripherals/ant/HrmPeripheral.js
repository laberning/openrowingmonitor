'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Creates a Bluetooth Low Energy (BLE) Peripheral with all the Services that are required for
  a Cycling Speed and Cadence Profile
*/
import EventEmitter from 'node:events'
import Ant from 'ant-plus'

function createAntHrmPeripheral (antManager) {
  const emitter = new EventEmitter()
  const antStick = antManager.getAntStick()

  const heartRateSensor = new Ant.HeartRateSensor(antStick)

  heartRateSensor.on('hbData', (data) => {
    emitter.emit('heartRateMeasurement', { heartrate: data.ComputedHeartRate, batteryLevel: data.BatteryLevel })
  })

  function attach () {
    return new Promise(resolve => {
      heartRateSensor.once('attached', () => {
        resolve()
      })
      heartRateSensor.attach(0, 0)
    })
  }

  function destroy () {
    return new Promise((resolve) => {
      heartRateSensor.once('detached', () => {
        heartRateSensor.removeAllListeners()
        resolve()
      })
      heartRateSensor.detach()
    })
  }

  return Object.assign(emitter, {
    destroy,
    attach
  })
}

export { createAntHrmPeripheral }
