import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * Ohne diese beiden Umgebungsvariablen laeuft ZugPilot komplett lokal
 * (localStorage) weiter - Supabase ist ein rein optionales Sync-Feature.
 * Siehe README.md, Abschnitt "Optional: Supabase-Sync".
 */
export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured ? createClient(url as string, anonKey as string) : null
