import { useEffect, useState } from 'react'
import { getNextAvailable } from '../api/booking'
import type { AvailableSlot, Barber, Service } from '../api/types'

export type NextSlots = Record<number, AvailableSlot | null>

/** The quickest service is used as reference: it has the most free slots. */
export const referenceService = (services: Service[] | null) =>
  services?.length
    ? services.reduce((a, b) => (b.duration_minutes < a.duration_minutes ? b : a))
    : null

/** Next free slot per barber; undefined while loading. */
export function useNextSlots(barbers: Barber[] | null, service: Service | null) {
  const [slots, setSlots] = useState<NextSlots | undefined>()

  useEffect(() => {
    if (!barbers || !service) return
    let cancelled = false
    Promise.all(
      barbers.map((barber) =>
        getNextAvailable(barber.id, service.id)
          .catch(() => null)
          .then((slot) => [barber.id, slot] as const),
      ),
    ).then((entries) => !cancelled && setSlots(Object.fromEntries(entries)))
    return () => {
      cancelled = true
    }
  }, [barbers, service])

  return slots
}
