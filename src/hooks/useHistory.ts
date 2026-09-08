import { useCallback, useEffect, useState } from 'react'
import { loadHistory, saveHistory } from '../storage/localStore'
import { fetchHistoryRemote, insertHistoryRemote } from '../storage/supabaseStore'
import { minuteOfDay } from '../utils/date'
import type { ApiConnection, HistoryEntry } from '../types'

/**
 * userId === null -> rein lokal (localStorage), sofort verfuegbar.
 * userId gesetzt   -> Supabase-Sync fuer die eingeloggte Person.
 */
export function useHistory(userId: string | null) {
  const [history, setHistory] = useState<HistoryEntry[]>(() => (userId ? [] : loadHistory()))

  useEffect(() => {
    if (!userId) {
      setHistory(loadHistory())
      return
    }
    fetchHistoryRemote()
      .then(setHistory)
      .catch(() => {
        // Kein Blocker fuer die restliche App: ohne Historie gibt es
        // einfach (noch) keine Empfehlung, die Verbindungsliste bleibt nutzbar.
      })
  }, [userId])

  const logSelection = useCallback(
    async (destinationId: string, connection: ApiConnection, openedAt: Date) => {
      if (!connection.from.departure) return
      const departureDate = new Date(connection.from.departure)
      const base = {
        destinationId,
        chosenAt: Date.now(),
        weekday: openedAt.getDay(),
        queryMinuteOfDay: minuteOfDay(openedAt),
        departureIso: connection.from.departure,
        departureMinuteOfDay: minuteOfDay(departureDate),
      }

      if (!userId) {
        const entry: HistoryEntry = { id: crypto.randomUUID(), ...base }
        setHistory((prev) => {
          const next = [...prev, entry]
          saveHistory(next)
          return next
        })
        return
      }

      try {
        const created = await insertHistoryRemote(base)
        setHistory((prev) => [...prev, created])
      } catch {
        // Auswahl konnte nicht synchronisiert werden - die Lernlogik lernt
        // dann aus diesem einen Tap halt (noch) nicht, die Wahl selbst
        // (Umsteigen in den Zug) ist davon natuerlich nicht betroffen.
      }
    },
    [userId],
  )

  return { history, logSelection }
}
