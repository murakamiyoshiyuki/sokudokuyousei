import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>速読インストラクター養成生 調整サイトへようこそ</CardTitle>
          <CardDescription>
            養成生同士のレッスン練習（1コマ=60分）の日程調整を、一覧表示とワンクリック予約で完結させます。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">使い方</h3>
            <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
              <li>イベント（調整ボード）を作成します</li>
              <li>URLを参加者に共有します</li>
              <li>参加者は提供枠を登録し、空き枠を予約できます</li>
              <li>ログイン不要で簡単に利用できます</li>
            </ol>
          </div>
          <div className="flex gap-4">
            <Link href="/create">
              <Button size="lg">新規イベントを作成</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>特徴</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-1">
            <h4 className="font-medium">ログイン不要</h4>
            <p className="text-sm text-muted-foreground">
              URLを知っている人だけがアクセス可能なクローズドURL方式
            </p>
          </div>
          <div className="grid gap-1">
            <h4 className="font-medium">シンプルな操作</h4>
            <p className="text-sm text-muted-foreground">
              提供枠の登録、予約、取消がワンクリックで完了
            </p>
          </div>
          <div className="grid gap-1">
            <h4 className="font-medium">リアルタイム更新</h4>
            <p className="text-sm text-muted-foreground">
              予約状況はリアルタイムで反映され、常に最新の状態を確認可能
            </p>
          </div>
          <div className="grid gap-1">
            <h4 className="font-medium">表示切替</h4>
            <p className="text-sm text-muted-foreground">
              表形式とカレンダー形式を自由に切り替えて閲覧可能
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
