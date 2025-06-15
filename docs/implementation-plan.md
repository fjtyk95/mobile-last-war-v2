# Mobile Last War v2 - 段階的実装計画書

## 🚀 実装フェーズ概要

本プロジェクトは、継続的な改善とデプロイを前提とした7つのフェーズに分けて実装する。各フェーズは1-2週間程度で完了し、すぐにデプロイして動作確認を行う。

## 📋 Phase 1: 基本ゲーム機能 ✅ **完了**

### 実装済み機能
- [x] React + TypeScript + Vite環境構築
- [x] Canvas 2Dベースのゲームループ
- [x] プレイヤー機体（三角形）の移動・射撃
- [x] 敵スポーン・移動システム
- [x] 弾丸システムと当たり判定
- [x] 基本スコアシステム
- [x] タッチ・マウス操作対応
- [x] レスポンシブデザイン

---

## 🎯 Phase 2: ゲームシステム拡張 ✅ **完了**

### 実装済み機能
- [x] プレイヤーヘルスシステム（HP表示、ダメージ、無敵時間）
- [x] パワーアップシステム（撃破vs接触の効果差）
- [x] ゲームオーバー画面（統計、リスタート機能）
- [x] ポーズ機能（一時停止、再開、メニュー）
- [x] UI/UX改善（ヘルスバー、レベル表示、統計）
- [x] ハイスコア永続化システム

### デプロイ状況
- ✅ GitHub: 更新済み
- ✅ Vercel: 稼働中
- ✅ 動作確認: 完了

---

## 🕹️ Phase 2.5: 操作システム改善 📋 **計画中**

### 🎯 実装目標
より直感的で快適なモバイルゲーム体験の実現

### 📝 実装タスク

#### 2.5.1 プレイヤー操作の改善
```typescript
// プレイヤー位置制限
const PLAYER_AREA_RATIO = 0.2 // 画面下部20%
const fixedPlayerY = canvas.height * (1 - PLAYER_AREA_RATIO)

// 左右移動のみの制御
const updatePlayerPosition = (touchX: number) => {
  const newX = Math.max(0, Math.min(canvas.width - 40, touchX - 20))
  player.updatePosition({ x: newX, y: fixedPlayerY })
}
```

#### 2.5.2 自動連射システム
```typescript
// 攻撃力に応じた連射間隔
const getFireRate = (power: number): number => {
  const baseInterval = 200 // 基本200ms
  const minInterval = 100  // 最小100ms
  const reduction = Math.floor((power - 10) / 5) * 20
  return Math.max(minInterval, baseInterval - reduction)
}

// 自動射撃処理
const autoFire = (currentTime: number) => {
  const fireInterval = getFireRate(player.power)
  if (currentTime - lastShot > fireInterval) {
    createBullet(player.position)
    lastShot = currentTime
  }
}
```

#### 2.5.3 難易度バランス調整
```typescript
// レベル別難易度
const getDifficultyParams = (level: number) => {
  if (level <= 5) {
    return {
      spawnInterval: 1500 - (level - 1) * 100,
      enemySpeed: 1.5 + (level - 1) * 0.2
    }
  } else if (level <= 10) {
    return {
      spawnInterval: 1000 - (level - 5) * 60,
      enemySpeed: 2.5 + (level - 5) * 0.2
    }
  } else {
    return {
      spawnInterval: 700,
      enemySpeed: 3.5,
      scoreMultiplier: 1.5
    }
  }
}
```

### 📊 成果物
- `src/hooks/useAutoFire.ts` - 自動連射管理
- `src/utils/difficultyCalculator.ts` - 難易度計算
- `src/constants/gameBalance.ts` - バランス設定
- 更新された`src/App.tsx` - 操作システム統合

### 🔄 デプロイ計画
1. 操作システム改善後即座にGitHubプッシュ
2. Vercel自動デプロイ
3. モバイル実機での操作感確認
4. バランス微調整とフィードバック反映

### 📝 実装タスク

