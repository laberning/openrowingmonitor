'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Creates a Bluetooth Low Energy (BLE) Peripheral with all the Services that are used by the
  Concept2 PM5 rowing machine.

  see: https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
*/
import bleno from '@abandonware/bleno'
import { pm5Constants } from './pm5/Pm5Constants.js'
import DeviceInformationService from './pm5/DeviceInformationService.js'
import GapService from './pm5/GapService.js'
import log from 'loglevel'
import Pm5ControlService from './pm5/Pm5ControlService.js'
import Pm5RowingService from './pm5/Pm5RowingService.js'

function createPm5Peripheral (controlCallback, options) {
  const peripheralName = pm5Constants.name
  const deviceInformationService = new DeviceInformationService()
  const gapService = new GapService()
  const controlService = new Pm5ControlService()
  const rowingService = new Pm5RowingService()

  bleno.on('stateChange', (state) => {
    triggerAdvertising(state)
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
  }

  // present current rowing metrics to C2-PM5 central
  function notifyData (type, data) {
    rowingService.notifyData(type, data)
  }

  // present current rowing status to C2-PM5 central
  function notifyStatus (status) {
  }

  return {
    triggerAdvertising,
    notifyData,
    notifyStatus,
    destroy
  }
}

export { createPm5Peripheral }
