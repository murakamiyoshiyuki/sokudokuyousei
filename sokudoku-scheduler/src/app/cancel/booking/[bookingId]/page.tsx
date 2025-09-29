import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import CancelConfirm from '@/components/cancel-confirm'

export default async function CancelBookingPage({
  params,
  searchParams
}: {
  params: Promise<{ bookingId: string }>
  searchParams: Promise<{ token?: string }>
}) {
  const { bookingId } = await params
  const { token } = await searchParams

  if (!token) {
    notFound()
  }

  const supabase = await createServerSupabaseClient()

  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      *,
      slots!inner (
        *,
        events!inner (*)
      )
    `)
    .eq('id', bookingId)
    .eq('cancel_token', token)
    .single()

  if (error || !booking) {
    notFound()
  }

  const bookingData = booking as any
  const slot = bookingData.slots
  const event = slot?.events

  return (
    <CancelConfirm
      type="booking"
      id={bookingId}
      token={token}
      details={{
        title: '予約の取消',
        description: `受講者: ${bookingData.attendee_name}`,
        datetime: slot?.start_at || '',
        eventTitle: event?.title || '',
        providerName: slot?.provider_name || '',
      }}
    />
  )
}