import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import EventView from '@/components/event-view'

export default async function EventPage({
  params
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params
  const supabase = await createServerSupabaseClient()

  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('public_id', eventId)
    .eq('is_active', true)
    .single()

  if (error || !event) {
    notFound()
  }

  const { data: slots } = await supabase
    .from('slots')
    .select(`
      *,
      bookings (*)
    `)
    .eq('event_id', event.id)
    .order('start_at', { ascending: true })

  return <EventView event={event} slots={slots || []} />
}