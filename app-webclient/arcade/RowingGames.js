'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Initializer for the Rowing Games
*/

import kaboom from 'kaboom'
import StrokeFighterBattleScene from './StrokeFighterBattleScene.js'
import StrokeFighterEndScene from './StrokeFighterEndScene.js'
import StrokeFighterStartScene from './StrokeFighterStartScene.js'

/**
 * creates and initializes the rowing games
 * @param {HTMLCanvasElement} rootComponent
 * @param {number} clientWidth
 * @param {number} clientHeight
 */
export function createRowingGames (rootComponent, clientWidth, clientHeight) {
  const k = kaboom({
    debug: true,
    global: false,
    stretch: true,
    root: rootComponent,
    crisp: false,
    width: clientWidth,
    height: clientHeight,
    font: 'sinko'
  })

  // todo: once there are multiple games, asset loading should be moved to the individual games
  const assets = '/assets'
  const sprites = ['enemyLight1', 'enemyLight2', 'enemyLight3', 'enemyLight4', 'enemyLight5', 'enemyMiddle1', 'enemyMiddle2',
    'enemyHeavy1', 'enemyHeavy2', 'playerShip', 'playerLife', 'star1', 'star2', 'laser1', 'laser2', 'shield']

  for (const sprite of sprites) {
    k.loadSprite(sprite, `${assets}/sprites/${sprite}.png`)
  }
  k.loadSound('hit', `${assets}/sounds/explosionCrunch_000.ogg`)
  k.loadSound('shoot', `${assets}/sounds/laserSmall_001.ogg`)

  // todo: check if there is some kaboomish way to get the active scene
  let activeScene
  k.scene('strokeFighterBattle', (args) => { activeScene = StrokeFighterBattleScene(k, args) })
  k.scene('strokeFighterStart', (args) => { activeScene = StrokeFighterStartScene(k, args) })
  k.scene('strokeFighterEnd', (args) => { activeScene = StrokeFighterEndScene(k, args) })
  k.scene('disposed', () => { activeScene = undefined })

  k.go('strokeFighterStart')

  // on changes, forward the appState to the active scene, used to monitor the rowing metrics
  // from the game scene
  function appState (appState) {
    if (activeScene?.appState) {
      activeScene.appState(appState)
    }
  }

  /**
   * clean up the game resources
   */
  function dispose () {
    // k.quit does not seem to end the game 'yet', so we move to an empty scene to stop all events...
    k.go('disposed')
    k.quit()
  }

  return {
    k,
    dispose,
    appState
  }
}
