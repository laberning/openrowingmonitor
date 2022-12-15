'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  The connected Central can remotely control some parameters or our rowing monitor via this Control Point

  But for our use case proper implementation is not necessary (its mere existence with an empty handler suffice)
*/
import bleno from '@abandonware/bleno'

export default class CyclingSpeedCadenceControlPointCharacteristic extends bleno.Characteristic {
  constructor (controlPointCallback) {
    super({
      // Cycling Speed and Cadence Control Point
      uuid: '2A55',
      value: null,
      properties: ['indicate', 'write']
    })

    this.controlled = false
    if (!controlPointCallback) { throw new Error('controlPointCallback required') }
    this.controlPointCallback = controlPointCallback
  }

  // Central sends a command to the Control Point
  // No need to handle any request to have this working
  onWriteRequest (data, offset, withoutResponse, callback) {
  }
}
