'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  A buffer builder that simplifies the creation of payloads for BLE messages
*/
import log from 'loglevel'

export default class BufferBuilder {
  constructor () {
    this._dataArray = []
  }

  writeUInt8 (value) {
    const buffer = Buffer.alloc(1)
    try {
      buffer.writeUInt8(value || 0)
    } catch (error) {
      log.warn(error)
    }
    this._dataArray.push(buffer)
  }

  writeUInt16LE (value) {
    const buffer = Buffer.alloc(2)
    try {
      buffer.writeUInt16LE(value || 0)
    } catch (error) {
      log.warn(error)
    }
    this._dataArray.push(buffer)
  }

  writeUInt24LE (value) {
    const _value = value || 0
    const buffer = Buffer.alloc(3)
    if (value > 0xffffff || value < 0) {
      log.warn(new RangeError(`The value of "value" is out of range. It must be >= 0 and <= ${0xffffff}. Received ${value}`))
    } else {
      try {
        buffer.writeUInt8(_value & 255)
        buffer.writeUInt16LE(_value >> 8, 1)
      } catch (error) {
        log.warn(error)
      }
    }
    this._dataArray.push(buffer)
  }

  writeUInt32LE (value) {
    const _value = value || 0
    const buffer = Buffer.alloc(4)
    if (value > 0xffffffff || value < 0) {
      log.warn(new RangeError(`The value of "value" is out of range. It must be >= 0 and <= ${0xffffffff}. Received ${value}`))
    } else {
      try {
        buffer.writeUint32LE(_value)
      } catch (error) {
        log.warn(error)
      }
    }
    this._dataArray.push(buffer)
  }

  getBuffer () {
    return Buffer.concat(this._dataArray)
  }
}
