'use strict'
/**
 * @copyright [OpenRowingMonitor]{@link https://github.com/JaapvanEkris/openrowingmonitor}
 *
 * @file Implementation of the StrokeData as defined in:
 * - https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
 * - https://www.concept2.co.uk/files/pdf/us/monitors/PM5_CSAFECommunicationDefinition.pdf
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/blob/main/docs/PM5_Interface.md#0x0035-stroke-data|the description of desired behaviour}
*/
import { BufferBuilder } from '../../../BufferBuilder.js'
import { GattNotifyCharacteristic } from '../../../BleManager.js'

import { toC2128BitUUID } from '../../Pm5Constants.js'

export class StrokeDataCharacteristic extends GattNotifyCharacteristic {
  #multiplexedCharacteristic

  /**
   * @param {import('./MultiplexedCharacteristic.js').MultiplexedCharacteristic} multiplexedCharacteristic
   */
  constructor (multiplexedCharacteristic) {
    super({
      name: 'Stroke Data',
      uuid: toC2128BitUUID('0035'),
      properties: ['notify']
    })
    this.#multiplexedCharacteristic = multiplexedCharacteristic
  }

  /**
   * @param {Metrics} data
   */
  // @ts-ignore: Type is not assignable to type
  notify (data) {
    const bufferBuilder = new BufferBuilder()
    // elapsedTime: UInt24LE in 0.01 sec
    bufferBuilder.writeUInt24LE(data.interval.timeSpent.total > 0 && data.interval.timeSpent.total < 167772.15 && data.sessionState !== 'WaitingForStart' ? Math.round(data.interval.timeSpent.total * 100) : 0)
    // distance: UInt24LE in 0.1 m
    bufferBuilder.writeUInt24LE(data.interval.distance.fromStart > 0 && data.interval.distance.fromStart < 1677721.5 ? Math.round(data.interval.distance.fromStart * 10) : 0)
    // driveLength: UInt8 in 0.01 m
    bufferBuilder.writeUInt8(data.driveLength > 0 && data.driveLength < 2.55 ? Math.round(data.driveLength * 100) : 0)
    // driveTime: UInt8 in 0.01 s
    bufferBuilder.writeUInt8(data.driveDuration > 0 && data.driveDuration < 2.55 ? Math.round(data.driveDuration * 100) : 0)
    // strokeRecoveryTime: UInt16LE in 0.01 s
    bufferBuilder.writeUInt16LE(data.recoveryDuration > 0 && data.recoveryDuration < 655.35 ? Math.round(data.recoveryDuration * 100) : 0)
    // strokeDistance: UInt16LE in 0.01 m
    bufferBuilder.writeUInt16LE(data.cycleDistance > 0 && data.cycleDistance < 655.35 ? Math.round(data.cycleDistance * 100) : 0)
    // peakDriveForce: UInt16LE in 0.1 lbs
    bufferBuilder.writeUInt16LE(data.drivePeakHandleForce > 0 && data.drivePeakHandleForce < 29151 ? Math.round(data.drivePeakHandleForce * 0.224809 * 10) : 0)
    // averageDriveForce: UInt16LE in 0.1 lbs
    bufferBuilder.writeUInt16LE(data.driveAverageHandleForce > 0 && data.driveAverageHandleForce < 29151 ? Math.round(data.driveAverageHandleForce * 0.224809 * 10) : 0)
    if (this.isSubscribed) {
      // workPerStroke is only added if data is not send via multiplexer
      // workPerStroke: UInt16LE in 0.1 Joules
      bufferBuilder.writeUInt16LE(data.strokeWork > 0 && data.strokeWork < 6553.5 ? Math.round(data.strokeWork * 10) : 0)
    }
    // strokeCount: UInt16LE
    bufferBuilder.writeUInt16LE(data.interval.numberOfStrokes > 0 && data.interval.numberOfStrokes < 65535 ? Math.round(data.interval.numberOfStrokes) : 0)

    if (this.isSubscribed) {
      super.notify(bufferBuilder.getBuffer())

      return
    }

    this.#multiplexedCharacteristic.notify(0x35, bufferBuilder.getBuffer())
  }
}
