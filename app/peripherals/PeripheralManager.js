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

const modes = ['FTMS', 'FTMSBIKE', 'PM5', 'CSC', 'CPS']
function createPeripheralManager () {
  const emitter = new EventEmitter()
  let peripheral
  let mode

  createPeripheral(config.bluetoothMode)

  function getPeripheral () {
    return peripheral
  }

  function getPeripheralMode () {
    return mode
  }

  function switchPeripheralMode (newMode) {
    // if now mode was passed, select the next one from the list
    if (newMode === undefined) {
      newMode = modes[(modes.indexOf(mode) + 1) % modes.length]
    }
    createPeripheral(newMode)
  }

  function notifyMetrics (type, metrics) {
    peripheral.notifyData(type, metrics)
  }

  function notifyStatus (status) {
    peripheral.notifyStatus(status)
  }

  async function createPeripheral (newMode) {
    if (peripheral) {
      await peripheral.destroy()
    }

    switch (newMode) {
      case 'PM5':
        log.info('bluetooth profile: Concept2 PM5')
        peripheral = createPm5Peripheral(controlCallback)
        mode = 'PM5'
        break

      case 'FTMSBIKE':
        log.info('bluetooth profile: FTMS Indoor Bike')
        peripheral = createFtmsPeripheral(controlCallback, {
          simulateIndoorBike: true
        })
        mode = 'FTMSBIKE'
        break
      case 'CSC':
        log.info('bluetooth profile: Cycling Speed and Cadence')
        peripheral = createCscPeripheral()
        mode = 'CSC'
        break
      case 'CPS':
        log.info('bluetooth profile: Cycling Power Meter')
        peripheral = createCpsPeripheral()
        mode = 'CPS'
        break

      case 'FTMS':
      default:
        log.info('bluetooth profile: FTMS Rower')
        peripheral = createFtmsPeripheral(controlCallback, {
          simulateIndoorBike: false
        })
        mode = 'FTMS'
        break
    }
    peripheral.triggerAdvertising()

    emitter.emit('control', {
      req: {
        name: 'peripheralMode',
        peripheralMode: mode
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
    getPeripheral,
    getPeripheralMode,
    switchPeripheralMode,
    notifyMetrics,
    notifyStatus
  })
}

export { createPeripheralManager }
