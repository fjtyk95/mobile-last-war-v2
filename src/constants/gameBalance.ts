// Mobile Last War v2 - Game Balance Constants

export const GAME_BALANCE = {
  // プレイヤー設定
  PLAYER: {
    INITIAL_HEALTH: 100,
    INITIAL_POWER: 10,
    AREA_RATIO: 0.2, // 画面下部20%エリア
    WIDTH: 40,
    HEIGHT: 40,
    INVULNERABLE_TIME: 1000, // 1秒
  },

  // 射撃システム
  WEAPON: {
    BASE_FIRE_INTERVAL: 200, // 基本200ms
    MIN_FIRE_INTERVAL: 100,  // 最小100ms
    POWER_REDUCTION_RATE: 10, // 攻撃力1につき10ms短縮
    BULLET_SPEED: 8,
    BULLET_WIDTH: 4,
    BULLET_HEIGHT: 10,
  },

  // 敵システム
  ENEMY: {
    WIDTH: 40,
    HEIGHT: 40,
    DAMAGE_TO_PLAYER: 20,
    BASE_SPAWN_INTERVAL: 1200, // 1.2秒（スマホ向け速く）
    MIN_SPAWN_INTERVAL: 500,   // 0.5秒（より速く）
    BASE_SPEED: 2.0,           // 基本速度アップ
    MAX_SPEED: 4.0,            // 最大速度アップ
    GAME_OVER_ZONE_RATIO: 0.8, // 画面下部80%（プレイヤーエリア）に到達でゲームオーバー
  },

  // レベルシステム
  LEVEL: {
    ENEMIES_PER_LEVEL: 8, // 8体撃破でレベルアップ（スマホ向け調整）
    MAX_LEVEL_FOR_SCALING: 10, // レベル10まで難易度上昇
    SCORE_MULTIPLIER_THRESHOLD: 11, // レベル11以降スコア1.5倍
  },

  // パワーアップシステム
  POWERUP: {
    SPAWN_CHANCE: 0.3, // 30%の確率
    WIDTH: 25,
    HEIGHT: 25,
    FALL_SPEED: 50, // ピクセル/秒
    DAMAGE_UP_VALUE: 3, // +3攻撃力（Phase 2から調整）
    DAMAGE_DOWN_VALUE: -3, // -3攻撃力ペナルティ
    HEALTH_RESTORE_VALUE: 25, // +25HP回復
  },

  // スコアシステム
  SCORE: {
    ENEMY_KILL: 100,
    POWERUP_COLLECT: 50,
    SURVIVAL_PER_SECOND: 1,
    HIGH_LEVEL_MULTIPLIER: 1.5, // レベル11以降
  },

  // 難易度カーブ（スマホ向け調整）
  DIFFICULTY: {
    // レベル1-5: より急激な増加
    LEVEL_1_5: {
      SPAWN_REDUCTION_PER_LEVEL: 120, // ms（より速く）
      SPEED_INCREASE_PER_LEVEL: 0.3,  // より速度アップ
    },
    // レベル6-10: 非常に急激な増加
    LEVEL_6_10: {
      SPAWN_REDUCTION_PER_LEVEL: 80, // ms（より速く）
      SPEED_INCREASE_PER_LEVEL: 0.3, // より速度アップ
    },
  },

  // ターゲット生存時間（バランス指標）
  TARGET_SURVIVAL: {
    BEGINNER: 30, // 30秒
    INTERMEDIATE: 120, // 2分
    ADVANCED: 300, // 5分
  },

  // 時間ベース難易度調整（緩やかな上昇）
  TIME_DIFFICULTY: {
    INTERVAL_SECONDS: 15, // 15秒ごとに難易度調整
    SPAWN_REDUCTION_PER_INTERVAL: 30, // ms削減（緩やか）
    SPEED_INCREASE_PER_INTERVAL: 0.1, // 速度増加（約10%ずつ）
    MAX_TIME_LEVEL: 20, // 最大時間レベル（5分）
  },
} as const

