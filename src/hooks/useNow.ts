import { useEffect, useState } from 'react'

/** Aktuelle Uhrzeit, die alle `intervalMs` neu ausgewertet wird - Basis für Live-Fortschrittsanzeigen. */
export function useNow(intervalMs = 20_000): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return now
}
