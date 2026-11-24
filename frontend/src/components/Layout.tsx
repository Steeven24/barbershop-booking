import { Link, Outlet } from 'react-router'
import { business } from '../lib/business'
import styles from './Layout.module.css'

const YEAR = new Date().getFullYear()

export default function Layout() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={`container ${styles.inner}`}>
          <Link to="/" className={styles.brand}>
            La Navaja <span>Barbería</span>
          </Link>
          <nav className={styles.nav} aria-label="Principal">
            <a href="/#servicios">Servicios</a>
            <a href="/#equipo">Equipo</a>
            <a href="/#visitanos">Visítanos</a>
            <Link to="/reservar" className={styles.cta}>
              Reservar cita
            </Link>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={`container ${styles.footer}`}>
        <span>
          © {YEAR} {business.name}
        </span>
        <span>Lun – Vie 09:00 – 19:00 · Sáb 09:00 – 15:00</span>
      </footer>
    </div>
  )
}
