'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  The Control service can be used to send control commands to the PM5 device
  ToDo: not yet wired
*/
import NodeBleHost from 'ble-host'
import loglevel from 'loglevel'

import { GattService } from '../../BleManager.js'

import { toC2128BitUUID } from '../Pm5Constants.js'

const log = loglevel.getLogger('Peripherals')

export class Pm5HeartRateControlService extends GattService {
  /**
   * @type {HeartRateMeasurementEvent}
   */
  #heartRateMeasurementEvent = {
    rrIntervals: []
  }

  #lastBeatTime = 0
  #lastBeatCount = 0

  constructor () {
    super({
      name: 'Control Service',
      uuid: toC2128BitUUID('0040'),
      characteristics: [
        {
          uuid: toC2128BitUUID('0041'),
          properties: ['write', 'write-without-response'],
          onWrite: (_connection, needsResponse, data, callback) => {
            log.debug('PM5 Heart Rate Received is called:', data)

            this.#onWrite(data)

            if (needsResponse) {
              callback(NodeBleHost.AttErrors.SUCCESS) // actually only needs to be called when needsResponse is true
            }
          }
        }
      ]
    })
  }

  /**
   * @param {Buffer} data
   */
  #onWrite (data) {
    // Bluetooth
    if (data.readUint8(0) === 0) {
      // Energy Expended Lo, (BT HRM value)
      // Energy Expended Hi,
      this.#heartRateMeasurementEvent.energyExpended = data.readUint16LE(1)

      // RR Interval Lo, (BT HRM value)
      // RR Interval Hi,
      this.#heartRateMeasurementEvent.rrIntervals = [data.readUint16LE(3)]
      // HR Value Lo, (BT HRM value)
      // HR Value Hi,
      this.#heartRateMeasurementEvent.heartrate = data.readUint16LE(5)
      // Status Flags, (BT HRM value)
      const flags = data.readUint8(6)
      const hasSensorContact = Boolean(flags >> 1 & 0x01) // Checking bits 1 and 2 (sensor contact)
      const isSensorContactSupported = Boolean(flags >> 2 & 0x01) // Checking bits 1 and 2 (sensor contact)
      this.#heartRateMeasurementEvent.hasContact = isSensorContactSupported ? hasSensorContact : undefined
    }

    if (data.readUint8(0) === 1) {
      // HR Measurement Lo, (ANT HRM value)
      // HR Measurement Hi,
      const beatTime = data.readUint16LE(1)
      // Heart Beat Count (ANT HRM value)
      const beatCount = data.readUint8(3)
      // HR (ANT HRM value)
      this.#heartRateMeasurementEvent.heartrate = data.readUint8(4)

      this.#heartRateMeasurementEvent.rrIntervals = []
      if (beatCount - this.#lastBeatCount === 1) {
        const beatTimeDiff = this.#lastBeatCount > beatTime ? 65535 - (this.#lastBeatTime - beatTime) : beatTime - this.#lastBeatTime

        this.#heartRateMeasurementEvent.rrIntervals = [Math.round(beatTimeDiff / 1024 * 1000) / 1000]
      }

      this.#lastBeatCount = beatCount
      this.#lastBeatTime = beatTime
    }

    // Spare_0,
    // Spare_1,
    // Spare_2,
    // Spare_3,
    // Spare_4,
    // Spare_5,
    // Spare_6,
    // Spare_7
  }
}
