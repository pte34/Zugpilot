import { useState } from 'react'
import type { FormEvent } from 'react'

interface Props {
  onSubmit: (name: string, from: string, to: string) => void
  onCancel: () => void
}

export function DestinationForm({ onSubmit, onCancel }: Props) {
  const [name, setName] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim() || !from.trim() || !to.trim()) return
    onSubmit(name, from, to)
  }

  return (
    <form className="destination-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Kurzname</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z. B. Zuhause -> Buero"
          autoFocus
          required
        />
      </label>
      <label className="field">
        <span>Von</span>
        <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="z. B. Winterthur" required />
      </label>
      <label className="field">
        <span>Nach</span>
        <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="z. B. Zuerich HB" required />
      </label>
      <div className="destination-form__actions">
        <button type="button" className="button button--ghost" onClick={onCancel}>
          Abbrechen
        </button>
        <button type="submit" className="button button--primary">
          Speichern
        </button>
      </div>
    </form>
  )
}