#### 2.1 プレイヤーライフ・ヘルスシステム
```typescript
// 実装ファイル: src/types/game.types.ts
interface Player {
  health: number          // 現在HP
  maxHealth: number      // 最大HP  
  position: Position
  power: number          // 攻撃力
  weapons: WeaponType[]  // 武器種類
}

// 実装ファイル: src/hooks/usePlayer.ts
const usePlayer = () => {
  const takeDamage = (amount: number) => void
  const heal = (amount: number) => void
  const isDead = () => boolean
}
```

**実装手順:**
1. プレイヤーヘルス状態の追加
2. ダメージ処理ロジック
3. HP表示UI（画面上部）
4. 死亡判定とゲームオーバー

#### 2.2 パワーアップシステム
```typescript
// パワーアップアイテム定義
interface PowerUp {
  id: string
  type: PowerUpType
  position: Position
  collectMethod: 'shoot' | 'touch'
  effect: PowerUpEffect
}

enum PowerUpType {
  DAMAGE_UP = 'damage_up',
  MULTI_SHOT = 'multi_shot', 
  HEALTH = 'health',
  SHIELD = 'shield',
  DAMAGE_DOWN = 'damage_down' // 直接触れた場合
}
```

**実装手順:**
1. パワーアップアイテムの生成ロジック
2. 弾による撃破処理（正効果）
3. 直接接触処理（負効果）
4. 効果適用システム
5. 視覚的フィードバック

#### 2.3 改良されたUI
```typescript
// ゲーム状態管理
enum GameStatus {
  MENU = 'menu',
  PLAYING = 'playing', 
  PAUSED = 'paused',
  GAME_OVER = 'gameOver'
}
```

**実装手順:**
1. ポーズ機能とメニュー
2. ゲームオーバー画面
3. リスタート機能
4. スコア表示の強化

### 📊 成果物
- `src/components/Game/HealthBar.tsx`
- `src/components/Game/PowerUpSystem.tsx` 
- `src/components/Game/PauseMenu.tsx`
- `src/components/Game/GameOverScreen.tsx`
- `src/hooks/useGameState.ts`
- `src/hooks/usePowerUps.ts`

### 🔄 デプロイ計画
1. 機能完成後即座にGitHubプッシュ
2. Vercel自動デプロイ
3. 動作確認・バグ修正
4. 次フェーズ開始

---

## 🤖 Phase 3: 敵・AIシステム ✅ **完了**

### 🎯 実装目標
多様な敵タイプと行動パターンの実装

### 実装済み機能
- [x] **4種類の敵タイプ**
  - Basic: 直線移動、基本的な敵
  - Fast: ジグザグ移動、素早い敵
  - Tank: 高耐久・射撃可能、重装甲敵
  - Boss: サイン波移動・複数弾射撃、強力な敵
- [x] **AI移動パターンシステム**
  - Linear: 直線下降
  - Zigzag: ジグザグ移動
  - Sine Wave: サイン波移動
  - Circular: 円運動
  - Chase: プレイヤー追跡
- [x] **敵攻撃システム**
  - Tank・Bossタイプの射撃機能
  - 複数弾・拡散射撃
  - 敵弾とプレイヤーの衝突判定
- [x] **レベル対応スポーンシステム**
  - レベルに応じた敵タイプ出現率調整
  - 敵体力のレベル別スケーリング
- [x] **視覚的改善**
  - 敵タイプ別の専用グラフィック
  - ヘルスバー表示（Tank・Boss）
  - ダメージフラッシュ効果

### 📊 成果物
- `src/types/enemy.types.ts` - 敵タイプ定義
- `src/hooks/useEnemySystem.ts` - 敵管理システム
- `src/utils/enemyMovement.ts` - 移動パターンハンドラー
- `src/utils/enemyRenderer.ts` - 敵描画システム
- `src/utils/idGenerator.ts` - IDジェネレーター
- 更新された`src/App.tsx` - 新システム統合

### 🔧 修正済み事項
- [x] **敵撃破システムの修正**
  - Basic・Fast敵を1発で撃破可能に調整
  - Tank敵は3発、Boss敵は5発で撃破
  - 衝突判定ロジックの最適化
