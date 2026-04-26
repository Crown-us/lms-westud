import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Award, 
  ShieldCheck, 
  Globe, 
  Sparkles,
  Share2
} from 'lucide-react'
import { motion } from 'framer-motion'

export const Route = createFileRoute('/certification')({
  component: CertificationPage,
})

function CertificationPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-left flex flex-col pt-20">
      <main className="pt-20 pb-20 max-w-7xl mx-auto px-6 w-full text-left relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
           <div className="space-y-8">
              <Badge className="bg-yellow-50 text-yellow-600 border-none px-4 py-1.5 font-black uppercase text-[10px] tracking-widest shadow-sm">
                 <Sparkles className="w-3 h-3 mr-2" /> Sertifikasi Standar Industri
              </Badge>
              <h1 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9] font-display">
                 Validasi <br/>
                 <span className="text-red-600 italic">Skill Anda.</span>
              </h1>
              <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl">
                 Setiap kelulusan di WeStud dilengkapi dengan sertifikat digital yang dapat diverifikasi oleh perusahaan global.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                 <Link to="/courses">
                   <Button className="h-16 px-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 rounded-2xl text-lg font-black shadow-xl">Cari Kursus</Button>
                 </Link>
                 <Button variant="outline" className="h-16 px-10 rounded-2xl border-2 border-slate-100 dark:border-slate-800 font-black text-lg">Verifikasi</Button>
              </div>
           </div>

           <div className="relative group">
              <motion.div 
                initial={{ rotate: -2, y: 20 }}
                animate={{ rotate: 0, y: 0 }}
                className="relative z-10 bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800"
              >
                 <div className="border-2 border-dashed border-yellow-200 p-12 text-center space-y-6">
                    <Award className="w-16 h-16 text-yellow-600 mx-auto" />
                    <h2 className="text-sm font-black text-yellow-600 uppercase tracking-widest">Certificate of Completion</h2>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white italic">Damon Salvatore</h3>
                    <p className="text-slate-400 text-sm">Has successfully completed the masterclass of</p>
                    <h4 className="text-lg font-black text-slate-800 dark:text-slate-100">Fullstack Development</h4>
                 </div>
              </motion.div>
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 space-y-4">
              <ShieldCheck className="w-10 h-10 text-green-500" />
              <h3 className="text-xl font-black">Verifikasi Kode</h3>
              <p className="text-slate-500 text-sm">Keaslian sertifikat terjamin dengan sistem kode unik.</p>
           </div>
           <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 space-y-4">
              <Share2 className="w-10 h-10 text-blue-500" />
              <h3 className="text-xl font-black">Shareable</h3>
              <p className="text-slate-500 text-sm">Mudah dibagikan ke media sosial dan profil profesional.</p>
           </div>
           <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 space-y-4">
              <Globe className="w-10 h-10 text-red-500" />
              <h3 className="text-xl font-black">Standar Global</h3>
              <p className="text-slate-500 text-sm">Diakui oleh berbagai institusi dan partner kami.</p>
           </div>
        </div>
      </main>
    </div>
  )
}
