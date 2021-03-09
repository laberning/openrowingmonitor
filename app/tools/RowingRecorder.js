'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  A quick hack to record measurements from the rowing machine for development purposes.
*/
import { fork } from 'child_process'

import fs from 'fs'
import log from 'loglevel'

function recordRowingSession (filename) {
  // measure the gpio interrupts in another process, since we need
  // to track time close to realtime
  const gpioTimerService = fork('./app/tools/GpioTimerService.js')
  gpioTimerService.on('message', (dataPoint) => {
    log.debug(dataPoint.delta)
    fs.appendFile(filename, `${dataPoint.delta}\n`, (err) => { if (err) log.error(err) })
  })
}

export { recordRowingSession }
