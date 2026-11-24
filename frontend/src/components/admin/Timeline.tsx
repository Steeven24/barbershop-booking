import type { Appointment, Barber, WorkingHours } from '../../api/types'
import { formatTime } from '../../lib/dates'
import { dayRange, toMinutes } from '../../lib/schedule'
import { initials } from '../../lib/text'
import styles from './Timeline.module.css'
import TimelineColumn from './TimelineColumn'

const HOUR_PX = 64
const TONES = ['#efe3d0', '#f1e4e0', '#e4e6dc', '#e9e3ef']

interface Props {
  barbers: Barber[]
  appointments: Appointment[]
  schedules: Record<number, WorkingHours[]>
  weekday: number
  /** Current time ("HH:MM") when showing today, to draw the now line */
  now: string | null
  serviceName: (serviceId: number) => string
  selectedId: number | null
  onSelect: (appointment: Appointment) => void
}

export default function Timeline(props: Props) {
  const { barbers, appointments, schedules, weekday, now, selectedId, onSelect } = props
  const windowOf = (barberId: number) => schedules[barberId]?.find((h) => h.weekday === weekday)
  const windows = barbers.flatMap((b) => windowOf(b.id) ?? [])
  const times = appointments.flatMap((a) => [formatTime(a.start_at), formatTime(a.end_at)])
  const range = dayRange(windows, times)
  const px = (minutes: number) => ((minutes - range.start) / 60) * HOUR_PX
  const hourCount = (range.end - range.start) / 60
  const hours = Array.from({ length: hourCount }, (_, i) => range.start / 60 + i)
  const nowMinutes = now ? toMinutes(now) : null
  const showNow = nowMinutes !== null && nowMinutes > range.start && nowMinutes < range.end
  const nowTop = showNow ? px(nowMinutes) : null
  const columns = { gridTemplateColumns: `64px repeat(${barbers.length}, minmax(170px, 1fr))` }

  return (
    <div className={styles.scroll}>
      <div className={styles.grid} style={columns}>
        <span />
        {barbers.map((barber, index) => {
          const count = appointments.filter((a) => a.barber_id === barber.id).length
          return (
            <div key={barber.id} className={styles.head}>
              <span className={styles.avatar} style={{ background: TONES[index % TONES.length] }}>
                {initials(barber.name)}
              </span>
              <span>
                <strong>{barber.name}</strong>
                <small>{count === 1 ? '1 cita' : `${count} citas`}</small>
              </span>
            </div>
          )
        })}

        <div className={styles.hours}>
          {hours.map((hour) => (
            <span key={hour} style={{ height: HOUR_PX }}>
              {String(hour).padStart(2, '0')}:00
            </span>
          ))}
        </div>
        {barbers.map((barber) => (
          <TimelineColumn
            key={barber.id}
            height={hours.length * HOUR_PX}
            px={px}
            window={windowOf(barber.id)}
            appointments={appointments.filter((a) => a.barber_id === barber.id)}
            nowTop={nowTop}
            serviceName={props.serviceName}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}
