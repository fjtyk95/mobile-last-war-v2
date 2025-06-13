# Mobile Last War v2 - テスト計画書

## 🎯 テスト戦略概要

Mobile Last War v2は段階的実装を行うため、各フェーズで**継続的テスト**を実施し、品質を保ちながら迅速にデプロイする。

### テスト方針
- **Shift Left**: 早期からテストを組み込む
- **Continuous Testing**: 各フェーズでの継続的テスト実行
- **Risk-Based Testing**: 高リスク機能の重点テスト
- **Mobile First**: モバイル環境を優先したテスト

## 📋 テストレベル定義

### 1. Unit Testing (ユニットテスト)
**目的**: 個別関数・コンポーネントの動作確認
**実装時期**: Phase 7
**カバレッジ目標**: 80%以上

### 2. Integration Testing (結合テスト)
**目的**: コンポーネント間連携の確認
**実施時期**: 各フェーズ完了時
**重点領域**: ゲームロジック、状態管理

### 3. System Testing (システムテスト)
**目的**: 全体システムの動作確認
**実施時期**: 各フェーズ完了時
**重点領域**: ゲームプレイ、パフォーマンス

### 4. Acceptance Testing (受入テスト)
**目的**: 要件充足の確認
**実施時期**: 各フェーズ完了時
**評価基準**: 要件定義書との適合性

## 🔍 フェーズ別テスト計画

## Phase 1: 基本ゲーム機能 ✅ **完了**

### 完了済みテスト項目
- [x] プレイヤー移動動作
- [x] 弾丸発射・移動
- [x] 敵スポーン・移動
- [x] 当たり判定
- [x] スコア更新
- [x] タッチ操作
- [x] レスポンシブ表示

---

## Phase 2: ゲームシステム拡張

### 🩺 プレイヤーヘルスシステム

#### ユニットテスト
```typescript
// src/hooks/__tests__/usePlayer.test.ts
describe('usePlayer', () => {
  test('初期ヘルス値が正しく設定される', () => {
    const { result } = renderHook(() => usePlayer())
    expect(result.current.health).toBe(100)
    expect(result.current.maxHealth).toBe(100)
  })
  
  test('ダメージを受けてヘルスが減少する', () => {
    const { result } = renderHook(() => usePlayer())
    act(() => {
      result.current.takeDamage(25)
    })
    expect(result.current.health).toBe(75)
  })
  
  test('ヘルスが0以下になると死亡判定', () => {
    const { result } = renderHook(() => usePlayer())
    act(() => {
      result.current.takeDamage(150)
    })
    expect(result.current.health).toBe(0)
    expect(result.current.isDead()).toBe(true)
  })
  
  test('回復でヘルスが増加する', () => {
    const { result } = renderHook(() => usePlayer())
    act(() => {
      result.current.takeDamage(50)
      result.current.heal(25)
    })
    expect(result.current.health).toBe(75)
  })
  
  test('最大ヘルス以上に回復しない', () => {
    const { result } = renderHook(() => usePlayer())
    act(() => {
      result.current.heal(50)
    })
    expect(result.current.health).toBe(100)
  })
})
```

#### 結合テスト
```typescript
// src/components/__tests__/HealthBar.test.tsx
describe('HealthBar', () => {
  test('ヘルス値が正しく表示される', () => {
    render(<HealthBar health={75} maxHealth={100} />)
    expect(screen.getByText('75/100')).toBeInTheDocument()
  })
  
  test('ヘルスバーの幅が正しく計算される', () => {
    render(<HealthBar health={60} maxHealth={100} />)
    const healthFill = screen.getByTestId('health-fill')
    expect(healthFill).toHaveStyle('width: 60%')
  })
  
  test('ヘルス低下時に警告色で表示される', () => {
    render(<HealthBar health={20} maxHealth={100} />)
    const healthFill = screen.getByTestId('health-fill')
    expect(healthFill).toHaveClass('health-critical')
  })
})
```

#### システムテスト
- [ ] **敵との衝突でダメージ**: プレイヤーが敵に触れると正しくダメージを受ける
- [ ] **敵弾との衝突でダメージ**: 敵の弾丸に当たると正しくダメージを受ける
- [ ] **ゲームオーバー遷移**: ヘルスが0になると確実にゲームオーバー画面に遷移
- [ ] **無敵時間**: ダメージ後の無敵時間中は追加ダメージを受けない
- [ ] **視覚フィードバック**: ダメージ時の点滅エフェクトが正常に動作

