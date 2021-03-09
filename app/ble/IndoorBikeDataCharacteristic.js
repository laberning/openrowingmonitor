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
  };

  onUnsubscribe () {
    log.debug('IndooBikeDataCharacteristic - central unsubscribed')
    this._updateValueCallback = null
    return this.RESULT_UNLIKELY_ERROR
  };

  notify (data) {
    // ignore events without the mandatory fields
    if (!data.speed) {
      log.error('can not deliver bike data without mandatory fields')
      return this.RESULT_SUCCESS
    }

    if (this._updateValueCallback) {
      const buffer = Buffer.alloc(15)
      // Field flags as defined in the Bluetooth Documentation
      // Instantaneous speed (default), Total Distance (4), Instantaneous Power (6)
      // Total / Expended Energy (8)
      // 01010000
      buffer.writeUInt8(0x50, 0)
      // 00000001
      buffer.writeUInt8(0x01, 1)

      // see https://www.bluetooth.com/specifications/specs/gatt-specification-supplement-3/
      // for some of the data types
      // Instantaneous Speed in km/h
      buffer.writeUInt16LE(data.speed * 100, 2)
      // Total Distance in meters
      if (data.distanceTotal) {
        writeUInt24LE(data.distanceTotal, buffer, 4)
      }
      // Instantaneous Power in watts
      if (data.power) {
        buffer.writeUInt16LE(data.power, 7)
      }
      // Energy
      if (data.caloriesTotal) {
        // Total energy in kcal
        buffer.writeUInt16LE(data.caloriesTotal, 9)
        // Energy per hour
        // from specs: if not available the Server shall use the special value 0xFFFF
        // which means 'Data Not Available''.
        buffer.writeUInt16LE(0xFFFF, 11)
        // Energy per minute
        // from specs: if not available the Server shall use the special value 0xFF
        // which means 'Data Not Available''.
        buffer.writeUInt16LE(0xFF, 13)
      }
      this._updateValueCallback(buffer)
    } else {
      log.debug('can not notify indoor bike data, no central subscribed')
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
