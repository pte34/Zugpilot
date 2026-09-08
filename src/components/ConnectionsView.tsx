import { useMemo, useState } from 'react'
import { useConnections } from '../hooks/useConnections'
import { suggestConnection } from '../learning/suggest'
import type { ApiConnection, Destination, HistoryEntry } from '../types'
import { ConnectionCard } from './ConnectionCard'

interface Props {
  destination: Destination
  history: HistoryEntry[]
  onSelectConnection: (connection: ApiConnection, openedAt: Date) => void
  onBack: () => void
}

export function ConnectionsView({ destination, history, onSelectConnection, onBack }: Props) {
  const { connections, loading, error, openedAt, reload } = useConnections(destination)
  const [confirmed, setConfirmed] = useState(false)

  const suggestion = useMemo(() => {
    if (!openedAt || connections.length === 0) return null
    return suggestConnection(connections, history, destination.id, openedAt)
  }, [connections, history, destination.id, openedAt])

  function handleSelect(connection: ApiConnection) {
    if (!openedAt) return
    onSelectConnection(connection, openedAt)
    setConfirmed(true)
  }

  const otherConnections = suggestion
    ? connections.filter((c) => c !== suggestion.connection)
    : connections

  return (
    <div className="view">
      <header className="view__header">
        <button type="button" className="button button--ghost" onClick={onBack}>
          &larr; Zurueck
        </button>
        <h1 className="view__title">{destination.name}</h1>
        <span className="view__subtitle">
          {destination.from} &rarr; {destination.to}
        </span>
      </header>

      {confirmed && (
        <div className="banner banner--success">
          Verbindung gespeichert. Beim naechsten Mal lernt ZugPilot daraus.
        </div>
      )}

      {loading && <p className="hint">Verbindungen werden geladen…</p>}

      {error && !loading && (
        <div className="banner banner--error">
          <p>{error}</p>
          <button type="button" className="button button--secondary" onClick={reload}>
            Erneut versuchen
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="connection-list">
          {suggestion && (
            <ConnectionCard
              connection={suggestion.connection}
              highlighted
              onSelect={() => handleSelect(suggestion.connection)}
            />
          )}
          {otherConnections.map((connection, index) => (
            <ConnectionCard
              key={connection.from.departure ?? index}
              connection={connection}
              onSelect={() => handleSelect(connection)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
