'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Creates a Bluetooth Low Energy (BLE) Peripheral with all the Services that are required for
  a Fitness Machine Device

  Relevant parts from https://www.bluetooth.com/specifications/specs/fitness-machine-profile-1-0/
  The Fitness Machine shall instantiate one and only one Fitness Machine Service as Primary Service
  The User Data Service, if supported, shall be instantiated as a Primary Service.
  The Fitness Machine may instantiate the Device Information Service
  (Manufacturer Name String, Model Number String)
*/
import NodeBleHost from 'ble-host'
import loglevel from 'loglevel'

import { DeviceInformationService } from './common/DeviceInformationService.js'
import { FitnessMachineService } from './ftms/FitnessMachineService.js'

/**
 * @typedef {import('./ble-host.interface.js').BleManager} BleManager
 * @typedef {import('./ble-host.interface.js').Connection} Connection
 */

const log = loglevel.getLogger('Peripherals')

/**
 * @param {import('./BleManager.js').BleManager} bleManager
 * @param {ControlPointCallback} controlCallback
 * @param {Config} config
 * @param {boolean} simulateIndoorBike
 */
export function createFtmsPeripheral (bleManager, controlCallback, config, simulateIndoorBike) {
  const peripheralName = simulateIndoorBike ? config.ftmsBikePeripheralName : config.ftmsRowerPeripheralName
  const fitnessMachineService = new FitnessMachineService(controlCallback, simulateIndoorBike)
  const deviceInformationService = new DeviceInformationService()

  const rowerSupportedDataFlag = simulateIndoorBike ? 0x01 << 5 : 0x01 << 4
  const fitnessMachineAvailable = 0x01

  const advDataBuffer = new NodeBleHost.AdvertisingDataBuilder()
    .addFlags(['leGeneralDiscoverableMode', 'brEdrNotSupported'])
    .addLocalName(/* isComplete */ false, peripheralName.slice(0, 15))
    .add16BitServiceUUIDs(/* isComplete */ true, [fitnessMachineService.gattService.uuid])
    .add16BitServiceData(fitnessMachineService.gattService.uuid, Buffer.from([fitnessMachineAvailable, rowerSupportedDataFlag, rowerSupportedDataFlag >> 8]))
    .build()

  const scanResponseBuffer = new NodeBleHost.AdvertisingDataBuilder()
    .addLocalName(/* isComplete */ true, peripheralName)
    .build()

  const broadcastInterval = config.ftmsUpdateInterval
  /**
   * @type {Metrics}
   */
  let lastKnownMetrics = {
    // This reference is to satisfy type checking while simplifying the initialization of lastKnownMetrics (i.e. allow partial initialization but have the type system consider it as a full Metrics type)
    .../** @type {Metrics} */({}),
    totalMovingTime: 0,
    totalLinearDistance: 0,
    dragFactor: config.rowerSettings.dragFactor
  }

  let timer = setTimeout(onBroadcastInterval, broadcastInterval)

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
    _manager.gattDb.setDeviceName(peripheralName)
    _manager.gattDb.addServices([fitnessMachineService.gattService, deviceInformationService.gattService])
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
    log.debug(`FTMS Connection established, address: ${_connection.peerAddress}`)

    await new Promise((resolve) => { /** @type {Connection} */(_connection).gatt.exchangeMtu(resolve) })

    _connection.smp.once('pairingRequest', () => {
      _connection.smp.sendPairingFailed(NodeBleHost.SmpErrors.PAIRING_NOT_SUPPORTED)
      log.debug('FTMS pairing request rejected')
    })

    _connection.once('disconnect', async () => {
      log.debug(`FTMS client disconnected (address: ${_connection?.peerAddress}), restarting advertising`)
      _connection = undefined
      await triggerAdvertising()
    }) // restart advertising after disconnect
  }

  /** Records the last known rowing metrics to FTMS central
   * @param {Metrics} data
   */
  function notifyData (data) {
    lastKnownMetrics = data
  }

  /**
   * Present current rowing status to FTMS central
   * @param {{name: string}} status
   */
  function notifyStatus (status) {
    fitnessMachineService.notifyStatus(status)
  }

  function destroy () {
    log.debug(`Shutting down FTMS ${simulateIndoorBike ? 'Bike' : 'Rower'} peripheral`)
    clearTimeout(timer)
    _manager?.gattDb.removeService(fitnessMachineService.gattService)
    _manager?.gattDb.removeService(deviceInformationService.gattService)
    return new Promise((resolve) => {
      if (_connection !== undefined) {
        log.debug(`Terminating current FTMS ${simulateIndoorBike ? 'Bike' : 'Rower'} connection`)
        _connection.removeAllListeners()
        _connection.once('disconnect', resolve)
        _connection.disconnect()

        return
      }
      _manager?.stopAdvertising(resolve)
    })
  }

  // present current rowing metrics to FTMS central
  function onBroadcastInterval () {
    fitnessMachineService.notifyData(lastKnownMetrics)
    timer = setTimeout(onBroadcastInterval, broadcastInterval)
  }

  return {
    triggerAdvertising,
    notifyData,
    notifyStatus,
    destroy
  }
}
