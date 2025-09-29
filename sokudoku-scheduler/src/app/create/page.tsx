'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { generatePublicId, generateEditToken } from '@/lib/utils/token'

const formSchema = z.object({
  title: z.string().min(1, '題目を入力してください').max(255),
  description: z.string().optional(),
  viewMode: z.enum(['table', 'calendar']),
  visibleFrom: z.string().min(1, '開始日時を入力してください'),
  visibleTo: z.string().min(1, '終了日時を入力してください'),
  cancelBeforeHours: z.number().min(0).max(72),
})

type FormValues = z.infer<typeof formSchema>

export default function CreateEventPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [eventUrls, setEventUrls] = useState<{ publicUrl: string; editUrl: string } | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      viewMode: 'table',
      visibleFrom: new Date().toISOString().slice(0, 16),
      visibleTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      cancelBeforeHours: 24,
    },
  })

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const publicId = generatePublicId()
      const editToken = generateEditToken()

      const { data, error } = await supabase.from('events').insert({
        public_id: publicId,
        title: values.title,
        description: values.description || null,
        view_mode: values.viewMode,
        visible_from: new Date(values.visibleFrom).toISOString(),
        visible_to: new Date(values.visibleTo).toISOString(),
        cancel_before_hours: values.cancelBeforeHours,
        edit_token: editToken,
      }).select().single()

      if (error) {
        throw error
      }

      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const publicUrl = `${baseUrl}/events/${publicId}`
      const editUrl = `${baseUrl}/events/${publicId}/edit?token=${editToken}`

      setEventUrls({ publicUrl, editUrl })
      toast.success('イベントを作成しました')
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error('イベントの作成に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (eventUrls) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>イベント作成完了</CardTitle>
            <CardDescription>
              イベントが作成されました。以下のURLを参加者に共有してください。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">表示用URL（参加者に共有）</h3>
              <div className="p-3 bg-muted rounded-md break-all text-sm">
                {eventUrls.publicUrl}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(eventUrls.publicUrl)
                  toast.success('URLをコピーしました')
                }}
              >
                URLをコピー
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-red-600">編集用URL（秘密・共有しない）</h3>
              <div className="p-3 bg-muted rounded-md break-all text-sm">
                {eventUrls.editUrl}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(eventUrls.editUrl)
                  toast.success('編集用URLをコピーしました')
                }}
              >
                編集用URLをコピー
              </Button>
              <p className="text-xs text-muted-foreground">
                このURLは必ず保管してください。紛失すると編集できなくなります。
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => window.open(eventUrls.publicUrl, '_blank')}
              >
                イベントページを開く
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/')}
              >
                トップに戻る
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>新規イベント作成</CardTitle>
          <CardDescription>
            調整ボードを作成して、参加者と日程調整を始めましょう
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>イベント名</FormLabel>
                    <FormControl>
                      <Input placeholder="例：速読インストラクター養成生 練習会" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>説明（任意）</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="例：養成生同士で練習を行います。1コマ60分です。"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="viewMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>表示形式</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="表示形式を選択" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="table">表形式</SelectItem>
                        <SelectItem value="calendar">カレンダー形式</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="visibleFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>募集開始日時</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="visibleTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>募集終了日時</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="cancelBeforeHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>キャンセル期限（時間前）</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="72"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value || 24}
                      />
                    </FormControl>
                    <FormDescription>
                      開始の何時間前までキャンセルを受け付けるか（0〜72時間）
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? '作成中...' : 'イベントを作成'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/')}
                >
                  キャンセル
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}