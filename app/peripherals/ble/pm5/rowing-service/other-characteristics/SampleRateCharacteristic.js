'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Implementation of the AdditionalStatus as defined in:
  https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
*/
import NodeBleHost from 'ble-host'
import loglevel from 'loglevel'

import { toC2128BitUUID } from '../../Pm5Constants.js'

const log = loglevel.getLogger('Peripherals')

export class SampleRateCharacteristic {
  get characteristic () {
    return this.#characteristic
  }

  /**
   * @type {GattServerCharacteristicFactory}
   */
  #characteristic
  #sampleRate

  /**
   * @param {Config} config
   */
  constructor (config) {
    this.#sampleRate = config.pm5UpdateInterval === 1000 ? 0 : 2
    this.#characteristic = {
      name: 'Sample Rate',
      uuid: toC2128BitUUID('0034'),
      properties: ['read', 'write'],
      onRead: (connection, callback) => {
        log.debug(`PM5 ${this.#characteristic.name} read characteristic has been called`)
        callback(NodeBleHost.AttErrors.SUCCESS, Buffer.from([this.#sampleRate]))
      },
      onWrite: (_connection, _needsResponse, sampleRate, callback) => {
        this.#sampleRate = sampleRate.readUint8(0)
        // TODO: needs to be properly handle the rates based on enum
        config.pm5UpdateInterval = this.#sampleRate === 0 ? 1000 : 250
        log.debug(`PM5 ${this.#characteristic.name} write is called: ${this.#sampleRate}`)

        callback(NodeBleHost.AttErrors.SUCCESS) // actually only needs to be called when needsResponse is true
      }
    }
  }
}
