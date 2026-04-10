import { swapObjectPropertyValues } from '../../../../tools/Helper.js'

import { longCommands, shortCommands } from './CsafeCommandsMapping.js'

export class CsafeCommand {
  get command () {
    return this.#command
  }

  get data () {
    return this.#data
  }

  #command
  #data

  /**
   *
   * @param {import('./CsafeCommandsMapping.js').CsafeCommandsNumbers} command
   * @param {Array<number>} data
   */
  constructor (command, data) {
    this.#command = command
    this.#data = data
  }

  /**
   * Return whether the command has parameters or not (long or short). This only relates to the request data,
   * and not whether the response should have data or not
   */
  isShortCommand () {
    return CsafeCommand.isShortCommand(this.#command)
  }

  toString () {
    /**
     * @type {ReverseKeyValue<Record<keyof longCommands | keyof shortCommands, number>>}
     */
    const toString = swapObjectPropertyValues(this.isShortCommand() ? shortCommands : longCommands)

    return toString[this.#command]
  }

  /**
   *
   * @param {number} command
   */
  static isShortCommand (command) {
    return Boolean(command >> 7)
  }
}
