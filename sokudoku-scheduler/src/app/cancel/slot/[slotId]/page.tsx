import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import CancelConfirm from '@/components/cancel-confirm'

export default async function CancelSlotPage({
  params,
  searchParams
}: {
  params: Promise<{ slotId: string }>
  searchParams: Promise<{ token?: string }>
}) {
  const { slotId } = await params
  const { token } = await searchParams

  if (!token) {
    notFound()
  }

  const supabase = await createServerSupabaseClient()

  const { data: slot, error } = await supabase
    .from('slots')
    .select(`
      *,
      events!inner (*)
    `)
    .eq('id', slotId)
    .eq('cancel_token', token)
    .single()

  if (error || !slot) {
    notFound()
  }

  const slotData = slot as any
  const event = slotData.events

  return (
    <CancelConfirm
      type="slot"
      id={slotId}
      token={token}
      details={{
        title: '提供枠の取消',
        description: `提供者: ${slotData.provider_name}`,
        datetime: slotData.start_at,
        eventTitle: event?.title || '',
      }}
    />
  )
}