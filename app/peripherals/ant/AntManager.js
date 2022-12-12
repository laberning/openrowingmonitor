'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This manager creates a module to listen to ANT+ devices.
  This currently can be used to get the heart rate from ANT+ heart rate sensors.

  Requires an ANT+ USB stick, the following models might work:
  - Garmin USB or USB2 ANT+ or an off-brand clone of it (ID 0x1008)
  - Garmin mini ANT+ (ID 0x1009)
*/
import Ant from 'ant-plus'

export default class AntManager {
  constructor () {
  // it seems that we have to use two separate heart rate sensors to support both old and new
  // ant sticks, since the library requires them to be bound before open is called
    this._stick = new Ant.GarminStick3() // 0fcf:1009
    if (!this._stick.is_present()) {
      this._stick = new Ant.GarminStick2() // 0fcf:1008
    }
  }

  openAntStick () {
    if (!this._stick.open()) {
      return false
    }
    return this._stick
  }

  getAntStick () {
    return this._stick
  }
}
