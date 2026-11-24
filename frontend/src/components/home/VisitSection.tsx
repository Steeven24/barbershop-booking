import { business, OPENING_HOURS, whatsappLink } from '../../lib/business'
import styles from './Home.module.css'

export default function VisitSection() {
  const whatsapp = whatsappLink()

  return (
    <section id="visitanos" className={`container ${styles.visit}`}>
      <div className={styles.visitCard}>
        <h2 className={styles.visitTitle}>Visítanos</h2>
        <dl className={styles.hours}>
          {OPENING_HOURS.map(({ days, hours }) => (
            <div key={days} data-closed={!hours}>
              <dt>{days}</dt>
              <dd>{hours ?? 'Cerrado'}</dd>
            </div>
          ))}
        </dl>
        {business.address && (
          <p className={styles.address}>
            <span>Dirección</span>
            {business.address}
          </p>
        )}
        {(whatsapp || business.mapsUrl) && (
          <div className={styles.actions}>
            {whatsapp && (
              <a href={whatsapp} target="_blank" rel="noreferrer" className={styles.darkButton}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12a9 9 0 0 1-13.5 7.8L3 21l1.2-4.5A9 9 0 1 1 21 12z" />
                </svg>
                Escríbenos por WhatsApp
              </a>
            )}
            {business.mapsUrl && (
              <a href={business.mapsUrl} target="_blank" rel="noreferrer"
                className={styles.ghostButton}>
                Cómo llegar
              </a>
            )}
          </div>
        )}
      </div>
      {business.mapsEmbedUrl && (
        <iframe
          className={styles.map}
          src={business.mapsEmbedUrl}
          title={`Mapa de ${business.name}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
    </section>
  )
}
