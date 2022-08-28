'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Measures the time between impulses on the GPIO pin. Started in a
  separate thread, since we want the measured time to be as close as
  possible to real time.
*/
import process from 'process'
import { Gpio } from 'onoff'
import os from 'os'
import config from '../tools/ConfigManager.js'
import log from 'loglevel'

log.setLevel(config.loglevel.default)

export function createGpioTimerService () {
  if (Gpio.accessible) {
    if (config.gpioPriority) {
      // setting top (near-real-time) priority for the Gpio process, as we don't want to miss anything
      log.debug(`Setting priority for the Gpio-service to ${config.gpioPriority}`)
      try {
        // setting priority of current process
        os.setPriority(config.gpioPriority)
      } catch (err) {
        log.debug('need root permission to set priority of Gpio-Thread')
      }
    }

    // read the sensor data from one of the Gpio pins of Raspberry Pi
    const sensor = new Gpio(config.gpioPin, 'in', 'rising')
    // use hrtime for time measurement to get a higher time precision
    let hrStartTime = process.hrtime()

    // assumes that GPIO-Port 17 is set to pullup and reed is connected to GND
    // therefore the value is 1 if the reed sensor is open
    sensor.watch((err, value) => {
      if (err) {
        throw err
      }
      const hrDelta = process.hrtime(hrStartTime)
      hrStartTime = process.hrtime()
      const delta = hrDelta[0] + hrDelta[1] / 1e9
      process.send(delta)
    })
  } else {
    log.info('reading from Gpio is not (yet) supported on this platform')
  }
}

createGpioTimerService()
