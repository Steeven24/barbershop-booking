import styles from './Booking.module.css'
import { STEPS } from './steps'

interface Props {
  current: number
  /** What was chosen in each step, shown under its name */
  values: string[]
  onSelect: (step: number) => void
}

export default function StepIndicator({ current, values, onSelect }: Props) {
  return (
    <ol className={styles.steps}>
      {STEPS.map((label, index) => {
        const state = index < current ? 'done' : index === current ? 'current' : 'todo'
        return (
          <li key={label} data-state={state}>
            <button type="button" disabled={index >= current} onClick={() => onSelect(index)}>
              <span className={styles.stepNumber}>
                {state === 'done' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12l5 5 9-10" />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              <span className={styles.stepText}>
                <span className={styles.stepLabel}>{label}</span>
                <span className={styles.stepValue}>{values[index]}</span>
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
