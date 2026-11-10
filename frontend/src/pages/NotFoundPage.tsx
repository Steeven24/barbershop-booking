import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <section>
      <h1>Página no encontrada</h1>
      <p>
        La página que buscas no existe. <Link to="/">Volver al inicio</Link>
      </p>
    </section>
  )
}
