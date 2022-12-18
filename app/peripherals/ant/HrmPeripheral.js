'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Creates a Bluetooth Low Energy (BLE) Peripheral with all the Services that are required for
  a Cycling Speed and Cadence Profile
*/
import EventEmitter from 'node:events'
import log from 'loglevel'
import { HeartRateSensor } from 'incyclist-ant-plus'

function createAntHrmPeripheral (antManager) {
  const emitter = new EventEmitter()
  const antStick = antManager.getAntStick()
  const heartRateSensor = new HeartRateSensor(0)

  async function attach () {
    if (!antManager.isStickOpen()) { await antManager.openAntStick() }
    this.channel = await antStick.getChannel()

    this.channel.on('data', (profile, deviceID, data) => {
      emitter.emit('heartRateMeasurement', { heartrate: data.ComputedHeartRate, batteryLevel: data.BatteryLevel })
    })

    if (!(await this.channel.startSensor(heartRateSensor))) {
      log.error('Could not start ANT+ heart rate sensor')
    }
  }

  async function destroy () {
    if (!this.channel) {
      log.debug('Ant Sensor does not seem to be running')
      return
    }
    await this.channel.stopSensor(heartRateSensor)
  }

  return Object.assign(emitter, {
    destroy,
    attach
  })
}

export { createAntHrmPeripheral }
