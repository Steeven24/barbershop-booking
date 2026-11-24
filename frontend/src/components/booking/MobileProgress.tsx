import styles from './Mobile.module.css'
import { STEPS } from './steps'

/** Compact step header for phones, where the step cards don't fit. */
export default function MobileProgress({ current }: { current: number }) {
  const next = STEPS[current + 1]
  return (
    <div className={styles.progress}>
      <div className={styles.progressText}>
        <strong>
          Paso {current + 1} de {STEPS.length} · {STEPS[current]}
        </strong>
        {next && <span>Siguiente: {next.toLowerCase()}</span>}
      </div>
      <div className={styles.bars} aria-hidden="true">
        {STEPS.map((step, index) => (
          <span
            key={step}
            data-state={index < current ? 'done' : index === current ? 'current' : 'todo'}
          />
        ))}
      </div>
    </div>
  )
}
