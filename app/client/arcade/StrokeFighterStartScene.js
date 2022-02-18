'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Implements the Start Screen of the Stroke Fighter Game
*/

import addSpaceBackground from './SpaceBackground.js'

/**
 * Creates the main scene of Storke Fighter
 * @param {import('kaboom').KaboomCtx} k Kaboom Context
 */
export default function StrokeFighterStartScene (k) {
  k.layers([
    'background',
    'ui'
  ], 'ui')

  addSpaceBackground(k)

  k.add([
    k.text('Stroke Fighter', { size: 50, font: 'sinko' }),
    k.pos(k.width() / 2, 50),
    k.origin('center')
  ])
  k.add([
    k.text('start rowing...', { size: 40, font: 'sinko' }),
    k.pos(k.width() / 2, 110),
    k.origin('center')
  ])

  const shipsPos = k.vec2(450, 260)
  const ship1 = k.add([
    k.sprite('playerShip2_orange'),
    k.pos(shipsPos),
    k.origin('center')
  ])
  addBullet(ship1.pos.sub(0, 65))

  const ship2 = k.add([
    k.sprite('playerShip2_orange'),
    k.pos(shipsPos.add(0, 140)),
    k.origin('center')
  ])
  addBullet(ship2.pos.sub(20, 40))
  addBullet(ship2.pos.sub(-20, 40))

  const ship3 = k.add([
    k.sprite('playerShip2_orange'),
    k.pos(shipsPos.add(0, 280)),
    k.origin('center')
  ])
  addBullet(ship3.pos.sub(0, 65))
  addBullet(ship3.pos.sub(20, 40))
  addBullet(ship3.pos.sub(-20, 40))

  const explainPos = k.vec2(40, 260)
  k.add([
    k.text('light stroke = ', { size: 28, font: 'sinko' }),
    k.pos(explainPos),
    k.origin('left')
  ])
  k.add([
    k.text('normal stroke = ', { size: 28, font: 'sinko' }),
    k.pos(explainPos.add(0, 140)),
    k.origin('left')
  ])
  k.add([
    k.text('heavy stroke = ', { size: 28, font: 'sinko' }),
    k.pos(explainPos.add(0, 280)),
    k.origin('left')
  ])

  function addBullet (pos) {
    k.add([
      k.sprite('laserRed01'),
      k.pos(pos),
      k.origin('center')
    ])
  }

  let lastStrokeState = 'DRIVING'
  function appState (appState) {
    if (appState?.metrics.strokeState === undefined) {
      return
    }
    if (lastStrokeState === 'DRIVING' && appState.metrics.strokeState === 'RECOVERY') {
      driveFinished(appState.metrics)
    }
    lastStrokeState = appState.metrics.strokeState
  }

  function driveFinished (metrics) {
    k.wait(2, () => { k.go('strokeFighterBattle') })
  }

  return {
    appState
  }
}
