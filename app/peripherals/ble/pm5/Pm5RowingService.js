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
import MultiplexedCharacteristic from './characteristic/MultiplexedCharacteristic.js'
import GeneralStatus from './characteristic/GeneralStatus.js'
import AdditionalStatus from './characteristic/AdditionalStatus.js'
import AdditionalStatus2 from './characteristic/AdditionalStatus2.js'
import AdditionalStrokeData from './characteristic/AdditionalStrokeData.js'
import StrokeData from './characteristic/StrokeData.js'
import StaticNotifyCharacteristic from '../common/StaticNotifyCharacteristic.js'

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
        new StaticNotifyCharacteristic(getFullUUID('0034'), 'samplerate', 'samplerate', true),
        // C2 rowing stroke data
        strokeData,
        // C2 rowing additional stroke data
        additionalStrokeData,
        // C2 rowing split/interval data
        new StaticNotifyCharacteristic(getFullUUID('0037'), 'split data', 'split data', true),
        // C2 rowing additional split/interval data
        new StaticNotifyCharacteristic(getFullUUID('0038'), 'additional split data', 'additional split data', true),
        // C2 rowing end of workout summary data
        new StaticNotifyCharacteristic(getFullUUID('0039'), 'workout summary', 'workout summary', true),
        // C2 rowing end of workout additional summary data
        new StaticNotifyCharacteristic(getFullUUID('003A'), 'additional workout summary', 'additional workout summary', true),
        // C2 rowing heart rate belt information
        new StaticNotifyCharacteristic(getFullUUID('003B'), 'heart rate belt information', 'heart rate belt information', true),
        // C2 force curve data
        new StaticNotifyCharacteristic(getFullUUID('003D'), 'force curve data', 'force curve data', true),
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

  notifyData (type, data) {
    if (type === 'strokeFinished' || type === 'metricsUpdate') {
      this.generalStatus.notify(data)
      this.additionalStatus.notify(data)
      this.additionalStatus2.notify(data)
      this.strokeData.notify(data)
      this.additionalStrokeData.notify(data)
    } else if (type === 'strokeStateChanged') {
      // the stroke state is delivered via the GeneralStatus Characteristic, so we only need to notify that one
      this.generalStatus.notify(data)
    }
  }
}
