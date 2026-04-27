import * as React from 'react'
import { createFileRoute, Link, Outlet, useNavigate, redirect, useRouteContext } from '@tanstack/react-router'
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  Settings, 
  LogOut, 
  Search, 
  Bell,
  Users,
  MessageSquare,
  Loader2,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ModeToggle } from '@/components/mode-toggle'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { profileQueries } from '@/lib/queries'

function DashboardPending() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 min-h-[400px]">
      <div className="relative">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
        <div className="absolute inset-0 blur-lg bg-red-600/10 animate-pulse rounded-full"></div>
      </div>
      <p className="text-xs font-black text-slate-400 animate-pulse tracking-widest uppercase">Memuat Konten...</p>
    </div>
  )
}

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
  const navigate = useNavigate()
  const [globalSearch, setGlobalSearch] = React.useState('')
  const { auth } = useRouteContext({ from: '/dashboard' })
  const user = auth.user

  const { data: profile } = useQuery(profileQueries.detail(user?.id))

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate({ to: '/' })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (globalSearch.trim()) {
      navigate({ 
        to: '/dashboard/courses', 
        search: (prev: any) => ({ ...prev, q: globalSearch }) 
      })
      setGlobalSearch('')
    }
  }

  const userName = profile?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const userRole = profile?.role || 'siswa'
  const userAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
    { icon: BookOpen, label: 'Kursus Saya', to: '/dashboard/courses' },
    { icon: Calendar, label: 'Jadwal', to: '/dashboard/schedule' },
    { icon: MessageSquare, label: 'Chat & Diskusi', to: '/dashboard/messages' },
    ...(userRole === 'guru' ? [
      { icon: Users, label: 'Daftar Murid', to: '/dashboard/students' },
    ] : []),
    { icon: Settings, label: 'Pengaturan', to: '/dashboard/settings' },
  ]

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans transition-colors duration-300 relative">
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[40] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-[50] lg:relative bg-white dark:bg-slate-900 border-r dark:border-slate-800 transition-all duration-300 flex flex-col ${isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0 w-72 lg:w-64'}`}>
        <div className="p-6 mb-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-red-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-red-100 dark:shadow-none shrink-0">
              <span className="text-white font-bold text-xl font-black">W</span>
            </div>
            <span className="font-black text-xl text-slate-800 dark:text-white tracking-tighter">WeStud</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="lg:hidden rounded-xl">
            <X className="w-5 h-5 text-slate-500" />
          </Button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 transition-all group [&.active]:bg-red-600 [&.active]:text-white [&.active]:shadow-lg [&.active]:shadow-red-100 dark:[&.active]:shadow-none"
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="font-semibold text-left">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t dark:border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all w-full group"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="font-semibold text-left">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white dark:bg-slate-900 border-b dark:border-slate-800 shrink-0 z-30">
          <div className="max-w-[1400px] mx-auto w-full h-full flex items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4 flex-1 text-left min-w-0">
               <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="lg:hidden rounded-xl shrink-0">
                  <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
               </Button>
               
               <form onSubmit={handleSearch} className="relative w-full max-w-xl hidden sm:block">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    placeholder="Cari kursus Anda..." 
                    className="pl-12 h-11 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus-visible:ring-red-600 focus-visible:bg-white dark:focus-visible:bg-slate-700 transition-all w-full dark:text-white font-bold"
                  />
               </form>
            </div>

            <div className="flex items-center gap-4 md:gap-6 shrink-0">
              <ModeToggle />

              <Button variant="ghost" size="icon" className="relative text-slate-500 dark:text-slate-400 rounded-xl">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              </Button>

              <div className="flex items-center gap-3 pl-4 border-l dark:border-slate-800">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-black text-slate-800 dark:text-white truncate max-w-[120px] uppercase tracking-tight">{userName}</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 dark:text-red-400">{userRole}</div>
                </div>
                <Avatar className="h-10 w-10 border-2 border-red-100 dark:border-red-900/50 p-0.5 rounded-full">
                  <AvatarImage src={userAvatar} className="rounded-full" />
                  <AvatarFallback className="rounded-full font-black bg-slate-100 dark:bg-slate-800 text-slate-400">{userName.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950 p-4 md:p-8">
           <div className="max-w-[1400px] mx-auto w-full">
              <Outlet />
           </div>
        </main>      </div>
    </div>
  )
}

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ context, location }) => {
    if (context.auth.isLoading) return

    if (!context.auth.user) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }

    // Role-based protection
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', context.auth.user.id)
      .single()

    const isGuruPath = location.pathname.includes('/courses/create') || 
                      location.pathname.includes('/manage') ||
                      location.pathname.includes('/edit') ||
                      location.pathname.includes('/students')

    if (isGuruPath && profile?.role !== 'guru') {
      throw redirect({ to: '/dashboard' })
    }
  },
  loader: async ({ context: { queryClient, auth } }) => {
    if (auth.user) {
      await queryClient.ensureQueryData(profileQueries.detail(auth.user.id))
    }
  },
  component: DashboardLayout,
  pendingComponent: DashboardPending,
})DashboardPending,
})