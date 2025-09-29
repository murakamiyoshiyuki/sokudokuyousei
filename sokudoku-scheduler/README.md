# 速読インストラクター養成生 調整サイト

速読インストラクター養成生同士のレッスン練習（1コマ=60分）の日程調整を、一覧表示とワンクリック予約で完結させるWebアプリケーションです。

## 特徴

- **ログイン不要**: URLを知っている人だけがアクセス可能なクローズドURL方式
- **シンプルな操作**: 提供枠の登録、予約、取消がワンクリックで完了
- **リアルタイム更新**: 予約状況はリアルタイムで反映
- **表示切替**: 表形式とカレンダー形式を自由に切り替え可能
- **セキュアな取消**: 各登録時に発行される取消用URLでのみキャンセル可能

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router), React 19, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **データベース**: Supabase (PostgreSQL)
- **カレンダー**: React Big Calendar
- **その他**: React Hook Form, Zod, date-fns

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local.example` を `.env.local` にコピーして、Supabaseの情報を設定します：

```bash
cp .env.local.example .env.local
```

`.env.local` を編集：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Supabaseプロジェクトのセットアップ

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. SQL Editorで `supabase/migrations/001_initial_schema.sql` の内容を実行
3. プロジェクトのURL と anon key を `.env.local` に設定

### 4. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリケーションが起動します。

## 使い方

### イベント作成

1. トップページの「新規イベントを作成」ボタンをクリック
2. イベント名、説明、募集期間などを入力
3. 作成完了後、表示用URLを参加者に共有
4. 編集用URLは秘密に保管

### 提供枠の登録

1. イベントページの「提供枠を追加」ボタンをクリック
2. 提供者名、日時、メモを入力
3. 登録完了後、取消用URLを保管

### 予約

1. 一覧から空き枠を選択
2. 受講者名と連絡先（任意）を入力
3. 予約完了後、取消用URLを保管

### 取消

- 取消用URLにアクセスして、取消を確定

## ディレクトリ構造

```
src/
├── app/                 # Next.js App Router
│   ├── create/         # イベント作成ページ
│   ├── events/         # イベント表示・編集ページ
│   └── cancel/         # 取消ページ
├── components/         # Reactコンポーネント
├── lib/               # ユーティリティ関数
│   ├── supabase/      # Supabaseクライアント
│   └── utils/         # ヘルパー関数
└── types/             # TypeScript型定義
```

## デプロイ

### Vercel へのデプロイ

1. GitHubにプッシュ
2. Vercelでプロジェクトをインポート
3. 環境変数を設定
4. デプロイ

## ライセンス

MIT
