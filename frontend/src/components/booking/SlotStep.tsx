import { useCallback } from 'react'
import { getAvailability } from '../../api/booking'
import type { AvailableSlot } from '../../api/types'
import { useFetch } from '../../hooks/useFetch'
import { dayParts, formatTime, upcomingDays } from '../../lib/dates'
import styles from './Booking.module.css'

const DAYS = upcomingDays(14)

interface Props {
  barberId: number
  serviceId: number
  day: string | null
  selected: AvailableSlot | null
  onDayChange: (day: string) => void
  onSelect: (slot: AvailableSlot) => void
}

export default function SlotStep({
  barberId,
  serviceId,
  day,
  selected,
  onDayChange,
  onSelect,
}: Props) {
  const activeDay = day ?? DAYS[0]
  const fetchSlots = useCallback(
    () => getAvailability(barberId, serviceId, activeDay),
    [barberId, serviceId, activeDay],
  )
  const { data: slots, loading, error } = useFetch(fetchSlots)

  return (
    <>
      <div className={styles.days} role="group" aria-label="Día">
        {DAYS.map((value) => {
          const { weekday, number, month } = dayParts(value)
          return (
            <button
              key={value}
              type="button"
              className={styles.day}
              aria-pressed={value === activeDay}
              onClick={() => onDayChange(value)}
            >
              <span>{weekday}</span>
              <strong>{number}</strong>
              <span>{month}</span>
            </button>
          )
        })}
      </div>

      {loading && <p className={styles.note}>Buscando horarios…</p>}
      {error && <p className={styles.note}>No pudimos cargar los horarios. Intenta de nuevo.</p>}
      {slots && slots.length === 0 && (
        <p className={styles.note}>No hay horarios libres este día. Prueba con otra fecha.</p>
      )}
      {slots && slots.length > 0 && (
        <div className={styles.slots}>
          {slots.map((slot) => (
            <button
              key={slot.start_at}
              type="button"
              className={styles.slot}
              aria-pressed={slot.start_at === selected?.start_at}
              onClick={() => onSelect(slot)}
            >
              {formatTime(slot.start_at)}
            </button>
          ))}
        </div>
      )}
    </>
  )
}
