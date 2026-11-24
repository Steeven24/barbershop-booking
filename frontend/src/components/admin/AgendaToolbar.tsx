import { Link } from 'react-router'
import type { AppointmentStatus, Barber } from '../../api/types'
import { STATUS_LABELS } from '../../lib/appointments'
import { formatLongDay, shiftDay, today } from '../../lib/dates'
import styles from './Agenda.module.css'

export type AgendaView = 'timeline' | 'list'

interface Props {
  day: string
  view: AgendaView
  barbers: Barber[]
  barberId: number | null
  status: AppointmentStatus | null
  onDayChange: (day: string) => void
  onViewChange: (view: AgendaView) => void
  onBarberChange: (barberId: number | null) => void
  onStatusChange: (status: AppointmentStatus | null) => void
}

export default function AgendaToolbar(props: Props) {
  const { day, view, barbers, barberId, status } = props
  const move = (delta: number) => props.onDayChange(shiftDay(day, delta))
  const pickBarber = (value: string) => props.onBarberChange(value ? Number(value) : null)
  const pickStatus = (value: string) => props.onStatusChange((value || null) as AppointmentStatus)

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
        <button type="button" className={styles.todayButton} disabled={day === today()}
          onClick={() => props.onDayChange(today())}>
          Hoy
        </button>
      </div>

      <div className={styles.filters}>
        {view === 'list' && (
          <>
            <select aria-label="Barbero" value={barberId ?? ''}
              onChange={(e) => pickBarber(e.target.value)}>
              <option value="">Todos los barberos</option>
              {barbers.map((barber) => (
                <option key={barber.id} value={barber.id}>
                  {barber.name}
                </option>
              ))}
            </select>
            <select aria-label="Estado" value={status ?? ''}
              onChange={(e) => pickStatus(e.target.value)}>
              <option value="">Todos los estados</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </>
        )}
        <div className={styles.segmented} role="group" aria-label="Vista">
          <button type="button" aria-pressed={view === 'timeline'}
            onClick={() => props.onViewChange('timeline')}>
            Línea de tiempo
          </button>
          <button type="button" aria-pressed={view === 'list'}
            onClick={() => props.onViewChange('list')}>
            Lista
          </button>
        </div>
        <Link to="/reservar" className={styles.newButton}>
          + Nueva cita
        </Link>
      </div>
    </div>
  )
}
