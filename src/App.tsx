import React, { useEffect, useRef, useState } from 'react'

interface Player {
  x: number
  y: number
  width: number
  height: number
}

interface Enemy {
  x: number
  y: number
  width: number
  height: number
  speed: number
}

interface Bullet {
  x: number
  y: number
  width: number
  height: number
  speed: number
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  
  const gameState = useRef({
    player: { x: 200, y: 500, width: 40, height: 40 } as Player,
    enemies: [] as Enemy[],
    bullets: [] as Bullet[],
    lastTime: 0,
    lastEnemySpawn: 0,
    lastShot: 0
  })

  const startGame = () => {
    setGameStarted(true)
    setScore(0)
    gameState.current = {
      player: { x: 200, y: 500, width: 40, height: 40 },
      enemies: [],
      bullets: [],
      lastTime: 0,
      lastEnemySpawn: 0,
      lastShot: 0
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !gameStarted) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let animationId: number

    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - gameState.current.lastTime
      gameState.current.lastTime = currentTime

      // Clear canvas
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Spawn enemies
      if (currentTime - gameState.current.lastEnemySpawn > 1000) {
        gameState.current.enemies.push({
          x: Math.random() * (canvas.width - 40),
          y: -40,
          width: 40,
          height: 40,
          speed: 2
        })
        gameState.current.lastEnemySpawn = currentTime
      }

      // Update enemies
      gameState.current.enemies = gameState.current.enemies.filter(enemy => {
        enemy.y += enemy.speed
        return enemy.y < canvas.height + 40
      })

      // Update bullets
      gameState.current.bullets = gameState.current.bullets.filter(bullet => {
        bullet.y -= bullet.speed
        return bullet.y > -10
      })

      // Check collisions
      gameState.current.bullets.forEach((bullet, bulletIndex) => {
        gameState.current.enemies.forEach((enemy, enemyIndex) => {
          if (bullet.x < enemy.x + enemy.width &&
              bullet.x + bullet.width > enemy.x &&
              bullet.y < enemy.y + enemy.height &&
              bullet.y + bullet.height > enemy.y) {
            gameState.current.bullets.splice(bulletIndex, 1)
            gameState.current.enemies.splice(enemyIndex, 1)
            setScore(prev => prev + 100)
          }
        })
      })

      // Draw player (triangle spaceship)
      ctx.fillStyle = '#0066ff'
      ctx.beginPath()
      ctx.moveTo(gameState.current.player.x + gameState.current.player.width / 2, gameState.current.player.y)
      ctx.lineTo(gameState.current.player.x, gameState.current.player.y + gameState.current.player.height)
      ctx.lineTo(gameState.current.player.x + gameState.current.player.width, gameState.current.player.y + gameState.current.player.height)
      ctx.closePath()
      ctx.fill()

      // Draw enemies (inverted triangles)
      ctx.fillStyle = '#ff3333'
      gameState.current.enemies.forEach(enemy => {
        ctx.beginPath()
        ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height)
        ctx.lineTo(enemy.x, enemy.y)
        ctx.lineTo(enemy.x + enemy.width, enemy.y)
        ctx.closePath()
        ctx.fill()
      })

      // Draw bullets
      ctx.fillStyle = '#ffff00'
      gameState.current.bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)
      })

      animationId = requestAnimationFrame(gameLoop)
    }

    const handleTouch = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      const rect = canvas.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top

      // Move player
      gameState.current.player.x = Math.max(0, Math.min(canvas.width - gameState.current.player.width, x - gameState.current.player.width / 2))
      gameState.current.player.y = Math.max(0, Math.min(canvas.height - gameState.current.player.height, y - gameState.current.player.height / 2))

      // Shoot
      if (Date.now() - gameState.current.lastShot > 200) {
        gameState.current.bullets.push({
          x: gameState.current.player.x + gameState.current.player.width / 2 - 2,
          y: gameState.current.player.y,
          width: 4,
          height: 10,
          speed: 8
        })
        gameState.current.lastShot = Date.now()
      }
    }

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      gameState.current.player.x = Math.max(0, Math.min(canvas.width - gameState.current.player.width, x - gameState.current.player.width / 2))
      gameState.current.player.y = Math.max(0, Math.min(canvas.height - gameState.current.player.height, y - gameState.current.player.height / 2))
    }

    const handleClick = () => {
      if (Date.now() - gameState.current.lastShot > 200) {
        gameState.current.bullets.push({
          x: gameState.current.player.x + gameState.current.player.width / 2 - 2,
          y: gameState.current.player.y,
          width: 4,
          height: 10,
          speed: 8
        })
        gameState.current.lastShot = Date.now()
      }
    }

    canvas.addEventListener('touchstart', handleTouch, { passive: false })
    canvas.addEventListener('touchmove', handleTouch, { passive: false })
    canvas.addEventListener('mousemove', handleMouse)
    canvas.addEventListener('click', handleClick)

    animationId = requestAnimationFrame(gameLoop)

    return () => {
      cancelAnimationFrame(animationId)
      canvas.removeEventListener('touchstart', handleTouch)
      canvas.removeEventListener('touchmove', handleTouch)
      canvas.removeEventListener('mousemove', handleMouse)
      canvas.removeEventListener('click', handleClick)
    }
  }, [gameStarted])

  if (!gameStarted) {
    return (
      <div className="app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <h1 style={{ color: '#ff4444', fontSize: '48px', marginBottom: '20px', textShadow: '0 0 20px rgba(255, 68, 68, 0.8)' }}>
          Mobile Last War v2
        </h1>
        <p style={{ fontSize: '18px', marginBottom: '40px', textAlign: 'center', color: '#cccccc' }}>
          敵を撃破してハイスコアを目指そう！<br />
          タッチ・クリックで移動＆射撃
        </p>
        <button
          onClick={startGame}
          style={{
            background: 'linear-gradient(45deg, #ff4444, #ff6666)',
            color: 'white',
            border: 'none',
            padding: '20px 40px',
            fontSize: '24px',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(255, 68, 68, 0.4)',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          🚀 ゲーム開始
        </button>
      </div>
    )
  }

  return (
    <div className="app">
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, background: 'rgba(0,0,0,0.7)', padding: '10px', borderRadius: '8px' }}>
        <div style={{ color: '#ff4444', fontSize: '20px', fontWeight: 'bold' }}>スコア: {score}</div>
      </div>
      <canvas ref={canvasRef} className="game-canvas" />
    </div>
  )
}

export default App