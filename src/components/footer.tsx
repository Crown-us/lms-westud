import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { 
  MessageCircle
} from 'lucide-react'

export function Footer() {
  return (
    <footer className="py-24 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-left relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-24 relative z-10">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-8">
            <div className="flex items-center gap-3">
               <svg className="w-12 h-12 text-[#FF2D20]" viewBox="0 0 62 65" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M61.1685 16.5932L34.195 1.0371C32.1895 -0.1192 29.711 -0.1192 27.7055 1.0371L0.731998 16.5932C-0.244 17.155 -0.244 18.5631 0.731998 19.1249L6.1685 22.2592V55.0371C6.1685 57.3497 7.4045 59.4897 9.41 60.646L27.7055 72.1932C29.711 73.3495 32.1895 73.3495 34.195 72.1932L52.4905 60.646C54.496 59.4897 55.732 57.3497 55.732 55.0371V22.2592L61.1685 19.1249C62.1445 18.5631 62.1445 17.155 61.1685 16.5932Z" fill="currentColor"/>
               </svg>
               <div className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">WeStud.</div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-sm text-lg">
              WeStud adalah ekosistem belajar digital dengan kurikulum yang dirancang untuk kebutuhan industri nyata. Kami percaya pendidikan berkualitas harus bisa diakses semua orang.
            </p>
            <div className="flex gap-4">
              <a href="https://twitter.com/westud" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-[#FF2D20] transition-colors border dark:border-slate-800">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.922 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
              <a href="https://github.com/Crown-us/lms-westud" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-[#FF2D20] transition-colors border dark:border-slate-800">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              </a>
              <a href="https://youtube.com/@westud" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-[#FF2D20] transition-colors border dark:border-slate-800">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-[#FF2D20] transition-colors border dark:border-slate-800"><MessageCircle className="w-5 h-5" /></a>
            </div>
          </div>
          
          {/* Links Columns */}
          <div className="md:col-span-2 space-y-6">
            <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">Highlights</h4>
            <ul className="space-y-4 text-slate-500 dark:text-slate-400 font-bold text-sm">
               <li><Link to="/courses" className="hover:text-[#FF2D20] transition-colors">Our Courses</Link></li>
               <li><Link to="/mentors" className="hover:text-[#FF2D20] transition-colors">Top Mentors</Link></li>
               <li><Link to="/pricing" className="hover:text-[#FF2D20] transition-colors">Pricing Plans</Link></li>
               <li><Link to="/certification" className="hover:text-[#FF2D20] transition-colors">Certification</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-6">
            <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">Ecosystem</h4>
            <ul className="space-y-4 text-slate-500 dark:text-slate-400 font-bold text-sm">
              <li><a href="#" className="hover:text-[#FF2D20] transition-colors">WeStud Forge</a></li>
              <li><a href="#" className="hover:text-[#FF2D20] transition-colors">Vapor Pro</a></li>
              <li><a href="#" className="hover:text-[#FF2D20] transition-colors">Nova Design</a></li>
              <li><a href="#" className="hover:text-[#FF2D20] transition-colors">Envoyer Learn</a></li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-6 text-left">
            <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs text-left">Newsletter</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
              Dapatkan berita terbaru mengenai teknologi, tips karier, dan update materi langsung ke inbox Anda setiap minggu.
            </p>
            <div className="flex gap-2 p-1.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-800">
              <input type="email" placeholder="email@address.com" className="bg-transparent border-none px-4 h-12 flex-1 focus:ring-0 outline-none font-bold text-slate-900 dark:text-white text-sm" />
              <Button className="bg-[#FF2D20] hover:bg-[#E31B12] text-white rounded-xl h-12 px-6 font-black shadow-lg shadow-red-100 dark:shadow-none">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-12 border-t border-slate-50 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-left">
             <p className="text-slate-400 dark:text-slate-500 text-[11px] font-bold uppercase tracking-widest text-center md:text-left">
                WeStud is a trademark of WeStud Inc. <br className="md:hidden"/> Copyright © 2026 WeStud Inc.
             </p>
          </div>
          <div className="flex gap-8 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
             <a href="#" className="hover:text-[#FF2D20] transition-colors">Privacy Policy</a>
             <a href="#" className="hover:text-[#FF2D20] transition-colors">Terms of Service</a>
             <a href="#" className="hover:text-[#FF2D20] transition-colors">Cookies</a>
          </div>
        </div>
        
        {/* GIANT LARAVEL-STYLE TEXT */}
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-full text-center opacity-[0.03] dark:opacity-[0.05] pointer-events-none select-none">
           <h2 className="text-[15rem] md:text-[25rem] font-black tracking-tighter leading-none uppercase">WESTUD</h2>
        </div>
      </div>
    </footer>
  )
}
