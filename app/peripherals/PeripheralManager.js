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
import AntManager from './ant/AntManager.js'
import { createAntHrmPeripheral } from './ant/HrmPeripheral.js'
import { createBleHrmPeripheral } from './ble/HrmPeripheral.js'
import { createFEPeripheral } from './ant/FEPeripheral.js'

const bleModes = ['FTMS', 'FTMSBIKE', 'PM5', 'CSC', 'CPS', 'OFF']
const antModes = ['FE', 'OFF']
const hrmModes = ['ANT', 'BLE', 'OFF']
function createPeripheralManager () {
  const emitter = new EventEmitter()
  let _antManager
  let blePeripheral
  let bleMode

  let antPeripheral
  let antMode

  let hrmPeripheral
  let hrmMode

  createBlePeripheral(config.bluetoothMode)
  createHrmPeripheral(config.heartRateMode)
  createAntPeripheral(config.antplusMode)

  function getBlePeripheral () {
    return blePeripheral
  }

  function getBlePeripheralMode () {
    return bleMode
  }

  function getAntPeripheral () {
    return antPeripheral
  }

  function getAntPeripheralMode () {
    return antMode
  }

  function getHrmPeripheral () {
    return hrmPeripheral
  }

  function getHrmPeripheralMode () {
    return hrmMode
  }

  function switchBlePeripheralMode (newMode) {
    // if now mode was passed, select the next one from the list
    if (newMode === undefined) {
      newMode = bleModes[(bleModes.indexOf(bleMode) + 1) % bleModes.length]
    }
    createBlePeripheral(newMode)
  }

  function notifyMetrics (type, metrics) {
    if (bleMode !== 'OFF') { blePeripheral.notifyData(type, metrics) }
    if (antMode !== 'OFF') { antPeripheral.notifyData(type, metrics) }
  }

  function notifyStatus (status) {
    if (bleMode !== 'OFF') { blePeripheral.notifyStatus(status) }
    if (antMode !== 'OFF') { antPeripheral.notifyStatus(status) }
  }

  async function createBlePeripheral (newMode) {
    if (blePeripheral) {
      await blePeripheral.destroy()
      blePeripheral = undefined
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

  function switchAntPeripheralMode (newMode) {
    if (newMode === undefined) {
      newMode = antModes[(antModes.indexOf(antMode) + 1) % antModes.length]
    }
    createAntPeripheral(newMode)
  }

  async function createAntPeripheral (newMode) {
    if (antPeripheral) {
      await antPeripheral.destroy()
      antPeripheral = undefined

      if (_antManager && hrmMode !== 'ANT' && newMode === 'OFF') { await _antManager.closeAntStick() }
    }

    switch (newMode) {
      case 'FE':
        log.info('ant plus profile: FE')
        if (!_antManager) {
          _antManager = new AntManager()
        }

        antPeripheral = createFEPeripheral(_antManager)
        antMode = 'FE'
        await antPeripheral.attach()
        break

      default:
        log.info('ant plus profile: Off')
        antMode = 'OFF'
    }

    emitter.emit('control', {
      req: {
        name: 'antPeripheralMode',
        peripheralMode: antMode
      }
    })
  }

  function switchHrmMode (newMode) {
    if (newMode === undefined) {
      newMode = hrmModes[(hrmModes.indexOf(hrmMode) + 1) % hrmModes.length]
    }
    createHrmPeripheral(newMode)
  }

  async function createHrmPeripheral (newMode) {
    if (hrmPeripheral) {
      await hrmPeripheral.destroy()
      hrmPeripheral.removeAllListeners()
      hrmPeripheral = undefined
      if (_antManager && newMode !== 'ANT' && antMode === 'OFF') { await _antManager.closeAntStick() }
    }

    switch (newMode) {
      case 'ANT':
        log.info('heart rate profile: ANT')
        if (!_antManager) {
          _antManager = new AntManager()
        }

        hrmPeripheral = createAntHrmPeripheral(_antManager)
        hrmMode = 'ANT'
        await hrmPeripheral.attach()
        break

      case 'BLE':
        log.info('heart rate profile: BLE')
        hrmPeripheral = createBleHrmPeripheral()
        hrmMode = 'BLE'
        break

      default:
        log.info('heart rate profile: Off')
        hrmMode = 'OFF'
    }

    if (hrmMode.toLocaleLowerCase() !== 'OFF'.toLocaleLowerCase()) {
      hrmPeripheral.on('heartRateMeasurement', (heartRateMeasurement) => {
        emitter.emit('heartRateMeasurement', heartRateMeasurement)
      })
    }

    emitter.emit('control', {
      req: {
        name: 'hrmPeripheralMode',
        peripheralMode: hrmMode
      }
    })
  }

  function controlCallback (event) {
    emitter.emit('control', event)
  }

  return Object.assign(emitter, {
    getBlePeripheral,
    getBlePeripheralMode,
    getAntPeripheral,
    getAntPeripheralMode,
    getHrmPeripheral,
    getHrmPeripheralMode,
    switchHrmMode,
    switchBlePeripheralMode,
    switchAntPeripheralMode,
    notifyMetrics,
    notifyStatus
  })
}

export { createPeripheralManager }
