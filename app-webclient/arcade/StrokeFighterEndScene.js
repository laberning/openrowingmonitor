'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Implements the Game Over Screen of the Stroke Fighter Game
*/

import addSpaceBackground from './SpaceBackground.js'

/**
 * Creates the main scene of Storke Fighter
 * @param {import('kaboom').KaboomCtx} k Kaboom Context
 * @param {Object} args the game state
 */
export default function StrokeFighterEndScene (k, args) {
  addSpaceBackground(k)

  k.add([
    k.text('Stroke Fighter', { size: 50 }),
    k.pos(k.width() / 2, 50),
    k.origin('center')
  ])
  if (args?.gameState === 'LOST') {
    k.add([
      k.text('Game Over', { size: 40 }),
      k.pos(k.width() / 2, 180),
      k.origin('center')
    ])
  } else {
    k.add([
      k.text('You win!', { size: 40 }),
      k.pos(k.width() / 2, 180),
      k.origin('center')
    ])
  }
  k.add([
    k.sprite('playerShip'),
    k.scale(0.5),
    k.pos(k.width() / 2, 320),
    k.origin('center')
  ])

  const restartButton = k.add([
    k.rect(300, 60),
    k.area(),
    k.pos(k.width() / 2, 440),
    k.scale(1),
    k.origin('center'),
    k.outline(2, k.rgb(255, 255, 255)),
    k.color(54, 80, 128)
  ])
  const restartText = k.add([
    k.text('Restart', { size: 40 }),
    k.area({ cursor: 'pointer' }),
    k.pos(k.width() / 2, 440),
    k.scale(1),
    k.origin('center'),
    k.color(255, 255, 255)
  ])

  if (args?.overtimePossible) {
    if (args?.gameState === 'LOST') {
      k.add([
        k.text('or keep rowing to continue your workout', { size: 18 }),
        k.pos(k.width() / 2, 650),
        k.origin('center')
      ])
    } else {
      k.add([
        k.text('or keep rowing for an insane challenge', { size: 18 }),
        k.pos(k.width() / 2, 650),
        k.origin('center')
      ])
    }
  }
  restartButton.onClick(() => {
    k.go('strokeFighterStart')
  })
  restartButton.onUpdate(() => {
    if (restartButton.isHovering()) {
      k.cursor('pointer')
      restartButton.scale = k.vec2(1.2)
      restartText.scale = k.vec2(1.2)
      const t = k.time() * 10
      restartButton.color = k.rgb(
        k.wave(0, 255, t),
        k.wave(0, 255, t + 2),
        k.wave(0, 255, t + 4)
      )
    } else {
      k.cursor('default')
      restartButton.scale = k.vec2(1)
      restartText.scale = k.vec2(1)
      restartButton.color = k.rgb(54, 80, 128)
    }
  })

  let motionDetectionEnabled = false
  if (args?.overtimePossible) {
    k.wait(5, () => {
      motionDetectionEnabled = true
    })
  }

  let lastStrokeState = 'DRIVING'
  function appState (appState) {
    if (!motionDetectionEnabled) {
      return
    }
    if (appState?.metrics.strokeState === undefined) {
      return
    }
    if (lastStrokeState === 'DRIVING' && appState.metrics.strokeState === 'RECOVERY') {
      driveFinished(appState.metrics)
    }
    lastStrokeState = appState.metrics.strokeState
  }

  function driveFinished (metrics) {
    k.go('strokeFighterBattle', args)
  }

  return {
    appState
  }
}
