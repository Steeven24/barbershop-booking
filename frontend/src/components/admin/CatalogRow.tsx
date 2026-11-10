import type { ReactNode } from 'react'
import styles from './Catalog.module.css'

interface Props {
  title: string
  meta: ReactNode
  active: boolean
  children?: ReactNode
  onEdit: () => void
  onToggleActive: () => void
}

export default function CatalogRow({
  title,
  meta,
  active,
  children,
  onEdit,
  onToggleActive,
}: Props) {
  return (
    <li className={styles.item} data-active={active}>
      <div>
        <span className={styles.itemTitle}>{title}</span>
        <span className={styles.meta}>{meta}</span>
      </div>
      {active ? <span /> : <span className={styles.badge}>Inactivo</span>}
      <div className={styles.actions}>
        {children}
        <button type="button" className={styles.button} onClick={onEdit}>
          Editar
        </button>
        <button
          type="button"
          className={styles.button}
          data-tone={active ? 'danger' : undefined}
          onClick={onToggleActive}
        >
          {active ? 'Desactivar' : 'Activar'}
        </button>
      </div>
    </li>
  )
}
