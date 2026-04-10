'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
import * as assert from 'uvu/assert'
import { suite } from 'uvu'

import { PreviousFrameStatus, ProprietaryLongGetConfigCommands, ProprietaryLongSetConfigCommands, PublicLongCommands, StateMachineState, UniqueFrameFlags } from './CsafeCommandsMapping.js'
import { CsafeFrameBase } from './CsafeFrameBase.js'
import { CsafeResponseFrame } from './CsafeResponseFrame.js'

const csafeResponseFrameTests = suite('CsafeResponseFrame')

csafeResponseFrameTests('should calculate status byte correctly', () => {
  const frameToggle = 1
  const stateMachineState = StateMachineState.InUse
  const frameType = UniqueFrameFlags.StandardStartFlag
  const previousStatus = PreviousFrameStatus.NotReady
  const response = new CsafeResponseFrame(frameToggle, frameType, stateMachineState, previousStatus)

  const responseBuffer = response.build()

  assert.is(responseBuffer[1], frameToggle << 7 | previousStatus | stateMachineState)
})

csafeResponseFrameTests('should parse commands added with no data', () => {
  const frameToggle = 1
  const response = new CsafeResponseFrame(frameToggle)
  const commands = [ProprietaryLongGetConfigCommands.CSAFE_PM_GET_HRBELT_INFO, ProprietaryLongGetConfigCommands.CSAFE_PM_GET_EXTENDED_HRBELT_INFO]
  response.addCommand(commands[0], [])
  response.addCommand(commands[1], [])

  const responseBuffer = response.build()

  assert.is(responseBuffer[2], commands[0])
  assert.is(responseBuffer[3], commands[1])
})

csafeResponseFrameTests('should add proprietary wrapper to the response if set', () => {
  const commands = [ProprietaryLongGetConfigCommands.CSAFE_PM_GET_HRBELT_INFO, ProprietaryLongGetConfigCommands.CSAFE_PM_GET_EXTENDED_HRBELT_INFO]
  const response = new CsafeResponseFrame()
  response.addCommand(commands[0], [])
  response.addCommand(commands[1], [])

  response.setProprietaryWrapper(PublicLongCommands.CSAFE_GETPMCFG_CMD)

  const responseBuffer = response.build()

  assert.is(responseBuffer[4], commands[0])
  assert.is(responseBuffer[5], commands[1])
})

csafeResponseFrameTests('should parse commands added with data', () => {
  const frameToggle = 1
  const response = new CsafeResponseFrame(frameToggle)
  const commands = [ProprietaryLongGetConfigCommands.CSAFE_PM_GET_HRBELT_INFO, ProprietaryLongGetConfigCommands.CSAFE_PM_GET_EXTENDED_HRBELT_INFO]
  response.addCommand(commands[0], [1, 1, 1, 0, 1])
  response.addCommand(commands[1], [1, 1, 1, 0, 0, 0, 1])

  const responseBuffer = response.build()

  const firstCommand = responseBuffer.subarray(2, 2 + 2 + response.commands[0].data.length)
  const secondCommand = responseBuffer.subarray(2 + firstCommand.byteLength, firstCommand.byteLength + 2 + 2 + response.commands[1].data.length)

  assert.is(firstCommand[1], response.commands[0].data.length, 'Length byte')
  assert.equal([...firstCommand.subarray(2, firstCommand.byteLength)], response.commands[0].data, 'Data items')
  assert.is(secondCommand[1], response.commands[1].data.length, 'Length byte')
  assert.equal([...secondCommand.subarray(2, secondCommand.byteLength)], response.commands[1].data, 'Data items')
})

csafeResponseFrameTests('should stuff bytes that need byte-stuffing', () => {
  const frameToggle = 1
  const response = new CsafeResponseFrame(frameToggle)

  response.setProprietaryWrapper(PublicLongCommands.CSAFE_SETPMCFG_CMD)

  response.addCommand(ProprietaryLongSetConfigCommands.CSAFE_PM_SET_WORKOUTINTERVALCOUNT)
  response.addCommand(ProprietaryLongSetConfigCommands.CSAFE_PM_SET_WORKOUTTYPE)
  response.addCommand(ProprietaryLongSetConfigCommands.CSAFE_PM_SET_INTERVALTYPE)
  response.addCommand(ProprietaryLongSetConfigCommands.CSAFE_PM_SET_WORKOUTDURATION)
  response.addCommand(ProprietaryLongSetConfigCommands.CSAFE_PM_SET_RESTDURATION)
  response.addCommand(ProprietaryLongSetConfigCommands.CSAFE_PM_SET_TARGETPACETIME)
  response.addCommand(ProprietaryLongSetConfigCommands.CSAFE_PM_CONFIGURE_WORKOUT)
  response.addCommand(ProprietaryLongSetConfigCommands.CSAFE_PM_SET_WORKOUTINTERVALCOUNT)
  response.addCommand(ProprietaryLongSetConfigCommands.CSAFE_PM_SET_INTERVALTYPE)
  response.addCommand(ProprietaryLongSetConfigCommands.CSAFE_PM_SET_WORKOUTDURATION)
  response.addCommand(ProprietaryLongSetConfigCommands.CSAFE_PM_SET_RESTDURATION)
  response.addCommand(ProprietaryLongSetConfigCommands.CSAFE_PM_SET_TARGETPACETIME)
  response.addCommand(ProprietaryLongSetConfigCommands.CSAFE_PM_CONFIGURE_WORKOUT)
  response.addCommand(ProprietaryLongSetConfigCommands.CSAFE_PM_SET_WORKOUTTYPE)
  response.addCommand(ProprietaryLongSetConfigCommands.CSAFE_PM_SET_SPLITDURATION)
  response.addCommand(ProprietaryLongSetConfigCommands.CSAFE_PM_SET_SCREENSTATE)

  const responseBuffer = response.build()

  assert.equal([...responseBuffer.subarray(responseBuffer.byteLength - 3, responseBuffer.byteLength - 1)], CsafeFrameBase.stuffByte(0xF1))
})

csafeResponseFrameTests('should calculate proper checksum', () => {
  const frameToggle = 1
  const response = new CsafeResponseFrame(frameToggle, UniqueFrameFlags.ExtendedStartFlag)
  response.setProprietaryWrapper(0x77)

  response.addCommand(0x39, [])

  const responseBuffer = response.build()
  assert.is(responseBuffer[responseBuffer.byteLength - 2], 0xCE)
})

csafeResponseFrameTests.run()
