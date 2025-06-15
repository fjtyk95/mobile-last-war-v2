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

  // 敵システム（1秒に1体から開始）
  ENEMY: {
    WIDTH: 40,
    HEIGHT: 40,
    DAMAGE_TO_PLAYER: 20,
    BASE_SPAWN_INTERVAL: 1000, // 1秒（1秒に1体程度）
    MIN_SPAWN_INTERVAL: 300,   // 0.3秒（最小値）
    BASE_SPEED: 0.8,           // 非常にゆっくり開始
    MAX_SPEED: 2.5,            // 最大速度
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

  // 撃破レベル難易度（時間ベース優先のため抑制）
  DIFFICULTY: {
    // レベル1-5: 非常に緩やか
    LEVEL_1_5: {
      SPAWN_REDUCTION_PER_LEVEL: 50, // ms（抑制）
      SPEED_INCREASE_PER_LEVEL: 0.05, // 非常に緩やか
    },
    // レベル6-10: 緩やか
    LEVEL_6_10: {
      SPAWN_REDUCTION_PER_LEVEL: 30, // ms（抑制）
      SPEED_INCREASE_PER_LEVEL: 0.05, // 非常に緩やか
    },
  },

  // ターゲット生存時間（バランス指標）
  TARGET_SURVIVAL: {
    BEGINNER: 30, // 30秒
    INTERMEDIATE: 120, // 2分
    ADVANCED: 300, // 5分
  },

  // 時間ベース難易度調整（段階的リセット方式）
  TIME_DIFFICULTY: {
    INTERVAL_SECONDS: 15, // 15秒ごとに難易度調整
    SPAWN_REDUCTION_PER_INTERVAL: 50, // 50ms削減（緩やかな変化）
    SPEED_INCREASE_PER_INTERVAL: 0.1, // 0.1倍増加（10%ずつ）
    MAX_TIME_LEVEL: 20, // 最大時間レベル（5分で最高難易度）
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

// 段階的リセット方式：時間ベース難易度計算（案1）
export const getFinalDifficultyParams = (killLevel: number, survivalTimeSeconds: number) => {
  // 時間レベルを計算（15秒ごとに1レベル）
  const timeLevel = Math.min(
    Math.floor(survivalTimeSeconds / GAME_BALANCE.TIME_DIFFICULTY.INTERVAL_SECONDS),
    GAME_BALANCE.TIME_DIFFICULTY.MAX_TIME_LEVEL
  )
  
  // 明確な計算式：基本値から時間レベル分だけ調整
  const spawnInterval = Math.max(
    GAME_BALANCE.ENEMY.MIN_SPAWN_INTERVAL,
    GAME_BALANCE.ENEMY.BASE_SPAWN_INTERVAL - (timeLevel * GAME_BALANCE.TIME_DIFFICULTY.SPAWN_REDUCTION_PER_INTERVAL)
  )
  
  const enemySpeed = Math.min(
    GAME_BALANCE.ENEMY.MAX_SPEED,
    GAME_BALANCE.ENEMY.BASE_SPEED + (timeLevel * GAME_BALANCE.TIME_DIFFICULTY.SPEED_INCREASE_PER_INTERVAL)
  )
  
  // 撃破レベルの影響を完全に無効化（時間ベースのみ）
  const killDifficulty = getDifficultyParams(killLevel)
  
  return {
    spawnInterval: spawnInterval, // 時間ベースのみ
    enemySpeed: enemySpeed, // 時間ベースのみ
    scoreMultiplier: killDifficulty.scoreMultiplier,
    timeLevel: timeLevel,
    killLevel: killLevel
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