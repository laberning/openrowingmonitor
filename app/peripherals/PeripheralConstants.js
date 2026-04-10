'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
/**
 * @file Some constants used by the peripherals and especially the PM5 interface
 *
 * @remark please note: hardware versions exclude a software version, and thus might confuse the client
 * See https://www.concept2.com/service/monitors/pm5/firmware for available versions
 * For ErgZone, it is crucial to set the manufacturer to the appname to correctly handle our data
 */
export const PeripheralConstants = {
  serial: '431099999',
  model: 'PM5',
  name: 'PM5 431099999',
  hardwareRevision: '634',
  firmwareRevision: '8200-000372-176.000',
  manufacturer: `${process.env.npm_package_name || ''}`
}

export const bleBroadcastInterval = 1000
export const bleMinimumKnowDataUpdateInterval = 4000
