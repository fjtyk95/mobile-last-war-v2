// Mobile Last War v2 - Enemy Movement Pattern Handler

import { EnemyState, MovePatternType } from '../types/enemy.types'

export class MovePatternHandler {
  updatePosition(
    enemy: EnemyState,
    deltaTime: number,
    currentTime: number,
    canvasWidth: number,
    canvasHeight: number
  ): { x: number; y: number } {
    const { type, parameters } = enemy.movePattern
    const timeSinceStart = currentTime - enemy.moveStartTime
    const baseSpeed = parameters.speed || 2.0

    switch (type) {
      case MovePatternType.LINEAR:
        return this.linearMovement(enemy, deltaTime, baseSpeed)

      case MovePatternType.ZIGZAG:
        return this.zigzagMovement(enemy, deltaTime, timeSinceStart, baseSpeed, canvasWidth, parameters)

      case MovePatternType.SINE_WAVE:
        return this.sineWaveMovement(enemy, deltaTime, timeSinceStart, baseSpeed, canvasWidth, parameters)

      case MovePatternType.CIRCULAR:
        return this.circularMovement(enemy, deltaTime, timeSinceStart, baseSpeed, canvasWidth, parameters)

      case MovePatternType.CHASE:
        return this.chaseMovement(enemy, deltaTime, baseSpeed, canvasWidth, canvasHeight)

      default:
        return this.linearMovement(enemy, deltaTime, baseSpeed)
    }
  }

  // 直線移動
  private linearMovement(
    enemy: EnemyState,
    deltaTime: number,
    speed: number
  ): { x: number; y: number } {
    return {
      x: enemy.position.x,
      y: enemy.position.y + speed
    }
  }

  // ジグザグ移動
  private zigzagMovement(
    enemy: EnemyState,
    deltaTime: number,
    timeSinceStart: number,
    speed: number,
    canvasWidth: number,
    parameters: any
  ): { x: number; y: number } {
    const amplitude = parameters.amplitude || 80
    const frequency = parameters.frequency || 0.003
    
    // ジグザグパターン（三角波）
    const zigzagPhase = (timeSinceStart * frequency) % 1
    let horizontalOffset: number
    
    if (zigzagPhase < 0.5) {
      // 左から右へ
      horizontalOffset = (zigzagPhase * 2) * amplitude - amplitude / 2
    } else {
      // 右から左へ
      horizontalOffset = ((1 - zigzagPhase) * 2) * amplitude - amplitude / 2
    }
    
    const baseX = enemy.position.x + horizontalOffset * (deltaTime * 0.001)
    const newX = Math.max(0, Math.min(canvasWidth - enemy.stats.width, baseX))
    
    return {
      x: newX,
      y: enemy.position.y + speed
    }
  }

  // サイン波移動
  private sineWaveMovement(
    enemy: EnemyState,
    deltaTime: number,
    timeSinceStart: number,
    speed: number,
    canvasWidth: number,
    parameters: any
  ): { x: number; y: number } {
    const amplitude = parameters.amplitude || 120
    const frequency = parameters.frequency || 0.002
    const phase = parameters.phase || 0
    
    // 初期X位置からの相対位置計算
    const initialX = enemy.position.x
    const centerX = canvasWidth / 2
    
    const sineValue = Math.sin(timeSinceStart * frequency + phase)
    const newX = centerX + sineValue * amplitude
    
    const constrainedX = Math.max(0, Math.min(canvasWidth - enemy.stats.width, newX))
    
    return {
      x: constrainedX,
      y: enemy.position.y + speed
    }
  }

  // 円運動
  private circularMovement(
    enemy: EnemyState,
    deltaTime: number,
    timeSinceStart: number,
    speed: number,
    canvasWidth: number,
    parameters: any
  ): { x: number; y: number } {
    const radius = parameters.radius || 60
    const centerX = parameters.centerX || canvasWidth / 2
    const angularSpeed = parameters.frequency || 0.003
    
    const angle = timeSinceStart * angularSpeed
    const newX = centerX + Math.cos(angle) * radius
    const constrainedX = Math.max(0, Math.min(canvasWidth - enemy.stats.width, newX))
    
    return {
      x: constrainedX,
      y: enemy.position.y + speed * 0.7 // 円運動は下降速度を少し遅く
    }
  }

  // プレイヤー追跡移動（Phase 3では簡単な実装）
  private chaseMovement(
    enemy: EnemyState,
    deltaTime: number,
    speed: number,
    canvasWidth: number,
    canvasHeight: number
  ): { x: number; y: number } {
    // プレイヤーは画面下部中央付近にいると仮定
    const playerX = canvasWidth / 2
    const playerY = canvasHeight * 0.8
    
    // 敵からプレイヤーへの方向ベクトル
    const dx = playerX - enemy.position.x
    const dy = playerY - enemy.position.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance === 0) {
      return enemy.position
    }
    
    // 正規化された方向ベクトル
    const normalizedDx = dx / distance
    const normalizedDy = dy / distance
    
    // 追跡移動（速度を制限）
    const chaseSpeed = speed * 0.8
    const newX = enemy.position.x + normalizedDx * chaseSpeed
    const newY = enemy.position.y + normalizedDy * chaseSpeed
    
    const constrainedX = Math.max(0, Math.min(canvasWidth - enemy.stats.width, newX))
    
    return {
      x: constrainedX,
      y: Math.max(enemy.position.y, newY) // 常に下向きまたは横移動
    }
  }
}