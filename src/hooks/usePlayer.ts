import { useState, useCallback } from 'react'
import { PlayerState, Position } from '../types/game.types'
import { GAME_BALANCE } from '../constants/gameBalance'

export const usePlayer = (canvasHeight: number = 600) => {
  // プレイヤーY座標を画面下部20%エリアに固定
  const fixedY = canvasHeight * (1 - GAME_BALANCE.PLAYER.AREA_RATIO)
  const initialPosition: Position = { x: 200, y: fixedY }
  const [health, setHealth] = useState(100)
  const [maxHealth] = useState(100)
  const [power, setPower] = useState(10)
  const [position, setPosition] = useState<Position>(initialPosition)
  const [invulnerable, setInvulnerable] = useState(false)
  const [invulnerableTime, setInvulnerableTime] = useState(0)

  const takeDamage = useCallback((amount: number) => {
    if (invulnerable) return

    setHealth(prevHealth => {
      const newHealth = Math.max(0, prevHealth - amount)
      return newHealth
    })

    // 無敵時間設定（1秒）
    setInvulnerable(true)
    setInvulnerableTime(1000)
  }, [invulnerable])

  const heal = useCallback((amount: number) => {
    setHealth(prevHealth => Math.min(maxHealth, prevHealth + amount))
  }, [maxHealth])

  const isDead = useCallback(() => {
    return health <= 0
  }, [health])

  const updatePower = useCallback((newPower: number) => {
    setPower(Math.max(1, newPower)) // 最小値1
  }, [])

  const updatePosition = useCallback((newPosition: Position) => {
    // Y座標は固定、X座標のみ更新
    setPosition(prev => ({
      x: newPosition.x,
      y: fixedY // 常に画面下部に固定
    }))
  }, [fixedY])

  const updatePositionX = useCallback((x: number, canvasWidth: number) => {
    // 左右移動のみ、画面内に制限
    const constrainedX = Math.max(0, Math.min(canvasWidth - GAME_BALANCE.PLAYER.WIDTH, x))
    setPosition(prev => ({
      x: constrainedX,
      y: fixedY
    }))
  }, [fixedY])

  const updateInvulnerability = useCallback((deltaTime: number) => {
    if (invulnerable && invulnerableTime > 0) {
      const newTime = invulnerableTime - deltaTime
      if (newTime <= 0) {
        setInvulnerable(false)
        setInvulnerableTime(0)
      } else {
        setInvulnerableTime(newTime)
      }
    }
  }, [invulnerable, invulnerableTime])

  const resetPlayer = useCallback((canvasHeight?: number) => {
    setHealth(GAME_BALANCE.PLAYER.INITIAL_HEALTH)
    setPower(GAME_BALANCE.PLAYER.INITIAL_POWER)
    
    const newY = canvasHeight ? canvasHeight * (1 - GAME_BALANCE.PLAYER.AREA_RATIO) : fixedY
    setPosition({ x: 200, y: newY })
    
    setInvulnerable(false)
    setInvulnerableTime(0)
  }, [fixedY])

  const playerState: PlayerState = {
    health,
    maxHealth,
    position,
    power,
    weapons: [], // Phase 3で実装
    width: 40,
    height: 40,
    invulnerable,
    invulnerableTime
  }

  return {
    playerState,
    health,
    maxHealth,
    power,
    position,
    invulnerable,
    fixedY,
    takeDamage,
    heal,
    isDead,
    updatePower,
    updatePosition,
    updatePositionX,
    updateInvulnerability,
    resetPlayer
  }
}