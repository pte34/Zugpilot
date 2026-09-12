import type { ApiConnection, HistoryEntry } from '../types'
import { minuteOfDay } from '../utils/date'

/** Wie nah (in Minuten) die aktuelle Uhrzeit an einer vergangenen Anfrage liegen muss, damit sie zählt. */
const TIME_WINDOW_MINUTES = 90
/** Ab wie vielen passenden Vergangenheits-Einträgen wir uns trauen, eine Empfehlung abzugeben. */
const MIN_SAMPLES = 2

export interface Suggestion {
  connection: ApiConnection
  /** Anzahl Vergangenheits-Einträge, auf denen die Empfehlung basiert. */
  sampleSize: number
}

/**
 * Lernlogik des MVP: Schaut sich vergangene Auswahlen für denselben Wochentag
 * und eine ähnliche Tageszeit an ("montags um diese Zeit") und berechnet den
 * durchschnittlichen zeitlichen Abstand zwischen Öffnen der App und der dann
 * gewählten Abfahrt. Dieser Abstand wird auf die aktuelle Zeit angewendet,
 * um unter den frisch geladenen Verbindungen diejenige zu finden, die dem
 * bisherigen Verhalten am nächsten kommt.
 */
export function suggestConnection(
  connections: ApiConnection[],
  history: HistoryEntry[],
  destinationId: string,
  now: Date,
): Suggestion | null {
  const weekday = now.getDay()
  const queryMinute = minuteOfDay(now)

  const relevant = history.filter(
    (entry) =>
      entry.destinationId === destinationId &&
      entry.weekday === weekday &&
      Math.abs(entry.queryMinuteOfDay - queryMinute) <= TIME_WINDOW_MINUTES,
  )

  if (relevant.length < MIN_SAMPLES) {
    return null
  }

  const avgOffset =
    relevant.reduce((sum, entry) => sum + (entry.departureMinuteOfDay - entry.queryMinuteOfDay), 0) /
    relevant.length
  const targetMinute = queryMinute + avgOffset

  let best: ApiConnection | null = null
  let bestDiff = Infinity
  for (const connection of connections) {
    if (!connection.from.departure) continue
    const depMinute = minuteOfDay(new Date(connection.from.departure))
    const diff = Math.abs(depMinute - targetMinute)
    if (diff < bestDiff) {
      bestDiff = diff
      best = connection
    }
  }

  if (!best) return null
  return { connection: best, sampleSize: relevant.length }
}
