import { request } from './client'
import type { Appointment, AppointmentStatus, Barber, Service } from './types'

interface AppointmentFilters {
  day?: string
  barberId?: number | null
  status?: AppointmentStatus | null
}

export function listAppointments({ day, barberId, status }: AppointmentFilters) {
  const params = new URLSearchParams()
  if (day) params.set('day', day)
  if (barberId) params.set('barber_id', String(barberId))
  if (status) params.set('status', status)
  return request<Appointment[]>(`/appointments?${params}`)
}

export const updateAppointmentStatus = (id: number, status: AppointmentStatus) =>
  request<Appointment>(`/appointments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })

// Admins also need inactive records, e.g. to show who served a past appointment
export const listAllBarbers = () => request<Barber[]>('/barbers?include_inactive=true')
export const listAllServices = () => request<Service[]>('/services?include_inactive=true')
