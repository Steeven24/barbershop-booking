import styles from './Booking.module.css'

export const STEPS = ['Servicio', 'Barbero', 'Fecha y hora', 'Tus datos'] as const

interface Props {
  current: number
  onSelect: (step: number) => void
}

export default function StepIndicator({ current, onSelect }: Props) {
  return (
    <ol className={styles.steps}>
      {STEPS.map((label, index) => {
        const state = index < current ? 'done' : index === current ? 'current' : 'todo'
        return (
          <li key={label} data-state={state}>
            <button type="button" disabled={index >= current} onClick={() => onSelect(index)}>
              <span className={styles.stepNumber}>{index + 1}</span>
              <span className={styles.stepLabel}>{label}</span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
