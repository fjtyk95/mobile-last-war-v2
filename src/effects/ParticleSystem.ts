// パーティクルエフェクトシステム

export interface Particle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
  alpha: number
  decay: number
  type: ParticleType
}

export enum ParticleType {
  EXPLOSION = 'explosion',
  MUZZLE_FLASH = 'muzzle_flash',
  TRAIL = 'trail',
  POWERUP_COLLECT = 'powerup_collect',
  STAR = 'star',
  DAMAGE_FLASH = 'damage_flash'
}

export class ParticleSystem {
  private particles: Particle[] = []
  private particleId = 0

  // 爆発エフェクト生成
  createExplosion(x: number, y: number, intensity: number = 1): void {
    const particleCount = Math.floor(15 * intensity)
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5
      const speed = 2 + Math.random() * 4 * intensity
      const size = 2 + Math.random() * 4
      
      this.particles.push({
        id: (this.particleId++).toString(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 800 + Math.random() * 400, // 0.8-1.2秒
        maxLife: 800 + Math.random() * 400,
        color: this.getExplosionColor(),
        size,
        alpha: 1,
        decay: 0.98,
        type: ParticleType.EXPLOSION
      })
    }
  }

  // マズルフラッシュエフェクト
  createMuzzleFlash(x: number, y: number): void {
    const particleCount = 8
    
    for (let i = 0; i < particleCount; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8 // 上向き中心
      const speed = 1 + Math.random() * 3
      
      this.particles.push({
        id: (this.particleId++).toString(),
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 200 + Math.random() * 100, // 0.2-0.3秒
        maxLife: 200 + Math.random() * 100,
        color: '#ffff00',
        size: 1 + Math.random() * 2,
        alpha: 1,
        decay: 0.95,
        type: ParticleType.MUZZLE_FLASH
      })
    }
  }

  // トレイルエフェクト
  createTrail(x: number, y: number): void {
    this.particles.push({
      id: (this.particleId++).toString(),
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      life: 300 + Math.random() * 200,
      maxLife: 300 + Math.random() * 200,
      color: '#0066ff',
      size: 1 + Math.random(),
      alpha: 0.6,
      decay: 0.96,
      type: ParticleType.TRAIL
    })
  }

  // パワーアップ収集エフェクト
  createPowerUpEffect(x: number, y: number, isGood: boolean): void {
    const particleCount = 12
    const color = isGood ? '#51cf66' : '#ff6b6b'
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount
      const speed = 1 + Math.random() * 2
      
      this.particles.push({
        id: (this.particleId++).toString(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 600 + Math.random() * 300,
        maxLife: 600 + Math.random() * 300,
        color,
        size: 2 + Math.random() * 2,
        alpha: 1,
        decay: 0.97,
        type: ParticleType.POWERUP_COLLECT
      })
    }
  }

  // 背景スターフィールド
  createStar(x: number, y: number): void {
    this.particles.push({
      id: (this.particleId++).toString(),
      x,
      y,
      vx: 0,
      vy: 0.5 + Math.random() * 1, // 下向き
      life: Infinity, // 永続
      maxLife: Infinity,
      color: '#ffffff',
      size: 0.5 + Math.random() * 1.5,
      alpha: 0.3 + Math.random() * 0.7,
      decay: 1,
      type: ParticleType.STAR
    })
  }

  // ダメージフラッシュ
  createDamageFlash(x: number, y: number): void {
    const particleCount = 6
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 0.5 + Math.random()
      
      this.particles.push({
        id: (this.particleId++).toString(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 400,
        maxLife: 400,
        color: '#ff4444',
        size: 1 + Math.random() * 2,
        alpha: 1,
        decay: 0.96,
        type: ParticleType.DAMAGE_FLASH
      })
    }
  }

  // パーティクル更新
  update(deltaTime: number): void {
    this.particles = this.particles.filter(particle => {
      // 位置更新
      particle.x += particle.vx * (deltaTime / 16)
      particle.y += particle.vy * (deltaTime / 16)
      
      // 寿命更新
      if (particle.life !== Infinity) {
        particle.life -= deltaTime
      }
      
      // アルファ値減衰
      particle.alpha *= particle.decay
      
      // 重力適用（爆発パーティクルのみ）
      if (particle.type === ParticleType.EXPLOSION) {
        particle.vy += 0.1 * (deltaTime / 16)
      }

      // スターの画面外削除
      if (particle.type === ParticleType.STAR && particle.y > window.innerHeight + 10) {
        return false
      }
      
      // 寿命切れまたは透明になったパーティクルを削除
      return particle.life > 0 && particle.alpha > 0.01
    })
  }

  // パーティクル描画
  render(ctx: CanvasRenderingContext2D): void {
    const originalCompositeOperation = ctx.globalCompositeOperation
    
    this.particles.forEach(particle => {
      ctx.save()
      
      // アルファ値設定
      ctx.globalAlpha = particle.alpha
      
      // エフェクトタイプ別の描画
      switch (particle.type) {
        case ParticleType.EXPLOSION:
        case ParticleType.POWERUP_COLLECT:
          // 光るエフェクト
          ctx.globalCompositeOperation = 'lighter'
          ctx.fillStyle = particle.color
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fill()
          break
          
        case ParticleType.MUZZLE_FLASH:
          // 明るい黄色フラッシュ
          ctx.globalCompositeOperation = 'lighter'
          ctx.fillStyle = particle.color
          ctx.shadowBlur = 10
          ctx.shadowColor = particle.color
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fill()
          break
          
        case ParticleType.TRAIL:
          // プレイヤートレイル
          ctx.fillStyle = particle.color
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fill()
          break
          
        case ParticleType.STAR:
          // 背景スター
          ctx.fillStyle = particle.color
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fill()
          break
          
        case ParticleType.DAMAGE_FLASH:
          // ダメージエフェクト
          ctx.globalCompositeOperation = 'lighter'
          ctx.fillStyle = particle.color
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fill()
          break
      }
      
      ctx.restore()
    })
    
    ctx.globalCompositeOperation = originalCompositeOperation
  }

  // 爆発色のランダム生成
  private getExplosionColor(): string {
    const colors = ['#ff4444', '#ff6666', '#ff8844', '#ffaa44', '#ffcc44']
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // パーティクル数取得（デバッグ用）
  getParticleCount(): number {
    return this.particles.length
  }

  // 特定タイプのパーティクルをクリア
  clearParticlesByType(type: ParticleType): void {
    this.particles = this.particles.filter(p => p.type !== type)
  }

  // 全パーティクルをクリア
  clear(): void {
    this.particles = []
  }
}