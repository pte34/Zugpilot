import { useCallback, useEffect, useState } from 'react'
import { loadDestinations, saveDestinations } from '../storage/localStore'
import { deleteDestinationRemote, fetchDestinationsRemote, insertDestinationRemote } from '../storage/supabaseStore'
import type { Destination } from '../types'

/**
 * userId === null -> rein lokal (localStorage), sofort verfuegbar.
 * userId gesetzt   -> Supabase-Sync fuer die eingeloggte Person.
 */
export function useDestinations(userId: string | null) {
  const [destinations, setDestinations] = useState<Destination[]>(() => (userId ? [] : loadDestinations()))
  const [loading, setLoading] = useState(Boolean(userId))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setDestinations(loadDestinations())
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    fetchDestinationsRemote()
      .then(setDestinations)
      .catch(() => setError('Destinationen konnten nicht geladen werden.'))
      .finally(() => setLoading(false))
  }, [userId])

  const addDestination = useCallback(
    async (name: string, from: string, to: string) => {
      if (!userId) {
        setDestinations((prev) => {
          const next: Destination[] = [
            ...prev,
            { id: crypto.randomUUID(), name: name.trim(), from: from.trim(), to: to.trim(), createdAt: Date.now() },
          ]
          saveDestinations(next)
          return next
        })
        return
      }
      try {
        const created = await insertDestinationRemote(name.trim(), from.trim(), to.trim())
        setDestinations((prev) => [...prev, created])
      } catch {
        setError('Destination konnte nicht gespeichert werden.')
      }
    },
    [userId],
  )

  const removeDestination = useCallback(
    async (id: string) => {
      if (!userId) {
        setDestinations((prev) => {
          const next = prev.filter((d) => d.id !== id)
          saveDestinations(next)
          return next
        })
        return
      }
      const previous = destinations
      setDestinations((prev) => prev.filter((d) => d.id !== id))
      try {
        await deleteDestinationRemote(id)
      } catch {
        setError('Destination konnte nicht geloescht werden.')
        setDestinations(previous)
      }
    },
    [userId, destinations],
  )

  return { destinations, addDestination, removeDestination, loading, error }
}
