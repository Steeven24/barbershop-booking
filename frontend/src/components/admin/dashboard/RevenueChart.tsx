import type { Stats } from '../../../api/types'
import { dayParts, today } from '../../../lib/dates'
import styles from './Dashboard.module.css'

const CHART_PX = 170

export default function RevenueChart({ week }: { week: Stats['week'] }) {
  const max = Math.max(1, ...week.map((d) => Number(d.revenue)))
  const isToday = (date: string) => date === today() || undefined

  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <h2>Ingresos de la semana</h2>
        <span>Solo citas completadas</span>
      </div>
      <div className={styles.chart}>
        {week.map((d) => (
          <div key={d.date} className={styles.bar} data-today={isToday(d.date)}>
            ${Number(d.revenue).toFixed(0)}
            <i style={{ height: (Number(d.revenue) / max) * CHART_PX }} />
          </div>
        ))}
      </div>
      <div className={styles.chartLabels} aria-hidden="true">
        {week.map((d) => (
          <span key={d.date} data-today={isToday(d.date)}>
            {isToday(d.date) ? 'Hoy' : dayParts(d.date).weekday}
          </span>
        ))}
      </div>
    </section>
  )
}
