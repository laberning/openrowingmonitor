'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Starts the central manager in a forked thread since noble does not like
  to run in the same thread as bleno
*/
import process from 'process'
import log from 'loglevel'
import config from '../../../tools/ConfigManager.js'
import { createHeartRateManager } from './HeartRateManager.js'

log.setLevel(config.loglevel.default)
const heartRateManager = createHeartRateManager()
heartRateManager.on('heartRateMeasurement', (heartRateMeasurement) => {
  process.send(heartRateMeasurement)
})
