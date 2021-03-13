'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  The Control service can be used to send control commands to the PM5 device
  todo: not yet implemented
*/
import bleno from '@abandonware/bleno'
import { getFullUUID } from './Pm5Constants.js'
import ValueReadCharacteristic from './ValueReadCharacteristic.js'

export default class PM5ControlService extends bleno.PrimaryService {
  constructor () {
    super({
      uuid: getFullUUID('0020'),
      characteristics: [
        new ValueReadCharacteristic(getFullUUID('0021'), 'Control Command'),
        new ValueReadCharacteristic(getFullUUID('0022'), 'Response to Control Command')
      ]
    })
  }
}
