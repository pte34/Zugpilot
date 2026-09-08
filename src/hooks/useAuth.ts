import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'

interface AuthState {
  session: Session | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    session: null,
    loading: isSupabaseConfigured,
  })

  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession().then(({ data }) => {
      setState({ session: data.session, loading: false })
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ session, loading: false })
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function signInWithEmail(email: string): Promise<string | null> {
    if (!supabase) return 'Supabase ist nicht konfiguriert.'
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.href },
    })
    return error?.message ?? null
  }

  async function signOut() {
    await supabase?.auth.signOut()
  }

  return {
    isConfigured: isSupabaseConfigured,
    session: state.session,
    loading: state.loading,
    signInWithEmail,
    signOut,
  }
}
