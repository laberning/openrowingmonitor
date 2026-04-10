'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Implementation of the StrokeData as defined in:
  * https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
  * https://www.concept2.co.uk/files/pdf/us/monitors/PM5_CSAFECommunicationDefinition.pdf
*/
import * as assert from 'uvu/assert'
import { suite } from 'uvu'

import { ForceCurveCharacteristic } from './ForceCurveCharacteristic.js'

const forceCurveCharacteristicTest = suite('forceCurveCharacteristicTest')

const forceCurveData = [
  35.20670409437894,
  71.24770979105799,
  106.76058707196907,
  147.62432375433332,
  191.5017876211155,
  235.26113001328616,
  285.14921813760674,
  338.01652172714535,
  401.54844368830413,
  462.9684206861586,
  520.4309477550664,
  573.8735122191848,
  617.7803577159515,
  658.609156242382,
  691.0795556356153,
  715.9043059583466,
  737.5400595447022,
  758.8198585977392,
  778.25735407793,
  795.473250100066,
  807.7661782745965,
  811.9359865006522,
  810.2206520776575,
  807.0270703264409,
  806.6963977594922,
  808.9560093066058,
  818.9517239399365,
  826.5161273484823,
  833.0787018711079,
  839.845516255648,
  845.5665462319271,
  851.3611235382654,
  848.4630663040393,
  845.9163188145909,
  848.1255040084359,
  848.4453794744273,
  844.9025006222316,
  840.8804872376313,
  829.9345489599933,
  821.9625255043932,
  814.1660656845103,
  806.0440103036917,
  796.8336476973348,
  786.5688734689126,
  777.296276624122,
  767.9240460566771,
  756.7011323288369,
  741.7714956570477,
  724.67666952788,
  706.5588388338806,
  687.2327020446613,
  667.9257890807414,
  651.0351359410047,
  633.1182926458321,
  617.5187416137509,
  600.2718592907876,
  586.8141420790122,
  568.8362812133483,
  544.0601844649392,
  515.112740526092,
  485.99678442336335,
  454.0430973642798,
  417.64606900272526,
  381.02246993296194,
  339.2866769162796,
  295.08431352641287,
  246.90612619654942,
  202.26069534863754,
  156.8359639803434,
  115.97725171265056,
  84.85233788062578,
  59.11168213118775,
  32.0896186351397
]

const expectedForceCurveData = forceCurveData.map((data) => Math.round(data * 0.224809))

forceCurveCharacteristicTest('should split force curve data into 20 byte chunks', () => {
  const characteristic = new ForceCurveCharacteristic(/** @type {import('../other-characteristics/MultiplexedCharacteristic.js').MultiplexedCharacteristic} */({
    // eslint-disable-next-line no-unused-vars
    notify: (_id, _buffer) => {
    }
  }))

  characteristic.characteristic.onSubscriptionChange(/** @type {import('../../../ble-host.interface.js').Connection} */({}), true)

  /**
   * @type {Array<Array<number>>}
   */
  const outputBuffer = []
  characteristic.characteristic.notify = (_connection, buffer) => {
    if (typeof buffer === 'string') {
      return true
    }

    outputBuffer.push([...buffer])

    return true
  }

  characteristic.notify(/** @type {Metrics} */({ driveHandleForceCurve: forceCurveData }))

  const maxDataSize = 20
  const dataPerNotify = Math.floor((maxDataSize - 2) / 2) // (Max package size 20 bytes - C2 characteristic header size) / dataByteLength
  const expectedNumberOfNotifies = Math.floor(forceCurveData.length / dataPerNotify + (forceCurveData.length % dataPerNotify === 0 ? 0 : 1))

  assert.is(outputBuffer.length, expectedNumberOfNotifies)
})

forceCurveCharacteristicTest('should broadcast correct data', () => {
  const characteristic = new ForceCurveCharacteristic(/** @type {import('../other-characteristics/MultiplexedCharacteristic.js').MultiplexedCharacteristic} */({
    // eslint-disable-next-line no-unused-vars
    notify: (_id, _buffer) => {
    }
  }))

  characteristic.characteristic.onSubscriptionChange(/** @type {import('../../../ble-host.interface.js').Connection} */({}), true)

  /**
   * @type {Array<Array<number>>}
   */
  const outputBuffer = []
  characteristic.characteristic.notify = (_connection, buffer) => {
    if (typeof buffer === 'string') {
      return true
    }

    outputBuffer.push([...buffer])

    return true
  }

  characteristic.notify(/** @type {Metrics} */({ driveHandleForceCurve: forceCurveData }))

  const maxDataSize = 20
  const dataPerNotify = Math.floor((maxDataSize - 2) / 2) // (Max package size 20 bytes - C2 characteristic header size) / dataByteLength
  const expectedNumberOfNotifies = Math.floor(forceCurveData.length / dataPerNotify + (forceCurveData.length % dataPerNotify === 0 ? 0 : 1))

  assert.equal(outputBuffer.map((data) => [data[0], data[1]]), outputBuffer.map((data, index) => [(expectedNumberOfNotifies << 4) | ((data.length - 2) / 2 & 0x0F), index]), 'Notification flag bytes')
  assert.is(outputBuffer.reduce((sum, data) => data.slice(2).length / 2 + sum, 0), expectedForceCurveData.length, 'Notified data length')
  assert.equal(outputBuffer.reduce((forceData, data) => {
    const forces = data.slice(2)
    for (let index = 1; index < forces.length; index = index + 2) {
      forceData.push(forces[index - 1] | forces[index] << 8)
    }

    return forceData
  }, []), expectedForceCurveData.map((data) => Math.round(data)), 'Notified data value')
})

forceCurveCharacteristicTest.run()
