import { request } from './client'
import type { Barber, Service } from './types'

export const getBarbers = () => request<Barber[]>('/barbers')
export const getServices = () => request<Service[]>('/services')
