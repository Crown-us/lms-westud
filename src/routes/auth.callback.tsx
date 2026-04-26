import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate({ to: '/dashboard' })
      } else {
        navigate({ to: '/login' })
      }
    })

    // Timeout fallback kalau onAuthStateChange ga trigger
    const timeout = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        navigate({ to: '/dashboard' })
      } else {
        navigate({ to: '/login' })
      }
    }, 2000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 className="w-8 h-8 animate-spin text-red-600" />
    </div>
  )
}

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallbackPage,
})