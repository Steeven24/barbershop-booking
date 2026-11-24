import { Link, NavLink, Outlet } from 'react-router'
import { useAuth } from '../../auth/AuthContext'
import { initials } from '../../lib/text'
import styles from './AdminLayout.module.css'

export default function AdminLayout() {
  const { user, logout } = useAuth()

  return (
    <div className={styles.shell}>
      <header className={styles.bar}>
        <div className={styles.inner}>
          <div className={styles.left}>
            <Link to="/admin" className={styles.brand}>
              La Navaja <span>PANEL</span>
            </Link>
            <nav className={styles.nav} aria-label="Panel">
              <NavLink to="/admin" end>
                Resumen
              </NavLink>
              <NavLink to="/admin/agenda">Agenda</NavLink>
              <NavLink to="/admin/barberos">Barberos</NavLink>
              <NavLink to="/admin/servicios">Servicios</NavLink>
            </nav>
          </div>
          <div className={styles.user}>
            <Link to="/">Ver sitio</Link>
            {user && (
              <span className={styles.avatar} aria-hidden="true">
                {initials(user.full_name)}
              </span>
            )}
            <span className={styles.userName}>{user?.full_name}</span>
            <button type="button" onClick={logout}>
              Salir
            </button>
          </div>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
