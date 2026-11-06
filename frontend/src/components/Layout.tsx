import { Link, NavLink, Outlet } from 'react-router'
import styles from './Layout.module.css'

export default function Layout() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link to="/" className={styles.brand}>
            La Navaja <span>Barbería</span>
          </Link>
          <nav className={styles.nav}>
            <NavLink to="/" end>
              Inicio
            </NavLink>
            <NavLink to="/reservar" className={styles.cta}>
              Reservar cita
            </NavLink>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className={styles.inner}>
          <span>© {new Date().getFullYear()} La Navaja Barbería</span>
          <span>Lun – Sáb · 09:00 – 19:00</span>
        </div>
      </footer>
    </div>
  )
}
