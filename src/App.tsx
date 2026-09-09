import { useState } from 'react'
import { ConnectionsView } from './components/ConnectionsView'
import { DestinationList } from './components/DestinationList'
import { Login } from './components/Login'
import { useAuth } from './hooks/useAuth'
import { useDestinations } from './hooks/useDestinations'
import { useHistory } from './hooks/useHistory'
import type { Destination } from './types'

export default function App() {
  const { isConfigured, session, loading: authLoading, signInWithEmail, signOut } = useAuth()
  const userId = isConfigured && session ? session.user.id : null

  const { destinations, addDestination, removeDestination } = useDestinations(userId)
  const { history, logSelection } = useHistory(userId)
  const [selected, setSelected] = useState<Destination | null>(null)

  // Nur relevant, wenn Supabase überhaupt konfiguriert ist (siehe
  // src/lib/supabaseClient.ts) - sonst läuft die App direkt rein lokal.
  if (isConfigured && authLoading) {
    return (
      <div className="view">
        <p className="hint">Wird geladen…</p>
      </div>
    )
  }
  if (isConfigured && !session) {
    return <Login onSubmit={signInWithEmail} />
  }

  if (selected) {
    return (
      <ConnectionsView
        destination={selected}
        history={history}
        onSelectConnection={(connection, openedAt) => logSelection(selected.id, connection, openedAt)}
        onBack={() => setSelected(null)}
      />
    )
  }

  return (
    <DestinationList
      destinations={destinations}
      onSelect={setSelected}
      onAdd={addDestination}
      onRemove={removeDestination}
      email={isConfigured ? session?.user.email ?? null : null}
      onSignOut={isConfigured ? signOut : undefined}
    />
  )
}
