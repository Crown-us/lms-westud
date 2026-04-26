// @ts-nocheck
import * as React from 'react'
import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  CheckCircle2,
  MoreVertical,
  Plus,
  Loader2,
  X,
  MapPin
} from 'lucide-react'
import { scheduleQueries } from '@/lib/queries'
import { supabase } from '@/lib/supabase'
import { toast } from '@/lib/toast-store'

export const Route = createFileRoute('/dashboard/schedule')({
  component: StudentSchedulePage,
})

const DAYS_SHORT = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

function StudentSchedulePage() {
  const { auth } = useRouteContext({ from: '/dashboard' } as any)
  const user = auth.user
  const queryClient = useQueryClient()
  
  const [selectedDate, setSelectedDate] = React.useState(new Date())
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [newSchedule, setNewSchedule] = React.useState({
    title: '',
    description: '',
    start_time: '',
    type: 'Meet',
    color: 'bg-blue-500'
  })

  // Format date for SQL gte/lte
  const formattedDate = selectedDate.toISOString().split('T')[0]

  const { data: schedules = [], isLoading } = useQuery(
    scheduleQueries.mySchedules(user?.id, formattedDate)
  )

  const addMutation = useMutation({
    mutationFn: async (data: typeof newSchedule) => {
      // Create a full ISO string for start_time
      // data.start_time is just HH:mm
      const [hours, minutes] = data.start_time.split(':')
      const startDateTime = new Date(selectedDate)
      startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

      const { error } = await supabase.from('schedules').insert({
        user_id: user.id,
        title: data.title,
        description: data.description,
        start_time: startDateTime.toISOString(),
        type: data.type,
        color: data.color
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules', user?.id, formattedDate] })
      setIsAddModalOpen(false)
      setNewSchedule({ title: '', description: '', start_time: '', type: 'Meet', color: 'bg-blue-500' })
      toast.success('Jadwal berhasil ditambahkan!')
    },
    onError: (err: any) => toast.error('Gagal tambah jadwal: ' + err.message)
  })

  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const item: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

  // Calendar Helpers
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const currentYear = selectedDate.getFullYear()
  const currentMonth = selectedDate.getMonth()
  const daysCount = getDaysInMonth(currentYear, currentMonth)

  const changeMonth = (offset: number) => {
    const newDate = new Date(selectedDate)
    newDate.setMonth(newDate.getMonth() + offset)
    setSelectedDate(newDate)
  }

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="max-w-[1400px] mx-auto space-y-8 pb-10 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
        <div className="text-left">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-display text-left">Jadwal Belajar</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-left">Atur waktumu dan jangan lewatkan sesi penting.</p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black px-6 h-12 shadow-lg shadow-red-100 dark:shadow-none"
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah Pengingat
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        {/* Calendar Column */}
        <div className="lg:col-span-4 space-y-6 text-left">
           <Card className="rounded-[2.5rem] border-none shadow-sm dark:shadow-none bg-white dark:bg-slate-900 p-8 text-left">
              <div className="flex items-center justify-between mb-8 text-left">
                 <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-[10px] text-left">
                   {selectedDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                 </h3>
                 <div className="flex gap-2">
                    <Button onClick={() => changeMonth(-1)} variant="ghost" size="icon" className="h-8 w-8 rounded-lg dark:text-white"><ChevronLeft className="w-4 h-4" /></Button>
                    <Button onClick={() => changeMonth(1)} variant="ghost" size="icon" className="h-8 w-8 rounded-lg dark:text-white"><ChevronRight className="w-4 h-4" /></Button>
                 </div>
              </div>
              
              <div className="grid grid-cols-7 gap-2 mb-4 text-left">
                 {DAYS_SHORT.map(day => (
                    <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase">{day}</div>
                 ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2 text-center">
                 {Array.from({ length: daysCount }).map((_, i) => {
                    const d = i + 1
                    const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, d).toDateString()
                    const isSelected = selectedDate.getDate() === d
                    
                    return (
                      <button 
                        key={i} 
                        onClick={() => {
                          const newD = new Date(selectedDate)
                          newD.setDate(d)
                          setSelectedDate(newD)
                        }}
                        className={`h-10 w-10 flex items-center justify-center rounded-xl text-xs font-black transition-all ${
                          isSelected 
                          ? 'bg-red-600 text-white shadow-lg shadow-red-200 dark:shadow-none' 
                          : isToday 
                            ? 'bg-red-50 dark:bg-red-900/30 text-red-600' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                         {d}
                      </button>
                    )
                 })}
              </div>
           </Card>

           <Card className="rounded-[2.5rem] border-none shadow-sm dark:shadow-none bg-red-50 dark:bg-red-900/10 p-8 space-y-6 text-left">
              <h3 className="font-black text-red-600 dark:text-red-400 uppercase tracking-widest text-[10px] text-left">Tugas Mendatang</h3>
              <div className="space-y-4 text-left">
                 {[
                   { title: 'Final Project UI', date: '24 Apr', status: 'Soon' },
                   { title: 'Quiz React Hooks', date: '26 Apr', status: 'Draft' }
                 ].map((task, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900/50 text-left">
                       <div className="flex items-center gap-3 text-left">
                          <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-lg text-red-600"><Video className="w-4 h-4" /></div>
                          <div className="text-left">
                             <div className="text-sm font-black text-slate-800 dark:text-white leading-none text-left">{task.title}</div>
                             <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter text-left">{task.date}</div>
                          </div>
                       </div>
                       <Badge variant="secondary" className="bg-slate-50 dark:bg-slate-800 text-slate-500 border-none font-bold text-[10px]">{task.status}</Badge>
                    </div>
                 ))}
              </div>
           </Card>
        </div>

        {/* Timeline Column */}
        <div className="lg:col-span-8 space-y-6 text-left">
           <Card className="rounded-[3rem] border-none shadow-sm dark:shadow-none bg-white dark:bg-slate-900 p-8 md:p-12 overflow-hidden relative text-left">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.07] pointer-events-none">
                 <CalendarIcon className="w-64 h-64 text-red-600" />
              </div>

              <div className="flex items-center justify-between mb-12 relative z-10 text-left">
                 <div className="flex items-center gap-4 text-left">
                    <div className="bg-red-600 text-white p-3 rounded-2xl shadow-xl shadow-red-100 dark:shadow-none"><CalendarIcon className="w-6 h-6" /></div>
                    <div className="text-left">
                       <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-display text-left">Timeline</h2>
                       <p className="text-sm font-bold text-slate-400 text-left">
                         {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                       </p>
                    </div>
                 </div>
              </div>

              <div className="space-y-12 relative z-10 ml-4 border-l-2 border-slate-100 dark:border-slate-800 pl-8 pb-10 text-left">
                 {isLoading ? (
                   [1,2].map(i => (
                     <div key={i} className="h-32 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] animate-pulse" />
                   ))
                 ) : schedules.length > 0 ? (
                    schedules.map((event, i) => (
                      <motion.div key={event.id} variants={item} className="relative text-left">
                        <div className={`absolute -left-[41px] top-1 h-4 w-4 rounded-full border-4 border-white dark:border-slate-900 shadow-sm ${event.color || 'bg-red-600'}`}></div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 group text-left">
                            <div className="flex flex-col md:flex-row gap-6 items-start text-left">
                               <div className="min-w-[70px] pt-1 text-left">
                                  <span className="text-lg font-black text-slate-900 dark:text-white text-left">
                                    {new Date(event.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                               </div>
                               <div className="p-6 md:p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 group-hover:bg-red-50 dark:group-hover:bg-red-900/10 transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30 w-full md:min-w-[400px] text-left">
                                  <div className="flex justify-between items-start mb-4 text-left">
                                     <Badge className={`${event.color || 'bg-red-600'} text-white border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full`}>
                                        {event.type}
                                     </Badge>
                                     <button className="text-slate-300 hover:text-slate-600 transition-colors"><MoreVertical className="w-4 h-4" /></button>
                                  </div>
                                  <h4 className="text-xl font-black text-slate-800 dark:text-white mb-2 group-hover:text-red-600 transition-colors font-display text-left">{event.title}</h4>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-4 line-clamp-1 text-left">{event.description}</p>
                                  <div className="flex items-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-400 text-left">
                                     <div className="flex items-center gap-1.5 text-left"><Clock className="w-3.5 h-3.5" /> Scheduled</div>
                                     <div className="w-1 h-1 rounded-full bg-slate-300 text-left" />
                                     <div className="flex items-center gap-1.5 text-left"><Video className="w-3.5 h-3.5" /> Virtual Session</div>
                                  </div>
                               </div>
                            </div>
                            <div className="md:opacity-0 group-hover:opacity-100 transition-opacity text-left">
                               <Button className="bg-red-600 hover:bg-red-700 text-white font-black rounded-xl h-12 px-8 text-left">Buka Sesi</Button>
                            </div>
                        </div>
                      </motion.div>
                    ))
                 ) : (
                    <div className="py-20 text-center space-y-4 text-left">
                       <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-left">
                          <CalendarIcon className="w-8 h-8 text-slate-300" />
                       </div>
                       <div className="text-left">
                          <p className="font-black text-slate-400 uppercase text-[10px] tracking-[0.3em] text-center">Kosong</p>
                          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm text-center">Belum ada agenda untuk tanggal ini.</p>
                       </div>
                    </div>
                 )}
              </div>
           </Card>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm text-left">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 w-full max-w-xl shadow-2xl text-left">
               <div className="flex justify-between items-center mb-8 text-left">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white font-display text-left">Tambah Agenda</h3>
                  <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-red-600 transition-colors text-left"><X className="w-6 h-6" /></button>
               </div>
               
               <div className="space-y-6 text-left">
                  <div className="space-y-2 text-left">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 text-left">Judul Agenda</label>
                     <Input 
                       value={newSchedule.title}
                       onChange={e => setNewSchedule({...newSchedule, title: e.target.value})}
                       placeholder="Contoh: Mentoring React JS" 
                       className="h-14 rounded-2xl font-bold bg-slate-50 dark:bg-slate-800 border-none dark:text-white" 
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-left">
                     <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 text-left">Waktu Mulai</label>
                        <Input 
                          type="time"
                          value={newSchedule.start_time}
                          onChange={e => setNewSchedule({...newSchedule, start_time: e.target.value})}
                          className="h-14 rounded-2xl font-bold bg-slate-50 dark:bg-slate-800 border-none dark:text-white" 
                        />
                     </div>
                     <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 text-left">Tipe Sesi</label>
                        <select 
                          value={newSchedule.type}
                          onChange={e => setNewSchedule({...newSchedule, type: e.target.value})}
                          className="w-full h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 px-4 font-bold dark:text-white outline-none"
                        >
                           <option>Meet</option>
                           <option>Video</option>
                           <option>Live</option>
                           <option>Chat</option>
                        </select>
                     </div>
                  </div>

                  <div className="space-y-2 text-left">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 text-left">Catatan Singkat</label>
                     <textarea 
                       value={newSchedule.description}
                       onChange={e => setNewSchedule({...newSchedule, description: e.target.value})}
                       placeholder="Apa yang akan dibahas?"
                       className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-bold text-sm h-24 dark:text-white outline-none"
                     />
                  </div>

                  <Button 
                    onClick={() => addMutation.mutate(newSchedule)}
                    disabled={addMutation.isPending || !newSchedule.title || !newSchedule.start_time}
                    className="w-full h-14 bg-red-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-red-100 dark:shadow-none transition-all active:scale-95"
                  >
                     {addMutation.isPending ? <Loader2 className="animate-spin" /> : 'Simpan Agenda'}
                  </Button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
