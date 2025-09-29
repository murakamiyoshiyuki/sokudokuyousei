# Supabase セットアップ手順

## 1. SQLエディタでテーブルを作成

1. Supabaseダッシュボードにアクセス: https://supabase.com/dashboard/project/yifrlywesgjtwztlgaoh
2. 左メニューから「SQL Editor」を選択
3. 「New query」をクリック
4. `supabase/schema.sql`の内容をコピーして貼り付け
5. 「Run」ボタンをクリックしてテーブルを作成

## 2. APIキーと設定を取得

1. 左メニューから「Settings」→「API」を選択
2. 以下の情報をメモ:
   - Project URL: `https://yifrlywesgjtwztlgaoh.supabase.co`
   - anon public キー: `eyJ...`（長い文字列）

## 3. 環境変数を設定

`.env.local`ファイルに以下を追加:

```
NEXT_PUBLIC_SUPABASE_URL=https://yifrlywesgjtwztlgaoh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=（上記でコピーしたanon publicキー）
```

## 4. アプリケーションを再起動

```bash
npm run dev
```

これでデータが全デバイス間で同期されるようになります。