### ⚡ パワーアップシステム

#### ユニットテスト
```typescript
// src/hooks/__tests__/usePowerUps.test.ts
describe('usePowerUps', () => {
  test('パワーアップアイテムが正しく生成される', () => {
    const { result } = renderHook(() => usePowerUps())
    act(() => {
      result.current.spawnPowerUp({ x: 100, y: 50 }, 'DAMAGE_UP')
    })
    expect(result.current.powerUps).toHaveLength(1)
    expect(result.current.powerUps[0].type).toBe('DAMAGE_UP')
  })
  
  test('弾での撃破で正効果が適用される', () => {
    const { result } = renderHook(() => usePowerUps())
    const mockPlayer = { power: 10, takeDamage: jest.fn(), heal: jest.fn() }
    
    act(() => {
      result.current.applyPowerUpEffect('DAMAGE_UP', 'shoot', mockPlayer)
    })
    expect(mockPlayer.power).toBe(15) // +5 damage boost
  })
  
  test('直接接触で負効果が適用される', () => {
    const { result } = renderHook(() => usePowerUps())
    const mockPlayer = { power: 15, takeDamage: jest.fn(), heal: jest.fn() }
    
    act(() => {
      result.current.applyPowerUpEffect('DAMAGE_UP', 'touch', mockPlayer)
    })
    expect(mockPlayer.power).toBe(10) // -5 damage penalty
  })
  
  test('ヘルスパワーアップで回復する', () => {
    const { result } = renderHook(() => usePowerUps())
    const mockPlayer = { heal: jest.fn() }
    
    act(() => {
      result.current.applyPowerUpEffect('HEALTH', 'shoot', mockPlayer)
    })
    expect(mockPlayer.heal).toHaveBeenCalledWith(25)
  })
})
```

#### システムテスト
- [ ] **アイテム生成**: 敵撃破時に一定確率でアイテムが出現
- [ ] **弾撃破効果**: 弾でアイテムを撃破すると攻撃力が上がる
- [ ] **接触ペナルティ**: アイテムに直接触れると攻撃力が下がる
- [ ] **回復アイテム**: ヘルスアイテムで正しくHPが回復する
- [ ] **視覚エフェクト**: 効果適用時に適切なエフェクトが表示される

### 🎮 ゲームオーバーシステム

#### 結合テスト
```typescript
// src/components/__tests__/GameOverScreen.test.tsx
describe('GameOverScreen', () => {
  test('最終スコアが正しく表示される', () => {
    const gameStats = {
      finalScore: 1500,
      highScore: 2000,
      enemiesKilled: 25,
      survivalTime: 120000
    }
    render(<GameOverScreen stats={gameStats} />)
    expect(screen.getByText('1,500')).toBeInTheDocument()
  })
  
  test('新記録時にハイスコア表示が更新される', () => {
    const gameStats = {
      finalScore: 2500,
      highScore: 2000,
      enemiesKilled: 35,
      survivalTime: 180000
    }
    render(<GameOverScreen stats={gameStats} />)
    expect(screen.getByText('NEW HIGH SCORE!')).toBeInTheDocument()
  })
  
  test('リスタートボタンが機能する', () => {
    const mockRestart = jest.fn()
    render(<GameOverScreen onRestart={mockRestart} />)
    fireEvent.click(screen.getByText('RESTART'))
    expect(mockRestart).toHaveBeenCalled()
  })
})
```

#### システムテスト
- [ ] **ゲームオーバー遷移**: ヘルス0で確実にゲームオーバー画面表示
- [ ] **統計表示**: スコア、撃破数、生存時間が正確に表示
- [ ] **ハイスコア更新**: 新記録時にハイスコアが更新・保存される
- [ ] **リスタート機能**: リスタートボタンで新しいゲームが開始
- [ ] **メニュー復帰**: メニューボタンでタイトル画面に戻る

### ⏸️ ポーズ機能

#### システムテスト
- [ ] **ポーズ実行**: ポーズボタンでゲームが一時停止
- [ ] **再開機能**: 再開ボタンでゲームが正常に復帰
- [ ] **ポーズ中停止**: ポーズ中は敵・弾丸の動きが完全停止
- [ ] **メニュー表示**: ポーズメニューが正しく表示される
- [ ] **音声制御**: ポーズ時に音声も一時停止される

---

## Phase 3: 敵・AIシステム

### 🤖 敵タイプシステム

