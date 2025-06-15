# Mobile Last War v2 - 設計書

## 🏗️ システム設計概要

### アーキテクチャ概要
Mobile Last War v2は、シンプルで効率的なゲームアーキテクチャを採用している。

```
┌─────────────────────────────────────────────┐
│              Presentation Layer              │
│  React Components + TypeScript              │
├─────────────────────────────────────────────┤
│               Business Logic                │
│     Game Engine + State Management         │
├─────────────────────────────────────────────┤
│              Rendering Layer                │
│           Canvas 2D API                     │
├─────────────────────────────────────────────┤
│              Platform Layer                 │
│         Web APIs + Vercel                   │
└─────────────────────────────────────────────┘
```

## 📂 プロジェクト構造

```
src/
├── components/           # React コンポーネント
│   └── Game/            # ゲーム関連コンポーネント
├── hooks/               # カスタムフック
├── store/               # Redux状態管理
├── types/               # TypeScript型定義
├── constants/           # 定数・設定
├── effects/             # 視覚エフェクト
├── audio/               # 音響システム
└── utils/               # ユーティリティ
```

## 🎮 ゲームエンジン設計

### 現在のアーキテクチャ

```typescript
interface GameState {
  player: Player
  enemies: Enemy[]
  bullets: Bullet[]
  powerUps: PowerUp[]
  score: number
  time: number
  status: GameStatus
}
```

### コアシステム

```typescript
// ゲームループ
const gameLoop = (currentTime: number) => {
  updateEntities(deltaTime)
  handleCollisions()
  renderFrame(ctx)
  requestAnimationFrame(gameLoop)
}

// 難易度システム
const getDifficulty = (survivalTime: number) => {
  if (survivalTime >= 120) return { spawnInterval: 200 }
  if (survivalTime >= 90) return { spawnInterval: 400 }
  if (survivalTime >= 60) return { spawnInterval: 600 }
  if (survivalTime >= 30) return { spawnInterval: 800 }
  return { spawnInterval: 1000 }
}
```

## 🔄 状態管理設計

### Redux Store構造

```typescript
interface RootState {
  gameStats: GameStatsState
  // 他の状態は必要に応じて追加
}

interface GameStatsState {
  highScore: number
  totalGamesPlayed: number
  totalEnemiesKilled: number
  bestSurvivalTime: number
  achievements: Achievement[]
}
```

## 🎨 UI/UX設計

### レスポンシブ設計

```css
.game-container {
  width: 100vw;
  height: 100vh;
  position: relative;
}

/* モバイル最適化 */
@media (max-width: 768px) {
  .compact-stats {
    font-size: 14px;
    padding: 8px;
  }
}
```

### コンポーネント設計

```typescript
interface GameProps {
  canvasRef: RefObject<HTMLCanvasElement>
  gameState: GameState
  onPause: () => void
}

interface StatsDisplayProps {
  stats: GameStats
  isCompact?: boolean
}
```

## 🚀 パフォーマンス設計

### レンダリング最適化

```typescript
// 効率的なゲームループ
const gameLoop = (currentTime: number) => {
  if (gameStatus !== 'playing') return
  
  const deltaTime = currentTime - lastTime
  updateGame(deltaTime)
  renderGame(ctx)
  
  requestAnimationFrame(gameLoop)
}

// エンティティ管理
const updateEntities = (deltaTime: number) => {
  // 画面外エンティティの削除
  enemies = enemies.filter(e => e.y < canvas.height + 100)
  bullets = bullets.filter(b => b.y > -10)
}
```

### メモリ管理

```typescript
// 効率的なエンティティ管理
class EntityManager {
  cleanupOffscreenEntities(): void
  removeDestroyedEntities(): void
  optimizeArrays(): void
}
```

## 🔊 オーディオシステム設計

### Web Audio API活用

```typescript
interface AudioManager {
  playShootSound(): void
  playEnemyDestroySound(enemyType: EnemyType): void
  playPowerUpSound(isPositive: boolean): void
  playGameOverSound(): void
  toggleMute(): void
}
```

## 🧪 テスト設計

### テスト戦略

```typescript
// ユニットテスト例
describe('Difficulty System', () => {
  it('should return correct spawn interval for survival time', () => {
    expect(getDifficulty(15).spawnInterval).toBe(1000)
    expect(getDifficulty(45).spawnInterval).toBe(800)
    expect(getDifficulty(75).spawnInterval).toBe(600)
  })
})
```

## 📊 監視・分析設計

### ゲーム統計

```typescript
interface GameAnalytics {
  trackGameStart(): void
  trackGameEnd(score: number, survivalTime: number): void
  trackPowerUpCollection(type: PowerUpType): void
  updateHighScore(score: number): void
}
```

## 🔧 技術仕様

### 技術スタック
- **React 18** + **TypeScript** - UIフレームワーク
- **Vite** - ビルドツール
- **Redux Toolkit** - 状態管理
- **Canvas 2D API** - レンダリング
- **Web Audio API** - 音響
- **Vercel** - デプロイメント

### パフォーマンス要件
- **フレームレート**: 60FPS維持
- **メモリ使用量**: 効率的な管理
- **読み込み時間**: 3秒以内