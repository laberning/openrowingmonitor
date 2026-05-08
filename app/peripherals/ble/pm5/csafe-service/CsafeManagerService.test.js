'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
import * as assert from 'uvu/assert'
import { suite } from 'uvu'

import { CsafeManagerService } from './CsafeManagerService.js'
import { ProprietaryLongSetDataCommands } from './CsafeCommandsMapping.js'

const cafeManagerService = suite('CsafeManagerService')

cafeManagerService('should handle CSAFE_PM_GET_EXTENDED_HRBELT_INFO', () => {
  const expectedBuffer = [0xF1, 0x01, 0x7F, 0x09, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x27, 0xF2]
  const csafeManager = new CsafeManagerService(/** @type {any} */ ({
    notify: (/** @type {Buffer} */buffer) => {
      assert.equal([...buffer], expectedBuffer)
    }
  }), /** @type {any} */ () => { return false })

  csafeManager.processCommand([0xF1, 0x7F, 0x03, 0x57, 0x01, 0x00, 0x2A, 0xF2])
})

cafeManagerService('should handle CSAFE_PM_SET_EXTENDED_HRBELT_INFO', () => {
  const expectedBuffer = [0xF0, 0x00, 0xFD, 0x01, 0x77, 0x01, ProprietaryLongSetDataCommands.CSAFE_PM_SET_EXTENDED_HRBELT_INFO, 0x4E, 0xF2]
  const csafeManager = new CsafeManagerService(/** @type {any} */ ({
    notify: (/** @type {Buffer} */buffer) => {
      assert.equal([...buffer], expectedBuffer)
    }
  }), /** @type {any} */ () => { return false })

  csafeManager.processCommand([0xF0, 0xFD, 0x00, 0x77, 0x09, ProprietaryLongSetDataCommands.CSAFE_PM_SET_EXTENDED_HRBELT_INFO, 0x07, 0x00, 0x0A, 0x00, 0xB0, 0x2F, 0xCD, 0x62, 0x7A, 0xF2])
})

cafeManagerService('should create the response including commands that are not handled specifically', () => {
  const expectedBuffer = [0xF1, 0x01, 0x7F, 0x0a, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x39, 0x1d, 0xF2]
  const csafeManager = new CsafeManagerService(/** @type {any} */ ({
    notify: (/** @type {Buffer} */buffer) => {
      assert.equal([...buffer], expectedBuffer)
    }
  }), /** @type {any} */ () => { return false })

  csafeManager.processCommand([0xF1, 0x7F, 0x04, 0x57, 0x01, 0x00, 0x39, 0x14, 0xF2])
})

cafeManagerService('should handle extended frame responses', () => {
  const expectedBuffer = [0xF0, 0x00, 0xFD, 0x01, 0x77, 0x01, 0x39, 0x4E, 0xF2]
  const csafeManager = new CsafeManagerService(/** @type {any} */ ({
    notify: (/** @type {Buffer} */buffer) => {
      assert.equal([...buffer], expectedBuffer)
    }
  }), /** @type {any} */ () => { return false })

  csafeManager.processCommand([0xf0, 0xfd, 0x00, 0x77, 0x09, 0x39, 0x07, 0x00, 0x0a, 0x00, 0xb0, 0x2f, 0xcd, 0x62, 0x7a, 0xf2])
})

cafeManagerService.run()
