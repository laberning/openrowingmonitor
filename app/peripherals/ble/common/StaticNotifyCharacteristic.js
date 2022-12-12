'use strict'

import bleno from '@abandonware/bleno'
import log from 'loglevel'

export default class StaticNotifyCharacteristic extends bleno.Characteristic {
  constructor (uuid, description, value, addRead = false) {
    super({
      uuid,
      properties: addRead ? ['read', 'notify'] : ['notify'],
      value: null,
      descriptors: [
        new bleno.Descriptor({
          uuid: '2901',
          value: description
        })
      ]
    })
    this._uuid = uuid
    this._description = description
    this._value = Buffer.isBuffer(value) ? value : Buffer.from(value)
    this._updateValueCallback = null
  }

  onReadRequest (offset, callback) {
    log.debug(`ValueReadRequest: ${this._description ? this._description : this._uuid}`)
    callback(this.RESULT_SUCCESS, this._value.slice(offset, this._value.length))
  }

  onSubscribe (maxValueSize, updateValueCallback) {
    log.debug(`characteristic ${this._description ? this._description : this._uuid} - central subscribed with maxSize: ${maxValueSize}`)
    this._updateValueCallback = updateValueCallback
    return this.RESULT_SUCCESS
  }

  onUnsubscribe () {
    log.debug(`characteristic ${this._description ? this._description : this._uuid} - central unsubscribed`)
    this._updateValueCallback = null
    return this.RESULT_UNLIKELY_ERROR
  }
}
