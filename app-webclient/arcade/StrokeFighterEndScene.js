'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Implements the Game Over Screen of the Stroke Fighter Game
*/

import addSpaceBackground from './SpaceBackground.js'
import { addButton, createRowingDetector } from './arcadeHelper.js'

/**
 * Creates the game over screen scene of Storke Fighter
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

  addButton({
    k,
    pos: k.vec2(k.width() / 2, 440),
    width: 300,
    height: 60,
    text: 'Restart',
    textOptions: { size: 40 },
    onClick: () => { k.go('strokeFighterStart') }
  })

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

  let appState
  if (args?.overtimePossible) {
    const rowingDetector = createRowingDetector(5000, driveFinished)

    appState = function (appState) {
      rowingDetector.appState(appState)
    }
    function driveFinished (metrics) {
      k.go('strokeFighterBattle', args)
    }
  }

  return {
    appState
  }
}
