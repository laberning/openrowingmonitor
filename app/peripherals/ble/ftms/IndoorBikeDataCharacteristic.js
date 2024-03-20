'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This implements the Indoor Bike Data Characteristic as defined by the Bluetooth SIG
  Currently hardly any applications exist that support these FTMS Characteristic for Rowing.
  So we use this to simulate an FTMS Indoor Bike characteristic.
  Of course we can not deliver rowing specific parameters like this (such as stroke rate), but
  this allows us to use the open rowing monitor with bike training platforms such as
  Zwift, Sufferfest, RGT Cycling, Kinomap, Bkool, Rouvy and more...
  So far tested on:
    - Kinomap.com: uses Power and Speed
    - Fulgaz: uses Power and Speed
    - Zwift: uses Power
    - RGT Cycling: connects Power but then disconnects again (seems something is missing here)

  From specs:
  The Server should notify this characteristic at a regular interval, typically once per second
  while in a connection and the interval is not configurable by the Client
*/
import bleno from '@abandonware/bleno'
import log from 'loglevel'
import BufferBuilder from '../BufferBuilder.js'

export default class IndoorBikeDataCharacteristic extends bleno.Characteristic {
  constructor () {
    super({
      // Indoor Bike Data
      uuid: '2AD2',
      value: null,
      properties: ['notify']
    })
    this._updateValueCallback = null
    this._subscriberMaxValueSize = null
  }

  onSubscribe (maxValueSize, updateValueCallback) {
    log.debug(`IndoorBikeDataCharacteristic - central subscribed with maxSize: ${maxValueSize}`)
    this._updateValueCallback = updateValueCallback
    this._subscriberMaxValueSize = maxValueSize
    return this.RESULT_SUCCESS
  }

  onUnsubscribe () {
    log.debug('IndoorBikeDataCharacteristic - central unsubscribed')
    this._updateValueCallback = null
    this._subscriberMaxValueSize = null
    return this.RESULT_UNLIKELY_ERROR
  }

  notify (data) {
    // ignore events without the mandatory fields
    if (!('cycleLinearVelocity' in data)) {
      log.error('can not deliver bike data without mandatory fields')
      return this.RESULT_SUCCESS
    }

    if (this._updateValueCallback) {
      const bufferBuilder = new BufferBuilder()
      // Field flags as defined in the Bluetooth Documentation
      // Instantaneous speed (default), Instantaneous Cadence (2), Total Distance (4),
      // Instantaneous Power (6), Total / Expended Energy (8), Heart Rate (9), Elapsed Time (11)
      // 00001011
      // 01010100
      bufferBuilder.writeUInt16LE(measurementFlag)

      // see https://www.bluetooth.com/specifications/specs/gatt-specification-supplement-3/
      // for some of the data types
      // Instantaneous Speed in km/h
      bufferBuilder.writeUInt16LE(data.cycleLinearVelocity * 3.6 * 100)
      // Instantaneous Cadence in rotations per minute (we use this to communicate the strokes per minute)
      bufferBuilder.writeUInt16LE(Math.round(data.cycleStrokeRate * 2))
      // Total Distance in meters
      bufferBuilder.writeUInt24LE(Math.round(data.totalLinearDistance))
      // Instantaneous Power in watts
      bufferBuilder.writeUInt16LE(Math.round(data.cyclePower))
      // Energy
      // Total energy in kcal
      bufferBuilder.writeUInt16LE(Math.round(data.totalCalories))
      // Energy per hour
      // The Energy per Hour field represents the average expended energy of a user during a
      // period of one hour.
      bufferBuilder.writeUInt16LE(Math.round(data.totalCaloriesPerHour))
      // Energy per minute
      bufferBuilder.writeUInt8(Math.round(data.totalCaloriesPerMinute))
      // Heart Rate: Beats per minute with a resolution of 1
      bufferBuilder.writeUInt8(Math.round(data.heartrate))
      // Elapsed Time: Seconds with a resolution of 1
      bufferBuilder.writeUInt16LE(Math.round(data.totalMovingTime))

      const buffer = bufferBuilder.getBuffer()
      if (buffer.length > this._subscriberMaxValueSize) {
        log.warn(`IndoorBikeDataCharacteristic - notification of ${buffer.length} bytes is too large for the subscriber`)
      }
      this._updateValueCallback(bufferBuilder.getBuffer())
    }
    return this.RESULT_SUCCESS
  }
}

export const RowingMeasurementFlags = {
  moreDataPresent: (0x01 << 0),
  averageSpeedPresent: (0x01 << 1),
  instantaneousCadencePresent: (0x01 << 2),
  averageCadencePresent: (0x01 << 3),
  totalDistancePresent: (0x01 << 4),
  resistanceLevelPresent: (0x01 << 5),
  instantaneousPowerPresent: (0x01 << 6),
  averagePowerPresent: (0x01 << 7),
  expendedEnergyPresent: (0x01 << 8),
  heartRatePresent: (0x01 << 9),
  metabolicEquivalentPresent: (0x01 << 10),
  elapsedTimePresent: (0x01 << 11),
  remainingTimePresent: (0x01 << 12)
}

export const measurementFlag = RowingMeasurementFlags.instantaneousCadencePresent | RowingMeasurementFlags.totalDistancePresent | RowingMeasurementFlags.instantaneousPowerPresent | RowingMeasurementFlags.expendedEnergyPresent | RowingMeasurementFlags.heartRatePresent | RowingMeasurementFlags.elapsedTimePresent
