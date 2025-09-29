'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { generateSecureToken } from '@/lib/utils/token'
import { formatToJST } from '@/lib/utils/date'
import { Database } from '@/types/database'

type Slot = Database['public']['Tables']['slots']['Row'] & {
  bookings: Database['public']['Tables']['bookings']['Row'][]
}

interface BookingDialogProps {
  slot: Slot
  isOpen: boolean
  onClose: () => void
}

export default function BookingDialog({ slot, isOpen, onClose }: BookingDialogProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cancelUrl, setCancelUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    attendeeName: '',
    attendeeContact: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const cancelToken = generateSecureToken()

      const { data, error } = await supabase.from('bookings').insert({
        slot_id: slot.id,
        attendee_name: formData.attendeeName,
        attendee_contact: formData.attendeeContact || null,
        cancel_token: cancelToken,
      }).select().single()

      if (error) {
        if (error.code === '23505') {
          throw new Error('この枠は既に予約されています')
        }
        throw error
      }

      await supabase.from('slots').update({
        status: 'booked'
      }).eq('id', slot.id)

      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const url = `${baseUrl}/cancel/booking/${data.id}?token=${cancelToken}`
      setCancelUrl(url)

      toast.success('予約が完了しました')
      router.refresh()
    } catch (error: any) {
      console.error('Error booking slot:', error)
      toast.error(error.message || '予約に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleClose() {
    setCancelUrl(null)
    setFormData({ attendeeName: '', attendeeContact: '' })
    onClose()
  }

  if (cancelUrl) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>予約完了</DialogTitle>
            <DialogDescription>
              予約が完了しました。以下の取消用URLは必ず保管してください。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>予約情報</Label>
              <div className="mt-2 space-y-1 text-sm">
                <p>日時: {formatToJST(slot.start_at)}</p>
                <p>提供者: {slot.provider_name}</p>
                <p>受講者: {formData.attendeeName}</p>
              </div>
            </div>
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
          <DialogTitle>予約する</DialogTitle>
          <DialogDescription>
            以下の枠を予約します
          </DialogDescription>
        </DialogHeader>
        <div className="mb-4 p-3 bg-muted rounded-md">
          <p className="text-sm">
            <strong>日時:</strong> {formatToJST(slot.start_at)}
          </p>
          <p className="text-sm">
            <strong>提供者:</strong> {slot.provider_name}
          </p>
          {slot.note && (
            <p className="text-sm">
              <strong>メモ:</strong> {slot.note}
            </p>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="attendeeName">受講者名</Label>
            <Input
              id="attendeeName"
              required
              value={formData.attendeeName}
              onChange={(e) => setFormData({ ...formData, attendeeName: e.target.value })}
              placeholder="鈴木花子"
            />
          </div>
          <div>
            <Label htmlFor="attendeeContact">連絡先（任意）</Label>
            <Input
              id="attendeeContact"
              value={formData.attendeeContact}
              onChange={(e) => setFormData({ ...formData, attendeeContact: e.target.value })}
              placeholder="メールアドレスまたは電話番号"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? '予約中...' : '予約確定'}
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