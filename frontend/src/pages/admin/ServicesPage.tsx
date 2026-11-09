import { useEffect, useState } from 'react'
import { createService, listAllServices, updateService } from '../../api/admin'
import type { Service, ServiceInput } from '../../api/types'
import styles from '../../components/admin/Catalog.module.css'
import CatalogRow from '../../components/admin/CatalogRow'
import ServiceForm from '../../components/admin/ServiceForm'
import { upsert } from '../../lib/collections'

const priceFormat = new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' })
const describe = (service: Service) =>
  `${service.duration_minutes} min · ${priceFormat.format(Number(service.price))}`

export default function ServicesPage() {
  const [services, setServices] = useState<Service[] | null>(null)
  const [editing, setEditing] = useState<Service | 'new' | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listAllServices()
      .then(setServices)
      .catch(() => setError('No pudimos cargar los servicios.'))
  }, [])

  async function save(data: ServiceInput) {
    const isNew = editing === 'new' || !editing
    const saved = isNew ? await createService(data) : await updateService(editing.id, data)
    setServices((current) => upsert(current ?? [], saved))
    setEditing(null)
  }

  async function toggleActive(service: Service) {
    try {
      const saved = await updateService(service.id, { is_active: !service.is_active })
      setServices((current) => upsert(current ?? [], saved))
    } catch {
      setError(`No se pudo actualizar ${service.name}.`)
    }
  }

  return (
    <>
      <div className={styles.header}>
        <h1>Servicios</h1>
        {!editing && (
          <button
            type="button"
            className={styles.button}
            data-tone="primary"
            onClick={() => setEditing('new')}
          >
            Nuevo servicio
          </button>
        )}
      </div>

      {editing && (
        <ServiceForm
          key={editing === 'new' ? 'new' : editing.id}
          service={editing === 'new' ? null : editing}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      )}
      {error && <p className={styles.error}>{error}</p>}
      {services?.length === 0 && <p className={styles.empty}>Todavía no hay servicios.</p>}

      {services && services.length > 0 && (
        <ul className={styles.list}>
          {services.map((service) => (
            <CatalogRow
              key={service.id}
              title={service.name}
              meta={describe(service)}
              active={service.is_active}
              onEdit={() => setEditing(service)}
              onToggleActive={() => toggleActive(service)}
            />
          ))}
        </ul>
      )}
    </>
  )
}
