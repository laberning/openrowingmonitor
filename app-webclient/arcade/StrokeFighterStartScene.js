'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Implements the Start Screen of the Stroke Fighter Game
*/

import addSpaceBackground from './SpaceBackground.js'

/**
 * Creates the main scene of Stroke Fighter
 * @param {import('kaboom').KaboomCtx} k Kaboom Context
 */
export default function StrokeFighterStartScene (k, args) {
  addSpaceBackground(k)

  k.add([
    k.text('Stroke Fighter', { size: 50 }),
    k.pos(k.width() / 2, 50),
    k.origin('center')
  ])

  const shipsPos = k.vec2(520, 240)
  const ship1 = k.add([
    k.sprite('playerShip'),
    k.scale(0.5),
    k.pos(shipsPos),
    k.origin('center')
  ])
  addBullet(ship1.pos.sub(0, 65))

  const ship2 = k.add([
    k.sprite('playerShip'),
    k.scale(0.5),
    k.pos(shipsPos.add(0, 140)),
    k.origin('center')
  ])
  addBullet(ship2.pos.sub(20, 40))
  addBullet(ship2.pos.sub(-20, 40))

  const ship3 = k.add([
    k.sprite('playerShip'),
    k.scale(0.5),
    k.pos(shipsPos.add(0, 280)),
    k.origin('center')
  ])
  addBullet(ship3.pos.sub(0, 65))
  addBullet(ship3.pos.sub(20, 40))
  addBullet(ship3.pos.sub(-20, 40))

  const explainPos = k.vec2(60, 240)
  k.add([
    k.text('light stroke = ', { size: 28 }),
    k.pos(explainPos),
    k.origin('left')
  ])
  k.add([
    k.text('normal stroke = ', { size: 28 }),
    k.pos(explainPos.add(0, 140)),
    k.origin('left')
  ])
  k.add([
    k.text('heavy stroke = ', { size: 28 }),
    k.pos(explainPos.add(0, 280)),
    k.origin('left')
  ])

  function addBullet (pos) {
    k.add([
      k.sprite('laser1'),
      k.scale(0.5),
      k.pos(pos),
      k.origin('center')
    ])
  }

  k.add([
    k.text('start rowing to charge lasers', { size: 28 }),
    k.pos(k.width() / 2, 650),
    k.origin('center')
  ])

  let motionDetectionEnabled = false
  k.wait(5, () => {
    motionDetectionEnabled = true
  })
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
    k.go('strokeFighterBattle')
  }

  return {
    appState
  }
}
