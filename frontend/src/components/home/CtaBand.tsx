import { Link } from 'react-router'
import styles from './Home.module.css'

export default function CtaBand() {
  return (
    <section className={styles.ctaBand}>
      <div className={`container ${styles.ctaInner}`}>
        <div>
          <h2>¿Listo para tu próximo corte?</h2>
          <p>Elige hora ahora y recibe la confirmación en tu correo.</p>
        </div>
        <Link to="/reservar" className={styles.lightButton}>
          Reservar cita
        </Link>
      </div>
    </section>
  )
}
