import type { Appointment } from '../../api/types'
import styles from './Agenda.module.css'

const priceFormat = new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' })

interface Props {
  appointments: Appointment[]
  priceOf: (serviceId: number) => number
}

export default function AgendaSummary({ appointments, priceOf }: Props) {
  const active = appointments.filter((a) => a.status !== 'cancelled' && a.status !== 'no_show')
  const count = (status: Appointment['status']) =>
    appointments.filter((a) => a.status === status).length
  const revenue = active.reduce((sum, a) => sum + priceOf(a.service_id), 0)

  const stats = [
    { label: 'Citas del día', value: active.length, color: 'var(--color-ink)' },
    { label: 'Por confirmar', value: count('pending'), color: 'var(--color-brass)' },
    { label: 'Confirmadas', value: count('confirmed'), color: 'var(--color-success)' },
    {
      label: 'Ingresos estimados',
      value: priceFormat.format(revenue),
      color: 'var(--color-accent)',
    },
  ]

  return (
    <dl className={styles.summary}>
      {stats.map((stat) => (
        <div key={stat.label}>
          <span className={styles.statBar} style={{ background: stat.color }} aria-hidden="true" />
          <span>
            <dt>{stat.label}</dt>
            <dd>{stat.value}</dd>
          </span>
        </div>
      ))}
    </dl>
  )
}
