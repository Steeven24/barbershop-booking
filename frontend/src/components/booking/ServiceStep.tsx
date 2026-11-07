import type { Service } from '../../api/types'
import styles from './Booking.module.css'

const priceFormat = new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' })

interface Props {
  services: Service[]
  selectedId: number | null
  onSelect: (service: Service) => void
}

export default function ServiceStep({ services, selectedId, onSelect }: Props) {
  return (
    <div className={styles.options}>
      {services.map((service) => (
        <button
          key={service.id}
          type="button"
          className={styles.option}
          aria-pressed={service.id === selectedId}
          onClick={() => onSelect(service)}
        >
          <span className={styles.optionTitle}>{service.name}</span>
          <span className={styles.optionMeta}>
            {service.duration_minutes} min · {priceFormat.format(Number(service.price))}
          </span>
          {service.description && <span className={styles.optionText}>{service.description}</span>}
        </button>
      ))}
    </div>
  )
}
