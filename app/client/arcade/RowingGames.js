'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Initializer for the Rowing Games
*/

import { createGameEngine } from './GameEngine.js'
import StrokeFighterBattleScene from './StrokeFighterBattleScene.js'

/**
 * creates and initializes the rowing games
 * @param {HTMLCanvasElement} canvasElement
 * @param {number} clientWidth
 * @param {number} clientHeight
 */
export function createRowingGames (canvasElement, clientWidth, clientHeight) {
  const k = createGameEngine({
    debug: true,
    global: false,
    canvas: canvasElement,
    crisp: true,
    width: clientWidth,
    height: clientHeight
  })
  // for now show debug infos all the time
  k.debug.inspect = true

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

  k.go('strokeFighterBattle')

  function appState (appState) {
    if (activeScene?.appState) {
      activeScene.appState(appState)
    }
  }

  return {
    k,
    appState
  }
}
