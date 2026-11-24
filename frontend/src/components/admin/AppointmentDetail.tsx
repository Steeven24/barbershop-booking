import type { Appointment, AppointmentStatus } from '../../api/types'
import { STATUS_ACTIONS, STATUS_LABELS } from '../../lib/appointments'
import { formatTime } from '../../lib/dates'
import styles from './AppointmentDetail.module.css'

const priceFormat = new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' })

interface Props {
  appointment: Appointment | null
  serviceName: string
  barberName: string
  price: number | null
  busy: boolean
  onStatusChange: (status: AppointmentStatus) => void
}

export default function AppointmentDetail(props: Props) {
  const { appointment: a, busy } = props
  if (!a) {
    return (
      <aside className={styles.panel}>
        <p className={styles.empty}>Selecciona una cita para ver el detalle.</p>
      </aside>
    )
  }
  const actions = STATUS_ACTIONS[a.status] ?? []

  return (
    <aside className={styles.panel}>
      <div className={styles.top}>
        <span className={styles.chip} data-status={a.status}>
          {STATUS_LABELS[a.status]}
        </span>
        <span>
          {formatTime(a.start_at)} – {formatTime(a.end_at)}
        </span>
      </div>
      <div>
        <h2>{a.customer_name}</h2>
        {a.customer_phone && <a href={`tel:${a.customer_phone}`}>{a.customer_phone}</a>}
        <a href={`mailto:${a.customer_email}`}>{a.customer_email}</a>
      </div>
      <dl className={styles.details}>
        <dt>Servicio</dt>
        <dd>{props.serviceName}</dd>
        <dt>Barbero</dt>
        <dd>{props.barberName}</dd>
        <dt>Precio</dt>
        <dd>{props.price === null ? '—' : priceFormat.format(props.price)}</dd>
      </dl>
      {a.notes && <p className={styles.notes}>“{a.notes}”</p>}
      {actions.length > 0 ? (
        <div className={styles.actions}>
          {actions.map((action) => (
            <button key={action.to} type="button" data-tone={action.tone} disabled={busy}
              onClick={() => props.onStatusChange(action.to)}>
              {action.to === 'cancelled' ? 'Cancelar cita' : action.label}
            </button>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>Esta cita ya está cerrada. No hay acciones pendientes.</p>
      )}
    </aside>
  )
}
