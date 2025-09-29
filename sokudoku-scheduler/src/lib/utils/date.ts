import { format, formatInTimeZone } from 'date-fns-tz'
import { addHours, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale'

const TIMEZONE = 'Asia/Tokyo'

export function formatToJST(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatInTimeZone(d, TIMEZONE, 'yyyy/MM/dd HH:mm', { locale: ja })
}

export function formatDateJST(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatInTimeZone(d, TIMEZONE, 'yyyy/MM/dd', { locale: ja })
}

export function formatTimeJST(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatInTimeZone(d, TIMEZONE, 'HH:mm', { locale: ja })
}

export function addOneHour(date: Date): Date {
  return addHours(date, 1)
}

export function canCancelSlot(startAt: string | Date, cancelBeforeHours: number): boolean {
  const start = typeof startAt === 'string' ? parseISO(startAt) : startAt
  const now = new Date()
  const hoursUntilStart = (start.getTime() - now.getTime()) / (1000 * 60 * 60)
  return hoursUntilStart >= cancelBeforeHours
}