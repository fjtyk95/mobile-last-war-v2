import { useState, useCallback } from 'react'
import { PowerUp, PowerUpType, Position, PowerUpEffect } from '../types/game.types'
import { GAME_BALANCE } from '../constants/gameBalance'

export const usePowerUps = () => {
  const [powerUps, setPowerUps] = useState<PowerUp[]>([])

  const spawnPowerUp = useCallback((position: Position, type?: PowerUpType) => {
    const powerUpTypes = Object.values(PowerUpType).filter(t => t !== PowerUpType.DAMAGE_DOWN)
    const selectedType = type || powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)]
    
    const newPowerUp: PowerUp = {
      id: `powerup_${Date.now()}_${Math.random()}`,
      type: selectedType,
      position: { x: position.x, y: position.y },
      width: GAME_BALANCE.POWERUP.WIDTH,
      height: GAME_BALANCE.POWERUP.HEIGHT,
      value: getPowerUpValue(selectedType)
    }

    setPowerUps(prev => [...prev, newPowerUp])
  }, [])

  const getPowerUpValue = (type: PowerUpType): number => {
    switch (type) {
      case PowerUpType.DAMAGE_UP:
        return GAME_BALANCE.POWERUP.DAMAGE_UP_VALUE
      case PowerUpType.HEALTH:
        return GAME_BALANCE.POWERUP.HEALTH_RESTORE_VALUE
      case PowerUpType.MULTI_SHOT:
        return 1 // enable multi-shot (Phase 3で実装)
      case PowerUpType.SHIELD:
        return 3000 // 3 seconds shield (Phase 3で実装)
      case PowerUpType.DAMAGE_DOWN:
        return GAME_BALANCE.POWERUP.DAMAGE_DOWN_VALUE
      default:
        return 1
    }
  }

  const applyPowerUpEffect = useCallback((
    type: PowerUpType, 
    method: 'shoot' | 'touch',
    player: any
  ): PowerUpEffect => {
    let actualType = type
    let value = getPowerUpValue(type)

    // 直接接触の場合は負効果に変換
    if (method === 'touch') {
      switch (type) {
        case PowerUpType.DAMAGE_UP:
          actualType = PowerUpType.DAMAGE_DOWN
          value = GAME_BALANCE.POWERUP.DAMAGE_DOWN_VALUE
          player.updatePower && player.updatePower(player.power + value)
          break
        case PowerUpType.HEALTH:
          // ヘルスアイテムも接触ではダメージ
          player.takeDamage && player.takeDamage(10)
          value = -10
          break
        case PowerUpType.MULTI_SHOT:
          // マルチショットは接触で攻撃力ダウン
          actualType = PowerUpType.DAMAGE_DOWN
          value = GAME_BALANCE.POWERUP.DAMAGE_DOWN_VALUE
          player.updatePower && player.updatePower(player.power + value)
          break
        case PowerUpType.SHIELD:
          // シールドは接触で無効
          value = 0
          break
      }
    } else {
      // 弾での撃破は正効果
      switch (type) {
        case PowerUpType.DAMAGE_UP:
          player.updatePower && player.updatePower(player.power + GAME_BALANCE.POWERUP.DAMAGE_UP_VALUE)
          break
        case PowerUpType.HEALTH:
          player.heal && player.heal(GAME_BALANCE.POWERUP.HEALTH_RESTORE_VALUE)
          break
        case PowerUpType.MULTI_SHOT:
          // Phase 3で実装予定
          break
        case PowerUpType.SHIELD:
          // Phase 3で実装予定
          break
      }
    }

    return { type: actualType, value }
  }, [])

  const collectPowerUp = useCallback((
    powerUpId: string, 
    method: 'shoot' | 'touch',
    player: any
  ): PowerUpEffect | null => {
    const powerUp = powerUps.find(p => p.id === powerUpId)
    if (!powerUp) return null

    const effect = applyPowerUpEffect(powerUp.type, method, player)
    
    // パワーアップを削除
    setPowerUps(prev => prev.filter(p => p.id !== powerUpId))
    
    return effect
  }, [powerUps, applyPowerUpEffect])

  const updatePowerUps = useCallback((deltaTime: number, canvasHeight: number = 600) => {
    setPowerUps(prev => 
      prev.map(powerUp => ({
        ...powerUp,
        position: {
          ...powerUp.position,
          y: powerUp.position.y + GAME_BALANCE.POWERUP.FALL_SPEED * (deltaTime / 1000)
        }
      }))
      .filter(powerUp => powerUp.position.y < canvasHeight + 50) // 画面外で削除
    )
  }, [])

  const clearPowerUps = useCallback(() => {
    setPowerUps([])
  }, [])

  return {
    powerUps,
    spawnPowerUp,
    collectPowerUp,
    updatePowerUps,
    clearPowerUps,
    applyPowerUpEffect
  }
}