import { useCallback, useState } from 'react'
import { loadDestinations, saveDestinations } from '../storage/localStore'
import type { Destination } from '../types'

export function useDestinations() {
  const [destinations, setDestinations] = useState<Destination[]>(() => loadDestinations())

  const addDestination = useCallback((name: string, from: string, to: string) => {
    setDestinations((prev) => {
      const next: Destination[] = [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: name.trim(),
          from: from.trim(),
          to: to.trim(),
          createdAt: Date.now(),
        },
      ]
      saveDestinations(next)
      return next
    })
  }, [])

  const removeDestination = useCallback((id: string) => {
    setDestinations((prev) => {
      const next = prev.filter((d) => d.id !== id)
      saveDestinations(next)
      return next
    })
  }, [])

  return { destinations, addDestination, removeDestination }
}