- [x] **ゲームオーバー条件の修正** 
  - 敵がプレイヤーエリア（画面下部80%）到達で即座にゲームオーバー
  - 専用の`checkGameOver`関数で最優先チェック
  - DANGER ZONE表示の追加とデバッグログ追加
- [x] **弾丸システムの修正**
  - 敵弾とプレイヤーの衝突判定改善
  - メモリリーク防止の配列操作修正
- [x] **ゲームループ処理順序の最適化**
  - ゲームオーバーチェックを最優先で実行
  - ゲームオーバー時は処理を即座に停止

### 🔄 デプロイ状況
- ✅ GitHub: 更新準備完了
- ⏳ Vercel: デプロイ待ち

---

## 🗄️ Phase 4: Redux・統計・実績システム ✅ **完了**

### 🎯 実装目標
状態管理の強化とハイスコアシステム

### 実装済み機能
- [x] **Redux Toolkit統合**
  - 状態管理の一元化
  - Redux Persistによるデータ永続化
  - TypeScript型安全性の確保
- [x] **拡張統計システム**
  - 詳細なセッション追跡（スコア、撃破数、生存時間、レベル）
  - 履歴データ（総ゲーム数、生涯統計、平均値）
  - パフォーマンス指標（効率評価、分間スコア）
- [x] **実績システム**
  - 10+種類の実績（スコア、生存、撃破、効率、特別）
  - リアルタイム実績解除通知
  - 実績永続化と表示
- [x] **UI拡張**
  - 拡張統計表示ダッシュボード
  - アニメーション付き実績通知システム
  - メニュー画面での包括的プレイヤー統計

### 📊 成果物
- `src/store/` - Redux Toolkit設定とスライス
- `src/types/gameStats.types.ts` - 統計型定義
- `src/hooks/useGameStats.ts` - 統計管理フック
- `src/components/Game/StatsDisplay.tsx` - 統計表示コンポーネント
- `src/components/Game/AchievementNotification.tsx` - 実績通知コンポーネント
- 更新された`src/App.tsx` - Redux統合
- 更新された`src/main.tsx` - Provider設定

### 🔄 デプロイ状況
- ✅ GitHub: 更新完了
- ✅ Vercel: 稼働中
- ✅ 動作確認: 完了

---

## 🎨 Phase 5: 視覚・音響効果システム ✅ **完了**

### 🎯 実装目標
Canvas APIベースの高性能エフェクトシステムとサウンド統合

### 実装済み機能
- [x] **パーティクルエフェクトシステム**
  - 爆発エフェクト（敵タイプ別強度調整）
  - マズルフラッシュ（射撃時）
  - パワーアップ収集エフェクト（良い/悪い効果別）
  - プレイヤーダメージエフェクト
  - 実績解除セレブレーション
- [x] **背景スターフィールド**
  - 動的スター生成・きらめきアニメーション
  - レベル対応背景スピード調整
  - パフォーマンス最適化されたライフサイクル管理
- [x] **Web Audio APIサウンドシステム**
  - プロシージャル音響生成（8種類の効果音）
  - 射撃音・爆発音・パワーアップ音・ダメージ音
  - 実績解除音・レベルアップ音・ゲームオーバー音
  - 敵タイプ別爆発音の強度調整
- [x] **スクリーンシェイクエフェクト**
  - Tank・Boss撃破時の大型シェイク
  - プレイヤーダメージ時のシェイク
  - エフェクト強度の動的調整
- [x] **音響管理システム**
  - 音量・ミュート設定の永続化
  - ブラウザ互換のユーザー操作ベース初期化
  - リアルタイム音響設定変更

### 📊 成果物
- `src/effects/ParticleSystem.ts` - パーティクルエンジン
- `src/effects/StarField.ts` - 背景スターフィールド
- `src/effects/VisualEffects.ts` - 視覚エフェクト管理
- `src/audio/AudioManager.ts` - Web Audio API管理
- `src/hooks/useVisualEffects.ts` - 視覚エフェクトReactフック
- `src/hooks/useAudioSystem.ts` - 音響システムReactフック
- 更新された`src/App.tsx` - 完全統合

### 🔧 **重要な修正事項（2025/06/14）**

