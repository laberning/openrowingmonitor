'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Implementation of the AdditionalStatus as defined in:
  https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
*/
import bleno from '@abandonware/bleno'
import { getFullUUID } from '../Pm5Constants.js'
import log from 'loglevel'
import BufferBuilder from '../../BufferBuilder.js'

export default class AdditionalStatus extends bleno.Characteristic {
  constructor (multiplexedCharacteristic) {
    super({
      // id for AdditionalStatus as defined in the spec
      uuid: getFullUUID('0032'),
      value: null,
      properties: ['notify']
    })
    this._updateValueCallback = null
    this._multiplexedCharacteristic = multiplexedCharacteristic
  }

  onSubscribe (maxValueSize, updateValueCallback) {
    log.debug(`AdditionalStatus - central subscribed with maxSize: ${maxValueSize}`)
    this._updateValueCallback = updateValueCallback
    return this.RESULT_SUCCESS
  }

  onUnsubscribe () {
    log.debug('AdditionalStatus - central unsubscribed')
    this._updateValueCallback = null
    return this.RESULT_UNLIKELY_ERROR
  }

  notify (data) {
    if (this._updateValueCallback || this._multiplexedCharacteristic.centralSubscribed()) {
      const bufferBuilder = new BufferBuilder()
      // elapsedTime: UInt24LE in 0.01 sec
      bufferBuilder.writeUInt24LE(Math.round(data.totalMovingTime * 100))
      // speed: UInt16LE in 0.001 m/sec
      bufferBuilder.writeUInt16LE(Math.round(data.cycleLinearVelocity * 1000))
      // strokeRate: UInt8 in strokes/min
      bufferBuilder.writeUInt8(Math.round(data.cycleStrokeRate))
      // heartrate: UInt8 in bpm, 255 if invalid
      bufferBuilder.writeUInt8(Math.round(data.heartrate))
      // currentPace: UInt16LE in 0.01 sec/500m
      // if split is infinite (i.e. while pausing), use the highest possible number
      bufferBuilder.writeUInt16LE(data.cyclePace !== Infinity && data.cyclePace > 0 && data.cyclePace < 655.34 ? data.cyclePace * 100 : 0xFFFF)
      // averagePace: UInt16LE in 0.01 sec/500m
      let averagePace = 0
      if (data.totalLinearDistance && data.totalLinearDistance !== 0) {
        averagePace = (data.totalMovingTime / data.totalLinearDistance) * 500
      }
      bufferBuilder.writeUInt16LE(Math.round(Math.min(averagePace * 100, 65535)))
      // restDistance: UInt16LE
      bufferBuilder.writeUInt16LE(0)
      // restTime: UInt24LE in 0.01 sec
      bufferBuilder.writeUInt24LE(0 * 100)
      if (!this._updateValueCallback) {
      // the multiplexer uses a slightly different format for the AdditionalStatus
      // it adds averagePower before the ergMachineType
      // averagePower: UInt16LE in watts
        bufferBuilder.writeUInt16LE(Math.round(data.cyclePower))
      }
      // ergMachineType: 0 TYPE_STATIC_D
      bufferBuilder.writeUInt8(0)

      if (this._updateValueCallback) {
        this._updateValueCallback(bufferBuilder.getBuffer())
      } else {
        this._multiplexedCharacteristic.notify(0x32, bufferBuilder.getBuffer())
      }
      return this.RESULT_SUCCESS
    }
  }
}
