'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  todo: Could provide some info on the device here, maybe OS, Node version etc...
*/
import bleno from '@abandonware/bleno'
import { PeripheralConstants } from '../../PeripheralConstants.js'
import StaticReadCharacteristic from './StaticReadCharacteristic.js'

export default class DeviceInformationService extends bleno.PrimaryService {
  constructor () {
    super({
      // uuid of 'Device Information Service'
      uuid: '180a',
      characteristics: [
        new StaticReadCharacteristic('2A24', 'Model Number', PeripheralConstants.model),
        new StaticReadCharacteristic('2A25', 'Serial Number', PeripheralConstants.serial),
        new StaticReadCharacteristic('2A28', 'Software Revision', PeripheralConstants.firmwareRevision),
        new StaticReadCharacteristic('2A29', 'Manufacturer Name', PeripheralConstants.manufacturer)
      ]
    })
  }
}