#### **第1回修正: 視覚エフェクト描画順序**
- [x] **🚨 敵表示バグ修正**
  - **問題**: 2回目のゲームから敵が見えなくなる問題
  - **原因**: 視覚エフェクトの描画順序が不正（パーティクルが敵の前面に描画）
  - **解決**: `VisualEffects.render()`を`renderBackground()`と`renderParticles()`に分離
  - **修正ファイル**: `src/effects/VisualEffects.ts`, `src/hooks/useVisualEffects.ts`, `src/App.tsx`
  - **修正内容**: 
    ```typescript
    // 修正前: 全エフェクトが一括描画（バグ）
    visualEffects.renderEffects(ctx) // ゲームオブジェクトより前に描画
    
    // 修正後: 適切な描画順序
    visualEffects.renderBackground(ctx) // 背景のみ（ゲームオブジェクトより前）
    // ... ゲームオブジェクト描画 ...
    visualEffects.renderParticles(ctx)  // パーティクルのみ（ゲームオブジェクトより後）
    ```

- [x] **📱 モバイルUI最適化**
  - **問題**: スマートフォンでゲーム統計がゲーム画面に被る可能性
  - **解決**: レスポンシブ`CompactStatsDisplay`コンポーネント作成
  - **機能**: 
    - デスクトップ: 従来通りの詳細表示
    - モバイル: コンパクトな1行表示 + 展開可能な詳細情報
    - 画面幅768px以下で自動切り替え
  - **新規ファイル**: `src/components/Game/CompactStatsDisplay.tsx`
  - **修正ファイル**: `src/App.tsx` - `StatsDisplay`から`CompactStatsDisplay`に変更

#### **第2回修正: ゲームシステム簡素化**
- [x] **🎯 ゲームオーバー仕組み見直し**
  - **問題**: HPシステムが不要（敵エリア到達でゲームオーバーのため）
  - **解決**: HPシステム完全削除、シンプルなゲームオーバー条件に統一
  - **削除内容**:
    - `HealthBar`コンポーネントの表示削除
    - プレイヤーと敵の衝突判定削除
    - プレイヤーと敵弾の衝突判定削除  
    - プレイヤー無敵時間ロジック削除
    - HP死亡判定削除
  - **残存ゲームオーバー条件**: 敵がプレイヤーエリア到達のみ

- [x] **🚨 敵表示バグ再発修正**
  - **問題**: 何回かゲームを繰り返すと敵キャラが再び消失
  - **原因**: 敵レンダラーの初期化タイミング問題
  - **解決**: 
    - ゲーム開始時に敵レンダラーを強制リセット
    - 敵描画ループで確実な再初期化処理
    - デバッグ用敵数表示の追加
  - **修正内容**:
    ```typescript
    // ゲーム開始時に敵レンダラーリセット
    startGame() {
      enemyRenderer.current = null  // 強制リセット
    }
    
    // 描画ループで確実な初期化
    if (!enemyRenderer.current) {
      enemyRenderer.current = new EnemyRenderer(ctx)
    }
    ```

#### **第3回修正: スマホゲームバランス調整**
- [x] **📱 難易度バランス見直し**
  - **問題**: スマホでゲームが簡単すぎる
  - **解決**: 全体的な難易度上昇とバランス調整
  - **調整内容**:
    - レベルアップ条件: 10体 → 8体撃破
    - 敵スポーン間隔: 1.5秒 → 1.2秒（基本）、0.7秒 → 0.5秒（最小）
    - 敵基本速度: 1.5 → 2.0、最大速度: 3.5 → 4.0
    - 難易度上昇率: より急激な難易度カーブに調整
    - レベル1-5: スポーン間隔減少120ms/レベル、速度増加0.3/レベル
    - レベル6-10: スポーン間隔減少80ms/レベル、速度増加0.3/レベル

- [x] **🎮 UI/UX改善**
  - **問題**: ポーズボタンが画面上部で操作しにくい
  - **解決**: ポーズボタンを右下に移動、円形デザインに変更
  - **改善内容**:
    - 位置: 右上 → 右下
    - デザイン: 角丸長方形 → 円形ボタン
    - サイズ: 50x50px、影付きで視認性向上
    - スマホでの親指操作に最適化

