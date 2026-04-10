'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  This implements the Rower Data Characteristic as defined by the Bluetooth SIG
  Currently not many applications exist that support thes FTMS Characteristic for Rowing so its hard
  to verify this. So far tested on:
    - Kinomap.com: uses Power, Split Time and Strokes per Minutes

  From the specs:
  The Server should notify this characteristic at a regular interval, typically once per second
  while in a connection and the interval is not configurable by the Client
*/
import { BufferBuilder } from '../BufferBuilder.js'
import { GattNotifyCharacteristic } from '../BleManager.js'

export class RowerDataCharacteristic extends GattNotifyCharacteristic {
  constructor () {
    super(
      {
        name: 'Rower Data',
        uuid: 0x2AD1,
        properties: ['notify']
      })
  }

  /**
   * @param {Metrics} data
   */
  // @ts-ignore: Type is not assignable to type
  notify (data) {
    // ignore events without the mandatory fields
    if (!('cycleStrokeRate' in data && 'totalNumberOfStrokes' in data)) {
      return
    }

    const bufferBuilder = new BufferBuilder()
    // Field flags as defined in the Bluetooth Documentation
    // Stroke Rate (default), Stroke Count (default), Total Distance (2), Instantaneous Pace (3),
    // Instantaneous Power (5), Total / Expended Energy (8), Heart Rate (9), Elapsed Time (11)
    // todo: might add: Average Stroke Rate (1), Average Pace (4), Average Power (6)
    // Remaining Time (12)
    // 00101100
    bufferBuilder.writeUInt16LE(measurementFlag)
    // 00001011

    // see https://www.bluetooth.com/specifications/specs/gatt-specification-supplement-3/
    // for some of the data types
    // Stroke Rate in stroke/minute, value is multiplied by 2 to have a .5 precision
    bufferBuilder.writeUInt8(data.cycleStrokeRate > 0 ? Math.round(data.cycleStrokeRate * 2) : 0)
    // Stroke Count
    bufferBuilder.writeUInt16LE(data.totalNumberOfStrokes > 0 ? Math.round(data.totalNumberOfStrokes) : 0)
    // Total Distance in meters
    bufferBuilder.writeUInt24LE(data.totalLinearDistance > 0 ? Math.round(data.totalLinearDistance) : 0)
    // Instantaneous Pace in seconds/500m
    // if split is infinite (i.e. while pausing), should use the highest possible number (0xFFFF)
    // todo: eventhough mathematically correct, setting 0xFFFF (65535s) causes some ugly spikes
    // in some applications which could shift the axis (i.e. workout diagrams in MyHomeFit)
    // so instead for now we use 0 here
    bufferBuilder.writeUInt16LE(data.cyclePace !== Infinity && data.cyclePace < 65535 ? Math.round(data.cyclePace) : 0)
    // Instantaneous Power in watts
    bufferBuilder.writeUInt16LE(data.cyclePower > 0 ? Math.round(data.cyclePower) : 0)
    // Energy in kcal
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
    bufferBuilder.writeUInt16LE(data.totalMovingTime > 0 ? Math.round(data.totalMovingTime) : 0)

    super.notify(bufferBuilder.getBuffer())
  }
}

export const RowingMeasurementFlags = {
  moreDataPresent: (0x01 << 0),
  averageStrokeRatePresent: (0x01 << 1),
  totalDistancePresent: (0x01 << 2),
  instantaneousPacePresent: (0x01 << 3),
  averagePacePresent: (0x01 << 4),
  instantaneousPowerPresent: (0x01 << 5),
  averagePowerPresent: (0x01 << 6),
  resistanceLevelPresent: (0x01 << 7),
  expendedEnergyPresent: (0x01 << 8),
  heartRatePresent: (0x01 << 9),
  metabolicEquivalentPresent: (0x01 << 10),
  elapsedTimePresent: (0x01 << 11),
  remainingTimePresent: (0x01 << 12)
}

export const measurementFlag = RowingMeasurementFlags.totalDistancePresent | RowingMeasurementFlags.instantaneousPacePresent | RowingMeasurementFlags.instantaneousPowerPresent | RowingMeasurementFlags.expendedEnergyPresent | RowingMeasurementFlags.heartRatePresent | RowingMeasurementFlags.elapsedTimePresent
