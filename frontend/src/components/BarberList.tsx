import { getBarbers } from '../api/catalog'
import { useFetch } from '../hooks/useFetch'
import { initials } from '../lib/text'
import styles from './BarberList.module.css'

export default function BarberList() {
  const { data: barbers, error, loading } = useFetch(getBarbers)

  if (loading) return <p className={styles.note}>Cargando equipo…</p>
  if (error || !barbers?.length) return <p className={styles.note}>Pronto presentaremos al equipo.</p>

  return (
    <ul className={styles.grid}>
      {barbers.map((barber) => (
        <li key={barber.id} className={styles.card}>
          {barber.photo_url ? (
            <img src={barber.photo_url} alt="" className={styles.avatar} />
          ) : (
            <span className={styles.avatar} aria-hidden="true">
              {initials(barber.name)}
            </span>
          )}
          <span className={styles.name}>{barber.name}</span>
        </li>
      ))}
    </ul>
  )
}
