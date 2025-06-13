# GitHubリポジトリ作成とデプロイ手順

## 1. GitHubリポジトリ作成

以下のコマンドを実行してください：

```bash
# プロジェクトディレクトリに移動
cd mobile-last-war-v2

# Gitリポジトリ初期化
git init

# ファイルをステージング
git add .

# 初回コミット
git commit -m "🎮 Initial commit: Mobile Last War v2 - Working shooting game

✨ Features:
- Touch/click controls for mobile
- Player spaceship (triangle)
- Enemy spawning (inverted triangles)
- Bullet shooting system
- Collision detection
- Score system
- Mobile-responsive design

🛠️ Tech Stack:
- React 19 + TypeScript
- Vite build tool
- Canvas 2D API
- Mobile-first design

🎯 Ready for deployment on Vercel"

# GitHubでリモートリポジトリ作成（GitHub CLIが必要）
gh repo create mobile-last-war-v2 --public --description "スマートフォン向けシューティングゲーム - Mobile Last War v2"

# リモートリポジトリにプッシュ
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mobile-last-war-v2.git
git push -u origin main
```

## 2. Vercelデプロイ

```bash
# Vercelにデプロイ
npx vercel --prod

# または手動でVercelダッシュボードから：
# 1. https://vercel.com にアクセス
# 2. "Import Project" をクリック
# 3. GitHubリポジトリ "mobile-last-war-v2" を選択
# 4. Framework: "Vite" を選択
# 5. Deploy をクリック
```

## 3. 自動デプロイ設定

GitHubにプッシュするたびに自動デプロイされます。

---

**注意**: `YOUR_USERNAME` を実際のGitHubユーザー名に変更してください。