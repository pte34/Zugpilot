interface Props {
  transfers: number
}

/**
 * Die zentrale Antwort auf "wie viele Umstiege, auf einen Blick" - deshalb
 * farblich codiert (gruen/blau/orange) und mit eigenem Icon, statt nur als
 * Text in der Meta-Zeile versteckt zu sein.
 */
export function TransferBadge({ transfers }: Props) {
  if (transfers === 0) {
    return (
      <span className="transfer-badge transfer-badge--direct">
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 8.5 6.5 12 13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Direkt
      </span>
    )
  }

  const variant = transfers === 1 ? 'transfer-badge--one' : 'transfer-badge--many'
  return (
    <span className={`transfer-badge ${variant}`}>
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M2 5.5h9.5M11.5 5.5 8.5 2.5M11.5 5.5 8.5 8.5M14 10.5H4.5M4.5 10.5 7.5 7.5M4.5 10.5 7.5 13.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {transfers} Umstieg{transfers > 1 ? 'e' : ''}
    </span>
  )
}
