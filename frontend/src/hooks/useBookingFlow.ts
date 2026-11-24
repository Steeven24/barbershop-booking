import { useState } from 'react'
import { createAppointment } from '../api/booking'
import { ApiError } from '../api/client'
import type { Appointment, AvailableSlot, Barber, Service } from '../api/types'
import type { CustomerDetails } from '../components/booking/DetailsStep'

export function useBookingFlow() {
  const [step, setStep] = useState(0)
  const [service, setService] = useState<Service | null>(null)
  const [barber, setBarber] = useState<Barber | null>(null)
  const [day, setDay] = useState<string | null>(null)
  const [slot, setSlot] = useState<AvailableSlot | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [appointment, setAppointment] = useState<Appointment | null>(null)

  const chooseService = (value: Service) => {
    setService(value)
    setSlot(null) // a different duration changes which slots are free
    setStep(barber ? 2 : 1)
  }
  const chooseBarber = (value: Barber) => {
    setBarber(value)
    setSlot(null)
    setStep(2)
  }
  const chooseSlot = (value: AvailableSlot) => {
    setSlot(value)
    setError(null)
  }
  const continueToDetails = () => slot && setStep(3)

  /** Start with a service and/or barber already chosen (links from the home page). */
  const preselect = (preService: Service | null, preBarber: Barber | null) => {
    setService(preService)
    setBarber(preBarber)
    setStep(preService ? (preBarber ? 2 : 1) : 0)
  }

  async function submit(details: CustomerDetails) {
    if (!service || !barber || !slot) return
    setSubmitting(true)
    setError(null)
    try {
      setAppointment(
        await createAppointment({
          service_id: service.id,
          barber_id: barber.id,
          start_at: slot.start_at,
          customer_name: details.name.trim(),
          customer_email: details.email.trim(),
          customer_phone: details.phone.trim() || null,
          notes: details.notes.trim() || null,
        }),
      )
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // Someone else took the slot meanwhile: send the customer back to pick another one
        setSlot(null)
        setStep(2)
        setError('Ese horario acaba de ocuparse. Por favor elige otro.')
      } else {
        setError('No pudimos completar la reserva. Inténtalo de nuevo en un momento.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return {
    step, service, barber, day, slot, submitting, error, appointment,
    setStep, setDay, chooseService, chooseBarber, chooseSlot, continueToDetails, preselect, submit,
  }
}
