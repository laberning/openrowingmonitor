'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Implementation of the ControlTransmit Characteristic as defined in:
  https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
  Used to transmit controls to the central
*/
import bleno from '@abandonware/bleno'
import { getFullUUID } from '../Pm5Constants.js'
import log from 'loglevel'
import BufferBuilder from '../../BufferBuilder.js'

export default class ControlTransmit extends bleno.Characteristic {
  constructor () {
    super({
      // id for ControlTransmit as defined in the spec
      uuid: getFullUUID('0022'),
      value: null,
      properties: ['notify']
    })
    this._updateValueCallback = null
  }

  onSubscribe (maxValueSize, updateValueCallback) {
    log.debug(`ControlTransmit - central subscribed with maxSize: ${maxValueSize}`)
    this._updateValueCallback = updateValueCallback
    return this.RESULT_SUCCESS
  }

  onUnsubscribe () {
    log.debug('ControlTransmit - central unsubscribed')
    this._updateValueCallback = null
    return this.RESULT_UNLIKELY_ERROR
  }

  notify (data) {
    if (this._updateValueCallback) {
      const bufferBuilder = new BufferBuilder()
      this._updateValueCallback(bufferBuilder.getBuffer())
      return this.RESULT_SUCCESS
    }
  }
}
