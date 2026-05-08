'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Creates a ANT+ peripheral to recieve heartrate data from a HRM belt
*/
import EventEmitter from 'node:events'
import log from 'loglevel'

import { HeartRateSensor } from 'incyclist-ant-plus'

/**
 * @event createAntHrmPeripheral#heartRateMeasurement
 * @type {HeartRateMeasurementEvent}
 */
/**
 * @typedef {import('incyclist-ant-plus').IChannel} IChannel
 */

/**
 * @param {import('./AntManager.js').default} antManager
 * @fires createAntHrmPeripheral#heartRateMeasurement
 */
function createAntHrmPeripheral (antManager) {
  /**
   * @type {EventEmitter<{heartRateMeasurement: Array<HeartRateMeasurementEvent>}>}
   */
  const emitter = new EventEmitter()
  const antStick = antManager.getAntStick()
  const heartRateSensor = new HeartRateSensor(0)
  let lastBeatCount = 0
  let lastBeatTime = 0

  /**
   * The RR interval in seconds
   * @type {Array<number>}
   */
  let rrIntervals = []
  /**
   * @type {number | undefined}
   */
  let batteryLevel
  /** @type {IChannel & EventEmitter | undefined} */
  let channel

  async function attach () {
    if (!antManager.isStickOpen()) { await antManager.openAntStick() }
    channel = /** @type {IChannel & EventEmitter} */(antStick.getChannel())

    channel.on('data', (profile, deviceID, /** @type {import('incyclist-ant-plus').HeartRateSensorState} */data) => {
      switch (data.BatteryStatus) {
        case 'New':
          batteryLevel = 100
          break
        case 'Good':
          batteryLevel = 80
          break
        case 'Ok':
          batteryLevel = 60
          break
        case 'Low':
          batteryLevel = 40
          break
        case 'Critical':
          batteryLevel = 20
          break
        default:
          batteryLevel = undefined
      }

      if (data.BatteryLevel && data.BatteryLevel > 0) {
        batteryLevel = data.BatteryLevel
      }

      if (data.BeatCount !== lastBeatCount) {
        /**
         * @type {number | undefined}
         */
        let beatTimeDiff
        if (data.PreviousBeat !== undefined) {
          // Logic using previousBeatTime and also saving last beat time is seemingly redundant, but the specs prescribes that firstly the previousBeatTime should be used and only if that is not available should be the difference between two successive message be used when the beat count difference is one.
          beatTimeDiff = data.PreviousBeat > data.BeatTime ? 65535 - (data.PreviousBeat - data.BeatTime) : data.BeatTime - data.PreviousBeat
        } else if (data.BeatCount - lastBeatCount === 1) {
          beatTimeDiff = lastBeatTime > data.BeatTime ? 65535 - (lastBeatTime - data.BeatTime) : data.BeatTime - lastBeatTime
        }

        rrIntervals = beatTimeDiff !== undefined ? [Math.round(beatTimeDiff / 1024 * 1000) / 1000] : []

        lastBeatCount = data.BeatCount
        lastBeatTime = data.BeatTime
      }

      emitter.emit('heartRateMeasurement', {
        heartrate: data.ComputedHeartRate,
        rrIntervals,
        batteryLevel,
        manufacturerId: data.ManId,
        serialNumber: data.SerialNumber
      })
    })

    if (!(await channel.startSensor(heartRateSensor))) {
      log.error('Could not start ANT+ heart rate sensor')
    }
  }

  async function destroy () {
    if (!channel) {
      log.debug('Ant Sensor does not seem to be running')
      return
    }
    await channel.stopSensor(heartRateSensor)
  }

  return Object.assign(emitter, {
    destroy,
    attach
  })
}

export { createAntHrmPeripheral }
