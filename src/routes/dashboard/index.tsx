import { createFileRoute, Link, useRouteContext } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { motion, type Variants } from 'framer-motion'
import { 
  Clock, 
  Award, 
  Calendar as CalendarIcon, 
  ChevronRight,
  Users,
  DollarSign,
  BookOpen,
  Star,
  CheckCircle2
} from 'lucide-react'
import { profileQueries, dashboardQueries } from '@/lib/queries'

export const Route = createFileRoute('/dashboard/')({
  loader: async ({ context: { queryClient, auth } }) => {
    if (!auth.user) return

    // Get profile first to know the role
    const profile = await queryClient.ensureQueryData(profileQueries.detail(auth.user.id))
    
    if (profile?.role === 'guru') {
      await queryClient.ensureQueryData(dashboardQueries.guruStats(auth.user.id))
    } else {
      await queryClient.ensureQueryData(dashboardQueries.studentStats(auth.user.id))
    }
  },
  component: DashboardHome,
})

function DashboardHome() {
  const { auth } = useRouteContext({ from: '/dashboard/' })
  const user = auth.user
  const { data: profile } = useQuery(profileQueries.detail(user?.id))
  const role = profile?.role || 'siswa'

  const { data: guruStats } = useQuery(dashboardQueries.guruStats(user?.id))
  const { data: studentStats } = useQuery(dashboardQueries.studentStats(user?.id))

  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const item: Variants = {
    hidden: { y: 15, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

  const userName = profile?.name || user?.email?.split('@')[0] || 'User'

  if (role === 'guru' && guruStats) {
    const gData = guruStats
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-[1400px] mx-auto space-y-6 pb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2 text-left">
          <div className="text-left">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight text-left">Dashboard Guru 👨‍🏫</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-left">Selamat datang, {userName}. Mari lihat performa kursus Anda.</p>
          </div>
          <Link to="/dashboard/courses/create">
            <Button className="bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black px-6 h-12 shadow-lg shadow-red-100 dark:shadow-none">
               + Buat Kursus Baru
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
           {[
             { label: 'Total Murid', value: gData.stats.totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
             { label: 'Estimasi Pendapatan', value: gData.stats.revenue, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
             { label: 'Rating Rata-rata', value: gData.stats.courseRating, icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
             { label: 'Kursus Aktif', value: gData.stats.activeCourses, icon: BookOpen, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
           ].map((stat, i) => (
             <motion.div key={i} variants={item}>
                <Card className="border-none shadow-sm rounded-[2rem] bg-white dark:bg-slate-900 p-6 overflow-hidden relative">
                   <div className="flex items-center gap-4 relative z-10">
                      <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
                         <stat.icon className="w-6 h-6" />
                      </div>
                      <div className="text-left overflow-hidden">
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{stat.label}</div>
                         <div className="text-2xl font-black text-slate-800 dark:text-white text-left whitespace-nowrap">{stat.value}</div>
                      </div>
                   </div>
                </Card>
             </motion.div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <motion.div variants={item} className="lg:col-span-2">
              <Card className="h-full border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 md:p-10 text-left">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight text-left">Statistik Pertumbuhan</h3>
                    <Button variant="ghost" size="sm" className="text-red-600 font-bold">Detail <ChevronRight className="w-4 h-4 ml-1" /></Button>
                 </div>
                 <div className="h-[300px] flex items-end gap-3 px-4">
                    {[40, 65, 50, 85, 90, 70, 60, 45, 100, 75, 80, 95].map((h, i) => (
                       <div key={i} className="flex-1 bg-red-50 dark:bg-slate-800 rounded-t-xl relative group">
                          <motion.div 
                            initial={{ height: 0 }} 
                            animate={{ height: `${h}%` }} 
                            transition={{ delay: 0.5 + (i * 0.05) }}
                            className="absolute bottom-0 w-full bg-red-600 rounded-t-xl" 
                          />
                       </div>
                    ))}
                 </div>
              </Card>
           </motion.div>

           <motion.div variants={item}>
              <Card className="h-full border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 text-left">
                 <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6 uppercase tracking-tight text-left">Pendaftaran Terbaru</h3>
                 <div className="space-y-6 text-left">
                    {gData.recentSales.length > 0 ? gData.recentSales.map((sale: any, i: number) => (
                       <div key={i} className="flex items-center justify-between group cursor-pointer text-left">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black">
                                {sale.name.charAt(0)}
                             </div>
                             <div className="text-left">
                                <div className="text-sm font-black text-slate-800 dark:text-white">{sale.name}</div>
                                <div className="text-[10px] font-bold text-slate-400">Daftar {sale.course}</div>
                             </div>
                          </div>
                          <div className="text-[10px] font-black text-red-600">{sale.date}</div>
                       </div>
                    )) : (
                      <p className="text-slate-400 text-sm font-medium py-10 text-center">Belum ada pendaftaran baru.</p>
                    )}
                 </div>
                 <Button variant="outline" className="w-full mt-8 rounded-2xl border-2 border-slate-50 dark:border-slate-800 font-black h-12">Lihat Semua Laporan</Button>
              </Card>
           </motion.div>
        </div>
      </motion.div>
    )
  }

  if (role === 'siswa' && studentStats) {
    const sData = studentStats
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-[1400px] mx-auto space-y-8 pb-10">
        <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-left">
          <div className="text-left">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight text-left">Halo, {userName}! 👋</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-left">Lanjutkan belajarmu hari ini.</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-black text-slate-500 bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-800 text-left">
             <CalendarIcon className="w-4 h-4 text-red-600" />
             <span className="uppercase tracking-widest text-left">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <motion.div variants={item}>
                  <Card className="border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 flex flex-col justify-between h-[180px]">
                     <div className="bg-orange-50 dark:bg-orange-900/30 text-orange-500 w-fit p-3 rounded-xl">
                        <Clock className="w-5 h-5" />
                     </div>
                     <div className="text-left">
                        <div className="text-3xl font-black text-left">{sData.stats.hours}</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 text-left">Total Waktu Belajar</div>
                     </div>
                  </Card>
               </motion.div>
               <motion.div variants={item}>
                  <Card className="border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 flex flex-col justify-between h-[180px]">
                     <div className="bg-green-50 dark:bg-green-900/30 text-green-500 w-fit p-3 rounded-xl">
                        <CheckCircle2 className="w-5 h-5" />
                     </div>
                     <div className="text-left">
                        <div className="text-3xl font-black text-left">{sData.stats.completed}</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 text-left">Kursus Diselesaikan</div>
                     </div>
                  </Card>
               </motion.div>
            </div>

            <motion.div variants={item} className="space-y-6">
               <h3 className="text-xl font-black uppercase tracking-tight text-left">Kursus Berjalan</h3>
               <div className="space-y-4">
                  {sData.recentCourses.length > 0 ? sData.recentCourses.map((enroll: any) => (
                    <Link key={enroll.id} to="/dashboard/courses/$courseId/learn" params={{ courseId: enroll.course.id.toString() }}>
                      <Card className="border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900 p-6 hover:shadow-xl transition-all group">
                         <div className="flex flex-col md:flex-row gap-6">
                            <img src={enroll.course.image_url} className="w-full md:w-32 aspect-video md:aspect-square object-cover rounded-2xl" alt="course" />
                            <div className="flex-1 space-y-4 text-left">
                               <div className="space-y-1 text-left">
                                  <Badge className="bg-red-50 text-red-600 border-none text-[9px] font-black uppercase">{enroll.course.category}</Badge>
                                  <h4 className="text-lg font-black group-hover:text-red-600 transition-colors text-left">{enroll.course.title}</h4>
                               </div>
                               <div className="space-y-2 text-left">
                                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">
                                     <span>Progres</span>
                                     <span className="text-red-600">{enroll.progress}%</span>
                                  </div>
                                  <Progress value={enroll.progress} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
                               </div>
                            </div>
                            <div className="flex items-center">
                               <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all">
                                  <ChevronRight className="w-6 h-6" />
                               </div>
                            </div>
                         </div>
                      </Card>
                    </Link>
                  )) : (
                    <Card className="border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900 p-12 text-center space-y-4">
                       <BookOpen className="w-12 h-12 text-slate-200 mx-auto" />
                       <div className="space-y-1">
                          <p className="font-black text-slate-400 uppercase text-xs tracking-widest">Belum ada kursus</p>
                          <p className="text-slate-400 text-sm font-medium">Mulai belajar dengan mendaftar ke salah satu kursus kami.</p>
                       </div>
                       <Link to="/courses"><Button className="bg-red-600 text-white font-black rounded-2xl px-8 h-12">Cari Kursus</Button></Link>
                    </Card>
                  )}
               </div>
            </motion.div>
          </div>

          <div className="space-y-8 text-left">
             <motion.div variants={item}>
                <Card className="border-none shadow-sm rounded-[2.5rem] bg-red-600 p-8 text-white space-y-6 relative overflow-hidden group">
                   <div className="relative z-10 space-y-4">
                      <h3 className="text-2xl font-black leading-tight italic text-left">Tingkatkan <br/> Skill Kamu!</h3>
                      <p className="text-red-100 text-sm font-medium opacity-80 text-left">Dapatkan akses ke materi premium dan sertifikat internasional.</p>
                      <Button className="w-full h-12 bg-white text-red-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-50">Upgrade Pro</Button>
                   </div>
                   <Award className="absolute -bottom-6 -right-6 w-32 h-32 text-white/10 group-hover:rotate-12 transition-transform duration-700" />
                </Card>
             </motion.div>

             <motion.div variants={item}>
                <Card className="border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 space-y-6">
                   <h3 className="text-sm font-black uppercase tracking-widest text-left">Teman Belajar</h3>
                   <div className="space-y-4">
                      {[1, 2, 3, 4].map(i => (
                         <div key={i} className="flex items-center gap-3">
                            <img src={`https://i.pravatar.cc/100?u=${i+20}`} className="w-10 h-10 rounded-xl object-cover" alt="friend" />
                            <div className="flex-1 text-left">
                               <div className="text-xs font-black">User {i}</div>
                               <div className="text-[9px] font-bold text-green-500 uppercase">Sedang Belajar</div>
                            </div>
                         </div>
                      ))}
                   </div>
                   <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400">Lihat Semua</Button>
                </Card>
             </motion.div>
          </div>
        </div>
      </motion.div>
    )
  }

  return null
}
