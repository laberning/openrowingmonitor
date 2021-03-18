'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Creates a Bluetooth Low Energy (BLE) Peripheral with all the Services that are used by the
  Concept2 PM5 rowing machine.

  see: https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
*/
import bleno from '@abandonware/bleno'
import { EventEmitter } from 'events'
import { constants } from './pm5/Pm5Constants.js'
import DeviceInformationService from './pm5/DeviceInformationService.js'
import GapService from './pm5/GapService.js'
import log from 'loglevel'
import Pm5ControlService from './pm5/Pm5ControlService.js'
import Pm5RowingService from './pm5/Pm5RowingService.js'

function createPm5Peripheral (options) {
  const emitter = new EventEmitter()

  const peripheralName = constants.name
  const deviceInformationService = new DeviceInformationService()
  const gapService = new GapService()
  const controlService = new Pm5ControlService()
  const rowingService = new Pm5RowingService()

  bleno.on('stateChange', (state) => {
    if (state === 'poweredOn') {
      bleno.startAdvertising(
        peripheralName,
        [gapService.uuid],
        (error) => {
          if (error) log.error(error)
        }
      )
    } else {
      bleno.stopAdvertising()
    }
  })

  bleno.on('advertisingStart', (error) => {
    if (!error) {
      bleno.setServices(
        [gapService, deviceInformationService, controlService, rowingService],
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
  bleno.on('advertisingStop', (event) => {
    log.debug('advertisingStop', event)
  })
  bleno.on('servicesSet', (event) => {
    log.debug('servicesSet')
  })
  bleno.on('servicesSetError', (event) => {
    log.debug('servicesSetError', event)
  })
  bleno.on('rssiUpdate', (event) => {
    log.debug('rssiUpdate', event)
  })

  // deliver current rowing metrics via BLE
  function notifyData (data) {
    rowingService.notify(data)
    // fitnessMachineService.notifyData(data)
  }

  // deliver a status change via BLE
  function notifyStatus (status) {
    // fitnessMachineService.notifyStatus(status)
  }

  return Object.assign(emitter, {
    notifyData,
    notifyStatus
  })
}

export { createPm5Peripheral }
