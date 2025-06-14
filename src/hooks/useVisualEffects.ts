import { useRef, useCallback, useEffect } from 'react'
import { VisualEffects } from '../effects/VisualEffects'

interface UseVisualEffectsProps {
  canvasWidth: number
  canvasHeight: number
  isGamePlaying: boolean
}

export const useVisualEffects = ({ canvasWidth, canvasHeight, isGamePlaying }: UseVisualEffectsProps) => {
  const visualEffects = useRef<VisualEffects | null>(null)

  // 初期化
  useEffect(() => {
    if (canvasWidth > 0 && canvasHeight > 0) {
      visualEffects.current = new VisualEffects(canvasWidth, canvasHeight)
    }
  }, [canvasWidth, canvasHeight])

  // キャンバスサイズ変更時の更新
  useEffect(() => {
    if (visualEffects.current) {
      visualEffects.current.updateCanvasSize(canvasWidth, canvasHeight)
    }
  }, [canvasWidth, canvasHeight])

  // エフェクト更新
  const updateEffects = useCallback((deltaTime: number, currentTime: number) => {
    if (visualEffects.current && isGamePlaying) {
      visualEffects.current.update(deltaTime, currentTime)
    }
  }, [isGamePlaying])

  // 背景描画
  const renderBackground = useCallback((ctx: CanvasRenderingContext2D) => {
    if (visualEffects.current) {
      visualEffects.current.renderBackground(ctx)
    }
  }, [])

  // パーティクル描画
  const renderParticles = useCallback((ctx: CanvasRenderingContext2D) => {
    if (visualEffects.current) {
      visualEffects.current.renderParticles(ctx)
    }
  }, [])

  // エフェクト描画（互換性のため残す）
  const renderEffects = useCallback((ctx: CanvasRenderingContext2D) => {
    if (visualEffects.current) {
      visualEffects.current.render(ctx)
    }
  }, [])

  // 敵撃破エフェクト
  const createEnemyDestroyEffect = useCallback((x: number, y: number, enemyType: string) => {
    if (visualEffects.current) {
      visualEffects.current.createEnemyDestroyEffect(x, y, enemyType)
    }
  }, [])

  // 射撃エフェクト
  const createShootEffect = useCallback((x: number, y: number) => {
    if (visualEffects.current) {
      visualEffects.current.createShootEffect(x, y)
    }
  }, [])

  // プレイヤートレイル
  const createPlayerTrail = useCallback((x: number, y: number) => {
    if (visualEffects.current) {
      visualEffects.current.createPlayerTrail(x, y)
    }
  }, [])

  // パワーアップ収集エフェクト
  const createPowerUpCollectEffect = useCallback((x: number, y: number, isGood: boolean) => {
    if (visualEffects.current) {
      visualEffects.current.createPowerUpCollectEffect(x, y, isGood)
    }
  }, [])

  // プレイヤーダメージエフェクト
  const createPlayerDamageEffect = useCallback((x: number, y: number) => {
    if (visualEffects.current) {
      visualEffects.current.createPlayerDamageEffect(x, y)
    }
  }, [])

  // レベルアップエフェクト
  const createLevelUpEffect = useCallback((x: number, y: number) => {
    if (visualEffects.current) {
      visualEffects.current.createLevelUpEffect(x, y)
    }
  }, [])

  // 実績解除エフェクト
  const createAchievementEffect = useCallback(() => {
    if (visualEffects.current) {
      visualEffects.current.createAchievementEffect()
    }
  }, [])

  // レベル対応背景速度調整
  const setLevelMultiplier = useCallback((level: number) => {
    if (visualEffects.current) {
      visualEffects.current.setLevelMultiplier(level)
    }
  }, [])

  // パフォーマンス情報取得
  const getPerformanceInfo = useCallback(() => {
    if (visualEffects.current) {
      return visualEffects.current.getPerformanceInfo()
    }
    return { particles: 0, stars: 0 }
  }, [])

  // エフェクトクリア
  const clearEffects = useCallback(() => {
    if (visualEffects.current) {
      visualEffects.current.clear()
    }
  }, [])

  // ゲーム停止時のクリーンアップ
  useEffect(() => {
    if (!isGamePlaying && visualEffects.current) {
      // ゲーム停止時はパーティクルのみクリア、背景スターは残す
      visualEffects.current.clearParticlesByType('explosion' as any)
      visualEffects.current.clearParticlesByType('muzzle_flash' as any)
      visualEffects.current.clearParticlesByType('trail' as any)
      visualEffects.current.clearParticlesByType('powerup_collect' as any)
      visualEffects.current.clearParticlesByType('damage_flash' as any)
    }
  }, [isGamePlaying])

  return {
    updateEffects,
    renderBackground,
    renderParticles,
    renderEffects,
    createEnemyDestroyEffect,
    createShootEffect,
    createPlayerTrail,
    createPowerUpCollectEffect,
    createPlayerDamageEffect,
    createLevelUpEffect,
    createAchievementEffect,
    setLevelMultiplier,
    getPerformanceInfo,
    clearEffects
  }
}