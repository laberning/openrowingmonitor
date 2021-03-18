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
  }

  onSubscribe (maxValueSize, updateValueCallback) {
    log.debug('IndooBikeDataCharacteristic - central subscribed')
    this._updateValueCallback = updateValueCallback
    return this.RESULT_SUCCESS
  }

  onUnsubscribe () {
    log.debug('IndooBikeDataCharacteristic - central unsubscribed')
    this._updateValueCallback = null
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
      // Total / Expended Energy (8)
      // 01010000
      bufferBuilder.writeUInt8(0x50)
      // 00000001
      bufferBuilder.writeUInt8(0x01)

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
      // from specs: if not available the Server shall use the special value 0xFFFF
      // which means 'Data Not Available''.
      bufferBuilder.writeUInt16LE(0xFFFF)
      // Energy per minute
      // from specs: if not available the Server shall use the special value 0xFF
      // which means 'Data Not Available''.
      bufferBuilder.writeUInt16LE(0xFF)

      this._updateValueCallback(bufferBuilder.getBuffer())
    }
    return this.RESULT_SUCCESS
  }
}
