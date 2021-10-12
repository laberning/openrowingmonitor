'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This implements the Rower Data Characteristic as defined by the Bluetooth SIG
  Currently not many applications exist that support thes FTMS Characteristic for Rowing so its hard
  to verify this. So far tested on:
    - Kinomap.com: uses Power, Split Time and Strokes per Minutes

  From the specs:
  The Server should notify this characteristic at a regular interval, typically once per second
  while in a connection and the interval is not configurable by the Client
*/
import bleno from '@abandonware/bleno'
import log from 'loglevel'
import BufferBuilder from '../BufferBuilder.js'

export default class RowerDataCharacteristic extends bleno.Characteristic {
  constructor () {
    super({
      // Rower Data
      uuid: '2AD1',
      value: null,
      properties: ['notify']
    })
    this._updateValueCallback = null
    this._subscriberMaxValueSize = null
  }

  onSubscribe (maxValueSize, updateValueCallback) {
    log.debug(`RowerDataCharacteristic - central subscribed with maxSize: ${maxValueSize}`)
    this._updateValueCallback = updateValueCallback
    this._subscriberMaxValueSize = maxValueSize
    return this.RESULT_SUCCESS
  }

  onUnsubscribe () {
    log.debug('RowerDataCharacteristic - central unsubscribed')
    this._updateValueCallback = null
    this._subscriberMaxValueSize = null
    return this.RESULT_UNLIKELY_ERROR
  }

  notify (data) {
    // ignore events without the mandatory fields
    if (!('strokesPerMinute' in data && 'strokesTotal' in data)) {
      return this.RESULT_SUCCESS
    }

    if (this._updateValueCallback) {
      const bufferBuilder = new BufferBuilder()
      // Field flags as defined in the Bluetooth Documentation
      // Stroke Rate (default), Stroke Count (default), Total Distance (2), Instantaneous Pace (3),
      // Instantaneous Power (5), Total / Expended Energy (8), Heart Rate (9), Elapsed Time (11)
      // todo: might add: Average Stroke Rate (1), Average Pace (4), Average Power (6)
      // Remaining Time (12)
      // 00101100
      bufferBuilder.writeUInt8(0x2c)
      // 00001011
      bufferBuilder.writeUInt8(0x0B)

      // see https://www.bluetooth.com/specifications/specs/gatt-specification-supplement-3/
      // for some of the data types
      // Stroke Rate in stroke/minute, value is multiplied by 2 to have a .5 precision
      bufferBuilder.writeUInt8(Math.round(data.strokesPerMinute * 2))
      // Stroke Count
      bufferBuilder.writeUInt16LE(data.strokesTotal)
      // Total Distance in meters
      bufferBuilder.writeUInt24LE(Math.round(data.distanceTotal))
      // Instantaneous Pace in seconds/500m
      // if split is infinite (i.e. while pausing), use the highest possible number
      bufferBuilder.writeUInt16LE(data.split !== Infinity ? Math.round(data.split) : 0xFFFF)
      // Instantaneous Power in watts
      bufferBuilder.writeUInt16LE(Math.round(data.power))
      // Energy in kcal
      // Total energy in kcal
      bufferBuilder.writeUInt16LE(data.caloriesTotal)
      // Energy per hour
      // The Energy per Hour field represents the average expended energy of a user during a
      // period of one hour.
      bufferBuilder.writeUInt16LE(data.caloriesPerHour)
      // Energy per minute
      bufferBuilder.writeUInt8(data.caloriesPerMinute)
      // Heart Rate: Beats per minute with a resolution of 1
      bufferBuilder.writeUInt8(Math.round(data.heartrate))
      // Elapsed Time: Seconds with a resolution of 1
      bufferBuilder.writeUInt16LE(Math.round(data.durationTotal))

      const buffer = bufferBuilder.getBuffer()
      if (buffer.length > this._subscriberMaxValueSize) {
        log.warn(`RowerDataCharacteristic - notification of ${buffer.length} bytes is too large for the subscriber`)
      }
      this._updateValueCallback(bufferBuilder.getBuffer())
    }
    return this.RESULT_SUCCESS
  }
}
