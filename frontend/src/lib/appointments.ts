import type { AppointmentStatus } from '../api/types'

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No asistió',
}

interface StatusAction {
  to: AppointmentStatus
  label: string
  tone: 'primary' | 'neutral' | 'danger'
}

// Mirrors ALLOWED_TRANSITIONS in the backend appointments router
export const STATUS_ACTIONS: Partial<Record<AppointmentStatus, StatusAction[]>> = {
  pending: [
    { to: 'confirmed', label: 'Confirmar', tone: 'primary' },
    { to: 'cancelled', label: 'Cancelar', tone: 'danger' },
  ],
  confirmed: [
    { to: 'completed', label: 'Completar', tone: 'primary' },
    { to: 'no_show', label: 'No asistió', tone: 'neutral' },
    { to: 'cancelled', label: 'Cancelar', tone: 'danger' },
  ],
}
