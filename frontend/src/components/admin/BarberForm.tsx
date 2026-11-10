import { type FormEvent, useState } from 'react'
import type { Barber, BarberInput } from '../../api/types'
import styles from './Catalog.module.css'
import FormField from './FormField'

interface Props {
  barber: Barber | null
  onSave: (data: BarberInput) => Promise<void>
  onCancel: () => void
}

export default function BarberForm({ barber, onSave, onCancel }: Props) {
  const [name, setName] = useState(barber?.name ?? '')
  const [phone, setPhone] = useState(barber?.phone ?? '')
  const [photoUrl, setPhotoUrl] = useState(barber?.photo_url ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onSave({
        name: name.trim(),
        phone: phone.trim() || null,
        photo_url: photoUrl.trim() || null,
      })
    } catch {
      setError('No se pudo guardar el barbero.')
      setSaving(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>{barber ? `Editar ${barber.name}` : 'Nuevo barbero'}</h2>
      <FormField
        label="Nombre"
        required
        minLength={2}
        maxLength={100}
        value={name}
        onChange={setName}
      />
      <FormField
        label="Teléfono (opcional)"
        type="tel"
        maxLength={20}
        value={phone}
        onChange={setPhone}
      />
      <FormField
        label="URL de la foto (opcional)"
        type="url"
        maxLength={500}
        value={photoUrl}
        onChange={setPhotoUrl}
      />
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
