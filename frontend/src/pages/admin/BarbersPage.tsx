import { useEffect, useState } from 'react'
import { createBarber, listAllBarbers, updateBarber } from '../../api/admin'
import type { Barber, BarberInput } from '../../api/types'
import BarberForm from '../../components/admin/BarberForm'
import styles from '../../components/admin/Catalog.module.css'
import CatalogRow from '../../components/admin/CatalogRow'
import ScheduleEditor from '../../components/admin/ScheduleEditor'
import { upsert } from '../../lib/collections'

export default function BarbersPage() {
  const [barbers, setBarbers] = useState<Barber[] | null>(null)
  const [editing, setEditing] = useState<Barber | 'new' | null>(null)
  const [scheduling, setScheduling] = useState<Barber | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listAllBarbers()
      .then(setBarbers)
      .catch(() => setError('No pudimos cargar el equipo.'))
  }, [])

  async function save(data: BarberInput) {
    const isNew = editing === 'new' || !editing
    const saved = isNew ? await createBarber(data) : await updateBarber(editing.id, data)
    setBarbers((current) => upsert(current ?? [], saved))
    setEditing(null)
  }

  async function toggleActive(barber: Barber) {
    try {
      const saved = await updateBarber(barber.id, { is_active: !barber.is_active })
      setBarbers((current) => upsert(current ?? [], saved))
    } catch {
      setError(`No se pudo actualizar a ${barber.name}.`)
    }
  }

  const openForm = (target: Barber | 'new') => {
    setScheduling(null)
    setEditing(target)
  }
  const openSchedule = (barber: Barber) => {
    setEditing(null)
    setScheduling(barber)
  }

  return (
    <>
      <div className={styles.header}>
        <h1>Barberos</h1>
        <button
          type="button"
          className={styles.button}
          data-tone="primary"
          onClick={() => openForm('new')}
        >
          Nuevo barbero
        </button>
      </div>

      {editing && (
        <BarberForm
          key={editing === 'new' ? 'new' : editing.id}
          barber={editing === 'new' ? null : editing}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      )}
      {scheduling && (
        <ScheduleEditor
          key={scheduling.id}
          barber={scheduling}
          onClose={() => setScheduling(null)}
        />
      )}
      {error && <p className={styles.error}>{error}</p>}
      {barbers?.length === 0 && <p className={styles.empty}>Todavía no hay barberos.</p>}

      {barbers && barbers.length > 0 && (
        <ul className={styles.list}>
          {barbers.map((barber) => (
            <CatalogRow
              key={barber.id}
              title={barber.name}
              meta={barber.phone ?? 'Sin teléfono'}
              active={barber.is_active}
              onEdit={() => openForm(barber)}
              onToggleActive={() => toggleActive(barber)}
            >
              <button type="button" className={styles.button} onClick={() => openSchedule(barber)}>
                Horario
              </button>
            </CatalogRow>
          ))}
        </ul>
      )}
    </>
  )
}
