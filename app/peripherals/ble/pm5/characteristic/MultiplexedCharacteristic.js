'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Implements the Multiplexed Characteristic as defined by the spec:

  "On some Android platforms, there is a limitation to the number of notification messages allowed.
  To circumvent this issue, a single characteristic (C2 multiplexed data
  info) exists to allow multiple characteristics to be multiplexed onto a single characteristic. The last byte in the
  characteristic will indicate which data characteristic is multiplexed."
*/
import bleno from '@abandonware/bleno'
import { getFullUUID } from '../Pm5Constants.js'
import log from 'loglevel'

export default class MultiplexedCharacteristic extends bleno.Characteristic {
  constructor () {
    super({
      // id for MultiplexedInformation as defined in the spec
      uuid: getFullUUID('0080'),
      value: null,
      properties: ['notify']
    })
    this._updateValueCallback = null
  }

  onSubscribe (maxValueSize, updateValueCallback) {
    log.debug(`MultiplexedCharacteristic - central subscribed with maxSize: ${maxValueSize}`)
    this._updateValueCallback = updateValueCallback
    return this.RESULT_SUCCESS
  }

  onUnsubscribe () {
    log.debug('MultiplexedCharacteristic - central unsubscribed')
    this._updateValueCallback = null
    return this.RESULT_UNLIKELY_ERROR
  }

  centralSubscribed () {
    return this._updateValueCallback !== null
  }

  notify (id, characteristicBuffer) {
    const characteristicId = Buffer.alloc(1)
    characteristicId.writeUInt8(id, 0)
    const buffer = Buffer.concat(
      [
        characteristicId,
        characteristicBuffer
      ],
      characteristicId.length + characteristicBuffer.length
    )

    if (this._updateValueCallback) {
      this._updateValueCallback(buffer)
    }
    return this.RESULT_SUCCESS
  }
}
