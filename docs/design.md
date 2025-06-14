# Mobile Last War v2 - 設計書

## 🏗️ システム設計概要

### アーキテクチャ概要
Mobile Last War v2は、段階的な機能拡張を前提とした、スケーラブルなゲームアーキテクチャを採用する。

```
┌─────────────────────────────────────────────┐
│              Presentation Layer              │
│  React Components + TypeScript + CSS        │
├─────────────────────────────────────────────┤
│               Business Logic                │
│     Game Engine + State Management         │
├─────────────────────────────────────────────┤
│              Rendering Layer                │
│  Canvas 2D API → PixiJS (Phase 5)          │
├─────────────────────────────────────────────┤
│              Platform Layer                 │
│    PWA + Service Worker + Web APIs         │
└─────────────────────────────────────────────┘
```

## 📂 プロジェクト構造設計

```
src/
├── components/           # React コンポーネント
│   ├── Game/            # ゲーム関連コンポーネント
│   ├── UI/              # UI・メニューコンポーネント
│   └── Common/          # 共通コンポーネント
├── engine/              # ゲームエンジン
│   ├── core/            # コアシステム
│   ├── entities/        # ゲームエンティティ
│   ├── systems/         # ゲームシステム
│   └── utils/           # ユーティリティ
├── store/               # Redux状態管理
│   ├── slices/          # 機能別スライス
│   └── middleware/      # カスタムミドルウェア
├── services/            # 外部サービス
│   ├── api/             # API通信
│   ├── storage/         # ローカルストレージ
│   └── analytics/       # 分析・監視
├── hooks/               # カスタムフック
├── utils/               # 共通ユーティリティ
├── types/               # TypeScript型定義
├── constants/           # 定数・設定
└── assets/              # 静的リソース
```

## 🎮 ゲームエンジン設計

### Entity-Component-System (ECS) アーキテクチャ

```typescript
// Phase 3で実装予定の本格的ECSアーキテクチャ
interface Entity {
  id: string
  components: Map<string, Component>
}

interface Component {
  type: string
  data: any
}

interface System {
  update(entities: Entity[], deltaTime: number): void
}
```

### 現在の簡易アーキテクチャ（Phase 1-2）

```typescript
// 現在のシンプルな構造
interface GameState {
  player: Player
  enemies: Enemy[]
  bullets: Bullet[]
  powerUps: PowerUp[]
  score: number
  level: number
  gameStatus: 'menu' | 'playing' | 'paused' | 'gameOver'
}
```

## 🎯 段階別アーキテクチャ進化

### Phase 1: シンプルゲーム（完了）
```typescript
// 単一ファイルでの実装
const App = () => {
  const gameState = useRef({
    player: Player,
    enemies: Enemy[],
    bullets: Bullet[]
  })
  // Canvas直接操作
}
```

### Phase 2: 構造化（次回実装）
```typescript
// 機能別分割
src/
├── components/
│   ├── GameCanvas.tsx
│   ├── GameUI.tsx
│   └── GameOverScreen.tsx
├── hooks/
│   ├── useGameLoop.ts
│   ├── useGameState.ts
│   └── useInputHandler.ts
└── types/
    └── game.types.ts
```

### Phase 3: State Management
```typescript
// Redux Toolkit導入
const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    updatePlayer,
    spawnEnemy,
    fireBullet,
    updateScore
  }
})
```

### Phase 4: ゲームエンジン
```typescript
// 本格的ゲームエンジン
class GameEngine {
  entityManager: EntityManager
  systemManager: SystemManager
  inputManager: InputManager
  audioManager: AudioManager
}
```

### Phase 5: 高性能レンダリング
```typescript
// PixiJS統合
class PixiRenderer {
  app: PIXI.Application
  stage: PIXI.Container
  
  render(gameState: GameState): void
}
```

## 🔄 状態管理設計

### Phase 2: Local State
```typescript
interface GameState {
  // プレイヤー状態
  player: {
    position: { x: number, y: number }
    health: number
    maxHealth: number
    power: number
    weapons: WeaponType[]
  }
  
  // ゲーム状態
  game: {
    status: GameStatus
    score: number
    level: number
    timeElapsed: number
    isPaused: boolean
  }
  
  // 敵・弾丸状態
  entities: {
    enemies: Enemy[]
    bullets: Bullet[]
    powerUps: PowerUp[]
  }
}
```

