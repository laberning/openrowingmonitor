'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Creates a Bluetooth Low Energy (BLE) Peripheral with all the Services that are required for
  a Cycling Speed and Cadence Profile
*/
import EventEmitter from 'node:events'
import Ant from 'ant-plus'
import log from 'loglevel'

function createAntHrmPeripheral (antManager) {
  const emitter = new EventEmitter()
  const antStick = antManager.getAntStick()

  const heartRateSensor = new Ant.HeartRateSensor(antStick)

  heartRateSensor.on('hbData', (data) => {
    emitter.emit('heartRateMeasurement', { heartrate: data.ComputedHeartRate, batteryLevel: data.BatteryLevel })
  })

  antStick.on('startup', () => {
    log.info('ANT+ stick found')
    heartRateSensor.attach(0, 0)
  })

  antStick.on('shutdown', () => {
    log.info('classic ANT+ stick lost')
  })

  if (!antManager.openAntStick()) {
    throw new Error('Error opening Ant Stick')
  }

  function destroy () {
    return new Promise((resolve) => {
      heartRateSensor.detach()
      heartRateSensor.on('detached', () => {
        antStick.removeAllListeners()
        heartRateSensor.removeAllListeners()
        resolve()
      })
    })
  }

  return Object.assign(emitter, {
    destroy
  })
}

export { createAntHrmPeripheral }
