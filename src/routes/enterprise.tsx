import { createFileRoute } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  ShieldCheck, 
  Zap, 
  Globe,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Play
} from 'lucide-react'
import { motion, type Variants } from 'framer-motion'

export const Route = createFileRoute('/enterprise')({
  component: EnterprisePage,
})

function EnterprisePage() {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  }

  const item: Variants = {
    hidden: { y: 30, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-left flex flex-col overflow-hidden">
      <main className="pt-32 pb-20 max-w-7xl mx-auto px-6 w-full text-left relative">
        {/* Decorative Background Elements */}
        <div className="absolute top-40 -left-20 w-96 h-96 bg-red-600/5 rounded-full blur-[100px] -z-10 animate-pulse"></div>
        <div className="absolute bottom-20 -right-20 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32 text-left"
        >
           <div className="space-y-8 text-left">
              <motion.div variants={item}>
                <Badge className="bg-red-50 text-red-600 border-none px-4 py-1.5 font-black uppercase text-[10px] tracking-[0.2em] shadow-sm">
                  <Sparkles className="w-3 h-3 mr-2" /> Untuk Perusahaan
                </Badge>
              </motion.div>
              
              <motion.h1 variants={item} className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9] text-left font-display">
                Tingkatkan <br/>
                <span className="text-red-600 relative inline-block">
                  Skill Tim
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-red-600/20 fill-current" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 25 0 50 5 T 100 5 L 100 10 L 0 10 Z" /></svg>
                </span> <br/>
                Anda Sekarang.
              </motion.h1>

              <motion.p variants={item} className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl text-left">
                Solusi pembelajaran terpadu untuk tim yang ingin tetap kompetitif. Kelola pelatihan karyawan dalam satu dashboard intuitif.
              </motion.p>

              <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 text-left">
                 <a href="mailto:sales@westud.com?subject=Enterprise Inquiry" target="_blank" rel="noopener noreferrer">
                   <Button className="h-16 px-10 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-lg font-black shadow-2xl shadow-red-200 dark:shadow-none group transition-all active:scale-95 w-full sm:w-auto">
                      Hubungi Sales <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                   </Button>
                 </a>
                 <Button
                   variant="outline"
                   onClick={() => document.getElementById('features-grid')?.scrollIntoView({ behavior: 'smooth' })}
                   className="h-16 px-10 rounded-2xl border-2 border-slate-100 dark:border-slate-800 font-black text-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                 >
                    Lihat Fitur Produk
                 </Button>
              </motion.div>

              <motion.div variants={item} className="flex items-center gap-6 pt-4 text-left">
                 <div className="flex -space-x-4">
                    {[1,2,3,4].map(i => (
                      <img key={i} src={`https://i.pravatar.cc/100?u=${i+10}`} className="w-10 h-10 rounded-full border-4 border-white dark:border-slate-950 object-cover" alt="user" />
                    ))}
                 </div>
                 <div className="text-sm font-bold text-slate-400">
                   Mulai perjalanan <span className="text-slate-900 dark:text-white font-black italic">upskilling</span> tim Anda
                 </div>
              </motion.div>           </div>

           <motion.div 
             variants={item}
             className="relative text-left"
           >
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="aspect-square md:aspect-video rounded-[3rem] bg-slate-900 overflow-hidden shadow-2xl relative z-10 border-[12px] border-white dark:border-slate-900"
              >
                 <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80" className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-1000" alt="team" />
                 <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-24 h-24 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center shadow-2xl group"
                    >
                       <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-red-600 shadow-xl group-hover:bg-red-600 group-hover:text-white transition-colors">
                          <Play className="w-8 h-8 fill-current" />
                       </div>
                    </motion.button>
                 </div>
              </motion.div>

              {/* Floating UI Elements */}
              <motion.div 
                animate={{ x: [0, 15, 0], y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -top-10 -right-10 bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-2xl z-20 hidden md:block"
              >
                 <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-xl"><CheckCircle2 className="w-6 h-6 text-green-600" /></div>
                    <div className="text-left">
                       <div className="text-[10px] font-black text-slate-400 uppercase">Growth Rate</div>
                       <div className="text-xl font-black text-slate-900 dark:text-white">+85.4%</div>
                    </div>
                 </div>
              </motion.div>
              
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-red-600/20 rounded-full blur-[100px] -z-10"></div>
           </motion.div>
        </motion.div>

        {/* LOGO WALL - REPLACED WITH VALUE PROP */}
        <motion.div variants={item} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-32 text-center">
           <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mb-4">Focus on Growth</p>
           <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white font-display">Engineered for Technical Teams.</h2>
        </motion.div>

        {/* FEATURES GRID */}
        <div id="features-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32 text-left">
           {[
             { title: 'Dashboard Admin', desc: 'Pantau progres belajar setiap karyawan secara real-time dengan grafik akurat.', icon: BarChart3, color: 'bg-blue-500' },
             { title: 'Learning Paths', icon: Zap, desc: 'Kurikulum yang disesuaikan dengan target teknologi tim Anda tahun ini.', color: 'bg-red-600' },
             { title: 'Keamanan Data', icon: ShieldCheck, desc: 'Sistem SSO, audit log, dan enkripsi data tingkat enterprise.', iconColor: 'text-green-500', color: 'bg-green-500' },
             { title: 'Konten Eksklusif', icon: Globe, desc: 'Akses ke materi teknis mendalam yang dirancang untuk kebutuhan industri.', color: 'bg-orange-500' },
           ].map((feature, i) => (
             <motion.div 
               key={i} 
               whileHover={{ y: -10 }}
               className="group"
             >
               <Card className="border-none shadow-sm group-hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900 p-8 text-left h-full border border-transparent group-hover:border-red-600/10">
                  <div className={`${feature.color} w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 shadow-lg shadow-red-900/10`}>
                     <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black mb-4 text-left dark:text-white font-display">{feature.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed text-left group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">{feature.desc}</p>
               </Card>
             </motion.div>
           ))}
        </div>

        {/* CTA SECTION */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-[4rem] bg-slate-900 dark:bg-red-600 p-12 md:p-20 overflow-hidden text-center"
        >
           <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
           <div className="relative z-10 max-w-3xl mx-auto space-y-8">
              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight font-display">Siap Membangun <br/> Masa Depan Tim Anda?</h2>
              <p className="text-white/70 text-lg font-medium">Bergabunglah dengan program transformasi digital terbesar tahun ini.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <a href="/login" target="_blank" rel="noopener noreferrer">
                   <Button className="h-16 px-12 bg-white text-slate-900 hover:bg-slate-50 rounded-2xl text-xl font-black shadow-xl w-full sm:w-auto">Mulai Sekarang</Button>
                 </a>
                 <a href="mailto:consultation@westud.com?subject=Enterprise Consultation Request" target="_blank" rel="noopener noreferrer">
                   <Button variant="ghost" className="h-16 px-12 text-white hover:bg-white/10 rounded-2xl text-xl font-black border-2 border-white/20 w-full sm:w-auto">Jadwalkan Konsultasi</Button>
                 </a>
              </div>
           </div>
        </motion.div>
      </main>
    </div>
  )
}
