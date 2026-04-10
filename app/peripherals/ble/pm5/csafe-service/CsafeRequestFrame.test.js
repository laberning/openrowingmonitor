'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
import * as assert from 'uvu/assert'
import { suite } from 'uvu'

import { ProprietaryLongSetConfigCommands, ScreenTypes, ScreenValue, WorkoutTypes } from './CsafeCommandsMapping.js'
import { CsafeRequestFrame } from './CsafeRequestFrame.js'

const csafeRequestFrameTests = suite('CsafeRequestFrame')

csafeRequestFrameTests('should parse single short (i.e. with no data)', () => {
  const commandValue = 0x85
  const setDateCommand = [0xF1, 0x7E, 0x01, commandValue, 0xFA, 0xF2]

  const frame = new CsafeRequestFrame(setDateCommand)

  const expectedNumberOfCommands = 1

  assert.ok(frame.isProprietary())
  assert.is(frame.commands.length, expectedNumberOfCommands)
  assert.is(frame.commands[expectedNumberOfCommands - 1].command, commandValue)
  assert.is(frame.commands[expectedNumberOfCommands - 1].data.length, 0)
})

csafeRequestFrameTests('should parse single long command (i.e. with data)', () => {
  const commandValue = 0x57
  const data = [0x00]
  const getExtendedHrBeltInfoCommand = [0xF1, 0x7F, 0x03, commandValue, data.length, ...data, 0x2A, 0xF2]

  const frame = new CsafeRequestFrame(getExtendedHrBeltInfoCommand)

  const expectedNumberOfCommands = 1

  assert.ok(frame.isProprietary())
  assert.is(frame.commands.length, expectedNumberOfCommands)
  assert.is(frame.commands[expectedNumberOfCommands - 1].command, commandValue)
  assert.equal(frame.commands[expectedNumberOfCommands - 1].data, data)
})

csafeRequestFrameTests('should parse multi proprietary long commands', () => {
  const setWorkoutTypeCommand = 0x01
  const setWorkoutTypeData = [WorkoutTypes.WORKOUTTYPE_JUSTROW_SPLITS]
  const setScreenStateCommand = ProprietaryLongSetConfigCommands.CSAFE_PM_SET_SCREENSTATE
  const setScreenStateValue = [ScreenTypes.SCREENTYPE_WORKOUT, ScreenValue.SCREENVALUEWORKOUT_PREPARETOROWWORKOUT]
  // f1 76 07 01 01 01 13 02 00 01 61 f2
  const setJustRowWorkout = [0xF1, 0x76, 0x07, setWorkoutTypeCommand, setWorkoutTypeData.length, ...setWorkoutTypeData, setScreenStateCommand, setScreenStateValue.length, ...setScreenStateValue, 0x61, 0xF2]

  const frame = new CsafeRequestFrame(setJustRowWorkout)

  const expectedNumberOfCommands = 2

  assert.ok(frame.isProprietary())
  assert.is(frame.commands.length, expectedNumberOfCommands)
  assert.equal(frame.commands[0].data, setWorkoutTypeData)
  assert.equal(frame.commands[1].data, setScreenStateValue)
})

csafeRequestFrameTests('should parse multi proprietary short commands', () => {
  const getDateCommand = 0x85
  const getHardwareVersionCommand = 0x81
  const getWorkDistanceCommand = 0xA3
  const multiShortCommand = [0xF1, 0x76, 0x03, getWorkDistanceCommand, getDateCommand, getHardwareVersionCommand, 0xD2, 0xF2]

  const frame = new CsafeRequestFrame(multiShortCommand)

  const expectedNumberOfCommands = 3

  assert.ok(frame.isProprietary())
  assert.is(frame.commands.length, expectedNumberOfCommands)
})

csafeRequestFrameTests('should parse byte stuffed frame', () => {
  const f0 = [0xF3, 0x00]
  const f1 = [0xF3, 0x01]
  const f2 = [0xF3, 0x02]
  const f3 = [0xF3, 0x03]
  const multiShortCommand = [0xF1, ...f0, 0x81, ...f1, ...f2, ...f3, 0x81, 0xF2]

  const frame = new CsafeRequestFrame(multiShortCommand)

  const expectedNumberOfCommands = 5
  assert.is(frame.commands.length, expectedNumberOfCommands)

  assert.is(frame.commands[0].command.toString(16), 'f0')
  assert.is(frame.commands[2].command.toString(16), 'f1')
  assert.is(frame.commands[3].command.toString(16), 'f2')
  assert.is(frame.commands[4].command.toString(16), 'f3')
})

csafeRequestFrameTests('should validate checksum', () => {
  const testFrame = [0xf1, 0x76, 0x60, 0x18, 0x01, 0x00, 0x01, 0x01, 0x08, 0x17, 0x01, 0x00, 0x03, 0x05, 0x00, 0x00, 0x00, 0x75, 0x30, 0x04, 0x02, 0x01, 0x2c, 0x14, 0x01, 0x01, 0x18, 0x01, 0x01, 0x17, 0x01, 0x00, 0x03, 0x05, 0x00, 0x00, 0x00, 0x5d, 0xc0, 0x04, 0x02, 0x00, 0xf3, 0x00, 0x14, 0x01, 0x01, 0x18, 0x01, 0x02, 0x17, 0x01, 0x00, 0x03, 0x05, 0x00, 0x00, 0x00, 0x46, 0x50, 0x04, 0x02, 0x00, 0xb4, 0x14, 0x01, 0x01, 0x18, 0x01, 0x03, 0x17, 0x01, 0x00, 0x03, 0x05, 0x00, 0x00, 0x00, 0x2e, 0xe0, 0x04, 0x02, 0x00, 0x78, 0x14, 0x01, 0x01, 0x18, 0x01, 0x04, 0x17, 0x01, 0x00, 0x03, 0x05, 0x00, 0x00, 0x00, 0x17, 0x70, 0x65, 0xf2]

  assert.not.throws(() => new CsafeRequestFrame(testFrame))
})

csafeRequestFrameTests.run()
