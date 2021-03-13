'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Provides all required GAP Characteristics of the PM5
  todo: not sure if this is correct, the normal GAP service has 0x1800
*/
import bleno from '@abandonware/bleno'
import { constants, getFullUUID } from './Pm5Constants.js'
import ValueReadCharacteristic from './ValueReadCharacteristic.js'

export default class GapService extends bleno.PrimaryService {
  constructor () {
    super({
      // GAP Service UUID of PM5
      uuid: getFullUUID('0000'),
      characteristics: [
        // GAP device name
        new ValueReadCharacteristic('2A00', constants.name),
        // GAP appearance
        new ValueReadCharacteristic('2A01', [0x00, 0x00]),
        // GAP peripheral privacy
        new ValueReadCharacteristic('2A02', [0x00]),
        // GAP reconnect address
        new ValueReadCharacteristic('2A03', '00:00:00:00:00:00'),
        // Peripheral preferred connection parameters
        new ValueReadCharacteristic('2A04', [0x18, 0x00, 0x18, 0x00, 0x00, 0x00, 0xE8, 0x03])
      ]
    })
  }
}
