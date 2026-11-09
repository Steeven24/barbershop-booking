import type { Appointment, AppointmentStatus } from '../../api/types'
import { STATUS_ACTIONS, STATUS_LABELS } from '../../lib/appointments'
import { formatTime } from '../../lib/dates'
import styles from './Agenda.module.css'

interface Props {
  appointment: Appointment
  serviceName: string
  barberName: string
  busy: boolean
  onStatusChange: (status: AppointmentStatus) => void
}

export default function AppointmentRow({
  appointment,
  serviceName,
  barberName,
  busy,
  onStatusChange,
}: Props) {
  const actions = STATUS_ACTIONS[appointment.status] ?? []

  return (
    <li className={styles.row} data-status={appointment.status}>
      <div className={styles.time}>
        <strong>{formatTime(appointment.start_at)}</strong>
        <span>{formatTime(appointment.end_at)}</span>
      </div>

      <div className={styles.customer}>
        <strong>{appointment.customer_name}</strong>
        <span>{appointment.customer_phone ?? appointment.customer_email}</span>
        {appointment.notes && <p className={styles.notes}>“{appointment.notes}”</p>}
      </div>

      <div className={styles.detail}>
        <span>{serviceName}</span>
        <span className={styles.muted}>con {barberName}</span>
      </div>

      <span className={styles.badge} data-status={appointment.status}>
        {STATUS_LABELS[appointment.status]}
      </span>

      <div className={styles.actions}>
        {actions.map((action) => (
          <button
            key={action.to}
            type="button"
            data-tone={action.tone}
            disabled={busy}
            onClick={() => onStatusChange(action.to)}
          >
            {action.label}
          </button>
        ))}
      </div>
    </li>
  )
}
