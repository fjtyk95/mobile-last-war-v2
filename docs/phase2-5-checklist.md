# Phase 2.5: 操作システム改善 - 実装チェックリスト

## 🎯 Phase 2.5 概要
プレイヤー操作を画面下部の左右移動のみに変更し、自動連射システムを導入してより直感的なゲームプレイを実現する。

## ✅ 開始前準備

### 環境準備
- [ ] 現在のコードをコミット・プッシュ
- [ ] `git checkout -b phase2-5-controls` でブランチ作成
- [ ] ローカル開発環境の動作確認（`npm run dev`）

### 設計確認
- [ ] 更新された要件定義書の確認
- [ ] 操作仕様の詳細確認
- [ ] 難易度バランス設計の確認

---

## 🕹️ Task 2.5.1: プレイヤー操作システム改善

### 2.5.1.1 プレイヤー位置制限
- [ ] プレイヤーY座標を画面下部20%エリアに固定
  ```typescript
  // 画面下部固定位置の計算
  const PLAYER_AREA_RATIO = 0.2 // 画面下部20%
  const playerY = canvas.height * (1 - PLAYER_AREA_RATIO)
  ```

### 2.5.1.2 移動制御の変更
- [ ] 上下移動を完全に無効化
- [ ] 左右移動のみに制限
- [ ] タッチ位置のX座標のみを使用した移動
  ```typescript
  const handleTouch = (e: TouchEvent) => {
    const touch = e.touches[0]
    const rect = canvas.getBoundingClientRect()
    const x = touch.clientX - rect.left
    
    // Y座標は固定、X座標のみ更新
    const newX = Math.max(0, Math.min(canvas.width - 40, x - 20))
    const fixedY = canvas.height * 0.8 - 20 // 下部固定
    player.updatePosition({ x: newX, y: fixedY })
  }
  ```

### 2.5.1.3 操作感の最適化
- [ ] タッチ応答性の向上
- [ ] スムーズな左右移動
- [ ] 画面外タッチの処理改善

### 🧪 テスト項目
- [ ] プレイヤーが画面下部に固定される
- [ ] 左右移動が正常に動作する
- [ ] 上下移動が無効化されている
- [ ] 画面外タッチが適切に処理される

---

## 🔫 Task 2.5.2: 自動連射システム

### 2.5.2.1 連射タイマーの実装
- [ ] 独立した連射タイマーの作成
- [ ] 攻撃力に応じた連射間隔の調整
  ```typescript
  const getFireRate = (power: number): number => {
    const baseInterval = 200 // 基本200ms
    const minInterval = 100  // 最小100ms
    const reduction = Math.floor((power - 10) / 5) * 20
    return Math.max(minInterval, baseInterval - reduction)
  }
  ```

### 2.5.2.2 自動射撃の実装
- [ ] ゲームループ内での自動射撃処理
- [ ] 手動射撃システムの削除
- [ ] 連射音エフェクト準備（Phase 5で実装）

### 2.5.2.3 弾丸生成の最適化
- [ ] 連射による弾丸数増加への対応
- [ ] 画面外弾丸の早期削除
- [ ] メモリ効率の改善

### 🧪 テスト項目
- [ ] 自動連射が正常に動作する
- [ ] 攻撃力上昇で連射間隔が短縮される
- [ ] 手動射撃が無効化されている
- [ ] 弾丸数の管理が適切に行われている

---

## ⚖️ Task 2.5.3: 難易度バランス調整

### 2.5.3.1 敵出現システムの調整
- [ ] レベル別敵出現間隔の実装
  ```typescript
  const getEnemySpawnInterval = (level: number): number => {
    if (level <= 5) {
      return 1500 - (level - 1) * 100 // 1.5秒→1.0秒
    } else if (level <= 10) {
      return 1000 - (level - 5) * 60  // 1.0秒→0.7秒
    } else {
      return 700 // 最高難易度固定
    }
  }
  ```

### 2.5.3.2 敵移動速度の調整
- [ ] レベル別速度スケーリング
- [ ] 最大速度の制限設定
- [ ] プレイヤー反応時間の考慮

### 2.5.3.3 パワーアップバランス
- [ ] 攻撃力上昇値の調整（+5 → +3に変更）
- [ ] パワーアップ出現率の微調整
- [ ] 負効果（接触ペナルティ）の調整

### 2.5.3.4 スコアシステム改善
- [ ] レベル倍率の実装
- [ ] 生存時間ボーナスの追加
- [ ] ハイスコア更新の改善

### 🧪 テスト項目
- [ ] レベル1-5の難易度が適切に上昇する
- [ ] レベル6-10で明確な難易度増加を感じる
- [ ] レベル11+で最高難易度が維持される
- [ ] スコアバランスが適切に調整されている

