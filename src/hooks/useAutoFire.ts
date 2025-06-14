import { useRef, useCallback } from 'react'
import { getFireInterval, GAME_BALANCE } from '../constants/gameBalance'
import { Bullet } from '../types/game.types'

interface UseAutoFireProps {
  playerPosition: { x: number; y: number }
  playerPower: number
  isGamePlaying: boolean
}

export const useAutoFire = ({ playerPosition, playerPower, isGamePlaying }: UseAutoFireProps) => {
  const lastShotTime = useRef<number>(0)

  const tryAutoFire = useCallback((currentTime: number): Bullet | null => {
    if (!isGamePlaying) return null

    const fireInterval = getFireInterval(playerPower)
    
    if (currentTime - lastShotTime.current >= fireInterval) {
      lastShotTime.current = currentTime
      
      // 弾丸を生成
      const bullet: Bullet = {
        x: playerPosition.x + GAME_BALANCE.PLAYER.WIDTH / 2 - GAME_BALANCE.WEAPON.BULLET_WIDTH / 2,
        y: playerPosition.y,
        width: GAME_BALANCE.WEAPON.BULLET_WIDTH,
        height: GAME_BALANCE.WEAPON.BULLET_HEIGHT,
        speed: GAME_BALANCE.WEAPON.BULLET_SPEED,
      }
      
      return bullet
    }
    
    return null
  }, [playerPosition, playerPower, isGamePlaying])

  const resetAutoFire = useCallback(() => {
    lastShotTime.current = 0
  }, [])

  const getCurrentFireRate = useCallback(() => {
    return getFireInterval(playerPower)
  }, [playerPower])

  const getFireRateInfo = useCallback(() => {
    const currentInterval = getFireInterval(playerPower)
    const shotsPerSecond = Math.round(1000 / currentInterval * 10) / 10
    const efficiency = Math.round((1 - currentInterval / GAME_BALANCE.WEAPON.BASE_FIRE_INTERVAL) * 100)
    
    return {
      interval: currentInterval,
      shotsPerSecond,
      efficiency: Math.max(0, efficiency), // 負の値を防ぐ
    }
  }, [playerPower])

  return {
    tryAutoFire,
    resetAutoFire,
    getCurrentFireRate,
    getFireRateInfo,
  }
}