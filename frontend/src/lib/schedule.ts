import type { WorkingHours } from '../api/types'

export const WEEKDAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export interface DayRow {
  works: boolean
  start: string
  end: string
}

/** One row per weekday (0 = Monday), days without hours are days off. */
export const toRows = (hours: WorkingHours[]): DayRow[] =>
  WEEKDAYS.map((_, weekday) => {
    const day = hours.find((h) => h.weekday === weekday)
    // The API returns "HH:MM:SS"; time inputs work with "HH:MM"
    return day
      ? { works: true, start: day.start_time.slice(0, 5), end: day.end_time.slice(0, 5) }
      : { works: false, start: '09:00', end: '18:00' }
  })

export const toWorkingHours = (rows: DayRow[]): WorkingHours[] =>
  rows.flatMap((row, weekday) =>
    row.works ? [{ weekday, start_time: row.start, end_time: row.end }] : [],
  )

export const hasInvalidRange = (rows: DayRow[]) =>
  rows.some((row) => row.works && row.start >= row.end)
