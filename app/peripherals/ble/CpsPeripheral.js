'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
/**
 * Creates a Bluetooth Low Energy (BLE) Peripheral with all the Services that are required for
 * a Cycling Power Profile
 */
import NodeBleHost from 'ble-host'
import loglevel from 'loglevel'

import { bleBroadcastInterval, bleMinimumKnowDataUpdateInterval } from '../PeripheralConstants.js'

import { CyclingPowerService } from './cps/CyclingPowerMeterService.js'
import { DeviceInformationService } from './common/DeviceInformationService.js'

/**
 * @typedef {import('./ble-host.interface.js').Connection} Connection
 * @typedef {import('./ble-host.interface.js').BleManager} BleManager
 */

const log = loglevel.getLogger('Peripherals')

/**
 *
 * @param {import('./BleManager.js').BleManager} bleManager
 * @param {Config} config
 * @returns
 */
export function createCpsPeripheral (bleManager, config) {
  const cyclingPowerService = new CyclingPowerService((event) => {
    log.debug('CPS Control Point', event)
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
  const cpsAppearance = 1156
  const advDataBuffer = new NodeBleHost.AdvertisingDataBuilder()
    .addFlags(['leGeneralDiscoverableMode', 'brEdrNotSupported'])
    .addLocalName(/* isComplete */ false, `${config.ftmsRowerPeripheralName}`)
    .addAppearance(cpsAppearance)
    .add16BitServiceUUIDs(/* isComplete */ false, [cyclingPowerService.gattService.uuid])
    .build()
  const scanResponseBuffer = new NodeBleHost.AdvertisingDataBuilder()
    .addLocalName(/* isComplete */ true, `${config.ftmsRowerPeripheralName} (CPS)`)
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
    _manager.gattDb.setDeviceName(`${config.ftmsRowerPeripheralName} (CPS)`)
    _manager.gattDb.addServices([cyclingPowerService.gattService, deviceInformationService.gattService])
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
    log.debug(`CPS Connection established, address: ${_connection.peerAddress}`)

    _connection.smp.once('pairingRequest', () => {
      _connection.smp.sendPairingFailed(NodeBleHost.SmpErrors.PAIRING_NOT_SUPPORTED)
      log.debug('CPS pairing request rejected')
    })

    _connection.on('disconnect', async () => {
      log.debug(`CPS client disconnected (address: ${_connection?.peerAddress}), restarting advertising`)
      _connection = undefined
      await triggerAdvertising()
    }) // restart advertising after disconnect
  }

  // Broadcast the last known metrics
  function onBroadcastInterval () {
    cyclingPowerService.notifyData(lastKnownMetrics)
    timer = setTimeout(onBroadcastInterval, bleBroadcastInterval)
  }

  /** Records the last known rowing metrics to CPS central
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
   * CPS does not have status characteristic
   * @param {{name: string}} status
   */
  /* eslint-disable-next-line no-unused-vars -- standardized characteristic interface where the status parameter isn't relevant */
  function notifyStatus (status) {
  }

  function destroy () {
    log.debug('Shutting down CPS peripheral')
    clearTimeout(timer)
    _manager?.gattDb.removeService(cyclingPowerService.gattService)
    _manager?.gattDb.removeService(deviceInformationService.gattService)
    return new Promise((resolve) => {
      if (_connection !== undefined) {
        log.debug('Terminating current CPS connection')
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
