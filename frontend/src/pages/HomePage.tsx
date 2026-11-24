import { getBarbers, getServices } from '../api/catalog'
import CtaBand from '../components/home/CtaBand'
import Hero from '../components/home/Hero'
import ServicesSection from '../components/home/ServicesSection'
import TeamSection from '../components/home/TeamSection'
import VisitSection from '../components/home/VisitSection'
import { useFetch } from '../hooks/useFetch'
import { referenceService, useNextSlots } from '../hooks/useNextSlots'

export default function HomePage() {
  const services = useFetch(getServices)
  const barbers = useFetch(getBarbers)
  const slots = useNextSlots(barbers.data, referenceService(services.data))

  return (
    <>
      <Hero barbers={barbers.data} slots={slots} />
      <ServicesSection services={services.data} />
      <TeamSection barbers={barbers.data} slots={slots} />
      <VisitSection />
      <CtaBand />
    </>
  )
}
