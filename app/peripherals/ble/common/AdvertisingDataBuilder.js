'use strict'

export default class AdvertisingDataBuilder {
  constructor (serviceUuids, appearance, longName, shortName) {
    this.shortName = shortName || longName || 'ORM'
    this.longName = longName || 'OpenRowingMonitor'
    this.serviceUuids = serviceUuids || []
    this.appearance = appearance
  }

  setLongName (name) {
    this.longName = name
  }

  setShortName (name) {
    this.shortName = name
  }

  addServiceUuid (serviceUuid) {
    this.serviceUuids.push(serviceUuid)
  }

  setAppearance (appearance) {
    this.appearance = appearance
  }

  buildScanData () {
    let scanDataLength = 0
    scanDataLength += 2 + this.longName.length
    const scanData = Buffer.alloc(scanDataLength)

    const nameBuffer = Buffer.from(this.longName)

    scanData.writeUInt8(1 + nameBuffer.length, 0)
    scanData.writeUInt8(0x08, 1)
    nameBuffer.copy(scanData, 2)

    return scanData
  }

  buildAppearanceData () {
    let advertisementDataLength = 3

    const serviceUuids16bit = []
    const serviceUuids128bit = []
    let i = 0

    if (this.serviceUuids.length) {
      for (i = 0; i < this.serviceUuids.length; i++) {
        const serviceUuid = Buffer.from(this.serviceUuids[i].match(/.{1,2}/g).reverse().join(''), 'hex')

        if (serviceUuid.length === 2) {
          serviceUuids16bit.push(serviceUuid)
        } else if (serviceUuid.length === 16) {
          serviceUuids128bit.push(serviceUuid)
        }
      }
    }

    if (serviceUuids16bit.length) {
      advertisementDataLength += 2 + 2 * serviceUuids16bit.length
    }

    if (serviceUuids128bit.length) {
      advertisementDataLength += 2 + 16 * serviceUuids128bit.length
    }

    if (this.appearance) {
      advertisementDataLength += 4
    }

    let name = this.shortName

    if (advertisementDataLength + 2 + name.length > 31) {
      const remainingDataLength = 31 - advertisementDataLength - 2
      name = name.substring(0, remainingDataLength)
    }
    advertisementDataLength += 2 + name.length

    const advertisementData = Buffer.alloc(advertisementDataLength)

    // flags
    advertisementData.writeUInt8(2, 0)
    advertisementData.writeUInt8(0x01, 1)
    advertisementData.writeUInt8(0x06, 2)

    let advertisementDataOffset = 3

    if (this.appearance) {
      advertisementData.writeUInt8(3, advertisementDataOffset)
      advertisementDataOffset++
      advertisementData.writeUInt8(0x19, advertisementDataOffset)
      advertisementDataOffset++
      advertisementData.writeUInt16LE(this.appearance, advertisementDataOffset)
      advertisementDataOffset += 2
    }

    advertisementData.writeUInt8(name.length + 1, advertisementDataOffset)
    advertisementDataOffset++
    advertisementData.writeUInt8(0x08, advertisementDataOffset)
    advertisementDataOffset++
    Buffer.from(name).copy(advertisementData, advertisementDataOffset)
    advertisementDataOffset += name.length

    if (serviceUuids16bit.length) {
      advertisementData.writeUInt8(1 + 2 * serviceUuids16bit.length, advertisementDataOffset)
      advertisementDataOffset++

      advertisementData.writeUInt8(0x03, advertisementDataOffset)
      advertisementDataOffset++

      for (i = 0; i < serviceUuids16bit.length; i++) {
        serviceUuids16bit[i].copy(advertisementData, advertisementDataOffset)
        advertisementDataOffset += serviceUuids16bit[i].length
      }
    }

    if (serviceUuids128bit.length) {
      advertisementData.writeUInt8(1 + 16 * serviceUuids128bit.length, advertisementDataOffset)
      advertisementDataOffset++

      advertisementData.writeUInt8(0x06, advertisementDataOffset)
      advertisementDataOffset++

      for (i = 0; i < serviceUuids128bit.length; i++) {
        serviceUuids128bit[i].copy(advertisementData, advertisementDataOffset)
        advertisementDataOffset += serviceUuids128bit[i].length
      }
    }

    return advertisementData
  }
}
