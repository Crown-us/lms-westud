import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

function AuthCallbackPage() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const queryClient = useQueryClient()

  useEffect(() => {
    const handleAuth = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error("Session error:", sessionError)
        return navigate({ to: '/login' })
      }

      if (session) {
        // Ambil role dari URL atau dari LocalStorage (backup buat mobile)
        const role = search.role || localStorage.getItem('pending_role')
        console.log("Syncing role:", role)
        
        if (role) {
          try {
            // 1. Update Auth Metadata Supabase
            await supabase.auth.updateUser({ data: { role } })

            // 2. Maksa Update/Insert ke Tabel Profiles (UPSERT)
            // Ini yang paling krusial buat nembus trigger DB yang telat
            await supabase
              .from('profiles')
              .upsert({
                id: session.user.id,
                email: session.user.email,
                role: role,
                name: session.user.user_metadata.full_name || session.user.email?.split('@')[0],
                avatar_url: session.user.user_metadata.avatar_url
              }, { onConflict: 'id' })
            
            // Bersihkan backup
            localStorage.removeItem('pending_role')
            
            // 3. PENTING: Hapus cache profile biar dashboard nggak pake data lama (siswa)
            await queryClient.invalidateQueries({ queryKey: ['profile', session.user.id] })
            
            console.log("Role sync successful as:", role)
          } catch (e) {
            console.error("Sync failed:", e)
          }
        }
        
        // Delay 1 detik buat mastiin database beneran selesai nulis
        setTimeout(() => {
          navigate({ to: '/dashboard' })
        }, 1000)
      } else {
        // Kalau nggak ada session, balik login
        navigate({ to: '/login' })
      }
    }

    handleAuth()
  }, [navigate, search.role, queryClient])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center space-y-6">
        <div className="relative w-16 h-16 mx-auto">
          <Loader2 className="w-16 h-16 animate-spin text-red-600" />
          <div className="absolute inset-0 blur-xl bg-red-600/20 animate-pulse rounded-full" />
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-800 dark:text-white">Sinkronisasi Akun</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Menyiapkan profil Anda...</p>
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