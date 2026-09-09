import { useState } from 'react'
import type { FormEvent } from 'react'
import { Logo } from './Logo'

interface Props {
  onSubmit: (email: string) => Promise<string | null>
}

export function Login({ onSubmit }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!email.trim()) return
    setStatus('sending')
    setError(null)
    const message = await onSubmit(email.trim())
    if (message) {
      setError(message)
      setStatus('idle')
    } else {
      setStatus('sent')
    }
  }

  return (
    <div className="view">
      <header className="view__header">
        <div className="view__brand">
          <Logo />
          <h1 className="view__title">ZugPilot</h1>
        </div>
        <span className="view__subtitle">Anmelden, um deine Destinationen geraeteuebergreifend zu synchronisieren</span>
      </header>

      {status === 'sent' ? (
        <div className="banner banner--success">
          Link verschickt an {email}. E-Mail oeffnen und auf den Link tippen, um dich anzumelden.
        </div>
      ) : (
        <form className="destination-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>E-Mail-Adresse</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="du@beispiel.ch"
              required
              autoFocus
            />
          </label>
          {error && <p className="hint" style={{ color: 'var(--color-error-text)' }}>{error}</p>}
          <button type="submit" className="button button--primary" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sende Link…' : 'Anmelde-Link senden'}
          </button>
        </form>
      )}
    </div>
  )
}
