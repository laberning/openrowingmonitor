'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
import EventEmitter from 'node:events'

import { BleManager } from 'ble-host'
import logger from 'loglevel'

import { toBLEStandard128BitUUID } from '../BleManager.js'

/**
 * @typedef {import('../ble-host.interface.js').Connection} Connection
 * @typedef {import('../ble-host.interface.js').Scanner} Scanner
 * @typedef {import('../ble-host.interface.js').GattClientCharacteristic} GattClientCharacteristic
 */

const log = logger.getLogger('Peripherals')

const heartRateServiceUUID = toBLEStandard128BitUUID('180D')
const heartRateMeasurementUUID = toBLEStandard128BitUUID('2A37')

const batteryLevelServiceUUID = toBLEStandard128BitUUID('180F')
const batteryLevelMeasurementUUID = toBLEStandard128BitUUID('2A19')

const deviceInformationServiceUUID = toBLEStandard128BitUUID('180A')
const manufacturerIdUUID = toBLEStandard128BitUUID('2A29')
const serialNumberUUID = toBLEStandard128BitUUID('2A25')

/**
 * @event HrmService#heartRateMeasurement
 * @extends {EventEmitter<{heartRateMeasurement: Array<HeartRateMeasurementEvent>}>}
 */
export class HrmService extends EventEmitter {
  #manager
  /**
   * @type {Scanner | undefined}
   */
  #scanner
  /**
   * @type {Connection | undefined}
   */
  #connection
  /**
   * @type {import('../ble-host.interface.js').GattClientCharacteristic | undefined}
   */
  #heartRateMeasurementCharacteristic
  /**
   * @type {import('../ble-host.interface.js').GattClientCharacteristic | undefined}
   */
  #batteryLevelCharacteristic
  /**
   * @type {number | undefined}
   */
  #batteryLevel
  /**
   * @type {number | undefined}
   */
  #energyExpended
  /**
   * @type {Array<number>}
   */
  #rrIntervals = []
  /**
   * @type {number | string | undefined}
   */
  #manufacturerId
  /**
   * @type {number | string | undefined}
   */
  #serialNumber

  /**
   * @param {import('../ble-host.interface.js').BleManager} manager
   */
  constructor (manager) {
    super()
    this.#manager = manager
  }

