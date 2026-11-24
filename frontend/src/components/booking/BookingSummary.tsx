import type { AvailableSlot, Barber, Service } from '../../api/types'
import { formatLongDay, formatTime } from '../../lib/dates'
import { initials } from '../../lib/text'
import styles from './Summary.module.css'

const priceFormat = new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' })

export interface SummaryAction {
  label: string
  disabled: boolean
  /** Submits this form instead of calling onClick (last step) */
  form?: string
  onClick?: () => void
}

interface Props {
  service: Service | null
  barber: Barber | null
  slot: AvailableSlot | null
  action: SummaryAction | null
  onChange: () => void
}

export default function BookingSummary({ service, barber, slot, action, onChange }: Props) {
  return (
    <aside className={styles.summary}>
      <h2>Tu cita</h2>
      {barber && (
        <div className={styles.who}>
          <span className={styles.avatar} aria-hidden="true">
            {initials(barber.name)}
          </span>
          <span className={styles.whoText}>
            <strong>{barber.name}</strong>
            <span>{service ? `${service.name} · ${service.duration_minutes} min` : '—'}</span>
          </span>
          <button type="button" className={styles.link} onClick={onChange}>
            Cambiar
          </button>
        </div>
      )}
      <dl className={styles.details}>
        {!barber && (
          <>
            <dt>Servicio</dt>
            <dd>{service?.name ?? '—'}</dd>
          </>
        )}
        <dt>Fecha</dt>
        <dd className={styles.capitalize}>{slot ? formatLongDay(slot.start_at) : '—'}</dd>
        <dt>Hora</dt>
        <dd>{slot ? `${formatTime(slot.start_at)} – ${formatTime(slot.end_at)}` : '—'}</dd>
      </dl>
      <p className={styles.total}>
        <span>Total a pagar en el local</span>
        <strong>{service ? priceFormat.format(Number(service.price)) : '—'}</strong>
      </p>
      {action && (
        <button type={action.form ? 'submit' : 'button'} form={action.form}
          className={styles.cta} disabled={action.disabled} onClick={action.onClick}>
          {action.label}
        </button>
      )}
      <p className={styles.fine}>Sin pagos por adelantado: pagas en el local.</p>
    </aside>
  )
}
