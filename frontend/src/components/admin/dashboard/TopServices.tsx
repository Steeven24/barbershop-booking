import type { Stats } from '../../../api/types'
import styles from './Dashboard.module.css'

const money = new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' })

export default function TopServices({ services }: { services: Stats['top_services'] }) {
  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <h2>Servicios más pedidos</h2>
      </div>
      {services.length === 0 && <p className={styles.muted}>Sin reservas en este periodo.</p>}
      <ol className={styles.ranking}>
        {services.map((service, index) => (
          <li key={service.service_id}>
            <span className={styles.rank}>{index + 1}</span>
            <strong>{service.name}</strong>
            <span>
              {service.appointments} {service.appointments === 1 ? 'cita' : 'citas'}
            </span>
            <span className={styles.amount}>{money.format(Number(service.value))}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
