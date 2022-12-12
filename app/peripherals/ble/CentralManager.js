'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This manager creates a Bluetooth Low Energy (BLE) Central that listens
  and subscribes to heart rate services
*/
import log from 'loglevel'
import EventEmitter from 'node:events'
import Noble from '@abandonware/noble/lib/noble.js'
import NobleBindings from '@abandonware/noble/lib/hci-socket/bindings.js'

// We are using peripherals and centrals at the same time (with bleno and noble).
// The libraries do not play nice together in this scenario when they see peripherals
// from each other via the HCI-Socket.
// This is a quick patch for two handlers in noble that would otherwise throw warnings
// when they see a peripheral or handle that is managed by bleno

// START of noble patch
Noble.prototype.onRssiUpdate = function (peripheralUuid, rssi) {
  const peripheral = this._peripherals[peripheralUuid]

  if (peripheral) {
    peripheral.rssi = rssi
    peripheral.emit('rssiUpdate', rssi)
  }
}

NobleBindings.prototype.onDisconnComplete = function (handle, reason) {
  const uuid = this._handles[handle]

  if (uuid) {
    this._aclStreams[handle].push(null, null)
    this._gatts[handle].removeAllListeners()
    this._signalings[handle].removeAllListeners()

    delete this._gatts[uuid]
    delete this._gatts[handle]
    delete this._signalings[uuid]
    delete this._signalings[handle]
    delete this._aclStreams[handle]
    delete this._handles[uuid]
    delete this._handles[handle]

    this.emit('disconnect', uuid)
  }
}

const noble = new Noble(new NobleBindings())
// END of noble patch

function createCentralManager () {
  const emitter = new EventEmitter()
  let batteryLevel

  noble.on('stateChange', (state) => {
    if (state === 'poweredOn') {
      // search for heart rate service
      noble.startScanning(['180d'], false)
    } else {
      noble.stopScanning()
    }
  })

  noble.on('discover', (peripheral) => {
    noble.stopScanning()
    connectHeartratePeripheral(peripheral)
  })

  function connectHeartratePeripheral (peripheral) {
    // connect to the heart rate sensor
    peripheral.connect((error) => {
      if (error) {
        log.error(error)
        return
      }
      log.info(`heart rate peripheral connected, name: '${peripheral.advertisement?.localName}', id: ${peripheral.id}`)
      subscribeToHeartrateMeasurement(peripheral)
    })

    peripheral.once('disconnect', () => {
      // todo: figure out if we have to dispose the peripheral somehow to prevent memory leaks
      log.info('heart rate peripheral disconnected, searching new one')
      batteryLevel = undefined
      noble.startScanning(['180d'], false)
    })
  }

  // see https://www.bluetooth.com/specifications/specs/heart-rate-service-1-0/
  function subscribeToHeartrateMeasurement (peripheral) {
    const heartrateMeasurementUUID = '2a37'
    const batteryLevelUUID = '2a19'

    peripheral.discoverSomeServicesAndCharacteristics([], [heartrateMeasurementUUID, batteryLevelUUID],
      (error, services, characteristics) => {
        if (error) {
          log.error(error)
          return
        }

        const heartrateMeasurementCharacteristic = characteristics.find(
          characteristic => characteristic.uuid === heartrateMeasurementUUID
        )

        const batteryLevelCharacteristic = characteristics.find(
          characteristic => characteristic.uuid === batteryLevelUUID
        )

        if (heartrateMeasurementCharacteristic !== undefined) {
          heartrateMeasurementCharacteristic.notify(true, (error) => {
            if (error) {
              log.error(error)
              return
            }

            heartrateMeasurementCharacteristic.on('data', (data, isNotification) => {
              const buffer = Buffer.from(data)
              const flags = buffer.readUInt8(0)
              // bits of the feature flag:
              // 0: Heart Rate Value Format
              // 1 + 2: Sensor Contact Status
              // 3: Energy Expended Status
              // 4: RR-Interval
              const heartrateUint16LE = flags & 0b1

              // from the specs:
              // While most human applications require support for only 255 bpm or less, special
              // applications (e.g. animals) may require support for higher bpm values.
              // If the Heart Rate Measurement Value is less than or equal to 255 bpm a UINT8 format
              // should be used for power savings.
              // If the Heart Rate Measurement Value exceeds 255 bpm a UINT16 format shall be used.
              const heartrate = heartrateUint16LE ? buffer.readUInt16LE(1) : buffer.readUInt8(1)
              emitter.emit('heartrateMeasurement', { heartrate, batteryLevel })
            })
          })
        }

        if (batteryLevelCharacteristic !== undefined) {
          batteryLevelCharacteristic.notify(true, (error) => {
            if (error) {
              log.error(error)
              return
            }

            batteryLevelCharacteristic.on('data', (data, isNotification) => {
              const buffer = Buffer.from(data)
              batteryLevel = buffer.readUInt8(0)
            })
          })
        }
      })
  }

  return Object.assign(emitter, {
  })
}

export { createCentralManager }
