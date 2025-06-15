import React, { useEffect, useRef, useState } from 'react'
import { GameOverScreen } from './components/Game/GameOverScreen'
import { PauseMenu } from './components/Game/PauseMenu'
import { CompactStatsDisplay } from './components/Game/CompactStatsDisplay'
import { AchievementNotification } from './components/Game/AchievementNotification'
import { usePlayer } from './hooks/usePlayer'
import { useGameState } from './hooks/useGameState'
import { usePowerUps } from './hooks/usePowerUps'
import { useAutoFire } from './hooks/useAutoFire'
import { useEnemySystem } from './hooks/useEnemySystem'
import { useGameStats } from './hooks/useGameStats'
import { useVisualEffects } from './hooks/useVisualEffects'
import { useAudioSystem } from './hooks/useAudioSystem'
import { Enemy, Bullet, GameStatus, PowerUpType } from './types/game.types'
import { EnemyType } from './types/enemy.types'
import { Achievement } from './types/gameStats.types'
import { EnemyRenderer } from './utils/enemyRenderer'
import { GAME_BALANCE, getFinalDifficultyParams } from './constants/gameBalance'

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasHeight, setCanvasHeight] = useState(600)
  const [canvasWidth, setCanvasWidth] = useState(800)
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null)
  
  // カスタムフック
  const player = usePlayer(canvasHeight)
  const gameState = useGameState()
  const powerUps = usePowerUps()
  const gameStats = useGameStats()
  
  // 視覚エフェクトシステム
  const visualEffects = useVisualEffects({
    canvasWidth: canvasWidth,
    canvasHeight: canvasHeight,
    isGamePlaying: gameState.status === GameStatus.PLAYING
  })
  
  // 音響システム
  const audioSystem = useAudioSystem()
  
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
    gameStats.startGameSession()
    visualEffects.clearEffects()
    audioSystem.initializeAudio() // ユーザー操作による音響初期化
    
    // 敵レンダラーリセット（敵表示バグ修正）
    enemyRenderer.current = null
    
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
    setCanvasWidth(canvas.width)

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
      
      // プレイヤー無敵時間更新削除（HP制なし）

      // 統計更新（レベル・撃破システム削除）
      gameStats.updateScore(gameState.score)
      gameStats.updatePowerUps(gameState.powerUpsCollected)

      // 視覚エフェクト更新
      visualEffects.updateEffects(deltaTime, currentTime)
      visualEffects.setLevelMultiplier(gameState.level)

      // シンプルな時間ベース難易度調整（30秒毎に段階的上昇）
      const survivalTime = Math.floor(gameState.time / 1000) // 生存秒数
      let spawnInterval = 1000 // 基本1秒
      
      if (survivalTime >= 120) {
        spawnInterval = 200 // 2分以降: 0.2秒に1体
      } else if (survivalTime >= 90) {
        spawnInterval = 400 // 1分30秒以降: 0.4秒に1体
      } else if (survivalTime >= 60) {
        spawnInterval = 600 // 1分以降: 0.6秒に1体
      } else if (survivalTime >= 30) {
        spawnInterval = 800 // 30秒以降: 0.8秒に1体
      }
      
      console.log(`生存時間: ${survivalTime}秒, スポーン間隔: ${spawnInterval}ms`)

      // Clear canvas
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 背景エフェクト描画（スターフィールドのみ）
      visualEffects.renderBackground(ctx)

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
        // 射撃エフェクト
        visualEffects.createShootEffect(player.position.x + GAME_BALANCE.PLAYER.WIDTH / 2, player.position.y)
        // 射撃音
        audioSystem.playShootSound()
      }

      // 新しい敵システムでのスポーン（時間ベース間隔）
      enemySystem.spawnEnemy(currentTime, spawnInterval)
      
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
        gameStats.endGameSession('game_over')
        audioSystem.playGameOverSound()
        
        // 実績チェック
        const newAchievements = gameStats.checkAndUnlockAchievements(gameStats.gameStats)
        if (newAchievements.length > 0) {
          setCurrentAchievement(newAchievements[0])
          visualEffects.createAchievementEffect()
          audioSystem.playAchievementSound()
        }
        return // ゲームオーバー時は処理を停止
      }
      
      // 画面外の敵を削除
      enemySystem.removeEnemiesOutOfBounds()

      // プレイヤーと敵の衝突判定は削除（敵エリア到達のみでゲームオーバー）

      // プレイヤーと敵弾の衝突判定も削除（敵エリア到達のみでゲームオーバー）

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
            
            // 敵にダメージを与える（撃破カウント削除）
            const enemyDestroyed = enemySystem.damageEnemy(enemy.id, player.power)
            
            if (enemyDestroyed) {
              // 敵撃破エフェクト
              visualEffects.createEnemyDestroyEffect(
                enemy.position.x + enemy.stats.width / 2,
                enemy.position.y + enemy.stats.height / 2,
                enemy.type
              )
              
              // 敵撃破音
              audioSystem.playEnemyDestroySound(enemy.type)
              
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
            
            // パワーアップ収集エフェクト（弾による撃破 = 良い効果）
            visualEffects.createPowerUpCollectEffect(
              powerUp.position.x + powerUp.width / 2,
              powerUp.position.y + powerUp.height / 2,
              true
            )
            
            // パワーアップ収集音（良い効果）
            audioSystem.playPowerUpSound(true)
          }
        })
      })

      // Check player-powerup collisions (直接接触) - 無敵判定削除
      powerUps.powerUps.forEach(powerUp => {
        if (player.position.x < powerUp.position.x + powerUp.width &&
            player.position.x + GAME_BALANCE.PLAYER.WIDTH > powerUp.position.x &&
            player.position.y < powerUp.position.y + powerUp.height &&
            player.position.y + GAME_BALANCE.PLAYER.HEIGHT > powerUp.position.y) {
          powerUps.collectPowerUp(powerUp.id, 'touch', player)
          gameState.addPowerUpCollection()
          
          // パワーアップ収集エフェクト（直接接触 = 悪い効果）
          visualEffects.createPowerUpCollectEffect(
            powerUp.position.x + powerUp.width / 2,
            powerUp.position.y + powerUp.height / 2,
            false
          )
          
          // パワーアップ収集音（悪い効果）
          audioSystem.playPowerUpSound(false)
        }
      })

      // 旧HP死亡判定削除（敵エリア到達のみでゲームオーバー）

      // Draw player (triangle spaceship) - 無敵表示削除
      ctx.fillStyle = '#0066ff'
      ctx.beginPath()
      ctx.moveTo(player.position.x + GAME_BALANCE.PLAYER.WIDTH / 2, player.position.y)
      ctx.lineTo(player.position.x, player.position.y + GAME_BALANCE.PLAYER.HEIGHT)
      ctx.lineTo(player.position.x + GAME_BALANCE.PLAYER.WIDTH, player.position.y + GAME_BALANCE.PLAYER.HEIGHT)
      ctx.closePath()
      ctx.fill()

      // Draw new enemy system
      if (!enemyRenderer.current) {
        enemyRenderer.current = new EnemyRenderer(ctx)
      }
      
      // デバッグ表示削除（プロダクション版）
      
      if (enemyRenderer.current && enemySystem.enemies.length > 0) {
        enemyRenderer.current.drawEnemies(enemySystem.enemies)
      }
      if (enemyRenderer.current && enemySystem.enemyBullets.length > 0) {
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

      // パーティクルエフェクト描画（最前面）
      visualEffects.renderParticles(ctx)

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
        {/* 統計サマリー */}
        <div style={{ 
          marginBottom: '40px', 
          background: 'rgba(0,0,0,0.3)', 
          padding: '20px', 
          borderRadius: '15px',
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ color: '#ffd700', fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
            📊 プレイヤー統計
          </div>
          <div style={{ color: '#ff4444', fontSize: '16px', marginBottom: '5px' }}>
            ハイスコア: {gameStats.gameStats.highScore.toLocaleString()}
          </div>
          <div style={{ color: '#51cf66', fontSize: '14px', marginBottom: '5px' }}>
            最長生存: {gameStats.getPlayTimeFormatted(gameStats.gameStats.bestSurvivalTime)}
          </div>
          <div style={{ color: '#74c0fc', fontSize: '14px', marginBottom: '5px' }}>
            総プレイ回数: {gameStats.gameStats.totalGamesPlayed} 回
          </div>
          <div style={{ color: '#a78bfa', fontSize: '14px', marginBottom: '5px' }}>
            累計撃破数: {gameStats.gameStats.totalEnemiesKilled.toLocaleString()} 体
          </div>
          <div style={{ color: '#fbbf24', fontSize: '14px' }}>
            実績: {gameStats.gameStats.achievements.length} 個解除
          </div>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center' }}>
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
          
          <button
            onClick={audioSystem.toggleMute}
            style={{
              background: audioSystem.settings.muted ? 'rgba(255, 68, 68, 0.7)' : 'rgba(68, 255, 68, 0.7)',
              color: 'white',
              border: 'none',
              padding: '15px 20px',
              fontSize: '20px',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontFamily: "'Courier New', monospace"
            }}
            title={audioSystem.settings.muted ? '音響をオンにする' : '音響をオフにする'}
          >
            {audioSystem.settings.muted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      {/* ゲームUI - HPバー削除（敵エリア到達でゲームオーバーのため） */}
      
      {/* ポーズボタン - 右下配置（スマホ操作性向上） */}
      <button
        onClick={handlePause}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 10,
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          border: '2px solid #fff',
          padding: '12px 16px',
          borderRadius: '50%',
          fontSize: '20px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          minWidth: '50px',
          minHeight: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        ⏸
      </button>

      {/* レスポンシブ統計表示 */}
      <CompactStatsDisplay 
        stats={gameStats.gameStats}
        getPlayTimeFormatted={gameStats.getPlayTimeFormatted}
        getEfficiencyRating={gameStats.getEfficiencyRating}
      />

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

      {/* 実績通知 */}
      <AchievementNotification
        achievement={currentAchievement}
        onClose={() => setCurrentAchievement(null)}
      />
    </div>
  )
}

export default App