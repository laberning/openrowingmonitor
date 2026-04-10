'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Implements the Multiplexed Characteristic as defined by the spec:

  "On some Android platforms, there is a limitation to the number of notification messages allowed.
  To circumvent this issue, a single characteristic (C2 multiplexed data
  info) exists to allow multiple characteristics to be multiplexed onto a single characteristic. The last byte in the
  characteristic will indicate which data characteristic is multiplexed."
*/
import { GattNotifyCharacteristic } from '../../../BleManager.js'

import { toC2128BitUUID } from '../../Pm5Constants.js'

export class MultiplexedCharacteristic extends GattNotifyCharacteristic {
  constructor () {
    super({
      name: 'Multiplexed Information',
      uuid: toC2128BitUUID('0080'),
      properties: ['notify']
    })
  }

  /**
   * @param {number} id
   * @param {Buffer} characteristicBuffer
   */
  // @ts-ignore: Type is not assignable to type
  notify (id, characteristicBuffer) {
    const characteristicId = Buffer.alloc(1)
    characteristicId.writeUInt8(id, 0)
    const buffer = Buffer.concat(
      [
        characteristicId,
        characteristicBuffer
      ],
      characteristicId.length + characteristicBuffer.length
    )

    super.notify(buffer)
  }
}
