'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Creates a scrolling space background
*/

const STAR_SPEED = 20
const STAR_SPRITE_NAMES = ['star1', 'star2']
const STAR_NUM = 10

/**
 * adds a scrolling space background to the background layer
 * @param {import('kaboom').KaboomCtx} k Kaboom Context
 */
export default function addSpaceBackground (k) {
  const background = k.add([
    k.rect(k.width() + 50, k.height() + 50),
    k.pos(-25, -25),
    k.color(0, 9, 28),
    redflash(),
    k.layer('background')
  ])

  for (let i = 0; i < STAR_NUM; i++) {
    addStar(false)
  }

  /**
   * adds a star at a random position
   * @param {boolean} respawn defines whether this is an initial star or a respawn
   */
  function addStar (respawn) {
    const spriteName = k.choose(STAR_SPRITE_NAMES)
    const position = k.rand(k.vec2(0, respawn ? -50 : 0), k.vec2(k.width(), respawn ? 0 : k.height()))

    const starColor = k.rand(120, 200)
    k.add([
      k.sprite(spriteName),
      k.scale(k.rand(0.2, 0.7)),
      k.color(starColor, starColor, starColor),
      k.layer('background'),
      k.pos(position),
      'star',
      { speed: k.rand(STAR_SPEED * 0.5, STAR_SPEED * 1.5) }
    ])
  }
  function redflash () {
    let timer = 0
    let origR = 0
    let flashing = false
    return {
      add () {
        origR = this.color.r
      },
      update () {
        if (flashing && timer < 0.2) {
          this.color.r = k.wave(origR, 100, timer * 20)
          timer += k.dt()
        } else {
          this.color.r = origR
        }
      },
      redflash () {
        timer = 0
        flashing = true
      }
    }
  }

  k.onUpdate('star', (star) => {
    star.move(0, star.speed)
    if (star.pos.y - star.height > k.height()) {
      k.destroy(star)
      addStar(true)
    }
  })

  function _redflash () {
    background.redflash()
  }

  return {
    redflash: _redflash
  }
}
