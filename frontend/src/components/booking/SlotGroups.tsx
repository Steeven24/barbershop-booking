import type { AvailableSlot } from '../../api/types'
import { formatTime } from '../../lib/dates'
import styles from './Booking.module.css'

interface Props {
  /** All start times of the day, free or not */
  labels: string[]
  free: AvailableSlot[]
  selected: AvailableSlot | null
  /** Current time ("HH:MM") when the day is today: earlier times are hidden */
  hideUntil: string | null
  onSelect: (slot: AvailableSlot) => void
}

export default function SlotGroups({ labels, free, selected, hideUntil, onSelect }: Props) {
  const freeByLabel = new Map(free.map((slot) => [formatTime(slot.start_at), slot]))
  // Times already gone today are hidden instead of shown as taken
  const visible = hideUntil ? labels.filter((label) => label > hideUntil) : labels
  const groups = [
    { title: 'Mañana', labels: visible.filter((label) => label < '12:00') },
    { title: 'Tarde', labels: visible.filter((label) => label >= '12:00') },
  ].filter((group) => group.labels.length)

  return groups.map((group) => (
    <div key={group.title} className={styles.slotGroup}>
      <div className={styles.slotGroupHead}>
        <strong>{group.title}</strong>
        <span>{group.labels.filter((label) => freeByLabel.has(label)).length} libres</span>
        <span className={styles.rule} aria-hidden="true" />
      </div>
      <div className={styles.slots}>
        {group.labels.map((label) => {
          const slot = freeByLabel.get(label)
          return (
            <button key={label} type="button" className={styles.slot} disabled={!slot}
              aria-pressed={!!slot && slot.start_at === selected?.start_at}
              aria-label={slot ? label : `${label}, ocupado`}
              onClick={() => slot && onSelect(slot)}>
              {label}
            </button>
          )
        })}
      </div>
    </div>
  ))
}
