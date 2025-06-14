// Mobile Last War v2 - Enemy Types

export enum EnemyType {
  BASIC = 'basic',     // 直線移動
  FAST = 'fast',       // ジグザグ移動
  TANK = 'tank',       // 高耐久・低速
  BOSS = 'boss'        // 複雑攻撃パターン
}

export enum MovePatternType {
  LINEAR = 'linear',       // 直線移動
  ZIGZAG = 'zigzag',      // ジグザグ移動
  SINE_WAVE = 'sine_wave', // サイン波移動
  CIRCULAR = 'circular',   // 円運動
  CHASE = 'chase'          // プレイヤー追跡
}

export interface MovePattern {
  type: MovePatternType
  parameters: {
    amplitude?: number      // 振幅
    frequency?: number      // 周波数
    phase?: number         // 位相
    radius?: number        // 半径
    centerX?: number       // 中心X座標
    speed?: number         // 移動速度
  }
}

export interface AttackPattern {
  enabled: boolean
  fireRate: number        // 射撃間隔(ms)
  bulletSpeed: number     // 弾速
  bulletCount: number     // 同時発射数
  spread: number          // 弾の拡散角度
  lastFired: number       // 最後の発射時間
}

export interface EnemyStats {
  health: number
  maxHealth: number
  speed: number
  width: number
  height: number
  score: number           // 撃破時スコア
  powerUpDropRate: number // パワーアップドロップ率
}

export interface EnemyState {
  id: string
  type: EnemyType
  position: { x: number; y: number }
  stats: EnemyStats
  movePattern: MovePattern
  attackPattern: AttackPattern
  
  // 移動状態
  moveStartTime: number
  movePhase: number
  
  // 描画状態
  color: string
  isFlashing: boolean
  flashEndTime: number
}

export interface EnemyBullet {
  id: string
  x: number
  y: number
  width: number
  height: number
  speed: number
  direction: { x: number; y: number } // 正規化された方向ベクトル
  color: string
}

// 敵タイプ別設定
export const ENEMY_CONFIGS: Record<EnemyType, {
  stats: Omit<EnemyStats, 'health' | 'maxHealth'>
  movePattern: Omit<MovePattern, 'parameters'> & { baseParameters: MovePattern['parameters'] }
  attackPattern: Omit<AttackPattern, 'lastFired'>
  color: string
  spawnWeight: number // 出現重み
}> = {
  [EnemyType.BASIC]: {
    stats: {
      speed: 2.0,
      width: 40,
      height: 40,
      score: 100,
      powerUpDropRate: 0.3
    },
    movePattern: {
      type: MovePatternType.LINEAR,
      baseParameters: { speed: 2.0 }
    },
    attackPattern: {
      enabled: false,
      fireRate: 0,
      bulletSpeed: 0,
      bulletCount: 0,
      spread: 0
    },
    color: '#ff3333',
    spawnWeight: 10
  },
  
  [EnemyType.FAST]: {
    stats: {
      speed: 3.0,
      width: 35,
      height: 35,
      score: 150,
      powerUpDropRate: 0.25
    },
    movePattern: {
      type: MovePatternType.ZIGZAG,
      baseParameters: { 
        speed: 3.0, 
        amplitude: 80, 
        frequency: 0.003 
      }
    },
    attackPattern: {
      enabled: false,
      fireRate: 0,
      bulletSpeed: 0,
      bulletCount: 0,
      spread: 0
    },
    color: '#ff6b35',
    spawnWeight: 6
  },
  
  [EnemyType.TANK]: {
    stats: {
      speed: 1.2,
      width: 50,
      height: 50,
      score: 300,
      powerUpDropRate: 0.5
    },
    movePattern: {
      type: MovePatternType.LINEAR,
      baseParameters: { speed: 1.2 }
    },
    attackPattern: {
      enabled: true,
      fireRate: 2000, // 2秒間隔
      bulletSpeed: 4,
      bulletCount: 1,
      spread: 0
    },
    color: '#8e44ad',
    spawnWeight: 3
  },
  
  [EnemyType.BOSS]: {
    stats: {
      speed: 1.5,
      width: 80,
      height: 80,
      score: 1000,
      powerUpDropRate: 0.8
    },
    movePattern: {
      type: MovePatternType.SINE_WAVE,
      baseParameters: { 
        speed: 1.5, 
        amplitude: 120, 
        frequency: 0.002 
      }
    },
    attackPattern: {
      enabled: true,
      fireRate: 1500, // 1.5秒間隔
      bulletSpeed: 5,
      bulletCount: 3,
      spread: 30 // 30度拡散
    },
    color: '#e74c3c',
    spawnWeight: 1
  }
}