'use client'

import { Database } from '@/types/database'
import { Button } from '@/components/ui/button'
import { formatDateJST, formatTimeJST } from '@/lib/utils/date'
import { CheckCircle, Circle } from 'lucide-react'

type Slot = Database['public']['Tables']['slots']['Row'] & {
  bookings: Database['public']['Tables']['bookings']['Row'][]
}

interface TableViewProps {
  slots: Slot[]
  onSelectSlot: (slot: Slot) => void
  isActive: boolean
}

export default function TableView({ slots, onSelectSlot, isActive }: TableViewProps) {
  if (slots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        まだ提供枠が登録されていません
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">日付</th>
            <th className="text-left p-2">時間</th>
            <th className="text-left p-2">提供者</th>
            <th className="text-left p-2">検定</th>
            <th className="text-left p-2">状態</th>
            <th className="text-left p-2">受講者</th>
            <th className="text-left p-2">操作</th>
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => {
            const booking = slot.bookings.find(b => b.status === 'booked')
            const isBooked = !!booking
            const isCanceled = slot.status === 'canceled'

            return (
              <tr key={slot.id} className="border-b hover:bg-muted/50">
                <td className="p-2">{formatDateJST(slot.start_at)}</td>
                <td className="p-2">
                  {formatTimeJST(slot.start_at)} - {formatTimeJST(slot.end_at)}
                </td>
                <td className="p-2">{slot.provider_name}</td>
                <td className="p-2">
                  {(slot as any).exam_type === 'final' ? (
                    <span className="font-medium text-primary">本検定</span>
                  ) : (
                    <span className="text-muted-foreground">仮検定</span>
                  )}
                </td>
                <td className="p-2">
                  {isCanceled ? (
                    <span className="text-muted-foreground">キャンセル済</span>
                  ) : isBooked ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      予約済
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Circle className="h-4 w-4" />
                      空き
                    </span>
                  )}
                </td>
                <td className="p-2">
                  {booking ? booking.attendee_name : '—'}
                </td>
                <td className="p-2">
                  {!isCanceled && !isBooked && isActive && (
                    <Button
                      size="sm"
                      onClick={() => onSelectSlot(slot)}
                    >
                      予約
                    </Button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}