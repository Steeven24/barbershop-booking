import { getServices } from '../api/catalog'
import { useFetch } from '../hooks/useFetch'
import styles from './ServiceMenu.module.css'

const priceFormat = new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' })

export default function ServiceMenu() {
  const { data: services, error, loading } = useFetch(getServices)

  if (loading) return <p className={styles.note}>Cargando servicios…</p>
  if (error) return <p className={styles.note}>No pudimos cargar los servicios.</p>
  if (!services?.length) return <p className={styles.note}>Aún no hay servicios disponibles.</p>

  return (
    <ul className={styles.menu}>
      {services.map((service) => (
        <li key={service.id} className={styles.item}>
          <div className={styles.row}>
            <span className={styles.name}>{service.name}</span>
            <span className={styles.dots} aria-hidden="true" />
            <span className={styles.price}>{priceFormat.format(Number(service.price))}</span>
          </div>
          <span className={styles.meta}>
            {service.duration_minutes} min
            {service.description && ` · ${service.description}`}
          </span>
        </li>
      ))}
    </ul>
  )
}
