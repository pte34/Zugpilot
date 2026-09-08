import { useCallback, useState } from 'react'
import { loadHistory, saveHistory } from '../storage/localStore'
import { minuteOfDay } from '../utils/date'
import type { ApiConnection, HistoryEntry } from '../types'

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory())

  const logSelection = useCallback(
    (destinationId: string, connection: ApiConnection, openedAt: Date) => {
      if (!connection.from.departure) return
      const departureDate = new Date(connection.from.departure)
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        destinationId,
        chosenAt: Date.now(),
        weekday: openedAt.getDay(),
        queryMinuteOfDay: minuteOfDay(openedAt),
        departureIso: connection.from.departure,
        departureMinuteOfDay: minuteOfDay(departureDate),
      }
      setHistory((prev) => {
        const next = [...prev, entry]
        saveHistory(next)
        return next
      })
    },
    [],
  )

  return { history, logSelection }
}
