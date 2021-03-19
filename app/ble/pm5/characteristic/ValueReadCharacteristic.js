'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  A simple Characteristic that gives read and notify access to a static value
  Currently also used as placeholder on a lot of characteristics that are not yet implemented properly
*/
import bleno from '@abandonware/bleno'
import log from 'loglevel'

export default class ValueReadCharacteristic extends bleno.Characteristic {
  constructor (uuid, value, description) {
    super({
      uuid: uuid,
      properties: ['read', 'notify'],
      value: null
    })
    this.uuid = uuid
    this._value = Buffer.isBuffer(value) ? value : Buffer.from(value)
    this._description = description
    this._updateValueCallback = null
  }

  onReadRequest (offset, callback) {
    log.debug(`ValueReadRequest: ${this._description ? this._description : this.uuid}`)
    callback(this.RESULT_SUCCESS, this._value.slice(offset, this._value.length))
  }

  onSubscribe (maxValueSize, updateValueCallback) {
    log.debug(`characteristic ${this._description ? this._description : this.uuid} - central subscribed with maxSize: ${maxValueSize}`)
    this._updateValueCallback = updateValueCallback
    return this.RESULT_SUCCESS
  }

  onUnsubscribe () {
    log.debug(`characteristic ${this._description ? this._description : this.uuid} - central unsubscribed`)
    this._updateValueCallback = null
    return this.RESULT_UNLIKELY_ERROR
  }
}
