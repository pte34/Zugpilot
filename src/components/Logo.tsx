interface Props {
  size?: number
}

/** Gleiches Motiv wie das App-Icon (public/icons) - fuer Wiedererkennung im Header. */
export function Logo({ size = 28 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#1d4ed8" />
      <rect x="16" y="20" width="32" height="22" rx="7" fill="#ffffff" />
      <rect x="21" y="25" width="7" height="8" rx="2" fill="#1d4ed8" />
      <rect x="36" y="25" width="7" height="8" rx="2" fill="#1d4ed8" />
      <circle cx="24" cy="42" r="4" fill="#ffffff" />
      <circle cx="40" cy="42" r="4" fill="#ffffff" />
    </svg>
  )
}
