'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor
*/
import bleno from '@abandonware/bleno'
import log from 'loglevel'
import BufferBuilder from '../BufferBuilder.js'

export const cpsMeasurementFeaturesFlags = {
  pedalPowerBalancePresent: (0x01 << 0),
  pedalPowerBalanceReference: (0x01 << 1),
  accumulatedTorquePresent: (0x01 << 2),
  accumulatedTorqueSource: (0x01 << 3),
  accumulatedTorqueSourceWheel: (0x00 << 3),
  accumulatedTorqueSourceCrank: (0x01 << 3),
  wheelRevolutionDataPresent: (0x01 << 4),
  crankRevolutionDataPresent: (0x01 << 5),
  extremeForceMagnitudesPresent: (0x01 << 6),
  extremeTorqueMagnitudesPresent: (0x01 << 7),
  extremeAnglesPresent: (0x01 << 8),
  topDeadSpotAnglePresent: (0x01 << 9),
  bottomDeadSpotAnglePresent: (0x01 << 10),
  accumulatedEnergyPresent: (0x01 << 11),
  offsetCompensationIndicator: (0x01 << 12)
}

export default class CyclingPowerMeasurementCharacteristic extends bleno.Characteristic {
  constructor () {
    super({
      // Cycling Power Meter Measurement
      uuid: '2A63',
      value: null,
      properties: ['notify'],
      descriptors: [
        new bleno.Descriptor({
          uuid: '2901',
          value: 'Cycling Power Measurement'
        })
      ]
    })
    this._updateValueCallback = null
    this._subscriberMaxValueSize = null
  }

  onSubscribe (maxValueSize, updateValueCallback) {
    log.debug(`CyclingPowerMeasurementCharacteristic - central subscribed with maxSize: ${maxValueSize}`)
    this._updateValueCallback = updateValueCallback
    this._subscriberMaxValueSize = maxValueSize
    return this.RESULT_SUCCESS
  }

  onUnsubscribe () {
    log.debug('CyclingPowerMeasurementCharacteristic - central unsubscribed')
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
      bufferBuilder.writeUInt16LE(cpsMeasurementFeaturesFlags.wheelRevolutionDataPresent | cpsMeasurementFeaturesFlags.crankRevolutionDataPresent)

      // Instantaneous Power
      bufferBuilder.writeUInt16LE(Math.round(data.cyclePower))

      // Wheel revolution count (basically the distance in cm)
      bufferBuilder.writeUInt32LE(Math.round(Math.round(data.totalLinearDistance * 100)))

      // Wheel revolution time (ushort with 2048 resolution, resetting in every 32sec)
      bufferBuilder.writeUInt16LE(Math.round(data.totalMovingTime * 2048) % Math.pow(2, 16))

      // Total stroke count
      bufferBuilder.writeUInt16LE(Math.round(data.totalNumberOfStrokes))

      // last stroke time time (ushort with 1024 resolution, resetting in every 64sec)
      bufferBuilder.writeUInt16LE(Math.round(data.driveLastStartTime * 1024) % Math.pow(2, 16))

      const buffer = bufferBuilder.getBuffer()
      if (buffer.length > this._subscriberMaxValueSize) {
        log.warn(`CyclingPowerMeasurementCharacteristic - notification of ${buffer.length} bytes is too large for the subscriber`)
      }
      this._updateValueCallback(bufferBuilder.getBuffer())
    }
    return this.RESULT_SUCCESS
  }
}
