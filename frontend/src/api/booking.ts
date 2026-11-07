import { request } from './client'
import type { Appointment, AppointmentCreate, AvailableSlot } from './types'

export function getAvailability(barberId: number, serviceId: number, day: string) {
  const params = new URLSearchParams({
    barber_id: String(barberId),
    service_id: String(serviceId),
    day,
  })
  return request<AvailableSlot[]>(`/availability?${params}`)
}

export function createAppointment(data: AppointmentCreate) {
  return request<Appointment>('/appointments', { method: 'POST', body: JSON.stringify(data) })
}
