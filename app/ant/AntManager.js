'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This manager creates a module to listen to ANT+ devices.
  This currently can be used to get the heart rate from ANT+ heart rate sensors.

  Requires an ANT+ USB stick, the following models might work:
  - Garmin USB or USB2 ANT+ or an off-brand clone of it (ID 0x1008)
  - Garmin mini ANT+ (ID 0x1009)
*/
import log from 'loglevel'
import Ant from 'ant-plus'
import EventEmitter from 'node:events'

function createAntManager () {
  const emitter = new EventEmitter()
  const antStick = new Ant.GarminStick2()
  const antStick3 = new Ant.GarminStick3()
  // it seems that we have to use two separate heart rate sensors to support both old and new
  // ant sticks, since the library requires them to be bound before open is called
  const heartrateSensor = new Ant.HeartRateSensor(antStick)
  const heartrateSensor3 = new Ant.HeartRateSensor(antStick3)

  heartrateSensor.on('hbData', (data) => {
    emitter.emit('heartrateMeasurement', { heartrate: data.ComputedHeartRate, batteryLevel: data.BatteryLevel })
  })

  heartrateSensor3.on('hbData', (data) => {
    emitter.emit('heartrateMeasurement', { heartrate: data.ComputedHeartRate, batteryLevel: data.BatteryLevel })
  })

  antStick.on('startup', () => {
    log.info('classic ANT+ stick found')
    heartrateSensor.attach(0, 0)
  })

  antStick3.on('startup', () => {
    log.info('mini ANT+ stick found')
    heartrateSensor3.attach(0, 0)
  })

  antStick.on('shutdown', () => {
    log.info('classic ANT+ stick lost')
  })

  antStick3.on('shutdown', () => {
    log.info('mini ANT+ stick lost')
  })

  if (!antStick.open()) {
    log.debug('classic ANT+ stick NOT found')
  }

  if (!antStick3.open()) {
    log.debug('mini ANT+ stick NOT found')
  }

  return Object.assign(emitter, {
  })
}

export { createAntManager }
