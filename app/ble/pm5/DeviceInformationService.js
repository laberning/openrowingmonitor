'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Provides the required Device Information of the PM5
*/
import bleno from '@abandonware/bleno'
import { constants, getFullUUID } from './Pm5Constants.js'
import ValueReadCharacteristic from './ValueReadCharacteristic.js'

export default class DeviceInformationService extends bleno.PrimaryService {
  constructor () {
    super({
      // InformationenService uuid as defined by the PM5 specification
      uuid: getFullUUID('0010'),
      characteristics: [
        // C2 module number string
        new ValueReadCharacteristic(getFullUUID('0011'), constants.model, 'model'),
        // C2 serial number string
        new ValueReadCharacteristic(getFullUUID('0012'), constants.serial, 'serial'),
        // C2 hardware revision string
        new ValueReadCharacteristic(getFullUUID('0013'), constants.hardwareRevision, 'hardwareRevision'),
        // C2 firmware revision string
        new ValueReadCharacteristic(getFullUUID('0014'), constants.firmwareRevision, 'firmwareRevision'),
        // C2 manufacturer name string
        new ValueReadCharacteristic(getFullUUID('0015'), constants.manufacturer, 'manufacturer'),
        // Erg Machine Type
        new ValueReadCharacteristic(getFullUUID('0016'), constants.ergMachineType, 'ergMachineType')
      ]
    })
  }
}
