import { useState } from 'react'
import { ConnectionsView } from './components/ConnectionsView'
import { DestinationList } from './components/DestinationList'
import { useDestinations } from './hooks/useDestinations'
import { useHistory } from './hooks/useHistory'
import type { Destination } from './types'

export default function App() {
  const { destinations, addDestination, removeDestination } = useDestinations()
  const { history, logSelection } = useHistory()
  const [selected, setSelected] = useState<Destination | null>(null)

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
    />
  )
}
