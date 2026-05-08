'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Creates a Bluetooth Low Energy (BLE) Peripheral with all the Services that are used by the
  Concept2 PM5 rowing machine.

  see: https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
  and https://www.concept2.co.uk/files/pdf/us/monitors/PM5_CSAFECommunicationDefinition.pdf
*/
import NodeBleHost from 'ble-host'
import log from 'loglevel'

import { pm5Constants, toC2128BitUUID } from './pm5/Pm5Constants.js'
import { Pm5AppearanceService } from './pm5/Pm5AppearanceService.js'
import { Pm5ControlService } from './pm5/control-service/Pm5ControlService.js'
import { Pm5DeviceInformationService } from './pm5/Pm5DeviceInformationService.js'
import { Pm5HeartRateControlService } from './pm5/heart-rate-service/Pm5HeartRateControlService.js'
import { Pm5RowingService } from './pm5/rowing-service/Pm5RowingService.js'
import { DeviceInformationService } from './common/DeviceInformationService.js'

/**
 * @typedef {import('./ble-host.interface.js').BleManager} BleManager
 * @typedef {import('./ble-host.interface.js').Connection} Connection
 */

/**
 * @param {import ('./BleManager.js').BleManager} bleManager
 * @param {Config} config
 * @param {ControlPointCallback} controlCallback
 */
export function createPm5Peripheral (bleManager, config, controlCallback) {
  const deviceInformationService = new Pm5DeviceInformationService()
  const appearanceService = new Pm5AppearanceService()
  const controlService = new Pm5ControlService(controlCallback)
  const rowingService = new Pm5RowingService(config)
  const heartRateControlService = new Pm5HeartRateControlService()
  const gattServices = [appearanceService.gattService, controlService.gattService, deviceInformationService.gattService, rowingService.gattService, heartRateControlService.gattService, new DeviceInformationService().gattService]

  const advDataBuffer = new NodeBleHost.AdvertisingDataBuilder()
    .addFlags(['leGeneralDiscoverableMode', 'brEdrNotSupported'])
    .addLocalName(/* isComplete */ true, `${pm5Constants.name} Row`)
    .build()
  const scanResponseBuffer = new NodeBleHost.AdvertisingDataBuilder()
    .add128BitServiceUUIDs(/* isComplete */ true, [toC2128BitUUID('0000')])
    .build()

  /**
  * @type {BleManager | undefined}
  */
  let _manager
  /**
  * @type {Connection | undefined}
  */
  let _connection

  setup()

  async function setup () {
    _manager = await bleManager.getManager()
    _manager.gattDb.setDeviceName(pm5Constants.name)
    _manager.gattDb.addServices(gattServices)
    _manager.setAdvertisingData(advDataBuffer)
    _manager.setScanResponseData(scanResponseBuffer)

    await triggerAdvertising()
  }

  async function triggerAdvertising () {
    _connection = await new Promise((/** @type {(value: Connection) => void} */resolve) => {
      /** @type {BleManager} */(_manager).startAdvertising({/* options */}, (_status, connection) => {
        resolve(connection)
      })
    })
    log.debug(`PM5 Connection established, address: ${_connection.peerAddress}`)

    await new Promise((resolve) => { /** @type {Connection} */(_connection).gatt.exchangeMtu(resolve) })

    _connection.smp.once('pairingRequest', () => {
      _connection.smp.sendPairingFailed(NodeBleHost.SmpErrors.PAIRING_NOT_SUPPORTED)
      log.debug('PM5 pairing request rejected')
    })

    _connection.once('disconnect', async () => {
      log.debug(`PM5 client disconnected (address: ${_connection?.peerAddress}), restarting advertising`)
      _connection = undefined
      await triggerAdvertising()
    }) // restart advertising after disconnect
  }

  /**
   * Records the last known rowing metrics to FTMS central
   * @param {Metrics} data
   */
  function notifyData (data) {
    rowingService.notifyData(data)
  }

  /**
   * Present current rowing status to C2-PM5 central
   * @param {{name: string}} status
   */
  /* eslint-disable-next-line no-unused-vars -- standardized characteristic interface where the data parameter isn't relevant */
  function notifyStatus (status) {
  }

  function destroy () {
    log.debug('Shutting down PM5 peripheral')

    if (_manager !== undefined) {
      gattServices.forEach((service) => {
        /** @type {BleManager} */(_manager).gattDb.removeService(service)
      })
    }
    return new Promise((resolve) => {
      if (_connection !== undefined) {
        log.debug('Terminating current PM5 connection')
        _connection.removeAllListeners()
        _connection.once('disconnect', resolve)
        _connection.disconnect()

        return
      }
      _manager?.stopAdvertising(resolve)
    })
  }

  return {
    triggerAdvertising,
    notifyData,
    notifyStatus,
    destroy
  }
}
