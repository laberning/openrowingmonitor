'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor
*/
import { register } from 'node:module'
import { pathToFileURL } from 'node:url'
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import log from 'loglevel'

// Register a loader hook to mock @abandonware/bleno (native BLE module)
// before any imports resolve. The mock provides a minimal Characteristic
// base class so FitnessMachineControlPointCharacteristic can extend it.
register('data:text/javascript,' + encodeURIComponent(`
export function resolve(specifier, context, next) {
  if (specifier === '@abandonware/bleno') {
    return {
      url: 'data:text/javascript,export default { Characteristic: class { constructor() {} } };',
      shortCircuit: true
    };
  }
  return next(specifier, context);
}
`), pathToFileURL('./'))

const { default: FitnessMachineControlPointCharacteristic } = await import(
  './FitnessMachineControlPointCharacteristic.js'
)

log.setLevel(log.levels.SILENT)

// Mirror constants from source (not exported)
const ControlPointOpCode = {
  requestControl: 0x00,
  reset: 0x01,
  startOrResume: 0x07,
  stopOrPause: 0x08,
  setIndoorBikeSimulationParameters: 0x11
}

const ResultCode = {
  success: 0x01,
  opCodeNotSupported: 0x02,
  invalidParameter: 0x03,
  operationFailed: 0x04,
  controlNotPermitted: 0x05
}

// --- Helpers ---

function createCharacteristic (callback) {
  return new FitnessMachineControlPointCharacteristic(callback)
}

function createControlledCharacteristic (callback) {
  const char = createCharacteristic(callback)
  char.onWriteRequest(buildRequestControlBuffer(), 0, false, () => {})
  return char
}

function buildRequestControlBuffer () {
  return Buffer.from([ControlPointOpCode.requestControl])
}

function buildSimpleCommandBuffer (opCode) {
  return Buffer.from([opCode])
}

function buildStopOrPauseBuffer (param) {
  return Buffer.from([ControlPointOpCode.stopOrPause, param])
}

function buildSetIndoorBikeSimBuffer (wind, grade, crr, cw) {
  const buf = Buffer.alloc(7)
  buf.writeUInt8(ControlPointOpCode.setIndoorBikeSimulationParameters, 0)
  buf.writeInt16LE(wind, 1)
  buf.writeInt16LE(grade, 3)
  buf.writeUInt8(crr, 5)
  buf.writeUInt8(cw, 6)
  return buf
}

function assertResponse (response, opCode, resultCode) {
  assert.ok(Buffer.isBuffer(response), 'response should be a Buffer')
  assert.is(response.length, 3, 'response should be exactly 3 bytes')
  assert.is(response[0], 0x80, 'first byte should be responseCode 0x80')
  assert.is(response[1], opCode, `second byte should be opCode 0x${opCode.toString(16)}`)
  assert.is(response[2], resultCode, `third byte should be resultCode 0x${resultCode.toString(16)}`)
}

// --- Tests ---

// 1. Constructor
test('constructor throws without callback', () => {
  assert.throws(
    () => new FitnessMachineControlPointCharacteristic(),
    /controlPointCallback required/
  )
})

// --- requestControl (opCode 0x00) ---

// 2. First requestControl call succeeds
test('requestControl first call returns success', () => {
  let receivedCommand = null
  const char = createCharacteristic((cmd) => {
    receivedCommand = cmd
    return true
  })

  char.onWriteRequest(buildRequestControlBuffer(), 0, false, (response) => {
    assertResponse(response, ControlPointOpCode.requestControl, ResultCode.success)
  })
  assert.equal(receivedCommand, { name: 'requestControl' })
})

// 3. Already controlled returns controlNotPermitted
test('requestControl when already controlled returns controlNotPermitted', () => {
  const char = createControlledCharacteristic(() => true)

  char.onWriteRequest(buildRequestControlBuffer(), 0, false, (response) => {
    assertResponse(response, ControlPointOpCode.requestControl, ResultCode.controlNotPermitted)
  })
})

// 4. Callback returning false returns operationFailed, stays uncontrolled
test('requestControl callback returning false returns operationFailed', () => {
  const char = createCharacteristic(() => false)

  char.onWriteRequest(buildRequestControlBuffer(), 0, false, (response) => {
    assertResponse(response, ControlPointOpCode.requestControl, ResultCode.operationFailed)
  })

  // Should stay uncontrolled — startOrResume should fail
  char.onWriteRequest(buildSimpleCommandBuffer(ControlPointOpCode.startOrResume), 0, false, (response) => {
    assertResponse(response, ControlPointOpCode.startOrResume, ResultCode.controlNotPermitted)
  })
})

// --- startOrResume (opCode 0x07) ---

// 5. After control, startOrResume succeeds
test('startOrResume after control returns success', () => {
  let receivedCommand = null
  const char = createControlledCharacteristic((cmd) => {
    receivedCommand = cmd
    return true
  })

  char.onWriteRequest(buildSimpleCommandBuffer(ControlPointOpCode.startOrResume), 0, false, (response) => {
    assertResponse(response, ControlPointOpCode.startOrResume, ResultCode.success)
  })
  assert.equal(receivedCommand, { name: 'startOrResume' })
})

