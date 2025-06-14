// 拡張ゲーム統計の型定義

export interface GameStats {
  // 基本スコア情報
  highScore: number
  currentScore: number
  
  // プレイ統計
  totalGamesPlayed: number
  totalEnemiesKilled: number
  totalPowerUpsCollected: number
  totalPlayTime: number // 秒単位
  
  // 生存記録
  bestSurvivalTime: number // 秒単位
  averageSurvivalTime: number
  
  // レベル・難易度統計
  highestLevelReached: number
  averageLevel: number
  
  // 効率性指標
  averageScorePerMinute: number
  killDeathRatio: number // 撃破数/死亡数
  powerUpEfficiency: number // 良いパワーアップ取得率
  
  // セッション統計
  currentSessionStats: SessionStats
  
  // 達成記録
  achievements: Achievement[]
  
  // 最新の更新日時
  lastUpdated: string
}

export interface SessionStats {
  startTime: number
  endTime?: number
  score: number
  enemiesKilled: number
  powerUpsCollected: number
  levelReached: number
  survivalTime: number
  gameStatus: 'playing' | 'completed' | 'game_over'
}

export interface Achievement {
  id: string
  name: string
  description: string
  unlockedAt: string
  category: 'survival' | 'score' | 'kills' | 'efficiency' | 'special'
}

// 統計計算のユーティリティ型
export interface DerivedStats {
  gamesPerDay: number
  improvementRate: number // 最近10ゲームの平均 vs 全体平均
  consistencyScore: number // スコアの安定性指標
  favoritePlayTime: string // 最もプレイが多い時間帯
}

// Redux状態の型
export interface GameStatsState {
  stats: GameStats
  isLoading: boolean
  lastSaved: string | null
}