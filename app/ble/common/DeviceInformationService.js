'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  todo: Could provide some info on the device here, maybe OS, Node version etc...
*/
import bleno from '@abandonware/bleno'
import StaticReadCharacteristic from './StaticReadCharacteristic.js'

export default class DeviceInformationService extends bleno.PrimaryService {
  constructor () {
    super({
      // uuid of 'Device Information Service'
      uuid: '180a',
      characteristics: [
        new StaticReadCharacteristic('2A24', 'Model Number', 'ORM2'),
        new StaticReadCharacteristic('2A25', 'Serial Number', '1234'),
        new StaticReadCharacteristic('2A28', 'Software Revision', '2'),
        new StaticReadCharacteristic('2A29', 'Manufacturer Name', 'OpenRowingMonitor')
      ]
    })
  }
}
