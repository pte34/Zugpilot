import type { ApiConnection, ApiConnectionsResponse } from '../types'

const BASE_URL = 'https://transport.opendata.ch/v1/connections'

export class TransportApiError extends Error {
  /** true = kein Netzwerk/Server erreichbar, false = Anfrage kam durch, war aber inhaltlich leer/fehlerhaft */
  readonly isNetworkError: boolean

  constructor(message: string, isNetworkError: boolean) {
    super(message)
    this.name = 'TransportApiError'
    this.isNetworkError = isNetworkError
  }
}

/**
 * Ruft die naechsten Verbindungen fuer eine Strecke ab.
 * Wirft TransportApiError mit einer nutzerfreundlichen deutschen Meldung,
 * die direkt in der UI angezeigt werden kann.
 */
export async function fetchConnections(from: string, to: string, limit = 6): Promise<ApiConnection[]> {
  const url = `${BASE_URL}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&limit=${limit}`

  let response: Response
  try {
    response = await fetch(url)
  } catch {
    throw new TransportApiError(
      'Keine Verbindung zum Server. Bitte pruefe deine Internetverbindung.',
      true,
    )
  }

  if (!response.ok) {
    throw new TransportApiError(
      `Der Fahrplan-Dienst antwortet gerade nicht (Fehler ${response.status}). Versuch es spaeter noch einmal.`,
      false,
    )
  }

  let data: ApiConnectionsResponse
  try {
    data = (await response.json()) as ApiConnectionsResponse
  } catch {
    throw new TransportApiError('Antwort des Fahrplan-Dienstes konnte nicht gelesen werden.', false)
  }

  if (!data.connections || data.connections.length === 0) {
    throw new TransportApiError('Fuer diese Strecke wurden keine Verbindungen gefunden.', false)
  }

  return data.connections
}
