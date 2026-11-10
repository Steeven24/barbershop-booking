import type { AppointmentStatus, Barber } from '../../api/types'
import { STATUS_LABELS } from '../../lib/appointments'
import { formatLongDay, shiftDay, today } from '../../lib/dates'
import styles from './Agenda.module.css'

interface Props {
  day: string
  barbers: Barber[]
  barberId: number | null
  status: AppointmentStatus | null
  onDayChange: (day: string) => void
  onBarberChange: (barberId: number | null) => void
  onStatusChange: (status: AppointmentStatus | null) => void
}

export default function AgendaToolbar(props: Props) {
  const { day, barbers, barberId, status, onDayChange, onBarberChange, onStatusChange } = props
  const move = (delta: number) => onDayChange(shiftDay(day, delta))

  return (
    <div className={styles.toolbar}>
      <div className={styles.dayNav}>
        <button type="button" aria-label="Día anterior" onClick={() => move(-1)}>
          ‹
        </button>
        <h1 className={styles.dayTitle}>{formatLongDay(day)}</h1>
        <button type="button" aria-label="Día siguiente" onClick={() => move(1)}>
          ›
        </button>
        {day !== today() && (
          <button type="button" className={styles.todayButton} onClick={() => onDayChange(today())}>
            Hoy
          </button>
        )}
      </div>

      <div className={styles.filters}>
        <input
          type="date"
          aria-label="Fecha"
          value={day}
          onChange={(e) => e.target.value && onDayChange(e.target.value)}
        />
        <select
          aria-label="Barbero"
          value={barberId ?? ''}
          onChange={(e) => onBarberChange(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">Todos los barberos</option>
          {barbers.map((barber) => (
            <option key={barber.id} value={barber.id}>
              {barber.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Estado"
          value={status ?? ''}
          onChange={(e) => onStatusChange((e.target.value || null) as AppointmentStatus | null)}
        >
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
