import { useState, useCallback, useEffect } from 'react'
import { GameStatus, GameState, GameStats } from '../types/game.types'
import { GAME_BALANCE } from '../constants/gameBalance'
import { DifficultyCalculator } from '../utils/difficultyCalculator'

export const useGameState = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.MENU)
  const [score, setScore] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [powerUpsCollected, setPowerUpsCollected] = useState(0)
  const [highScore, setHighScore] = useState(0)
  
  // 難易度計算器
  const [difficultyCalculator] = useState(() => new DifficultyCalculator())

  // ハイスコアをlocalStorageから読み込み
  useEffect(() => {
    const savedHighScore = localStorage.getItem('mobile-last-war-high-score')
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10))
    }
  }, [])

  const startGame = useCallback(() => {
    setStatus(GameStatus.PLAYING)
    setScore(0)
    setTimeElapsed(0)
    setPowerUpsCollected(0)
    difficultyCalculator.reset()
  }, [difficultyCalculator])

  const pauseGame = useCallback(() => {
    if (status === GameStatus.PLAYING) {
      setStatus(GameStatus.PAUSED)
    } else if (status === GameStatus.PAUSED) {
      setStatus(GameStatus.PLAYING)
    }
  }, [status])

  const resumeGame = useCallback(() => {
    setStatus(GameStatus.PLAYING)
  }, [])

  const gameOver = useCallback(() => {
    setStatus(GameStatus.GAME_OVER)
    
    // ハイスコア更新
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('mobile-last-war-high-score', score.toString())
    }
  }, [score, highScore])

  const goToMenu = useCallback(() => {
    setStatus(GameStatus.MENU)
  }, [])

  const addScore = useCallback((points: number) => {
    setScore(prev => prev + points)
  }, [])

  const addEnemyKill = useCallback(() => {
    const newCount = difficultyCalculator.getEnemiesKilled() + 1
    difficultyCalculator.updateEnemiesKilled(newCount)
    
    // スコア計算（レベル倍率適用）
    const baseScore = GAME_BALANCE.SCORE.ENEMY_KILL
    const multiplier = difficultyCalculator.getScoreMultiplier()
    addScore(Math.floor(baseScore * multiplier))
  }, [addScore, difficultyCalculator])

  const addPowerUpCollection = useCallback(() => {
    setPowerUpsCollected(prev => prev + 1)
    addScore(GAME_BALANCE.SCORE.POWERUP_COLLECT)
  }, [addScore])

  const updateTime = useCallback((deltaTime: number) => {
    if (status === GameStatus.PLAYING) {
      setTimeElapsed(prev => {
        const newTime = prev + deltaTime
        // 1秒ごとに生存ボーナス追加
        const currentSeconds = Math.floor(prev / 1000)
        const newSeconds = Math.floor(newTime / 1000)
        if (newSeconds > currentSeconds) {
          addScore(GAME_BALANCE.SCORE.SURVIVAL_PER_SECOND)
        }
        return newTime
      })
    }
  }, [status, addScore])

  // 難易度情報を取得する関数
  const getDifficultyInfo = useCallback(() => {
    return difficultyCalculator.getDebugInfo()
  }, [difficultyCalculator])

  const getCurrentDifficulty = useCallback(() => {
    return difficultyCalculator.getCurrentDifficulty()
  }, [difficultyCalculator])

  const getGameStats = useCallback((): GameStats => {
    return {
      finalScore: score,
      highScore,
      enemiesKilled: difficultyCalculator.getEnemiesKilled(),
      survivalTime: timeElapsed,
      powerUpsCollected
    }
  }, [score, highScore, timeElapsed, powerUpsCollected, difficultyCalculator])

  const gameState: GameState = {
    status,
    score,
    level: difficultyCalculator.getCurrentLevel(),
    timeElapsed,
    isPaused: status === GameStatus.PAUSED,
    enemiesKilled: difficultyCalculator.getEnemiesKilled(),
    powerUpsCollected
  }

  return {
    gameState,
    status,
    score,
    level: difficultyCalculator.getCurrentLevel(),
    timeElapsed,
    enemiesKilled: difficultyCalculator.getEnemiesKilled(),
    powerUpsCollected,
    highScore,
    difficultyCalculator,
    startGame,
    pauseGame,
    resumeGame,
    gameOver,
    goToMenu,
    addScore,
    addEnemyKill,
    addPowerUpCollection,
    updateTime,
    getDifficultyInfo,
    getCurrentDifficulty,
    getGameStats
  }
}