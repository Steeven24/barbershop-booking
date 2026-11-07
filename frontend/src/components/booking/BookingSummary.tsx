import type { AvailableSlot, Barber, Service } from '../../api/types'
import { formatLongDay, formatTime } from '../../lib/dates'
import styles from './Booking.module.css'

const priceFormat = new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' })

interface Props {
  service: Service | null
  barber: Barber | null
  slot: AvailableSlot | null
}

export default function BookingSummary({ service, barber, slot }: Props) {
  return (
    <aside className={styles.summary}>
      <h2>Tu cita</h2>
      <dl>
        <dt>Servicio</dt>
        <dd>{service?.name ?? '—'}</dd>
        <dt>Barbero</dt>
        <dd>{barber?.name ?? '—'}</dd>
        <dt>Fecha</dt>
        <dd className={styles.capitalize}>{slot ? formatLongDay(slot.start_at) : '—'}</dd>
        <dt>Hora</dt>
        <dd>{slot ? `${formatTime(slot.start_at)} – ${formatTime(slot.end_at)}` : '—'}</dd>
      </dl>
      {service && (
        <p className={styles.total}>
          <span>Total</span>
          <strong>{priceFormat.format(Number(service.price))}</strong>
        </p>
      )}
    </aside>
  )
}
