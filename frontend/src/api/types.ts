export interface Barber {
  id: number
  name: string
  phone: string | null
  photo_url: string | null
  is_active: boolean
}

export interface Service {
  id: number
  name: string
  description: string | null
  duration_minutes: number
  price: string
  is_active: boolean
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

export interface AvailableSlot {
  start_at: string
  end_at: string
}

export interface AppointmentCreate {
  barber_id: number
  service_id: number
  customer_name: string
  customer_email: string
  customer_phone: string | null
  start_at: string
  notes: string | null
}

export interface Appointment extends AppointmentCreate {
  id: number
  end_at: string
  status: AppointmentStatus
  created_at: string
}

export interface AdminUser {
  id: number
  email: string
  full_name: string
}
