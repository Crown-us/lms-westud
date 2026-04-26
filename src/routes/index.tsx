// @ts-nocheck
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/auth-provider'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  ArrowRight, 
  BookOpen, 
  Code2, 
  Cpu, 
  Globe2, 
  Layers, 
  Layout, 
  MessageSquare, 
  Rocket, 
  ShieldCheck, 
  Zap,
  Loader2
} from 'lucide-react'
import heroImage from '@/assets/hero.png'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const { user } = useAuth()
  
  const { data: realCourses = [], isLoading: isCoursesLoading } = useQuery({
    queryKey: ['landing-featured-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`*, instructor:profiles(name, avatar_url)`)
        .eq('status', 'published')
        .order('total_students', { ascending: false })
        .limit(3)
      if (error) throw error
      return data || []
    }
  })

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-red-500 selection:text-white overflow-hidden">
      {/* Background Dots - Laravel Style */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.4] dark:opacity-[0.1]">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold tracking-wide uppercase"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Platform Belajar Generasi 2026</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] text-slate-900 dark:text-white font-display"
          >
            The Ultimate <br />
            <span className="text-red-600">Learning</span> Protocol.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Platform edukasi teknis performa tinggi untuk Anda yang menuntut keunggulan. Dirancang untuk masa depan industri teknologi.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link to={user ? "/dashboard" : "/login"}>
              <Button className="h-14 px-10 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-base font-black shadow-xl shadow-red-200 dark:shadow-none transition-all active:scale-95 group">
                {user ? "Masuk ke Dashboard" : "Mulai Belajar Sekarang"}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/courses">
              <Button variant="ghost" className="h-14 px-8 rounded-2xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
                Lihat Katalog Kursus
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Bento Grid - Laravel Style */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-sm font-black text-red-600 uppercase tracking-[0.3em]">Fitur Unggulan</h2>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-display">Ecosystem for Excellence.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 p-8 md:p-12 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-between group hover:border-red-200 dark:hover:border-red-900/30 transition-all duration-500">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700">
                  <Cpu className="w-6 h-6 text-red-600" />
                </div>
                <h4 className="text-2xl font-black">Kurikulum Terupdate 2026</h4>
                <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md">Materi yang disusun khusus untuk memenuhi standar industri teknologi terbaru, mulai dari AI Integration hingga Cloud Native.</p>
              </div>
              <div className="mt-12 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?u=${i+10}`} alt="user" />
                    </div>
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">Bergabung dengan komunitas belajar kami</span>
              </div>
            </div>

            <div className="p-8 md:p-12 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all duration-500 group">
              <div className="space-y-6">
                <div className="w-12 h-12 bg-red-50 dark:bg-red-950/30 rounded-2xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-red-600" />
                </div>
                <h4 className="text-2xl font-black">Direct Mentor Uplink</h4>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Akses langsung ke praktisi industri melalui sesi diskusi privat dan review kode.</p>
                <ul className="space-y-3 pt-4">
                  {['Private Discord', 'Code Review', 'Career Prep'].map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                      <ShieldCheck className="w-4 h-4 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Row 2 */}
            <div className="p-8 md:p-12 rounded-[2.5rem] bg-slate-900 text-white flex flex-col justify-between group overflow-hidden relative">
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <Rocket className="w-6 h-6 text-red-500" />
                </div>
                <h4 className="text-2xl font-black">Fast-Track Career</h4>
                <p className="text-slate-400 font-medium">Bantu percepat karir Anda dengan sertifikasi yang diakui oleh partner industri kami.</p>
              </div>
              <Zap className="absolute -bottom-10 -right-10 w-40 h-40 text-white/5 group-hover:text-red-500/10 transition-colors duration-700" />
            </div>

            <div className="md:col-span-2 p-8 md:p-12 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-8 items-center group">
               <div className="space-y-4">
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700">
                    <Layers className="w-6 h-6 text-red-600" />
                  </div>
                  <h4 className="text-2xl font-black">Bento Learning System</h4>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Metode belajar modular yang memudahkan Anda menyerap materi kompleks dalam potongan kecil yang efektif.</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  {[Globe2, Code2, Layout, Zap].map((Icon, i) => (
                    <div key={i} className="aspect-square bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      <Icon className="w-8 h-8 text-slate-300 dark:text-slate-600 group-hover:text-red-600 transition-colors" />
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses - Simple & Clean */}
      <section className="py-32 px-6 bg-slate-50/50 dark:bg-slate-900/20 border-y border-slate-100 dark:border-slate-800 relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <h2 className="text-sm font-black text-red-600 uppercase tracking-[0.3em]">Katalog Terpilih</h2>
              <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-display italic">Popular <span className="text-slate-400 not-italic">Protocols.</span></h3>
            </div>
            <Link to="/courses" className="text-sm font-black text-red-600 hover:underline uppercase tracking-widest flex items-center gap-2">
              Lihat Semua Kursus <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {isCoursesLoading ? (
               [1,2,3].map(i => <div key={i} className="h-[400px] rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 animate-pulse" />)
            ) : (
               realCourses.map((course) => (
                <Link key={course.id} to="/courses/$courseId" params={{ courseId: course.id.toString() }} className="group">
                  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 group-hover:shadow-2xl transition-all duration-500 h-full flex flex-col">
                    <div className="aspect-[16/10] overflow-hidden bg-slate-200">
                      <img 
                        src={course.image_url} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        alt={course.title} 
                      />
                    </div>
                    <div className="p-8 space-y-4 flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-600">{course.category}</span>
                        <span className="text-xs font-bold text-slate-400">{course.total_students || 0} Siswa</span>
                      </div>
                      <h4 className="text-xl font-black leading-tight group-hover:text-red-600 transition-colors line-clamp-2">{course.title}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium line-clamp-2">{course.description}</p>
                    </div>
                    <div className="p-8 pt-0 flex items-center justify-between">
                       <span className="text-lg font-black text-slate-900 dark:text-white">{course.price_monthly}</span>
                       <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all">
                          <ArrowRight className="w-5 h-5" />
                       </div>
                    </div>
                  </div>
                </Link>
               ))
            )}
          </div>
        </div>
      </section>

      {/* FAQ - Laravel Style Accordion */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-3xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-sm font-black text-red-600 uppercase tracking-[0.3em]">Pertanyaan Umum</h2>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight font-display">Got Questions?</h3>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {[
              { q: 'Bagaimana sistem belajarnya?', a: 'Sistem belajar menggunakan platform interaktif dengan kombinasi video HD, modul teks, dan kuis praktis untuk setiap bab.' },
              { q: 'Apakah sertifikatnya diakui?', a: 'Sertifikat kami diterbitkan secara kriptografis dan dapat diverifikasi oleh partner industri yang bekerja sama dengan platform kami.' },
              { q: 'Apa ada jaminan uang kembali?', a: 'Kami menawarkan garansi 7 hari uang kembali jika Anda merasa kurikulum yang kami berikan tidak sesuai dengan ekspektasi Anda.' },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 px-8 rounded-3xl overflow-hidden transition-all hover:border-red-100 dark:hover:border-red-900/30">
                <AccordionTrigger className="hover:no-underline font-black text-lg text-left py-6">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 dark:text-slate-400 font-medium text-base pb-6 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-5xl mx-auto rounded-[3.5rem] bg-slate-900 dark:bg-red-600 p-12 md:p-24 text-center space-y-8 relative overflow-hidden group">
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl md:text-7xl font-black text-white tracking-tight leading-[0.9]">
              Ready to <span className="italic">Elevate</span> <br /> Your Career?
            </h2>
            <p className="text-white/70 max-w-xl mx-auto font-medium md:text-lg leading-relaxed">
              Bergabunglah dengan ribuan siswa lainnya dan mulai perjalanan Anda menguasai teknologi masa depan sekarang juga.
            </p>
            <div className="pt-8">
              <Link to={user ? "/dashboard" : "/login"}>
                <Button className="h-16 px-12 bg-white text-slate-900 hover:bg-red-50 rounded-2xl text-xl font-black shadow-2xl transition-all active:scale-95 group">
                  DAFTAR SEKARANG
                  <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Info Only (No actual footer component) */}
      <div className="py-12 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">
        © 2026 WeStud Ecosystem. Engineered for Excellence.
      </div>
    </div>
  )
}
