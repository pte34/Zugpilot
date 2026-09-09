import { useCallback, useEffect, useState } from 'react'
import { fetchConnections, TransportApiError } from '../api/transport'
import type { ApiConnection, Destination } from '../types'

interface State {
  connections: ApiConnection[]
  loading: boolean
  error: string | null
  /** Zeitpunkt des (letzten erfolgreichen) Abrufs - Basis für die Lernlogik. */
  openedAt: Date | null
}

export function useConnections(destination: Destination) {
  const [state, setState] = useState<State>({ connections: [], loading: true, error: null, openedAt: null })

  const load = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    const requestTime = new Date()
    fetchConnections(destination.from, destination.to)
      .then((connections) => {
        setState({ connections, loading: false, error: null, openedAt: requestTime })
      })
      .catch((err: unknown) => {
        const message = err instanceof TransportApiError ? err.message : 'Unbekannter Fehler beim Laden der Verbindungen.'
        setState({ connections: [], loading: false, error: message, openedAt: null })
      })
  }, [destination.from, destination.to])

  useEffect(() => {
    load()
  }, [load])

  return { ...state, reload: load }
}
