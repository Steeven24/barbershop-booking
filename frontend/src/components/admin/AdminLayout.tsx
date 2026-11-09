import { Link, NavLink, Outlet } from 'react-router'
import { useAuth } from '../../auth/AuthContext'
import styles from './AdminLayout.module.css'

export default function AdminLayout() {
  const { user, logout } = useAuth()

  return (
    <div className={styles.shell}>
      <header className={styles.bar}>
        <div className={styles.inner}>
          <Link to="/admin" className={styles.brand}>
            La Navaja <span>Panel</span>
          </Link>
          <nav className={styles.nav}>
            <NavLink to="/admin" end>
              Agenda
            </NavLink>
          </nav>
          <div className={styles.user}>
            <span>{user?.full_name}</span>
            <Link to="/">Ver sitio</Link>
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
