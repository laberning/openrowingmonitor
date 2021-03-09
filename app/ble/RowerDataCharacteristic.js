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

export default class RowerDataCharacteristic extends bleno.Characteristic {
  constructor () {
    super({
      // Rower Data
      uuid: '2AD1',
      value: null,
      properties: ['notify']
    })
    this._updateValueCallback = null
  }

  onSubscribe (maxValueSize, updateValueCallback) {
    log.debug('RowerDataCharacteristic - central subscribed')
    this._updateValueCallback = updateValueCallback
    return this.RESULT_SUCCESS
  };

  onUnsubscribe () {
    log.debug('RowerDataCharacteristic - central unsubscribed')
    this._updateValueCallback = null
    return this.RESULT_UNLIKELY_ERROR
  };

  notify (data) {
    // ignore events without the mandatory fields
    if (!(data.strokesPerMinute && data.strokesTotal)) {
      return this.RESULT_SUCCESS
    }

    if (this._updateValueCallback) {
      const buffer = Buffer.alloc(18)
      // Field flags as defined in the Bluetooth Documentation
      // Stroke Rate (default), Stroke Count (default), Total Distance (2), Instantaneous Pace (3),
      // Instantaneous Power (5), Total / Expended Energy (8)
      // 00101100
      buffer.writeUInt8(0x2c, 0)
      // 00000001
      buffer.writeUInt8(0x01, 1)

      // see https://www.bluetooth.com/specifications/specs/gatt-specification-supplement-3/
      // for some of the data types
      // Stroke Rate in stroke/minute, value is multiplied by 2 to have a .5 precision
      buffer.writeUInt8(data.strokesPerMinute * 2, 2)
      // Stroke Count
      buffer.writeUInt16LE(data.strokesTotal, 3)
      // Total Distance in meters
      if (data.distanceTotal) {
        writeUInt24LE(data.distanceTotal, buffer, 5)
      }
      // Instantaneous Pace in seconds/500m
      if (data.split) {
        buffer.writeUInt16LE(data.split, 8)
      }
      // Instantaneous Power in watts
      if (data.power) {
        buffer.writeUInt16LE(data.power, 10)
      }
      // Energy
      if (data.caloriesTotal) {
        // Total energy in kcal
        buffer.writeUInt16LE(data.caloriesTotal, 12)
        // Energy per hour
        // from specs: if not available the Server shall use the special value 0xFFFF
        // which means 'Data Not Available''.
        buffer.writeUInt16LE(0xFFFF, 14)
        // Energy per minute
        // from specs: if not available the Server shall use the special value 0xFF
        // which means 'Data Not Available''.
        buffer.writeUInt16LE(0xFF, 16)
      }
      this._updateValueCallback(buffer)
    }
    return this.RESULT_SUCCESS
  }
}

// the specification uses unsigned integers of length 24 in LE
// this is a helper to write those into the buffer
function writeUInt24LE (value, buffer, position) {
  buffer.writeUInt8(value & 255, position)
  buffer.writeUInt16LE(value >> 8, position + 1)
}
