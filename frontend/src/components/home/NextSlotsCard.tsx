import { Link } from 'react-router'
import type { Barber } from '../../api/types'
import type { NextSlots } from '../../hooks/useNextSlots'
import { formatTime, relativeDay } from '../../lib/dates'
import { initials } from '../../lib/text'
import styles from './NextSlotsCard.module.css'

interface Props {
  barbers: Barber[] | null
  slots: NextSlots | undefined
}

export default function NextSlotsCard({ barbers, slots }: Props) {
  return (
    <aside className={styles.card} aria-labelledby="next-slots-title">
      <span className={styles.pole} aria-hidden="true" />
      <div className={styles.body}>
        <p className={styles.kicker}>Agenda en vivo</p>
        <h2 id="next-slots-title" className={styles.title}>
          Próximos turnos libres
        </h2>
        <ul className={styles.list}>
          {barbers?.map((barber) => {
            const slot = slots?.[barber.id]
            return (
              <li key={barber.id} className={styles.row}>
                <span className={styles.avatar} aria-hidden="true">
                  {initials(barber.name)}
                </span>
                <span className={styles.who}>
                  <strong>{barber.name}</strong>
                  <span>
                    {slots === undefined && 'Buscando turnos…'}
                    {slot && `${relativeDay(slot.start_at)} · ${formatTime(slot.start_at)}`}
                    {slots && !slot && 'Sin turnos esta semana'}
                  </span>
                </span>
                {slot && (
                  <Link to={`/reservar?barbero=${barber.id}`} className={styles.book}>
                    Reservar
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}
