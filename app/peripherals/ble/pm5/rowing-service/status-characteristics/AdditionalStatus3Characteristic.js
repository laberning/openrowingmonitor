'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Implementation of the AdditionalStatus2 as defined in:
  * https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
  * https://www.concept2.co.uk/files/pdf/us/monitors/PM5_CSAFECommunicationDefinition.pdf
*/
import { BufferBuilder } from '../../../BufferBuilder.js'
import { GattNotifyCharacteristic } from '../../../BleManager.js'
import { toC2128BitUUID, toC2OperationalState } from '../../utils/ORMtoC2Mapper.js'

export class AdditionalStatus3Characteristic extends GattNotifyCharacteristic {
  #multiplexedCharacteristic

  /**
   * @param {import('../other-characteristics/MultiplexedCharacteristic.js').MultiplexedCharacteristic} multiplexedCharacteristic
   */
  constructor (multiplexedCharacteristic) {
    super({
      name: 'Additional Status 3',
      uuid: toC2128BitUUID('003E'),
      properties: ['notify']
    })

    this.#multiplexedCharacteristic = multiplexedCharacteristic
  }

  /**
   * @param {Metrics} data
   */
  //
  /* @ts-ignore: Type is not assignable to type */
  notify (data) {
    const bufferBuilder = new BufferBuilder()
    // Operational State, see Operational states
    bufferBuilder.writeUInt8(toC2OperationalState(data))
    // Workout Verification State: PM5 1 is accepted by ErgData ans results in a verifued workout in the logbook. As ORM isn't that trustworthy, we explicitly set it to 0
    // Despite setting this to 0, the logbook still records it as verified
    bufferBuilder.writeUInt8(0)
    // Screen Number: UInt16
    bufferBuilder.writeUInt16LE(1)
    // Last Error: UInt16
    bufferBuilder.writeUInt16LE(0)
    // Calibration Mode, (BikeErg only; 0 otherwise)
    bufferBuilder.writeUInt8(0)
    // Calibration State, (BikeErg only; 0 otherwise)
    bufferBuilder.writeUInt8(0)
    // Calibration Status, (BikeErg only; 0 otherwise)
    bufferBuilder.writeUInt8(0)
    // Game ID: UInt8
    bufferBuilder.writeUInt8(0)
    // Game Score: UInt16LE
    bufferBuilder.writeUInt16LE(0)

    if (this.isSubscribed) {
      super.notify(bufferBuilder.getBuffer())

      return
    }

    this.#multiplexedCharacteristic.notify(0x3e, bufferBuilder.getBuffer())
  }
}
