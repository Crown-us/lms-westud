import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Star, 
  Users, 
  ChevronLeft, 
  BookOpen, 
  ArrowRight
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { profileQueries } from '@/lib/queries'

export const Route = createFileRoute('/mentors/$mentorId')({
  loader: async ({ params, context: { queryClient } }) => {
    // Pastikan data profil dan kursus di-fetch sebelum halaman muncul
    await Promise.all([
      queryClient.ensureQueryData(profileQueries.detail(params.mentorId)),
      queryClient.ensureQueryData(profileQueries.mentorCourses(params.mentorId))
    ])
  },
  component: MentorProfilePage,
})

function MentorProfilePage() {
  const { mentorId } = useParams({ from: '/mentors/$mentorId' })
  const { data: mentor } = useQuery(profileQueries.detail(mentorId))
  const { data: courses = [] } = useQuery(profileQueries.mentorCourses(mentorId))

  if (!mentor) return null

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-left flex flex-col">
      <main className="pt-32 pb-20 max-w-7xl mx-auto px-6 w-full text-left">
        <Link to="/mentors" className="inline-flex items-center gap-2 text-red-600 font-bold text-sm hover:underline mb-12">
           <ChevronLeft className="w-4 h-4" /> Kembali ke Daftar Mentor
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           {/* Info Mentor */}
           <div className="lg:col-span-4 space-y-8">
              <Card className="border-none shadow-sm rounded-[3rem] bg-slate-50 dark:bg-slate-900 p-10 text-center sticky top-32">
                 <img 
                    src={mentor.avatar_url || `https://i.pravatar.cc/300?u=${mentor.id}`} 
                    className="w-40 h-40 rounded-[3rem] object-cover mx-auto mb-6 ring-8 ring-white dark:ring-slate-800 shadow-2xl" 
                    alt={mentor.name} 
                 />
                 <h1 className="text-3xl font-black dark:text-white mb-2">{mentor.name}</h1>
                 <Badge className="bg-red-50 text-red-600 border-none px-4 py-1 font-black uppercase text-[10px] mb-6">Pakar Industri</Badge>
                 
                 <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl">
                       <div className="text-[10px] font-black text-slate-400 uppercase mb-1">XP</div>
                       <div className="font-black dark:text-white">{(mentor as any).xp || 0}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl">
                       <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Level</div>
                       <div className="font-black dark:text-white">{(mentor as any).level || 1}</div>
                    </div>
                 </div>

                 <Button className="w-full h-14 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black shadow-lg transition-all active:scale-95 mb-4">
                    Booking Sesi 1-on-1
                 </Button>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Tersedia untuk bimbingan karir</p>
              </Card>
           </div>

           {/* Materi & Detail */}
           <div className="lg:col-span-8 space-y-12">
              <div className="space-y-6">
                 <h2 className="text-3xl font-black dark:text-white tracking-tight">Tentang Mentor</h2>
                 <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {mentor.bio || 'Membantu Anda menguasai keahlian baru dengan metode belajar yang efektif dan interaktif. Berfokus pada pengembangan praktis yang dibutuhkan oleh industri saat ini.'}
                 </p>
              </div>

              <div className="space-y-8">
                 <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black dark:text-white tracking-tight">Kursus Oleh {mentor.name?.split(' ')[0]}</h2>
                    <Badge className="bg-red-50 text-red-600 border-none font-black">{courses.length} Kursus</Badge>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {courses.map((course) => (
                       <Link key={course.id} to="/courses/$courseId" params={{ courseId: course.id.toString() }}>
                          <Card className="group border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 h-full flex flex-col">
                             <div className="relative aspect-video overflow-hidden">
                                <img src={course.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={course.title} />
                                <div className="absolute top-4 left-4">
                                   <Badge className="bg-red-600 text-white border-none font-black px-3 py-1 rounded-full shadow-lg text-[9px] uppercase tracking-widest">{course.category}</Badge>
                                </div>
                             </div>
                             <div className="p-8 space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                   <div className="flex items-center gap-2">
                                      <Users className="w-3 h-3 text-red-500" />
                                      <span>{course.total_students || 0} SISWA</span>
                                   </div>
                                   <div className="flex items-center gap-1 text-yellow-500">
                                      <Star className="w-3 h-3 fill-current" />
                                      <span>{course.rating}</span>
                                   </div>
                                </div>
                                <h3 className="text-xl font-black dark:text-white leading-tight line-clamp-2 group-hover:text-red-600 transition-colors">{course.title}</h3>
                                <div className="flex items-center justify-between pt-4 border-t dark:border-slate-800">
                                   <span className="text-lg font-black dark:text-white">{course.price_monthly || 'Gratis'}</span>
                                   <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all">
                                      <ArrowRight className="w-5 h-5" />
                                   </div>
                                </div>
                             </div>
                          </Card>
                       </Link>
                    ))}
                 </div>

                 {courses.length === 0 && (
                    <div className="py-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                       <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                       <p className="text-slate-400 font-bold">Mentor ini belum menerbitkan kursus publik.</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </main>
    </div>
  )
}
