'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This seems to be the central service to get information about the workout
  This Primary Service provides a lot of stuff that we most certainly do not need to simulate a
  simple PM5 service.

  todo: figure out to which services some common applications subscribe and then just implement those
*/
import bleno from '@abandonware/bleno'
import { getFullUUID } from './Pm5Constants.js'
import ValueReadCharacteristic from './ValueReadCharacteristic.js'

export default class PM5RowingService extends bleno.PrimaryService {
  constructor () {
    super({
      uuid: getFullUUID('0030'),
      characteristics: [
        // C2 rowing general status
        new ValueReadCharacteristic(getFullUUID('0031'), 'rowing status', 'rowing status'),
        // C2 rowing additional status
        new ValueReadCharacteristic(getFullUUID('0032'), 'additional status', 'additional status'),
        // C2 rowing additional status 2
        new ValueReadCharacteristic(getFullUUID('0033'), 'additional status 2', 'additional status 2'),
        // C2 rowing general status and additional status samplerate
        new ValueReadCharacteristic(getFullUUID('0034'), 'samplerate', 'samplerate'),
        // C2 rowing stroke data
        new ValueReadCharacteristic(getFullUUID('0035'), 'stroke data', 'stroke data'),
        // C2 rowing additional stroke data
        new ValueReadCharacteristic(getFullUUID('0036'), 'additional stroke data', 'additional stroke data'),
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
        new ValueReadCharacteristic(getFullUUID('0080'), 'multiplexed information', 'multiplexed information')
      ]
    })
  }
}
