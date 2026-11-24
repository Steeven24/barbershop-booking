import type { Appointment, WorkingHours } from '../../api/types'
import { formatTime } from '../../lib/dates'
import { toMinutes } from '../../lib/schedule'
import styles from './Timeline.module.css'

interface Props {
  height: number
  /** Minutes since midnight → px from the top of the column */
  px: (minutes: number) => number
  window: WorkingHours | undefined
  appointments: Appointment[]
  nowTop: number | null
  serviceName: (serviceId: number) => string
  selectedId: number | null
  onSelect: (appointment: Appointment) => void
}

export default function TimelineColumn(props: Props) {
  const { px, window, nowTop, selectedId } = props
  const minutes = (iso: string) => toMinutes(formatTime(iso))
  const opensAt = window ? px(toMinutes(window.start_time)) : 0
  const closesAt = window ? px(toMinutes(window.end_time)) : 0

  return (
    <div className={styles.column} style={{ height: props.height }}>
      {window ? (
        <>
          <span className={styles.off} style={{ top: 0, height: opensAt }} />
          <span className={styles.off} style={{ top: closesAt, bottom: 0 }} />
        </>
      ) : (
        <span className={styles.off} style={{ inset: 0 }}>
          No trabaja
        </span>
      )}
      {props.appointments.map((a) => {
        const top = px(minutes(a.start_at))
        const height = px(minutes(a.end_at)) - top
        const range = `${formatTime(a.start_at)}–${formatTime(a.end_at)}`
        return (
          <button
            key={a.id}
            type="button"
            className={styles.block}
            data-status={a.status}
            aria-pressed={a.id === selectedId}
            style={{ top: top + 2, height: height - 4 }}
            onClick={() => props.onSelect(a)}
          >
            <strong>{a.customer_name}</strong>
            <span>
              {range} · {props.serviceName(a.service_id)}
            </span>
          </button>
        )
      })}
      {nowTop !== null && (
        <span className={styles.now} style={{ top: nowTop }} aria-hidden="true" />
      )}
    </div>
  )
}
