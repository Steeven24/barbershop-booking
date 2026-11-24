import { useState } from 'react'
import { dayParts, today, weekdayOf } from '../../lib/dates'
import styles from './Booking.module.css'

interface Props {
  /** Bookable days (YYYY-MM-DD), shown seven at a time */
  days: string[]
  openWeekdays: Set<number>
  value: string
  onChange: (day: string) => void
}

export default function WeekPicker({ days, openWeekdays, value, onChange }: Props) {
  const [page, setPage] = useState(() => Math.max(0, Math.floor(days.indexOf(value) / 7)))
  const pages = Math.ceil(days.length / 7)
  const visible = days.slice(page * 7, page * 7 + 7)

  return (
    <div className={styles.week}>
      <button type="button" className={styles.weekArrow} aria-label="Días anteriores"
        disabled={page === 0} onClick={() => setPage(page - 1)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" />
        </svg>
      </button>
      <div className={styles.days} role="group" aria-label="Día">
        {visible.map((day) => {
          const { weekday, number, month } = dayParts(day)
          const closed = !openWeekdays.has(weekdayOf(day))
          return (
            <button key={day} type="button" className={styles.day} disabled={closed}
              aria-pressed={day === value} onClick={() => onChange(day)}>
              <span>{weekday}</span>
              <strong>{number}</strong>
              <span>{closed ? 'Cerrado' : day === today() ? 'Hoy' : month}</span>
            </button>
          )
        })}
      </div>
      <button type="button" className={styles.weekArrow} aria-label="Días siguientes"
        disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
    </div>
  )
}
