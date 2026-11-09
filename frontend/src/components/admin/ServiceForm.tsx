import { type FormEvent, useState } from 'react'
import { ApiError } from '../../api/client'
import type { Service, ServiceInput } from '../../api/types'
import styles from './Catalog.module.css'
import FormField from './FormField'

interface Props {
  service: Service | null
  onSave: (data: ServiceInput) => Promise<void>
  onCancel: () => void
}

export default function ServiceForm({ service, onSave, onCancel }: Props) {
  const [name, setName] = useState(service?.name ?? '')
  const [description, setDescription] = useState(service?.description ?? '')
  const [duration, setDuration] = useState(String(service?.duration_minutes ?? 30))
  const [price, setPrice] = useState(service?.price ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || null,
        duration_minutes: Number(duration),
        price: Number(price).toFixed(2),
      })
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 409
          ? 'Ya existe un servicio con ese nombre.'
          : 'No se pudo guardar el servicio.',
      )
      setSaving(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>{service ? `Editar ${service.name}` : 'Nuevo servicio'}</h2>
      <FormField
        label="Nombre"
        required
        minLength={2}
        maxLength={100}
        value={name}
        onChange={setName}
      />
      <FormField
        label="Duración (minutos)"
        required
        type="number"
        min={5}
        max={480}
        step={5}
        value={duration}
        onChange={setDuration}
      />
      <FormField
        label="Precio (USD)"
        required
        type="number"
        min={0}
        step={0.01}
        value={price}
        onChange={setPrice}
      />
      <label className={styles.wide}>
        Descripción (opcional)
        <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.formActions}>
        <button type="submit" className={styles.button} data-tone="primary" disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
        <button type="button" className={styles.button} onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
