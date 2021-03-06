'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  todo: Could provide some info on the device here, maybe OS, Node version etc...
*/
import bleno from '@abandonware/bleno'

export default class DeviceInformationService extends bleno.PrimaryService {
  constructor (controlPointCallback) {
    super({
      // uuid of "Device Information Service"
      uuid: '180a',
      characteristics: [
        /* new SerialNumberCharacteristic(device),
        new HardwareRevisionCharacteristic(device) */
      ]
    })
  }
}
