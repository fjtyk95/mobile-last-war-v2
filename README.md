# Mobile Last War

スマートフォン向けシューティングゲーム - 敵を撃破してハイスコアを目指そう！

## 🎮 ゲーム概要

Mobile Last Warは、ブラウザで遊べるスマートフォン向けシューティングゲームです。敵を撃破してパワーアップアイテムを集め、最高スコアを目指しましょう！

### 🎯 ゲームの特徴

- **モバイル最適化**: タッチ操作に最適化されたコントロール
- **PWA対応**: アプリのようにインストール可能
- **オフライン対応**: インターネット接続なしでもプレイ可能
- **パワーアップシステム**: 敵を撃破してアイテムを出現させ、弾で撃破して強化
- **リスク＆リワード**: アイテムに直接触ると攻撃力が下がるので注意！

### 🕹️ 操作方法

- **移動**: 画面をタッチして指を動かす
- **射撃**: 自動射撃（常に弾を発射）
- **ポーズ**: 画面左上のポーズボタン

### 🎯 ゲームシステム

1. **基本ルール**
   - 敵を撃破してスコアを獲得
   - 敵に触れるか弾に当たるとダメージ
   - HPが0になるとゲームオーバー

2. **パワーアップ**
   - 敵を撃破するとパワーアップアイテムが出現
   - **弾で撃破**: 攻撃力アップ、連射数アップ、HP回復、シールド
   - **直接触る**: 攻撃力ダウン（リスク）

3. **敵の種類**
   - **Basic**: 基本的な敵
   - **Fast**: 高速移動する敵
   - **Tank**: 耐久力の高い敵
   - **Boss**: 強力なボス敵

## 🛠️ 技術仕様

### フロントエンド
- **React 18** + **TypeScript**: UIフレームワーク
- **PixiJS 7.x**: WebGL/Canvas 2Dゲームレンダリング
- **Redux Toolkit**: ステート管理
- **Vite**: ビルドツール

### ゲームエンジン
- **Entity Component System**: スケーラブルなゲームアーキテクチャ
- **60FPS固定タイムステップ**: 安定したゲームループ
- **オブジェクトプーリング**: パフォーマンス最適化
- **物理演算**: 衝突判定とリジッドボディ

### PWA機能
- **Service Worker**: キャッシング戦略
- **Web App Manifest**: アプリ的体験
- **オフライン対応**: ネットワーク不要でプレイ可能
- **インストール可能**: ホーム画面に追加可能

## 🚀 開発・デプロイ

### 必要な環境
```bash
Node.js 18+
npm 8+
```

### 開発サーバー起動
```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev
```

### ビルド
```bash
# プロダクションビルド
npm run build

# プレビュー
npm run preview
```

### テスト
```bash
# ユニットテスト実行
npm run test

# E2Eテスト実行
npm run test:e2e
```

## 📱 PWA機能

### インストール
1. Chromeでサイトにアクセス
2. アドレスバーの「インストール」ボタンをクリック
3. または「メニュー」→「アプリをインストール」

### 機能
- **オフライン対応**: インターネット接続なしでもプレイ可能
- **ホーム画面追加**: アプリのようにアクセス可能
- **全画面表示**: 没入感のあるゲーム体験
- **自動更新**: 新しいバージョンが自動で適用

## 🎮 ゲームプレイのコツ

1. **パワーアップアイテムは弾で撃破する**
   - 直接触ると攻撃力が下がってしまいます
   - 弾で撃破すると様々な強化効果が得られます

2. **敵の動きパターンを覚える**
   - Basic: 直線移動
   - Fast: ジグザグ移動
   - Tank: ゆっくりだが耐久力が高い
   - Boss: 特殊な攻撃パターン

3. **位置取りが重要**
   - 画面端に追い詰められないよう注意
   - 敵の弾を避けながら反撃のタイミングを計る

4. **レベルが上がると難易度アップ**
   - 敵の数と速度が増加
   - より高度な戦略が必要

## 📊 スコアシステム

- **敵撃破**: 敵の種類に応じてスコア獲得
- **パワーアップ**: アイテム取得でボーナススコア
- **生存時間**: 長時間生き残るほど高スコア
- **コンボ**: 連続撃破でスコア倍率アップ

## 🏆 実績・評価

最終スコアに応じて評価が決定されます：

- **🌟 LEGENDARY**: 10,000点以上
- **🔥 EXCELLENT**: 5,000点以上
- **👍 GOOD**: 2,000点以上
- **👌 DECENT**: 1,000点以上
- **🎯 BEGINNER**: 1,000点未満

## 🔧 カスタマイズ

設定から以下をカスタマイズ可能：

- **グラフィック品質**: パフォーマンスに応じて調整
- **サウンド設定**: 効果音・BGMの音量調整
- **操作設定**: タッチ感度の調整
- **デバッグ表示**: FPS・デバッグ情報の表示

## 📈 パフォーマンス最適化

- **60FPS維持**: 安定したフレームレート
- **メモリ管理**: オブジェクトプーリングによる最適化
- **自動品質調整**: デバイスに応じた設定の自動調整
- **バッテリー配慮**: 効率的な描画処理

## 🤝 コントリビューション

1. リポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Requestを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🙏 謝辞

- **PixiJS**: 高性能な2Dレンダリング
- **React**: モダンなUIフレームワーク
- **Redux Toolkit**: 効率的なステート管理
- **Vite**: 高速なビルドツール

---

**🎮 Mobile Last War で最高のシューティング体験をお楽しみください！**