#### ユニットテスト
```typescript
// src/entities/__tests__/Enemy.test.ts
describe('Enemy', () => {
  test('Basic敵が直線移動する', () => {
    const enemy = new Enemy('BASIC', { x: 100, y: 0 })
    enemy.update(16.67) // 1 frame
    expect(enemy.position.y).toBeGreaterThan(0)
    expect(enemy.position.x).toBe(100) // x軸移動なし
  })
  
  test('Fast敵がジグザグ移動する', () => {
    const enemy = new Enemy('FAST', { x: 100, y: 0 })
    const positions = []
    for (let i = 0; i < 10; i++) {
      enemy.update(16.67)
      positions.push({ x: enemy.position.x, y: enemy.position.y })
    }
    // x座標が変動していることを確認
    const xPositions = positions.map(p => p.x)
    expect(new Set(xPositions).size).toBeGreaterThan(1)
  })
  
  test('Tank敵が高耐久値を持つ', () => {
    const tankEnemy = new Enemy('TANK', { x: 100, y: 0 })
    const basicEnemy = new Enemy('BASIC', { x: 100, y: 0 })
    expect(tankEnemy.health).toBeGreaterThan(basicEnemy.health)
  })
})
```

#### システムテスト
- [ ] **敵タイプ生成**: 各敵タイプが正しいパラメータで生成される
- [ ] **移動パターン**: Basic(直線)、Fast(ジグザグ)、Tank(低速)が正常動作
- [ ] **耐久値差**: タイプ別の耐久値が正しく設定される
- [ ] **撃破判定**: 各敵タイプが正しいダメージで撃破される

---

## 📱 クロスブラウザ・デバイステスト

### 対象環境
```
Mobile Browsers:
├── iOS Safari 14+
├── iOS Chrome 90+
├── Android Chrome 80+
└── Android Firefox 85+

Desktop Browsers (参考):
├── Chrome 90+
├── Firefox 85+
└── Safari 14+

Device Types:
├── iPhone (SE, 12, 14 Pro)
├── Android (Pixel, Galaxy)
└── iPad (9th gen, Pro)
```

### テスト項目
- [ ] **画面表示**: 各デバイスで正しくレイアウト表示
- [ ] **タッチ操作**: 遅延なく正確な操作が可能
- [ ] **パフォーマンス**: 全デバイスで60FPS維持
- [ ] **音声再生**: ブラウザの自動再生制限に対応
- [ ] **PWA機能**: インストール・オフライン動作

---

## ⚡ パフォーマンステスト

### 測定指標
```typescript
interface PerformanceMetrics {
  fps: number              // 目標: 60FPS維持
  memoryUsage: number      // 目標: 200MB以下
  loadTime: number         // 目標: 3秒以下
  inputLatency: number     // 目標: 16ms以下
}
```

### テストシナリオ
- [ ] **長時間プレイ**: 30分連続プレイでメモリリークなし
- [ ] **高負荷状況**: 敵・弾丸大量表示時のFPS維持
- [ ] **低性能デバイス**: 古いAndroid端末での動作確認
- [ ] **バッテリー消費**: 効率的な処理によるバッテリー配慮

### パフォーマンス監視
```typescript
// src/utils/performanceMonitor.ts
class PerformanceMonitor {
  measureFPS(): number
  measureMemoryUsage(): number
  measureInputLatency(): number
  
  reportMetrics(): PerformanceMetrics
}
```

---

## 🧪 テスト自動化

### Phase 7: テストフレームワーク導入

#### セットアップ
```bash
# テストライブラリ導入
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom

# E2Eテスト
npm install --save-dev playwright @playwright/test
```

#### 設定ファイル
```typescript
// vitest.config.ts
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'html'],
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
})
```

#### CI/CD統合
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e
      - run: npm run build
```

---

## 🎮 E2Eテスト (End-to-End)

### ユーザージャーニーテスト
```typescript
// tests/e2e/gameplay.spec.ts
import { test, expect } from '@playwright/test'

