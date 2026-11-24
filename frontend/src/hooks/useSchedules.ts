import { useEffect, useState } from 'react'
import { getBarberSchedule } from '../api/catalog'
import type { Barber, WorkingHours } from '../api/types'

/** Weekly working hours of every barber, keyed by barber id. */
export function useSchedules(barbers: Barber[] | null) {
  const [schedules, setSchedules] = useState<Record<number, WorkingHours[]>>({})

  useEffect(() => {
    if (!barbers) return
    let cancelled = false
    Promise.all(
      barbers.map((barber) =>
        getBarberSchedule(barber.id)
          .catch(() => [])
          .then((hours) => [barber.id, hours] as const),
      ),
    ).then((entries) => !cancelled && setSchedules(Object.fromEntries(entries)))
    return () => {
      cancelled = true
    }
  }, [barbers])

  return schedules
}
