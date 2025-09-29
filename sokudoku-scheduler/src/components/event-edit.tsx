'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { formatToJST } from '@/lib/utils/date'

type Event = Database['public']['Tables']['events']['Row']

interface EventEditProps {
  event: Event
}

export default function EventEdit({ event }: EventEditProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description || '',
    viewMode: event.view_mode,
    visibleFrom: new Date(event.visible_from).toISOString().slice(0, 16),
    visibleTo: new Date(event.visible_to).toISOString().slice(0, 16),
    cancelBeforeHours: event.cancel_before_hours,
    isActive: event.is_active,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('events')
        .update({
          title: formData.title,
          description: formData.description || null,
          view_mode: formData.viewMode,
          visible_from: new Date(formData.visibleFrom).toISOString(),
          visible_to: new Date(formData.visibleTo).toISOString(),
          cancel_before_hours: formData.cancelBeforeHours,
          is_active: formData.isActive,
        })
        .eq('id', event.id)

      if (error) throw error

      toast.success('イベント情報を更新しました')
      router.refresh()
    } catch (error) {
      console.error('Error updating event:', error)
      toast.error('更新に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>イベント編集</CardTitle>
          <CardDescription>
            イベントの基本情報を編集できます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">イベント名</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="viewMode">デフォルト表示形式</Label>
              <Select
                value={formData.viewMode}
                onValueChange={(value: 'table' | 'calendar') =>
                  setFormData({ ...formData, viewMode: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="table">表形式</SelectItem>
                  <SelectItem value="calendar">カレンダー形式</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="visibleFrom">募集開始日時</Label>
                <Input
                  id="visibleFrom"
                  type="datetime-local"
                  value={formData.visibleFrom}
                  onChange={(e) => setFormData({ ...formData, visibleFrom: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="visibleTo">募集終了日時</Label>
                <Input
                  id="visibleTo"
                  type="datetime-local"
                  value={formData.visibleTo}
                  onChange={(e) => setFormData({ ...formData, visibleTo: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cancelBeforeHours">キャンセル期限（時間前）</Label>
              <Input
                id="cancelBeforeHours"
                type="number"
                min="0"
                max="72"
                value={formData.cancelBeforeHours}
                onChange={(e) => setFormData({ ...formData, cancelBeforeHours: parseInt(e.target.value) })}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <Label htmlFor="isActive">イベントを有効にする</Label>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '更新中...' : '更新'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.open(`/events/${event.public_id}`, '_blank')}
              >
                イベントページを見る
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>URL情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>表示用URL（参加者に共有）</Label>
            <div className="p-3 bg-muted rounded-md break-all text-sm mt-2">
              {`${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/events/${event.public_id}`}
            </div>
          </div>
          <div>
            <Label className="text-red-600">編集用URL（秘密）</Label>
            <div className="p-3 bg-muted rounded-md break-all text-sm mt-2">
              {window.location.href}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}