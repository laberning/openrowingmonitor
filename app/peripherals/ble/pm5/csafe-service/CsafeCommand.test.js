'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
import * as assert from 'uvu/assert'
import { suite } from 'uvu'

import { CsafeCommand } from './CsafeCommand.js'
import { ProprietaryLongSetDataCommands } from './CsafeCommandsMapping.js'

const csafeCommandTests = suite('CsafeCommand')

csafeCommandTests('isShortCommand method should return true for short and false for long command', () => {
  const longCommands = [0x69, 0x05, 0x01, 0x50]
  const shortCommands = [0x9B, 0x81, 0x89, 0x80]

  longCommands.forEach((command) => {
    const csafeCommand = new CsafeCommand(command, [])
    assert.is(csafeCommand.isShortCommand(), false, `long command: 0x${command.toString(16)}`)
  })

  shortCommands.forEach((command) => {
    const csafeCommand = new CsafeCommand(command, [])
    assert.is(csafeCommand.isShortCommand(), true, `short command: 0x${command.toString(16)}`)
  })
})

csafeCommandTests('toString method should return the string name of the command per the CSAFE Spec', () => {
  const csafeCommand = new CsafeCommand(ProprietaryLongSetDataCommands.CSAFE_PM_SET_EXTENDED_HRM, [])

  const commandString = Object.entries(ProprietaryLongSetDataCommands).filter(a => a[1] === ProprietaryLongSetDataCommands.CSAFE_PM_SET_EXTENDED_HRM)[0][0]

  assert.is(csafeCommand.toString(), commandString)
})

csafeCommandTests.run()
