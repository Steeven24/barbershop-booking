import { type FormEvent, type InputHTMLAttributes, useState } from 'react'
import styles from './Booking.module.css'

export interface CustomerDetails {
  name: string
  email: string
  phone: string
  notes: string
}

interface Props {
  submitting: boolean
  error: string | null
  onSubmit: (details: CustomerDetails) => void
}

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string
  onChange: (value: string) => void
}

function Field({ label, onChange, required, ...input }: FieldProps) {
  return (
    <label>
      <span>
        {label} {!required && <span className={styles.optional}>(opcional)</span>}
      </span>
      <input required={required} onChange={(e) => onChange(e.target.value)} {...input} />
    </label>
  )
}

const EMPTY: CustomerDetails = { name: '', email: '', phone: '', notes: '' }

export default function DetailsStep({ submitting, error, onSubmit }: Props) {
  const [details, setDetails] = useState(EMPTY)
  const update = (field: keyof CustomerDetails) => (value: string) =>
    setDetails((current) => ({ ...current, [field]: value }))

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSubmit(details)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Field label="Nombre" required minLength={2} maxLength={100} autoComplete="name"
        value={details.name} onChange={update('name')} />
      <Field label="Correo electrónico" required type="email" autoComplete="email"
        value={details.email} onChange={update('email')} />
      <Field label="Teléfono" type="tel" maxLength={20} autoComplete="tel"
        value={details.phone} onChange={update('phone')} />
      <label>
        <span>
          Notas para el barbero <span className={styles.optional}>(opcional)</span>
        </span>
        <textarea rows={3} maxLength={500} value={details.notes}
          onChange={(e) => update('notes')(e.target.value)} />
      </label>

      {error && <p className={styles.error} role="alert">{error}</p>}
      <button type="submit" className={styles.primary} disabled={submitting}>
        {submitting ? 'Reservando…' : 'Confirmar reserva'}
      </button>
    </form>
  )
}
