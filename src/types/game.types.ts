// Mobile Last War v2 - Game Types

export interface Position {
  x: number
  y: number
}

export interface PlayerState {
  health: number
  maxHealth: number
  position: Position
  power: number
  weapons: WeaponType[]
  width: number
  height: number
  invulnerable: boolean
  invulnerableTime: number
}

export interface Enemy {
  x: number
  y: number
  width: number
  height: number
  speed: number
  health?: number
  type?: EnemyType
}

export interface Bullet {
  x: number
  y: number
  width: number
  height: number
  speed: number
}

export interface PowerUp {
  id: string
  type: PowerUpType
  position: Position
  width: number
  height: number
  value: number
}

export enum GameStatus {
  MENU = 'menu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'gameOver'
}

export enum PowerUpType {
  DAMAGE_UP = 'damage_up',
  MULTI_SHOT = 'multi_shot',
  HEALTH = 'health',
  SHIELD = 'shield',
  DAMAGE_DOWN = 'damage_down'
}

export enum WeaponType {
  BASIC = 'basic',
  SPREAD = 'spread',
  LASER = 'laser'
}

export enum EnemyType {
  BASIC = 'basic',
  FAST = 'fast',
  TANK = 'tank',
  BOSS = 'boss'
}

export interface PowerUpEffect {
  type: PowerUpType
  value: number
  duration?: number
}

export interface GameStats {
  finalScore: number
  highScore: number
  enemiesKilled: number
  survivalTime: number
  powerUpsCollected: number
}

export interface GameState {
  status: GameStatus
  score: number
  level: number
  timeElapsed: number
  isPaused: boolean
  enemiesKilled: number
  powerUpsCollected: number
}