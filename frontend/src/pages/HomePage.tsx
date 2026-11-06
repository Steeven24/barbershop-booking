import { Link } from 'react-router'
import styles from './HomePage.module.css'

export default function HomePage() {
  return (
    <>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Barbería de barrio</p>
          <h1 className={styles.title}>Cortes clásicos, sin hacer fila.</h1>
          <p className={styles.lead}>
            Elige a tu barbero, el servicio y la hora que te quede mejor. Te esperamos con la silla
            lista.
          </p>
          <Link to="/reservar" className={styles.cta}>
            Reservar cita
          </Link>
        </div>
      </section>

    </>
  )
}
