import * as React from 'react'
import { createFileRoute, useRouteContext, redirect } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  Search, 
  Mail, 
  MoreVertical, 
  ArrowUpRight,
  Filter,
  Download
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { motion, type Variants } from 'framer-motion'
import { profileQueries, dashboardQueries } from '@/lib/queries'

export const Route = createFileRoute('/dashboard/students')({
  beforeLoad: async ({ context }) => {
    const user = context.auth.user
    if (!user) throw redirect({ to: '/login', search: { redirect: '/dashboard/students' } })
    
    // Ensure profile is in cache
    const profile = await context.queryClient.ensureQueryData(profileQueries.detail(user.id))
    if (profile?.role !== 'guru') throw redirect({ to: '/dashboard' })
  },
  loader: async ({ context: { queryClient, auth } }) => {
    if (auth.user) {
      await queryClient.ensureQueryData(dashboardQueries.guruStudents(auth.user.id))
    }
  },
  component: StudentManagementPage,
})

function StudentManagementPage() {
  const { auth } = useRouteContext({ from: '/dashboard/students' })
  const user = auth.user
  const [searchQuery, setSearchQuery] = React.useState('')

  const { data: students = [] } = useQuery(dashboardQueries.guruStudents(user?.id))

  const filteredStudents = students.filter((s: any) => 
    s.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.course?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  }

  const item: Variants = {
    hidden: { y: 10, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="max-w-[1400px] mx-auto space-y-8 pb-10 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight text-left">Manajemen Murid 👥</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-left">Pantau siapa saja yang belajar di kursus Anda.</p>
        </div>
        <div className="flex items-center gap-3 text-left">
           <Button variant="outline" className="rounded-2xl border-2 border-slate-100 dark:border-slate-800 font-black h-12">
              <Download className="w-4 h-4 mr-2" /> Export CSV
           </Button>
           <div className="relative group hidden md:block text-left">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari nama atau kursus..." 
                className="pl-11 h-12 w-[300px] rounded-2xl border-none bg-white dark:bg-slate-900 shadow-sm" 
              />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
         <Card className="border-none shadow-sm rounded-[2rem] bg-red-600 p-8 text-white flex justify-between items-center text-left">
            <div className="text-left">
               <div className="text-red-100 text-[10px] font-black uppercase tracking-widest mb-1 text-left">Total Murid Unik</div>
               <div className="text-4xl font-black text-left">{new Set(students.map((s: any) => s.student?.id)).size}</div>
            </div>
            <div className="bg-white/20 p-4 rounded-2xl"><Users className="w-8 h-8" /></div>
         </Card>
         <Card className="border-none shadow-sm rounded-[2rem] bg-white dark:bg-slate-900 p-8 flex justify-between items-center text-left">
            <div className="text-left">
               <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 text-left">Rata-rata Progres</div>
               <div className="text-4xl font-black text-slate-800 dark:text-white text-left">
                  {students.length > 0 ? Math.round(students.reduce((acc: number, s: any) => acc + (s.progress || 0), 0) / students.length) : 0}%
               </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-2xl text-red-600"><ArrowUpRight className="w-8 h-8" /></div>
         </Card>
         <Card className="border-none shadow-sm rounded-[2rem] bg-white dark:bg-slate-900 p-8 flex justify-between items-center text-left text-left">
            <div className="text-left">
               <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 text-left">Pendaftaran Baru</div>
               <div className="text-4xl font-black text-slate-800 dark:text-white text-left">
                  {students.filter((s: any) => new Date(s.enrolled_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
               </div>
               <div className="text-[10px] font-bold text-green-500 mt-1 uppercase text-left">7 Hari terakhir</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-2xl text-green-600"><Filter className="w-8 h-8" /></div>
         </Card>
      </div>

      <Card className="border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900 overflow-hidden text-left">
         <div className="overflow-x-auto text-left">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800 text-left">
                     <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Murid</th>
                     <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Kursus</th>
                     <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Progres Belajar</th>
                     <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Tgl Daftar</th>
                     <th className="p-6 text-right text-left"></th>
                  </tr>
               </thead>
               <tbody className="divide-y dark:divide-slate-800 text-left">
                  {filteredStudents.map((itemRow: any) => (
                    <motion.tr key={itemRow.id} variants={item} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors text-left">
                       <td className="p-6 text-left">
                          <div className="flex items-center gap-4 text-left">
                             <div className="relative shrink-0">
                                {itemRow.student?.avatar_url ? (
                                   <img 
                                     src={itemRow.student.avatar_url} 
                                     className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-100 dark:border-slate-800 shadow-sm" 
                                     alt="avatar" 
                                     onError={(e) => {
                                       e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(itemRow.student?.name || 'User')}&background=random`
                                     }}
                                   />
                                ) : (
                                   <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 flex items-center justify-center font-black text-sm border-2 border-red-100 dark:border-red-900/30">
                                      {itemRow.student?.name?.charAt(0).toUpperCase() || 'U'}
                                   </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                             </div>
                             <div className="text-left">
                                <div className="text-sm font-black text-slate-800 dark:text-white text-left">{itemRow.student?.name || 'Siswa Tanpa Nama'}</div>
                                <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 text-left">
                                   <Mail className="w-3 h-3" /> {itemRow.student?.email}
                                </div>
                             </div>
                          </div>
                       </td>
                       <td className="p-6 text-left">
                          <Badge variant="outline" className="rounded-lg border-slate-200 dark:border-slate-700 font-bold text-xs text-left">
                             {itemRow.course?.title}
                          </Badge>
                       </td>
                       <td className="p-6 min-w-[200px] text-left">
                          <div className="space-y-1.5 text-left">
                             <div className="flex justify-between text-[10px] font-black text-slate-400 text-left text-left">
                                <span>{itemRow.progress}%</span>
                             </div>
                             <Progress value={itemRow.progress} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
                          </div>
                       </td>
                       <td className="p-6 text-left">
                          <div className="text-xs font-bold text-slate-500 text-left">
                             {new Date(itemRow.enrolled_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                       </td>
                       <td className="p-6 text-right text-left">
                          <Button variant="ghost" size="icon" className="rounded-full text-slate-300 hover:text-red-600 text-left">
                             <MoreVertical className="w-5 h-5" />
                          </Button>
                       </td>
                    </motion.tr>
                  ))}
               </tbody>
            </table>
         </div>
      </Card>
    </motion.div>
  )
}
