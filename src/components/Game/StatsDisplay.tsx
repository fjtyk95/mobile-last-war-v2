import React from 'react'
import { GameStats } from '../../types/gameStats.types'

interface StatsDisplayProps {
  stats: GameStats
  getPlayTimeFormatted: (seconds: number) => string
  getEfficiencyRating: (stats: GameStats) => string
}

export const StatsDisplay: React.FC<StatsDisplayProps> = ({ 
  stats, 
  getPlayTimeFormatted, 
  getEfficiencyRating 
}) => {
  return (
    <div style={{
      position: 'absolute',
      top: '60px',
      left: '20px',
      zIndex: 10,
      background: 'rgba(0,0,0,0.8)',
      padding: '15px',
      borderRadius: '12px',
      color: 'white',
      fontFamily: "'Courier New', monospace",
      minWidth: '280px',
      border: '2px solid rgba(255, 255, 255, 0.1)'
    }}>
      {/* 現在セッション */}
      <div style={{ marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '8px' }}>
        <div style={{ color: '#ff4444', fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
          現在のセッション
        </div>
        <div style={{ color: '#ffff00', fontSize: '16px' }}>
          スコア: {stats.currentScore.toLocaleString()}
        </div>
        <div style={{ color: '#51cf66', fontSize: '14px' }}>
          撃破: {stats.currentSessionStats.enemiesKilled} 体
        </div>
        <div style={{ color: '#74c0fc', fontSize: '14px' }}>
          レベル: {stats.currentSessionStats.levelReached}
        </div>
        <div style={{ color: '#fbbf24', fontSize: '14px' }}>
          生存: {getPlayTimeFormatted(Math.floor((Date.now() - stats.currentSessionStats.startTime) / 1000))}
        </div>
      </div>

      {/* 個人記録 */}
      <div style={{ marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '8px' }}>
        <div style={{ color: '#ff6b6b', fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
          個人記録
        </div>
        <div style={{ color: '#ffd43b', fontSize: '14px' }}>
          ハイスコア: {stats.highScore.toLocaleString()}
        </div>
        <div style={{ color: '#51cf66', fontSize: '14px' }}>
          最長生存: {getPlayTimeFormatted(stats.bestSurvivalTime)}
        </div>
        <div style={{ color: '#74c0fc', fontSize: '14px' }}>
          最高レベル: {stats.highestLevelReached}
        </div>
      </div>

      {/* 全体統計 */}
      <div style={{ marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '8px' }}>
        <div style={{ color: '#a78bfa', fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
          全体統計
        </div>
        <div style={{ color: '#d1d5db', fontSize: '13px' }}>
          プレイ回数: {stats.totalGamesPlayed} 回
        </div>
        <div style={{ color: '#d1d5db', fontSize: '13px' }}>
          総撃破数: {stats.totalEnemiesKilled.toLocaleString()} 体
        </div>
        <div style={{ color: '#d1d5db', fontSize: '13px' }}>
          総プレイ時間: {getPlayTimeFormatted(stats.totalPlayTime)}
        </div>
        <div style={{ color: '#d1d5db', fontSize: '13px' }}>
          平均生存: {getPlayTimeFormatted(Math.floor(stats.averageSurvivalTime))}
        </div>
      </div>

      {/* 効率性評価 */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ color: '#34d399', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
          効率性評価
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.1)',
          padding: '6px 10px',
          borderRadius: '6px'
        }}>
          <span style={{ fontSize: '13px', color: '#d1d5db' }}>
            {Math.floor(stats.averageScorePerMinute)}/分
          </span>
          <span style={{ 
            fontSize: '16px', 
            fontWeight: 'bold',
            color: getEfficiencyRating(stats) === 'S' ? '#ffd700' :
                   getEfficiencyRating(stats) === 'A' ? '#c0392b' :
                   getEfficiencyRating(stats) === 'B' ? '#e67e22' :  
                   getEfficiencyRating(stats) === 'C' ? '#f39c12' : '#95a5a6'
          }}>
            {getEfficiencyRating(stats)} ランク
          </span>
        </div>
      </div>

      {/* 最近の実績 */}
      {stats.achievements.length > 0 && (
        <div>
          <div style={{ color: '#fbbf24', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
            実績: {stats.achievements.length}個解除
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#d1d5db',
            maxHeight: '40px',
            overflow: 'hidden'
          }}>
            {stats.achievements.slice(-2).map(achievement => (
              <div key={achievement.id} style={{ marginBottom: '2px' }}>
                🏆 {achievement.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}