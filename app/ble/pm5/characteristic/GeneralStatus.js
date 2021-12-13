'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Implementation of the GeneralStatus as defined in:
  https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
*/
import bleno from '@abandonware/bleno'
import { getFullUUID } from '../Pm5Constants.js'
import log from 'loglevel'
import BufferBuilder from '../../BufferBuilder.js'

export default class GeneralStatus extends bleno.Characteristic {
  constructor (multiplexedCharacteristic) {
    super({
      // id for GeneralStatus as defined in the spec
      uuid: getFullUUID('0031'),
      value: null,
      properties: ['notify']
    })
    this._updateValueCallback = null
    this._multiplexedCharacteristic = multiplexedCharacteristic
  }

  onSubscribe (maxValueSize, updateValueCallback) {
    log.debug(`GeneralStatus - central subscribed with maxSize: ${maxValueSize}`)
    this._updateValueCallback = updateValueCallback
    return this.RESULT_SUCCESS
  }

  onUnsubscribe () {
    log.debug('GeneralStatus - central unsubscribed')
    this._updateValueCallback = null
    return this.RESULT_UNLIKELY_ERROR
  }

  notify (data) {
    if (this._updateValueCallback || this._multiplexedCharacteristic.centralSubscribed()) {
      const bufferBuilder = new BufferBuilder()
      // elapsedTime: UInt24LE in 0.01 sec
      bufferBuilder.writeUInt24LE(Math.round(data.durationTotal * 100))
      // distance: UInt24LE in 0.1 m
      bufferBuilder.writeUInt24LE(Math.round(data.distanceTotal * 10))
      // workoutType: UInt8 will always use 0 (WORKOUTTYPE_JUSTROW_NOSPLITS)
      bufferBuilder.writeUInt8(0)
      // intervalType: UInt8 will always use 255 (NONE)
      bufferBuilder.writeUInt8(255)
      // workoutState: UInt8 0 WAITTOBEGIN, 1 WORKOUTROW, 10 WORKOUTEND
      bufferBuilder.writeUInt8(data.sessionStatus === 'rowing' ? 1 : (data.sessionStatus = 'waitingForStart' ? 0 : 10))
      // rowingState: UInt8 0 INACTIVE, 1 ACTIVE
      bufferBuilder.writeUInt8(data.sessionStatus === 'rowing' ? 1 : 0)
      // strokeState: UInt8 2 DRIVING, 4 RECOVERY
      bufferBuilder.writeUInt8(data.strokeState === 'DRIVING' ? 2 : 4)
      // totalWorkDistance: UInt24LE in 1 m
      bufferBuilder.writeUInt24LE(Math.round(data.distanceTotal))
      // workoutDuration: UInt24LE in 0.01 sec (if type TIME)
      bufferBuilder.writeUInt24LE(0 * 100)
      // workoutDurationType: UInt8 0 TIME, 1 CALORIES, 2 DISTANCE, 3 WATTS
      bufferBuilder.writeUInt8(0)
      // dragFactor: UInt8
      bufferBuilder.writeUInt8(0)

      if (this._updateValueCallback) {
        this._updateValueCallback(bufferBuilder.getBuffer())
      } else {
        this._multiplexedCharacteristic.notify(0x31, bufferBuilder.getBuffer())
      }
      return this.RESULT_SUCCESS
    }
  }
}
