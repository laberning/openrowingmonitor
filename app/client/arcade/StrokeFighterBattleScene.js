'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Implements the Battle Actions of the Stroke Fighter Game
*/

import addSpaceBackground from './SpaceBackground.js'

const ENEMY_SPRITE_NAMES = ['enemyBlack1', 'enemyBlue2', 'enemyGreen3', 'enemyRed4', 'enemyRed5',
  'spaceShips_004', 'spaceShips_006', 'spaceShips_007', 'spaceShips_009', 'ufoGreen']

export default function StrokeFighterBattleScene (k) {
  const BULLET_SPEED = 1200
  const ENEMY_SPEED = 60
  const PLAYER_SPEED = 480
  const ENEMY_HEALTH = 4
  const SPRITE_WIDTH = 90

  k.layers([
    'background',
    'game',
    'ui'
  ], 'game')

  addSpaceBackground(k)

  function grow (rate) {
    return {
      update () {
        const n = rate * k.dt()
        this.scale.x += n
        this.scale.y += n
      }
    }
  }

  const player = k.add([
    k.sprite('playerShip2_orange'),
    k.area(),
    k.pos(k.width() / 2, k.height() - 64),
    k.origin('center')
  ])

  function moveLeft () {
    player.move(-PLAYER_SPEED, 0)
    if (player.pos.x < 0) {
      player.pos.x = k.width()
    }
  }

  function moveRight () {
    player.move(PLAYER_SPEED, 0)
    if (player.pos.x > k.width()) {
      player.pos.x = 0
    }
  }

  player.onCollide('enemy', (e) => {
    k.destroy(e)
    k.shake(4)
    k.play('hit', {
      detune: -1200,
      volume: 0.3,
      speed: k.rand(0.5, 2)
    })
  })

  player.onUpdate(() => {
    const tolerance = 10
    const closestEnemy = k.get('enemy').reduce((prev, enemy) => { return enemy?.pos.y > prev?.pos.y ? enemy : prev }, { pos: { y: 0 } })
    if (closestEnemy?.pos?.x) {
      if (closestEnemy.pos.x > player.pos.x + tolerance) {
        moveRight()
      } else if (closestEnemy.pos.x < player.pos.x - tolerance) {
        moveLeft()
      }
    }
  })

  function addLaserHit (p, n) {
    for (let i = 0; i < n; i++) {
      k.wait(k.rand(n * 0.1), () => {
        for (let i = 0; i < 2; i++) {
          k.add([
            k.sprite('laserRed09'),
            k.pos(p.sub(0, 10)),
            k.scale(k.vec2(0.5)),
            k.lifespan(0.1),
            grow(k.rand(0.5, 2)),
            k.origin('center')
          ])
        }
      })
    }
  }

  function spawnBullet (p) {
    k.add([
      k.sprite('laserRed01'),
      k.area(),
      k.pos(p),
      k.origin('center'),
      k.move(k.UP, BULLET_SPEED),
      k.cleanup(),
      'bullet'
    ])
  }

  // todo: this should be triggered by a finished rowing drive phase
  k.onKeyPress('space', () => {
    spawnBullet(player.pos.sub(16, 15))
    spawnBullet(player.pos.add(16, -15))
    k.play('shoot', {
      volume: 0.3,
      detune: k.rand(-1200, 1200)
    })
  })

  function spawnEnemy () {
    const name = k.choose(ENEMY_SPRITE_NAMES)
    k.add([
      k.sprite(name),
      k.area(),
      k.pos(k.rand(0 + SPRITE_WIDTH / 2, k.width() - SPRITE_WIDTH / 2), 0),
      k.health(ENEMY_HEALTH),
      k.origin('bot'),
      'enemy',
      { speed: k.rand(ENEMY_SPEED * 0.5, ENEMY_SPEED * 1.5) }
    ])
    k.wait(3, spawnEnemy)
  }

  k.on('death', 'enemy', (e) => {
    k.destroy(e)
    k.shake(2)
  })

  k.on('hurt', 'enemy', (e) => {
    k.shake(1)
    k.play('hit', {
      detune: k.rand(-1200, 1200),
      volume: 0.1,
      speed: k.rand(0.2, 2)
    })
  })

  const timer = k.add([
    k.text(0),
    k.pos(12, 32),
    k.fixed(),
    k.layer('ui'),
    { time: 0 }
  ])

  timer.onUpdate(() => {
    timer.time += k.dt()
    timer.text = timer.time.toFixed(2)
  })

  k.onCollide('bullet', 'enemy', (b, e) => {
    k.destroy(b)
    e.hurt(1)
    addLaserHit(b.pos, 1)
  })

  k.onUpdate('enemy', (sprite) => {
    sprite.move(0, sprite.speed)
    if (sprite.pos.y - sprite.height > k.height()) {
      k.destroy(sprite)
    }
  })
  spawnEnemy()
}
