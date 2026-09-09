import { useState } from 'react'
import type { ApiConnection, ApiSection, ApiStop } from '../types'
import { formatDuration, formatTime } from '../utils/date'
import { TransferBadge } from './TransferBadge'

interface Props {
  connection: ApiConnection
  highlighted?: boolean
  onSelect: () => void
  /** Direkt aufgeklappt anzeigen, z. B. fuer die gerade bestaetigte Verbindung. */
  defaultExpanded?: boolean
  /** Fuer die Bestaetigungs-Ansicht: "Diese nehme ich" ist dann nicht mehr sinnvoll. */
  hideSelect?: boolean
}

function effectivePlatform(stop: ApiStop): { platform: string | null; changed: boolean } {
  const live = stop.prognosis?.platform ?? null
  if (live && live !== stop.platform) {
    return { platform: live, changed: true }
  }
  return { platform: stop.platform, changed: false }
}

function lineLabel(section: ApiSection): string {
  if (!section.journey) return 'Fussweg'
  const category = section.journey.category ?? ''
  const number = section.journey.number ?? ''
  return `${category}${number}`.trim() || section.journey.name || 'Verbindung'
}

function lineBadges(connection: ApiConnection): string[] {
  const fromSections = connection.sections
    .map((section) => (section.journey ? lineLabel(section) : null))
    .filter((label): label is string => Boolean(label))

  const labels = fromSections.length > 0 ? fromSections : connection.products
  return Array.from(new Set(labels))
}

/** Nur Etappen mit eigener Station/Zeit sind fuer die Routen-Anzeige relevant. */
function relevantSections(connection: ApiConnection): ApiSection[] {
  return connection.sections.filter((section) => section.departure.station.name && section.arrival.station.name)
}

export function ConnectionCard({ connection, highlighted, onSelect, defaultExpanded, hideSelect }: Props) {
  const [expanded, setExpanded] = useState(Boolean(defaultExpanded))
  const departure = effectivePlatform(connection.from)
  const arrival = effectivePlatform(connection.to)
  const delay = connection.from.delay
  const badges = lineBadges(connection)
  const steps = relevantSections(connection)

  return (
    <article className={`connection-card${highlighted ? ' connection-card--highlighted' : ''}`}>
      {highlighted && <div className="connection-card__badge">Fuer dich empfohlen</div>}
      <div className="connection-card__header">
        <div className="connection-card__times">
          <div className="connection-card__time-block">
            <span className="connection-card__time">{formatTime(connection.from.departure)}</span>
            {delay !== null && delay > 0 && <span className="connection-card__delay">+{delay} Min.</span>}
            {departure.platform && (
              <span className={`connection-card__platform${departure.changed ? ' connection-card__platform--changed' : ''}`}>
                Gleis {departure.platform}
              </span>
            )}
          </div>
          <span className="connection-card__arrow" aria-hidden="true">
            &rarr;
          </span>
          <div className="connection-card__time-block">
            <span className="connection-card__time">{formatTime(connection.to.arrival)}</span>
            {arrival.platform && (
              <span className={`connection-card__platform${arrival.changed ? ' connection-card__platform--changed' : ''}`}>
                Gleis {arrival.platform}
              </span>
            )}
          </div>
        </div>
        <TransferBadge transfers={connection.transfers} />
      </div>

      <div className="connection-card__meta">
        <span>{formatDuration(connection.duration)}</span>
        {badges.length > 0 && (
          <div className="connection-card__lines">
            {badges.map((label) => (
              <span key={label} className="connection-card__line-badge">
                {label}
              </span>
            ))}
          </div>
        )}
      </div>

      {steps.length > 0 && (
        <button
          type="button"
          className="connection-card__details-toggle"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
        >
          {expanded ? 'Strecke ausblenden' : 'Strecke & Haltestellen anzeigen'}
          <svg
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
            style={{ transform: expanded ? 'rotate(180deg)' : undefined }}
          >
            <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {expanded && (
        <ol className="route-steps">
          {steps.map((section, index) => {
            const stepDeparture = effectivePlatform(section.departure)
            const stepArrival = effectivePlatform(section.arrival)
            const isWalk = !section.journey
            return (
              <li key={index} className="route-step">
                <div className={`route-step__line${isWalk ? ' route-step__line--walk' : ''}`}>{lineLabel(section)}</div>
                <div className="route-step__stops">
                  <div className="route-step__stop">
                    <span className="route-step__station">{section.departure.station.name}</span>
                    <span className="route-step__time">
                      {formatTime(section.departure.departure)}
                      {stepDeparture.platform && <> &middot; Gleis {stepDeparture.platform}</>}
                    </span>
                  </div>
                  <div className="route-step__stop">
                    <span className="route-step__station">{section.arrival.station.name}</span>
                    <span className="route-step__time">
                      {formatTime(section.arrival.arrival)}
                      {stepArrival.platform && <> &middot; Gleis {stepArrival.platform}</>}
                    </span>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      )}

      {!hideSelect && (
        <button type="button" className="button button--primary connection-card__select" onClick={onSelect}>
          Diese nehme ich
        </button>
      )}
    </article>
  )
}
