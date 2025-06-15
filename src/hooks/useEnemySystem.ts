// Mobile Last War v2 - Enemy Management System

import { useState, useRef, useCallback } from 'react'
import { EnemyState, EnemyType, EnemyBullet, ENEMY_CONFIGS } from '../types/enemy.types'
import { GAME_BALANCE } from '../constants/gameBalance'
import { createEnemyId, createBulletId } from '../utils/idGenerator'
import { MovePatternHandler } from '../utils/enemyMovement'

interface UseEnemySystemProps {
  canvasWidth: number
  canvasHeight: number
  isGamePlaying: boolean
  currentLevel: number
}

export const useEnemySystem = ({ 
  canvasWidth, 
  canvasHeight, 
  isGamePlaying,
  currentLevel 
}: UseEnemySystemProps) => {
  const [enemies, setEnemies] = useState<EnemyState[]>([])
  const [enemyBullets, setEnemyBullets] = useState<EnemyBullet[]>([])
  
  const moveHandler = useRef(new MovePatternHandler())
  const lastSpawnTime = useRef(0)

  // 敵タイプを決定（レベルに応じた重み付け）
  const selectEnemyType = useCallback((level: number): EnemyType => {
    const weights = {
      [EnemyType.BASIC]: level <= 3 ? 10 : level <= 6 ? 8 : 5,
      [EnemyType.FAST]: level <= 3 ? 0 : level <= 6 ? 4 : 6,
      [EnemyType.TANK]: level <= 5 ? 0 : level <= 8 ? 2 : 4,
      [EnemyType.BOSS]: level <= 8 ? 0 : 1
    }

    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
    let random = Math.random() * totalWeight
    
    for (const [type, weight] of Object.entries(weights)) {
      random -= weight
      if (random <= 0) {
        return type as EnemyType
      }
    }
    
    return EnemyType.BASIC
  }, [])

  // 敵の生成
  const spawnEnemy = useCallback((currentTime: number, spawnInterval: number) => {
    // 初回実行時の初期化
    if (lastSpawnTime.current === 0) {
      lastSpawnTime.current = currentTime
      console.log(`初回敵スポーン初期化: currentTime=${currentTime}, spawnInterval=${spawnInterval}`)
      return false
    }
    
    const timeSinceLastSpawn = currentTime - lastSpawnTime.current
    if (timeSinceLastSpawn < spawnInterval) {
      return false
    }
    
    console.log(`敵スポーン: timeSinceLastSpawn=${timeSinceLastSpawn}, spawnInterval=${spawnInterval}`)

    const enemyType = selectEnemyType(currentLevel)
    const config = ENEMY_CONFIGS[enemyType]
    
    // 敵タイプ別のベースヘルス設定
    let baseHealth: number
    switch (enemyType) {
      case EnemyType.BASIC:
        baseHealth = 10 // プレイヤー初期攻撃力で1発撃破
        break
      case EnemyType.FAST:
        baseHealth = 10 // プレイヤー初期攻撃力で1発撃破
        break
      case EnemyType.TANK:
        baseHealth = 30 // 3発で撃破
        break
      case EnemyType.BOSS:
        baseHealth = 50 // 5発で撃破
        break
      default:
        baseHealth = 10
    }
    
    // レベルに応じたヘルス調整（最大2倍まで）
    const healthMultiplier = Math.min(2, 1 + (currentLevel - 1) * 0.1)
    const health = Math.floor(baseHealth * healthMultiplier)

    const enemy: EnemyState = {
      id: createEnemyId(),
      type: enemyType,
      position: {
        x: Math.random() * (canvasWidth - config.stats.width),
        y: -config.stats.height
      },
      stats: {
        ...config.stats,
        health,
        maxHealth: health
      },
      movePattern: {
        type: config.movePattern.type,
        parameters: { ...config.movePattern.baseParameters }
      },
      attackPattern: {
        ...config.attackPattern,
        lastFired: 0
      },
      moveStartTime: currentTime,
      movePhase: 0,
      color: config.color,
      isFlashing: false,
      flashEndTime: 0
    }

    setEnemies(prev => [...prev, enemy])
    lastSpawnTime.current = currentTime
    return true
  }, [selectEnemyType, currentLevel, canvasWidth])

  // 敵の更新処理
  const updateEnemies = useCallback((deltaTime: number, currentTime: number) => {
    if (!isGamePlaying) return

    setEnemies(prev => prev.map(enemy => {
      // 移動処理
      const newPosition = moveHandler.current.updatePosition(
        enemy, 
        deltaTime, 
        currentTime,
        canvasWidth,
        canvasHeight
      )

      // フラッシュ効果の更新
      const isFlashing = enemy.isFlashing && currentTime < enemy.flashEndTime
      
      return {
        ...enemy,
        position: newPosition,
        isFlashing,
        movePhase: enemy.movePhase + deltaTime * 0.001 // 移動フェーズ更新
      }
    }))
  }, [isGamePlaying, canvasWidth, canvasHeight])

  // 敵の攻撃処理
  const updateEnemyAttacks = useCallback((currentTime: number) => {
    if (!isGamePlaying) return

    const newBullets: EnemyBullet[] = []

    enemies.forEach(enemy => {
      if (!enemy.attackPattern.enabled) return
      
      if (currentTime - enemy.attackPattern.lastFired >= enemy.attackPattern.fireRate) {
        // 複数弾発射の処理
        for (let i = 0; i < enemy.attackPattern.bulletCount; i++) {
          const spreadAngle = enemy.attackPattern.spread * (Math.PI / 180)
          const angleStep = enemy.attackPattern.bulletCount > 1 
            ? spreadAngle / (enemy.attackPattern.bulletCount - 1) 
            : 0
          const angle = -spreadAngle / 2 + angleStep * i
          
          const bullet: EnemyBullet = {
            id: createBulletId(),
            x: enemy.position.x + enemy.stats.width / 2,
            y: enemy.position.y + enemy.stats.height,
            width: 4,
            height: 8,
            speed: enemy.attackPattern.bulletSpeed,
            direction: {
              x: Math.sin(angle),
              y: Math.cos(angle)
            },
            color: '#ff6b35'
          }
          
          newBullets.push(bullet)
        }
        
        // 攻撃パターンの最終発射時間を更新
        enemy.attackPattern.lastFired = currentTime
      }
    })

    if (newBullets.length > 0) {
      setEnemyBullets(prev => [...prev, ...newBullets])
    }
  }, [isGamePlaying, enemies])

  // 敵弾の更新処理
  const updateEnemyBullets = useCallback((deltaTime: number) => {
    if (!isGamePlaying) return

    setEnemyBullets(prev => prev.filter(bullet => {
      // 弾の移動
      bullet.x += bullet.direction.x * bullet.speed
      bullet.y += bullet.direction.y * bullet.speed
      
      // 画面外判定
      return bullet.y < canvasHeight + 20 && 
             bullet.x > -20 && 
             bullet.x < canvasWidth + 20
    }))
  }, [isGamePlaying, canvasHeight, canvasWidth])

  // 敵へのダメージ処理
  const damageEnemy = useCallback((enemyId: string, damage: number): boolean => {
    let enemyDestroyed = false
    
    setEnemies(prev => {
      const updatedEnemies = prev.map(enemy => {
        if (enemy.id !== enemyId) return enemy
        
        const newHealth = Math.max(0, enemy.stats.health - damage)
        
        if (newHealth <= 0) {
          enemyDestroyed = true
          return null // 削除対象をマーク
        }
        
        // ダメージフラッシュ効果
        return {
          ...enemy,
          stats: { ...enemy.stats, health: newHealth },
          isFlashing: true,
          flashEndTime: Date.now() + 200 // 200ms点滅
        }
      }).filter((enemy): enemy is EnemyState => enemy !== null) // null除去
      
      return updatedEnemies
    })
    
    return enemyDestroyed
  }, [])

  // ゲームオーバーチェック
  const checkGameOver = useCallback(() => {
    const gameOverLine = canvasHeight * GAME_BALANCE.ENEMY.GAME_OVER_ZONE_RATIO
    
    // 敵がゲームオーバーラインに到達しているかチェック
    const hasEnemyReachedLine = enemies.some(enemy => {
      const reached = enemy.position.y >= gameOverLine
      if (reached) {
        console.log(`Enemy ${enemy.id} (${enemy.type}) reached game over line at y=${enemy.position.y}, line=${gameOverLine}`)
      }
      return reached
    })
    
    return hasEnemyReachedLine
  }, [enemies, canvasHeight])

  // 敵の削除（画面外のみ）
  const removeEnemiesOutOfBounds = useCallback(() => {
    setEnemies(prev => prev.filter(enemy => {
      // 画面外チェックのみ
      return enemy.position.y < canvasHeight + enemy.stats.height
    }))
  }, [canvasHeight])

  // システムリセット
  const resetEnemySystem = useCallback(() => {
    setEnemies([])
    setEnemyBullets([])
    // lastSpawnTimeは次回spawnEnemyで初期化される
    lastSpawnTime.current = 0
  }, [])

  // 全敵をクリア
  const clearAllEnemies = useCallback(() => {
    setEnemies([])
    setEnemyBullets([])
  }, [])

  // 敵弾を削除する関数
  const removeEnemyBullet = useCallback((bulletId: string) => {
    setEnemyBullets(prev => prev.filter(bullet => bullet.id !== bulletId))
  }, [])

  return {
    enemies,
    enemyBullets,
    spawnEnemy,
    updateEnemies,
    updateEnemyAttacks,
    updateEnemyBullets,
    damageEnemy,
    checkGameOver,
    removeEnemiesOutOfBounds,
    removeEnemyBullet,
    resetEnemySystem,
    clearAllEnemies
  }
}