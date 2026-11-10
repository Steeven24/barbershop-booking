import { useState } from 'react'
import { getBarbers, getServices } from '../api/catalog'
import BarberStep from '../components/booking/BarberStep'
import BookingConfirmed from '../components/booking/BookingConfirmed'
import BookingSummary from '../components/booking/BookingSummary'
import DetailsStep from '../components/booking/DetailsStep'
import ServiceStep from '../components/booking/ServiceStep'
import SlotStep from '../components/booking/SlotStep'
import StepIndicator from '../components/booking/StepIndicator'
import { useBookingFlow } from '../hooks/useBookingFlow'
import { useFetch } from '../hooks/useFetch'
import styles from './BookingPage.module.css'

const TITLES = ['Elige un servicio', 'Elige a tu barbero', '¿Cuándo vienes?', 'Tus datos']

function BookingFlow({ onRestart }: { onRestart: () => void }) {
  const services = useFetch(getServices)
  const barbers = useFetch(getBarbers)
  const flow = useBookingFlow()

  if (flow.appointment && flow.service && flow.barber) {
    return (
      <BookingConfirmed
        appointment={flow.appointment}
        service={flow.service}
        barber={flow.barber}
        onBookAnother={onRestart}
      />
    )
  }

  const loadError = services.error || barbers.error
  return (
    <section>
      <StepIndicator current={flow.step} onSelect={flow.setStep} />
      <div className={styles.layout}>
        <div>
          <h1 className={styles.title}>{TITLES[flow.step]}</h1>
          {loadError && (
            <p className={styles.note}>No pudimos cargar la información. Recarga la página.</p>
          )}
          {flow.error && flow.step === 2 && <p className={styles.alert}>{flow.error}</p>}

          {flow.step === 0 && services.data && (
            <ServiceStep
              services={services.data}
              selectedId={flow.service?.id ?? null}
              onSelect={flow.chooseService}
            />
          )}
          {flow.step === 1 && barbers.data && (
            <BarberStep
              barbers={barbers.data}
              selectedId={flow.barber?.id ?? null}
              onSelect={flow.chooseBarber}
            />
          )}
          {flow.step === 2 && flow.service && flow.barber && (
            <SlotStep
              barberId={flow.barber.id}
              serviceId={flow.service.id}
              day={flow.day}
              selected={flow.slot}
              onDayChange={flow.setDay}
              onSelect={flow.chooseSlot}
            />
          )}
          {flow.step === 3 && (
            <DetailsStep submitting={flow.submitting} error={flow.error} onSubmit={flow.submit} />
          )}
        </div>
        <BookingSummary service={flow.service} barber={flow.barber} slot={flow.slot} />
      </div>
    </section>
  )
}

export default function BookingPage() {
  // Changing the key remounts the flow, which resets every step
  const [attempt, setAttempt] = useState(0)
  return <BookingFlow key={attempt} onRestart={() => setAttempt((n) => n + 1)} />
}
