import React from 'react'

interface HealthBarProps {
  health: number
  maxHealth: number
}

export const HealthBar: React.FC<HealthBarProps> = ({ health, maxHealth }) => {
  const healthPercentage = (health / maxHealth) * 100
  const isCritical = healthPercentage <= 20
  const isLow = healthPercentage <= 50

  return (
    <div className="health-bar-container">
      <div className="health-text">
        HP: {health}/{maxHealth}
      </div>
      <div className="health-bar-background">
        <div 
          className={`health-bar-fill ${isCritical ? 'health-critical' : isLow ? 'health-low' : 'health-normal'}`}
          style={{ width: `${healthPercentage}%` }}
          data-testid="health-fill"
        />
      </div>
      <style jsx>{`
        .health-bar-container {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 10;
        }
        
        .health-text {
          color: white;
          font-family: 'Courier New', monospace;
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 5px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        }
        
        .health-bar-background {
          width: 200px;
          height: 20px;
          background-color: rgba(0, 0, 0, 0.5);
          border: 2px solid #fff;
          border-radius: 10px;
          overflow: hidden;
        }
        
        .health-bar-fill {
          height: 100%;
          transition: width 0.3s ease, background-color 0.3s ease;
          border-radius: 8px;
        }
        
        .health-normal {
          background: linear-gradient(90deg, #4ade80, #22c55e);
        }
        
        .health-low {
          background: linear-gradient(90deg, #fbbf24, #f59e0b);
        }
        
        .health-critical {
          background: linear-gradient(90deg, #ef4444, #dc2626);
          animation: pulse 0.5s infinite alternate;
        }
        
        @keyframes pulse {
          from { opacity: 1; }
          to { opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}