'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Creates a Bluetooth Low Energy (BLE) Peripheral with all the Services that are required for
  a Fitness Machine Device

  Relevant parts from https://www.bluetooth.com/specifications/specs/fitness-machine-profile-1-0/
  The Fitness Machine shall instantiate one and only one Fitness Machine Service as Primary Service
  The User Data Service, if supported, shall be instantiated as a Primary Service.
  The Fitness Machine may instantiate the Device Information Service
  (Manufacturer Name String, Model Number String)
*/
import bleno from '@abandonware/bleno'
import FitnessMachineService from './ftms/FitnessMachineService.js'
import config from '../../tools/ConfigManager.js'
import log from 'loglevel'
import DeviceInformationService from './common/DeviceInformationService.js'
import AdvertisingDataBuilder from './common/AdvertisingDataBuilder.js'

function createFtmsPeripheral (controlCallback, options) {
  const peripheralName = options?.simulateIndoorBike ? config.ftmsBikePeripheralName : config.ftmsRowerPeripheralName
  const fitnessMachineService = new FitnessMachineService(options, controlPointCallback)
  const deviceInformationService = new DeviceInformationService()

  bleno.on('stateChange', (state) => {
    triggerAdvertising(state)
  })

  bleno.on('advertisingStart', (error) => {
    if (!error) {
      bleno.setServices(
        [fitnessMachineService, deviceInformationService],
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

  function controlPointCallback (event) {
    const obj = {
      req: event,
      res: {}
    }
    if (controlCallback) controlCallback(obj)
    return obj.res
  }

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
      const advertisingBuilder = new AdvertisingDataBuilder([fitnessMachineService.uuid])
      advertisingBuilder.setShortName(peripheralName)
      advertisingBuilder.setLongName(peripheralName)

      bleno.startAdvertisingWithEIRData(
        advertisingBuilder.buildAppearanceData(),
        advertisingBuilder.buildScanData(),
        (error) => {
          if (error) log.error(error)
        }
      )
    } else {
      bleno.stopAdvertising()
    }
  }

  // present current rowing metrics to FTMS central
  function notifyData (type, data) {
    if (type === 'strokeFinished' || type === 'metricsUpdate') {
      fitnessMachineService.notifyData(data)
    }
  }

  // present current rowing status to FTMS central
  function notifyStatus (status) {
    fitnessMachineService.notifyStatus(status)
  }

  return {
    triggerAdvertising,
    notifyData,
    notifyStatus,
    destroy
  }
}

export { createFtmsPeripheral }
