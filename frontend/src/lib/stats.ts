import type { StatsPeriod } from '../api/types'

export type Tone = 'good' | 'bad' | 'neutral'

export interface Trend {
  text: string
  tone: Tone
}

const weekdayName = new Intl.DateTimeFormat('es-EC', { weekday: 'long' })
const monthName = new Intl.DateTimeFormat('es-EC', { month: 'long' })

/** What the current period is compared with, e.g. "vs. semana pasada". */
export function comparisonLabel(period: StatsPeriod, start: string): string {
  const date = new Date(`${start}T12:00:00`)
  if (period === 'day') return `vs. el ${weekdayName.format(date)} pasado`
  if (period === 'week') return 'vs. semana pasada'
  date.setMonth(date.getMonth() - 1)
  return `vs. ${monthName.format(date)}`
}

/**
 * Change between two values. `unit` decides the wording: a percentage for money,
 * points for rates and a plain difference for counts. `lowerIsBetter` flips the colour.
 */
export function trend(
  current: number,
  previous: number,
  unit: 'percent' | 'points' | 'count',
  vs: string,
  lowerIsBetter = false,
): Trend {
  const diff = current - previous
  if (diff === 0) return { text: `= igual ${vs.replace('vs.', 'que')}`, tone: 'neutral' }
  const arrow = diff > 0 ? '↑' : '↓'
  const better = lowerIsBetter ? diff < 0 : diff > 0
  let amount: string
  if (unit === 'percent') {
    amount = previous ? `${Math.round(Math.abs(diff / previous) * 100)} %` : 'nuevo'
  } else if (unit === 'points') {
    amount = `${Math.abs(diff)} pts`
  } else {
    amount = String(Math.abs(diff))
  }
  return { text: `${arrow} ${amount} ${vs}`, tone: better ? 'good' : 'bad' }
}

/** Greeting for the time of day, in the barbershop's language. */
export function greeting(hour: number): string {
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}
