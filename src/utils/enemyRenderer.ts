// Mobile Last War v2 - Enemy Rendering System

import { EnemyState, EnemyType, EnemyBullet } from '../types/enemy.types'

export class EnemyRenderer {
  private ctx: CanvasRenderingContext2D

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
  }

  // 敵の描画
  drawEnemy(enemy: EnemyState): void {
    const { position, stats, type, color, isFlashing } = enemy

    // フラッシュ効果
    if (isFlashing) {
      this.ctx.globalAlpha = 0.5 + 0.5 * Math.sin(Date.now() * 0.02)
    }

    // 敵タイプに応じた描画
    switch (type) {
      case EnemyType.BASIC:
        this.drawBasicEnemy(position, stats, color)
        break
      case EnemyType.FAST:
        this.drawFastEnemy(position, stats, color)
        break
      case EnemyType.TANK:
        this.drawTankEnemy(position, stats, color)
        break
      case EnemyType.BOSS:
        this.drawBossEnemy(position, stats, color)
        break
    }

    // ヘルスバー描画（TANKとBOSSのみ）
    if (type === EnemyType.TANK || type === EnemyType.BOSS) {
      this.drawHealthBar(enemy)
    }

    this.ctx.globalAlpha = 1.0
  }

  // 基本敵（逆三角形）
  private drawBasicEnemy(position: { x: number; y: number }, stats: any, color: string): void {
    this.ctx.fillStyle = color
    this.ctx.beginPath()
    this.ctx.moveTo(position.x + stats.width / 2, position.y + stats.height)
    this.ctx.lineTo(position.x, position.y)
    this.ctx.lineTo(position.x + stats.width, position.y)
    this.ctx.closePath()
    this.ctx.fill()

    // 輪郭線
    this.ctx.strokeStyle = '#ffffff'
    this.ctx.lineWidth = 1
    this.ctx.stroke()
  }

  // 高速敵（ダイヤモンド型）
  private drawFastEnemy(position: { x: number; y: number }, stats: any, color: string): void {
    const centerX = position.x + stats.width / 2
    const centerY = position.y + stats.height / 2

    this.ctx.fillStyle = color
    this.ctx.beginPath()
    this.ctx.moveTo(centerX, position.y) // 上
    this.ctx.lineTo(position.x + stats.width, centerY) // 右
    this.ctx.lineTo(centerX, position.y + stats.height) // 下
    this.ctx.lineTo(position.x, centerY) // 左
    this.ctx.closePath()
    this.ctx.fill()

    // 輪郭線
    this.ctx.strokeStyle = '#ffffff'
    this.ctx.lineWidth = 1
    this.ctx.stroke()

    // 速度ライン効果
    this.ctx.strokeStyle = '#ffff00'
    this.ctx.lineWidth = 2
    this.ctx.beginPath()
    this.ctx.moveTo(centerX - 8, centerY - 5)
    this.ctx.lineTo(centerX + 8, centerY + 5)
    this.ctx.moveTo(centerX - 8, centerY + 5)
    this.ctx.lineTo(centerX + 8, centerY - 5)
    this.ctx.stroke()
  }

  // タンク敵（四角形、重装甲風）
  private drawTankEnemy(position: { x: number; y: number }, stats: any, color: string): void {
    // メインボディ
    this.ctx.fillStyle = color
    this.ctx.fillRect(position.x, position.y, stats.width, stats.height)

    // 装甲ライン
    this.ctx.strokeStyle = '#ffffff'
    this.ctx.lineWidth = 2
    this.ctx.strokeRect(position.x, position.y, stats.width, stats.height)

    // 装甲プレート効果
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    this.ctx.fillRect(position.x + 5, position.y + 5, stats.width - 10, stats.height - 10)

    // 砲塔
    const centerX = position.x + stats.width / 2
    const centerY = position.y + stats.height / 2
    this.ctx.fillStyle = '#666666'
    this.ctx.beginPath()
    this.ctx.arc(centerX, centerY, 8, 0, Math.PI * 2)
    this.ctx.fill()
    
    // 砲身
    this.ctx.strokeStyle = '#333333'
    this.ctx.lineWidth = 4
    this.ctx.beginPath()
    this.ctx.moveTo(centerX, centerY)
    this.ctx.lineTo(centerX, position.y + stats.height + 10)
    this.ctx.stroke()
  }

  // ボス敵（六角形、威圧的）
  private drawBossEnemy(position: { x: number; y: number }, stats: any, color: string): void {
    const centerX = position.x + stats.width / 2
    const centerY = position.y + stats.height / 2
    const radius = stats.width / 2

    // 六角形
    this.ctx.fillStyle = color
    this.ctx.beginPath()
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      if (i === 0) {
        this.ctx.moveTo(x, y)
      } else {
        this.ctx.lineTo(x, y)
      }
    }
    this.ctx.closePath()
    this.ctx.fill()

    // グラデーション効果
    const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)')
    this.ctx.fillStyle = gradient
    this.ctx.fill()

    // 輪郭線
    this.ctx.strokeStyle = '#ffffff'
    this.ctx.lineWidth = 3
    this.ctx.stroke()

    // コア（中央の光る部分）
    this.ctx.fillStyle = '#ffff00'
    this.ctx.beginPath()
    this.ctx.arc(centerX, centerY, 12, 0, Math.PI * 2)
    this.ctx.fill()

    // 武器マウント
    for (let i = 0; i < 3; i++) {
      const angle = (i * 2 * Math.PI) / 3
      const mountX = centerX + (radius - 10) * Math.cos(angle)
      const mountY = centerY + (radius - 10) * Math.sin(angle)
      
      this.ctx.fillStyle = '#333333'
      this.ctx.beginPath()
      this.ctx.arc(mountX, mountY, 4, 0, Math.PI * 2)
      this.ctx.fill()
    }
  }

  // ヘルスバー
  private drawHealthBar(enemy: EnemyState): void {
    const { position, stats } = enemy
    const barWidth = stats.width
    const barHeight = 4
    const barY = position.y - 8

    // 背景
    this.ctx.fillStyle = '#333333'
    this.ctx.fillRect(position.x, barY, barWidth, barHeight)

    // ヘルス
    const healthRatio = stats.health / stats.maxHealth
    const healthWidth = barWidth * healthRatio
    
    let healthColor = '#51cf66' // 緑
    if (healthRatio < 0.3) {
      healthColor = '#ff6b6b' // 赤
    } else if (healthRatio < 0.6) {
      healthColor = '#ffd43b' // 黄
    }
    
    this.ctx.fillStyle = healthColor
    this.ctx.fillRect(position.x, barY, healthWidth, barHeight)

    // 輪郭
    this.ctx.strokeStyle = '#ffffff'
    this.ctx.lineWidth = 1
    this.ctx.strokeRect(position.x, barY, barWidth, barHeight)
  }

  // 敵弾の描画
  drawEnemyBullet(bullet: EnemyBullet): void {
    this.ctx.fillStyle = bullet.color
    
    // 楕円形の弾
    this.ctx.beginPath()
    this.ctx.ellipse(
      bullet.x + bullet.width / 2,
      bullet.y + bullet.height / 2,
      bullet.width / 2,
      bullet.height / 2,
      0,
      0,
      Math.PI * 2
    )
    this.ctx.fill()

    // 光る効果
    this.ctx.strokeStyle = '#ffffff'
    this.ctx.lineWidth = 1
    this.ctx.stroke()
  }

  // 複数敵の一括描画
  drawEnemies(enemies: EnemyState[]): void {
    enemies.forEach(enemy => this.drawEnemy(enemy))
  }

  // 複数弾の一括描画
  drawEnemyBullets(bullets: EnemyBullet[]): void {
    bullets.forEach(bullet => this.drawEnemyBullet(bullet))
  }
}