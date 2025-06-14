# Phase 2: ゲームシステム拡張 - 実装チェックリスト

## 🎯 Phase 2 概要
READMEに記載されたゲームルールを完全実装し、本格的なシューティングゲームとして完成させる。

## ✅ 開始前準備

### 環境準備
- [ ] 現在のコードをコミット・プッシュ
- [ ] `git checkout -b phase2-game-systems` でブランチ作成
- [ ] ローカル開発環境の動作確認（`npm run dev`）

### 設計確認
- [ ] 要件定義書の確認
- [ ] 設計書の確認  
- [ ] 実装計画の確認

---

## 🩺 Task 2.1: プレイヤーヘルスシステム

### 2.1.1 型定義とインターフェース
- [ ] `src/types/game.types.ts` 作成
  ```typescript
  interface PlayerState {
    health: number
    maxHealth: number
    position: Position
    power: number
    weapons: WeaponType[]
  }
  
  interface Position {
    x: number
    y: number
  }
  ```

### 2.1.2 プレイヤー状態管理
- [ ] `src/hooks/usePlayer.ts` 作成
  ```typescript
  const usePlayer = () => {
    const [health, setHealth] = useState(100)
    const [maxHealth] = useState(100)
    
    const takeDamage = (amount: number) => void
    const heal = (amount: number) => void  
    const isDead = () => boolean
    
    return { health, maxHealth, takeDamage, heal, isDead }
  }
  ```

### 2.1.3 ヘルスバーUI
- [ ] `src/components/Game/HealthBar.tsx` 作成
  ```typescript
  interface HealthBarProps {
    health: number
    maxHealth: number
  }
  ```
- [ ] HP表示（数値 + バー）
- [ ] ダメージ時の視覚エフェクト（赤色点滅）
- [ ] HP低下時の警告表示

### 2.1.4 ダメージ処理
- [ ] 敵との衝突判定
- [ ] 敵弾との衝突判定  
- [ ] ダメージ量の計算
- [ ] 無敵時間の実装

### 🧪 テスト項目
- [ ] HPが正しく減少する
- [ ] HP0でゲームオーバーになる
- [ ] ヘルスバーが正確に表示される
- [ ] 無敵時間が機能する

---

## 🎮 Task 2.2: ゲームオーバーシステム

### 2.2.1 ゲーム状態管理
- [ ] ゲーム状態enum定義
  ```typescript
  enum GameStatus {
    MENU = 'menu',
    PLAYING = 'playing',
    PAUSED = 'paused', 
    GAME_OVER = 'gameOver'
  }
  ```

### 2.2.2 ゲームオーバー画面
- [ ] `src/components/Game/GameOverScreen.tsx` 作成
- [ ] 最終スコア表示
- [ ] ハイスコア表示
- [ ] プレイ統計（生存時間、撃破数等）
- [ ] リスタートボタン
- [ ] メニューに戻るボタン

### 2.2.3 ゲーム状態遷移
- [ ] プレイ中 → ゲームオーバー
- [ ] ゲームオーバー → リスタート
- [ ] ゲームオーバー → メニュー

### 🧪 テスト項目
- [ ] HP0で確実にゲームオーバーになる
- [ ] スコアが正しく表示される
- [ ] リスタートボタンが機能する

---

## ⚡ Task 2.3: パワーアップシステム

### 2.3.1 パワーアップ型定義
- [ ] パワーアップタイプ定義
  ```typescript
  enum PowerUpType {
    DAMAGE_UP = 'damage_up',
    MULTI_SHOT = 'multi_shot',
    HEALTH = 'health', 
    SHIELD = 'shield',
    DAMAGE_DOWN = 'damage_down'
  }
  
  interface PowerUp {
    id: string
    type: PowerUpType
    position: Position
    value: number
  }
  ```

### 2.3.2 パワーアップ管理
- [ ] `src/hooks/usePowerUps.ts` 作成
- [ ] パワーアップ生成ロジック
- [ ] 画面内管理
- [ ] 効果適用システム

