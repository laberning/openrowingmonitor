'use strict'

import bleno from '@abandonware/bleno'
import log from 'loglevel'

export default class StaticReadCharacteristic extends bleno.Characteristic {
  constructor (uuid, description, value, addNotify = false) {
    super({
      uuid,
      properties: addNotify ? ['read', 'notify'] : ['read'],
      value: Buffer.isBuffer(value) ? value : Buffer.from(value),
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
