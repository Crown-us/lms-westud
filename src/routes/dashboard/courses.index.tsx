// @ts-nocheck
import * as React from 'react'
import { createFileRoute, Link, useRouteContext, useSearch } from '@tanstack/react-router'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { motion, type Variants } from 'framer-motion'
import { 
  Search, 
  Star, 
  BookOpen,
  Users,
  Settings,
  Plus,
  BarChart3,
  DollarSign,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { profileQueries, courseQueries } from '@/lib/queries'

export const Route = createFileRoute('/dashboard/courses/')({
  validateSearch: z.object({
    q: z.string().optional(),
  }),
  loader: async ({ context: { queryClient, auth } }) => {
    if (!auth.user) return

    const profile = await queryClient.ensureQueryData(profileQueries.detail(auth.user.id))
    const isTeacher = profile?.role === 'guru'
    
    await queryClient.ensureQueryData(courseQueries.myCourses(auth.user.id, isTeacher))
  },
  component: MyCoursesPage,
})

function MyCoursesPage() {
  const { auth } = useRouteContext({ from: '/dashboard/courses/' })
  const search = useSearch({ from: '/dashboard/courses/' })
  const user = auth.user
  const [localSearch, setLocalSearch] = React.useState(search.q || '')

  React.useEffect(() => {
    if (search.q) setLocalSearch(search.q)
  }, [search.q])

  const { data: profile } = useQuery(profileQueries.detail(user?.id))
  const isTeacher = profile?.role === 'guru'

  const { data: courses = [] } = useQuery(courseQueries.myCourses(user?.id, isTeacher))

  const filteredCourses = courses.filter((c: any) => 
    c.title.toLowerCase().includes(localSearch.toLowerCase()) ||
    c.category?.toLowerCase().includes(localSearch.toLowerCase())
  )

  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const item: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="max-w-[1400px] mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {isTeacher ? 'Kelola Kursus Anda' : 'Kursus Saya'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {isTeacher ? 'Pantau performa materi dan interaksi dengan murid Anda.' : 'Kelola dan lanjutkan progres belajarmu di sini.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
           {isTeacher && (
             <Link to="/dashboard/courses/create">
                <Button className="bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black px-6 h-12 shadow-lg shadow-red-100 dark:shadow-none transition-all active:scale-95">
                    <Plus className="w-4 h-4 mr-2" /> Buat Kursus
                </Button>
             </Link>
           )}
           <div className="relative group hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Cari kursus..." 
                className="pl-11 h-12 w-[250px] rounded-2xl border-none bg-white dark:bg-slate-900 shadow-sm font-bold focus-visible:ring-red-600" 
              />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredCourses.map((course: any) => (
          <motion.div key={course.id} variants={item}>
            <Link 
              to={isTeacher ? '/dashboard/courses/$courseId/manage' : '/dashboard/courses/$courseId/learn'} 
              params={{ courseId: course.id.toString() }}
              className="block h-full"
            >
              <Card className="group border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 h-full flex flex-col">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={course.image_url || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="course" />
                  <div className="absolute top-4 left-4">
                    <Badge className={`${course.status === 'published' ? 'bg-green-500' : 'bg-orange-500'} text-white border-none font-bold px-3 py-1 rounded-full shadow-lg capitalize text-[9px] tracking-widest`}>
                      {course.status}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-7 flex-1 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-500">{course.category}</span>
                    <div className="flex items-center gap-1 text-yellow-500 font-black text-xs">
                      <Star className="w-3.5 h-3.5 fill-current" /> {course.rating}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight line-clamp-2 min-h-[3.5rem]">
                    {course.title}
                  </h3>
                  
                  {isTeacher ? (
                    <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                       <div className="space-y-1 overflow-hidden">
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">Total Murid</div>
                          <div className="font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                             <Users className="w-3.5 h-3.5 text-red-500 shrink-0" /> 
                             <span className="text-base truncate">{course.total_students || 0}</span>
                          </div>
                       </div>
                       <div className="space-y-1 overflow-hidden">
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">Harga</div>
                          <div className="font-black text-green-600 flex items-center gap-1">
                             <DollarSign className="w-3.5 h-3.5 text-green-500 shrink-0" />
                             <span className="text-base whitespace-nowrap">{course.price_monthly || 'Gratis'}</span>
                          </div>
                       </div>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                       <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <span>Progres Belajar</span>
                          <span className="text-red-600">{course.progress || 0}%</span>
                       </div>
                       <Progress value={course.progress || 0} className="h-1.5" />
                    </div>
                  )}
                </CardContent>

                <CardFooter className="p-7 pt-0 flex gap-2">
                   {isTeacher ? (
                     <>
                       <Button className="flex-1 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black h-12 text-xs transition-all active:scale-95">
                          <Settings className="w-4 h-4 mr-2" /> Kelola
                       </Button>
                       <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-2 border-slate-100 dark:border-slate-800 dark:text-white transition-all active:scale-95">
                          <BarChart3 className="w-4 h-4" />
                       </Button>
                     </>
                   ) : (
                     <Button className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black h-12 transition-all active:scale-95">Lanjutkan Belajar</Button>
                   )}
                </CardFooter>
              </Card>
            </Link>
          </motion.div>
        ))}

        <motion.div variants={item}>
           <Link to={isTeacher ? '/dashboard/courses/create' : '/courses'} className="block h-full text-left">
            <button className="w-full h-full min-h-[350px] border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 group hover:border-red-200 transition-all text-left">
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-full group-hover:scale-110 transition-transform text-left">
                  {isTeacher ? <Plus className="w-8 h-8 text-slate-300 dark:text-slate-700 group-hover:text-red-500" /> : <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-700 group-hover:text-red-500" />}
                </div>
                <div className="text-center text-left">
                  <div className="font-black text-slate-400 dark:text-slate-600 group-hover:text-red-600 uppercase text-xs tracking-widest text-center">{isTeacher ? 'Tambah Kursus' : 'Cari Kursus'}</div>
                </div>
            </button>
           </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}
