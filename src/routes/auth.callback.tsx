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
      // 1. Pastikan Session sudah ada
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // Ambil role dari URL atau LocalStorage
        const role = search.role || localStorage.getItem('pending_role')
        
        if (role) {
          console.log("Memulai sinkronisasi role ke:", role)
          
          // 2. Panggil Fungsi SQL Nuklir (RPC)
          // Kita pakai RPC supaya bypass RLS dan dieksekusi di sisi server database
          const { error: rpcError } = await supabase.rpc('set_user_role', { 
            target_role: role 
          })

          if (rpcError) {
            console.error("RPC Error, mencoba cara manual:", rpcError)
            // Backup cara manual kalau RPC belum dipasang
            await supabase.from('profiles').update({ role }).eq('id', session.user.id)
          }

          // 3. Update metadata auth user (buat jaga-jaga)
          await supabase.auth.updateUser({ data: { role } })
          
          // 4. Bersihkan memori
          localStorage.removeItem('pending_role')
          
          // 5. PENTING: Paksa hapus cache profil agar aplikasi narik data terbaru (GURU)
          await queryClient.invalidateQueries({ queryKey: ['profile'] })
          await queryClient.refetchQueries({ queryKey: ['profile', session.user.id] })
          
          console.log("Sinkronisasi Berhasil!")
        }
        
        // Kasih jeda sedikit biar state di AuthProvider sempet ke-reset
        setTimeout(() => {
          navigate({ to: '/dashboard' })
        }, 1500)
      } else {
        // Tunggu sebentar kalau session belum muncul (biasa di mobile)
        const timeout = setTimeout(() => navigate({ to: '/login' }), 5000)
        return () => clearTimeout(timeout)
      }
    }

    handleAuth()
  }, [navigate, search.role, queryClient])

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