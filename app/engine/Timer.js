'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Stopwatch used to measure multiple time intevals
*/
function createTimer () {
  const timerMap = new Map()

  function start (key) {
    timerMap.set(key, 0.0)
  }

  function stop (key) {
    timerMap.delete(key)
  }

  function getValue (key) {
    return timerMap.get(key) || 0.0
  }

  function updateTimers (currentDt) {
    timerMap.forEach((value, key) => {
      timerMap.set(key, value + currentDt)
    })
  }

  return {
    start,
    stop,
    getValue,
    updateTimers
  }
}

export { createTimer }
