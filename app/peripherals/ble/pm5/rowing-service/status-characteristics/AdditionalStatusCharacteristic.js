'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
/**
 * Implementation of the Additional Status as defined in:
 * - https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
 * - https://www.concept2.co.uk/files/pdf/us/monitors/PM5_CSAFECommunicationDefinition.pdf
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/blob/main/docs/PM5_Interface.md#0x0032-additional-status|the description of desired behaviour}
*/
import { BufferBuilder } from '../../../BufferBuilder.js'
import { GattNotifyCharacteristic } from '../../../BleManager.js'

import { pm5Constants, toC2128BitUUID } from '../../Pm5Constants.js'

export class AdditionalStatusCharacteristic extends GattNotifyCharacteristic {
  #multiplexedCharacteristic

  /**
   * @param {import('../other-characteristics/MultiplexedCharacteristic.js').MultiplexedCharacteristic} multiplexedCharacteristic
   */
  constructor (multiplexedCharacteristic) {
    super({
      name: 'Additional Status',
      uuid: toC2128BitUUID('0032'),
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
    bufferBuilder.writeUInt24LE(data.interval.timeSpent.total > 0 && data.sessionState !== 'WaitingForStart' ? Math.round(data.interval.timeSpent.total * 100) : 0)
    // speed: UInt16LE in 0.001 m/sec
    bufferBuilder.writeUInt16LE(data.cycleLinearVelocity > 0 ? Math.round(data.cycleLinearVelocity * 1000) : 0)
    // strokeRate: UInt8 in strokes/min
    bufferBuilder.writeUInt8(data.cycleStrokeRate > 0 ? Math.round(data.cycleStrokeRate) : 0)
    // heartrate: UInt8 in bpm, 255 if invalid
    bufferBuilder.writeUInt8(data?.heartrate ? Math.round(data.heartrate) : 0)
    // currentPace: UInt16LE in 0.01 sec/500m
    bufferBuilder.writeUInt16LE(data.cyclePace !== Infinity && data.cyclePace > 0 && data.cyclePace < 655.34 ? Math.round(data.cyclePace * 100) : 0)
    // averagePace: UInt16LE in 0.01 sec/500m
    bufferBuilder.writeUInt16LE(data.interval.pace.average !== Infinity && data.interval.pace.average > 0 && data.interval.pace.average < 655.34 ? Math.round(data.interval.pace.average * 100) : 0)
    // restDistance: UInt16LE
    bufferBuilder.writeUInt16LE(0)
    // restTime: UInt24LE in 0.01 sec
    bufferBuilder.writeUInt24LE(data.pauseCountdownTime > 0 ? Math.round(data.pauseCountdownTime * 100) : 0)
    if (!this.isSubscribed) {
      // the multiplexer uses a slightly different format for the AdditionalStatus
      // it adds averagePower before the ergMachineType
      // averagePower: UInt16LE in watts
      bufferBuilder.writeUInt16LE(data.cyclePower > 0 && data.cyclePower < 65534 ? Math.round(data.cyclePower) : 0)
    }
    // ergMachineType: 0 TYPE_STATIC_D
    bufferBuilder.writeUInt8(pm5Constants.ergMachineType)

    if (this.isSubscribed) {
      super.notify(bufferBuilder.getBuffer())

      return
    }

    this.#multiplexedCharacteristic.notify(0x32, bufferBuilder.getBuffer())
  }
}
