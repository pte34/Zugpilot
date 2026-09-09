import type { ApiConnection, ApiStop } from '../types'
import { formatDuration, formatTime } from '../utils/date'
import { TransferBadge } from './TransferBadge'

interface Props {
  connection: ApiConnection
  highlighted?: boolean
  onSelect: () => void
}

function effectivePlatform(stop: ApiStop): { platform: string | null; changed: boolean } {
  const live = stop.prognosis?.platform ?? null
  if (live && live !== stop.platform) {
    return { platform: live, changed: true }
  }
  return { platform: stop.platform, changed: false }
}

function lineBadges(connection: ApiConnection): string[] {
  const fromSections = connection.sections
    .map((section) => {
      if (!section.journey) return null
      const category = section.journey.category ?? ''
      const number = section.journey.number ?? ''
      return `${category}${number}`.trim() || section.journey.name
    })
    .filter((label): label is string => Boolean(label))

  const labels = fromSections.length > 0 ? fromSections : connection.products
  return Array.from(new Set(labels))
}

export function ConnectionCard({ connection, highlighted, onSelect }: Props) {
  const departure = effectivePlatform(connection.from)
  const arrival = effectivePlatform(connection.to)
  const delay = connection.from.delay
  const badges = lineBadges(connection)

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

      <button type="button" className="button button--primary connection-card__select" onClick={onSelect}>
        Diese nehme ich
      </button>
    </article>
  )
}