test('完全なゲームプレイフロー', async ({ page }) => {
  await page.goto('/')
  
  // ゲーム開始
  await page.click('[data-testid="start-game-button"]')
  await expect(page.locator('[data-testid="game-canvas"]')).toBeVisible()
  
  // プレイヤー移動テスト
  await page.locator('[data-testid="game-canvas"]').click({ position: { x: 200, y: 300 } })
  
  // スコア更新確認（敵撃破）
  const initialScore = await page.locator('[data-testid="score"]').textContent()
  await page.waitForTimeout(5000) // 5秒プレイ
  const updatedScore = await page.locator('[data-testid="score"]').textContent()
  expect(parseInt(updatedScore)).toBeGreaterThan(parseInt(initialScore))
  
  // ゲームオーバーまでプレイ
  await page.waitForSelector('[data-testid="game-over-screen"]', { timeout: 60000 })
  
  // リスタート
  await page.click('[data-testid="restart-button"]')
  await expect(page.locator('[data-testid="game-canvas"]')).toBeVisible()
})

test('パワーアップシステム', async ({ page }) => {
  await page.goto('/')
  await page.click('[data-testid="start-game-button"]')
  
  // パワーアップアイテム出現まで待機
  await page.waitForSelector('[data-testid="powerup-item"]', { timeout: 30000 })
  
  // 弾での撃破
  const powerupElement = page.locator('[data-testid="powerup-item"]').first()
  await powerupElement.click() // 弾で撃破をシミュレート
  
  // 効果確認（攻撃力表示の変化等）
  await expect(page.locator('[data-testid="player-power"]')).toContainText('15')
})
```

### モバイルE2Eテスト
```typescript
test('モバイルタッチ操作', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
  await page.goto('/')
  
  // タッチ操作テスト
  await page.touchscreen.tap(200, 400)
  await page.touchscreen.tap(100, 300)
  
  // ゲームが正常に動作することを確認
  await expect(page.locator('[data-testid="player"]')).toBeVisible()
})
```

---

## 📊 テスト実行計画

### 各フェーズでの実行タイミング

#### 開発中（継続的）
- **ユニットテスト**: 機能実装時に随時実行
- **結合テスト**: コンポーネント完成時に実行
- **手動テスト**: 機能完成時に実行

#### フェーズ完了時（必須）
- **システムテスト**: 全機能の動作確認
- **パフォーマンステスト**: 性能基準クリア確認
- **クロスブラウザテスト**: 対象環境での動作確認
- **受入テスト**: 要件充足確認

#### リリース前（必須）
- **E2Eテスト**: 完全なユーザージャーニー確認
- **リグレッションテスト**: 既存機能の非劣化確認
- **本番環境テスト**: 実際のデプロイ環境での確認

### テスト実行コマンド
```bash
# 開発中の継続的テスト
npm run test:watch

# フェーズ完了時のフルテスト
npm run test:all

# パフォーマンステスト
npm run test:performance

# E2Eテスト
npm run test:e2e

# カバレッジ付きテスト
npm run test:coverage
```

---

## 🎯 品質基準・合格条件

### 各フェーズ共通基準
- [ ] **機能**: 要件定義の全機能が正常動作
- [ ] **パフォーマンス**: 60FPS安定動作
- [ ] **互換性**: 対象ブラウザ・デバイスで正常動作
- [ ] **バグ**: クリティカル・メジャーバグ0件

### Phase別追加基準

#### Phase 2
- [ ] **ヘルスシステム**: ダメージ・回復・死亡判定が正確
- [ ] **パワーアップ**: 撃破vs接触の効果が正しく動作
- [ ] **UI/UX**: ポーズ・リスタート機能が完全動作

#### Phase 3以降
- [ ] **AI動作**: 敵の移動パターンが仕様通り
- [ ] **状態管理**: Redux状態が正しく管理される
- [ ] **視覚効果**: エフェクトが性能に影響しない

---

## 📋 テスト管理・報告

### テスト結果報告書テンプレート
```markdown
# Phase X テスト結果報告書

## 実行概要
- **実行日**: YYYY/MM/DD
- **実行者**: 開発チーム
- **対象フェーズ**: Phase X
- **テスト環境**: [環境詳細]

## 結果サマリー
- **Total**: XXX件
- **Pass**: XXX件  
- **Fail**: XXX件
- **Coverage**: XX%

## 不具合一覧
| ID | 重要度 | 内容 | ステータス |
|----|--------|------|-----------|
| BUG-001 | High | [詳細] | Open |

## 結論
- [ ] リリース可 / [ ] 修正要
```

### 継続的品質監視
```typescript
// 品質メトリクス自動収集
interface QualityMetrics {
  testCoverage: number
  bugCount: number
  performanceScore: number
  userSatisfaction: number
}
```

---

**策定者**: 開発チーム  
**策定日**: 2025/01/14  
**次回更新**: Phase 2実装開始時  
**承認**: プロジェクトリーダー