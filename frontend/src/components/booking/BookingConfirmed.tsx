import { Link } from 'react-router'
import type { Appointment, Barber, Service } from '../../api/types'
import { formatLongDay, formatTime } from '../../lib/dates'
import styles from './Booking.module.css'

interface Props {
  appointment: Appointment
  service: Service
  barber: Barber
  onBookAnother: () => void
}

export default function BookingConfirmed({ appointment, service, barber, onBookAnother }: Props) {
  const firstName = appointment.customer_name.split(' ')[0]

  return (
    <section className={styles.confirmed}>
      <span className={styles.check} aria-hidden="true">✓</span>
      <h1>¡Listo, {firstName}!</h1>
      <p className={styles.lead}>
        Reservaste <strong>{service.name}</strong> con <strong>{barber.name}</strong> el{' '}
        <span className={styles.lower}>{formatLongDay(appointment.start_at)}</span> a las{' '}
        {formatTime(appointment.start_at)}
      </p>
      <p className={styles.note}>
        Tu cita queda pendiente hasta que la barbería la confirme. Si necesitas cambiarla,
        escríbenos o llámanos.
      </p>
      <div className={styles.actions}>
        <Link to="/" className={styles.primary}>
          Volver al inicio
        </Link>
        <button type="button" className={styles.secondary} onClick={onBookAnother}>
          Reservar otra cita
        </button>
      </div>
    </section>
  )
}
