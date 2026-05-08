'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Tests for FitnessMachineControlPointCharacteristic FTMS Control Point handling
*/
import * as assert from 'uvu/assert'
import log from 'loglevel'
import { suite } from 'uvu'

import { FitnessMachineControlPointCharacteristic } from './FitnessMachineControlPointCharacteristic.js'
import { ResultOpCode } from '../common/CommonOpCodes.js'

log.setLevel(log.levels.SILENT)

const test = suite('FitnessMachineControlPointCharacteristic')

// OpCodes from FTMS spec
const OpCode = {
  requestControl: 0x00,
  reset: 0x01,
  startOrResume: 0x07,
  stopOrPause: 0x08,
  responseCode: 0x80
}

/**
 * Helper: build a response buffer for assertion comparison
 * @param {number} opCode
 * @param {number} resultCode
 * @returns {Buffer}
 */
function expectedResponse (opCode, resultCode) {
  const buf = Buffer.alloc(3)
  buf.writeUInt8(0x80, 0)
  buf.writeUInt8(opCode, 1)
  buf.writeUInt8(resultCode, 2)
  return buf
}

/**
 * Helper: create a characteristic instance with mocks and call onWrite
 * @param {Function} controlPointCallback
 * @param {Buffer} data
 * @returns {Promise<{indicated: Buffer, callbackArg: number, controlPointCallback: Function}>}
 */
function callOnWrite (controlPointCallback, data) {
  const characteristic = new FitnessMachineControlPointCharacteristic(controlPointCallback)

  let indicated
  let callbackArg
  const mockConnection = {}

  // Inject the indicate mock onto the characteristic descriptor
  characteristic.characteristic.indicate = (_connection, response) => {
    indicated = response
  }

  characteristic.characteristic.onWrite(
    mockConnection,
    false,
    data,
    (result) => { callbackArg = result }
  )

  return { indicated, callbackArg, characteristic }
}

/**
 * Helper: call onWrite after first requesting control
 * @param {Function} controlPointCallback
 * @param {Buffer} data
 * @returns {{indicated: Buffer, callbackArg: number}}
 */
function callOnWriteWithControl (controlPointCallback, data) {
  const characteristic = new FitnessMachineControlPointCharacteristic(controlPointCallback)

  let indicated
  let callbackArg
  const mockConnection = {}

  characteristic.characteristic.indicate = (_connection, response) => {
    indicated = response
  }

  // First request control
  characteristic.characteristic.onWrite(
    mockConnection,
    false,
    Buffer.from([OpCode.requestControl]),
    () => {}
  )

  // Then send the actual command
  characteristic.characteristic.onWrite(
    mockConnection,
    false,
    data,
    (result) => { callbackArg = result }
  )

  return { indicated, callbackArg }
}

// --- requestControl ---

test('requestControl returns success', () => {
  const { indicated } = callOnWrite(() => {}, Buffer.from([OpCode.requestControl]))
  assert.equal(indicated, expectedResponse(OpCode.requestControl, ResultOpCode.success))
})

// --- reset ---

test('reset without prior requestControl returns controlNotPermitted', () => {
  const { indicated } = callOnWrite(() => {}, Buffer.from([OpCode.reset]))
  assert.equal(indicated, expectedResponse(OpCode.reset, ResultOpCode.controlNotPermitted))
})

test('reset with control returns success and calls callback', () => {
  let called = false
  const { indicated } = callOnWriteWithControl(
    (cmd) => { called = true; assert.equal(cmd.req.name, 'reset') },
    Buffer.from([OpCode.reset])
  )
  assert.equal(indicated, expectedResponse(OpCode.reset, ResultOpCode.success))
  assert.ok(called, 'controlPointCallback should have been called')
})

// --- startOrResume ---

test('startOrResume without prior requestControl returns controlNotPermitted', () => {
  const { indicated } = callOnWrite(() => {}, Buffer.from([OpCode.startOrResume]))
  assert.equal(indicated, expectedResponse(OpCode.startOrResume, ResultOpCode.controlNotPermitted))
})

test('startOrResume with control returns success and calls callback', () => {
  let called = false
  const { indicated } = callOnWriteWithControl(
    (cmd) => { called = true; assert.equal(cmd.req.name, 'startOrResume') },
    Buffer.from([OpCode.startOrResume])
  )
  assert.equal(indicated, expectedResponse(OpCode.startOrResume, ResultOpCode.success))
  assert.ok(called, 'controlPointCallback should have been called')
})

// --- stopOrPause ---

test('stopOrPause without prior requestControl returns controlNotPermitted', () => {
  const { indicated } = callOnWrite(() => {}, Buffer.from([OpCode.stopOrPause, 0x01]))
  assert.equal(indicated, expectedResponse(OpCode.stopOrPause, ResultOpCode.controlNotPermitted))
})

test('stopOrPause with control and param=1 (stop) returns success', () => {
  let called = false
  const { indicated } = callOnWriteWithControl(
    (cmd) => { called = true; assert.equal(cmd.req.name, 'stop') },
    Buffer.from([OpCode.stopOrPause, 0x01])
  )
  assert.equal(indicated, expectedResponse(OpCode.stopOrPause, ResultOpCode.success))
  assert.ok(called, 'controlPointCallback should have been called with stop')
})

test('stopOrPause with control and param=2 (pause) returns success', () => {
  let called = false
  const { indicated } = callOnWriteWithControl(
    (cmd) => { called = true; assert.equal(cmd.req.name, 'pause') },
    Buffer.from([OpCode.stopOrPause, 0x02])
  )
  assert.equal(indicated, expectedResponse(OpCode.stopOrPause, ResultOpCode.success))
  assert.ok(called, 'controlPointCallback should have been called with pause')
})

test('stopOrPause with control and invalid param returns invalidParameter', () => {
  const { indicated } = callOnWriteWithControl(() => {}, Buffer.from([OpCode.stopOrPause, 0x05]))
  assert.equal(indicated, expectedResponse(OpCode.stopOrPause, ResultOpCode.invalidParameter))
})

test('stopOrPause with control and missing param byte returns invalidParameter', () => {
  const { indicated } = callOnWriteWithControl(() => {}, Buffer.from([OpCode.stopOrPause]))
  assert.equal(indicated, expectedResponse(OpCode.stopOrPause, ResultOpCode.invalidParameter))
})

// --- unsupported opCode ---

test('unsupported opCode returns opCodeNotSupported', () => {
  const { indicated } = callOnWrite(() => {}, Buffer.from([0x11]))
  assert.equal(indicated, expectedResponse(0x11, ResultOpCode.opCodeNotSupported))
})

test.run()