// 6. Before control, startOrResume returns controlNotPermitted
test('startOrResume before control returns controlNotPermitted', () => {
  const char = createCharacteristic(() => true)

  char.onWriteRequest(buildSimpleCommandBuffer(ControlPointOpCode.startOrResume), 0, false, (response) => {
    assertResponse(response, ControlPointOpCode.startOrResume, ResultCode.controlNotPermitted)
  })
})

// 7. Callback returning false returns operationFailed
test('startOrResume callback returning false returns operationFailed', () => {
  const char = createControlledCharacteristic((cmd) => {
    if (cmd.name === 'requestControl') return true
    return false
  })

  char.onWriteRequest(buildSimpleCommandBuffer(ControlPointOpCode.startOrResume), 0, false, (response) => {
    assertResponse(response, ControlPointOpCode.startOrResume, ResultCode.operationFailed)
  })
})

// --- stopOrPause (opCode 0x08) ---

// 8. param=1 (stop) succeeds
test('stopOrPause param=1 stop returns success', () => {
  let receivedCommand = null
  const char = createControlledCharacteristic((cmd) => {
    receivedCommand = cmd
    return true
  })

  char.onWriteRequest(buildStopOrPauseBuffer(1), 0, false, (response) => {
    assertResponse(response, ControlPointOpCode.stopOrPause, ResultCode.success)
  })
  assert.equal(receivedCommand, { name: 'stop' })
})

// 9. param=2 (pause) succeeds
test('stopOrPause param=2 pause returns success', () => {
  let receivedCommand = null
  const char = createControlledCharacteristic((cmd) => {
    receivedCommand = cmd
    return true
  })

  char.onWriteRequest(buildStopOrPauseBuffer(2), 0, false, (response) => {
    assertResponse(response, ControlPointOpCode.stopOrPause, ResultCode.success)
  })
  assert.equal(receivedCommand, { name: 'pause' })
})

// 10. Before control returns controlNotPermitted
test('stopOrPause before control returns controlNotPermitted', () => {
  const char = createCharacteristic(() => true)

  char.onWriteRequest(buildStopOrPauseBuffer(1), 0, false, (response) => {
    assertResponse(response, ControlPointOpCode.stopOrPause, ResultCode.controlNotPermitted)
  })
})

// 11. Callback returning false returns operationFailed
test('stopOrPause callback returning false returns operationFailed', () => {
  const char = createControlledCharacteristic((cmd) => {
    if (cmd.name === 'requestControl') return true
    return false
  })

  char.onWriteRequest(buildStopOrPauseBuffer(1), 0, false, (response) => {
    assertResponse(response, ControlPointOpCode.stopOrPause, ResultCode.operationFailed)
  })
})

// --- reset (opCode 0x01) ---

// 12. After control, reset succeeds and clears controlled state
test('reset after control succeeds and clears controlled state', () => {
  const char = createControlledCharacteristic(() => true)

  char.onWriteRequest(buildSimpleCommandBuffer(ControlPointOpCode.reset), 0, false, (response) => {
    assertResponse(response, ControlPointOpCode.reset, ResultCode.success)
  })

  // After reset, controlled should be cleared — startOrResume should fail
  char.onWriteRequest(buildSimpleCommandBuffer(ControlPointOpCode.startOrResume), 0, false, (response) => {
    assertResponse(response, ControlPointOpCode.startOrResume, ResultCode.controlNotPermitted)
  })
})

// 13. Reset before control returns controlNotPermitted
test('reset before control returns controlNotPermitted', () => {
  const char = createCharacteristic(() => true)

  char.onWriteRequest(buildSimpleCommandBuffer(ControlPointOpCode.reset), 0, false, (response) => {
    assertResponse(response, ControlPointOpCode.reset, ResultCode.controlNotPermitted)
  })
})

// --- setIndoorBikeSimulationParameters (opCode 0x11) ---

// 14. Valid payload returns success with correct parsed values
test('setIndoorBikeSimulationParameters valid payload returns success', () => {
  let receivedCommand = null
  const char = createControlledCharacteristic((cmd) => {
    receivedCommand = cmd
    return true
  })

  // windspeed raw=1000 -> 1.0, grade raw=200 -> 2.0, crr raw=50 -> 0.005, cw raw=100 -> 1.0
  const buf = buildSetIndoorBikeSimBuffer(1000, 200, 50, 100)
  char.onWriteRequest(buf, 0, false, (response) => {
    assertResponse(response, ControlPointOpCode.setIndoorBikeSimulationParameters, ResultCode.success)
  })

  assert.is(receivedCommand.name, 'setIndoorBikeSimulationParameters')
  assert.ok(Math.abs(receivedCommand.value.windspeed - 1.0) < 0.001, 'windspeed should be ~1.0')
  assert.ok(Math.abs(receivedCommand.value.grade - 2.0) < 0.01, 'grade should be ~2.0')
  assert.ok(Math.abs(receivedCommand.value.crr - 0.005) < 0.0001, 'crr should be ~0.005')
  assert.ok(Math.abs(receivedCommand.value.cw - 1.0) < 0.01, 'cw should be ~1.0')
})

