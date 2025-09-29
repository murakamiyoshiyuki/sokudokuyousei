'use client'

import { Database } from '@/types/database'
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/ja'
import 'react-big-calendar/lib/css/react-big-calendar.css'

moment.locale('ja')
const localizer = momentLocalizer(moment)

type Slot = Database['public']['Tables']['slots']['Row'] & {
  bookings: Database['public']['Tables']['bookings']['Row'][]
}

interface CalendarViewProps {
  slots: Slot[]
  onSelectSlot: (slot: Slot) => void
  isActive: boolean
}

export default function CalendarView({ slots, onSelectSlot, isActive }: CalendarViewProps) {
  const events = slots.map((slot) => {
    const booking = slot.bookings.find(b => b.status === 'booked')
    const isBooked = !!booking

    const examType = (slot as any).exam_type === 'final' ? '本検定' : '仮検定'

    return {
      id: slot.id,
      title: isBooked
        ? `[${examType}] ${slot.provider_name} → ${booking.attendee_name}`
        : `[${examType}] ${slot.provider_name} (空き)`,
      start: new Date(slot.start_at),
      end: new Date(slot.end_at),
      resource: slot,
      isBooked,
      examType,
    }
  })

  return (
    <div style={{ height: 600 }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView={Views.WEEK}
        views={[Views.WEEK, Views.DAY, Views.MONTH]}
        onSelectEvent={(event) => {
          if (!event.isBooked && isActive) {
            onSelectSlot(event.resource as Slot)
          }
        }}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: event.isBooked
              ? '#10b981'
              : event.examType === '本検定'
                ? '#3b82f6'
                : '#6b7280',
            cursor: !event.isBooked && isActive ? 'pointer' : 'default',
          },
        })}
        messages={{
          today: '今日',
          previous: '前',
          next: '次',
          month: '月',
          week: '週',
          day: '日',
          agenda: 'アジェンダ',
          date: '日付',
          time: '時間',
          event: 'イベント',
          showMore: (total) => `+${total} もっと見る`,
        }}
      />
    </div>
  )
}