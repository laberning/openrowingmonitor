'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Provides all required GAP Characteristics of the PM5
  todo: not sure if this is correct, the normal GAP service has 0x1800
*/
import bleno from '@abandonware/bleno'
import StaticNotifyCharacteristic from '../common/StaticNotifyCharacteristic.js'
import { getFullUUID, pm5Constants } from './Pm5Constants.js'

export default class GapService extends bleno.PrimaryService {
  constructor () {
    super({
      // GAP Service UUID of PM5
      uuid: getFullUUID('0000'),
      characteristics: [
        // GAP device name
        new StaticNotifyCharacteristic('2A00', undefined, pm5Constants.name, true),
        // GAP appearance
        new StaticNotifyCharacteristic('2A01', undefined, [0x00, 0x00], true),
        // GAP peripheral privacy
        new StaticNotifyCharacteristic('2A02', undefined, [0x00], true),
        // GAP reconnect address
        new StaticNotifyCharacteristic('2A03', undefined, '00:00:00:00:00:00', true),
        // Peripheral preferred connection parameters
        new StaticNotifyCharacteristic('2A04', undefined, [0x18, 0x00, 0x18, 0x00, 0x00, 0x00, 0xE8, 0x03], true)
      ]
    })
  }
}