// 難易度計算関数
export const getDifficultyParams = (level: number) => {
  if (level <= 5) {
    return {
      spawnInterval: Math.max(
        GAME_BALANCE.ENEMY.MIN_SPAWN_INTERVAL,
        GAME_BALANCE.ENEMY.BASE_SPAWN_INTERVAL - (level - 1) * GAME_BALANCE.DIFFICULTY.LEVEL_1_5.SPAWN_REDUCTION_PER_LEVEL
      ),
      enemySpeed: GAME_BALANCE.ENEMY.BASE_SPEED + (level - 1) * GAME_BALANCE.DIFFICULTY.LEVEL_1_5.SPEED_INCREASE_PER_LEVEL,
      scoreMultiplier: 1,
    }
  } else if (level <= GAME_BALANCE.LEVEL.MAX_LEVEL_FOR_SCALING) {
    const baseSpawnAtLevel6 = GAME_BALANCE.ENEMY.BASE_SPAWN_INTERVAL - 4 * GAME_BALANCE.DIFFICULTY.LEVEL_1_5.SPAWN_REDUCTION_PER_LEVEL
    const baseSpeedAtLevel6 = GAME_BALANCE.ENEMY.BASE_SPEED + 4 * GAME_BALANCE.DIFFICULTY.LEVEL_1_5.SPEED_INCREASE_PER_LEVEL
    
    return {
      spawnInterval: Math.max(
        GAME_BALANCE.ENEMY.MIN_SPAWN_INTERVAL,
        baseSpawnAtLevel6 - (level - 5) * GAME_BALANCE.DIFFICULTY.LEVEL_6_10.SPAWN_REDUCTION_PER_LEVEL
      ),
      enemySpeed: Math.min(
        GAME_BALANCE.ENEMY.MAX_SPEED,
        baseSpeedAtLevel6 + (level - 5) * GAME_BALANCE.DIFFICULTY.LEVEL_6_10.SPEED_INCREASE_PER_LEVEL
      ),
      scoreMultiplier: 1,
    }
  } else {
    // レベル11以降は最高難易度固定
    return {
      spawnInterval: GAME_BALANCE.ENEMY.MIN_SPAWN_INTERVAL,
      enemySpeed: GAME_BALANCE.ENEMY.MAX_SPEED,
      scoreMultiplier: GAME_BALANCE.SCORE.HIGH_LEVEL_MULTIPLIER,
    }
  }
}

// 時間ベース難易度計算関数（永続ゲーム防止）
export const getTimeDifficultyParams = (survivalTimeSeconds: number) => {
  const timeLevel = Math.min(
    Math.floor(survivalTimeSeconds / GAME_BALANCE.TIME_DIFFICULTY.INTERVAL_SECONDS),
    GAME_BALANCE.TIME_DIFFICULTY.MAX_TIME_LEVEL
  )
  
  return {
    spawnReduction: timeLevel * GAME_BALANCE.TIME_DIFFICULTY.SPAWN_REDUCTION_PER_INTERVAL,
    speedIncrease: timeLevel * GAME_BALANCE.TIME_DIFFICULTY.SPEED_INCREASE_PER_INTERVAL,
    timeLevel
  }
}

// 撃破数レベル + 時間レベルを統合した最終難易度計算
export const getFinalDifficultyParams = (killLevel: number, survivalTimeSeconds: number) => {
  const baseDifficulty = getDifficultyParams(killLevel)
  const timeDifficulty = getTimeDifficultyParams(survivalTimeSeconds)
  
  return {
    spawnInterval: Math.max(
      GAME_BALANCE.ENEMY.MIN_SPAWN_INTERVAL,
      baseDifficulty.spawnInterval - timeDifficulty.spawnReduction
    ),
    enemySpeed: Math.min(
      GAME_BALANCE.ENEMY.MAX_SPEED,
      baseDifficulty.enemySpeed + timeDifficulty.speedIncrease
    ),
    scoreMultiplier: baseDifficulty.scoreMultiplier,
    timeLevel: timeDifficulty.timeLevel
  }
}

// 連射間隔計算関数
export const getFireInterval = (power: number): number => {
  const reduction = (power - GAME_BALANCE.PLAYER.INITIAL_POWER) * GAME_BALANCE.WEAPON.POWER_REDUCTION_RATE
  return Math.max(
    GAME_BALANCE.WEAPON.MIN_FIRE_INTERVAL,
    GAME_BALANCE.WEAPON.BASE_FIRE_INTERVAL - reduction
  )
}