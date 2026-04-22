import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

/**
 * Inicializa la sesión de Supabase al arrancar la app.
 * - Restaura el usuario si ya hay una sesión activa (cookie/localStorage).
 * - Escucha cambios de sesión (login / logout) en tiempo real.
 */
export function useAuthInit() {
  const { setUser, setProfile, setLoading, logout } = useAuthStore()

  useEffect(() => {
    // 1. Leer sesión actual al arrancar
    const init = async () => {
      setLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email! })
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          if (profile) setProfile(profile)
        }
      } finally {
        setLoading(false)
      }
    }

    init()

    // 2. Listener para cambios en tiempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser({ id: session.user.id, email: session.user.email! })
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (profile) setProfile(profile)
      }
      if (event === 'SIGNED_OUT') {
        logout()
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, setProfile, setLoading, logout])
}
