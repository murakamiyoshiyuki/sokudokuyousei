import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import EventEdit from '@/components/event-edit'

export default async function EventEditPage({
  params,
  searchParams
}: {
  params: Promise<{ eventId: string }>
  searchParams: Promise<{ token?: string }>
}) {
  const { eventId } = await params
  const { token } = await searchParams

  if (!token) {
    notFound()
  }

  const supabase = await createServerSupabaseClient()

  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('public_id', eventId)
    .eq('edit_token', token)
    .single()

  if (error || !event) {
    notFound()
  }

  return <EventEdit event={event} />
}