// @ts-nocheck
import * as React from 'react'
import { createFileRoute, Link, useParams, useRouteContext, redirect } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  PlayCircle, 
  ChevronRight, 
  ChevronLeft, 
  Star, 
  Loader2,
  MessageSquare,
  Send,
  CheckCircle2,
  Trophy,
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from '@/lib/toast-store'

import { profileQueries, courseQueries } from '@/lib/queries'

export const Route = createFileRoute('/dashboard/courses/$courseId/learn')({
  beforeLoad: async ({ params, context }) => {
    const user = context.auth.user
    if (!user) throw redirect({ to: '/login', search: { redirect: `/dashboard/courses/${params.courseId}/learn` } })
    
    // Safety check: Ensure user is enrolled
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', params.courseId)
      .eq('student_id', user.id)
      .maybeSingle()
    
    if (!enrollment) {
      throw redirect({ to: '/courses/$courseId', params: { courseId: params.courseId } })
    }
  },
  loader: async ({ params, context: { queryClient, auth } }) => {
    await Promise.all([
      queryClient.ensureQueryData(courseQueries.classroom(params.courseId)),
      queryClient.ensureQueryData(courseQueries.progress(params.courseId, auth.user?.id))
    ])
  },
  component: ClassroomPage,
})

function ClassroomPage() {
  const { courseId } = useParams({ from: '/dashboard/courses/$courseId/learn' })
  const { auth } = useRouteContext({ from: '/dashboard/courses/$courseId/learn' })
  const user = auth.user!
  const queryClient = useQueryClient()
  
  const [activeLesson, setActiveLesson] = useState<any>(null)
  const [activeQuiz, setActiveQuiz] = useState<any>(null)
  const [quizStarted, setQuizStarted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({})
  const [quizResult, setQuizResult] = useState<any>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [comment, setComment] = useState('')

  const getEmbedUrl = (url: string) => {
    if (!url) return ''
    
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = ''
      if (url.includes('watch?v=')) videoId = url.split('v=')[1].split('&')[0]
      else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0]
      else if (url.includes('youtube.com/embed/')) return url
      
      return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : url
    }
    
    // Vimeo
    if (url.includes('vimeo.com')) {
      const vimeoId = url.split('vimeo.com/')[1].split('?')[0]
      return `https://player.vimeo.com/video/${vimeoId}`
    }

    return url
  }

  const VideoPlayer = ({ url }: { url: string }) => {
    const isDirectFile = url?.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || url?.includes('storage.googleapis.com') || url?.includes('supabase.co/storage')
    const embedUrl = getEmbedUrl(url)

    if (isDirectFile) {
      return (
        <video 
          src={url} 
          controls 
          className="w-full h-full object-contain bg-black" 
          controlsList="nodownload"
          playsInline
        />
      )
    }

    return (
      <iframe 
        src={embedUrl} 
        className="w-full h-full border-none" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen 
      />
    )
  }

  const { data: courseData } = useQuery(courseQueries.classroom(courseId))
  const { data: completedLessons = [], refetch: refetchProgress } = useQuery(courseQueries.progress(courseId, user.id))
  const { data: discussions = [], refetch: refetchDiscussions } = useQuery(courseQueries.discussions(activeLesson?.id))

  // Real-time listener for discussions
  useEffect(() => {
    if (!activeLesson?.id) return

    const channel = supabase
      .channel(`lesson-discussions-${activeLesson.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'discussions',
          filter: `lesson_id=eq.${activeLesson.id}`
        },
        () => {
          refetchDiscussions()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeLesson?.id, refetchDiscussions])

  const { data: fullQuizData, isLoading: isQuizLoading } = useQuery({
    queryKey: ['quiz-full', activeQuiz?.id],
    enabled: !!activeQuiz?.id,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*, questions(*, options(*))')
        .eq('id', activeQuiz.id)
        .single()
      if (error) throw error
      return data
    }
  })

  // 2. Complete Lesson Mutation
  const completeLessonMutation = useMutation({
    mutationFn: async (lessonId: number) => {
      const { error } = await supabase.from('completed_lessons').upsert({
        student_id: user.id,
        lesson_id: lessonId,
        course_id: parseInt(courseId)
      })
      if (error) throw error
    },
    onSuccess: () => {
      refetchProgress()
      toast.success('Materi selesai! Progres diperbarui.')
    },
    onError: (err: any) => toast.error('Gagal simpan progres: ' + err.message)
  })

  const postCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase.from('discussions').insert({
        lesson_id: activeLesson.id,
        user_id: user.id,
        content
      })
      if (error) throw error
    },
    onSuccess: () => {
      setComment('')
      refetchDiscussions()
    }
  })

  const submitQuizMutation = useMutation({
    mutationFn: async () => {
      let correctCount = 0
      fullQuizData.questions.forEach((q: any) => {
        if (q.type === 'uraian') {
          // Simplification: correct if not empty
          if (userAnswers[q.id] && userAnswers[q.id].toString().trim().length > 0) correctCount++
        } else {
          const correctOption = q.options.find((o: any) => o.is_correct)
          if (userAnswers[q.id] === correctOption?.id) correctCount++
        }
      })
      
      const score = Math.round((correctCount / fullQuizData.questions.length) * 100)
      const passed = score >= (activeQuiz.passing_score || 70)
      
      const { data, error } = await supabase.from('quiz_attempts').insert({
        student_id: user.id,
        quiz_id: activeQuiz.id,
        score,
        passed
      }).select().single()
      
      if (error) throw error
      return { ...data, correctCount, totalCount: fullQuizData.questions.length }
    },
    onSuccess: (data) => {
      setQuizResult(data)
      if (data.passed) {
        // Achievement celebration!
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js'
        script.onload = () => {
          (window as any).confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ef4444', '#ffffff', '#000000']
          })
        }
        document.body.appendChild(script)
      }
    }
  })

  useEffect(() => {
    if (courseData && !activeLesson && !activeQuiz) {
      // Find the first available lesson in any module
      const firstModule = courseData.modules?.find((m: any) => m.lessons?.length > 0)
      if (firstModule) {
        setActiveLesson(firstModule.lessons[0])
      } else {
        // Fallback to first quiz if no lessons found
        const firstQuizModule = courseData.modules?.find((m: any) => m.quizzes?.length > 0)
        if (firstQuizModule) setActiveQuiz(firstQuizModule.quizzes[0])
      }
    }
  }, [courseData, activeLesson, activeQuiz])

  if (courseData && (!courseData.modules || courseData.modules.length === 0)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 p-6 text-center gap-6">
        <div className="w-24 h-24 rounded-[2rem] bg-red-50 flex items-center justify-center">
           <PlayCircle className="w-12 h-12 text-red-600 opacity-20" />
        </div>
        <div className="space-y-2">
           <h2 className="text-2xl font-black">Belum ada materi</h2>
           <p className="text-slate-500 font-medium max-w-xs">Instruktur belum mengunggah materi untuk kursus ini. Silakan kembali lagi nanti.</p>
        </div>
        <Link to="/dashboard/courses"><Button className="bg-red-600 text-white font-black rounded-2xl h-14 px-8">Kembali ke Dashboard</Button></Link>
      </div>
    )
  }

  if (!activeLesson && !activeQuiz) {
    return <div className="h-screen flex items-center justify-center bg-white dark:bg-slate-950"><Loader2 className="w-12 h-12 text-red-600 animate-spin" /></div>
  }

  // Calculate dynamic progress
  const totalLessonsInCourse = courseData.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 1
  const progressPercent = Math.round((completedLessons.length / totalLessonsInCourse) * 100)

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-slate-950 overflow-hidden text-left">
      <header className="h-16 border-b dark:border-slate-800 flex items-center justify-between px-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-4">
           <Link to="/dashboard/courses"><Button variant="ghost" size="icon" className="rounded-xl"><ChevronLeft className="w-5 h-5" /></Button></Link>
           <div>
              <h1 className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[200px] uppercase">{courseData.title}</h1>
              <div className="flex items-center gap-2">
                 <Progress value={progressPercent} className="h-1.5 w-24 bg-slate-100 dark:bg-slate-800" />
                 <span className="text-[10px] font-black text-red-600 uppercase">{progressPercent}% SELESAI</span>
              </div>
           </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <main className="flex-1 flex flex-col overflow-y-auto">
          {activeQuiz ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 max-w-4xl mx-auto w-full">
               {isQuizLoading ? (
                 <div className="text-center space-y-4">
                    <div className="relative w-20 h-20 mx-auto">
                       <Loader2 className="w-20 h-20 text-red-600 animate-spin absolute inset-0" />
                       <div className="absolute inset-4 bg-red-50 rounded-full animate-pulse" />
                    </div>
                    <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em]">Menyusun Soal...</p>
                 </div>
               ) : !quizStarted && !quizResult ? (
                 <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-800 text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                       <Trophy className="w-12 h-12 text-red-600" />
                    </div>
                    <div className="space-y-2">
                       <h2 className="text-4xl font-black text-slate-900 dark:text-white">{activeQuiz.title}</h2>
                       <p className="text-slate-500 font-bold">Uji pemahamanmu tentang materi di bab ini.</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Soal</div>
                          <div className="text-2xl font-black text-slate-900 dark:text-white">{fullQuizData?.questions?.length || 0}</div>
                       </div>
                       <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Skor Lulus</div>
                          <div className="text-2xl font-black text-red-600">{activeQuiz.passing_score || 70}%</div>
                       </div>
                    </div>

                    <div className="flex flex-col gap-4">
                       <Button onClick={() => setQuizStarted(true)} className="bg-red-600 hover:bg-red-700 text-white rounded-[2rem] h-16 font-black text-xl shadow-xl shadow-red-100 dark:shadow-none transition-all active:scale-95">Mulai Kuis Sekarang</Button>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gunakan angka 1-4 untuk memilih jawaban</p>
                    </div>
                 </div>
               ) : quizResult ? (
                 <div className="w-full max-w-2xl text-center space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className={`w-40 h-40 rounded-[3rem] mx-auto flex items-center justify-center shadow-2xl transform rotate-3 ${quizResult.passed ? 'bg-green-500 text-white shadow-green-200' : 'bg-red-600 text-white shadow-red-200'}`}>
                       {quizResult.passed ? <Trophy className="w-20 h-20" /> : <AlertCircle className="w-20 h-20" />}
                    </div>
                    
                    <div className="space-y-2">
                       <h2 className="text-5xl font-black text-slate-900 dark:text-white">{quizResult.passed ? 'LUAR BIASA!' : 'COBA LAGI!'}</h2>
                       <p className="text-slate-500 text-lg font-bold">
                          {quizResult.passed 
                            ? 'Kamu berhasil menguasai materi ini dengan baik.' 
                            : 'Jangan menyerah! Review lagi materinya dan coba lagi.'}
                       </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl grid grid-cols-2 gap-8">
                       <div className="text-center space-y-1">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skor Akhir</div>
                          <div className={`text-5xl font-black ${quizResult.passed ? 'text-green-500' : 'text-red-600'}`}>{quizResult.score}</div>
                       </div>
                       <div className="text-center space-y-1">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Benar</div>
                          <div className="text-5xl font-black text-slate-900 dark:text-white">{quizResult.correctCount} <span className="text-lg text-slate-300">/ {quizResult.totalCount}</span></div>
                       </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                       <Button 
                         onClick={() => { 
                            setQuizStarted(false); 
                            setQuizResult(null); 
                            setUserAnswers({}); 
                            setCurrentQuestionIndex(0); 
                         }} 
                         variant="outline"
                         className="rounded-3xl h-16 px-10 font-black text-lg border-2"
                       >
                          Ulangi Kuis
                       </Button>
                       <Button 
                         onClick={() => { 
                            setActiveQuiz(null); 
                            setQuizResult(null); 
                            setUserAnswers({}); 
                            setCurrentQuestionIndex(0); 
                            setQuizStarted(false);
                            // Navigate to next lesson if exists
                            const allLessons = courseData.modules.flatMap((m: any) => m.lessons);
                            const currentIdx = allLessons.findIndex((l: any) => l.id === activeLesson?.id);
                            if (currentIdx !== -1 && allLessons[currentIdx + 1]) {
                               setActiveLesson(allLessons[currentIdx + 1]);
                            }
                         }} 
                         className="bg-red-600 hover:bg-red-700 text-white rounded-3xl h-16 px-10 font-black text-lg shadow-xl shadow-red-100 transition-all active:scale-95"
                       >
                          Lanjut ke Materi
                       </Button>
                    </div>
                 </div>
               ) : (
                 <div className="w-full space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="space-y-6">
                       <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center font-black">
                                {currentQuestionIndex + 1}
                             </div>
                             <div>
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Pertanyaan</h3>
                                <p className="text-xs font-bold text-slate-400">{fullQuizData?.questions?.length || 0} Total Soal</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-4 text-slate-400">
                             <Clock className="w-5 h-5" />
                             <span className="font-black text-sm uppercase tabular-nums">Progressive Mode</span>
                          </div>
                       </div>
                       
                       {/* Smooth Progress Bar */}
                       <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                             className="h-full bg-red-600 transition-all duration-500 ease-out rounded-full" 
                             style={{ width: `${((currentQuestionIndex + 1) / (fullQuizData?.questions?.length || 1)) * 100}%` }}
                          />
                       </div>
                    </div>

                    <div className="space-y-8">
                       <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-[1.2]">
                          {fullQuizData?.questions?.[currentQuestionIndex]?.question_text}
                       </h2>
                       
                       <div className="grid gap-4">
                          {fullQuizData?.questions?.[currentQuestionIndex]?.type === 'uraian' ? (
                             <textarea 
                               value={userAnswers[fullQuizData.questions[currentQuestionIndex].id] || ''}
                               onChange={(e) => setUserAnswers({...userAnswers, [fullQuizData.questions[currentQuestionIndex].id]: e.target.value})}
                               placeholder="Ketik jawaban kamu di sini..."
                               className="w-full h-48 p-8 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-lg outline-none focus:border-red-600 transition-all shadow-inner resize-none"
                             />
                          ) : (
                             fullQuizData?.questions?.[currentQuestionIndex]?.options.map((option: any, idx: number) => {
                                const letter = String.fromCharCode(65 + idx); // A, B, C, D
                                const isSelected = userAnswers[fullQuizData.questions[currentQuestionIndex].id] === option.id;
                                
                                return (
                                  <button
                                    key={option.id}
                                    onClick={() => setUserAnswers({...userAnswers, [fullQuizData.questions[currentQuestionIndex].id]: option.id})}
                                    className={`group relative p-6 rounded-[2rem] border-2 text-left transition-all flex items-center gap-6 ${isSelected ? 'border-red-600 bg-red-50 dark:bg-red-900/20 shadow-lg shadow-red-50 dark:shadow-none' : 'border-slate-100 dark:border-slate-800 hover:border-red-100 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900'}`}
                                  >
                                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all ${isSelected ? 'bg-red-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-red-100 group-hover:text-red-600'}`}>
                                        {letter}
                                     </div>
                                     <span className={`text-lg font-bold flex-1 ${isSelected ? 'text-red-600' : 'text-slate-600 dark:text-slate-300'}`}>{option.option_text}</span>
                                     {isSelected && <CheckCircle2 className="w-6 h-6 text-red-600 animate-in zoom-in" />}
                                  </button>
                                )
                             })
                          )}
                       </div>
                    </div>

                    <div className="flex justify-between items-center pt-10 border-t dark:border-slate-800">
                       <Button 
                         variant="ghost" 
                         disabled={currentQuestionIndex === 0} 
                         onClick={() => setCurrentQuestionIndex(i => i - 1)} 
                         className="rounded-2xl h-14 px-8 font-black text-slate-400 hover:text-red-600"
                       >
                          <ChevronLeft className="w-5 h-5 mr-2" /> SEBELUMNYA
                       </Button>
                       
                       {currentQuestionIndex === (fullQuizData?.questions?.length || 1) - 1 ? (
                         <Button 
                           onClick={() => submitQuizMutation.mutate()} 
                           disabled={!userAnswers[fullQuizData?.questions?.[currentQuestionIndex]?.id] || submitQuizMutation.isPending} 
                           className="bg-red-600 hover:bg-red-700 text-white rounded-[1.5rem] h-16 px-12 font-black text-lg transition-all active:scale-95 shadow-2xl shadow-red-200 dark:shadow-none disabled:opacity-50"
                         >
                            {submitQuizMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Trophy className="w-5 h-5 mr-2" />}
                            KUMPULKAN JAWABAN
                         </Button>
                       ) : (
                         <Button 
                           onClick={() => setCurrentQuestionIndex(i => i + 1)} 
                           disabled={!userAnswers[fullQuizData?.questions?.[currentQuestionIndex]?.id]} 
                           className="bg-red-600 hover:bg-red-700 text-white rounded-[1.5rem] h-16 px-12 font-black text-lg transition-all active:scale-95 shadow-2xl shadow-red-200 dark:shadow-none disabled:opacity-50"
                         >
                            LANJUT <ChevronRight className="w-5 h-5 ml-2" />
                         </Button>
                       )}
                    </div>
                 </div>
               )}
            </div>
          ) : (
            <>
              <div className="bg-black aspect-video w-full relative">
                <VideoPlayer url={activeLesson.content_url} />
              </div>
              <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                       <Badge className="bg-red-50 text-red-600 border-none font-black text-[10px] mb-2 uppercase tracking-widest">Materi Sekarang</Badge>
                       <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight">{activeLesson.title}</h2>
                    </div>
                    {activeLesson && !completedLessons.includes(activeLesson.id) && (
                      <Button 
                        onClick={() => completeLessonMutation.mutate(activeLesson.id)}
                        disabled={completeLessonMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-2xl h-12 px-6 font-black text-xs uppercase tracking-widest shadow-lg shadow-green-100 dark:shadow-none transition-all active:scale-95 whitespace-nowrap"
                      >
                        {completeLessonMutation.isPending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                        Selesaikan Materi
                      </Button>
                    )}
                    {activeLesson && completedLessons.includes(activeLesson.id) && (
                      <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest bg-green-50 dark:bg-green-900/20 px-5 py-3 rounded-2xl border border-green-100 dark:border-green-900/30">
                        <CheckCircle2 className="w-4 h-4" /> Materi Selesai
                      </div>
                    )}
                 </div>
                 <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 gap-8">
                       <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 rounded-none px-0 pb-4 font-black text-sm uppercase tracking-widest">Ringkasan</TabsTrigger>
                       <TabsTrigger value="discussion" className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 rounded-none px-0 pb-4 font-black text-sm uppercase tracking-widest">Diskusi ({discussions.length})</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="pt-8 text-left">
                       <p className="text-slate-600 dark:text-slate-400 font-medium">{activeLesson.description || 'Materi belajar interaktif.'}</p>
                    </TabsContent>

                    <TabsContent value="discussion" className="pt-8 text-left">
                       <div className="space-y-8">
                          {/* Input Komentar */}
                          <div className="flex gap-4 items-start">
                             <Avatar className="w-10 h-10 border-2 border-slate-100">
                                <AvatarImage src={auth.profile?.avatar_url} />
                                <AvatarFallback className="font-black text-xs uppercase">{auth.profile?.name?.charAt(0)}</AvatarFallback>
                             </Avatar>
                             <div className="flex-1 relative">
                                <textarea 
                                   value={comment}
                                   onChange={(e) => setComment(e.target.value)}
                                   placeholder="Tanyakan sesuatu tentang materi ini..." 
                                   className="w-full min-h-[100px] p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none focus:ring-2 focus:ring-red-600 font-medium text-sm outline-none transition-all"
                                />
                                <Button 
                                   onClick={() => comment && postCommentMutation.mutate(comment)}
                                   disabled={!comment || postCommentMutation.isPending}
                                   className="absolute bottom-3 right-3 bg-red-600 text-white rounded-xl h-10 px-4 font-black text-xs"
                                >
                                   {postCommentMutation.isPending ? <Loader2 className="animate-spin" /> : <><Send className="w-3 h-3 mr-2" /> KIRIM</>}
                                </Button>
                             </div>
                          </div>

                          {/* Daftar Komentar */}
                          <div className="space-y-6 pt-4">
                             {discussions.length > 0 ? discussions.map((d: any) => (
                                <div key={d.id} className="flex gap-4 items-start group">
                                   <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                                      <AvatarImage src={d.user?.avatar_url} />
                                      <AvatarFallback className="font-black text-xs">{d.user?.name?.charAt(0)}</AvatarFallback>
                                   </Avatar>
                                   <div className="flex-1 space-y-1">
                                      <div className="flex items-center gap-2">
                                         <span className="font-black text-sm">{d.user?.name}</span>
                                         <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(d.created_at).toLocaleDateString('id-ID')}</span>
                                      </div>
                                      <div className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl rounded-tl-none">
                                         {d.content}
                                      </div>
                                   </div>
                                </div>
                             )) : (
                                <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                                   <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                                   <p className="text-slate-400 font-bold text-sm">Belum ada diskusi. Jadilah yang pertama bertanya!</p>
                                </div>
                             )}
                          </div>
                       </div>
                    </TabsContent>
                 </Tabs>
              </div>
            </>
          )}
        </main>

        <aside className={`bg-slate-50 dark:bg-slate-900 border-l dark:border-slate-800 flex flex-col ${isSidebarOpen ? 'w-[400px]' : 'w-0 border-none'} transition-all`}>
           <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                 {courseData.modules?.map((module: any, mIdx: number) => (
                    <div key={module.id} className="space-y-3 text-left">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bab {mIdx + 1}: {module.title}</h4>
                       <div className="space-y-1">
                          {module.lessons?.map((lesson: any) => (
                             <button key={lesson.id} onClick={() => { setActiveLesson(lesson); setActiveQuiz(null); setQuizResult(null); }} className={`w-full flex items-center gap-4 p-4 rounded-[1.5rem] text-left transition-all ${activeLesson?.id === lesson.id && !activeQuiz ? 'bg-red-600 text-white shadow-xl shadow-red-200' : 'hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                {completedLessons.includes(lesson.id) ? (
                                  <CheckCircle2 className="w-4 h-4 shrink-0 text-green-500" />
                                ) : (
                                  <PlayCircle className="w-4 h-4 shrink-0" />
                                )}
                                <div className="text-xs font-black truncate">{lesson.title}</div>
                             </button>
                          ))}
                          {module.quizzes?.map((quiz: any) => (
                             <button key={quiz.id} onClick={() => { setActiveQuiz(quiz); setActiveLesson(null); setQuizResult(null); setCurrentQuestionIndex(0); setUserAnswers({}); }} className={`w-full flex items-center justify-between p-4 rounded-[1.5rem] text-left transition-all ${activeQuiz?.id === quiz.id ? 'bg-slate-900 text-white' : 'hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                <div className="flex items-center gap-4">
                                   <Star className="w-4 h-4 shrink-0 text-red-600" />
                                   <div className="text-xs font-black truncate">{quiz.title}</div>
                                </div>
                                <Badge className="bg-red-100 text-red-600 border-none font-black text-[9px]">QUIZ</Badge>
                             </button>
                          ))}
                       </div>
                    </div>
                 ))}
              </div>
           </ScrollArea>
        </aside>
      </div>
    </div>
  )
}
ack text-[9px]">QUIZ</Badge>
                             </button>
                          ))}
                       </div>
                    </div>
                 ))}
              </div>
           </ScrollArea>
        </aside>
      </div>
    </div>
  )
}