// 15. Callback returning false returns operationFailed
test('setIndoorBikeSimulationParameters callback returning false returns operationFailed', () => {
  const char = createControlledCharacteristic((cmd) => {
    if (cmd.name === 'requestControl') return true
    return false
  })

  const buf = buildSetIndoorBikeSimBuffer(0, 0, 0, 0)
  char.onWriteRequest(buf, 0, false, (response) => {
    assertResponse(response, ControlPointOpCode.setIndoorBikeSimulationParameters, ResultCode.operationFailed)
  })
})

// --- Default / unknown opcode ---

// 16. Unknown opcode returns opCodeNotSupported
test('unknown opcode returns opCodeNotSupported', () => {
  const char = createCharacteristic(() => true)

  char.onWriteRequest(Buffer.from([0xFF]), 0, false, (response) => {
    assertResponse(response, 0xFF, ResultCode.opCodeNotSupported)
  })
})

// --- Response format ---

// 17. buildResponse produces correct 3-byte format
test('buildResponse produces correct 3-byte format', () => {
  const char = createCharacteristic(() => true)

  const response = char.buildResponse(0x07, 0x01)
  assertResponse(response, 0x07, 0x01)
})

// --- Bug documentation ---

// 18. BUG FIXED: stopOrPause with invalid param now returns invalidParameter response
test('stopOrPause with invalid param returns invalidParameter', () => {
  let controlPointCallbackCalled = false
  let receivedResponse = null
  const char = createControlledCharacteristic((cmd) => {
    if (cmd.name !== 'requestControl') {
      controlPointCallbackCalled = true
    }
    return true
  })

  char.onWriteRequest(buildStopOrPauseBuffer(3), 0, false, (response) => {
    receivedResponse = response
  })

  assert.is(controlPointCallbackCalled, false, 'controlPointCallback should not be called for invalid param')
  assertResponse(receivedResponse, ControlPointOpCode.stopOrPause, ResultCode.invalidParameter)
})

// 19. BUG FIXED: setIndoorBikeSimulationParameters requires requestControl
test('setIndoorBikeSimulationParameters without requestControl returns controlNotPermitted', () => {
  let receivedCommand = null
  let receivedResponse = null
  const char = createCharacteristic((cmd) => {
    receivedCommand = cmd
    return true
  })

  const buf = buildSetIndoorBikeSimBuffer(0, 0, 0, 0)
  char.onWriteRequest(buf, 0, false, (response) => {
    receivedResponse = response
    assertResponse(response, ControlPointOpCode.setIndoorBikeSimulationParameters, ResultCode.controlNotPermitted)
  })

  assert.is(receivedCommand, null, 'controlPointCallback should not be called without control')
  assertResponse(receivedResponse, ControlPointOpCode.setIndoorBikeSimulationParameters, ResultCode.controlNotPermitted)
})

// --- Edge cases: buffer length validation ---

// 20. stopOrPause with missing parameter byte returns invalidParameter
test('stopOrPause with missing parameter byte returns invalidParameter', () => {
  let receivedResponse = null
  const char = createControlledCharacteristic(() => true)

  char.onWriteRequest(buildSimpleCommandBuffer(ControlPointOpCode.stopOrPause), 0, false, (response) => {
    receivedResponse = response
  })

  assertResponse(receivedResponse, ControlPointOpCode.stopOrPause, ResultCode.invalidParameter)
})

// 21. stopOrPause with param=0 (invalid) returns invalidParameter
test('stopOrPause with param=0 returns invalidParameter', () => {
  let receivedResponse = null
  const char = createControlledCharacteristic(() => true)

  char.onWriteRequest(buildStopOrPauseBuffer(0), 0, false, (response) => {
    receivedResponse = response
  })

  assertResponse(receivedResponse, ControlPointOpCode.stopOrPause, ResultCode.invalidParameter)
})

// 22. stopOrPause with param=255 (invalid) returns invalidParameter
test('stopOrPause with param=255 returns invalidParameter', () => {
  let receivedResponse = null
  const char = createControlledCharacteristic(() => true)

  char.onWriteRequest(buildStopOrPauseBuffer(255), 0, false, (response) => {
    receivedResponse = response
  })

  assertResponse(receivedResponse, ControlPointOpCode.stopOrPause, ResultCode.invalidParameter)
})

// 23. setIndoorBikeSimulationParameters with truncated buffer returns invalidParameter
test('setIndoorBikeSimulationParameters with truncated buffer returns invalidParameter', () => {
  let receivedResponse = null
  const char = createControlledCharacteristic(() => true)

  const truncatedBuf = Buffer.from([ControlPointOpCode.setIndoorBikeSimulationParameters, 0x00, 0x00])
  char.onWriteRequest(truncatedBuf, 0, false, (response) => {
    receivedResponse = response
  })

  assertResponse(receivedResponse, ControlPointOpCode.setIndoorBikeSimulationParameters, ResultCode.invalidParameter)
})

test.run()
