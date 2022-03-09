'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Implements some common helpers for the games
*/

/**
 * creates a button in the active game scene
 */
export function addButton ({ k, node = k, pos, width, height, text, textOptions, onClick }) {
  const button = node.add([
    k.rect(width, height),
    k.area(),
    k.pos(pos),
    k.origin('center'),
    k.outline(2, k.rgb(0, 0, 0)),
    k.color(54, 80, 128)
  ])
  node.add([
    k.text(text, textOptions),
    k.area({ cursor: 'pointer' }),
    k.pos(button.pos.add(2, 1)),
    k.origin('center'),
    k.color(255, 255, 255)
  ])

  button.onClick(() => {
    onClick()
  })

  button.onUpdate(() => {
    if (button.isHovering()) {
      k.cursor('pointer')
    } else {
      // todo: resetting the cursor here will not work as expected if we have multiple buttons on the page
      // seems like kaboom does not yet have an elegant way of how to do this...
      k.cursor('default')
      button.color = k.rgb(54, 80, 128)
    }
  })
}

/**
   * creates a detector that can be used to detect when the user begins rowing
   * @param {number} initialDelay initial delay in milliseconds before monitoring starts
   * @param {Function} activityCallback callback function which is called when rowing begins
   * @returns {Object}
   */
export function createRowingDetector (initialDelay, activityCallback) {
  let motionDetectionEnabled = false
  let lastStrokeState = 'DRIVING'

  setTimeout(() => {
    motionDetectionEnabled = true
  }, initialDelay)

  function appState (appState) {
    if (!motionDetectionEnabled) {
      return
    }
    if (appState?.metrics.strokeState === undefined) {
      return
    }
    if (lastStrokeState === 'RECOVERY' && appState.metrics.strokeState === 'DRIVING') {
      if (activityCallback) {
        motionDetectionEnabled = false
        activityCallback(appState.metrics)
      }
    }
    lastStrokeState = appState.metrics.strokeState
  }
  return {
    appState
  }
}
