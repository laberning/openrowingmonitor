'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Kaboom based Game Engine for Rowing Games
*/

import kaboom from 'kaboom'

/**
 *
 * @param {import('kaboom').KaboomOpt} options Kaboom Options
 * @returns KaboomCtx Kaboom Context
 */
export function createGameEngine (options) {
  return kaboom(options)
}
