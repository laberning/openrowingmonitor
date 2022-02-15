'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Implements the Battle Action of the Stroke Fighter Game
*/

import addSpaceBackground from './SpaceBackground.js'

/**
 * Creates the main scene of Storke Fighter
 * @param {import('kaboom').KaboomCtx} k Kaboom Context
 */
export default function StrokeFighterBattleScene (k) {
  // how much stroke power is needed to fire high power lasers
  const THRESHOLD_POWER = 180
  // training duration in seconds
  const TARGET_TIME = 5 * 60
  // strokes per minute at start of training
  const SPM_START = 14
  // strokes per minute at end of training
  const SPM_END = 28
  const BULLET_SPEED = 1200
  const ENEMY_SPEED = 60
  const PLAYER_SPEED = 480
  const SPRITE_WIDTH = 90
  const ENEMIES = [
    { sprite: 'enemyBlack1', health: 1 },
    { sprite: 'enemyBlue2', health: 1 },
    { sprite: 'enemyGreen3', health: 1 },
    { sprite: 'enemyRed4', health: 1 },
    { sprite: 'enemyRed5', health: 1 },
    { sprite: 'spaceShips_004', health: 3 },
    { sprite: 'spaceShips_006', health: 2 },
    { sprite: 'spaceShips_007', health: 3 },
    { sprite: 'spaceShips_009', health: 2 }
  ]

  let trainingTime = 0

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

  player.onCollide('enemy', (enemy) => {
    k.destroy(enemy)
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

  function addLaserHit (pos, n) {
    for (let i = 0; i < n; i++) {
      k.wait(k.rand(n * 0.1), () => {
        for (let i = 0; i < 2; i++) {
          k.add([
            k.sprite('laserRed09'),
            k.pos(pos.sub(0, 10)),
            k.scale(k.vec2(0.5)),
            k.lifespan(0.1),
            grow(k.rand(0.5, 2)),
            k.origin('center')
          ])
        }
      })
    }
  }

  function spawnBullet (pos) {
    k.add([
      k.sprite('laserRed01'),
      k.area(),
      k.pos(pos),
      k.origin('center'),
      k.move(k.UP, BULLET_SPEED),
      k.cleanup(),
      'bullet'
    ])
  }

  k.onKeyPress('space', () => { fireWeapons(2) })

  /**
   * fires the weapons of our spaceship
   * @param {number} destructivePower the deadliness the weapon
   */
  function fireWeapons (destructivePower) {
    if (destructivePower <= 1) {
      spawnBullet(player.pos.sub(0, 20))
    } else if (destructivePower <= 2) {
      spawnBullet(player.pos.sub(16, 15))
      spawnBullet(player.pos.add(16, -15))
    } else {
      spawnBullet(player.pos.sub(0, 20))
      spawnBullet(player.pos.sub(16, 15))
      spawnBullet(player.pos.add(16, -15))
    }
    k.play('shoot', {
      volume: 0.3,
      detune: k.rand(-1200, 1200)
    })
  }

  function spawnEnemy (enemy) {
    k.add([
      k.sprite(enemy.sprite),
      k.area(),
      k.pos(k.rand(0 + SPRITE_WIDTH / 2, k.width() - SPRITE_WIDTH / 2), 0),
      k.health(enemy.health),
      k.origin('bot'),
      'enemy',
      { speed: k.rand(ENEMY_SPEED * 0.5, ENEMY_SPEED * 1.5) }
    ])
  }

  k.on('death', 'enemy', (enemy) => {
    k.destroy(enemy)
    k.every('bullet', (bullet) => {
      addLaserHit(bullet.pos, 1)
      k.destroy(bullet)
    })
    k.shake(2)
  })

  k.on('hurt', 'enemy', (enemy) => {
    k.shake(1)
    k.play('hit', {
      detune: k.rand(-1200, 1200),
      volume: 0.1,
      speed: k.rand(0.2, 2)
    })
  })

  const timer = k.add([
    k.text('0'),
    k.pos(12, 32),
    k.fixed(),
    k.layer('ui')
  ])

  timer.onUpdate(() => {
    trainingTime += k.dt()
    timer.text = trainingTime.toFixed(2)
  })

  k.onCollide('bullet', 'enemy', (bullet, enemy) => {
    k.destroy(bullet)
    enemy.hurt(1)
    addLaserHit(bullet.pos, 1)
  })

  k.onUpdate('enemy', (enemy) => {
    enemy.move(0, enemy.speed)
    if (enemy.pos.y - enemy.height > k.height()) {
      k.destroy(enemy)
    }
  })

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
    if (metrics.power < THRESHOLD_POWER * 0.75) {
      fireWeapons(1)
    } else if (metrics.power < THRESHOLD_POWER) {
      fireWeapons(2)
    } else {
      fireWeapons(3)
    }
  }

  function scheduleNextEnemy () {
    const percentTrainingFinished = trainingTime / TARGET_TIME
    const currentSPM = SPM_START + (SPM_END - SPM_START) * percentTrainingFinished
    let maxEnemyHealth = 1
    if (percentTrainingFinished < 0.4) {
      maxEnemyHealth = 1
    } else if (percentTrainingFinished < 0.8) {
      maxEnemyHealth = 2
    } else {
      maxEnemyHealth = 3
    }
    spawnEnemy(k.choose(ENEMIES.filter((enemy) => enemy.health <= maxEnemyHealth)))
    k.wait(60 / currentSPM, scheduleNextEnemy)
  }

  scheduleNextEnemy()

  return {
    appState
  }
}
