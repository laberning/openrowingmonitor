'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  A utility to record and replay flywheel measurements for development purposes.
*/

import fs from 'fs'
import readline from 'readline'
import log from 'loglevel'

async function replayRowingSession (rotationImpulseHandler, options) {
  if (!options?.filename) {
    log.error('can not replay rowing session without filename')
    return
  }

  do {
    /* eslint-disable-next-line no-await-in-loop -- delay is by design, to simulate true real-time behaviour */
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
    if (options.realtime) { await wait(dt * 1000) }
    rotationImpulseHandler(dt)
  }
}

async function wait (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export {
  replayRowingSession
}
