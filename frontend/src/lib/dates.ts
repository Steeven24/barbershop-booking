// All dates are shown in the barbershop's timezone, regardless of the visitor's
export const BUSINESS_TZ = import.meta.env.VITE_BUSINESS_TZ ?? 'America/Guayaquil'

const isoDay = new Intl.DateTimeFormat('en-CA', { timeZone: BUSINESS_TZ })
const timeFormat = new Intl.DateTimeFormat('es-EC', {
  timeZone: BUSINESS_TZ,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})
const longDayFormat = new Intl.DateTimeFormat('es-EC', {
  timeZone: BUSINESS_TZ,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

/** Next `count` days as YYYY-MM-DD strings, starting today. */
export function upcomingDays(count: number): string[] {
  const now = Date.now()
  return Array.from({ length: count }, (_, i) => isoDay.format(now + i * 86_400_000))
}

/** Noon avoids the day shifting when a YYYY-MM-DD string is parsed as UTC. */
const toDate = (day: string) => new Date(`${day}T12:00:00`)

export const formatTime = (iso: string) => timeFormat.format(new Date(iso))
export const formatLongDay = (value: string) =>
  longDayFormat.format(value.length === 10 ? toDate(value) : new Date(value))

export function dayParts(day: string) {
  const date = toDate(day)
  return {
    weekday: date.toLocaleDateString('es-EC', { weekday: 'short' }).replace('.', ''),
    number: date.getDate(),
    month: date.toLocaleDateString('es-EC', { month: 'short' }).replace('.', ''),
  }
}

export const today = () => upcomingDays(1)[0]

/** Move a YYYY-MM-DD day by `delta` days. */
export function shiftDay(day: string, delta: number): string {
  const date = toDate(day)
  date.setDate(date.getDate() + delta)
  return isoDay.format(date)
}

const shortDayFormat = new Intl.DateTimeFormat('es-EC', {
  timeZone: BUSINESS_TZ,
  weekday: 'short',
  day: 'numeric',
})

/** "Hoy", "Mañana" or a short day like "Mié 25" for an ISO datetime. */
export function relativeDay(iso: string): string {
  const day = isoDay.format(new Date(iso))
  if (day === today()) return 'Hoy'
  if (day === shiftDay(today(), 1)) return 'Mañana'
  const label = shortDayFormat.format(new Date(iso)).replace('.', '')
  return label.charAt(0).toUpperCase() + label.slice(1)
}
