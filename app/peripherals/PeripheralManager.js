'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This manager creates the different Bluetooth Low Energy (BLE) Peripherals and allows
  switching between them
*/
import config from '../tools/ConfigManager.js'
import { createFtmsPeripheral } from './ble/FtmsPeripheral.js'
import { createPm5Peripheral } from './ble/Pm5Peripheral.js'
import log from 'loglevel'
import EventEmitter from 'node:events'
import { createCpsPeripheral } from './ble/CpsPeripheral.js'
import { createCscPeripheral } from './ble/CscPeripheral.js'
import child_process from 'child_process'
import AntManager from './ant/AntManager.js'
import { createAntHrmPeripheral } from './ant/HrmPeripheral.js'

const bleModes = ['FTMS', 'FTMSBIKE', 'PM5', 'CSC', 'CPS', 'OFF']
function createPeripheralManager () {
  const emitter = new EventEmitter()
  let blePeripheral
  let bleMode

  createBlePeripheral(config.bluetoothMode)

  function getBlePeripheral () {
    return blePeripheral
  }

  function getBlePeripheralMode () {
    return bleMode
  }

  function switchBlePeripheralMode (newMode) {
    // if now mode was passed, select the next one from the list
    if (newMode === undefined) {
      newMode = bleModes[(bleModes.indexOf(bleMode) + 1) % bleModes.length]
    }
    createBlePeripheral(newMode)
  }

  function notifyMetrics (type, metrics) {
    blePeripheral.notifyData(type, metrics)
  }

  function notifyStatus (status) {
    blePeripheral.notifyStatus(status)
  }

  async function createBlePeripheral (newMode) {
    if (blePeripheral) {
      await blePeripheral.destroy()
    }

    switch (newMode) {
      case 'PM5':
        log.info('bluetooth profile: Concept2 PM5')
        blePeripheral = createPm5Peripheral(controlCallback)
        bleMode = 'PM5'
        break

      case 'FTMSBIKE':
        log.info('bluetooth profile: FTMS Indoor Bike')
        blePeripheral = createFtmsPeripheral(controlCallback, {
          simulateIndoorBike: true
        })
        bleMode = 'FTMSBIKE'
        break

      case 'CSC':
        log.info('bluetooth profile: Cycling Speed and Cadence')
        blePeripheral = createCscPeripheral()
        bleMode = 'CSC'
        break

      case 'CPS':
        log.info('bluetooth profile: Cycling Power Meter')
        blePeripheral = createCpsPeripheral()
        bleMode = 'CPS'
        break

      case 'FTMS':
        log.info('bluetooth profile: FTMS Rower')
        blePeripheral = createFtmsPeripheral(controlCallback, {
          simulateIndoorBike: false
        })
        bleMode = 'FTMS'
        break

      default:
        log.info('bluetooth profile: Off')
        bleMode = 'OFF'
    }
    if (bleMode.toLocaleLowerCase() !== 'OFF'.toLocaleLowerCase()) { blePeripheral.triggerAdvertising() }

    emitter.emit('control', {
      req: {
        name: 'blePeripheralMode',
        peripheralMode: bleMode
      }
    })
  }

  function startBleHeartRateService () {
    const hrmPeripheral = child_process.fork('./app/peripherals/ble/HrmPeripheral.js')
    hrmPeripheral.on('message', (heartRateMeasurement) => {
      emitter.emit('heartRateBleMeasurement', heartRateMeasurement)
    })
  }

  function startAntHeartRateService () {
    if (!this._antManager) {
      this._antManager = new AntManager()
    }

    const antHrm = createAntHrmPeripheral(this._antManager)

    antHrm.on('heartRateMeasurement', (heartRateMeasurement) => {
      emitter.emit('heartRateAntMeasurement', heartRateMeasurement)
    })
  }

  function controlCallback (event) {
    emitter.emit('control', event)
  }

  return Object.assign(emitter, {
    startAntHeartRateService,
    startBleHeartRateService,
    getBlePeripheral,
    getBlePeripheralMode,
    switchBlePeripheralMode,
    notifyMetrics,
    notifyStatus
  })
}

export { createPeripheralManager }
