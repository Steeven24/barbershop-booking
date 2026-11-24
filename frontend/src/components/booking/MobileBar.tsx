import type { AvailableSlot, Service } from '../../api/types'
import { formatTime, relativeDay } from '../../lib/dates'
import type { SummaryAction } from './BookingSummary'
import styles from './Mobile.module.css'

const priceFormat = new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' })

interface Props {
  service: Service | null
  slot: AvailableSlot | null
  action: SummaryAction
}

/** Sticky bottom bar replacing the summary panel on small screens. */
export default function MobileBar({ service, slot, action }: Props) {
  const when = slot ? `${relativeDay(slot.start_at)} · ${formatTime(slot.start_at)}` : null
  return (
    <div className={styles.bar}>
      <div className={styles.barText}>
        <span>{when ?? 'Elige un horario'}</span>
        <strong>{service ? priceFormat.format(Number(service.price)) : '—'}</strong>
      </div>
      <button type={action.form ? 'submit' : 'button'} form={action.form}
        className={styles.barButton} disabled={action.disabled} onClick={action.onClick}>
        {action.form ? action.label : 'Continuar'}
      </button>
    </div>
  )
}
