'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor
*/
import bleno from '@abandonware/bleno'
import log from 'loglevel'
import BufferBuilder from '../BufferBuilder.js'

export default class CyclingSpeedCadenceMeasurementCharacteristic extends bleno.Characteristic {
  constructor () {
    super({
      // Cycling Speed and Cadence Measurement
      uuid: '2A5B',
      value: null,
      properties: ['notify'],
      descriptors: [
        new bleno.Descriptor({
          uuid: '2901',
          value: 'Cycling Speed and Cadence Measurement'
        })
      ]
    })
    this._updateValueCallback = null
    this._subscriberMaxValueSize = null
  }

  onSubscribe (maxValueSize, updateValueCallback) {
    log.debug(`CyclingSpeedCadenceMeasurementCharacteristic - central subscribed with maxSize: ${maxValueSize}`)
    this._updateValueCallback = updateValueCallback
    this._subscriberMaxValueSize = maxValueSize
    return this.RESULT_SUCCESS
  }

  onUnsubscribe () {
    log.debug('CyclingSpeedCadenceMeasurementCharacteristic - central unsubscribed')
    this._updateValueCallback = null
    this._subscriberMaxValueSize = null
    return this.RESULT_UNLIKELY_ERROR
  }

  notify (data) {
    // ignore events without the mandatory fields
    if (!('cyclePower' in data)) {
      log.error('can not deliver bike data without mandatory fields')
      return this.RESULT_SUCCESS
    }

    if (this._updateValueCallback) {
      const bufferBuilder = new BufferBuilder()

      // Features flag
      bufferBuilder.writeUInt8(cscFeaturesFlags.crankRevolutionDataSupported | cscFeaturesFlags.wheelRevolutionDataSupported)

      // Wheel revolution count (basically the distance in cm)
      bufferBuilder.writeUInt32LE(Math.round(Math.round(data.totalLinearDistance * 100)))

      // Wheel revolution time (ushort with 1024 resolution, resetting in every 64sec)
      bufferBuilder.writeUInt16LE(Math.round(data.totalMovingTime * 1024) % Math.pow(2, 16))

      // Total stroke count
      bufferBuilder.writeUInt16LE(Math.round(data.totalNumberOfStrokes))

      // last stroke time time (ushort with 1024 resolution, resetting in every 64sec)
      bufferBuilder.writeUInt16LE(Math.round(data.driveLastStartTime * 1024) % Math.pow(2, 16))

      const buffer = bufferBuilder.getBuffer()
      if (buffer.length > this._subscriberMaxValueSize) {
        log.warn(`CyclingSpeedCadenceMeasurementCharacteristic - notification of ${buffer.length} bytes is too large for the subscriber`)
      }
      this._updateValueCallback(bufferBuilder.getBuffer())
    }
    return this.RESULT_SUCCESS
  }
}

export const cscFeaturesFlags =
{
  wheelRevolutionDataSupported: (0x01 << 0),
  crankRevolutionDataSupported: (0x01 << 1),
  multipleSensorLocationSupported: (0x01 << 2)
}
