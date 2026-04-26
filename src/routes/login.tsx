import * as React from 'react'
import { createFileRoute, Link, useNavigate, useSearch } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'
import { ModeToggle } from '@/components/mode-toggle'
import { AlertCircle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'

type Role = 'siswa' | 'guru' | 'admin'

const DUMMY_ACCOUNTS = {
  siswa: { email: 'siswa@westud.com', password: 'password123', name: 'Damon Salvatore' },
  guru: { email: 'guru@westud.com', password: 'password123', name: 'Chico Lachowski' },
  admin: { email: 'admin@westud.com', password: 'password123', name: 'Jordan Barrett' },
}

function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<Role>('siswa')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const search = useSearch({ strict: false })
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      navigate({ to: search.redirect || '/dashboard/' })
    }
  }, [user, navigate, search.redirect])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        navigate({ to: search.redirect || '/dashboard/' })
      }
    } catch (err: any) {
      setError('Terjadi kesalahan saat masuk.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message || 'Gagal login dengan Google')
    }
  }

  const handleGithubLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message || 'Gagal login dengan GitHub')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors duration-300">
      <div className="absolute top-8 right-8">
        <ModeToggle />
      </div>
      
      <Card className="w-full max-w-md border-none shadow-2xl dark:shadow-none rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="space-y-1 pb-8 text-center pt-10">
          <Link to="/" className="text-3xl font-black text-red-600 mb-2 tracking-tighter hover:opacity-80 transition-opacity">WeStud.</Link>
          <CardTitle className="text-2xl font-black tracking-tight dark:text-white text-center w-full">Selamat datang kembali</CardTitle>
          <CardDescription className="dark:text-slate-400 font-medium">Pilih role dan masukkan akun demo Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-8">
          <div className="grid grid-cols-3 gap-3">
            {(['siswa', 'guru', 'admin'] as Role[]).map((role) => (
              <button
                key={role}
                onClick={() => {
                  setSelectedRole(role)
                  setError('')
                  setEmail(DUMMY_ACCOUNTS[role].email)
                  setPassword(DUMMY_ACCOUNTS[role].password)
                }}
                className={`py-3 px-2 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                  selectedRole === role
                    ? 'border-red-600 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-wider">{role}</span>
              </button>
            ))}
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold border border-red-100 dark:border-red-900/30"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left">Email</label>
              <Input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@contoh.com" 
                className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus-visible:ring-red-600 font-bold"
                required
              />
            </div>
            <div className="space-y-2 text-left">
              <div className="flex justify-between items-center ml-1 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Kata Sandi</label>
                <a href="#" className="text-[10px] font-black text-red-600 dark:text-red-400 hover:underline uppercase">Lupa?</a>
              </div>
              <Input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus-visible:ring-red-600 font-bold"
                required
              />
            </div>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-red-100 dark:shadow-none mt-2 transition-all active:scale-95"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : `Masuk sebagai ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pb-10 pt-4 px-8">
          <div className="relative w-full text-center">
            <div className="absolute inset-0 flex items-center text-center">
              <span className="w-full border-t border-slate-100 dark:border-slate-800 text-center"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-center">
              <span className="bg-white dark:bg-slate-900 px-4 text-slate-400 text-center">Atau lanjut dengan</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full">
            <Button 
              variant="outline" 
              type="button"
              onClick={handleGoogleLogin}
              className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 dark:text-white font-black hover:bg-slate-50 dark:hover:bg-slate-800 text-xs"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              GOOGLE
            </Button>
            <Button 
              variant="outline" 
              type="button"
              onClick={handleGithubLogin}
              className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 dark:text-white font-black hover:bg-slate-50 dark:hover:bg-slate-800 text-xs"
            >
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GITHUB
            </Button>
          </div>
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 font-bold uppercase tracking-widest text-center">
            Belum punya akun?{' '}
            <Link to="/" className="text-red-600 dark:text-red-400 hover:underline">Daftar</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: (search.redirect as string) || undefined,
    } as { redirect?: string }
  },
  component: LoginPage,
})