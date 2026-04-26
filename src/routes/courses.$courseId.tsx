// @ts-nocheck
import * as React from 'react'
import { createFileRoute, Link, useParams, useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/header'
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  Star, 
  Clock, 
  Users, 
  PlayCircle,
  ChevronLeft,
  CheckCircle2,
  Globe,
  Award,
  BookOpen,
  Lock,
  Loader2
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'

import { courseQueries } from '@/lib/queries'
import { toast } from '@/lib/toast-store'

export const Route = createFileRoute('/courses/$courseId')({
  loader: async ({ params, context: { queryClient, auth } }) => {
    await Promise.all([
      queryClient.ensureQueryData(courseQueries.courseDetail(params.courseId)),
      queryClient.ensureQueryData(courseQueries.courseModules(params.courseId)),
      queryClient.ensureQueryData(courseQueries.enrollment(params.courseId, auth.user?.id))
    ])
  },
  component: CourseDetailPage,
})

function CourseDetailPage() {
  const { courseId } = useParams({ from: '/courses/$courseId' })
  const { auth } = useRouteContext({ from: '/courses/$courseId' })
  const user = auth?.user
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: course, error: courseError } = useQuery(courseQueries.courseDetail(courseId))
  const { data: modules = [] } = useQuery(courseQueries.courseModules(courseId))
  const { data: enrollment } = useQuery(courseQueries.enrollment(courseId, user?.id))

  const enrollMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        navigate({ to: '/login', search: { redirect: window.location.pathname } })
        return
      }
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          course_id: parseInt(courseId),
          student_id: user.id
        })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment', courseId] })
      toast.success('Berhasil terdaftar!')
      navigate({ to: '/dashboard/courses/$courseId/learn', params: { courseId } })
    },
    onError: (error: any) => {
      toast.error('Gagal mendaftar: ' + (error.message || 'Terjadi kesalahan sistem'))
    }
  })

  if (courseError || !course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-white dark:bg-slate-950">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Kursus tidak ditemukan</h2>
        <Link to="/courses">
           <Button className="bg-red-600 text-white font-bold">Kembali ke Katalog</Button>
        </Link>
      </div>
    )
  }

  const totalLessons = modules.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0)

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-left flex flex-col">
      <main className="pt-32 pb-20 max-w-7xl mx-auto px-6 text-left">
        <Link to="/courses" className="inline-flex items-center gap-2 text-red-600 font-bold text-sm hover:underline mb-8 text-left">
           <ChevronLeft className="w-4 h-4" /> Kembali ke Katalog
        </Link>

        <div className="flex flex-col lg:flex-row gap-12 text-left">
          <div className="flex-1 space-y-12 text-left">
            <div className="space-y-6 text-left">
              <div className="flex flex-wrap gap-3 text-left">
                 <Badge className="bg-red-50 text-red-600 border-none font-bold uppercase tracking-wider text-[10px] px-3 py-1">{course.category}</Badge>
                 {course.rating > 4.5 && (
                   <Badge className="bg-yellow-50 text-yellow-600 border-none font-bold uppercase tracking-wider text-[10px] px-3 py-1 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> Bestseller
                   </Badge>
                 )}
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight text-left">
                {course.title}
              </h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-3xl text-left">
                {course.description || 'Kuasai keahlian ini dari nol hingga mahir dengan kurikulum yang dirancang khusus oleh pakar industri.'}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 pt-2 text-left">
                 <div className="flex items-center gap-2 text-left">
                    <div className="flex text-yellow-500 text-left">
                       {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`w-4 h-4 ${i <= Math.round(course.rating) ? 'fill-current' : 'text-slate-200'}`} />)}
                    </div>
                    <span className="font-black text-slate-900 dark:text-white text-left">{course.rating}</span>
                 </div>
                 <div className="flex items-center gap-2 text-slate-500 font-bold text-left">
                    <Users className="w-4 h-4 text-red-500" />
                    <span>{course.total_students?.toLocaleString()} siswa telah bergabung</span>
                 </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t dark:border-slate-800 text-left">
                 <img src={course.instructor?.avatar_url || `https://i.pravatar.cc/150?u=${course.instructor_id}`} className="w-12 h-12 rounded-full object-cover ring-4 ring-red-50 dark:ring-red-900/30 text-left" alt="avatar" />
                 <div className="text-left">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left">Instruktur</div>
                    <div className="font-black text-slate-900 dark:text-white text-left">{course.instructor?.name || 'Mentor Ahli'}</div>
                 </div>
              </div>
            </div>

            <div className="space-y-8 text-left">
               <div className="flex items-end justify-between text-left">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight text-left">Kurikulum Kursus</h3>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest text-left">{modules.length} Bagian • {totalLessons} Materi</div>
               </div>
               
               <Accordion type="single" collapsible className="w-full space-y-4 text-left">
                  {modules.map((section: any, i: number) => (
                    <AccordionItem key={section.id} value={`item-${i}`} className="border-2 border-slate-50 dark:border-slate-800 rounded-3xl px-6 bg-white dark:bg-slate-900 overflow-hidden text-left">
                      <AccordionTrigger className="hover:no-underline py-6 text-left">
                        <div className="flex flex-col items-start text-left">
                           <span className="font-black text-slate-900 dark:text-white text-lg text-left">{section.title}</span>
                           <span className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest text-left">{section.lessons?.length || 0} Materi</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-6 space-y-3 text-left">
                        {section.lessons?.map((lesson: any) => (
                          <div key={lesson.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 group cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
                             <div className="flex items-center gap-4 text-left">
                                {lesson.is_free || enrollment ? <PlayCircle className="w-5 h-5 text-red-600" /> : <Lock className="w-5 h-5 text-slate-300" />}
                                <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-red-600 transition-colors text-left">{lesson.title}</span>
                             </div>
                             <div className="flex items-center gap-4 text-left">
                                {lesson.is_free && !enrollment && <Badge className="bg-red-600 text-white border-none font-bold text-[10px] px-2 py-0 text-left">Pratinjau</Badge>}
                                <span className="text-xs font-black text-slate-400 text-left">{lesson.duration || '00:00'}</span>
                             </div>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
               </Accordion>
            </div>
          </div>

          <div className="lg:w-[400px] text-left">
            <div className="sticky top-32 space-y-6 text-left">
               <Card className="rounded-[3rem] border-none shadow-2xl shadow-red-100 dark:shadow-none overflow-hidden bg-white dark:bg-slate-900 text-left">
                  <div className="relative aspect-video group cursor-pointer text-left">
                     <img src={course.image_url || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 text-left" alt="course" />
                     <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors text-left">
                        <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30 text-left">
                           <PlayCircle className="w-12 h-12 text-white fill-white/20" />
                        </div>
                     </div>
                  </div>
                  
                  <CardContent className="p-8 space-y-8 text-left">
                     <div className="space-y-2 text-left">
                        <div className="flex items-center gap-3 text-left">
                           <span className="text-4xl font-black text-slate-900 dark:text-white text-left">{course.price_monthly || 'Gratis'}</span>
                        </div>
                        <p className="text-red-500 font-bold text-sm text-left">Diskon terbatas!</p>
                     </div>

                     <div className="space-y-3 text-left">
                        {enrollment ? (
                          <Link to="/dashboard/courses/$courseId/learn" params={{ courseId: course.id.toString() }} className="text-left">
                            <Button className="w-full h-14 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-green-100 transition-all active:scale-95 text-left">
                               Lanjutkan Belajar
                            </Button>
                          </Link>
                        ) : (
                          <Button 
                            onClick={() => enrollMutation.mutate()}
                            disabled={enrollMutation.isPending}
                            className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-red-100 transition-all active:scale-95 text-left"
                          >
                            {enrollMutation.isPending ? <Loader2 className="animate-spin" /> : 'Daftar Sekarang'}
                          </Button>
                        )}
                     </div>

                     <div className="space-y-4 pt-4 text-left">
                        <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] text-[10px] text-left">Kursus ini mencakup:</h4>
                        <div className="space-y-3 text-left">
                           {[
                             { icon: BookOpen, text: 'Materi lengkap' },
                             { icon: Clock, text: 'Akses selamanya' },
                             { icon: Globe, text: 'Akses di ponsel' },
                             { icon: Award, text: 'Sertifikat' }
                           ].map((item, i) => (
                             <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-300 text-left">
                                <item.icon className="w-4 h-4 text-red-500" />
                                <span className="text-left">{item.text}</span>
                             </div>
                           ))}
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
