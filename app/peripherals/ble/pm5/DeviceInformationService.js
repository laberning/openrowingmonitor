'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Provides the required Device Information of the PM5
*/
import bleno from '@abandonware/bleno'
import StaticNotifyCharacteristic from '../common/StaticNotifyCharacteristic.js'
import { getFullUUID, pm5Constants } from './Pm5Constants.js'

export default class DeviceInformationService extends bleno.PrimaryService {
  constructor () {
    super({
      // InformationenService uuid as defined by the PM5 specification
      uuid: getFullUUID('0010'),
      characteristics: [
        // C2 module number string
        new StaticNotifyCharacteristic(getFullUUID('0011'), 'model', 'PM5', true),
        // C2 serial number string
        new StaticNotifyCharacteristic(getFullUUID('0012'), 'serial', pm5Constants.serial, true),
        // C2 hardware revision string
        new StaticNotifyCharacteristic(getFullUUID('0013'), 'hardwareRevision', pm5Constants.hardwareRevision, true),
        // C2 firmware revision string
        new StaticNotifyCharacteristic(getFullUUID('0014'), 'firmwareRevision', pm5Constants.firmwareRevision, true),
        // C2 manufacturer name string
        new StaticNotifyCharacteristic(getFullUUID('0015'), 'manufacturer', pm5Constants.manufacturer, true),
        // Erg Machine Type
        new StaticNotifyCharacteristic(getFullUUID('0016'), 'ergMachineType', pm5Constants.ergMachineType, true)
      ]
    })
  }
}
