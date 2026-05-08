'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  todo: Could provide some info on the device here, maybe OS, Node version etc...
*/
import { PeripheralConstants } from '../../PeripheralConstants.js'

import { GattService } from '../BleManager.js'
import { createStaticReadCharacteristic } from './StaticReadCharacteristic.js'

export class DeviceInformationService extends GattService {
  constructor () {
    super({
      name: 'Device Information Service',
      uuid: 0x180A,
      characteristics: [
        createStaticReadCharacteristic(0x2A24, PeripheralConstants.model, 'Model Number'),
        createStaticReadCharacteristic(0x2A25, PeripheralConstants.serial, 'Serial Number'),
        createStaticReadCharacteristic(0x2A28, PeripheralConstants.firmwareRevision, 'Software Revision'),
        createStaticReadCharacteristic(0x2A29, PeripheralConstants.manufacturer, 'Manufacturer Name')
      ]
    })
  }
}
