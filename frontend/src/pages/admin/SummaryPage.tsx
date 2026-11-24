import { useCallback, useState } from 'react'
import { getStats, listAllBarbers, listAllServices, listAppointments } from '../../api/admin'
import type { Appointment, StatsPeriod } from '../../api/types'
import styles from '../../components/admin/dashboard/Dashboard.module.css'
import KpiCards from '../../components/admin/dashboard/KpiCards'
import RevenueChart from '../../components/admin/dashboard/RevenueChart'
import TeamOccupancy from '../../components/admin/dashboard/TeamOccupancy'
import { PendingAlert, UpcomingToday } from '../../components/admin/dashboard/TodayCards'
import TopServices from '../../components/admin/dashboard/TopServices'
import agendaStyles from '../../components/admin/Agenda.module.css'
import { useAuth } from '../../auth/AuthContext'
import { useFetch } from '../../hooks/useFetch'
import { formatLongDay, formatTime, today } from '../../lib/dates'
import { greeting } from '../../lib/stats'

const PERIODS: { value: StatsPeriod; label: string }[] = [
  { value: 'day', label: 'Hoy' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
]

export default function SummaryPage() {
  const { user } = useAuth()
  const [period, setPeriod] = useState<StatsPeriod>('week')
  const [now] = useState(() => formatTime(new Date().toISOString()))
  const stats = useFetch(useCallback(() => getStats(period), [period]))
  const todayList = useFetch(useCallback(() => listAppointments({ day: today() }), []))
  const barbers = useFetch(listAllBarbers)
  const services = useFetch(listAllServices)

  const describe = (a: Appointment) => {
    const service = services.data?.find((s) => s.id === a.service_id)?.name ?? '—'
    const barber = barbers.data?.find((b) => b.id === a.barber_id)?.name.split(' ')[0] ?? '—'
    return `${service} · ${barber}`
  }

  return (
    <>
      <div className={styles.header}>
        <div>
          <p>{formatLongDay(today())}</p>
          <h1>
            {greeting(Number(now.slice(0, 2)))}, {user?.full_name.split(' ')[0]}
          </h1>
        </div>
        <div className={agendaStyles.segmented} role="group" aria-label="Periodo">
          {PERIODS.map((p) => (
            <button key={p.value} type="button" aria-pressed={p.value === period}
              onClick={() => setPeriod(p.value)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <PendingAlert appointments={todayList.data ?? []} />
      {stats.error && <p className={styles.muted}>No pudimos cargar las estadísticas.</p>}
      {stats.data && (
        <>
          <KpiCards stats={stats.data} />
          <div className={styles.row}>
            <RevenueChart week={stats.data.week} />
            <TeamOccupancy team={stats.data.team} />
          </div>
          <div className={styles.row}>
            <TopServices services={stats.data.top_services} />
            <UpcomingToday appointments={todayList.data ?? []} now={now} describe={describe} />
          </div>
        </>
      )}
    </>
  )
}
