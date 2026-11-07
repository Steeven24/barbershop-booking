import type { Barber } from '../../api/types'
import { initials } from '../../lib/text'
import styles from './Booking.module.css'

interface Props {
  barbers: Barber[]
  selectedId: number | null
  onSelect: (barber: Barber) => void
}

export default function BarberStep({ barbers, selectedId, onSelect }: Props) {
  return (
    <div className={styles.options}>
      {barbers.map((barber) => (
        <button
          key={barber.id}
          type="button"
          className={`${styles.option} ${styles.barberOption}`}
          aria-pressed={barber.id === selectedId}
          onClick={() => onSelect(barber)}
        >
          {barber.photo_url ? (
            <img src={barber.photo_url} alt="" className={styles.avatar} />
          ) : (
            <span className={styles.avatar} aria-hidden="true">
              {initials(barber.name)}
            </span>
          )}
          <span className={styles.optionTitle}>{barber.name}</span>
        </button>
      ))}
    </div>
  )
}
