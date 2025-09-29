'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { formatToJST, canCancelSlot } from '@/lib/utils/date'

interface CancelConfirmProps {
  type: 'slot' | 'booking'
  id: string
  token: string
  details: {
    title: string
    description: string
    datetime: string
    eventTitle: string
    providerName?: string
  }
}

export default function CancelConfirm({ type, id, token, details }: CancelConfirmProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCanceled, setIsCanceled] = useState(false)

  async function handleCancel() {
    setIsSubmitting(true)

    try {
      const supabase = createClient()

      if (type === 'slot') {
        const { error } = await supabase
          .from('slots')
          .update({ status: 'canceled' })
          .eq('id', id)
          .eq('cancel_token', token)

        if (error) throw error
      } else {
        const { data: booking, error: fetchError } = await supabase
          .from('bookings')
          .select('slot_id')
          .eq('id', id)
          .eq('cancel_token', token)
          .single()

        if (fetchError || !booking) throw fetchError

        const { error: updateError } = await supabase
          .from('bookings')
          .update({ status: 'canceled' })
          .eq('id', id)
          .eq('cancel_token', token)

        if (updateError) throw updateError

        await supabase
          .from('slots')
          .update({ status: 'open' })
          .eq('id', booking.slot_id)
      }

      setIsCanceled(true)
      toast.success('取消が完了しました')
    } catch (error) {
      console.error('Error canceling:', error)
      toast.error('取消に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isCanceled) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>取消完了</CardTitle>
            <CardDescription>
              {details.title}が完了しました
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')}>
              トップページへ
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{details.title}</CardTitle>
          <CardDescription>
            以下の内容を取消しますか？
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-md space-y-2">
            <p className="text-sm">
              <strong>イベント:</strong> {details.eventTitle}
            </p>
            <p className="text-sm">
              <strong>日時:</strong> {formatToJST(details.datetime)}
            </p>
            {details.providerName && (
              <p className="text-sm">
                <strong>提供者:</strong> {details.providerName}
              </p>
            )}
            <p className="text-sm">
              <strong>{details.description}</strong>
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {isSubmitting ? '取消中...' : '取消を確定'}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
            >
              キャンセル
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}