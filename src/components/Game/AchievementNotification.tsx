import React, { useState, useEffect } from 'react'
import { Achievement } from '../../types/gameStats.types'

interface AchievementNotificationProps {
  achievement: Achievement | null
  onClose: () => void
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({ 
  achievement, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (achievement) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300) // フェードアウト後にクリア
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [achievement, onClose])

  if (!achievement) return null

  const getCategoryColor = (category: Achievement['category']): string => {
    switch (category) {
      case 'score': return '#ffd700'
      case 'survival': return '#51cf66'
      case 'kills': return '#ff6b6b'
      case 'efficiency': return '#74c0fc'
      case 'special': return '#a78bfa'
      default: return '#d1d5db'
    }
  }

  const getCategoryIcon = (category: Achievement['category']): string => {
    switch (category) {
      case 'score': return '💰'
      case 'survival': return '⏱️'
      case 'kills': return '💀'
      case 'efficiency': return '⚡'
      case 'special': return '✨'
      default: return '🏆'
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${isVisible ? 1 : 0.8})`,
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.3s ease-out',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.95), rgba(30,30,30,0.95))',
        border: `3px solid ${getCategoryColor(achievement.category)}`,
        borderRadius: '20px',
        padding: '30px',
        textAlign: 'center',
        color: 'white',
        fontFamily: "'Courier New', monospace",
        zIndex: 1000,
        maxWidth: '350px',
        minWidth: '300px',
        boxShadow: `0 0 30px ${getCategoryColor(achievement.category)}40`
      }}
    >
      {/* アニメーション効果 */}
      <div style={{
        position: 'absolute',
        top: '-10px',
        left: '-10px',
        right: '-10px',
        bottom: '-10px',
        border: `2px solid ${getCategoryColor(achievement.category)}`,
        borderRadius: '25px',
        opacity: 0.3,
        animation: 'pulse 2s infinite'
      }} />

      {/* 実績アイコン */}
      <div style={{
        fontSize: '48px',
        marginBottom: '15px',
        textShadow: `0 0 20px ${getCategoryColor(achievement.category)}`
      }}>
        {getCategoryIcon(achievement.category)}
      </div>

      {/* 実績解除テキスト */}
      <div style={{
        color: getCategoryColor(achievement.category),
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: '10px',
        textShadow: '0 0 10px currentColor'
      }}>
        🏆 実績解除！
      </div>

      {/* 実績名 */}
      <div style={{
        fontSize: '22px',
        fontWeight: 'bold',
        marginBottom: '10px',
        color: '#ffffff'
      }}>
        {achievement.name}
      </div>

      {/* 実績説明 */}
      <div style={{
        fontSize: '14px',
        color: '#cccccc',
        marginBottom: '15px'
      }}>
        {achievement.description}
      </div>

      {/* カテゴリバッジ */}
      <div style={{
        background: getCategoryColor(achievement.category),
        color: 'black',
        padding: '6px 12px',
        borderRadius: '15px',
        fontSize: '12px',
        fontWeight: 'bold',
        display: 'inline-block'
      }}>
        {achievement.category.toUpperCase()}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.05); opacity: 0.1; }
          100% { transform: scale(1); opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}