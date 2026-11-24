import { request } from './client'
import type { Barber, Service, WorkingHours } from './types'

export const getBarbers = () => request<Barber[]>('/barbers')
export const getServices = () => request<Service[]>('/services')

export const getBarberSchedule = (barberId: number) =>
  request<WorkingHours[]>(`/barbers/${barberId}/working-hours`)
