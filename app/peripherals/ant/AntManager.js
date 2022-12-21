'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This manager creates a module to listen to ANT+ devices.
  This currently can be used to get the heart rate from ANT+ heart rate sensors.

  Requires an ANT+ USB stick, the following models might work:
  - Garmin USB or USB2 ANT+ or an off-brand clone of it (ID 0x1008)
  - Garmin mini ANT+ (ID 0x1009)
*/
import log from 'loglevel'
import { AntDevice } from 'incyclist-ant-plus/lib/ant-device.js'

export default class AntManager {
  _isStickOpen = false
  _stick = new AntDevice({ startupTimeout: 2000 })

  async openAntStick () {
    if (this._isStickOpen) return
    if (!(await this._stick.open())) { throw (new Error('Error opening Ant Stick')) }

    log.info('ANT+ stick found')
    this._isStickOpen = true
  }

  async closeAntStick () {
    if (!this._isStickOpen) return

    if (!(await this._stick.close())) { throw (new Error('Error closing Ant Stick')) }

    log.info('ANT+ stick is closed')
    this._isStickOpen = false
  }

  isStickOpen () {
    return this._isStickOpen
  }

  getAntStick () {
    return this._stick
  }
}
