import React, { useState } from 'react'
import { GameStats } from '../../types/gameStats.types'

interface CompactStatsDisplayProps {
  stats: GameStats
  getPlayTimeFormatted: (seconds: number) => string
  getEfficiencyRating: (stats: GameStats) => string
}

export const CompactStatsDisplay: React.FC<CompactStatsDisplayProps> = ({ 
  stats, 
  getPlayTimeFormatted, 
  getEfficiencyRating 
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // 画面サイズ検出
  const isMobile = window.innerWidth <= 768

  if (!isMobile) {
    // デスクトップでは従来の表示
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
        {/* フル統計表示 */}
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
        </div>

        <div>
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
      </div>
    )
  }

  // モバイル版：コンパクト表示
  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      right: '10px',
      zIndex: 10,
      background: 'rgba(0,0,0,0.85)',
      padding: isExpanded ? '12px' : '8px',
      borderRadius: '8px',
      color: 'white',
      fontFamily: "'Courier New', monospace",
      fontSize: '12px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transition: 'all 0.3s ease'
    }}>
      {/* 常時表示（1行）*/}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ color: '#ffff00', fontWeight: 'bold' }}>
          スコア: {stats.currentScore.toLocaleString()}
        </div>
        <div style={{ color: '#51cf66' }}>
          撃破: {stats.currentSessionStats.enemiesKilled}
        </div>
        <div style={{ color: '#74c0fc' }}>
          Lv.{stats.currentSessionStats.levelReached}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'none',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '10px',
            cursor: 'pointer'
          }}
        >
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>

      {/* 展開時の詳細表示 */}
      {isExpanded && (
        <div style={{ 
          marginTop: '8px', 
          paddingTop: '8px', 
          borderTop: '1px solid rgba(255,255,255,0.2)' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: '#fbbf24' }}>
              生存: {getPlayTimeFormatted(Math.floor((Date.now() - stats.currentSessionStats.startTime) / 1000))}
            </span>
            <span style={{ color: '#a78bfa' }}>
              実績: {stats.achievements.length}個
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: '#ff6b6b' }}>
              ハイスコア: {stats.highScore.toLocaleString()}
            </span>
            <span style={{ color: '#34d399' }}>
              効率: {getEfficiencyRating(stats)}ランク
            </span>
          </div>
          <div style={{ 
            fontSize: '10px', 
            color: '#9ca3af', 
            textAlign: 'center',
            marginTop: '4px'
          }}>
            総プレイ: {stats.totalGamesPlayed}回 | 最長: {getPlayTimeFormatted(stats.bestSurvivalTime)}
          </div>
        </div>
      )}
    </div>
  )
}