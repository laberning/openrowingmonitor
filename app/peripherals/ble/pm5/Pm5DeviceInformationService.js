'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Provides the required Device Information of the PM5
*/
import NodeBleHost from 'ble-host'
import loglevel from 'loglevel'

import { GattService } from '../BleManager.js'
import { createStaticReadCharacteristic } from '../common/StaticReadCharacteristic.js'

import { pm5Constants, toC2128BitUUID } from './Pm5Constants.js'
import { BufferBuilder } from '../BufferBuilder.js'

const log = loglevel.getLogger('Peripherals')

export class Pm5DeviceInformationService extends GattService {
  constructor () {
    const firmwareRevision = pm5Constants.firmwareRevision.padEnd(20, '\0')
    const manufacturer = pm5Constants.manufacturer.padEnd(16, '\0')
    const moduleNumber = 'PM5'.padEnd(16, '\0')

    super({
      name: 'Information Service',
      uuid: toC2128BitUUID('0010'),
      characteristics: [
        // C2 module number string
        createStaticReadCharacteristic(toC2128BitUUID('0011'), moduleNumber, 'Model'),
        // C2 serial number string
        createStaticReadCharacteristic(toC2128BitUUID('0012'), pm5Constants.serial, 'Serial'),
        // C2 hardware revision string
        createStaticReadCharacteristic(toC2128BitUUID('0013'), pm5Constants.hardwareRevision, 'Hardware Revision'),
        // C2 firmware revision string - this needs to be exactly 20bytes (anything that is not used a null should be added)
        createStaticReadCharacteristic(toC2128BitUUID('0014'), firmwareRevision, 'Firmware Revision'),
        // C2 manufacturer name string - this needs to be exactly 16bytes (anything that is not used a null should be added)
        createStaticReadCharacteristic(toC2128BitUUID('0015'), manufacturer, 'Manufacturer'),
        // Erg Machine Type - - this needs to be exactly 16bytes (anything that is not used a null should be added)
        createStaticReadCharacteristic(toC2128BitUUID('0016'), [pm5Constants.ergMachineType], 'ErgMachineType'),
        // ATT MTU characteristic
        // TODO: find out why does this prevent ErgData connecting in some cases (its a hit or miss, sometimes it works sometimes it does not. Unclear what the issue could be).
        // {
        //   ...createStaticReadCharacteristic(toC2128BitUUID('0017'), [0x23, 0x00], 'MTU'),
        //   onRead: (connection, callback) => {
        //     const maxMtu = Math.min(connection.gatt.currentMtu, 512)
        //     log.debug(`PM5 MTU characteristic called, current ATT Rx MTU: ${maxMtu} (max: ${connection.gatt.currentMtu})`)
        //     const bufferBuilder = new BufferBuilder()
        //     bufferBuilder.writeUInt16LE(maxMtu)
        //     callback(NodeBleHost.AttErrors.SUCCESS, bufferBuilder.getBuffer())
        //   }
        // },
        // LL DLE characteristic
        {
          ...createStaticReadCharacteristic(toC2128BitUUID('0018'), [27], 'LL DLE'),
          onRead: (connection, callback) => {
            const llMax = Math.min(Math.max(connection.gatt.currentMtu, 27), 251)
            log.debug(`PM5 LL DLE called, current : ${llMax}`)
            const bufferBuilder = new BufferBuilder()
            bufferBuilder.writeUInt16LE(llMax)
            callback(NodeBleHost.AttErrors.SUCCESS, bufferBuilder.getBuffer())
          }
        }
      ]
    })
  }
}
