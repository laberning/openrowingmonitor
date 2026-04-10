'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
import EventEmitter from 'node:events'

import { HrmService } from './hrm/HrmService.js'

/**
 * @event createBleHrmPeripheral#heartRateMeasurement
 * @param {import ('./BleManager.js').BleManager} bleManager
 */
export function createBleHrmPeripheral (bleManager) {
  /**
   * @type {EventEmitter<{heartRateMeasurement: Array<HeartRateMeasurementEvent>}>}
   */
  const emitter = new EventEmitter()
  /**
   * @type {HrmService | undefined}
   */
  let _hrmService

  async function attach () {
    _hrmService = new HrmService(await bleManager.getManager())

    _hrmService.on('heartRateMeasurement', (data) => {
      emitter.emit('heartRateMeasurement', data)
    })

    _hrmService.start()
  }

  async function destroy () {
    _hrmService?.removeAllListeners()
    await _hrmService?.stop()
  }

  return Object.assign(emitter, {
    destroy,
    attach
  })
}
