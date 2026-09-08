// Eine vom Nutzer angelegte Strecke, z. B. "Zuhause -> Buero".
export interface Destination {
  id: string
  name: string
  from: string
  to: string
  createdAt: number
}

// Ein Protokoll-Eintrag: welche Verbindung wurde wann fuer welche
// Destination ausgewaehlt. Bildet die Grundlage der Lernlogik.
export interface HistoryEntry {
  id: string
  destinationId: string
  chosenAt: number
  /** 0 = Sonntag ... 6 = Samstag (JS Date#getDay) */
  weekday: number
  /** Minuten seit Mitternacht, zum Zeitpunkt des Oeffnens der Verbindungsliste */
  queryMinuteOfDay: number
  departureIso: string
  /** Minuten seit Mitternacht der gewaehlten Abfahrt */
  departureMinuteOfDay: number
}

// --- transport.opendata.ch Antwortformat (nur die Felder, die wir nutzen) ---

export interface ApiStation {
  id: string | null
  name: string | null
}

export interface ApiPrognosis {
  platform: string | null
  departure: string | null
  arrival: string | null
}

export interface ApiStop {
  station: ApiStation
  arrival: string | null
  departure: string | null
  delay: number | null
  platform: string | null
  prognosis: ApiPrognosis | null
}

export interface ApiJourney {
  name: string | null
  category: string | null
  number: string | null
  to: string | null
}

export interface ApiSection {
  journey: ApiJourney | null
  walk: boolean | null
  departure: ApiStop
  arrival: ApiStop
}

export interface ApiConnection {
  from: ApiStop
  to: ApiStop
  duration: string
  transfers: number
  products: string[]
  sections: ApiSection[]
}

export interface ApiConnectionsResponse {
  connections: ApiConnection[]
}