---

## 📱 Task 2.5.4: モバイル操作最適化

### 2.5.4.1 タッチエリアの最適化
- [ ] 画面下部専用のタッチエリア設定
- [ ] 誤タッチ防止の実装
- [ ] タッチ感度の調整

### 2.5.4.2 視覚的フィードバック
- [ ] プレイヤー移動軌跡の表示（オプション）
- [ ] タッチポイントの可視化
- [ ] 操作ガイドの表示

### 2.5.4.3 デバイス対応
- [ ] 様々な画面サイズでの動作確認
- [ ] 縦画面専用レイアウトの確認
- [ ] 異なるアスペクト比での調整

### 🧪 テスト項目
- [ ] iPhone SE, iPhone 14, iPhone 14 Proで正常動作
- [ ] Android（Pixel, Galaxy）で正常動作
- [ ] iPad等タブレットで適切な表示
- [ ] 横画面時の適切な処理

---

## 🎨 Task 2.5.5: UI表示の調整

### 2.5.5.1 操作説明の更新
- [ ] メニュー画面の説明文更新
- [ ] 操作方法の視覚的ガイド追加
- [ ] 自動連射の説明追加

### 2.5.5.2 ゲーム情報表示
- [ ] 連射速度の可視化
- [ ] レベル進行の明確化
- [ ] 難易度変化の通知

### 🧪 テスト項目
- [ ] 新しい操作方法が分かりやすく説明されている
- [ ] ゲーム進行が視覚的に理解できる
- [ ] UI要素が適切に配置されている

---

## 🔄 統合・テスト・デプロイ

### 統合テスト
- [ ] 全新機能の連携動作確認
- [ ] パフォーマンステスト（60FPS維持）
- [ ] 長時間プレイテスト（10分以上）
- [ ] 様々なスキルレベルでのプレイテスト

### バランステスト
- [ ] 初心者プレイテスト（30秒生存確認）
- [ ] 中級者プレイテスト（2分生存確認）
- [ ] 上級者プレイテスト（5分以上の挑戦性確認）

### デプロイ準備
- [ ] ビルドエラー確認（`npm run build`）
- [ ] 本番環境動作確認
- [ ] コード整理・コメント追加

### GitHubプッシュ
- [ ] コミットメッセージ作成
  ```bash
  git add .
  git commit -m "🕹️ Phase 2.5: Controls and difficulty optimization
  
  ✨ Major Changes:
  - Player movement restricted to bottom area horizontal only
  - Automatic continuous shooting system
  - Level-based difficulty scaling with proper balance
  - Mobile-optimized touch controls
  
  🎮 Gameplay Improvements:
  - More intuitive single-finger controls
  - Focus on dodging and positioning strategy
  - Gradual difficulty curve from 30s to 5min+ gameplay
  - Balanced power-up risk/reward system
  
  ⚖️ Balance Adjustments:
  - Enemy spawn intervals: 1.5s→0.7s over levels
  - Fire rate scaling with power (200ms→100ms)
  - Power-up values rebalanced for new gameplay
  
  📱 Mobile Optimizations:
  - Touch area restricted to game area
  - Improved responsiveness for mobile devices
  - Better visual feedback for player actions"
  ```
- [ ] mainブランチにマージ
- [ ] Vercel自動デプロイ確認

### リリース後確認
- [ ] 本番環境での操作確認
- [ ] モバイル実機テスト
- [ ] ユーザビリティ改善確認
- [ ] パフォーマンス安定性確認

---

## 📊 Phase 2.5 完了判定基準

### 必須機能（全て完了必要）
- [ ] プレイヤーが画面下部左右移動のみ
- [ ] 自動連射システム完全動作
- [ ] レベル別難易度スケーリング実装
- [ ] モバイル操作感の大幅改善

### 品質基準
- [ ] 60FPS安定動作
- [ ] 30秒-5分の適切な難易度カーブ
- [ ] 直感的で快適な操作感
- [ ] バグ0件での動作

### ユーザビリティ基準
- [ ] 3秒以内に操作方法が理解できる
- [ ] 片手での快適な操作が可能
- [ ] 集中力を要する適度な緊張感
- [ ] 明確な進歩感とリプレイ意欲

---

## 🎯 Phase 3移行条件

Phase 2.5の全チェック項目完了後、Phase 3（敵・AIシステム）の実装を開始する。

**Phase 2.5完了予定**: 1週間以内  
**次回フェーズ**: Phase 3 - 敵・AIシステム  

---

**作成日**: 2025/01/14  
**更新予定**: Phase 2.5完了時