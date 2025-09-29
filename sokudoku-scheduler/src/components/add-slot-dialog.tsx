'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { generateSecureToken } from '@/lib/utils/token'
import { addOneHour } from '@/lib/utils/date'

interface AddSlotDialogProps {
  eventId: string
  isOpen: boolean
  onClose: () => void
}

export default function AddSlotDialog({ eventId, isOpen, onClose }: AddSlotDialogProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cancelUrl, setCancelUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    providerName: '',
    startAt: '',
    note: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const cancelToken = generateSecureToken()
      const startAt = new Date(formData.startAt)
      const endAt = addOneHour(startAt)

      const { data, error } = await supabase.from('slots').insert({
        event_id: eventId,
        provider_name: formData.providerName,
        start_at: startAt.toISOString(),
        end_at: endAt.toISOString(),
        cancel_token: cancelToken,
        note: formData.note || null,
      }).select().single()

      if (error) {
        throw error
      }

      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const url = `${baseUrl}/cancel/slot/${data.id}?token=${cancelToken}`
      setCancelUrl(url)

      toast.success('提供枠を登録しました')
      router.refresh()
    } catch (error) {
      console.error('Error adding slot:', error)
      toast.error('提供枠の登録に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleClose() {
    setCancelUrl(null)
    setFormData({ providerName: '', startAt: '', note: '' })
    onClose()
  }

  if (cancelUrl) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>提供枠登録完了</DialogTitle>
            <DialogDescription>
              提供枠が登録されました。以下の取消用URLは必ず保管してください。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>取消用URL</Label>
              <div className="p-3 bg-muted rounded-md break-all text-sm mt-2">
                {cancelUrl}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  navigator.clipboard.writeText(cancelUrl)
                  toast.success('URLをコピーしました')
                }}
              >
                URLをコピー
              </Button>
            </div>
            <Button onClick={handleClose} className="w-full">
              閉じる
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>提供枠を追加</DialogTitle>
          <DialogDescription>
            練習を提供できる日時を登録してください（1コマ60分）
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="providerName">提供者名</Label>
            <Input
              id="providerName"
              required
              value={formData.providerName}
              onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
              placeholder="山田太郎"
            />
          </div>
          <div>
            <Label htmlFor="startAt">開始日時</Label>
            <Input
              id="startAt"
              type="datetime-local"
              required
              value={formData.startAt}
              onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="note">メモ（任意）</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="オンライン可、初心者歓迎など"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? '登録中...' : '登録'}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              キャンセル
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}