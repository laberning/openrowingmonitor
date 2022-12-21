'use strict'

import log from 'loglevel'
import { Messages } from 'incyclist-ant-plus'
import { PeripheralConstants } from '../PeripheralConstants.js'

/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Creates a Bluetooth Low Energy (BLE) Peripheral with all the Services that are required for
  a Cycling Speed and Cadence Profile
*/

function createFEPeripheral (antManager) {
  const antStick = antManager.getAntStick()
  const deviceType = 0x11 // Ant FE-C device
  const deviceNumber = 1
  const deviceId = parseInt(PeripheralConstants.serial, 10) & 0xFFFF
  const channel = 1
  const broadcastPeriod = 8192 // 8192/32768 ~4hz
  const broadcastInterval = broadcastPeriod / 32768 * 1000 // millisecond
  const rfChannel = 57 // 2457 MHz
  let dataPageCount = 0
  let commonPageCount = 0
  let timer

  let sessionData = {
    accumulatedStrokes: 0,
    accumulatedDistance: 0,
    accumulatedTime: 0,
    accumulatedPower: 0,
    cycleLinearVelocity: 0,
    strokeRate: 0,
    instantaneousPower: 0,
    distancePerStroke: 0,
    fitnessEquipmentState: fitnessEquipmentStates.inUse,
    sessionStatus: 'WaitingForStart'
  }

  async function attach () {
    if (!antManager.isStickOpen()) { await antManager.openAntStick() }

    const messages = [
      Messages.assignChannel(channel, 'transmit'),
      Messages.setDevice(channel, deviceId, deviceType, deviceNumber),
      Messages.setFrequency(channel, rfChannel),
      Messages.setPeriod(channel, broadcastPeriod),
      Messages.openChannel(channel)
    ]

    log.info(`ANT+ FE server start [deviceId=${deviceId} channel=${channel}]`)
    for (const message of messages) {
      antStick.write(message)
    }

    timer = setInterval(onBroadcastInterval, broadcastInterval)
  }

  function destroy () {
    return new Promise((resolve) => {
      clearInterval(timer)
      log.info(`ANT+ FE server stopped [deviceId=${deviceId} channel=${channel}]`)

      const messages = [
        Messages.closeChannel(channel),
        Messages.unassignChannel(channel)
      ]
      for (const message of messages) {
        antStick.write(message)
      }
      resolve()
    })
  }

  function onBroadcastInterval () {
    dataPageCount++
    let data

    switch (true) {
      case dataPageCount === 65 || dataPageCount === 66:
        if (commonPageCount % 2 === 0) { // 0x50 - Common Page for Manufacturers Identification (approx twice a minute)
          data = [
            channel,
            0x50, // Page 80
            0xFF, // Reserved
            0xFF, // Reserved
            parseInt(PeripheralConstants.hardwareRevision, 10) & 0xFF, // Hardware Revision
            ...Messages.intToLEHexArray(40, 2), // Manufacturer ID (value 255 = Development ID, value 40 = concept2)
            0x0001 // Model Number
          ]
        }
        if (commonPageCount % 2 === 1) { // 0x51 - Common Page for Product Information (approx twice a minute)
          data = [
            channel,
            0x51, // Page 81
            0xFF, // Reserved
            parseInt(PeripheralConstants.firmwareRevision.slice(-2), 10), // SW Revision (Supplemental)
            parseInt(PeripheralConstants.firmwareRevision[0], 10), // SW Version
            ...Messages.intToLEHexArray(parseInt(PeripheralConstants.serial, 10), 4) // Serial Number (None)
          ]
        }

        if (dataPageCount === 66) {
          commonPageCount++
          dataPageCount = 0
        }
        break
      case dataPageCount % 8 === 4: // 0x11 - General Settings Page (once a second)
      case dataPageCount % 8 === 7:
        data = [
          channel,
          0x11, // Page 17
          0xFF, // Reserved
          0xFF, // Reserved
          ...Messages.intToLEHexArray(sessionData.distancePerStroke, 1), // Stroke Length in 0.01 m
          0x7FFF, // Incline (Not Used)
          0x00, // Resistance (DF may be reported if conversion to the % is worked out (value in % with a resolution of 0.5%).
          ...Messages.intToLEHexArray(feCapabilitiesBitField, 1)
        ]
        if (sessionData.sessionStatus === 'Rowing') {
          log.debug(`Page 17 Data Sent. Event=${dataPageCount}. Stroke Length=${sessionData.distancePerStroke}.`)
          log.debug(`Hex Stroke Length=0x${sessionData.distancePerStroke.toString(16)}.`)
        }
        break
      case dataPageCount % 8 === 3: // 0x16 - Specific Rower Data (once a second)
      case dataPageCount % 8 === 0:
        data = [
          channel,
          0x16, // Page 22
          0xFF, // Reserved
          0xFF, // Reserved
          ...Messages.intToLEHexArray(sessionData.accumulatedStrokes, 1), // Stroke Count
          ...Messages.intToLEHexArray(sessionData.strokeRate, 1), // Cadence / Stroke Rate
          ...Messages.intToLEHexArray(sessionData.instantaneousPower, 2), // Instant Power (2 bytes)
          ...Messages.intToLEHexArray((sessionData.fitnessEquipmentState + rowingCapabilitiesBitField), 1)
        ]
        if (sessionData.sessionStatus === 'Rowing') {
          log.debug(`Page 22 Data Sent. Event=${dataPageCount}. Strokes=${sessionData.accumulatedStrokes}. Stroke Rate=${sessionData.strokeRate}. Power=${sessionData.instantaneousPower}`)
          log.debug(`Hex Strokes=0x${sessionData.accumulatedStrokes.toString(16)}. Hex Stroke Rate=0x${sessionData.strokeRate.toString(16)}. Hex Power=0x${Messages.intToLEHexArray(sessionData.instantaneousPower, 2)}.`)
        }
        break
      case dataPageCount % 4 === 2: // 0x10 - General FE Data (twice a second)
      default:
        data = [
          channel,
          0x10, // Page 16
          0x16, // Rowing Machine (22)
          ...Messages.intToLEHexArray(sessionData.accumulatedTime, 1), // elapsed time
          ...Messages.intToLEHexArray(sessionData.accumulatedDistance, 1), // distance travelled
          ...Messages.intToLEHexArray(sessionData.cycleLinearVelocity, 2), // speed in 0.001 m/s
          0xFF, // heart rate not being sent
          ...Messages.intToLEHexArray((sessionData.fitnessEquipmentState + feCapabilitiesBitField), 1)
        ]
        if (sessionData.sessionStatus === 'Rowing') {
          log.debug(`Page 16 Data Sent. Event=${dataPageCount}. Time=${sessionData.accumulatedTime}. Distance=${sessionData.accumulatedDistance}. Speed=${sessionData.cycleLinearVelocity}.`)
          log.debug(`Hex Time=0x${sessionData.accumulatedTime.toString(16)}. Hex Distance=0x${sessionData.accumulatedDistance.toString(16)}. Hex Speed=0x${Messages.intToLEHexArray(sessionData.cycleLinearVelocity, 2)}.`)
        }
        break
    }

    const message = Messages.broadcastData(data)
    antStick.write(message)
  }

  function notifyData (type, data) {
    if (type === 'strokeFinished' || type === 'metricsUpdate') {
      sessionData = {
        ...sessionData,
        accumulatedDistance: data.totalLinearDistance & 0xFF,
        accumulatedStrokes: data.totalNumberOfStrokes & 0xFF,
        accumulatedTime: Math.trunc(data.totalMovingTime * 4) & 0xFF,
        cycleLinearVelocity: Math.round(data.cycleLinearVelocity * 1000),
        strokeRate: Math.round(data.cycleStrokeRate) & 0xFF,
        instantaneousPower: Math.round(data.cyclePower) & 0xFFFF,
        distancePerStroke: Math.round(data.cycleDistance * 100),
        sessionStatus: data.sessionStatus
      }
    }
  }

  // FE does not have status characteristic
  function notifyStatus (status) {
  }

  return {
    notifyData,
    notifyStatus,
    attach,
    destroy
  }
}

const fitnessEquipmentStates = {
  asleep: (1 << 0x04),
  ready: (2 << 0x04),
  inUse: (3 << 0x04),
  finished: (4 << 0x04),
  lapToggleBit: (8 << 0x04)
}

const fitnessEquipmentCapabilities = {
  hrDataSourceHandContactSensors: (0x03 << 0),
  hrDataSourceEmSensors: (0x02 << 0),
  hrDataSourceAntSensors: (0x01 << 0),
  hrDataSourceInvalid: (0x00 << 0),
  distanceTraveledEnabled: (0x01 << 2),
  virtualSpeed: (0x01 << 3),
  realSpeed: (0x00 << 3)
}

const rowingMachineCapabilities = {
  accumulatedStrokesEnabled: (0x01 << 0)
}

const feCapabilitiesBitField = fitnessEquipmentCapabilities.hrDataSourceInvalid | fitnessEquipmentCapabilities.distanceTraveledEnabled | fitnessEquipmentCapabilities.realSpeed
const rowingCapabilitiesBitField = rowingMachineCapabilities.accumulatedStrokesEnabled

export { createFEPeripheral }
