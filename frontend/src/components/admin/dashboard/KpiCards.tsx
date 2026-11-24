import type { Stats } from '../../../api/types'
import { comparisonLabel, trend } from '../../../lib/stats'
import styles from './Dashboard.module.css'

const money = new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' })

export default function KpiCards({ stats }: { stats: Stats }) {
  const { current: now, previous: before } = stats
  const vs = comparisonLabel(stats.period, stats.start)
  const kpis = [
    {
      label: 'Ingresos',
      value: money.format(Number(now.revenue)),
      trend: trend(Number(now.revenue), Number(before.revenue), 'percent', vs),
    },
    {
      label: 'Citas atendidas',
      value: now.completed,
      trend: trend(now.completed, before.completed, 'count', vs),
    },
    {
      label: 'Ocupación',
      value: `${now.occupancy} %`,
      trend: trend(now.occupancy, before.occupancy, 'points', vs),
    },
    {
      label: 'Inasistencias',
      value: now.no_shows,
      trend: trend(now.no_shows, before.no_shows, 'count', vs, true),
    },
  ]

  return (
    <section className={styles.kpis}>
      {kpis.map((kpi) => (
        <div key={kpi.label} className={styles.kpi}>
          <span>{kpi.label}</span>
          <strong>{kpi.value}</strong>
          <span data-tone={kpi.trend.tone}>{kpi.trend.text}</span>
        </div>
      ))}
    </section>
  )
}
