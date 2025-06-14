import React, { useEffect, useState } from 'react'
import { GameStats } from '../../types/game.types'

interface GameOverScreenProps {
  stats: GameStats
  onRestart: () => void
  onMenu: () => void
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ 
  stats, 
  onRestart, 
  onMenu 
}) => {
  const [isNewHighScore, setIsNewHighScore] = useState(false)

  useEffect(() => {
    setIsNewHighScore(stats.finalScore > stats.highScore)
  }, [stats])

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="game-over-screen" data-testid="game-over-screen">
      <div className="game-over-content">
        <h1 className="game-over-title">GAME OVER</h1>
        
        {isNewHighScore && (
          <div className="new-high-score">
            🎉 NEW HIGH SCORE! 🎉
          </div>
        )}
        
        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-label">Final Score</span>
            <span className="stat-value" data-testid="final-score">
              {stats.finalScore.toLocaleString()}
            </span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">High Score</span>
            <span className="stat-value">
              {Math.max(stats.finalScore, stats.highScore).toLocaleString()}
            </span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">Enemies Killed</span>
            <span className="stat-value">{stats.enemiesKilled}</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">Survival Time</span>
            <span className="stat-value">{formatTime(stats.survivalTime)}</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">Power-ups Collected</span>
            <span className="stat-value">{stats.powerUpsCollected}</span>
          </div>
        </div>
        
        <div className="button-container">
          <button 
            className="game-button restart-button" 
            onClick={onRestart}
            data-testid="restart-button"
          >
            ⟲ RESTART
          </button>
          <button 
            className="game-button menu-button" 
            onClick={onMenu}
            data-testid="menu-button"
          >
            ⌂ MENU
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .game-over-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          animation: fadeIn 0.5s ease-in;
        }
        
        .game-over-content {
          background: linear-gradient(135deg, #1a1a2e, #16213e);
          border: 3px solid #0f3460;
          border-radius: 20px;
          padding: 40px;
          max-width: 400px;
          width: 90%;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        
        .game-over-title {
          color: #ff4444;
          font-size: 36px;
          font-weight: bold;
          margin-bottom: 20px;
          text-shadow: 2px 2px 8px rgba(255,68,68,0.3);
          font-family: 'Courier New', monospace;
        }
        
        .new-high-score {
          color: #ffd700;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 20px;
          animation: bounce 1s infinite;
        }
        
        .stats-container {
          margin: 30px 0;
        }
        
        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 15px 0;
          padding: 10px 15px;
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
          border-left: 4px solid #0f3460;
        }
        
        .stat-label {
          color: #a0a0a0;
          font-size: 14px;
          font-weight: 600;
        }
        
        .stat-value {
          color: #ffffff;
          font-size: 18px;
          font-weight: bold;
          font-family: 'Courier New', monospace;
        }
        
        .button-container {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-top: 30px;
        }
        
        .game-button {
          flex: 1;
          padding: 15px 20px;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: bold;
          font-family: 'Courier New', monospace;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
        }
        
        .restart-button {
          background: linear-gradient(135deg, #4ade80, #22c55e);
          color: white;
        }
        
        .restart-button:hover {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(34,197,94,0.3);
        }
        
        .menu-button {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white;
        }
        
        .menu-button:hover {
          background: linear-gradient(135deg, #4f46e5, #4338ca);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(79,70,229,0.3);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        @media (max-width: 480px) {
          .game-over-content {
            padding: 30px 20px;
          }
          
          .game-over-title {
            font-size: 28px;
          }
          
          .button-container {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}