import { Link } from 'react-router'
import type { Barber } from '../../api/types'
import type { NextSlots } from '../../hooks/useNextSlots'
import { formatTime, relativeDay } from '../../lib/dates'
import { initials } from '../../lib/text'
import styles from './Home.module.css'

const TONES = ['#efe3d0', '#f1e4e0', '#e4e6dc', '#e9e3ef']

interface Props {
  barbers: Barber[] | null
  slots: NextSlots | undefined
}

export default function TeamSection({ barbers, slots }: Props) {
  return (
    <section id="equipo" className={`container ${styles.section}`}>
      <div>
        <p className="eyebrow">Nuestro equipo</p>
        <h2 className={styles.sectionTitle}>Elige quién te atiende</h2>
      </div>
      {barbers?.length === 0 && <p className={styles.note}>Pronto presentaremos al equipo.</p>}
      <div className={styles.cards}>
        {barbers?.map((barber, index) => {
          const slot = slots?.[barber.id]
          const day = slot ? relativeDay(slot.start_at) : null
          const tone = { background: TONES[index % TONES.length] }
          let next = 'Buscando su próximo turno…'
          if (slot) next = `Próximo turno libre: ${day?.toLowerCase()} ${formatTime(slot.start_at)}`
          else if (slots) next = 'Sin turnos libres esta semana'
          return (
            <article key={barber.id} className={styles.barberCard}>
              <div className={styles.barberCover} style={tone}>
                {barber.photo_url ? (
                  <img src={barber.photo_url} alt="" className={styles.barberPhoto} />
                ) : (
                  <span className={styles.barberInitials} aria-hidden="true">
                    {initials(barber.name)}
                  </span>
                )}
              </div>
              <div className={styles.barberBody}>
                <div className={styles.barberName}>
                  <h3>{barber.name}</h3>
                  {day && (
                    <span className={styles.chip} data-today={day === 'Hoy'}>
                      {day}
                    </span>
                  )}
                </div>
                <p className={styles.note}>{next}</p>
                <Link to={`/reservar?barbero=${barber.id}`} className={styles.ghostButton}>
                  Reservar con {barber.name.split(' ')[0]}
                </Link>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
