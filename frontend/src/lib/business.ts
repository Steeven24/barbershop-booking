// Public business details, set per deployment through VITE_* variables.
// Anything left empty is simply not shown.
const env = import.meta.env

export const business = {
  name: 'La Navaja Barbería',
  city: env.VITE_BUSINESS_CITY ?? '',
  address: env.VITE_BUSINESS_ADDRESS ?? '',
  /** International format without "+" or spaces, e.g. 593991234567 */
  whatsapp: env.VITE_BUSINESS_WHATSAPP ?? '',
  mapsUrl: env.VITE_BUSINESS_MAPS_URL ?? '',
  /** "Embed a map" URL from Google Maps (Share › Embed a map) */
  mapsEmbedUrl: env.VITE_BUSINESS_MAPS_EMBED_URL ?? '',
}

export const OPENING_HOURS = [
  { days: 'Lunes a viernes', hours: '09:00 – 19:00' },
  { days: 'Sábado', hours: '09:00 – 15:00' },
  { days: 'Domingo', hours: null },
]

export const whatsappLink = (text = 'Hola, quiero hacer una consulta') =>
  business.whatsapp ? `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(text)}` : ''
