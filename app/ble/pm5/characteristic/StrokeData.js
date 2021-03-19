'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Implementation of the StrokeData as defined in:
  https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
  todo: we could calculate all the missing stroke metrics in the RowerEngine
*/
import bleno from '@abandonware/bleno'
import { getFullUUID } from '../Pm5Constants.js'
import log from 'loglevel'
import BufferBuilder from '../../BufferBuilder.js'

export default class StrokeData extends bleno.Characteristic {
  constructor (multiplexedCharacteristic) {
    super({
      // id for StrokeData as defined in the spec
      uuid: getFullUUID('0035'),
      value: null,
      properties: ['notify']
    })
    this._updateValueCallback = null
    this._multiplexedCharacteristic = multiplexedCharacteristic
  }

  onSubscribe (maxValueSize, updateValueCallback) {
    log.debug(`StrokeData - central subscribed with maxSize: ${maxValueSize}`)
    this._updateValueCallback = updateValueCallback
    return this.RESULT_SUCCESS
  }

  onUnsubscribe () {
    log.debug('StrokeData - central unsubscribed')
    this._updateValueCallback = null
    return this.RESULT_UNLIKELY_ERROR
  }

  notify (data) {
    if (this._updateValueCallback || this._multiplexedCharacteristic.centralSubscribed()) {
      const bufferBuilder = new BufferBuilder()
      // elapsedTime: UInt24LE in 0.01 sec
      bufferBuilder.writeUInt24LE(data.durationTotal * 100)
      // distance: UInt24LE in 0.1 m
      bufferBuilder.writeUInt24LE(data.distanceTotal * 10)
      // driveLength: UInt8 in 0.01 m
      bufferBuilder.writeUInt8(0 * 100)
      // driveTime: UInt8 in 0.01 s
      bufferBuilder.writeUInt8(0 * 100)
      // strokeRecoveryTime: UInt16LE in 0.01 s
      bufferBuilder.writeUInt16LE(0 * 100)
      // strokeDistance: UInt16LE in 0.01 s
      bufferBuilder.writeUInt16LE(0 * 100)
      // peakDriveForce: UInt16LE in 0.1 watts
      bufferBuilder.writeUInt16LE(0 * 10)
      // averageDriveForce: UInt16LE in 0.1 watts
      bufferBuilder.writeUInt16LE(0 * 10)
      if (this._updateValueCallback) {
        // workPerStroke is only added if data is not send via multiplexer
        // workPerStroke: UInt16LE
        bufferBuilder.writeUInt16LE(0)
      }
      // strokeCount: UInt16LE
      bufferBuilder.writeUInt16LE(data.strokesTotal)
      if (this._updateValueCallback) {
        this._updateValueCallback(bufferBuilder.getBuffer())
      } else {
        this._multiplexedCharacteristic.notify(0x35, bufferBuilder.getBuffer())
      }
      return this.RESULT_SUCCESS
    }
  }
}
