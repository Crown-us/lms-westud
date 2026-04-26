// @ts-nocheck
import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { motion, type Variants, AnimatePresence } from 'framer-motion'
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  ArrowRight, 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Users, 
  PlayCircle,
  ChevronLeft,
  CheckCircle2,
  BookOpen,
} from 'lucide-react'
import { courseQueries } from '@/lib/queries'

export const Route = createFileRoute('/courses/')({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(courseQueries.publicCourses())
  },
  component: PublicCoursesPage,
})

const CATEGORIES = ['Semua Materi', 'Web Development', 'UI/UX Design', 'Data Science', 'Marketing', 'IT Security']

function PublicCoursesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('Semua Materi')

  const { data: courses = [], error } = useQuery(courseQueries.publicCourses())

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (course.instructor?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = activeCategory === 'Semua Materi' || course.category === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [courses, searchQuery, activeCategory])

  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  }

  const item: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 }
  }
return (
  <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-left flex flex-col">
    <main className="pt-32 pb-20 max-w-7xl mx-auto px-6 text-left w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 text-left">
           <div className="space-y-4 text-left">
              <Link to="/" className="flex items-center gap-2 text-red-600 font-bold text-sm hover:underline text-left">
                 <ChevronLeft className="w-4 h-4" /> Kembali ke Beranda
              </Link>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none text-left font-display">
                 Jelajahi <span className="text-red-600">Kursus</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl text-lg text-left">
                 Temukan materi belajar terbaik dari ribuan instruktur berpengalaman di seluruh dunia.
              </p>
           </div>
           
           <div className="flex items-center gap-3 text-left">
              <div className="relative group text-left">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-red-600 transition-colors" />
                 <Input 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Cari materi apa saja..." 
                   className="pl-11 h-14 w-full md:w-[350px] rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus-visible:ring-red-600 dark:text-white font-bold"
                 />
              </div>
              <Button variant="outline" className="h-14 w-14 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-800 p-0 text-left">
                 <Filter className="w-5 h-5 text-slate-500 mx-auto" />
              </Button>
           </div>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide mb-8 text-left">
           {CATEGORIES.map((cat) => (
              <Button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                variant={activeCategory === cat ? 'default' : 'outline'} 
                className={`rounded-full px-6 font-bold h-11 whitespace-nowrap transition-all ${
                  activeCategory === cat ? 'bg-red-600 hover:bg-red-700 text-white' : 'border-slate-100 dark:border-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                {cat}
              </Button>
           ))}
        </div>

        {/* Courses Grid */}
        <AnimatePresence mode="wait">
          {error ? (
            <div className="py-20 text-center w-full text-left">
              <p className="text-red-500 font-bold">Gagal memuat data kursus.</p>
            </div>
          ) : filteredCourses.length > 0 ? (
            <motion.div 
              key={activeCategory + searchQuery}
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 text-left"
            >
              {filteredCourses.map((course) => (
                <motion.div key={course.id} variants={item} className="text-left">
                  <Link to="/courses/$courseId" params={{ courseId: course.id.toString() }} className="block h-full text-left">
                    <Card className="group border-none shadow-sm dark:shadow-slate-950/50 hover:shadow-[0_20px_50px_rgba(239,68,68,0.15)] transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-800 h-full flex flex-col text-left">
                      <div className="aspect-[16/11] overflow-hidden relative text-left">
                        <img src={course.image_url || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60'} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 text-left" />
                        <div className="absolute top-6 right-6 text-left">
                          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl shadow-lg transform translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 text-left">
                             <PlayCircle className="w-6 h-6 text-red-600" />
                          </div>
                        </div>
                        <div className="absolute bottom-6 left-6 flex gap-2 text-left">
                          <Badge className="bg-red-600 text-white border-none font-bold rounded-lg px-3 py-1 shadow-lg shadow-red-600/20">{course.category}</Badge>
                        </div>
                      </div>

                      <CardHeader className="p-8 pb-2 space-y-4 flex-1 text-left">
                        <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                          <div className="flex items-center gap-2 text-left">
                            <Users className="w-3 h-3 text-red-500" />
                            <span>{course.total_students || 0} SISWA</span>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-md text-left">
                            <Star className="w-3 h-3 fill-current text-left" />
                            <span className="font-black pt-0.5">{course.rating || '0'}</span>
                          </div>
                        </div>
                        
                        <CardTitle className="text-2xl font-black leading-[1.1] text-slate-800 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors tracking-tight text-left font-display">
                          {course.title}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-400 text-left">
                           <div className="flex items-center gap-1.5 text-left"><Clock className="w-3.5 h-3.5" />{course.duration || 'TBA'}</div>
                           <div className="w-1 h-1 rounded-full bg-slate-300" />
                           <div className="flex items-center gap-1.5 text-left"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" />Materi</div>
                        </div>
                      </CardHeader>

                      <CardContent className="px-8 py-0 text-left">
                         <div className="flex items-center gap-3 pt-4 border-t dark:border-slate-700/50 text-left">
                            <img src={course.instructor?.avatar_url || `https://i.pravatar.cc/100?u=${course.id}`} className="w-8 h-8 rounded-full object-cover ring-2 ring-red-50 dark:ring-slate-700 text-left" alt="instructor" />
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">By {course.instructor?.name || 'Mentor'}</span>
                         </div>
                      </CardContent>

                      <CardFooter className="p-8 pt-6 text-left">
                        <div className="flex items-center justify-between w-full text-left">
                           <div className="flex flex-col text-left">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Harga</span>
                              <span className="text-2xl font-black text-slate-900 dark:text-white text-left">{course.price_monthly || 'Gratis'}</span>
                           </div>
                           <Button size="icon" className="w-12 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl group-hover:bg-red-600 group-hover:text-white transition-all shadow-lg text-left">
                              <ArrowRight className="w-6 h-6 mx-auto" />
                           </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center space-y-4 w-full text-left"
            >
               <div className="bg-slate-50 dark:bg-slate-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-left">
                  <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-700" />
               </div>
               <h3 className="text-2xl font-black text-slate-800 dark:text-white text-left">Kursus tidak ditemukan</h3>
               <p className="text-slate-500 dark:text-slate-400 font-bold text-left">Coba cari dengan kata kunci lain atau kategori yang berbeda.</p>
               <Button variant="ghost" onClick={() => {setSearchQuery(''); setActiveCategory('Semua Materi')}} className="text-red-600 font-bold text-left">Reset Semua Filter</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
