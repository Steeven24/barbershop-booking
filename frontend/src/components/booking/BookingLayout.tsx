import { Link, Outlet } from 'react-router'
import styles from './BookingLayout.module.css'

/** Minimal chrome while booking: just the brand and a way out. */
export default function BookingLayout() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={`container ${styles.inner}`}>
          <Link to="/" className={styles.brand}>
            La Navaja <span>Barbería</span>
          </Link>
          <Link to="/" className={styles.exit} aria-label="Salir de la reserva">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
            <span>Salir de la reserva</span>
          </Link>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