- [x] **🔍 デバッグ機能強化**
  - **追加**: 撃破数カウンターとレベル表示の追加
  - **表示内容**: 敵数、撃破数、現在レベル
  - **目的**: ゲームバランス確認とデバッグ支援

#### **第4回修正: 永続ゲーム防止・最終バランス調整**
- [x] **🗑️ 不要機能削除**
  - **問題**: デバッグ表示（左下3列）が本番環境に残存
  - **解決**: プロダクション版でデバッグ表示を完全削除
  - **問題**: 撃破数カウンターが正常動作せず、スコアで代用可能
  - **解決**: 撃破数統計更新ロジックを削除、スコアベースのみに統一

- [x] **⏰ 時間ベース難易度システム実装**
  - **問題**: 時間経過で難易度が上がらず永続ゲームが可能
  - **解決**: 時間ベース難易度調整システムを追加実装
  - **仕組み**:
    - 20秒ごとに難易度レベルアップ
    - 敵スポーン間隔: 80ms短縮/レベル
    - 敵速度: 0.25倍増加/レベル
    - 最大15レベル（5分で最高難易度到達）
  - **統合システム**: 撃破レベル + 時間レベルの複合難易度計算

- [x] **🎯 ゲームバランス最適化**
  - **目標**: スマホで1-3分程度でゲームオーバーになる適切な難易度
  - **調整内容**:
    - 時間間隔: 30秒 → 20秒（より頻繁な難易度調整）
    - スポーン間隔短縮: 50ms → 80ms（より厳しく）
    - 速度増加: 0.15 → 0.25（より厳しく）
  - **結果**: 永続ゲーム完全防止、適切なゲーム時間に調整

#### **第5回修正: シンプル時間ベース難易度システム（2025/06/15）**
- [x] **🚨 複雑な難易度システム全廃**
  - **問題**: 複雑な難易度計算が正常に動作せず、開始時から大量の敵が出現
  - **解決**: 撃破・レベルシステムを完全削除し、純粋な時間ベース調整に変更
  - **削除内容**:
    - `getFinalDifficultyParams`関数の削除
    - 撃破レベル影響の削除
    - レベルアップシステムの削除
    - 複雑な難易度計算ロジックの削除

- [x] **📊 新シンプル難易度システム**
  - **方式**: 30秒毎の段階的時間ベース調整のみ
  - **実装**:
    ```typescript
    // シンプルな時間ベース難易度調整（30秒毎に段階的上昇）
    const survivalTime = Math.floor(gameState.time / 1000)
    let spawnInterval = 1000 // 基本1秒
    
    if (survivalTime >= 120) {
      spawnInterval = 200 // 2分以降: 0.2秒に1体
    } else if (survivalTime >= 90) {
      spawnInterval = 400 // 1分30秒以降: 0.4秒に1体
    } else if (survivalTime >= 60) {
      spawnInterval = 600 // 1分以降: 0.6秒に1体
    } else if (survivalTime >= 30) {
      spawnInterval = 800 // 30秒以降: 0.8秒に1体
    }
    ```
  - **難易度進行**:
    - **0〜29秒**: 1000ms間隔（1秒に1体）
    - **30〜59秒**: 800ms間隔（0.8秒に1体）
    - **60〜89秒**: 600ms間隔（0.6秒に1体）
    - **90〜119秒**: 400ms間隔（0.4秒に1体）
    - **120秒以降**: 200ms間隔（0.2秒に1体）

### 🔄 デプロイ状況
- ✅ GitHub: 更新完了
- ✅ Vercel: 稼働中
- ✅ 動作確認: 完了
- ✅ **バグ修正**: 完了（敵表示 + モバイルUI）

---

## 📱 Phase 6: PWA機能

### 🎯 実装目標
本格的なPWAアプリケーション化

### 📝 実装タスク

#### 6.1 Service Worker
```typescript
// public/sw.js
const CACHE_NAME = 'mobile-last-war-v2'
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css'
]
```

