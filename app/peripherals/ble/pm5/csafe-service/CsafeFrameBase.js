'use strict'

import { PublicLongCommands, UniqueFrameFlags } from './CsafeCommandsMapping.js'

export class CsafeFrameBase {
  /**
   * Check if the command is C2 proprietary or public.
   * @param {number} command
   */
  static isProprietary (command) {
    return command === PublicLongCommands.CSAFE_SETPMCFG_CMD ||
      command === PublicLongCommands.CSAFE_SETPMDATA_CMD ||
      command === PublicLongCommands.CSAFE_GETPMCFG_CMD ||
      command === PublicLongCommands.CSAFE_GETPMDATA_CMD
  }

  /**
   * @param {number} byte
   */
  static shouldStuffByte (byte) {
    return (byte & 0xFC) === 0xF0
  }

  /**
   * Returns the offset byte value for byte stuffing.
   * @param {number} byte
   */
  static stuffByte (byte) {
    return [0xF3, byte & 0x03]
  }

  /**
  * Returns the real byte values for a frame.
  * @param {Array<number>} frame
  */
  static unStuffByte (frame) {
    return frame
      // Do byte-un-stuffing
      .reduce((buffer, byte, index, array) => {
        if (byte === UniqueFrameFlags.StuffFlag) {
          return buffer
        }

        buffer.push(
          index > 0 && array[index - 1] === UniqueFrameFlags.StuffFlag && (byte & 0xFC) === 0 ?
            byte + 0xF0 :
            byte
        )

        return buffer
      }, /** @type {Array<number>} */([]))
  }

  /**
   * Generates a 1 byte XOR checksum for a byte array.
   * @param {Array<number>} bytes
   */
  static checksumFromBytes (bytes) {
    return bytes.reduce((checkSum, byte) => checkSum ^ byte, 0x00)
  }
}
