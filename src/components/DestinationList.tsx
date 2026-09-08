import { useState } from 'react'
import type { Destination } from '../types'
import { DestinationForm } from './DestinationForm'

interface Props {
  destinations: Destination[]
  onSelect: (destination: Destination) => void
  onAdd: (name: string, from: string, to: string) => void
  onRemove: (id: string) => void
}

export function DestinationList({ destinations, onSelect, onAdd, onRemove }: Props) {
  const [formOpen, setFormOpen] = useState(false)

  function handleAdd(name: string, from: string, to: string) {
    onAdd(name, from, to)
    setFormOpen(false)
  }

  return (
    <div className="view">
      <header className="view__header">
        <h1 className="view__title">ZugPilot</h1>
        <span className="view__subtitle">Deine Verbindungen auf einen Blick</span>
      </header>

      {destinations.length === 0 && !formOpen && (
        <p className="hint">Noch keine Destination angelegt. Leg deine erste Strecke an, z. B. "Zuhause -&gt; Buero".</p>
      )}

      <ul className="destination-list">
        {destinations.map((destination) => (
          <li key={destination.id} className="destination-card">
            <button type="button" className="destination-card__main" onClick={() => onSelect(destination)}>
              <span className="destination-card__name">{destination.name}</span>
              <span className="destination-card__route">
                {destination.from} &rarr; {destination.to}
              </span>
            </button>
            <button
              type="button"
              className="destination-card__remove"
              aria-label={`${destination.name} loeschen`}
              onClick={() => onRemove(destination.id)}
            >
              &times;
            </button>
          </li>
        ))}
      </ul>

      {formOpen ? (
        <DestinationForm onSubmit={handleAdd} onCancel={() => setFormOpen(false)} />
      ) : (
        <button type="button" className="button button--primary add-button" onClick={() => setFormOpen(true)}>
          + Neue Destination
        </button>
      )}
    </div>
  )
}
