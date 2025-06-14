import React, { useEffect, useRef, useState } from 'react'
import { HealthBar } from './components/Game/HealthBar'
import { GameOverScreen } from './components/Game/GameOverScreen'
import { PauseMenu } from './components/Game/PauseMenu'
import { usePlayer } from './hooks/usePlayer'
import { useGameState } from './hooks/useGameState'
import { usePowerUps } from './hooks/usePowerUps'
import { useAutoFire } from './hooks/useAutoFire'
import { useEnemySystem } from './hooks/useEnemySystem'
import { Enemy, Bullet, GameStatus, PowerUpType } from './types/game.types'
import { EnemyType } from './types/enemy.types'
import { EnemyRenderer } from './utils/enemyRenderer'
import { GAME_BALANCE } from './constants/gameBalance'

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasHeight, setCanvasHeight] = useState(600)
  
  // カスタムフック
  const player = usePlayer(canvasHeight)
  const gameState = useGameState()
  const powerUps = usePowerUps()
  
  // 自動連射システム
  const autoFire = useAutoFire({
    playerPosition: player.position,
    playerPower: player.power,
    isGamePlaying: gameState.status === GameStatus.PLAYING
  })

  // 新しい敵システム
  const enemySystem = useEnemySystem({
    canvasWidth: window.innerWidth,
    canvasHeight: canvasHeight,
    isGamePlaying: gameState.status === GameStatus.PLAYING,
    currentLevel: gameState.level
  })
  
  // ゲームデータ（旧システム）
  const gameData = useRef({
    bullets: [] as Bullet[],
    lastTime: 0,
    lastShot: 0,
    lastPowerUpSpawn: 0
  })

  // 敵レンダラー
  const enemyRenderer = useRef<EnemyRenderer | null>(null)

  const startGame = () => {
    gameState.startGame()
    player.resetPlayer(canvasHeight)
    powerUps.clearPowerUps()
    autoFire.resetAutoFire()
    enemySystem.resetEnemySystem()
    gameData.current = {
      bullets: [],
      lastTime: 0,
      lastShot: 0,
      lastPowerUpSpawn: 0
    }
  }

  const handlePause = () => {
    gameState.pauseGame()
  }

  const handleRestart = () => {
    startGame()
  }

  const handleGoToMenu = () => {
    gameState.goToMenu()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || gameState.status === GameStatus.MENU) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    setCanvasHeight(canvas.height)

    // 敵レンダラー初期化
    if (!enemyRenderer.current) {
      enemyRenderer.current = new EnemyRenderer(ctx)
    }

    let animationId: number

    const gameLoop = (currentTime: number) => {
      if (gameState.status !== GameStatus.PLAYING) {
        animationId = requestAnimationFrame(gameLoop)
        return
      }

      const deltaTime = currentTime - gameData.current.lastTime
      gameData.current.lastTime = currentTime

      // 時間更新
      gameState.updateTime(deltaTime)
      
      // プレイヤー無敵時間更新
      player.updateInvulnerability(deltaTime)

      // 現在の難易度取得
      const difficulty = gameState.getCurrentDifficulty()

      // Clear canvas
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw game over line (danger zone indicator) - プレイヤーエリア境界
      const gameOverLine = canvas.height * GAME_BALANCE.ENEMY.GAME_OVER_ZONE_RATIO
      ctx.strokeStyle = '#ff4444'
      ctx.lineWidth = 3
      ctx.setLineDash([15, 5])
      ctx.beginPath()
      ctx.moveTo(0, gameOverLine)
      ctx.lineTo(canvas.width, gameOverLine)
      ctx.stroke()
      ctx.setLineDash([]) // Reset line dash
      
      // 警告テキスト
      ctx.fillStyle = '#ff4444'
      ctx.font = '14px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('DANGER ZONE', canvas.width / 2, gameOverLine - 10)

      // 自動連射処理
      const newBullet = autoFire.tryAutoFire(currentTime)
      if (newBullet) {
        gameData.current.bullets.push(newBullet)
      }

      // 新しい敵システムでのスポーン
      enemySystem.spawnEnemy(currentTime, difficulty.spawnInterval)
      
      // 敵の更新処理
      enemySystem.updateEnemies(deltaTime, currentTime)
      enemySystem.updateEnemyAttacks(currentTime)
      enemySystem.updateEnemyBullets(deltaTime)

      // Spawn power-ups (時間ベース + 確率)
      if (currentTime - gameData.current.lastPowerUpSpawn > 5000) {
        if (Math.random() < GAME_BALANCE.POWERUP.SPAWN_CHANCE) {
          powerUps.spawnPowerUp({
            x: Math.random() * (canvas.width - GAME_BALANCE.POWERUP.WIDTH),
            y: -GAME_BALANCE.POWERUP.HEIGHT
          })
        }
        gameData.current.lastPowerUpSpawn = currentTime
      }

      // 敵のゲームオーバーチェック（プレイヤーエリア到達）
      const gameOverTriggered = enemySystem.checkGameOver()
      if (gameOverTriggered) {
        console.log('Game Over triggered by enemy reaching player area!')
        gameState.gameOver()
        return // ゲームオーバー時は処理を停止
      }
      
      // 画面外の敵を削除
      enemySystem.removeEnemiesOutOfBounds()

      // プレイヤーと敵の衝突判定
      if (!player.invulnerable) {
        enemySystem.enemies.forEach(enemy => {
          if (player.position.x < enemy.position.x + enemy.stats.width &&
              player.position.x + GAME_BALANCE.PLAYER.WIDTH > enemy.position.x &&
              player.position.y < enemy.position.y + enemy.stats.height &&
              player.position.y + GAME_BALANCE.PLAYER.HEIGHT > enemy.position.y) {
            player.takeDamage(GAME_BALANCE.ENEMY.DAMAGE_TO_PLAYER)
            // 敵を削除（ダメージで体力を0にする）
            enemySystem.damageEnemy(enemy.id, enemy.stats.health)
          }
        })
      }

      // プレイヤーと敵弾の衝突判定
      if (!player.invulnerable) {
        const bulletsCopy = [...enemySystem.enemyBullets]
        bulletsCopy.forEach(bullet => {
          if (player.position.x < bullet.x + bullet.width &&
              player.position.x + GAME_BALANCE.PLAYER.WIDTH > bullet.x &&
              player.position.y < bullet.y + bullet.height &&
              player.position.y + GAME_BALANCE.PLAYER.HEIGHT > bullet.y) {
            player.takeDamage(GAME_BALANCE.ENEMY.DAMAGE_TO_PLAYER)
            // 弾を削除
            enemySystem.removeEnemyBullet(bullet.id)
          }
        })
      }

      // Update bullets
      gameData.current.bullets = gameData.current.bullets.filter(bullet => {
        bullet.y -= bullet.speed
        return bullet.y > -10
      })

      // Update power-ups
      powerUps.updatePowerUps(deltaTime, canvas.height)

      // プレイヤー弾と敵の衝突判定
      const bulletsCopy = [...gameData.current.bullets]
      bulletsCopy.forEach((bullet, bulletIndex) => {
        enemySystem.enemies.forEach(enemy => {
          if (bullet.x < enemy.position.x + enemy.stats.width &&
              bullet.x + bullet.width > enemy.position.x &&
              bullet.y < enemy.position.y + enemy.stats.height &&
              bullet.y + bullet.height > enemy.position.y) {
            
            // 弾を削除
            gameData.current.bullets = gameData.current.bullets.filter(b => b !== bullet)
            
            // 敵にダメージを与える
            const enemyDestroyed = enemySystem.damageEnemy(enemy.id, player.power)
            
            if (enemyDestroyed) {
              gameState.addEnemyKill()
              
              // パワーアップスポーン（撃破時の確率）
              if (Math.random() < enemy.stats.powerUpDropRate) {
                powerUps.spawnPowerUp({ x: enemy.position.x, y: enemy.position.y })
              }
            }
          }
        })
      })

      // Check bullet-powerup collisions
      gameData.current.bullets.forEach((bullet, bulletIndex) => {
        powerUps.powerUps.forEach(powerUp => {
          if (bullet.x < powerUp.position.x + powerUp.width &&
              bullet.x + bullet.width > powerUp.position.x &&
              bullet.y < powerUp.position.y + powerUp.height &&
              bullet.y + bullet.height > powerUp.position.y) {
            gameData.current.bullets.splice(bulletIndex, 1)
            powerUps.collectPowerUp(powerUp.id, 'shoot', player)
            gameState.addPowerUpCollection()
          }
        })
      })

      // Check player-powerup collisions (直接接触)
      if (!player.invulnerable) {
        powerUps.powerUps.forEach(powerUp => {
          if (player.position.x < powerUp.position.x + powerUp.width &&
              player.position.x + GAME_BALANCE.PLAYER.WIDTH > powerUp.position.x &&
              player.position.y < powerUp.position.y + powerUp.height &&
              player.position.y + GAME_BALANCE.PLAYER.HEIGHT > powerUp.position.y) {
            powerUps.collectPowerUp(powerUp.id, 'touch', player)
            gameState.addPowerUpCollection()
          }
        })
      }

      // ゲームオーバー判定
      if (player.isDead() && gameState.status === GameStatus.PLAYING) {
        gameState.gameOver()
      }

      // Draw player (triangle spaceship)
      if (player.invulnerable) {
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(currentTime * 0.01)
      }
      ctx.fillStyle = '#0066ff'
      ctx.beginPath()
      ctx.moveTo(player.position.x + GAME_BALANCE.PLAYER.WIDTH / 2, player.position.y)
      ctx.lineTo(player.position.x, player.position.y + GAME_BALANCE.PLAYER.HEIGHT)
      ctx.lineTo(player.position.x + GAME_BALANCE.PLAYER.WIDTH, player.position.y + GAME_BALANCE.PLAYER.HEIGHT)
      ctx.closePath()
      ctx.fill()
      ctx.globalAlpha = 1

      // Draw new enemy system
      if (enemyRenderer.current) {
        enemyRenderer.current.drawEnemies(enemySystem.enemies)
        enemyRenderer.current.drawEnemyBullets(enemySystem.enemyBullets)
      }

      // Draw bullets
      ctx.fillStyle = '#ffff00'
      gameData.current.bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)
      })

      // Draw power-ups
      powerUps.powerUps.forEach(powerUp => {
        ctx.fillStyle = getPowerUpColor(powerUp.type)
        ctx.fillRect(powerUp.position.x, powerUp.position.y, powerUp.width, powerUp.height)
        
        // アイコン描画
        ctx.fillStyle = '#ffffff'
        ctx.font = '16px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(getPowerUpIcon(powerUp.type), 
          powerUp.position.x + powerUp.width / 2, 
          powerUp.position.y + powerUp.height / 2 + 6
        )
      })

      animationId = requestAnimationFrame(gameLoop)
    }

    const getPowerUpColor = (type: PowerUpType): string => {
      switch (type) {
        case PowerUpType.DAMAGE_UP: return '#ff6b6b'
        case PowerUpType.HEALTH: return '#51cf66'
        case PowerUpType.MULTI_SHOT: return '#74c0fc'
        case PowerUpType.SHIELD: return '#ffd43b'
        default: return '#868e96'
      }
    }

    const getPowerUpIcon = (type: PowerUpType): string => {
      switch (type) {
        case PowerUpType.DAMAGE_UP: return '⚡'
        case PowerUpType.HEALTH: return '+'
        case PowerUpType.MULTI_SHOT: return '≡'
        case PowerUpType.SHIELD: return '🛡'
        default: return '?'
      }
    }

    const handleTouch = (e: TouchEvent) => {
      e.preventDefault()
      if (gameState.status !== GameStatus.PLAYING) return
      
      const touch = e.touches[0]
      const rect = canvas.getBoundingClientRect()
      const x = touch.clientX - rect.left

      // Move player (左右移動のみ、Y座標は固定)
      player.updatePositionX(x - GAME_BALANCE.PLAYER.WIDTH / 2, canvas.width)
    }

    const handleMouse = (e: MouseEvent) => {
      if (gameState.status !== GameStatus.PLAYING) return
      
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left

      // Move player (左右移動のみ、Y座標は固定)
      player.updatePositionX(x - GAME_BALANCE.PLAYER.WIDTH / 2, canvas.width)
    }

    const handleClick = () => {
      // 自動連射なので手動射撃は無効
      return
    }

    canvas.addEventListener('touchstart', handleTouch, { passive: false })
    canvas.addEventListener('touchmove', handleTouch, { passive: false })
    canvas.addEventListener('mousemove', handleMouse)
    canvas.addEventListener('click', handleClick)

    animationId = requestAnimationFrame(gameLoop)

    return () => {
      cancelAnimationFrame(animationId)
      canvas.removeEventListener('touchstart', handleTouch)
      canvas.removeEventListener('touchmove', handleTouch)
      canvas.removeEventListener('mousemove', handleMouse)
      canvas.removeEventListener('click', handleClick)
    }
  }, [gameState.status, player, powerUps, autoFire, enemySystem, canvasHeight])

  // メニュー画面
  if (gameState.status === GameStatus.MENU) {
    return (
      <div className="app" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        minHeight: '100vh'
      }}>
        <h1 style={{ 
          color: '#ff4444', 
          fontSize: '48px', 
          marginBottom: '20px', 
          textShadow: '0 0 20px rgba(255, 68, 68, 0.8)',
          fontFamily: "'Courier New', monospace"
        }}>
          Mobile Last War v2
        </h1>
        <p style={{ 
          fontSize: '18px', 
          marginBottom: '20px', 
          textAlign: 'center', 
          color: '#cccccc',
          maxWidth: '400px'
        }}>
          🎮 自動連射防衛シューター！<br/>
          ↔️ 画面下部で左右移動のみ<br/>
          💀 敵が下部に到達でゲームオーバー<br/>
          ⚡ 攻撃力UPで連射速度UP<br/>
          🎯 弾で撃破 = ボーナス / 接触 = ペナルティ
        </p>
        <div style={{ marginBottom: '40px', color: '#aaa', fontSize: '14px' }}>
          High Score: {gameState.highScore.toLocaleString()}
        </div>
        <button
          onClick={startGame}
          data-testid="start-game-button"
          style={{
            background: 'linear-gradient(45deg, #ff4444, #ff6666)',
            color: 'white',
            border: 'none',
            padding: '20px 40px',
            fontSize: '24px',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(255, 68, 68, 0.4)',
            transition: 'all 0.3s',
            fontFamily: "'Courier New', monospace"
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          🚀 ゲーム開始
        </button>
      </div>
    )
  }

  return (
    <div className="app">
      {/* ゲームUI */}
      <HealthBar health={player.health} maxHealth={player.maxHealth} />
      
      {/* ポーズボタン */}
      <button
        onClick={handlePause}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 10,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          border: '2px solid #fff',
          padding: '10px 15px',
          borderRadius: '8px',
          fontSize: '18px',
          cursor: 'pointer'
        }}
      >
        ⏸
      </button>

      {/* スコア・レベル表示 */}
      <div style={{ 
        position: 'absolute', 
        top: '60px', 
        left: '20px', 
        zIndex: 10, 
        background: 'rgba(0,0,0,0.7)', 
        padding: '10px', 
        borderRadius: '8px',
        color: 'white',
        fontFamily: "'Courier New', monospace"
      }}>
        <div style={{ color: '#ff4444', fontSize: '20px', fontWeight: 'bold' }}>
          スコア: {gameState.score.toLocaleString()}
        </div>
        <div style={{ color: '#0066ff', fontSize: '16px' }}>
          レベル: {gameState.level} ({gameState.difficultyCalculator.getDifficultyDescription()})
        </div>
        <div style={{ color: '#51cf66', fontSize: '14px' }}>
          攻撃力: {player.power} (連射: {autoFire.getFireRateInfo().shotsPerSecond}/秒)
        </div>
        <div style={{ color: '#74c0fc', fontSize: '14px' }}>
          撃破: {gameState.enemiesKilled}
        </div>
        <div style={{ color: '#fbbf24', fontSize: '12px' }}>
          次レベルまで: {gameState.difficultyCalculator.getEnemiesUntilNextLevel()}体
        </div>
      </div>

      {/* ゲームキャンバス */}
      <canvas ref={canvasRef} className="game-canvas" data-testid="game-canvas" />
      
      {/* ポーズメニュー */}
      {gameState.status === GameStatus.PAUSED && (
        <PauseMenu
          onResume={gameState.resumeGame}
          onRestart={handleRestart}
          onMenu={handleGoToMenu}
        />
      )}
      
      {/* ゲームオーバー画面 */}
      {gameState.status === GameStatus.GAME_OVER && (
        <GameOverScreen
          stats={gameState.getGameStats()}
          onRestart={handleRestart}
          onMenu={handleGoToMenu}
        />
      )}
    </div>
  )
}

export default App