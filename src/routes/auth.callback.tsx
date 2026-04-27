import { createFileRoute, useNavigate, useRouteContext } from '@tanstack/react-router'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

function AuthCallbackPage() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const queryClient = useQueryClient()
  const { auth } = useRouteContext({ from: '/auth/callback' })

  useEffect(() => {
    const handleAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        const role = search.role || localStorage.getItem('pending_role')
        
        if (role) {
          // 1. Update DB & Auth Metadata
          await supabase.rpc('set_user_role', { target_role: role })
          await supabase.auth.updateUser({ data: { role } })
          localStorage.removeItem('pending_role')
          
          // 2. Refresh Profile di AuthProvider (ini kuncinya!)
          await auth.refreshProfile()
          
          // 3. Invalidate query cache
          await queryClient.invalidateQueries({ queryKey: ['profile'] })
        }
        
        setTimeout(() => {
          navigate({ to: '/dashboard' })
        }, 500)
      } else {
        navigate({ to: '/login' })
      }
    }

    handleAuth()
  }, [navigate, search.role, queryClient, auth])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
      <div className="text-center space-y-8 p-6">
        <div className="relative w-20 h-20 mx-auto">
          <Loader2 className="w-20 h-20 animate-spin text-red-600" />
          <div className="absolute inset-0 blur-2xl bg-red-600/20 animate-pulse rounded-full" />
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-black italic tracking-tighter text-slate-900 dark:text-white">MENYIAPKAN AKSES {search.role?.toUpperCase() || 'USER'}...</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] max-w-[200px] mx-auto leading-relaxed">
            Sedang mensinkronisasi profil anda dengan database kami.
          </p>
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