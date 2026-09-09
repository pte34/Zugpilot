import { useMemo, useState } from 'react'
import { useConnections } from '../hooks/useConnections'
import { suggestConnection } from '../learning/suggest'
import { formatTime } from '../utils/date'
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
  const [confirmedConnection, setConfirmedConnection] = useState<ApiConnection | null>(null)

  const suggestion = useMemo(() => {
    if (!openedAt || connections.length === 0) return null
    return suggestConnection(connections, history, destination.id, openedAt)
  }, [connections, history, destination.id, openedAt])

  function handleSelect(connection: ApiConnection) {
    if (!openedAt) return
    onSelectConnection(connection, openedAt)
    setConfirmedConnection(connection)
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

      {confirmedConnection ? (
        <>
          <div className="banner banner--success">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }}>
              <path d="M3 8.5 6.5 12 13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p>
              Gespeichert: {destination.from} {formatTime(confirmedConnection.from.departure)} &rarr; {destination.to}{' '}
              {formatTime(confirmedConnection.to.arrival)}. Beim naechsten Mal lernt ZugPilot daraus.
            </p>
          </div>
          <ConnectionCard connection={confirmedConnection} defaultExpanded hideSelect onSelect={() => {}} />
          <button type="button" className="button button--secondary" onClick={() => setConfirmedConnection(null)}>
            Andere Verbindung waehlen
          </button>
        </>
      ) : (
        <>
          {loading && (
            <div className="skeleton-list">
              <div className="skeleton-card" />
              <div className="skeleton-card" />
              <div className="skeleton-card" />
            </div>
          )}

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
        </>
      )}
    </div>
  )
}
