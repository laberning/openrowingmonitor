'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Implementation of the ControlReceive Characteristic as defined in:
  * https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
  * https://www.concept2.co.uk/files/pdf/us/monitors/PM5_CSAFECommunicationDefinition.pdf
  Used to receive controls from the central
*/
import NodeBleHost from 'ble-host'
import loglevel from 'loglevel'

import { toHexString } from '../../../../tools/Helper.js'

import { UniqueFrameFlags } from '../csafe-service/CsafeCommandsMapping.js'
import { toC2128BitUUID } from '../Pm5Constants.js'

const log = loglevel.getLogger('Peripherals')

export class ControlReceiveCharacteristic {
  get characteristic () {
    return this.#characteristic
  }

  /**
   * @type {GattServerCharacteristicFactory}
   */
  #characteristic
  /**
   * @type {Array<number>}
   */
  #currentDataBuffer = []

  #csafeCommandService

  /**
   * @param {import('../csafe-service/CsafeManagerService.js').CsafeManagerService} csafeCommandService
   */
  constructor (csafeCommandService) {
    this.#csafeCommandService = csafeCommandService
    this.#characteristic = {
      name: 'Control Receive',
      uuid: toC2128BitUUID('0021'),
      properties: ['write', 'write-without-response'],
      onWrite: (_connection, needsResponse, data, callback) => {
        log.debug('PM5 Control is called:', data)

        if (data.indexOf(UniqueFrameFlags.ExtendedStartFlag) >= 0 || data.indexOf(UniqueFrameFlags.StandardStartFlag) >= 0) {
          // One command frame can arrive in multiple writes so we need accumulate until we have a full frame indicated by the StopFlag (0xF2)
          // Reset buffer when a new frame is started
          this.#currentDataBuffer = []
        }
        this.#currentDataBuffer.push(...data)

        if (needsResponse) {
          callback(NodeBleHost.AttErrors.SUCCESS) // actually only needs to be called when needsResponse is true
        }

        if (data.indexOf(UniqueFrameFlags.StopFlag) < 0) {
          return
        }

        log.debug('PM5 Control frame is complete:', toHexString(this.#currentDataBuffer))

        const frame = this.#currentDataBuffer.slice(this.#currentDataBuffer.findIndex((byte) => byte === UniqueFrameFlags.StandardStartFlag || byte === UniqueFrameFlags.ExtendedStartFlag))

        try {
          this.#csafeCommandService.processCommand(frame)
        } catch (e) {
          // TODO: Indicate via the transfer characteristic that some error occurred
          log.warn(e)
        }
      }
    }
  }
}
