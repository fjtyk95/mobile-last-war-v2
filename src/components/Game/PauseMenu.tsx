import React from 'react'

interface PauseMenuProps {
  onResume: () => void
  onRestart: () => void
  onMenu: () => void
}

export const PauseMenu: React.FC<PauseMenuProps> = ({ 
  onResume, 
  onRestart, 
  onMenu 
}) => {
  return (
    <div className="pause-menu" data-testid="pause-menu">
      <div className="pause-content">
        <h1 className="pause-title">PAUSED</h1>
        
        <div className="pause-buttons">
          <button 
            className="pause-button resume-button" 
            onClick={onResume}
            data-testid="resume-button"
          >
            ▶ RESUME
          </button>
          
          <button 
            className="pause-button restart-button" 
            onClick={onRestart}
            data-testid="restart-button"
          >
            ⟲ RESTART
          </button>
          
          <button 
            className="pause-button menu-button" 
            onClick={onMenu}
            data-testid="menu-button"
          >
            ⌂ MENU
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .pause-menu {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 999;
          animation: fadeIn 0.3s ease-in;
        }
        
        .pause-content {
          background: linear-gradient(135deg, #1a1a2e, #16213e);
          border: 3px solid #0f3460;
          border-radius: 20px;
          padding: 40px;
          max-width: 300px;
          width: 90%;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        
        .pause-title {
          color: #ffffff;
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 30px;
          text-shadow: 2px 2px 8px rgba(255,255,255,0.1);
          font-family: 'Courier New', monospace;
        }
        
        .pause-buttons {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .pause-button {
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
        
        .resume-button {
          background: linear-gradient(135deg, #4ade80, #22c55e);
          color: white;
        }
        
        .resume-button:hover {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(34,197,94,0.3);
        }
        
        .restart-button {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
        }
        
        .restart-button:hover {
          background: linear-gradient(135deg, #d97706, #b45309);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(217,119,6,0.3);
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
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @media (max-width: 480px) {
          .pause-content {
            padding: 30px 20px;
          }
          
          .pause-title {
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  )
}