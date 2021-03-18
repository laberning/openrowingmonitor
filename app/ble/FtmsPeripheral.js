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
import { EventEmitter } from 'events'
import FitnessMachineService from './ftms/FitnessMachineService.js'
import DeviceInformationService from './ftms/DeviceInformationService.js'
import log from 'loglevel'

function createFtmsPeripheral (options) {
  const emitter = new EventEmitter()

  const peripheralName = options?.simulateIndoorBike ? 'OpenRowingBike' : 'OpenRowingMonitor'
  const fitnessMachineService = new FitnessMachineService(options, controlPointCallback)
  const deviceInformationService = new DeviceInformationService()

  bleno.on('stateChange', (state) => {
    if (state === 'poweredOn') {
      bleno.startAdvertising(
        peripheralName,
        [fitnessMachineService.uuid, deviceInformationService.uuid],
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
  bleno.on('advertisingStop', (event) => {
    log.debug('advertisingStop', event)
  })
  bleno.on('servicesSet', () => {
    log.debug('servicesSet')
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
    emitter.emit('controlPoint', obj)
    return obj.res
  }

  // deliver current rowing metrics via BLE
  function notifyData (data) {
    fitnessMachineService.notifyData(data)
  }

  // deliver a status change via BLE
  function notifyStatus (status) {
    fitnessMachineService.notifyStatus(status)
  }

  return Object.assign(emitter, {
    notifyData,
    notifyStatus
  })
}

export { createFtmsPeripheral }
