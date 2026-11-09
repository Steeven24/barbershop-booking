import { request } from './client'
import type {
  Appointment,
  AppointmentStatus,
  Barber,
  BarberInput,
  Service,
  ServiceInput,
  WorkingHours,
} from './types'

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

const json = (method: string, body: unknown): RequestInit => ({
  method,
  body: JSON.stringify(body),
})

export const createBarber = (data: BarberInput) => request<Barber>('/barbers', json('POST', data))
export const updateBarber = (id: number, data: Partial<BarberInput & { is_active: boolean }>) =>
  request<Barber>(`/barbers/${id}`, json('PATCH', data))

export const getWorkingHours = (barberId: number) =>
  request<WorkingHours[]>(`/barbers/${barberId}/working-hours`)
export const saveWorkingHours = (barberId: number, hours: WorkingHours[]) =>
  request<WorkingHours[]>(`/barbers/${barberId}/working-hours`, json('PUT', hours))

export const createService = (data: ServiceInput) =>
  request<Service>('/services', json('POST', data))
export const updateService = (id: number, data: Partial<ServiceInput & { is_active: boolean }>) =>
  request<Service>(`/services/${id}`, json('PATCH', data))
