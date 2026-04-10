'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Provides all required GAP Characteristics of the PM5
  todo: not sure if this is correct, the normal GAP service has 0x1800
*/
import { GattService, toBLEStandard128BitUUID } from '../BleManager.js'
import { createStaticReadCharacteristic } from '../common/StaticReadCharacteristic.js'

import { pm5Constants } from './Pm5Constants.js'

export class Pm5AppearanceService extends GattService {
  constructor () {
    super({
      name: 'Generic Access',
      uuid: toBLEStandard128BitUUID('1800'),
      characteristics: [
        // GAP device name
        createStaticReadCharacteristic(toBLEStandard128BitUUID('2A00'), pm5Constants.name, 'Device Name'),
        // GAP appearance
        createStaticReadCharacteristic(toBLEStandard128BitUUID('2A01'), [0x00, 0x00], 'Appearance'),
        // GAP peripheral privacy
        createStaticReadCharacteristic(toBLEStandard128BitUUID('2A02'), [0x00], 'Peripheral Privacy'),
        // GAP reconnect address
        createStaticReadCharacteristic(toBLEStandard128BitUUID('2A03'), '00:00:00:00:00:00', 'Reconnect Address'),
        // Peripheral preferred connection parameters
        createStaticReadCharacteristic(toBLEStandard128BitUUID('2A04'), [0x18, 0x00, 0x18, 0x00, 0x00, 0x00, 0xE8, 0x03], 'Preferred Connection Parameters')
      ]
    })
  }
}
