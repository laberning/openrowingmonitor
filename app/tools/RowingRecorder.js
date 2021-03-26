'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  A utility to record and replay flywheel measurements for development purposes.
*/
import { fork } from 'child_process'
import fs from 'fs'
import readline from 'readline'
import log from 'loglevel'

function recordRowingSession (filename) {
  // measure the gpio interrupts in another process, since we need
  // to track time close to realtime
  const gpioTimerService = fork('./app/gpio/GpioTimerService.js')
  gpioTimerService.on('message', (dataPoint) => {
    log.debug(dataPoint)
    fs.appendFile(filename, `${dataPoint}\n`, (err) => { if (err) log.error(err) })
  })
}

async function replayRowingSession (rotationImpulseHandler, options) {
  if (!options?.filename) {
    log.error('can not replay rowing session without filename')
    return
  }

  do {
    await replayRowingFile(rotationImpulseHandler, options)
  // infinite looping only available when using realtime
  } while (options.loop && options.realtime)
}

async function replayRowingFile (rotationImpulseHandler, options) {
  const fileStream = fs.createReadStream(options.filename)
  const readLine = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  for await (const line of readLine) {
    const dt = parseFloat(line)
    // if we want to replay in the original time, wait dt seconds
    if (options.realtime) await wait(dt * 1000)
    rotationImpulseHandler(dt)
  }
}

async function wait (ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

export {
  recordRowingSession,
  replayRowingSession
}
