import { useSelector, useDispatch } from 'react-redux'
import { useCallback, useEffect } from 'react'
import { RootState, AppDispatch } from '../store'
import { 
  startSession, 
  endSession, 
  updateSessionScore, 
  updateSessionKills, 
  updateSessionPowerUps, 
  updateSessionLevel,
  unlockAchievement
} from '../store/gameStatsSlice'
import { GameStats, Achievement } from '../types/gameStats.types'

export const useGameStats = () => {
  const dispatch = useDispatch<AppDispatch>()
  const gameStats = useSelector((state: RootState) => state.gameStats)

  // セッション開始
  const startGameSession = useCallback(() => {
    dispatch(startSession())
  }, [dispatch])

  // セッション終了
  const endGameSession = useCallback((reason: 'completed' | 'game_over') => {
    dispatch(endSession({ reason }))
  }, [dispatch])

  // スコア更新
  const updateScore = useCallback((score: number) => {
    dispatch(updateSessionScore(score))
  }, [dispatch])

  // 撃破数更新
  const updateKills = useCallback((kills: number) => {
    dispatch(updateSessionKills(kills))
  }, [dispatch])

  // パワーアップ取得数更新
  const updatePowerUps = useCallback((powerUps: number) => {
    dispatch(updateSessionPowerUps(powerUps))
  }, [dispatch])

  // レベル更新
  const updateLevel = useCallback((level: number) => {
    dispatch(updateSessionLevel(level))
  }, [dispatch])

  // 実績チェック・解除
  const checkAndUnlockAchievements = useCallback((stats: GameStats) => {
    const achievements: Achievement[] = []

    // スコア関連実績
    if (stats.currentScore >= 10000 && !stats.achievements.find(a => a.id === 'score_10k')) {
      achievements.push({
        id: 'score_10k',
        name: '初心者撃破王',
        description: '10,000点達成',
        unlockedAt: new Date().toISOString(),
        category: 'score'
      })
    }

    if (stats.currentScore >= 50000 && !stats.achievements.find(a => a.id === 'score_50k')) {
      achievements.push({
        id: 'score_50k',
        name: '中級撃破王',
        description: '50,000点達成',
        unlockedAt: new Date().toISOString(),
        category: 'score'
      })
    }

    if (stats.currentScore >= 100000 && !stats.achievements.find(a => a.id === 'score_100k')) {
      achievements.push({
        id: 'score_100k',
        name: '上級撃破王',
        description: '100,000点達成',
        unlockedAt: new Date().toISOString(),
        category: 'score'
      })
    }

    // 生存時間実績
    if (stats.currentSessionStats.survivalTime >= 60 && !stats.achievements.find(a => a.id === 'survive_1min')) {
      achievements.push({
        id: 'survive_1min',
        name: '生存者',
        description: '1分間生存',
        unlockedAt: new Date().toISOString(),
        category: 'survival'
      })
    }

    if (stats.currentSessionStats.survivalTime >= 300 && !stats.achievements.find(a => a.id === 'survive_5min')) {
      achievements.push({
        id: 'survive_5min',
        name: '猛者',
        description: '5分間生存',
        unlockedAt: new Date().toISOString(),
        category: 'survival'
      })
    }

    // レベル実績
    if (stats.currentSessionStats.levelReached >= 10 && !stats.achievements.find(a => a.id === 'level_10')) {
      achievements.push({
        id: 'level_10',
        name: 'ベテランパイロット',
        description: 'レベル10到達',
        unlockedAt: new Date().toISOString(),
        category: 'efficiency'
      })
    }

    // 撃破数実績
    if (stats.totalEnemiesKilled >= 100 && !stats.achievements.find(a => a.id === 'kills_100')) {
      achievements.push({
        id: 'kills_100',
        name: 'エース・パイロット',
        description: '累計100体撃破',
        unlockedAt: new Date().toISOString(),
        category: 'kills'
      })
    }

    if (stats.totalEnemiesKilled >= 1000 && !stats.achievements.find(a => a.id === 'kills_1000')) {
      achievements.push({
        id: 'kills_1000',
        name: '伝説のエース',
        description: '累計1,000体撃破',
        unlockedAt: new Date().toISOString(),
        category: 'kills'
      })
    }

    // プレイ回数実績
    if (stats.totalGamesPlayed >= 10 && !stats.achievements.find(a => a.id === 'games_10')) {
      achievements.push({
        id: 'games_10',
        name: '常連プレイヤー',
        description: '10回プレイ',
        unlockedAt: new Date().toISOString(),
        category: 'special'
      })
    }

    // 実績を解除
    achievements.forEach(achievement => {
      dispatch(unlockAchievement(achievement))
    })

    return achievements
  }, [dispatch])

  // 統計の計算用メソッド
  const getPlayTimeFormatted = useCallback((seconds: number): string => {
    if (seconds < 60) return `${seconds}秒`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分${seconds % 60}秒`
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}時間${minutes}分`
  }, [])

  const getEfficiencyRating = useCallback((stats: GameStats): string => {
    const scorePerMinute = stats.averageScorePerMinute
    if (scorePerMinute >= 5000) return 'S'
    if (scorePerMinute >= 3000) return 'A'
    if (scorePerMinute >= 2000) return 'B'
    if (scorePerMinute >= 1000) return 'C'
    return 'D'
  }, [])

  return {
    gameStats: gameStats.stats,
    isLoading: gameStats.isLoading,
    lastSaved: gameStats.lastSaved,
    startGameSession,
    endGameSession,
    updateScore,
    updateKills,
    updatePowerUps,
    updateLevel,
    checkAndUnlockAchievements,
    getPlayTimeFormatted,
    getEfficiencyRating
  }
}