  /* eslint-disable max-statements -- This initialises the BLE HRM handler */
  async start () {
    this.#scanner = this.#manager.startScan({
      scanFilters: [new BleManager.ServiceUUIDScanFilter(heartRateServiceUUID)]
    })
    this.#connection = undefined
    this.#heartRateMeasurementCharacteristic?.removeAllListeners()
    this.#batteryLevelCharacteristic?.removeAllListeners()

    const device = await new Promise((resolve) => {
      /** @type {Scanner} */(this.#scanner).on('report', (eventData) => {
        if (eventData.connectable) {
          resolve(eventData)
        }
      })
    })

    log.info(`Found device (${device.parsedDataItems.localName || 'no name'})`)

    this.#scanner.removeAllListeners()
    this.#scanner.stopScan()

    this.#connection = await new Promise((/** @type {(value: Connection) => void} */resolve) => {
      this.#manager.connect(device.addressType, device.address, {}, (connection) => {
        resolve(connection)
      })
    })

    this.#connection.once('disconnect', () => {
      log.debug(`Disconnected from ${this.#connection?.peerAddress}, restart scanning`)

      this.start()
    })

    log.debug('Connected to ' + this.#connection.peerAddress)
    const primaryServices = await new Promise((/** @type {(value: Array<import('../ble-host.interface.js').GattClientService>) => void} */resolve, reject) => {
      if (this.#connection === undefined) {
        reject(new Error('Connection has been disposed'))

        return
      }

      this.#connection.gatt.discoverAllPrimaryServices((services) => {
        if (services.length === 0) {
          reject(new Error('No heart rate services was found'))
        }
        resolve(services)
      })
    })

    const deviceInformationService = primaryServices.find(service => service.uuid === deviceInformationServiceUUID)
    if (deviceInformationService !== undefined) {
      log.debug('HR device information service was discovered')
      const characteristics = await new Promise((/** @type {(value: { serialNumber?: GattClientCharacteristic, manufacturerId?: GattClientCharacteristic}) => void} */resolve) => {
        deviceInformationService.discoverCharacteristics((characteristics) => {
          resolve({
            serialNumber: characteristics.find(characteristic => characteristic.uuid === serialNumberUUID), manufacturerId: characteristics.find(characteristic => characteristic.uuid === manufacturerIdUUID)
          })
        })
      })

      this.#manufacturerId = await new Promise((resolve) => {
        if (characteristics.manufacturerId === undefined) {
          resolve(undefined)

          return
        }

        characteristics.manufacturerId.read((_errorCode, data) => {
          resolve(data?.toString())
        })
      })

      this.#serialNumber = await new Promise((resolve) => {
        if (characteristics.serialNumber === undefined) {
          resolve(undefined)

          return
        }

        characteristics.serialNumber.read((_errorCode, data) => {
          resolve(data?.toString())
        })
      })
    }

    const heartRateService = primaryServices.find(service => service.uuid === heartRateServiceUUID)
    if (heartRateService === undefined) {
      log.error(`Heart rate service not found in ${device.localName}`)

      this.start()

      return
    }

    this.#heartRateMeasurementCharacteristic = await new Promise((resolve) => {
      heartRateService.discoverCharacteristics((characteristics) => {
        resolve(characteristics.find(characteristic => characteristic.uuid === heartRateMeasurementUUID))
      })
    })

    if (this.#heartRateMeasurementCharacteristic === undefined) {
      log.error(`Heart rate measurement characteristic not found in ${device.localName}`)

      this.start()

      return
    }

    this.#heartRateMeasurementCharacteristic.writeCCCD(/* enableNotifications */ true, /* enableIndications */ false)
    this.#heartRateMeasurementCharacteristic.on('change', (value) => {
      log.debug('New heart rate value:', value)
      this.#onHeartRateNotify(value)
    })

    const batteryService = primaryServices.find(service => service.uuid === batteryLevelServiceUUID)
    if (batteryService === undefined) {
      log.info(`Battery service not found in ${device.localName}`)

      return
    }

    this.#batteryLevelCharacteristic = await new Promise((resolve) => {
      batteryService.discoverCharacteristics((characteristics) => {
        resolve(characteristics.find(characteristic => characteristic.uuid === batteryLevelMeasurementUUID))
      })
    })

    if (this.#batteryLevelCharacteristic === undefined) {
      log.error(`Battery level characteristic not found in ${device.localName}`)

      return
    }

    this.#batteryLevel = await new Promise((resolve) => {
      if (this.#batteryLevelCharacteristic === undefined) {
        resolve(0)

        return
      }

      this.#batteryLevelCharacteristic.read((_errorCode, data) => resolve(data ? data.readUInt8(0) : 0))
    })
    this.#batteryLevelCharacteristic.writeCCCD(/* enableNotifications */ true, /* enableIndications */ false)
    this.#batteryLevelCharacteristic.on('change', (level) => {
      log.debug('New battery level value:', level)
      this.#onBatteryNotify(level)
    })
  }

  stop () {
    this.#batteryLevelCharacteristic?.removeAllListeners()
    this.#heartRateMeasurementCharacteristic?.removeAllListeners()
    this.#scanner?.stopScan()
    return new Promise((/** @type {(value: void) => void} */resolve) => {
      log.debug('Shutting down HRM peripheral')
      if (this.#connection !== undefined) {
        log.debug('Terminating current HRM connection')
        this.#connection.removeAllListeners()
        this.#connection.once('disconnect', resolve)
        this.#connection.disconnect()

        return
      }
      resolve()
    })
  }

  /**
   * @param {Buffer} data
   */
  #onHeartRateNotify (data) {
    if (!Buffer.isBuffer(data) || data.length === 0) {
      log.error('Received invalid heart rate data, ignoring')

      return
    }
    const flags = data.readUInt8(0)
    // bits of the feature flag:
    // 0: Heart Rate Value Format
    // 1 + 2: Sensor Contact Status
    // 3: Energy Expended Status
    // 4: RR-Interval
    const is16BitHeartRate = Boolean(flags >> 0 & 0x01) // Checking the first bit
    const hasSensorContact = Boolean(flags >> 1 & 0x01) // Checking bits 1 and 2 (sensor contact)
    const isSensorContactSupported = Boolean(flags >> 2 & 0x01) // Checking bits 1 and 2 (sensor contact)
    const hasEnergyExpended = Boolean(flags >> 3 & 0x01) // Checking bit 3 (energy expended)
    const hasRRInterval = Boolean(flags >> 4 & 0x01) // Checking bit 4 (RR interval)

    // from the specs:
    // While most human applications require support for only 255 bpm or less, special
    // applications (e.g. animals) may require support for higher bpm values.
    // If the Heart Rate Measurement Value is less than or equal to 255 bpm a UINT8 format
    // should be used for power savings.
    // If the Heart Rate Measurement Value exceeds 255 bpm a UINT16 format shall be used.
    const heartrate = is16BitHeartRate ? data.readUInt16LE(1) : data.readUInt8(1)
    let offsetStart = is16BitHeartRate ? 1 : 2

    // Energy Expended (if present)
    if (hasEnergyExpended) {
      this.#energyExpended = data.readUInt16LE(offsetStart)
      offsetStart += 2
    }

    // RR Intervals (if present)
    this.#rrIntervals = []
    if (hasRRInterval) {
      while (offsetStart < data.length) {
        this.#rrIntervals.push(Math.round(data.readUInt16LE(offsetStart) / 1024 * 1000) / 1000) // Convert to seconds
        offsetStart += 2
      }
    }

    this.emit('heartRateMeasurement', {
      heartrate,
      rrIntervals: this.#rrIntervals,
      energyExpended: this.#energyExpended,
      batteryLevel: this.#batteryLevel,
      manufacturerId: this.#manufacturerId,
      serialNumber: this.#serialNumber,
      hasContact: isSensorContactSupported ? hasSensorContact : undefined
    })
  }

  /**
   * @param {Buffer} data
   */
  #onBatteryNotify (data) {
    if (Buffer.isBuffer(data) && data.length > 0) {
      this.#batteryLevel = data.readUInt8(0)
    }
  }
}
