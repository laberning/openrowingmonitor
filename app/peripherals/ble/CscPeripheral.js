'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Creates a Bluetooth Low Energy (BLE) Peripheral with all the Services that are required for
  a Cycling Speed and Cadence Profile
*/
import bleno from '@abandonware/bleno'
import config from '../../tools/ConfigManager.js'
import log from 'loglevel'
import DeviceInformationService from './common/DeviceInformationService.js'
import CyclingSpeedCadenceService from './csc/CyclingSpeedCadenceService.js'
import AdvertisingDataBuilder from './common/AdvertisingDataBuilder.js'

function createCscPeripheral () {
  const peripheralName = `${config.ftmsRowerPeripheralName} (CSC)`
  const cyclingSpeedCadenceService = new CyclingSpeedCadenceService((event) => log.debug('CSC Control Point', event))

  bleno.on('stateChange', (state) => {
    triggerAdvertising(state)
  })

  bleno.on('advertisingStart', (error) => {
    if (!error) {
      bleno.setServices(
        [
          cyclingSpeedCadenceService,
          new DeviceInformationService()
        ],
        (error) => {
          if (error) log.error(error)
        })
    }
  })

  bleno.on('accept', (clientAddress) => {
    log.debug(`ble central connected: ${clientAddress}`)
    bleno.updateRssi()
  })

  bleno.on('disconnect', (clientAddress) => {
    log.debug(`ble central disconnected: ${clientAddress}`)
  })

  bleno.on('platform', (event) => {
    log.debug('platform', event)
  })
  bleno.on('addressChange', (event) => {
    log.debug('addressChange', event)
  })
  bleno.on('mtuChange', (event) => {
    log.debug('mtuChange', event)
  })
  bleno.on('advertisingStartError', (event) => {
    log.debug('advertisingStartError', event)
  })
  bleno.on('servicesSetError', (event) => {
    log.debug('servicesSetError', event)
  })
  bleno.on('rssiUpdate', (event) => {
    log.debug('rssiUpdate', event)
  })

  function destroy () {
    return new Promise((resolve) => {
      bleno.disconnect()
      bleno.removeAllListeners()
      bleno.stopAdvertising(resolve)
    })
  }

  function triggerAdvertising (eventState) {
    const activeState = eventState || bleno.state
    if (activeState === 'poweredOn') {
      const cscAppearance = 1157
      const advertisingData = new AdvertisingDataBuilder([cyclingSpeedCadenceService.uuid], cscAppearance, peripheralName)

      bleno.startAdvertisingWithEIRData(
        advertisingData.buildAppearanceData(),
        advertisingData.buildScanData(),
        (error) => {
          if (error) log.error(error)
        }
      )
    } else {
      bleno.stopAdvertising()
    }
  }

  function notifyData (type, data) {
    if (type === 'strokeFinished' || type === 'metricsUpdate') {
      cyclingSpeedCadenceService.notifyData(data)
    }
  }

  // CSC does not have status characteristic
  function notifyStatus (status) {
  }

  return {
    triggerAdvertising,
    notifyData,
    notifyStatus,
    destroy
  }
}

export { createCscPeripheral }
