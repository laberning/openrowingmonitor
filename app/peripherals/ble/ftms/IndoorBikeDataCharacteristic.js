'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

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
import { BufferBuilder } from '../BufferBuilder.js'
import { GattNotifyCharacteristic } from '../BleManager.js'

export class IndoorBikeDataCharacteristic extends GattNotifyCharacteristic {
  constructor () {
    super({
      name: 'Indoor Bike Data',
      uuid: 0x2AD2,
      properties: ['notify']
    })
  }

  /**
   * @param {Metrics} data
   */
  // @ts-ignore: Type is not assignable to type
  notify (data) {
    // ignore events without the mandatory fields
    if (!('cycleLinearVelocity' in data)) {
      return
    }

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
    bufferBuilder.writeUInt16LE(data.cycleLinearVelocity > 0 ? data.cycleLinearVelocity * 3.6 * 100 : 0)
    // Instantaneous Cadence in rotations per minute (we use this to communicate the strokes per minute)
    bufferBuilder.writeUInt16LE(data.cycleStrokeRate > 0 ? Math.round(data.cycleStrokeRate * 2) : 0)
    // Total Distance in meters
    bufferBuilder.writeUInt24LE(data.totalLinearDistance > 0 ? Math.round(data.totalLinearDistance) : 0)
    // Instantaneous Power in watts
    bufferBuilder.writeUInt16LE(data.cyclePower > 0 ? Math.round(data.cyclePower) : 0)
    // Energy
    // Total energy in kcal
    bufferBuilder.writeUInt16LE(data.totalCalories > 0 ? Math.round(data.totalCalories) : 0)
    // Energy per hour
    // The Energy per Hour field represents the average expended energy of a user during a
    // period of one hour.
    bufferBuilder.writeUInt16LE(data.totalCaloriesPerHour > 0 ? Math.round(data.totalCaloriesPerHour) : 0)
    // Energy per minute
    bufferBuilder.writeUInt8(data.totalCaloriesPerMinute > 0 ? Math.round(data.totalCaloriesPerMinute) : 0)
    // Heart Rate: Beats per minute with a resolution of 1
    bufferBuilder.writeUInt8(data?.heartrate ? Math.round(data.heartrate) : 0)
    // Elapsed Time: Seconds with a resolution of 1
    bufferBuilder.writeUInt16LE(Math.round(data.totalMovingTime))

    super.notify(bufferBuilder.getBuffer())
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
