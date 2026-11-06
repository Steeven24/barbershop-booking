import { Link } from 'react-router'
import BarberList from '../components/BarberList'
import ServiceMenu from '../components/ServiceMenu'
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
        <aside className={styles.hours}>
          <h2>Horario</h2>
          <dl>
            <dt>Lunes a viernes</dt>
            <dd>09:00 – 19:00</dd>
            <dt>Sábado</dt>
            <dd>09:00 – 15:00</dd>
            <dt>Domingo</dt>
            <dd>Cerrado</dd>
          </dl>
        </aside>
      </section>

      <section className={styles.section}>
        <h2>Servicios</h2>
        <ServiceMenu />
      </section>

      <section className={styles.section}>
        <h2>Nuestro equipo</h2>
        <BarberList />
      </section>
    </>
  )
}
