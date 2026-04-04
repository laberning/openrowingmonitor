'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Creates a Bluetooth Low Energy (BLE) Peripheral with all the Services that are required for
  a Cycling Speed and Cadence Profile
*/
import NodeBleHost from 'ble-host'
import loglevel from 'loglevel'

import { bleBroadcastInterval, bleMinimumKnowDataUpdateInterval } from '../PeripheralConstants.js'

import { CyclingSpeedCadenceService } from './csc/CyclingSpeedCadenceService.js'
import { DeviceInformationService } from './common/DeviceInformationService.js'

/**
 * @typedef {import('./ble-host.interface.js').Connection} Connection
 * @typedef {import('./ble-host.interface.js').BleManager} BleManager
 */

const log = loglevel.getLogger('Peripherals')

/**
 * @param {import('./BleManager.js').BleManager} bleManager
 * @param {Config} config
 */
export function createCscPeripheral (bleManager, config) {
  const cyclingSpeedCadenceService = new CyclingSpeedCadenceService((event) => {
    log.debug('CSC Control Point', event)
    return false
  })

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
  let timer = setTimeout(onBroadcastInterval, bleBroadcastInterval)

  const deviceInformationService = new DeviceInformationService()
  const cscAppearance = 1157 // Cycling Speed and Cadence Sensor
  const advDataBuffer = new NodeBleHost.AdvertisingDataBuilder()
    .addFlags(['leGeneralDiscoverableMode', 'brEdrNotSupported'])
    .addLocalName(/* isComplete */ false, `${config.ftmsRowerPeripheralName}`)
    .addAppearance(cscAppearance)
    .add16BitServiceUUIDs(/* isComplete */ false, [cyclingSpeedCadenceService.gattService.uuid])
    .build()
  const scanResponseBuffer = new NodeBleHost.AdvertisingDataBuilder()
    .addLocalName(/* isComplete */ true, `${config.ftmsRowerPeripheralName} (CSC)`)
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
    _manager.gattDb.setDeviceName(`${config.ftmsRowerPeripheralName} (CSC)`)
    _manager.gattDb.addServices([cyclingSpeedCadenceService.gattService, deviceInformationService.gattService])
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
    log.debug(`CSC Connection established, address: ${_connection.peerAddress}`)

    _connection.smp.once('pairingRequest', () => {
      _connection.smp.sendPairingFailed(NodeBleHost.SmpErrors.PAIRING_NOT_SUPPORTED)
      log.debug('CSC pairing request rejected')
    })

    _connection.once('disconnect', async () => {
      log.debug(`CSC client disconnected (address: ${_connection?.peerAddress}), restarting advertising`)
      _connection = undefined
      await triggerAdvertising()
    }) // restart advertising after disconnect
  }

  // present current rowing metrics to CSC central
  function onBroadcastInterval () {
    cyclingSpeedCadenceService.notifyData(lastKnownMetrics)
    timer = setTimeout(onBroadcastInterval, bleBroadcastInterval)
  }

  /** Records the last known rowing metrics to CSC central
  * As the client calculates its own speed based on time and distance,
  * we an only update the last known metrics upon a stroke state change to prevent spiky behaviour
  * @param {Metrics} metrics
  */
  function notifyData (metrics) {
    if (metrics.metricsContext === undefined) { return }
    switch (true) {
      case (metrics.metricsContext.isSessionStop):
        lastKnownMetrics = { ...metrics }
        clearTimeout(timer)
        onBroadcastInterval()
        break
      case (metrics.metricsContext.isPauseStart):
        lastKnownMetrics = { ...metrics }
        clearTimeout(timer)
        onBroadcastInterval()
        break
      case (metrics.metricsContext.isRecoveryStart):
        lastKnownMetrics = { ...metrics }
        clearTimeout(timer)
        onBroadcastInterval()
        break
      case (metrics.timestamp - lastKnownMetrics.timestamp >= bleMinimumKnowDataUpdateInterval):
        lastKnownMetrics = { ...metrics }
        clearTimeout(timer)
        onBroadcastInterval()
        break
      default:
        // Do nothing
    }
  }

  /**
   * CSC does not have status characteristic
   * @param {{name: string}} status
   */
  /* eslint-disable-next-line no-unused-vars -- standardized characteristic interface where the status parameter isn't relevant */
  function notifyStatus (status) {
  }

  function destroy () {
    log.debug('Shutting down CSC peripheral')
    clearTimeout(timer)
    _manager?.gattDb.removeService(cyclingSpeedCadenceService.gattService)
    _manager?.gattDb.removeService(deviceInformationService.gattService)
    return new Promise((resolve) => {
      if (_connection !== undefined) {
        log.debug('Terminating current CSC connection')
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