### 2.3.3 パワーアップ取得処理
- [ ] **弾による撃破** → 正の効果
  - ダメージアップ
  - 連射数アップ  
  - HP回復
  - シールド付与
- [ ] **直接接触** → 負の効果
  - ダメージダウン

### 2.3.4 視覚的表現
- [ ] パワーアップアイテムの描画
- [ ] 取得時のエフェクト
- [ ] 効果の視覚的フィードバック

### 🧪 テスト項目
- [ ] アイテムが適切に生成される
- [ ] 弾で撃破すると正効果
- [ ] 直接触れると負効果
- [ ] 効果が正しく適用される

---

## ⏸️ Task 2.4: ポーズ機能

### 2.4.1 ポーズUI
- [ ] `src/components/Game/PauseMenu.tsx` 作成
- [ ] ポーズボタン（画面左上）
- [ ] ポーズメニュー（再開、リスタート、設定、終了）

### 2.4.2 ポーズ処理
- [ ] ゲームループの一時停止
- [ ] 入力処理の制御
- [ ] 音声の一時停止

### 🧪 テスト項目
- [ ] ポーズボタンで確実に一時停止
- [ ] 再開ボタンで正常に復帰
- [ ] ポーズ中は敵・弾丸が停止

---

## 🎨 Task 2.5: UI/UX改善

### 2.5.1 スコア表示強化
- [ ] リアルタイムスコア更新
- [ ] スコア獲得時のエフェクト
- [ ] コンボシステムの表示

### 2.5.2 レスポンシブ対応強化
- [ ] さまざまな画面サイズでのテスト
- [ ] タッチ操作の最適化
- [ ] 縦画面専用レイアウト

### 🧪 テスト項目
- [ ] 各種デバイスサイズで正常表示
- [ ] タッチ操作が快適
- [ ] UIが見やすい

---

## 🔄 統合・テスト・デプロイ

### 統合テスト
- [ ] 全機能の連携動作確認
- [ ] パフォーマンステスト（60FPS維持）
- [ ] メモリリーク確認
- [ ] 長時間プレイテスト

### デプロイ準備
- [ ] ビルドエラー確認（`npm run build`）
- [ ] 本番環境動作確認
- [ ] コード整理・コメント追加

### GitHubプッシュ
- [ ] コミットメッセージ作成
  ```bash
  git add .
  git commit -m "🎮 Phase 2: Core game systems implementation
  
  ✨ Features:
  - Player health system with damage/healing
  - Game over screen with restart functionality  
  - Power-up system (shoot vs touch mechanics)
  - Pause menu and game state management
  - Enhanced UI/UX with responsive design
  
  🎯 Game Rules:
  - HP system with visual health bar
  - Risk/reward power-up mechanics
  - Proper game over/restart flow
  
  🧪 Tested:
  - All new features working correctly
  - 60FPS performance maintained
  - Mobile touch controls optimized"
  ```
- [ ] mainブランチにマージ
- [ ] Vercel自動デプロイ確認

### リリース後確認
- [ ] 本番環境動作テスト
- [ ] モバイル実機テスト
- [ ] パフォーマンス確認
- [ ] ユーザビリティ確認

---

## 📊 Phase 2 完了判定基準

### 必須機能（全て完了必要）
- [x] プレイヤーヘルスシステム動作
- [x] ダメージ処理・ゲームオーバー
- [x] パワーアップシステム（撃破 vs 接触）
- [x] ポーズ・リスタート機能
- [x] UI改善・レスポンシブ対応

### 品質基準
- [x] 60FPS安定動作
- [x] モバイル快適操作
- [x] バグ0件
- [x] 5分以上連続プレイ可能

### デプロイ基準
- [x] ビルド成功
- [x] Vercelデプロイ成功  
- [x] 本番環境動作確認
- [x] モバイル実機確認

---

## 🎯 Phase 3移行条件

Phase 2の全チェック項目完了後、Phase 3（敵・AIシステム）の実装を開始する。

**Phase 2完了予定**: 1-2週間以内  
**次回フェーズ**: Phase 3 - 敵・AIシステム  

---

**作成日**: 2025/01/14  
**更新予定**: Phase 2完了時