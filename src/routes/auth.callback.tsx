import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

function AuthCallbackPage() {
  const navigate = useNavigate()
  const search = Route.useSearch()

  useEffect(() => {
    const handleAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        const role = search.role
        
        if (role) {
          // Paksa update role di profil kalau ada di URL
          await supabase
            .from('profiles')
            .update({ role })
            .eq('id', session.user.id)
        }
        
        navigate({ to: '/dashboard' })
      } else {
        // Cek lagi lewat onAuthStateChange buat jaga-jaga
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session) {
            const role = search.role
            if (role) {
              await supabase.from('profiles').update({ role }).eq('id', session.user.id)
            }
            navigate({ to: '/dashboard' })
            subscription.unsubscribe()
          }
        })
      }
    }

    handleAuth()

    const timeout = setTimeout(() => {
      navigate({ to: '/login' })
    }, 5000)

    return () => clearTimeout(timeout)
  }, [navigate, search.role])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-red-600 mx-auto" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Menyiapkan Dashboard...</p>
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