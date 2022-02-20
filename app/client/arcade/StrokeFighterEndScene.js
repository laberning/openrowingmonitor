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
    k.sprite('playerShip2_orange'),
    k.scale(0.5),
    k.pos(k.width() / 2, 320),
    k.origin('center')
  ])
  const restartButton = k.add([
    k.text('Restart', { size: 40 }),
    k.area({ cursor: 'pointer' }),
    k.pos(k.width() / 2, 440),
    k.origin('center')
  ])

  if (args?.overtimePossible) {
    if (args?.gameState === 'LOST') {
      k.add([
        k.text('or keep rowing to continue your workout', { size: 18 }),
        k.pos(k.width() / 2, 550),
        k.origin('center')
      ])
    } else {
      k.add([
        k.text('or keep rowing for an insane challenge', { size: 18 }),
        k.pos(k.width() / 2, 550),
        k.origin('center')
      ])
    }
  }

  restartButton.onClick(() => {
    console.log('click')
    k.go('strokeFighterStart')
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
