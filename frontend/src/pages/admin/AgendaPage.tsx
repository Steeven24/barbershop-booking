import { useCallback, useState } from 'react'
import {
  listAllBarbers,
  listAllServices,
  listAppointments,
  updateAppointmentStatus,
} from '../../api/admin'
import type { Appointment, AppointmentStatus } from '../../api/types'
import AgendaSummary from '../../components/admin/AgendaSummary'
import AgendaToolbar from '../../components/admin/AgendaToolbar'
import AppointmentRow from '../../components/admin/AppointmentRow'
import styles from '../../components/admin/Agenda.module.css'
import { useFetch } from '../../hooks/useFetch'
import { today } from '../../lib/dates'

export default function AgendaPage() {
  const [day, setDay] = useState(today)
  const [barberId, setBarberId] = useState<number | null>(null)
  const [status, setStatus] = useState<AppointmentStatus | null>(null)
  // Appointments changed in this session, applied on top of the fetched list
  const [updated, setUpdated] = useState<Record<number, Appointment>>({})
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const barbers = useFetch(listAllBarbers)
  const services = useFetch(listAllServices)
  const fetchAppointments = useCallback(
    () => listAppointments({ day, barberId, status }),
    [day, barberId, status],
  )
  const appointments = useFetch(fetchAppointments)
  const rows = appointments.data?.map((a) => updated[a.id] ?? a) ?? []

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
        barbers={barbers.data ?? []}
        barberId={barberId}
        status={status}
        onDayChange={setDay}
        onBarberChange={setBarberId}
        onStatusChange={setStatus}
      />
      <AgendaSummary appointments={rows} priceOf={(id) => Number(service(id)?.price ?? 0)} />

      {error && <p className={styles.alert} role="alert">{error}</p>}
      {appointments.loading && <p className={styles.empty}>Cargando citas…</p>}
      {appointments.error && <p className={styles.empty}>No pudimos cargar la agenda.</p>}
      {!appointments.loading && rows.length === 0 && (
        <p className={styles.empty}>No hay citas para este día.</p>
      )}
      {rows.length > 0 && (
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
