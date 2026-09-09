import type { Destination, HistoryEntry } from '../types'

// Alle App-Daten leben ausschliesslich im localStorage des Browsers -
// es gibt keinen Server und keine Konten. "Löschen der Browserdaten"
// löscht damit auch ZugPilot-Daten; das ist für das MVP bewusst so.
const DESTINATIONS_KEY = 'zugpilot.destinations.v1'
const HISTORY_KEY = 'zugpilot.history.v1'

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    // Kaputtes/fremdes JSON im Storage darf die App nicht zum Absturz bringen.
    return fallback
  }
}

function writeJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // z. B. Speicher voll oder Storage im Privatmodus deaktiviert.
    // Für das MVP genügt es, den Fehler stillschweigend zu ignorieren,
    // die Änderung bleibt dann nur für die laufende Sitzung im UI sichtbar.
  }
}

export function loadDestinations(): Destination[] {
  return readJson<Destination[]>(DESTINATIONS_KEY, [])
}

export function saveDestinations(destinations: Destination[]): void {
  writeJson(DESTINATIONS_KEY, destinations)
}

export function loadHistory(): HistoryEntry[] {
  return readJson<HistoryEntry[]>(HISTORY_KEY, [])
}

export function saveHistory(history: HistoryEntry[]): void {
  writeJson(HISTORY_KEY, history)
}
