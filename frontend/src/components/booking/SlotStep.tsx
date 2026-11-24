import { useCallback, useState } from 'react'
import { getAvailability, getNextAvailable } from '../../api/booking'
import { getBarberSchedule } from '../../api/catalog'
import type { AvailableSlot } from '../../api/types'
import { useFetch } from '../../hooks/useFetch'
import { formatTime, isoDayOf, today, upcomingDays, weekdayOf } from '../../lib/dates'
import { slotLabels } from '../../lib/schedule'
import styles from './Booking.module.css'
import SlotGroups from './SlotGroups'
import WeekPicker from './WeekPicker'

const DAYS = upcomingDays(28)

interface Props {
  barberId: number
  serviceId: number
  duration: number
  day: string | null
  selected: AvailableSlot | null
  onDayChange: (day: string) => void
  onSelect: (slot: AvailableSlot) => void
}

export default function SlotStep(props: Props) {
  const { barberId, serviceId, duration, day, selected, onDayChange, onSelect } = props
  // Taken once: good enough to hide the times already gone while the page is open
  const [now] = useState(() => formatTime(new Date().toISOString()))
  const schedule = useFetch(useCallback(() => getBarberSchedule(barberId), [barberId]))
  const next = useFetch(
    useCallback(() => getNextAvailable(barberId, serviceId), [barberId, serviceId]),
  )
  const openWeekdays = new Set(schedule.data?.map((hours) => hours.weekday))
  // Without a valid choice, open on the day of the next free slot (today may be over)
  const nextDay = next.data ? isoDayOf(next.data.start_at) : null
  const activeDay =
    day && openWeekdays.has(weekdayOf(day))
      ? day
      : (nextDay ?? DAYS.find((d) => openWeekdays.has(weekdayOf(d))) ?? DAYS[0])

  const fetchSlots = useCallback(
    () => getAvailability(barberId, serviceId, activeDay),
    [barberId, serviceId, activeDay],
  )
  const slots = useFetch(fetchSlots)
  const hours = schedule.data?.find((h) => h.weekday === weekdayOf(activeDay))
  const labels = hours ? slotLabels(hours.start_time, hours.end_time, duration) : []
  const hideUntil = activeDay === today() ? now : null

  if (schedule.loading || next.loading) return <p className={styles.note}>Cargando horarios…</p>
  if (schedule.data?.length === 0) {
    return <p className={styles.note}>Este barbero todavía no tiene horario. Elige otro.</p>
  }

  return (
    <>
      <WeekPicker
        days={DAYS}
        openWeekdays={openWeekdays}
        value={activeDay}
        onChange={onDayChange}
      />
      {slots.loading && <p className={styles.note}>Buscando horarios…</p>}
      {slots.error && (
        <p className={styles.note}>No pudimos cargar los horarios. Intenta de nuevo.</p>
      )}
      {slots.data && slots.data.length === 0 && (
        <p className={styles.note}>No quedan horarios libres este día. Prueba con otra fecha.</p>
      )}
      {slots.data && slots.data.length > 0 && (
        <SlotGroups labels={labels} free={slots.data} selected={selected}
          hideUntil={hideUntil} onSelect={onSelect} />
      )}
    </>
  )
}
