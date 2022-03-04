'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Implements the Battle Action of the Stroke Fighter Game
*/

import addSpaceBackground from './SpaceBackground.js'

/**
 * Creates the main scene of Stroke Fighter
 * @param {import('kaboom').KaboomCtx} k Kaboom Context
 */
export default function StrokeFighterBattleScene (k, args) {
  // how much stroke power is needed to fire high power lasers
  const THRESHOLD_POWER = 180
  // training duration in seconds
  const TARGET_TIME = 10 * 60
  // strokes per minute at start of training
  const SPM_START = 18
  // strokes per minute at end of training
  const SPM_END = 28
  const BULLET_SPEED = 1200
  const ENEMY_SPEED = 50
  const PLAYER_SPEED = 500
  const PLAYER_ACCELERATION = 500
  const PLAYER_LIFES = 3
  const SPRITE_WIDTH = 90
  const ENEMIES = [
    { sprite: 'enemyLight1', health: 1 },
    { sprite: 'enemyLight2', health: 1 },
    { sprite: 'enemyLight3', health: 1 },
    { sprite: 'enemyLight4', health: 1 },
    { sprite: 'enemyLight5', health: 1 },
    { sprite: 'enemyMiddle1', health: 2 },
    { sprite: 'enemyMiddle2', health: 2 },
    { sprite: 'enemyHeavy1', health: 3 },
    { sprite: 'enemyHeavy2', health: 3 }
  ]

  let trainingTime = args?.trainingTime || 0
  let playerLifes = args?.gameState === 'LOST' ? 0 : args?.playerLifes ? args?.playerLifes : PLAYER_LIFES

  const ui = k.add([
    k.fixed(),
    k.z(100)
  ])

  const background = addSpaceBackground(k)

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
    k.sprite('playerShip'),
    k.scale(0.5),
    k.area(),
    k.pos(k.width() / 2, k.height() - 64),
    k.origin('center'),
    acceleration()
  ])

  if (args?.gameState === 'LOST') {
    const shield = k.add([
      k.sprite('shield'),
      k.scale(0.5),
      k.area(),
      k.opacity(0.4),
      k.pos(player.pos),
      k.follow(player),
      k.origin('center')
    ])

    shield.onCollide('enemy', (enemy) => {
      k.destroy(enemy)
      k.shake(4)
      k.play('hit', {
        detune: -1200,
        volume: 0.6,
        speed: k.rand(0.5, 2)
      })
    })
  }

  function acceleration () {
    return {
      add () {
        this.acceleration = 0
        this.speed = 0
      },
      update () {
        this.speed = this.speed + this.acceleration * k.dt()
        // do not exceed max speed
        this.speed = this.speed > 0 ? Math.min(this.speed, PLAYER_SPEED) : Math.max(this.speed, -PLAYER_SPEED)
        this.move(this.speed, 0)
        // do not move beyond the screen borders
        if (this.pos.x < 0) {
          this.pos.x = 0
          this.acceleration = 0
          this.speed = 0
        }
        if (this.pos.x > k.width()) {
          this.pos.x = k.width()
          this.acceleration = 0
          this.speed = 0
        }
      }
    }
  }

  player.onCollide('enemy', (enemy) => {
    k.destroy(enemy)
    k.shake(4)
    background.redflash()
    k.play('hit', {
      detune: -1200,
      volume: 0.6,
      speed: k.rand(0.5, 2)
    })
    playerLifes -= 1
    drawPlayerLifes()
    if (playerLifes <= 0) {
      // if we already won the game before, go back to win message without possibility for overtime
      if (args?.gameState === 'WON') {
        k.go('strokeFighterEnd', {
          trainingTime,
          gameState: 'WON',
          overtimePossible: false
        })
      // if we did not win or lose the game the game before, go to loose message with possibility for overtime
      } else {
        k.go('strokeFighterEnd', {
          trainingTime,
          gameState: 'LOST',
          overtimePossible: true
        })
      }
    }
  })

  player.onUpdate(() => {
    const tolerance = 0
    const closestEnemy = k.get('enemy').reduce((prev, enemy) => { return enemy?.pos.y > prev?.pos.y ? enemy : prev }, { pos: { y: 0 } })
    if (closestEnemy?.pos?.x) {
      const distance = closestEnemy.pos.x - player.pos.x
      // distance in pixel to stop the spaceship with full break throttle
      const stopDistance = Math.pow(player.speed, 2) / (2 * PLAYER_ACCELERATION) * (player.speed < 0 ? -1.1 : 1.1)
      // if we are on the left side of enemy
      if (closestEnemy.pos.x > player.pos.x + tolerance) {
        if (distance > stopDistance) { accelerateRight() } else { accelerateLeft() }
      // if we are on the right side of enemy
      } else if (closestEnemy.pos.x < player.pos.x - tolerance) {
        if (distance < stopDistance) { accelerateLeft() } else { accelerateRight() }
      // otherwise we are directly aligned to enemy (with tolerance)
      } else { stop() }
      // if there is no enemy, make sure we don't move
    } else { stop() }
    function accelerateLeft () {
      player.acceleration = -PLAYER_ACCELERATION
    }
    function accelerateRight () {
      player.acceleration = PLAYER_ACCELERATION
    }
    function stop () {
      player.acceleration = 0
      player.speed = 0
    }
  })

  function addLaserHit (pos, n) {
    for (let i = 0; i < n; i++) {
      k.wait(k.rand(n * 0.1), () => {
        for (let i = 0; i < 2; i++) {
          k.add([
            k.sprite('laser2'),
            k.pos(pos.sub(0, 10)),
            k.scale(k.vec2(0.25)),
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
      k.sprite('laser1'),
      k.scale(0.5),
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
      spawnBullet(player.pos.sub(0, 65))
    } else if (destructivePower <= 2) {
      spawnBullet(player.pos.sub(20, 40))
      spawnBullet(player.pos.sub(-20, 40))
    } else {
      spawnBullet(player.pos.sub(0, 65))
      spawnBullet(player.pos.sub(20, 40))
      spawnBullet(player.pos.sub(-20, 40))
    }
    k.play('shoot', {
      volume: 0.6,
      detune: k.rand(-1200, 1200)
    })
  }

  function spawnEnemy (enemy) {
    k.add([
      k.sprite(enemy.sprite),
      k.scale(0.5),
      k.area(),
      k.pos(k.rand(0 + SPRITE_WIDTH / 2, k.width() - SPRITE_WIDTH / 2), 0),
      k.health(enemy.health),
      k.origin('bot'),
      'enemy',
      { speed: k.rand(ENEMY_SPEED * 0.8, ENEMY_SPEED * 1.2) }
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
      volume: 0.3,
      speed: k.rand(0.2, 2)
    })
  })

  const timer = ui.add([
    k.text('00:00', { size: 25 }),
    k.pos(10, 10),
    k.fixed()
  ])

  let trainingTimeRounded = 0
  timer.onUpdate(() => {
    trainingTime += k.dt()
    const newTrainingTimeRounded = Math.round(trainingTime)
    if (trainingTimeRounded !== newTrainingTimeRounded) {
      timer.text = `${secondsToTimeString(newTrainingTimeRounded)} / ${k.debug.fps()}fps`
      trainingTimeRounded = newTrainingTimeRounded
      if (trainingTimeRounded >= TARGET_TIME) {
        // if we already lost the game before, go back to loose message without possibility for overtime
        if (args?.gameState === 'LOST') {
          k.go('strokeFighterEnd', {
            trainingTime,
            playerLifes,
            gameState: 'LOST',
            overtimePossible: false
          })
        }
        // if we did not win or loose the game before, go to win message with possibility for overtime
        if (!(args?.gameState)) {
          k.go('strokeFighterEnd', {
            trainingTime,
            playerLifes,
            gameState: 'WON',
            overtimePossible: true
          })
        }
      }
    }
  })

  function drawPlayerLifes () {
    k.destroyAll('playerLife')

    // todo: would want to draw these on the "ui", but not sure on how to delete them then...
    for (let i = 1; i <= playerLifes; i++) {
      k.add([
        k.sprite('playerLife'),
        k.scale(0.5),
        k.pos(k.width() - i * 40, 10),
        k.z(100),
        'playerLife'
      ])
    }
  }

  // converts a timestamp in seconds to a human readable hh:mm:ss format
  function secondsToTimeString (secondsTimeStamp) {
    if (secondsTimeStamp === Infinity) return '∞'
    const hours = Math.floor(secondsTimeStamp / 60 / 60)
    const minutes = Math.floor(secondsTimeStamp / 60) - (hours * 60)
    const seconds = Math.floor(secondsTimeStamp % 60)
    let timeString = hours > 0 ? ` ${hours.toString().padStart(2, '0')}:` : ''
    timeString += `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    return timeString
  }

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
    if (metrics.powerRaw < THRESHOLD_POWER * 0.75) {
      fireWeapons(1)
    } else if (metrics.powerRaw < THRESHOLD_POWER) {
      fireWeapons(2)
    } else {
      fireWeapons(3)
    }
  }

  function scheduleNextEnemy () {
    const percentTrainingFinished = trainingTime / TARGET_TIME
    // linearly increase the SPM over time
    let currentSPM = SPM_START + (SPM_END - SPM_START) * percentTrainingFinished
    let maxEnemyHealth = 1
    let minEnemyHealth = 1
    if (percentTrainingFinished < 0.4) {
      maxEnemyHealth = 1
    } else if (percentTrainingFinished < 0.8) {
      maxEnemyHealth = 2
    } else {
      maxEnemyHealth = 3
    }
    // insane mode (keep on rowing after winning)
    if (percentTrainingFinished > 1) {
      // cap SPM at 20% above SPM_END (for insane mode)
      currentSPM = Math.max(currentSPM, SPM_END * 1.2)
      minEnemyHealth = 2
      if (percentTrainingFinished > 1.3) {
        minEnemyHealth = 3
      }
    }
    spawnEnemy(k.choose(ENEMIES.filter((enemy) => enemy.health >= minEnemyHealth && enemy.health <= maxEnemyHealth)))
    k.wait(60 / currentSPM, scheduleNextEnemy)
  }

  drawPlayerLifes()
  scheduleNextEnemy()

  return {
    appState
  }
}
