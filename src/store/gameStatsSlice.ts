import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { GameStats, SessionStats, GameStatsState, Achievement } from '../types/gameStats.types'

// 初期状態
const initialGameStats: GameStats = {
  highScore: 0,
  currentScore: 0,
  totalGamesPlayed: 0,
  totalEnemiesKilled: 0,
  totalPowerUpsCollected: 0,
  totalPlayTime: 0,
  bestSurvivalTime: 0,
  averageSurvivalTime: 0,
  highestLevelReached: 1,
  averageLevel: 1,
  averageScorePerMinute: 0,
  killDeathRatio: 0,
  powerUpEfficiency: 0,
  currentSessionStats: {
    startTime: 0,
    score: 0,
    enemiesKilled: 0,
    powerUpsCollected: 0,
    levelReached: 1,
    survivalTime: 0,
    gameStatus: 'playing'
  },
  achievements: [],
  lastUpdated: new Date().toISOString()
}

const initialState: GameStatsState = {
  stats: initialGameStats,
  isLoading: false,
  lastSaved: null
}

// ゲーム統計スライス
const gameStatsSlice = createSlice({
  name: 'gameStats',
  initialState,
  reducers: {
    // セッション開始
    startSession: (state) => {
      state.stats.currentSessionStats = {
        startTime: Date.now(),
        score: 0,
        enemiesKilled: 0,
        powerUpsCollected: 0,
        levelReached: 1,
        survivalTime: 0,
        gameStatus: 'playing'
      }
      state.stats.lastUpdated = new Date().toISOString()
    },

    // セッション終了
    endSession: (state, action: PayloadAction<{ reason: 'completed' | 'game_over' }>) => {
      const session = state.stats.currentSessionStats
      session.endTime = Date.now()
      session.gameStatus = action.payload.reason
      session.survivalTime = Math.floor((session.endTime - session.startTime) / 1000)

      // 全体統計を更新
      state.stats.totalGamesPlayed += 1
      state.stats.totalEnemiesKilled += session.enemiesKilled
      state.stats.totalPowerUpsCollected += session.powerUpsCollected
      state.stats.totalPlayTime += session.survivalTime

      // ハイスコア更新
      if (session.score > state.stats.highScore) {
        state.stats.highScore = session.score
      }

      // 最高生存時間更新
      if (session.survivalTime > state.stats.bestSurvivalTime) {
        state.stats.bestSurvivalTime = session.survivalTime
      }

      // 最高レベル更新
      if (session.levelReached > state.stats.highestLevelReached) {
        state.stats.highestLevelReached = session.levelReached
      }

      // 平均値計算
      const totalGames = state.stats.totalGamesPlayed
      state.stats.averageSurvivalTime = state.stats.totalPlayTime / totalGames
      state.stats.killDeathRatio = state.stats.totalEnemiesKilled / totalGames
      state.stats.averageScorePerMinute = state.stats.totalPlayTime > 0 
        ? (state.stats.highScore / (state.stats.totalPlayTime / 60)) 
        : 0

      state.stats.lastUpdated = new Date().toISOString()
    },

    // セッション中のスコア更新
    updateSessionScore: (state, action: PayloadAction<number>) => {
      state.stats.currentSessionStats.score = action.payload
      state.stats.currentScore = action.payload
    },

    // セッション中の撃破数更新
    updateSessionKills: (state, action: PayloadAction<number>) => {
      state.stats.currentSessionStats.enemiesKilled = action.payload
    },

    // セッション中のパワーアップ取得数更新
    updateSessionPowerUps: (state, action: PayloadAction<number>) => {
      state.stats.currentSessionStats.powerUpsCollected = action.payload
    },

    // セッション中のレベル更新
    updateSessionLevel: (state, action: PayloadAction<number>) => {
      state.stats.currentSessionStats.levelReached = action.payload
    },

    // 実績解除
    unlockAchievement: (state, action: PayloadAction<Achievement>) => {
      const existingAchievement = state.stats.achievements.find(a => a.id === action.payload.id)
      if (!existingAchievement) {
        state.stats.achievements.push(action.payload)
        state.stats.lastUpdated = new Date().toISOString()
      }
    },

    // 統計リセット（デバッグ用）
    resetStats: (state) => {
      state.stats = { ...initialGameStats, lastUpdated: new Date().toISOString() }
    },

    // ローカルストレージから統計を復元
    loadStats: (state, action: PayloadAction<GameStats>) => {
      state.stats = action.payload
    },

    // 保存状態の更新
    setSaved: (state, action: PayloadAction<string>) => {
      state.lastSaved = action.payload
    }
  }
})

export const {
  startSession,
  endSession,
  updateSessionScore,
  updateSessionKills,
  updateSessionPowerUps,
  updateSessionLevel,
  unlockAchievement,
  resetStats,
  loadStats,
  setSaved
} = gameStatsSlice.actions

export default gameStatsSlice.reducer