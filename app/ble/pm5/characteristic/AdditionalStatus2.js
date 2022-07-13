'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Implementation of the AdditionalStatus2 as defined in:
  https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
*/
import bleno from '@abandonware/bleno'
import { getFullUUID } from '../Pm5Constants.js'
import log from 'loglevel'
import BufferBuilder from '../../BufferBuilder.js'

export default class AdditionalStatus2 extends bleno.Characteristic {
  constructor (multiplexedCharacteristic) {
    super({
      // id for AdditionalStatus2 as defined in the spec
      uuid: getFullUUID('0033'),
      value: null,
      properties: ['notify']
    })
    this._updateValueCallback = null
    this._multiplexedCharacteristic = multiplexedCharacteristic
  }

  onSubscribe (maxValueSize, updateValueCallback) {
    log.debug(`AdditionalStatus2 - central subscribed with maxSize: ${maxValueSize}`)
    this._updateValueCallback = updateValueCallback
    return this.RESULT_SUCCESS
  }

  onUnsubscribe () {
    log.debug('AdditionalStatus2 - central unsubscribed')
    this._updateValueCallback = null
    return this.RESULT_UNLIKELY_ERROR
  }

  notify (data) {
    if (this._updateValueCallback || this._multiplexedCharacteristic.centralSubscribed()) {
      const bufferBuilder = new BufferBuilder()
      // elapsedTime: UInt24LE in 0.01 sec
      bufferBuilder.writeUInt24LE(Math.round(data.totalMovingTime * 100))
      // intervalCount: UInt8
      bufferBuilder.writeUInt8(0)
      if (this._updateValueCallback) {
        // the multiplexer uses a slightly different format for the AdditionalStatus2
        // it skips averagePower before totalCalories
        // averagePower: UInt16LE in watts
        bufferBuilder.writeUInt16LE(Math.round(data.cyclePower))
      }
      // totalCalories: UInt16LE in kCal
      bufferBuilder.writeUInt16LE(Math.round(data.totalCalories))
      // splitAveragePace: UInt16LE in 0.01 sec/500m
      bufferBuilder.writeUInt16LE(0 * 100)
      // splitAveragePower UInt16LE in watts
      bufferBuilder.writeUInt16LE(0)
      // splitAverageCalories
      bufferBuilder.writeUInt16LE(0)
      // lastSplitTime
      bufferBuilder.writeUInt24LE(0 * 100)
      // lastSplitDistance in 1 m
      bufferBuilder.writeUInt24LE(0)

      if (this._updateValueCallback) {
        this._updateValueCallback(bufferBuilder.getBuffer())
      } else {
        this._multiplexedCharacteristic.notify(0x33, bufferBuilder.getBuffer())
      }
      return this.RESULT_SUCCESS
    }
  }
}
