'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  The connected Central can remotly control some parameters or our rowing monitor via this Control Point

  So far tested on:
    - Fulgaz: uses setIndoorBikeSimulationParameters
    - Zwift: uses startOrResume and setIndoorBikeSimulationParameters
*/
import bleno from '@abandonware/bleno'
import log from 'loglevel'
import { ResultOpCode } from '../common/CommonOpCodes.js'

// see https://www.bluetooth.com/specifications/specs/fitness-machine-service-1-0 for details
const ControlPointOpCode = {
  requestControl: 0x00,
  reset: 0x01,
  setTargetSpeed: 0x02,
  setTargetInclincation: 0x03,
  setTargetResistanceLevel: 0x04,
  setTargetPower: 0x05,
  setTargetHeartRate: 0x06,
  startOrResume: 0x07,
  stopOrPause: 0x08,
  setTargetedExpendedEnergy: 0x09,
  setTargetedNumberOfSteps: 0x0A,
  setTargetedNumberOfStrides: 0x0B,
  setTargetedDistance: 0x0C,
  setTargetedTrainingTime: 0x0D,
  setTargetedTimeInTwoHeartRateZones: 0x0E,
  setTargetedTimeInThreeHeartRateZones: 0x0F,
  setTargetedTimeInFiveHeartRateZones: 0x10,
  setIndoorBikeSimulationParameters: 0x11,
  setWheelCircumference: 0x12,
  spinDownControl: 0x13,
  setTargetedCadence: 0x14,
  responseCode: 0x80
}

export default class FitnessMachineControlPointCharacteristic extends bleno.Characteristic {
  constructor (controlPointCallback) {
    super({
      // Fitness Machine Control Point
      uuid: '2AD9',
      value: null,
      properties: ['write']
    })

    this.controlled = false
    if (!controlPointCallback) { throw new Error('controlPointCallback required') }
    this.controlPointCallback = controlPointCallback
  }

  // Central sends a command to the Control Point
  // todo: handle offset and withoutResponse properly
  onWriteRequest (data, offset, withoutResponse, callback) {
    const opCode = data.readUInt8(0)
    switch (opCode) {
      case ControlPointOpCode.requestControl:
        if (!this.controlled) {
          if (this.controlPointCallback({ name: 'requestControl' })) {
            log.debug('requestControl sucessful')
            this.controlled = true
            callback(this.buildResponse(opCode, ResultOpCode.success))
          } else {
            callback(this.buildResponse(opCode, ResultOpCode.operationFailed))
          }
        } else {
          callback(this.buildResponse(opCode, ResultOpCode.controlNotPermitted))
        }
        break

      case ControlPointOpCode.reset:
        this.handleSimpleCommand(ControlPointOpCode.reset, 'reset', callback)
        // as per spec the reset command shall also reset the control
        this.controlled = false
        break

      case ControlPointOpCode.startOrResume:
        this.handleSimpleCommand(ControlPointOpCode.startOrResume, 'startOrResume', callback)
        break

      case ControlPointOpCode.stopOrPause: {
        const controlParameter = data.readUInt8(1)
        if (controlParameter === 1) {
          this.handleSimpleCommand(ControlPointOpCode.stopOrPause, 'stop', callback)
        } else if (controlParameter === 2) {
          this.handleSimpleCommand(ControlPointOpCode.stopOrPause, 'pause', callback)
        } else {
          log.error(`stopOrPause with invalid controlParameter: ${controlParameter}`)
        }
        break
      }

      // todo: Most tested bike apps use these to simulate a bike ride. Not sure how we can use these in our rower
      // since there is no adjustable resistance on the rowing machine
      case ControlPointOpCode.setIndoorBikeSimulationParameters: {
        const windspeed = data.readInt16LE(1) * 0.001
        const grade = data.readInt16LE(3) * 0.01
        const crr = data.readUInt8(5) * 0.0001
        const cw = data.readUInt8(6) * 0.01
        if (this.controlPointCallback({ name: 'setIndoorBikeSimulationParameters', value: { windspeed, grade, crr, cw } })) {
          callback(this.buildResponse(opCode, ResultOpCode.success))
        } else {
          callback(this.buildResponse(opCode, ResultOpCode.operationFailed))
        }
        break
      }

      default:
        log.info(`opCode ${opCode} is not supported`)
        callback(this.buildResponse(opCode, ResultOpCode.opCodeNotSupported))
    }
  }

  handleSimpleCommand (opCode, opName, callback) {
    if (this.controlled) {
      if (this.controlPointCallback({ name: opName })) {
        const response = this.buildResponse(opCode, ResultOpCode.success)
        callback(response)
      } else {
        callback(this.buildResponse(opCode, ResultOpCode.operationFailed))
      }
    } else {
      log.info(`initating command '${opName}' requires 'requestControl'`)
      callback(this.buildResponse(opCode, ResultOpCode.controlNotPermitted))
    }
  }

  // build the response message as defined by the spec
  buildResponse (opCode, resultCode) {
    const buffer = Buffer.alloc(3)
    buffer.writeUInt8(0x80, 0)
    buffer.writeUInt8(opCode, 1)
    buffer.writeUInt8(resultCode, 2)
    return buffer
  }
}
