'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Starts the central manager in a forked thread since noble does not like
  to run in the same thread as bleno
  todo: check if noble would also work if we move this into a worker thread
  (would save some ressources)
*/
import { createCentralManager } from './CentralManager.js'
import process from 'process'
import config from '../config.js'
import log from 'loglevel'

log.setLevel(config.loglevel.default)
const centralManager = createCentralManager()

centralManager.on('heartrateMeasurement', (heartrateMeasurement) => {
  process.send(heartrateMeasurement)
})
