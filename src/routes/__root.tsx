import { createRootRouteWithContext, Outlet, useLocation, Link } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { ThemeProvider } from '@/components/theme-provider'
import { useAuth } from '@/components/auth-provider'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { QueryClient } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { Loader2, AlertCircle, RefreshCcw, Home, FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MyRouterContext {
  auth: ReturnType<typeof useAuth>
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
  pendingComponent: PendingComponent,
  errorComponent: ErrorComponent,
  notFoundComponent: NotFoundComponent,
})

function NotFoundComponent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 blur-3xl bg-red-600/10 rounded-full animate-pulse"></div>
        <FileQuestion className="w-24 h-24 text-red-600 relative z-10" />
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">404</span>
      </div>
      <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Halaman Hilang!</h2>
      <p className="text-slate-500 dark:text-slate-400 font-bold mb-10 max-sm leading-relaxed">
        Sepertinya kamu tersesat di luar kurikulum. Halaman yang kamu cari tidak ada di server kami.
      </p>
      <Link to="/">
        <Button className="bg-red-600 hover:bg-red-700 text-white rounded-2xl px-10 py-7 h-auto font-black shadow-xl shadow-red-200 dark:shadow-none transition-all hover:scale-105 active:scale-95 group">
          <Home className="w-5 h-5 mr-3 group-hover:-translate-y-0.5 transition-transform" />
          Kembali ke Beranda
        </Button>
      </Link>
    </div>
  )
}

function PendingComponent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="relative">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
        <div className="absolute inset-0 blur-xl bg-red-600/20 animate-pulse rounded-full"></div>
      </div>
      <p className="text-sm font-black text-slate-500 animate-pulse tracking-widest uppercase">Sedang Memuat...</p>
    </div>
  )
}

function ErrorComponent({ error, reset }: { error: any; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-3xl mb-6">
        <AlertCircle className="w-12 h-12 text-red-600" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Waduh, ada masalah!</h2>
      <p className="text-slate-500 dark:text-slate-400 font-bold mb-8 max-w-md">
        Sepertinya terjadi kesalahan saat memuat halaman ini. Jangan panik, coba segarkan kembali.
      </p>
      <div className="flex gap-4">
        <Button 
          onClick={() => reset()} 
          className="bg-red-600 hover:bg-red-700 text-white rounded-2xl px-8 py-6 h-auto font-black shadow-lg shadow-red-200 dark:shadow-none transition-all hover:scale-105 active:scale-95"
        >
          <RefreshCcw className="w-5 h-5 mr-2" />
          Coba Lagi
        </Button>
        <Button 
          variant="outline" 
          onClick={() => window.location.href = '/'}
          className="rounded-2xl px-8 py-6 h-auto font-black border-2 transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          Ke Beranda
        </Button>
      </div>
      {import.meta.env.DEV && (
        <pre className="mt-8 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-mono text-left overflow-auto max-w-full">
          {error.message}
        </pre>
      )}
    </div>
  )
}

function RootComponent() {
  const location = useLocation()
  const isDashboard = location.pathname.startsWith('/dashboard')
  const isLogin = location.pathname === '/login'

  return (
    <ThemeProvider defaultTheme="light" storageKey="lms-theme">
      <div className="bg-grain min-h-screen">
        <Toaster />
        {/* Header hanya muncul di halaman publik, bukan Dashboard atau Login */}
        {!isDashboard && !isLogin && <Header />}
        
        <Outlet />
        
        {/* Footer hanya muncul di halaman publik */}
        {!isDashboard && !isLogin && <Footer />}
        
        <TanStackRouterDevtools />
      </div>
    </ThemeProvider>
  )
}
