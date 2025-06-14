import { getDifficultyParams, GAME_BALANCE } from '../constants/gameBalance'

export class DifficultyCalculator {
  private currentLevel: number = 1
  private enemiesKilled: number = 0

  constructor() {
    this.reset()
  }

  public updateEnemiesKilled(count: number): void {
    this.enemiesKilled = count
    this.currentLevel = Math.floor(this.enemiesKilled / GAME_BALANCE.LEVEL.ENEMIES_PER_LEVEL) + 1
  }

  public getCurrentLevel(): number {
    return this.currentLevel
  }

  public getEnemiesKilled(): number {
    return this.enemiesKilled
  }

  public getCurrentDifficulty() {
    return getDifficultyParams(this.currentLevel)
  }

  public getEnemiesUntilNextLevel(): number {
    const nextLevelThreshold = this.currentLevel * GAME_BALANCE.LEVEL.ENEMIES_PER_LEVEL
    return nextLevelThreshold - this.enemiesKilled
  }

  public getProgressToNextLevel(): number {
    const currentLevelStart = (this.currentLevel - 1) * GAME_BALANCE.LEVEL.ENEMIES_PER_LEVEL
    const nextLevelStart = this.currentLevel * GAME_BALANCE.LEVEL.ENEMIES_PER_LEVEL
    const progress = (this.enemiesKilled - currentLevelStart) / (nextLevelStart - currentLevelStart)
    return Math.min(1, Math.max(0, progress))
  }

  public getDifficultyDescription(): string {
    if (this.currentLevel <= 3) return '初級'
    if (this.currentLevel <= 6) return '中級'
    if (this.currentLevel <= 10) return '上級'
    return '最高'
  }

  public getDifficultyColor(): string {
    if (this.currentLevel <= 3) return '#4ade80' // 緑
    if (this.currentLevel <= 6) return '#fbbf24' // 黄
    if (this.currentLevel <= 10) return '#f97316' // オレンジ
    return '#ef4444' // 赤
  }

  public getSpawnIntervalMs(): number {
    return this.getCurrentDifficulty().spawnInterval
  }

  public getEnemySpeed(): number {
    return this.getCurrentDifficulty().enemySpeed
  }

  public getScoreMultiplier(): number {
    return this.getCurrentDifficulty().scoreMultiplier
  }

  public isMaxDifficulty(): boolean {
    return this.currentLevel >= GAME_BALANCE.LEVEL.SCORE_MULTIPLIER_THRESHOLD
  }

  public getEstimatedSurvivalTime(): string {
    // 難易度に基づく推定生存時間
    if (this.currentLevel <= 3) return '1-2分'
    if (this.currentLevel <= 6) return '30秒-1分'
    if (this.currentLevel <= 10) return '10-30秒'
    return '10秒以下'
  }

  public reset(): void {
    this.currentLevel = 1
    this.enemiesKilled = 0
  }

  // デバッグ用の詳細情報
  public getDebugInfo() {
    const difficulty = this.getCurrentDifficulty()
    return {
      level: this.currentLevel,
      enemiesKilled: this.enemiesKilled,
      enemiesUntilNext: this.getEnemiesUntilNextLevel(),
      progress: this.getProgressToNextLevel(),
      spawnInterval: difficulty.spawnInterval,
      enemySpeed: difficulty.enemySpeed,
      scoreMultiplier: difficulty.scoreMultiplier,
      description: this.getDifficultyDescription(),
      isMaxDifficulty: this.isMaxDifficulty(),
    }
  }
}