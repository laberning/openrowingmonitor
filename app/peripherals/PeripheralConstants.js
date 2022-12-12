'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Some PM5 specific constants
*/
export const PeripheralConstants = {
  serial: '123456789',
  model: 'PM5',
  name: 'PM5 123456789 Row',
  hardwareRevision: '907',
  // See https://www.concept2.com/service/monitors/pm5/firmware for available versions
  // please note: hardware versions exclude a software version, and thus might confuse the client
  firmwareRevision: '210',
  manufacturer: 'Concept2'
}
