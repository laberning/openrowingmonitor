'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This implements the Indoor Bike Data Characteristic as defined by the Bluetooth SIG
  Currently hardly any applications exist that support these FTMS Characteristic for Rowing.
  So we use this to simulate an FTMS Indoor Bike characteristic.
  Of course we can not deliver rowing specific parameters like this (such as stroke rate), but
  this allows us to use the open rowing monitor with bike training platforms such as
  Zwift, Sufferfest, RGT Cycling, Kinomap, Bkool, Rouvy and more...
  So far tested on:
    - Kinomap.com: uses Power and Speed
    - Fulgaz: uses Power and Speed
    - Zwift: uses Power
    - RGT Cycling: connects Power but then disconnects again (seems something is missing here)

  From specs:
  The Server should notify this characteristic at a regular interval, typically once per second
  while in a connection and the interval is not configurable by the Client
*/
import bleno from '@abandonware/bleno'
import log from 'loglevel'
import BufferBuilder from '../BufferBuilder.js'

export default class IndoorBikeDataCharacteristic extends bleno.Characteristic {
  constructor () {
    super({
      // Indoor Bike Data
      uuid: '2AD2',
      value: null,
      properties: ['notify']
    })
    this._updateValueCallback = null
    this._subscriberMaxValueSize = null
  }

  onSubscribe (maxValueSize, updateValueCallback) {
    log.debug(`IndoorBikeDataCharacteristic - central subscribed with maxSize: ${maxValueSize}`)
    this._updateValueCallback = updateValueCallback
    this._subscriberMaxValueSize = maxValueSize
    return this.RESULT_SUCCESS
  }

  onUnsubscribe () {
    log.debug('IndoorBikeDataCharacteristic - central unsubscribed')
    this._updateValueCallback = null
    this._subscriberMaxValueSize = null
    return this.RESULT_UNLIKELY_ERROR
  }

  notify (data) {
    // ignore events without the mandatory fields
    if (!('speed' in data)) {
      log.error('can not deliver bike data without mandatory fields')
      return this.RESULT_SUCCESS
    }

    if (this._updateValueCallback) {
      const bufferBuilder = new BufferBuilder()
      // Field flags as defined in the Bluetooth Documentation
      // Instantaneous speed (default), Total Distance (4), Instantaneous Power (6)
      // Total / Expended Energy (8), Heart Rate (9), Elapsed Time (11)
      // 01010000
      bufferBuilder.writeUInt8(0x50)
      // 00001011
      bufferBuilder.writeUInt8(0x0B)

      // see https://www.bluetooth.com/specifications/specs/gatt-specification-supplement-3/
      // for some of the data types
      // Instantaneous Speed in km/h
      bufferBuilder.writeUInt16LE(data.speed * 100)
      // Total Distance in meters
      bufferBuilder.writeUInt24LE(data.distanceTotal)
      // Instantaneous Power in watts
      bufferBuilder.writeUInt16LE(data.power)
      // Energy
      // Total energy in kcal
      bufferBuilder.writeUInt16LE(data.caloriesTotal)
      // Energy per hour
      // The Energy per Hour field represents the average expended energy of a user during a
      // period of one hour.
      bufferBuilder.writeUInt16LE(data.caloriesPerHour)
      // Energy per minute
      bufferBuilder.writeUInt8(data.caloriesPerMinute)
      // Heart Rate: Beats per minute with a resolution of 1
      bufferBuilder.writeUInt8(data.heartRate)
      // Elapsed Time: Seconds with a resolution of 1
      bufferBuilder.writeUInt16LE(data.durationTotal)

      const buffer = bufferBuilder.getBuffer()
      if (buffer.length > this._subscriberMaxValueSize) {
        log.warn(`IndoorBikeDataCharacteristic - notification of ${buffer.length} bytes is too large for the subscriber`)
      }
      this._updateValueCallback(bufferBuilder.getBuffer())
    }
    return this.RESULT_SUCCESS
  }
}
