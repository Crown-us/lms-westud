import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { useAuth } from '@/components/auth-provider'

export function Header() {
  const { user } = useAuth()

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b dark:border-slate-800 h-20">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link to="/" className="w-32 text-2xl font-black text-red-600 tracking-tighter hover:opacity-80 transition-opacity shrink-0">
            WeStud.
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500 dark:text-slate-400">
            <Link to="/courses" className="hover:text-red-600 transition-colors [&.active]:text-red-600 whitespace-nowrap">Kursus</Link>
            <Link to="/mentors" className="hover:text-red-600 transition-colors [&.active]:text-red-600 whitespace-nowrap">Mentor</Link>
            <Link to="/pricing" className="hover:text-red-600 transition-colors [&.active]:text-red-600 whitespace-nowrap">Harga</Link>
            <Link to="/enterprise" className="hover:text-red-600 transition-colors [&.active]:text-red-600 whitespace-nowrap">Perusahaan</Link>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 pr-4 border-r dark:border-slate-800 mr-2 text-left">
            <ModeToggle />
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard">
                <Button className="bg-red-600 hover:bg-red-700 text-white font-black rounded-xl px-6 h-10 shadow-md shadow-red-100 dark:shadow-none transition-all active:scale-95 text-xs whitespace-nowrap">
                  Ke Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login" search={{}} className="hidden sm:block">
                  <Button variant="ghost" className="font-bold text-slate-600 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-xl px-5 h-10 whitespace-nowrap text-left">
                    Masuk
                  </Button>
                </Link>
                <Link to="/login" search={{}}>
                  <Button className="bg-red-600 hover:bg-red-700 text-white font-black rounded-xl px-6 h-10 shadow-md shadow-red-100 dark:shadow-none transition-all active:scale-95 text-xs whitespace-nowrap text-left">
                    Daftar Sekarang
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
