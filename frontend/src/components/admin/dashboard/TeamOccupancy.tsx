import type { Stats } from '../../../api/types'
import { initials } from '../../../lib/text'
import styles from './Dashboard.module.css'

const money = new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' })
const TONES = ['#efe3d0', '#f1e4e0', '#e4e6dc', '#e9e3ef']

export default function TeamOccupancy({ team }: { team: Stats['team'] }) {
  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <h2>Ocupación del equipo</h2>
      </div>
      {team.length === 0 && <p className={styles.muted}>Todavía no hay barberos activos.</p>}
      {team.map((member, index) => (
        <div key={member.barber_id} className={styles.member}>
          <div className={styles.memberHead}>
            <span className={styles.avatar} style={{ background: TONES[index % TONES.length] }}>
              {initials(member.name)}
            </span>
            <strong>{member.name}</strong>
            <span>{member.occupancy} %</span>
          </div>
          <span className={styles.meter} aria-hidden="true">
            <span style={{ width: `${Math.min(member.occupancy, 100)}%` }} />
          </span>
          <small>
            {member.appointments} {member.appointments === 1 ? 'cita' : 'citas'} ·{' '}
            {money.format(Number(member.revenue))}
          </small>
        </div>
      ))}
    </section>
  )
}
