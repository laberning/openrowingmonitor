'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Implements the Start Screen of the Stroke Fighter Game
*/

import addSpaceBackground from './SpaceBackground.js'
import { addButton } from './arcadeHelper.js'

/**
 * Creates the start screen scene of Stroke Fighter
 * @param {import('kaboom').KaboomCtx} k Kaboom Context
 */
export default function StrokeFighterStartScene (k, args) {
  addSpaceBackground(k)

  k.add([
    k.text('Stroke Fighter', { size: 50 }),
    k.pos(k.width() / 2, 50),
    k.origin('center')
  ])

  const GAME_DURATION_OPTIONS = [3, 5, 10, 15, 20, 30]
  let selectedGameDuration = 1

  const selectorPos = k.vec2(150, 140)

  k.add([
    k.text('time:', { size: 28 }),
    k.pos(selectorPos),
    k.origin('center')
  ])

  addButton({
    k,
    pos: selectorPos.add(100, 0),
    width: 60,
    height: 48,
    text: '-',
    textOptions: { size: 28 },
    onClick: () => {
      selectedGameDuration = Math.max(selectedGameDuration - 1, 0)
      durationSelectorText.text = displayTime(selectedGameDuration)
    }
  })

  const durationSelectorText = k.add([
    k.text(displayTime(selectedGameDuration), { size: 28 }),
    k.pos(selectorPos.add(168, 0)),
    k.origin('center')
  ])

  addButton({
    k,
    pos: selectorPos.add(230, 0),
    width: 60,
    height: 48,
    text: '+',
    textOptions: { size: 28 },
    onClick: () => {
      selectedGameDuration = Math.min(selectedGameDuration + 1, GAME_DURATION_OPTIONS.length - 1)
      durationSelectorText.text = displayTime(selectedGameDuration)
    }
  })

  k.add([
    k.text('minutes', { size: 28 }),
    k.pos(selectorPos.add(280, 0)),
    k.origin('left')
  ])

  function displayTime (option) {
    let time = GAME_DURATION_OPTIONS[option].toString()
    if (time.length === 1) {
      time = '0' + time
    }
    return time
  }

  const shipsPos = k.vec2(550, 280)
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

  const explainPos = k.vec2(90, 280)
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
    k.go('strokeFighterBattle', { targetTime: GAME_DURATION_OPTIONS[selectedGameDuration] * 60 })
  }

  return {
    appState
  }
}
