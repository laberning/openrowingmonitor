'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/

import { toHexString } from '../../../../tools/Helper.js'

import { CsafeCommand } from './CsafeCommand.js'
import { CsafeFrameBase } from './CsafeFrameBase.js'
import { UniqueFrameFlags } from './CsafeCommandsMapping.js'

/**
 * InvalidFrameError type.
 *
 * Thrown when a frame contains an invalid checksum.
 */
class InvalidFrameError extends Error {}

export class CsafeRequestFrame {
  /**
   * Frame type (Standard/Extended) getter.
   * @returns {UniqueFrameFlags}
   */
  get frameType () {
    return this.#frameContent[0]
  }

  get commands () {
    return this.#commands
  }

  get proprietaryCommandWrapper () {
    return this.#commandWrapperFlag
  }

  get destinationAddress () {
    return this.#destinationAddress
  }

  get sourceAddress () {
    return this.#sourceAddress
  }

  /**
   * @type {number | undefined}
   */
  #destinationAddress = undefined
  /**
   * @type {number | undefined}
   */
  #sourceAddress = undefined
  /**
   * @type {number | undefined}
   */
  #commandWrapperFlag = undefined
  /**
   * @type {Array<CsafeCommand>}
   */
  #commands = []
  /**
   * @type {Array<number>}
   */
  #frameContent
  /**
   * @param {Array<number>} buffer
   */
  constructor (buffer) {
    this.#frameContent = CsafeFrameBase.unStuffByte(buffer)

    if (!this.#validateChecksum()) {
      throw new InvalidFrameError(`Checksum does not match. ${toHexString(buffer)}`)
    }

    this.#parse()
  }

  /**
   * Check if frame is C2 proprietary or public.
   * @returns {this is {proprietaryCommandWrapper:number, #commandWrapperFlag: number}}
   */
  isProprietary () {
    return this.#commandWrapperFlag !== undefined && CsafeFrameBase.isProprietary(this.#commandWrapperFlag)
  }

  /**
   * Check if the command is C2 proprietary or public.
   * @returns {this is { #destinationAddress: number, #sourceAddress: number, destinationAddress: number, sourceAddress: number }}
   */
  isExtended () {
    return this.frameType === UniqueFrameFlags.ExtendedStartFlag
  }

  /**
   * @param {import('./CsafeCommandsMapping.js').CsafeCommandsNumbers | undefined} commandNumber
   */
  getCommand (commandNumber) {
    return this.#commands.find((command) => command.command === commandNumber)
  }

  #parse () {
    // Standard frame (Standard Start Flag | Frame Contents | Checksum | Stop Flag)
    // Extended frame (Extended Start Flag | Destination Address | Source Address | Frame Contents | Checksum | Stop Flag)
    if (this.frameType === UniqueFrameFlags.ExtendedStartFlag) {
      this.#destinationAddress = this.#frameContent[1]
      this.#sourceAddress = this.#frameContent[2]
    }

    const frameContentStartPos = this.frameType === UniqueFrameFlags.StandardStartFlag ? 1 : 3

    this.#commandWrapperFlag = CsafeFrameBase.isProprietary(this.#frameContent[frameContentStartPos]) ? this.#frameContent[frameContentStartPos] : undefined

    const content = this.#frameContent.slice(this.#commandWrapperFlag === undefined ? frameContentStartPos : frameContentStartPos + 2, this.#frameContent.length - 2)

    for (let i = 0; i < content.length;) {
      const command = content[i]
      const isShortCommand = CsafeCommand.isShortCommand(command)
      const commandDataLength = isShortCommand ? 0 : content[i + 1]
      const data = content.slice(i + 2, i + 2 + commandDataLength)

      this.#commands.push(
        new CsafeCommand(command, data)
      )

      i += commandDataLength + (isShortCommand ? 1 : 2)
    }
  }

  /**
   * Validates the frame checksum byte.
   */
  #validateChecksum () {
    const endIdx = this.#frameContent.length - 2
    const checkBytes = this.#frameContent.slice(this.frameType === UniqueFrameFlags.StandardStartFlag ? 1 : 3, endIdx)
    const validate = CsafeFrameBase.checksumFromBytes(checkBytes)

    return this.#frameContent[this.#frameContent.length - 2] === validate
  }
}
