'use strict'

import { PreviousFrameStatus, StateMachineState, UniqueFrameFlags } from './CsafeCommandsMapping.js'
import { CsafeCommand } from './CsafeCommand.js'
import { CsafeFrameBase } from './CsafeFrameBase.js'

export class CsafeResponseFrame {
  /**
   * Frame type (Standard/Extended) getter.
   * @returns {UniqueFrameFlags}
   */
  get frameType () {
    return this.#frameType
  }

  get commands () {
    return this.#commands
  }

  #frameToggle
  #stateMachineState
  #frameType
  #previousStatus
  #destinationAddress
  #sourceAddress
  /**
   * @type {Array<CsafeCommand>}
   */
  #commands = []
  /**
   * @type {import('./CsafeCommandsMapping.js').CsafeCommandsNumbers | undefined}
   */
  #proprietaryWrapper = undefined

  /**
 * @param {number} [frameToggle]
 * @param {StateMachineState} [stateMachineState]
 * @param {UniqueFrameFlags} [frameType]
 * @param {PreviousFrameStatus} [previousStatus]
 */
  constructor (frameToggle = 0, frameType = UniqueFrameFlags.StandardStartFlag, stateMachineState = StateMachineState.Ready, previousStatus = PreviousFrameStatus.Ok) {
    this.#frameToggle = frameToggle
    this.#stateMachineState = stateMachineState
    this.#frameType = frameType
    this.#previousStatus = previousStatus

    if (frameType === UniqueFrameFlags.ExtendedStartFlag) {
      this.#destinationAddress = 0x00
      this.#sourceAddress = 0xFD
    }
  }

  /**
   *
   * @param {import('./CsafeCommandsMapping.js').CsafeCommandsNumbers} command
   * @param {Array<number>} [data]
   */
  addCommand (command, data = []) {
    this.#commands.push(new CsafeCommand(command, data))
  }

  /**
   * Set if frame is C2 proprietary or public.
   * @param {number} command
   */
  setProprietaryWrapper (command) {
    this.#proprietaryWrapper = command
  }

  /**
   * Set Extended Frame's Destination Address.
   * @param {number} command
   */
  setDestinationAddress (command) {
    if (this.#frameType !== UniqueFrameFlags.ExtendedStartFlag) {
      throw new Error('This frame cannot have a Destination Address as it is not an extended frame')
    }

    this.#destinationAddress = command
  }

  /**
   * Set Extended Frame's Source Address.
   * @param {number} command
   */
  setSourceAddress (command) {
    if (this.#frameType !== UniqueFrameFlags.ExtendedStartFlag) {
      throw new Error('This frame cannot have a Source Address as it is not an extended frame')
    }

    this.#sourceAddress = command
  }

  /**
   * Check if the command is C2 proprietary or public.
   * @returns {this is { #proprietaryWrapper: number }}
   */
  isProprietary () {
    return this.#proprietaryWrapper !== undefined
  }

  /**
   * Check if the command is C2 proprietary or public.
   * @returns {this is { #destinationAddress: number, #sourceAddress: number, destinationAddress: number, sourceAddress: number }}
   */
  isExtended () {
    return this.#frameType === UniqueFrameFlags.ExtendedStartFlag
  }

  build () {
    const /** @type {Array<number>} */ addresses = []

    if (this.isExtended()) {
      addresses.push(this.#destinationAddress)
      addresses.push(this.#sourceAddress)
    }

    const statusBit = this.#frameToggle << 7 | this.#previousStatus | this.#stateMachineState
    const frameContent = [statusBit]

    const commands = this.#commands.reduce((/** @type {Array<number>} */ buffer, command) => {
      buffer.push(command.command)
      if (command.data.length > 0) {
        buffer.push(command.data.length)
        buffer.push(...command.data)
      }

      return buffer
    }, [])

    if (this.isProprietary()) {
      frameContent.push(this.#proprietaryWrapper)
      frameContent.push(commands.length)
    }

    frameContent.push(...commands)

    const checksum = CsafeFrameBase.checksumFromBytes(frameContent)

    const stuffedFrameContent = [...addresses, ...frameContent, checksum].reduce((/** @type {Array<number>} */ buffer, byte) => {
      if (CsafeFrameBase.shouldStuffByte(byte)) {
        buffer.push(...CsafeFrameBase.stuffByte(byte))
      } else {
        buffer.push(byte)
      }

      return buffer
    }, [])

    return Buffer.from([this.#frameType, ...stuffedFrameContent, UniqueFrameFlags.StopFlag])
  }
}
