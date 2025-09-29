'use client'

import { useState } from 'react'
import { Database } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarIcon, TableIcon, Plus } from 'lucide-react'
import TableView from '@/components/table-view'
import CalendarView from '@/components/calendar-view'
import AddSlotDialog from '@/components/add-slot-dialog'
import BookingDialog from '@/components/booking-dialog'
import { formatDateJST } from '@/lib/utils/date'

type Event = Database['public']['Tables']['events']['Row']
type Slot = Database['public']['Tables']['slots']['Row'] & {
  bookings: Database['public']['Tables']['bookings']['Row'][]
}

interface EventViewProps {
  event: Event
  slots: Slot[]
}

export default function EventView({ event, slots }: EventViewProps) {
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>(event.view_mode)
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)

  const now = new Date()
  const visibleFrom = new Date(event.visible_from)
  const visibleTo = new Date(event.visible_to)
  const isActive = now >= visibleFrom && now <= visibleTo

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{event.title}</CardTitle>
          {event.description && (
            <CardDescription>{event.description}</CardDescription>
          )}
          <div className="text-sm text-muted-foreground">
            募集期間: {formatDateJST(event.visible_from)} 〜 {formatDateJST(event.visible_to)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'table' | 'calendar')}>
              <TabsList>
                <TabsTrigger value="table">
                  <TableIcon className="mr-2 h-4 w-4" />
                  表形式
                </TabsTrigger>
                <TabsTrigger value="calendar">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  カレンダー
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {isActive && (
              <Button onClick={() => setIsAddSlotOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                提供枠を追加
              </Button>
            )}
          </div>

          {!isActive && (
            <div className="text-center py-8 text-muted-foreground">
              現在募集期間外です
            </div>
          )}

          {viewMode === 'table' ? (
            <TableView
              slots={slots}
              onSelectSlot={setSelectedSlot}
              isActive={isActive}
            />
          ) : (
            <CalendarView
              slots={slots}
              onSelectSlot={setSelectedSlot}
              isActive={isActive}
            />
          )}
        </CardContent>
      </Card>

      <AddSlotDialog
        eventId={event.id}
        isOpen={isAddSlotOpen}
        onClose={() => setIsAddSlotOpen(false)}
      />

      {selectedSlot && (
        <BookingDialog
          slot={selectedSlot}
          isOpen={!!selectedSlot}
          onClose={() => setSelectedSlot(null)}
        />
      )}
    </div>
  )
}