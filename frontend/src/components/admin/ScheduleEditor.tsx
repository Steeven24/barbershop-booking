import { type FormEvent, useEffect, useState } from 'react'
import { getWorkingHours, saveWorkingHours } from '../../api/admin'
import type { Barber } from '../../api/types'
import { type DayRow, hasInvalidRange, toRows, toWorkingHours, WEEKDAYS } from '../../lib/schedule'
import styles from './Catalog.module.css'

interface Props {
  barber: Barber
  onClose: () => void
}

export default function ScheduleEditor({ barber, onClose }: Props) {
  const [rows, setRows] = useState<DayRow[] | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getWorkingHours(barber.id)
      .then((hours) => setRows(toRows(hours)))
      .catch(() => setMessage('No pudimos cargar el horario.'))
  }, [barber.id])

  const update = (index: number, change: Partial<DayRow>) =>
    setRows((current) =>
      current ? current.map((row, i) => (i === index ? { ...row, ...change } : row)) : null,
    )

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!rows) return
    if (hasInvalidRange(rows)) {
      setMessage('La hora de salida debe ser posterior a la de entrada.')
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      await saveWorkingHours(barber.id, toWorkingHours(rows))
      onClose()
    } catch {
      setMessage('No se pudo guardar el horario.')
      setSaving(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>Horario de {barber.name}</h2>
      {rows && (
        <div className={`${styles.wide} ${styles.schedule}`}>
          {rows.map((row, index) => (
            <div key={WEEKDAYS[index]} className={styles.scheduleRow} data-works={row.works}>
              <label className={styles.dayToggle}>
                <input
                  type="checkbox"
                  checked={row.works}
                  onChange={(e) => update(index, { works: e.target.checked })}
                />
                {WEEKDAYS[index]}
              </label>
              <input
                type="time"
                aria-label={`Entrada ${WEEKDAYS[index]}`}
                value={row.start}
                disabled={!row.works}
                onChange={(e) => update(index, { start: e.target.value })}
              />
              <span>a</span>
              <input
                type="time"
                aria-label={`Salida ${WEEKDAYS[index]}`}
                value={row.end}
                disabled={!row.works}
                onChange={(e) => update(index, { end: e.target.value })}
              />
            </div>
          ))}
        </div>
      )}
      {message && <p className={styles.error} role="alert">{message}</p>}
      <div className={styles.formActions}>
        <button
          type="submit"
          className={styles.button}
          data-tone="primary"
          disabled={saving || !rows}
        >
          {saving ? 'Guardando…' : 'Guardar horario'}
        </button>
        <button type="button" className={styles.button} onClick={onClose}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
