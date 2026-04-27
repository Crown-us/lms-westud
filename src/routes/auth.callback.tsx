import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

function AuthCallbackPage() {
  const navigate = useNavigate()
  const search = Route.useSearch()

  useEffect(() => {
    const handleAuth = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error("Session error:", sessionError)
        return navigate({ to: '/login' })
      }

      if (session) {
        const role = search.role
        console.log("User detected, role from URL:", role)
        
        if (role) {
          try {
            // 1. Update Auth Metadata (Supabase Internal)
            const { error: authError } = await supabase.auth.updateUser({
              data: { role: role }
            })
            if (authError) console.error("Auth metadata update error:", authError)

            // 2. Update Profiles Table
            const { error: profileError } = await supabase
              .from('profiles')
              .update({ role })
              .eq('id', session.user.id)
            
            if (profileError) {
              console.error("Profile table update error:", profileError)
              // Kalau update gagal, coba insert (jaga-jaga kalau trigger gagal)
              await supabase.from('profiles').upsert({
                id: session.user.id,
                email: session.user.email,
                role: role,
                name: session.user.user_metadata.full_name || session.user.email?.split('@')[0]
              })
            }
            
            console.log("Role update sequence completed")
          } catch (e) {
            console.error("Unexpected error during role sync:", e)
          }
        }
        
        // Kasih delay dikit biar update-nya masuk ke DB sebelum pindah
        setTimeout(() => {
          navigate({ to: '/dashboard' })
        }, 800)
      } else {
        // Fallback listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
            const role = search.role
            if (role) {
              await supabase.from('profiles').update({ role }).eq('id', session.user.id)
              await supabase.auth.updateUser({ data: { role } })
            }
            navigate({ to: '/dashboard' })
            subscription.unsubscribe()
          }
        })
      }
    }

    handleAuth()
  }, [navigate, search.role])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center space-y-6">
        <div className="relative w-16 h-16 mx-auto">
          <Loader2 className="w-16 h-16 animate-spin text-red-600" />
          <div className="absolute inset-0 blur-xl bg-red-600/20 animate-pulse rounded-full" />
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-800 dark:text-white">Sinkronisasi Akun</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mohon tunggu sebentar...</p>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/auth/callback')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      role: (search.role as string) || undefined,
    }
  },
  component: AuthCallbackPage,
})