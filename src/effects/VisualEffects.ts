// 視覚エフェクト管理システム

import { ParticleSystem, ParticleType } from './ParticleSystem'
import { StarField } from './StarField'

export class VisualEffects {
  private particleSystem: ParticleSystem
  private starField: StarField
  private screenShake = { x: 0, y: 0, intensity: 0, duration: 0 }
  
  constructor(canvasWidth: number, canvasHeight: number) {
    this.particleSystem = new ParticleSystem()
    this.starField = new StarField(canvasWidth, canvasHeight)
  }

  // キャンバスサイズ更新
  updateCanvasSize(width: number, height: number): void {
    this.starField.updateCanvasSize(width, height)
  }

  // システム全体の更新
  update(deltaTime: number, currentTime: number): void {
    this.particleSystem.update(deltaTime)
    this.starField.update(deltaTime, currentTime)
    this.updateScreenShake(deltaTime)
  }

  // 背景描画（ゲームオブジェクトの前）
  renderBackground(ctx: CanvasRenderingContext2D): void {
    ctx.save()
    
    // スクリーンシェイク適用
    if (this.screenShake.intensity > 0) {
      ctx.translate(this.screenShake.x, this.screenShake.y)
    }
    
    // 背景スターフィールド描画
    this.starField.render(ctx)
    
    ctx.restore()
  }

  // パーティクルエフェクト描画（ゲームオブジェクトの後）
  renderParticles(ctx: CanvasRenderingContext2D): void {
    this.particleSystem.render(ctx)
  }

  // 全体描画（互換性のため残す）
  render(ctx: CanvasRenderingContext2D): void {
    this.renderBackground(ctx)
    this.renderParticles(ctx)
  }

  // === エフェクト生成メソッド ===

  // 敵撃破エフェクト（敵タイプ別）
  createEnemyDestroyEffect(x: number, y: number, enemyType: string): void {
    let intensity = 1
    
    switch (enemyType) {
      case 'Basic':
        intensity = 0.8
        break
      case 'Fast':
        intensity = 0.6
        break
      case 'Tank':
        intensity = 1.5
        this.createScreenShake(8, 200)
        break
      case 'Boss':
        intensity = 2.0
        this.createScreenShake(15, 400)
        break
    }
    
    this.particleSystem.createExplosion(x, y, intensity)
  }

  // 射撃エフェクト
  createShootEffect(x: number, y: number): void {
    this.particleSystem.createMuzzleFlash(x, y)
  }

  // プレイヤートレイル
  createPlayerTrail(x: number, y: number): void {
    this.particleSystem.createTrail(x, y)
  }

  // パワーアップ収集エフェクト
  createPowerUpCollectEffect(x: number, y: number, isGood: boolean): void {
    this.particleSystem.createPowerUpEffect(x, y, isGood)
  }

  // プレイヤーダメージエフェクト
  createPlayerDamageEffect(x: number, y: number): void {
    this.particleSystem.createDamageFlash(x, y)
    this.createScreenShake(5, 150)
  }

  // レベルアップエフェクト
  createLevelUpEffect(x: number, y: number): void {
    // 大きな爆発エフェクト
    this.particleSystem.createExplosion(x, y, 2.5)
    
    // 追加の円形パーティクル
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20
      const distance = 50
      this.particleSystem.createPowerUpEffect(
        x + Math.cos(angle) * distance,
        y + Math.sin(angle) * distance,
        true
      )
    }
  }

  // 実績解除エフェクト
  createAchievementEffect(): void {
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    
    // 複数の爆発エフェクト
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.particleSystem.createExplosion(centerX, centerY, 1.5)
      }, i * 100)
    }
  }

  // === スクリーンシェイク ===

  // スクリーンシェイク生成
  createScreenShake(intensity: number, duration: number): void {
    this.screenShake.intensity = intensity
    this.screenShake.duration = duration
  }

  // スクリーンシェイク更新
  private updateScreenShake(deltaTime: number): void {
    if (this.screenShake.duration > 0) {
      this.screenShake.duration -= deltaTime
      
      if (this.screenShake.duration > 0) {
        const shake = this.screenShake.intensity * (this.screenShake.duration / 400)
        this.screenShake.x = (Math.random() - 0.5) * shake
        this.screenShake.y = (Math.random() - 0.5) * shake
      } else {
        this.screenShake.x = 0
        this.screenShake.y = 0
        this.screenShake.intensity = 0
      }
    }
  }

  // === レベル対応エフェクト ===

  // レベルに応じた背景速度調整
  setLevelMultiplier(level: number): void {
    const speedMultiplier = 1 + (level - 1) * 0.1 // レベルが上がるにつれて背景も速く
    this.starField.setSpeedMultiplier(speedMultiplier)
  }

  // === ユーティリティ ===

  // パフォーマンス情報取得
  getPerformanceInfo(): { particles: number; stars: number } {
    return {
      particles: this.particleSystem.getParticleCount(),
      stars: this.starField.getStarCount()
    }
  }

  // エフェクトクリア
  clear(): void {
    this.particleSystem.clear()
    this.starField.clear()
    this.screenShake = { x: 0, y: 0, intensity: 0, duration: 0 }
  }

  // 特定パーティクルタイプのクリア
  clearParticlesByType(type: ParticleType): void {
    this.particleSystem.clearParticlesByType(type)
  }
}