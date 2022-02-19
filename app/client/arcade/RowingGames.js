'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Initializer for the Rowing Games
*/

import { createGameEngine } from './GameEngine.js'
import StrokeFighterBattleScene from './StrokeFighterBattleScene.js'
import StrokeFighterStartScene from './StrokeFighterStartScene.js'

/**
 * creates and initializes the rowing games
 * @param {HTMLCanvasElement} canvasElement
 * @param {number} clientWidth
 * @param {number} clientHeight
 */
export function createRowingGames (rootComponent, canvasElement, clientWidth, clientHeight) {
  const k = createGameEngine({
    debug: true,
    global: false,
    canvas: canvasElement,
    root: rootComponent,
    crisp: false,
    width: clientWidth,
    height: clientHeight
  })
  // for now show debug infos all the time
  // k.debug.inspect = true

  // todo: once there are multiple games, asset loadingshould be moved to the individual games
  const assets = '/assets'
  const sprites = ['enemyBlack1', 'enemyBlue2', 'enemyGreen3', 'enemyRed4', 'enemyRed5', 'playerShip2_orange',
    'spaceShips_004', 'spaceShips_006', 'spaceShips_007', 'spaceShips_009', 'star1', 'star2',
    'laserRed01', 'laserRed09']

  for (const sprite of sprites) {
    k.loadSprite(sprite, `${assets}/sprites/${sprite}.png`)
  }
  k.loadSound('hit', `${assets}/sounds/explosionCrunch_000.ogg`)
  k.loadSound('shoot', `${assets}/sounds/laserSmall_001.ogg`)

  // todo: check if there is some kaboomish way to get the active scene
  let activeScene
  k.scene('strokeFighterBattle', () => { activeScene = StrokeFighterBattleScene(k) })
  k.scene('strokeFighterStart', () => { activeScene = StrokeFighterStartScene(k) })

  k.go('strokeFighterStart')

  // on changes, forward the appState to the active scene, used to monitor the rowing metrics
  // from the game scene
  function appState (appState) {
    if (activeScene?.appState) {
      activeScene.appState(appState)
    }
  }

  // todo: currently we move to an empty scene to dispose the game as there does not seem to be
  // a mechanism in kaboom to dispose the instance.
  function dispose () {
    k.quit()
  }

  return {
    k,
    dispose,
    appState
  }
}
