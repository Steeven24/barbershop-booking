import { Link } from 'react-router'
import type { Service } from '../../api/types'
import styles from './Home.module.css'

// Whole dollars read cleaner on a price card: $8 instead of $8,00
const formatPrice = (price: string) =>
  new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Number(price) % 1 === 0 ? 0 : 2,
  }).format(Number(price))

export default function ServicesSection({ services }: { services: Service[] | null }) {
  return (
    <section id="servicios" className={styles.band}>
      <div className={`container ${styles.section}`}>
        <div className={styles.sectionHead}>
          <div>
            <p className="eyebrow">Servicios</p>
            <h2 className={styles.sectionTitle}>Lo que hacemos bien</h2>
          </div>
          <p className={styles.sectionNote}>
            Precios fijos, sin sorpresas. Elige uno y reserva directo.
          </p>
        </div>
        {services?.length === 0 && (
          <p className={styles.note}>Pronto publicaremos nuestros servicios.</p>
        )}
        <div className={styles.cards}>
          {services?.map((service) => (
            <article key={service.id} className={styles.serviceCard}>
              <div className={styles.serviceTop}>
                <span className={styles.serviceIcon} aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="6" cy="6" r="3" />
                    <circle cx="6" cy="18" r="3" />
                    <path d="M8.6 7.6L20 18M8.6 16.4L20 6" />
                  </svg>
                </span>
                <span className={styles.price}>{formatPrice(service.price)}</span>
              </div>
              <h3>{service.name}</h3>
              <p className={styles.serviceDesc}>{service.description}</p>
              <div className={styles.serviceFoot}>
                <span>{service.duration_minutes} min</span>
                <Link to={`/reservar?servicio=${service.id}`}>Reservar →</Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