### Phase 3: Redux Store
```typescript
interface RootState {
  game: GameState
  player: PlayerState
  settings: SettingsState
  ui: UIState
  achievements: AchievementState
}
```

## 🎨 UI/UX設計

### レスポンシブ設計
```css
/* モバイル・ファースト */
.game-container {
  width: 100vw;
  height: calc(var(--vh, 1vh) * 100);
}

/* タブレット対応 */
@media (min-width: 768px) {
  .game-container {
    max-width: 480px;
    margin: 0 auto;
  }
}
```

### コンポーネント設計
```typescript
// 再利用可能なUIコンポーネント
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger'
  size: 'small' | 'medium' | 'large'
  disabled?: boolean
  onClick: () => void
}

interface GameHUDProps {
  score: number
  health: number
  level: number
  isPaused: boolean
}
```

## 🚀 パフォーマンス設計

### レンダリング最適化
```typescript
// Phase 1: requestAnimationFrame
const gameLoop = (currentTime: number) => {
  updateGame(deltaTime)
  renderGame(ctx)
  requestAnimationFrame(gameLoop)
}

// Phase 5: オブジェクトプーリング
class ObjectPool<T> {
  private pool: T[] = []
  private factory: () => T
  
  acquire(): T
  release(obj: T): void
}
```

### メモリ管理
```typescript
// 段階的最適化
class MemoryManager {
  // Phase 2: 基本的なクリーンアップ
  cleanupOffscreenEntities(): void
  
  // Phase 4: オブジェクトプーリング
  poolManager: ObjectPoolManager
  
  // Phase 5: 高度なメモリ管理
  memoryMonitor: MemoryMonitor
}
```

## 📱 PWA設計

### Service Worker戦略
```typescript
// キャッシュ戦略
const CACHE_STRATEGIES = {
  static: 'cache-first',    // JS, CSS, Images
  api: 'network-first',     // スコアデータ
  dynamic: 'stale-while-revalidate'  // ゲームデータ
}
```

### Manifest設計
```json
{
  "name": "Mobile Last War",
  "short_name": "LastWar",
  "display": "fullscreen",
  "orientation": "portrait",
  "theme_color": "#ff4444",
  "background_color": "#1a1a2e"
}
```

## 🔊 オーディオシステム設計

### Phase 6: サウンド管理
```typescript
interface AudioManager {
  // 効果音管理
  playSFX(sound: SoundEffect): void
  
  // BGM管理
  playBGM(track: MusicTrack): void
  
  // 設定管理
  setMasterVolume(volume: number): void
  setSFXVolume(volume: number): void
  setMusicVolume(volume: number): void
}
```

## 🧪 テスト設計

### テスト戦略
```typescript
// ユニットテスト
describe('GameEngine', () => {
  it('should update entities correctly')
  it('should handle collisions')
})

// インテグレーションテスト
describe('GamePlay', () => {
  it('should spawn enemies correctly')
  it('should update score on enemy kill')
})

// E2Eテスト
describe('User Journey', () => {
  it('should complete a full game session')
})
```

## 📊 監視・分析設計

### メトリクス収集
```typescript
interface GameAnalytics {
  // プレイ統計
  trackSessionStart(): void
  trackSessionEnd(duration: number, score: number): void
  trackPowerUpUsage(type: PowerUpType): void
  
  // パフォーマンス監視
  trackFPS(fps: number): void
  trackMemoryUsage(usage: number): void
  
  // エラー監視
  trackError(error: Error): void
}
```

## 🔐 セキュリティ設計

### セキュリティ対策
```typescript
// XSS対策
const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input)
}

// CSP設定
const CSP = {
  'default-src': "'self'",
  'script-src': "'self' 'unsafe-inline'",
  'style-src': "'self' 'unsafe-inline'"
}
```

---

**設計者**: 開発チーム  
**設計日**: 2025/01/14  
**バージョン**: v1.0  
**次回レビュー**: Phase 2実装時