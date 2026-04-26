// @ts-nocheck
import { createFileRoute, Link } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Star, 
  Users
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { profileQueries } from '@/lib/queries'

export const Route = createFileRoute('/mentors/')({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(profileQueries.allMentors())
  },
  component: MentorsPage,
})


function MentorsPage() {
  const { data: mentors = [] } = useQuery(profileQueries.allMentors())

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-left flex flex-col">
      <main className="pt-32 pb-20 max-w-7xl mx-auto px-6 w-full text-left">
        <div className="max-w-2xl space-y-6 mb-16 text-left">
           <Badge className="bg-red-50 text-red-600 border-none px-4 py-1.5 font-black uppercase text-[10px]">Mentor Ahli</Badge>
           <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none text-left">Belajar Langsung <br/> Dari <span className="text-red-600">Terbaik.</span></h1>
           <p className="text-lg text-slate-500 font-medium text-left">Sesi 1-on-1 bersama pakar industri untuk mempercepat karir Anda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
           {mentors.length > 0 ? mentors.map((m) => (
             <Card key={m.id} className="group border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-slate-50 dark:bg-slate-900 p-8 text-left">
                <div className="flex items-center gap-6 mb-8 text-left">
                   <img src={m.avatar_url || `https://i.pravatar.cc/150?u=${m.id}`} className="w-20 h-20 rounded-[2rem] object-cover ring-4 ring-white dark:ring-slate-800 shadow-xl" alt={m.name} />
                   <div className="text-left">
                      <h3 className="text-xl font-black dark:text-white">{m.name || 'Mentor'}</h3>
                      <p className="text-xs font-bold text-red-600 uppercase tracking-widest truncate max-w-[150px]">Pakar Industri</p>
                   </div>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 text-left leading-relaxed line-clamp-3">"{m.bio || 'Membantu Anda menguasai keahlian baru dengan metode belajar yang efektif dan interaktif.'}"</p>
                <div className="grid grid-cols-2 gap-4 mb-8 text-left">
                   <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl text-left">
                      <div className="text-[10px] font-black text-slate-400 uppercase mb-1">XP</div>
                      <div className="font-black flex items-center gap-1">{m.xp || 0} XP</div>
                   </div>
                   <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl text-left">
                      <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Level</div>
                      <div className="font-black flex items-center gap-1">{m.level || 1}</div>
                   </div>
                </div>
                <Link to="/mentors/$mentorId" params={{ mentorId: m.id.toString() }}>
                   <Button className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black shadow-lg shadow-red-100 dark:shadow-none transition-all active:scale-95">Lihat Profil</Button>
                </Link>
             </Card>
           )) : (
             <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Belum ada mentor yang terdaftar</div>
           )}
        </div>
      </main>
    </div>
  )
}
