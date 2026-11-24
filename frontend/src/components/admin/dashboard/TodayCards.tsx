import { Link } from 'react-router'
import type { Appointment } from '../../../api/types'
import { STATUS_LABELS } from '../../../lib/appointments'
import { formatTime } from '../../../lib/dates'
import styles from './Dashboard.module.css'

interface Props {
  appointments: Appointment[]
  /** Current time "HH:MM": appointments already over are left out */
  now: string
  describe: (appointment: Appointment) => string
}

export function PendingAlert({ appointments }: { appointments: Appointment[] }) {
  const pending = appointments.filter((a) => a.status === 'pending')
  if (!pending.length) return null
  const names = pending.map((a) => `${a.customer_name} ${formatTime(a.start_at)}`).join(', ')
  return (
    <Link to="/admin/agenda" className={styles.alert}>
      <span>
        <strong>
          {pending.length} {pending.length === 1 ? 'cita por confirmar' : 'citas por confirmar'}
        </strong>{' '}
        para hoy · {names}
      </span>
      <span>Revisar en la agenda →</span>
    </Link>
  )
}

export function UpcomingToday({ appointments, now, describe }: Props) {
  const next = appointments
    .filter((a) => a.status !== 'cancelled' && a.status !== 'no_show' && formatTime(a.end_at) > now)
    .slice(0, 5)

  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <h2>Lo que sigue hoy</h2>
        <Link to="/admin/agenda">Ver agenda</Link>
      </div>
      {next.length === 0 && <p className={styles.muted}>No quedan citas para hoy.</p>}
      <ul className={styles.upcoming}>
        {next.map((a) => (
          <li key={a.id}>
            <strong>{formatTime(a.start_at)}</strong>
            <span>
              {a.customer_name}
              <small>{describe(a)}</small>
            </span>
            <span className={styles.chip} data-status={a.status}>
              {STATUS_LABELS[a.status]}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
