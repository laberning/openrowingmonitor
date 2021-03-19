'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This seems to be the central service to get information about the workout
  This Primary Service provides a lot of stuff that we most certainly do not need to simulate a
  simple PM5 service.

  todo: figure out to which services some common applications subscribe and then just implement those
  // fluid simulation uses GeneralStatus STROKESTATE_DRIVING
  // cloud simulation uses MULTIPLEXER, AdditionalStatus -> currentPace
  // EXR: subscribes to: 'general status', 'additional status', 'additional status 2', 'additional stroke data'
  Might implement:
  * GeneralStatus
  * AdditionalStatus
  * AdditionalStatus2
  * (StrokeData)
  * AdditionalStrokeData
  * and of course the multiplexer
*/
import bleno from '@abandonware/bleno'
import { getFullUUID } from './Pm5Constants.js'
import ValueReadCharacteristic from './characteristic/ValueReadCharacteristic.js'
import MultiplexedCharacteristic from './characteristic/MultiplexedCharacteristic.js'
import GeneralStatus from './characteristic/GeneralStatus.js'
import AdditionalStatus from './characteristic/AdditionalStatus.js'
import AdditionalStatus2 from './characteristic/AdditionalStatus2.js'
import AdditionalStrokeData from './characteristic/AdditionalStrokeData.js'
import StrokeData from './characteristic/StrokeData.js'

export default class PM5RowingService extends bleno.PrimaryService {
  constructor () {
    const multiplexedCharacteristic = new MultiplexedCharacteristic()
    const generalStatus = new GeneralStatus(multiplexedCharacteristic)
    const additionalStatus = new AdditionalStatus(multiplexedCharacteristic)
    const additionalStatus2 = new AdditionalStatus2(multiplexedCharacteristic)
    const strokeData = new StrokeData(multiplexedCharacteristic)
    const additionalStrokeData = new AdditionalStrokeData(multiplexedCharacteristic)
    super({
      uuid: getFullUUID('0030'),
      characteristics: [
        // C2 rowing general status
        generalStatus,
        // C2 rowing additional status
        additionalStatus,
        // C2 rowing additional status 2
        additionalStatus2,
        // C2 rowing general status and additional status samplerate
        new ValueReadCharacteristic(getFullUUID('0034'), 'samplerate', 'samplerate'),
        // C2 rowing stroke data
        strokeData,
        // C2 rowing additional stroke data
        additionalStrokeData,
        // C2 rowing split/interval data
        new ValueReadCharacteristic(getFullUUID('0037'), 'split data', 'split data'),
        // C2 rowing additional split/interval data
        new ValueReadCharacteristic(getFullUUID('0038'), 'additional split data', 'additional split data'),
        // C2 rowing end of workout summary data
        new ValueReadCharacteristic(getFullUUID('0039'), 'workout summary', 'workout summary'),
        // C2 rowing end of workout additional summary data
        new ValueReadCharacteristic(getFullUUID('003A'), 'additional workout summary', 'additional workout summary'),
        // C2 rowing heart rate belt information
        new ValueReadCharacteristic(getFullUUID('003B'), 'heart rate belt information', 'heart rate belt information'),
        // C2 force curve data
        new ValueReadCharacteristic(getFullUUID('003D'), 'force curve data', 'force curve data'),
        // C2 multiplexed information
        multiplexedCharacteristic
      ]
    })
    this.generalStatus = generalStatus
    this.additionalStatus = additionalStatus
    this.additionalStatus2 = additionalStatus2
    this.strokeData = strokeData
    this.additionalStrokeData = additionalStrokeData
    this.multiplexedCharacteristic = multiplexedCharacteristic
  }

  notify (data) {
    this.generalStatus.notify(data)
    this.additionalStatus.notify(data)
    this.additionalStatus2.notify(data)
    this.strokeData.notify(data)
    this.additionalStrokeData.notify(data)
  }
}
