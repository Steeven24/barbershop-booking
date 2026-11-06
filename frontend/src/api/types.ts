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
