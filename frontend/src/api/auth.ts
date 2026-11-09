import { request } from './client'
import type { AdminUser } from './types'

export const login = (email: string, password: string) =>
  request<{ access_token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

export const getMe = () => request<AdminUser>('/auth/me')