#### 6.2 Web App Manifest
```json
{
  "name": "Mobile Last War",
  "short_name": "LastWar",
  "display": "fullscreen",
  "orientation": "portrait"
}
```

#### 6.3 設定機能
- グラフィック品質調整
- 音量設定
- 操作設定
- デバッグ表示

### 🔄 デプロイ: 即座

---

## ⚡ Phase 7: 最適化・品質向上

### 🎯 実装目標
パフォーマンス最適化とテスト実装

### 📝 実装タスク

#### 7.1 パフォーマンス最適化
```typescript
// オブジェクトプーリング
class ObjectPool<T> {
  private pool: T[] = []
  acquire(): T
  release(obj: T): void
}

// メモリ監視
class MemoryMonitor {
  trackUsage(): number
  cleanupIfNeeded(): void
}
```

#### 7.2 テスト実装
```bash
npm install --save-dev vitest @testing-library/react jsdom
```

#### 7.3 品質向上
- ESLint/Prettier設定強化
- TypeScript strict mode
- アクセシビリティ対応

### 🔄 デプロイ: 即座

---

## 📅 実装スケジュール

| フェーズ | 期間 | 主要成果物 | デプロイ |
|---------|------|-----------|---------|
| Phase 1 | ✅ 完了 | 基本ゲーム | ✅ 稼働中 |
| Phase 2 | ✅ 完了 | ヘルス・パワーアップ・UI | ✅ 稼働中 |
| Phase 2.5 | ✅ 完了 | 操作改善・難易度調整 | ✅ 稼働中 |
| Phase 3 | ✅ 完了 | 敵AIシステム | ✅ 稼働中 |
| Phase 4 | ✅ 完了 | Redux・統計・実績システム | ✅ 稼働中 |
| Phase 5 | ✅ 完了 | 視覚・音響エフェクトシステム | ✅ 稼働中 |
| Phase 6 | 📋 **次回実装** | PWA機能・設定 | 即座 |
| Phase 7 | 1週間 | 最適化・テスト | 即座 |

## 🎯 次回実装（Phase 2.5）の詳細計画

### 即座に開始するタスク

#### Task 2.5.1: プレイヤー操作制限（優先度: 高）
```typescript
// 1. プレイヤーY座標固定
const PLAYER_Y_RATIO = 0.8 // 画面下部20%エリア
const fixedY = canvas.height * PLAYER_Y_RATIO

// 2. 左右移動のみ許可
const handleTouch = (e: TouchEvent) => {
  const x = touch.clientX - rect.left
  const newX = Math.max(0, Math.min(canvas.width - 40, x - 20))
  player.updatePosition({ x: newX, y: fixedY })
}
```

#### Task 2.5.2: 自動連射システム（優先度: 高）
```typescript
// 1. 連射間隔計算
const getFireInterval = (power: number): number => {
  return Math.max(100, 200 - (power - 10) * 10)
}

// 2. 自動射撃実装
const autoFire = (currentTime: number) => {
  if (currentTime - lastShot > getFireInterval(player.power)) {
    createBullet()
    lastShot = currentTime
  }
}
```

#### Task 2.5.3: 難易度バランス調整（優先度: 中）
```typescript
// 1. レベル別パラメータ
const getDifficulty = (level: number) => ({
  spawnInterval: Math.max(700, 1500 - level * 80),
  enemySpeed: Math.min(3.5, 1.5 + level * 0.2)
})
```

### 📝 実装チェックリスト

#### Phase 2 開始前確認項目
- [ ] 現在のコードをGitHubにコミット
- [ ] Phase 2ブランチ作成
- [ ] 実装計画の最終確認

#### Phase 2 完了条件
- [ ] プレイヤーHP表示・管理
- [ ] ダメージ処理
- [ ] ゲームオーバー画面
- [ ] パワーアップシステム
- [ ] ポーズ機能
- [ ] 動作テスト完了
- [ ] Vercelデプロイ成功

---

**策定者**: 開発チーム  
**策定日**: 2025/01/14  
**承認**: プロジェクトリーダー  
**次回更新**: Phase 2完了時