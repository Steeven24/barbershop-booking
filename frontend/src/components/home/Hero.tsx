import { Link } from 'react-router'
import type { Barber } from '../../api/types'
import type { NextSlots } from '../../hooks/useNextSlots'
import { business } from '../../lib/business'
import styles from './Home.module.css'
import NextSlotsCard from './NextSlotsCard'

const PERKS = ['Reserva en 1 minuto', 'Confirmación por correo', 'Sin pagos por adelantado']

interface Props {
  barbers: Barber[] | null
  slots: NextSlots | undefined
}

export default function Hero({ barbers, slots }: Props) {
  return (
    <section className={`container ${styles.hero}`}>
      <div className={styles.heroText}>
        <p className="eyebrow">Barbería de barrio{business.city && ` · ${business.city}`}</p>
        <h1 className={styles.heroTitle}>
          Cortes clásicos,
          <br />
          sin hacer fila.
        </h1>
        <p className={styles.lead}>
          Elige a tu barbero, el servicio y la hora que te quede mejor. Reserva en menos de un
          minuto y te esperamos con la silla lista.
        </p>
        <div className={styles.actions}>
          <Link to="/reservar" className={styles.primary}>
            Reservar cita
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
          <a href="#servicios" className={styles.secondary}>
            Ver servicios
          </a>
        </div>
        <ul className={styles.perks}>
          {PERKS.map((perk) => (
            <li key={perk}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12l5 5 9-10" />
              </svg>
              {perk}
            </li>
          ))}
        </ul>
      </div>
      <NextSlotsCard barbers={barbers} slots={slots} />
    </section>
  )
}
