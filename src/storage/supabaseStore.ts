import { supabase } from '../lib/supabaseClient'
import type { Destination, HistoryEntry } from '../types'

interface DestinationRow {
  id: string
  name: string
  from_station: string
  to_station: string
  created_at: string
}

interface HistoryRow {
  id: string
  destination_id: string
  chosen_at: string
  weekday: number
  query_minute_of_day: number
  departure_iso: string
  departure_minute_of_day: number
}

function destinationFromRow(row: DestinationRow): Destination {
  return {
    id: row.id,
    name: row.name,
    from: row.from_station,
    to: row.to_station,
    createdAt: new Date(row.created_at).getTime(),
  }
}

function historyFromRow(row: HistoryRow): HistoryEntry {
  return {
    id: row.id,
    destinationId: row.destination_id,
    chosenAt: new Date(row.chosen_at).getTime(),
    weekday: row.weekday,
    queryMinuteOfDay: row.query_minute_of_day,
    departureIso: row.departure_iso,
    departureMinuteOfDay: row.departure_minute_of_day,
  }
}

function client() {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert.')
  return supabase
}

export async function fetchDestinationsRemote(): Promise<Destination[]> {
  const { data, error } = await client().from('destinations').select('*').order('created_at', { ascending: true })
  if (error) throw error
  return (data as DestinationRow[]).map(destinationFromRow)
}

export async function insertDestinationRemote(name: string, from: string, to: string): Promise<Destination> {
  const { data, error } = await client()
    .from('destinations')
    .insert({ name, from_station: from, to_station: to })
    .select()
    .single()
  if (error) throw error
  return destinationFromRow(data as DestinationRow)
}

export async function deleteDestinationRemote(id: string): Promise<void> {
  const { error } = await client().from('destinations').delete().eq('id', id)
  if (error) throw error
}

export async function fetchHistoryRemote(): Promise<HistoryEntry[]> {
  const { data, error } = await client().from('history_entries').select('*')
  if (error) throw error
  return (data as HistoryRow[]).map(historyFromRow)
}

export async function insertHistoryRemote(entry: Omit<HistoryEntry, 'id'>): Promise<HistoryEntry> {
  const { data, error } = await client()
    .from('history_entries')
    .insert({
      destination_id: entry.destinationId,
      chosen_at: new Date(entry.chosenAt).toISOString(),
      weekday: entry.weekday,
      query_minute_of_day: entry.queryMinuteOfDay,
      departure_iso: entry.departureIso,
      departure_minute_of_day: entry.departureMinuteOfDay,
    })
    .select()
    .single()
  if (error) throw error
  return historyFromRow(data as HistoryRow)
}
