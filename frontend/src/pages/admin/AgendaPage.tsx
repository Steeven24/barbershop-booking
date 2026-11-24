import { useCallback, useState } from 'react'
import {
  listAllBarbers,
  listAllServices,
  listAppointments,
  updateAppointmentStatus,
} from '../../api/admin'
import type { Appointment, AppointmentStatus } from '../../api/types'
import AgendaSummary from '../../components/admin/AgendaSummary'
import AgendaToolbar, { type AgendaView } from '../../components/admin/AgendaToolbar'
import AppointmentDetail from '../../components/admin/AppointmentDetail'
import AppointmentRow from '../../components/admin/AppointmentRow'
import styles from '../../components/admin/Agenda.module.css'
import Timeline from '../../components/admin/Timeline'
import { useFetch } from '../../hooks/useFetch'
import { useSchedules } from '../../hooks/useSchedules'
import { formatTime, today, weekdayOf } from '../../lib/dates'

export default function AgendaPage() {
  const [day, setDay] = useState(today)
  const [view, setView] = useState<AgendaView>('timeline')
  const [barberId, setBarberId] = useState<number | null>(null)
  const [status, setStatus] = useState<AppointmentStatus | null>(null)
  // Appointments changed in this session, applied on top of the fetched list
  const [updated, setUpdated] = useState<Record<number, Appointment>>({})
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  // Taken once: precise enough for the "now" line while the page is open
  const [now] = useState(() => formatTime(new Date().toISOString()))

  const barbers = useFetch(listAllBarbers)
  const services = useFetch(listAllServices)
  const fetchAppointments = useCallback(
    () => listAppointments({ day, barberId, status }),
    [day, barberId, status],
  )
  const appointments = useFetch(fetchAppointments)
  const rows = appointments.data?.map((a) => updated[a.id] ?? a) ?? []
  const schedules = useSchedules(barbers.data)
  // Active barbers, plus inactive ones who still have appointments that day
  const columns = (barbers.data ?? []).filter(
    (b) => b.is_active || rows.some((a) => a.barber_id === b.id),
  )
  const selected = rows.find((a) => a.id === selectedId) ?? null

  const switchView = (next: AgendaView) => {
    // The timeline always shows everyone, so list filters are cleared
    if (next === 'timeline') {
      setBarberId(null)
      setStatus(null)
    }
    setView(next)
  }

  const barberName = (id: number) => barbers.data?.find((b) => b.id === id)?.name ?? '—'
  const service = (id: number) => services.data?.find((s) => s.id === id)

  async function changeStatus(appointment: Appointment, to: AppointmentStatus) {
    setBusyId(appointment.id)
    setError(null)
    try {
      const saved = await updateAppointmentStatus(appointment.id, to)
      setUpdated((current) => ({ ...current, [saved.id]: saved }))
    } catch {
      setError(`No se pudo actualizar la cita de ${appointment.customer_name}.`)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <AgendaToolbar
        day={day}
        view={view}
        barbers={barbers.data ?? []}
        barberId={barberId}
        status={status}
        onDayChange={setDay}
        onViewChange={switchView}
        onBarberChange={setBarberId}
        onStatusChange={setStatus}
      />
      <AgendaSummary appointments={rows} priceOf={(id) => Number(service(id)?.price ?? 0)} />

      {error && <p className={styles.alert} role="alert">{error}</p>}
      {appointments.loading && <p className={styles.empty}>Cargando citas…</p>}
      {appointments.error && <p className={styles.empty}>No pudimos cargar la agenda.</p>}
      {view === 'timeline' && !appointments.loading && (
        <div className={styles.layout}>
          <Timeline
            barbers={columns}
            appointments={rows}
            schedules={schedules}
            weekday={weekdayOf(day)}
            now={day === today() ? now : null}
            serviceName={(id) => service(id)?.name ?? '—'}
            selectedId={selectedId}
            onSelect={(a) => setSelectedId(a.id)}
          />
          <AppointmentDetail
            appointment={selected}
            serviceName={selected ? (service(selected.service_id)?.name ?? '—') : ''}
            barberName={selected ? barberName(selected.barber_id) : ''}
            price={selected ? Number(service(selected.service_id)?.price ?? 0) : null}
            busy={busyId === selectedId}
            onStatusChange={(to) => selected && changeStatus(selected, to)}
          />
        </div>
      )}
      {view === 'list' && !appointments.loading && rows.length === 0 && (
        <p className={styles.empty}>No hay citas para este día.</p>
      )}
      {view === 'list' && rows.length > 0 && (
        <ul className={styles.list}>
          {rows.map((appointment) => (
            <AppointmentRow
              key={appointment.id}
              appointment={appointment}
              serviceName={service(appointment.service_id)?.name ?? '—'}
              barberName={barberName(appointment.barber_id)}
              busy={busyId === appointment.id}
              onStatusChange={(to) => changeStatus(appointment, to)}
            />
          ))}
        </ul>
      )}
    </>
  )
}
