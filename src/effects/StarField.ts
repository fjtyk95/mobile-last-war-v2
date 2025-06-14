// 背景スターフィールドシステム

interface Star {
  x: number
  y: number
  size: number
  speed: number
  brightness: number
  twinkleRate: number
  twinklePhase: number
}

export class StarField {
  private stars: Star[] = []
  private lastSpawnTime = 0
  private canvasWidth = 0
  private canvasHeight = 0

  constructor(canvasWidth: number, canvasHeight: number) {
    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight
    this.generateInitialStars()
  }

  // 初期スター生成
  private generateInitialStars(): void {
    const starCount = Math.floor((this.canvasWidth * this.canvasHeight) / 8000) // 密度調整
    
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * this.canvasWidth,
        y: Math.random() * this.canvasHeight,
        size: 0.5 + Math.random() * 2,
        speed: 0.2 + Math.random() * 0.8,
        brightness: 0.3 + Math.random() * 0.7,
        twinkleRate: 0.01 + Math.random() * 0.02,
        twinklePhase: Math.random() * Math.PI * 2
      })
    }
  }

  // キャンバスサイズ更新
  updateCanvasSize(width: number, height: number): void {
    this.canvasWidth = width
    this.canvasHeight = height
  }

  // スター更新
  update(deltaTime: number, currentTime: number): void {
    // 既存スターの更新
    this.stars = this.stars.filter(star => {
      // 下向きに移動
      star.y += star.speed * (deltaTime / 16)
      
      // きらめきアニメーション
      star.twinklePhase += star.twinkleRate * deltaTime
      
      // 画面外に出たスターを削除
      return star.y <= this.canvasHeight + 10
    })

    // 新しいスターのスポーン（上部から）
    const spawnInterval = 150 // 150ms間隔
    if (currentTime - this.lastSpawnTime > spawnInterval) {
      if (Math.random() < 0.3) { // 30%の確率でスポーン
        this.stars.push({
          x: Math.random() * this.canvasWidth,
          y: -5,
          size: 0.5 + Math.random() * 2,
          speed: 0.3 + Math.random() * 1.2,
          brightness: 0.3 + Math.random() * 0.7,
          twinkleRate: 0.01 + Math.random() * 0.02,
          twinklePhase: Math.random() * Math.PI * 2
        })
      }
      this.lastSpawnTime = currentTime
    }
  }

  // スター描画
  render(ctx: CanvasRenderingContext2D): void {
    ctx.save()
    
    this.stars.forEach(star => {
      // きらめき効果計算
      const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7
      const alpha = star.brightness * twinkle
      
      ctx.globalAlpha = alpha
      ctx.fillStyle = '#ffffff'
      
      // スターを描画
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
      ctx.fill()
      
      // 大きいスターには十字の光線を追加
      if (star.size > 1.5) {
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 0.5
        ctx.globalAlpha = alpha * 0.5
        
        ctx.beginPath()
        ctx.moveTo(star.x - star.size * 2, star.y)
        ctx.lineTo(star.x + star.size * 2, star.y)
        ctx.moveTo(star.x, star.y - star.size * 2)
        ctx.lineTo(star.x, star.y + star.size * 2)
        ctx.stroke()
      }
    })
    
    ctx.restore()
  }

  // スター数取得
  getStarCount(): number {
    return this.stars.length
  }

  // スターをクリア
  clear(): void {
    this.stars = []
  }

  // レベルに応じたスター速度調整
  setSpeedMultiplier(multiplier: number): void {
    this.stars.forEach(star => {
      star.speed = (0.3 + Math.random() * 1.2) * multiplier
    })
  }
}