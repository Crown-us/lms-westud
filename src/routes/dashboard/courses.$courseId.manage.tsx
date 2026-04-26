// @ts-nocheck
import * as React from 'react'
import { createFileRoute, Link, useParams, useRouteContext, redirect } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ChevronLeft, 
  Plus, 
  Trash2, 
  GripVertical, 
  Loader2,
  Edit3,
  Save,
  ChevronRight,
  FileText,
  Upload
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from '@/lib/toast-store'

export const Route = createFileRoute('/dashboard/courses/$courseId/manage')({
  beforeLoad: async ({ context, params }) => {
    const user = context.auth.user
    if (!user) throw redirect({ to: '/login', search: { redirect: `/dashboard/courses/${params.courseId}/manage` } })
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'guru') throw redirect({ to: '/dashboard', search: {} })
    const { data: course } = await supabase.from('courses').select('instructor_id').eq('id', params.courseId).single()
    if (course?.instructor_id !== user.id) throw redirect({ to: '/dashboard/courses', search: {} })
  },
  component: ManageCoursePage,
})

function ManageCoursePage() {
  const { courseId } = useParams({ from: '/dashboard/courses/$courseId/manage' })
  const { auth } = useRouteContext({ from: '/dashboard/courses/$courseId/manage' })
  const user = auth.user!
  const queryClient = useQueryClient()
  
  const [newModuleName, setNewModuleName] = React.useState('')
  const [editingLesson, setEditingLesson] = React.useState<any>(null)
  const [editingQuiz, setEditingQuiz] = React.useState<any>(null)
  const [editingQuestion, setEditingQuestion] = React.useState<any>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [localModules, setLocalModules] = React.useState<any[]>([])

  // State for beautiful confirmation dialog
  const [confirmState, setConfirmState] = React.useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    isLoading?: boolean;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  })

  const closeConfirm = () => setConfirmState(prev => ({ ...prev, isOpen: false }))

  const { data: course, isLoading: isCourseLoading } = useQuery({
    queryKey: ['manage-course', courseId],
    queryFn: async () => {
      const { data, error } = await supabase.from('courses').select('*').eq('id', courseId).single()
      if (error) throw error
      return data
    }
  })

  const { data: modulesData, isLoading: isModulesLoading } = useQuery({
    queryKey: ['manage-modules', courseId],
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      // Step 1: Get all modules
      const { data: modules, error: modError } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true })
      
      if (modError) throw modError
      if (!modules || modules.length === 0) return []

      const moduleIds = modules.map(m => m.id)

      // Step 2: Fetch lessons and quizzes in parallel
      const [lessonsRes, quizzesRes] = await Promise.all([
        supabase.from('lessons').select('*').in('module_id', moduleIds),
        supabase.from('quizzes').select('*, questions(*, options(*))').in('module_id', moduleIds)
      ])

      const lessons = lessonsRes.data || []
      const quizzes = quizzesRes.data || []

      // Step 3: Assemble the tree
      return modules.map((m: any) => ({
        ...m,
        lessons: lessons
          .filter((l: any) => l.module_id === m.id)
          .sort((a: any, b: any) => a.order_index - b.order_index),
        quizzes: quizzes
          .filter((q: any) => q.module_id === m.id)
          .sort((a: any, b: any) => a.order_index - b.order_index)
      }))
    }
  })

  // Sync localModules whenever data changes
  React.useEffect(() => {
    if (modulesData) {
      setLocalModules(modulesData)
    }
  }, [modulesData])

  // Mutations
  const reorderMutation = useMutation({
    mutationFn: async () => {
      for (let i = 0; i < localModules.length; i++) {
        await supabase.from('modules').update({ order_index: i + 1 }).eq('id', localModules[i].id)
        const lessons = localModules[i].lessons || []
        for (let j = 0; j < lessons.length; j++) {
          await supabase.from('lessons').update({ order_index: j + 1 }).eq('id', lessons[j].id)
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manage-modules', courseId] })
      toast.success('Urutan berhasil disimpan!')
    },
    onError: (err: any) => toast.error('Gagal simpan urutan: ' + err.message)
  })

  const addModuleMutation = useMutation({
    mutationFn: async (title: string) => {
      const { error } = await supabase.from('modules').insert({ title, course_id: courseId, order_index: localModules.length + 1 })
      if (error) throw error
    },
    onSuccess: () => {
      setNewModuleName('')
      queryClient.invalidateQueries({ queryKey: ['manage-modules', courseId] })
      toast.success('Bab berhasil ditambahkan!')
    },
    onError: (err: any) => toast.error('Gagal tambah bab: ' + err.message)
  })

  const lessonMutation = useMutation({
    mutationFn: async (lData: any) => {
      // Destructure only what we need to avoid Supabase errors (like sending created_at, lessons, or quizzes)
      const { id, module_id, title, type, content_url, duration } = lData
      const payload = { module_id, title, type, content_url, duration }

      if (id) {
        // Include type in update payload
        const { error } = await supabase.from('lessons').update(payload).eq('id', id)
        if (error) throw error
      } else {
        const order_index = (localModules.find(m => m.id === module_id)?.lessons?.length || 0) + 1
        const { error } = await supabase.from('lessons').insert([{ ...payload, order_index }])
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manage-modules', courseId] })
      toast.success('Materi berhasil disimpan!')
      // Small delay to ensure user sees success toast before modal disappears
      setTimeout(() => setEditingLesson(null), 300)
    },
    onError: (err: any) => {
      console.error('Lesson Mutation Error:', err)
      toast.error('Gagal simpan materi: ' + err.message)
    }
  })

  const deleteLessonMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('lessons').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manage-modules', courseId] })
      toast.success('Materi berhasil dihapus!')
    }
  })

  const deleteModuleMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('modules').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manage-modules', courseId] })
      toast.success('Bab berhasil dihapus!')
    },
    onError: (err: any) => toast.error('Gagal hapus bab: ' + err.message)
  })

  const quizMutation = useMutation({
    mutationFn: async (quiz: any) => {
      const { id, module_id, title, passing_score } = quiz
      if (id) {
        const { error } = await supabase.from('quizzes').update({ title, passing_score }).eq('id', id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('quizzes').insert({ 
          module_id, 
          title, 
          passing_score, 
          order_index: (localModules.find(m => m.id === module_id)?.quizzes?.length || 0) + 1 
        })
        if (error) throw error
      }
    },
    onSuccess: () => {
      setEditingQuiz(null)
      queryClient.invalidateQueries({ queryKey: ['manage-modules', courseId] })
      toast.success('Kuis berhasil disimpan!')
    },
    onError: (err: any) => {
      console.error('Quiz Error:', err)
      toast.error('Gagal simpan kuis: ' + err.message)
    }
  })

  const deleteQuizMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('quizzes').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      setEditingQuiz(null)
      queryClient.invalidateQueries({ queryKey: ['manage-modules', courseId] })
      toast.success('Kuis berhasil dihapus!')
    },
    onError: (err: any) => toast.error('Gagal hapus kuis: ' + err.message)
  })

  const questionMutation = useMutation({
    mutationFn: async (q: any) => {
      const { id, quiz_id, question_text, options, type } = q
      let questionId = id

      if (id) {
        const { error } = await supabase.from('questions').update({ question_text, type: type || 'pilihan_ganda' }).eq('id', id)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('questions').insert({ quiz_id, question_text, type: type || 'pilihan_ganda' }).select().single()
        if (error) throw error
        questionId = data.id
      }

      if (type === 'pilihan_ganda' && options) {
        await supabase.from('options').delete().eq('question_id', questionId)
        const { error: optError } = await supabase.from('options').insert(options.map((o: any) => ({ option_text: o.option_text, is_correct: o.is_correct, question_id: questionId })))
        if (optError) throw optError
      } else if (type === 'uraian') {
        // Clear options if switching from PG to Uraian
        await supabase.from('options').delete().eq('question_id', questionId)
      }
    },
    onSuccess: () => {
      setEditingQuestion(null)
      queryClient.invalidateQueries({ queryKey: ['manage-modules', courseId] })
      toast.success('Pertanyaan berhasil disimpan!')
    },
    onError: (err: any) => {
      console.error('Question Error:', err)
      toast.error('Gagal simpan pertanyaan: ' + err.message)
    }
  })

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('questions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manage-modules', courseId] })
      toast.success('Pertanyaan berhasil dihapus!')
    },
    onError: (err: any) => toast.error('Gagal hapus pertanyaan: ' + err.message)
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setIsUploading(true)
      const fileExt = file.name.split('.').pop()?.toLowerCase()
      const fileName = `${user.id}/lessons/${Math.random()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage.from('courses').upload(fileName, file)
      if (uploadError) throw uploadError
      
      const { data: { publicUrl } } = supabase.storage.from('courses').getPublicUrl(fileName)
      
      setEditingLesson((prev: any) => ({ 
        ...prev, 
        content_url: publicUrl,
        type: fileExt === 'pdf' ? 'pdf' : 'video'
      }))
      
      toast.success(`${fileExt === 'pdf' ? 'PDF' : 'Video'} berhasil diunggah!`)
    } catch (error: any) {
      toast.error('Upload gagal: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  if (isCourseLoading || isModulesLoading) return <div className="h-screen flex items-center justify-center bg-white dark:bg-slate-950"><Loader2 className="w-10 h-10 text-red-600 animate-spin" /></div>

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32 px-4 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b dark:border-slate-800 pb-8">
        <div className="space-y-1 text-left">
           <Link to="/dashboard/courses" className="flex items-center gap-2 text-red-600 font-bold text-sm hover:underline"><ChevronLeft className="w-4 h-4" /> Kembali</Link>
           <h1 className="text-3xl font-black text-slate-900 dark:text-white font-display text-left">{course?.title}</h1>
        </div>
        <div className="flex gap-3">
           <Button onClick={() => reorderMutation.mutate()} disabled={reorderMutation.isPending} className="bg-red-600 text-white rounded-2xl font-black h-12 px-6 shadow-lg shadow-red-100">
              {reorderMutation.isPending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Simpan Urutan
           </Button>
           <Link to="/dashboard/courses/$courseId/edit" params={{ courseId }}><Button variant="outline" className="rounded-2xl h-12 font-black">Edit Info</Button></Link>
        </div>
      </div>

      <Tabs defaultValue="curriculum" className="w-full">
         <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl mb-8">
            <TabsTrigger value="curriculum" className="px-8 font-black rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 dark:text-slate-400 dark:data-[state=active]:text-white data-[state=active]:shadow-sm">Materi</TabsTrigger>
            <TabsTrigger value="quiz" className="px-8 font-black rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 dark:text-slate-400 dark:data-[state=active]:text-white data-[state=active]:shadow-sm">Kuis</TabsTrigger>
         </TabsList>

         {/* MATERI TAB */}
         <TabsContent value="curriculum" className="space-y-8">
            <Reorder.Group axis="y" values={localModules} onReorder={setLocalModules} className="space-y-8">
               {localModules.map((mod: any, idx: number) => (
                  <Reorder.Item key={mod.id} value={mod}>
                     <Card className="border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900 overflow-hidden">
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center border-b dark:border-slate-800">
                           <div className="flex items-center gap-4">
                              <GripVertical className="text-slate-300 dark:text-slate-600 w-5 h-5 cursor-grab active:cursor-grabbing" />
                              <div className="bg-red-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs">{idx + 1}</div>
                              <h3 className="text-xl font-black text-slate-800 dark:text-white font-display">{mod.title}</h3>
                           </div>
                           <Button 
                              variant="ghost" 
                              size="icon" 
                              disabled={deleteModuleMutation.isPending}
                              onClick={() => {
                                 setConfirmState({
                                    isOpen: true,
                                    title: 'Hapus Bab?',
                                    description: `Apakah Anda yakin ingin menghapus bab "${mod.title}"? Semua materi dan kuis di dalamnya akan ikut terhapus secara permanen.`,
                                    onConfirm: () => {
                                       deleteModuleMutation.mutate(mod.id)
                                       closeConfirm()
                                    }
                                 })
                              }}
                              className="text-red-400 hover:text-red-600"
                           >
                              {deleteModuleMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                           </Button>
                        </div>
                        <CardContent className="p-6 space-y-4">
                           <Reorder.Group 
                              axis="y" 
                              values={mod.lessons || []} 
                              onReorder={(newLessons) => {
                                 setLocalModules(prev => prev.map(m => m.id === mod.id ? { ...m, lessons: newLessons } : m))
                              }} 
                              className="space-y-3"
                           >
                              {mod.lessons?.map((l: any) => (
                                 <Reorder.Item key={l.id} value={l}>
                                    <div className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-50 dark:border-slate-800 hover:border-red-100 dark:hover:border-red-900/50 transition-all bg-white dark:bg-slate-800 group">
                                       <div className="flex items-center gap-4 text-left">
                                          <GripVertical className="w-4 h-4 text-slate-200 dark:text-slate-700 cursor-grab active:cursor-grabbing" />
                                          <div className="font-bold text-sm text-slate-700 dark:text-slate-200">{l.title}</div>
                                          <Badge variant="outline" className="text-[10px] font-black uppercase text-slate-400 dark:border-slate-700">{l.type}</Badge>
                                       </div>
                                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Button variant="ghost" size="icon" onClick={() => setEditingLesson(l)} className="h-8 w-8"><Edit3 className="w-4 h-4 text-slate-400" /></Button>
                                          <Button 
                                             variant="ghost" 
                                             size="icon" 
                                             onClick={() => {
                                                setConfirmState({
                                                   isOpen: true,
                                                   title: 'Hapus Materi?',
                                                   description: `Hapus materi "${l.title}" secara permanen?`,
                                                   onConfirm: () => {
                                                      deleteLessonMutation.mutate(l.id)
                                                      closeConfirm()
                                                   }
                                                })
                                             }} 
                                             className="h-8 w-8 text-red-400"
                                          >
                                             <Trash2 className="w-4 h-4" />
                                          </Button>
                                       </div>
                                    </div>
                                 </Reorder.Item>
                              ))}
                           </Reorder.Group>
                           <Button 
                              variant="ghost" 
                              onClick={() => setEditingLesson({ module_id: mod.id, title: '', type: 'video', duration: '', content_url: '' })} 
                              className="w-full h-12 rounded-xl border-2 border-dashed border-slate-100 dark:border-slate-800 text-slate-400 hover:text-red-600 hover:border-red-200 dark:hover:border-red-900/30 font-black"
                           >
                              <Plus className="w-4 h-4 mr-2" /> Tambah Materi
                           </Button>
                        </CardContent>
                     </Card>
                  </Reorder.Item>
               ))}
            </Reorder.Group>
            
            <div className="flex gap-4">
               <Input 
                  placeholder="Nama Bab Baru..." 
                  value={newModuleName} 
                  onChange={e => setNewModuleName(e.target.value)} 
                  className="h-14 rounded-2xl bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 font-bold shadow-sm" 
               />
               <Button 
                  onClick={() => newModuleName && addModuleMutation.mutate(newModuleName)} 
                  disabled={addModuleMutation.isPending}
                  className="h-14 px-10 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-100 dark:shadow-none"
               >
                  {addModuleMutation.isPending ? <Loader2 className="animate-spin" /> : 'Tambah Bab'}
               </Button>
            </div>
         </TabsContent>

         {/* KUIS TAB */}
         <TabsContent value="quiz" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-5 space-y-6">
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white font-display">Daftar Kuis</h2>
                  {localModules.map((mod: any) => (
                     <Card key={mod.id} className="border-none shadow-sm rounded-[2rem] bg-white dark:bg-slate-900 overflow-hidden">
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 font-black text-xs text-slate-400 uppercase tracking-widest flex justify-between items-center border-b dark:border-slate-800">
                           <span>BAB: {mod.title}</span>
                           <Button variant="ghost" size="sm" onClick={() => setEditingQuiz({ module_id: mod.id, title: '', passing_score: 70 })} className="h-8 text-red-600 font-black text-[10px]">
                              <Plus className="w-3 h-3 mr-1" /> TAMBAH KUIS
                           </Button>
                        </div>
                        <CardContent className="p-4 space-y-3">
                           {mod.quizzes?.length > 0 ? (
                              mod.quizzes.map((quiz: any) => (
                                 <button 
                                    key={quiz.id} 
                                    onClick={() => setEditingQuiz(quiz)}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${editingQuiz?.id === quiz.id ? 'border-red-600 bg-red-50 dark:bg-red-900/20' : 'border-slate-50 dark:border-slate-800 hover:border-red-100 dark:hover:border-red-900/30 bg-white dark:bg-slate-800'}`}
                                 >
                                    <div className="flex flex-col">
                                       <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{quiz.title}</span>
                                       <span className="text-[10px] font-black text-slate-400 uppercase">{quiz.questions?.length || 0} Pertanyaan</span>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 ${editingQuiz?.id === quiz.id ? 'text-red-600' : 'text-slate-300'}`} />
                                 </button>
                              ))
                           ) : (
                              <div className="text-center py-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 font-bold text-xs">
                                 Belum ada kuis di bab ini
                              </div>
                           )}
                        </CardContent>
                     </Card>
                  ))}
               </div>

               <div className="lg:col-span-7">
                  {editingQuiz ? (
                     <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-8 sticky top-8 text-left">
                        <div className="flex justify-between items-center text-left">
                           <h3 className="text-2xl font-black text-slate-800 dark:text-white font-display">{editingQuiz.id ? 'Kelola Kuis' : 'Buat Kuis Baru'}</h3>
                           {editingQuiz.id && (
                              <Button 
                                 variant="ghost" 
                                 size="sm" 
                                 disabled={deleteQuizMutation.isPending}
                                 onClick={() => {
                                    setConfirmState({
                                       isOpen: true,
                                       title: 'Hapus Kuis?',
                                       description: `Apakah Anda yakin ingin menghapus kuis "${editingQuiz.title}"?`,
                                       onConfirm: () => {
                                          deleteQuizMutation.mutate(editingQuiz.id)
                                          closeConfirm()
                                       }
                                    })
                                 }}
                                 className="text-red-400 hover:text-red-600 font-bold"
                              >
                                 {deleteQuizMutation.isPending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />} 
                                 Hapus Kuis
                              </Button>
                           )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                           <div className="md:col-span-2 space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Judul Kuis</label>
                              <Input value={editingQuiz.title} onChange={e => setEditingQuiz({...editingQuiz, title: e.target.value})} placeholder="Judul" className="h-14 rounded-2xl font-bold bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Passing Grade (%)</label>
                              <Input type="number" value={editingQuiz.passing_score} onChange={e => setEditingQuiz({...editingQuiz, passing_score: parseInt(e.target.value)})} className="h-14 rounded-2xl font-bold bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white" />
                           </div>
                        </div>
                        <Button className="w-full h-14 bg-red-600 text-white rounded-2xl font-black text-lg" onClick={() => quizMutation.mutate(editingQuiz)} disabled={quizMutation.isPending}>
                           {quizMutation.isPending ? <Loader2 className="animate-spin" /> : 'Simpan Kuis'}
                        </Button>

                        {editingQuiz.id && (
                          <div className="pt-8 border-t border-slate-50 dark:border-slate-800 space-y-6 text-left">
                            <div className="flex items-center justify-between text-left">
                              <h4 className="font-black text-lg text-slate-800 dark:text-white font-display">Daftar Pertanyaan</h4>
                              <Button onClick={() => setEditingQuestion({ quiz_id: editingQuiz.id, question_text: '', options: [{option_text: '', is_correct: true}, {option_text: '', is_correct: false}] })} className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold h-10 px-4">
                                 <Plus className="w-4 h-4 mr-2" /> Tambah Soal
                              </Button>
                            </div>
                            <div className="space-y-3">
                              {editingQuiz.questions?.map((q: any, i: number) => (
                                 <div key={q.id} className="group p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md border border-transparent hover:border-slate-100 dark:hover:border-slate-700 rounded-2xl transition-all flex items-center justify-between">
                                   <div className="flex gap-4 items-center">
                                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center font-black text-xs text-slate-400">{i+1}</div>
                                      <div className="font-bold text-sm text-slate-700 dark:text-slate-200">{q.question_text}</div>
                                   </div>
                                   <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                                      <Button variant="ghost" size="icon" onClick={() => setEditingQuestion(q)}><Edit3 className="w-4 h-4 text-slate-400" /></Button>
                                      <Button 
                                         variant="ghost" 
                                         size="icon" 
                                         disabled={deleteQuestionMutation.isPending}
                                         onClick={() => {
                                            setConfirmState({
                                               isOpen: true,
                                               title: 'Hapus Pertanyaan?',
                                               description: 'Apakah Anda yakin ingin menghapus pertanyaan ini?',
                                               onConfirm: () => {
                                                  deleteQuestionMutation.mutate(q.id)
                                                  closeConfirm()
                                               }
                                            })
                                         }}
                                         className="text-red-400 hover:text-red-600"
                                      >
                                         <Trash2 className="w-4 h-4" />
                                      </Button>
                                   </div>
                                 </div>
                              ))}
                            </div>
                          </div>
                        )}
                     </div>
                  ) : (
                     <div className="h-full min-h-[500px] border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center text-slate-300 dark:text-slate-700">
                        <FileText className="w-16 h-16 mb-4" />
                        <h3 className="text-xl font-black text-slate-800 dark:text-white font-display">Quiz Designer</h3>
                        <p className="font-medium max-w-xs">Pilih kuis dari daftar di samping untuk mulai menyusun pertanyaan.</p>
                     </div>
                  )}
               </div>
            </div>
         </TabsContent>
      </Tabs>

      {/* MODALS */}
      <AnimatePresence>
        {editingLesson && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 w-full max-w-xl shadow-2xl overflow-y-auto max-h-[90vh]">
               <h3 className="text-2xl font-black mb-6 text-slate-800 dark:text-white font-display">{editingLesson.id ? 'Edit Materi' : 'Tambah Materi'}</h3>
               <form onSubmit={(e) => { e.preventDefault(); lessonMutation.mutate(editingLesson) }} className="space-y-6">
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Judul Materi</label>
                    <Input required value={editingLesson.title} onChange={e => setEditingLesson({...editingLesson, title: e.target.value})} placeholder="Contoh: Perkenalan Dasar UI/UX" className="h-14 rounded-2xl font-bold bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-left">
                     <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tipe Materi</label>
                        <select value={editingLesson.type} onChange={e => setEditingLesson({...editingLesson, type: e.target.value})} className="w-full h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 px-4 font-bold outline-none focus:border-red-600 transition-colors text-slate-900 dark:text-white">
                           <option value="video">Video (YouTube/Upload)</option>
                           <option value="pdf">Dokumen (PDF)</option>
                           <option value="link">Link Eksternal</option>
                        </select>
                     </div>
                     <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Durasi</label>
                        <Input value={editingLesson.duration} onChange={e => setEditingLesson({...editingLesson, duration: e.target.value})} placeholder="e.g. 10:45" className="h-14 rounded-2xl font-bold bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white" />
                     </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">URL Konten / Video Link</label>
                    <Input 
                      required 
                      value={editingLesson.content_url} 
                      onChange={e => setEditingLesson({...editingLesson, content_url: e.target.value})} 
                      placeholder={editingLesson.type === 'video' ? "Masukkan Link YouTube / Vimeo" : "Masukkan URL Link"} 
                      className="h-14 rounded-2xl font-bold text-left bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white" 
                    />
                    {editingLesson.type === 'video' && (
                      <p className="text-[10px] text-slate-400 font-medium ml-2 italic">*Jika menggunakan YouTube, pastikan link valid.</p>
                    )}
                  </div>

                  {(editingLesson.type === 'pdf' || editingLesson.type === 'video') && (
                    <div className="space-y-2 text-left">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Atau Upload File Langsung</div>
                      <label className="cursor-pointer block group text-left">
                        <div className="flex flex-col items-center justify-center h-32 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800 group-hover:border-red-600 transition-all bg-slate-50 dark:bg-slate-800 group-hover:bg-red-50/30">
                            {isUploading ? (
                              <Loader2 className="animate-spin w-8 h-8 text-red-600" />
                            ) : (
                              <>
                                <Upload className="w-8 h-8 text-slate-300 group-hover:text-red-600 transition-colors mb-2" />
                                <span className="text-xs font-black text-slate-400 group-hover:text-red-600 uppercase tracking-widest">
                                  Klik untuk Upload {editingLesson.type === 'video' ? 'Video' : 'PDF'}
                                </span>
                              </>
                            )}
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept={editingLesson.type === 'video' ? 'video/*' : 'application/pdf'} 
                          onChange={handleFileUpload} 
                          disabled={isUploading} 
                        />
                      </label>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 pt-4 text-left">
                    <Button type="submit" className="w-full h-14 bg-red-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-red-100 dark:shadow-none transition-all active:scale-95" disabled={lessonMutation.isPending}>
                       {lessonMutation.isPending ? <Loader2 className="animate-spin" /> : 'Simpan Materi'}
                    </Button>
                    <Button type="button" variant="ghost" className="w-full h-14 rounded-2xl font-bold text-slate-400" onClick={() => setEditingLesson(null)}>Batal</Button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}

        {editingQuestion && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
               <h3 className="text-2xl font-black mb-6 text-slate-800 dark:text-white font-display text-left">Edit Pertanyaan</h3>
               <div className="space-y-6 text-left">
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Tipe Soal</label>
                    <div className="grid grid-cols-2 gap-4">
                       <button 
                         onClick={() => setEditingQuestion({...editingQuestion, type: 'pilihan_ganda'})}
                         className={`h-14 rounded-2xl border-2 font-black transition-all ${(!editingQuestion.type || editingQuestion.type === 'pilihan_ganda') ? 'border-red-600 bg-red-50 dark:bg-red-900/20 text-red-600' : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-red-100 dark:hover:border-red-900/30 dark:text-slate-500'}`}
                       >
                          Pilihan Ganda
                       </button>
                       <button 
                         onClick={() => setEditingQuestion({...editingQuestion, type: 'uraian'})}
                         className={`h-14 rounded-2xl border-2 font-black transition-all ${editingQuestion.type === 'uraian' ? 'border-red-600 bg-red-50 dark:bg-red-900/20 text-red-600' : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-red-100 dark:hover:border-red-900/30 dark:text-slate-500'}`}
                       >
                          Uraian (Essay)
                       </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Pertanyaan</label>
                    <textarea value={editingQuestion.question_text} onChange={e => setEditingQuestion({...editingQuestion, question_text: e.target.value})} placeholder="Ketik pertanyaan..." className="w-full h-32 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 p-4 font-bold outline-none focus:border-red-600 text-slate-900 dark:text-white" />
                  </div>

                  {(!editingQuestion.type || editingQuestion.type === 'pilihan_ganda') ? (
                    <div className="space-y-4 text-left">
                      <div className="flex items-center justify-between text-left">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Pilihan Jawaban</label>
                        <Button variant="ghost" size="sm" className="font-bold text-red-600" onClick={() => setEditingQuestion({...editingQuestion, options: [...(editingQuestion.options || []), {option_text: '', is_correct: false}]})}>+ Opsi</Button>
                      </div>
                      {editingQuestion.options?.map((opt: any, idx: number) => (
                        <div key={idx} className="flex gap-3 items-center text-left">
                          <button 
                            onClick={() => setEditingQuestion({...editingQuestion, options: editingQuestion.options.map((o: any, i: number) => ({...o, is_correct: i === idx}))})}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${opt.is_correct ? 'bg-red-600 border-red-600 text-white' : 'border-slate-200 dark:border-slate-700'}`}
                          >
                            {opt.is_correct && <div className="w-2 h-2 bg-white rounded-full" />}
                          </button>
                          <Input 
                            value={opt.option_text} 
                            onChange={e => setEditingQuestion({...editingQuestion, options: editingQuestion.options.map((o: any, i: number) => i === idx ? {...o, option_text: e.target.value} : o)})}
                            placeholder={`Pilihan ${idx + 1}`} 
                            className="h-12 rounded-xl font-bold bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white" 
                          />
                          <Button variant="ghost" size="icon" onClick={() => setEditingQuestion({...editingQuestion, options: editingQuestion.options.filter((_: any, i: number) => i !== idx)})} className="h-10 w-10 text-red-400"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-left">
                       <p className="text-slate-400 dark:text-slate-500 text-sm font-bold text-center">Tipe soal Uraian tidak memerlukan pilihan jawaban. Siswa akan diberikan kotak teks besar untuk menjawab.</p>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4 text-left">
                    <Button className="flex-1 h-14 bg-red-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-red-100 dark:shadow-none" onClick={() => questionMutation.mutate(editingQuestion)} disabled={questionMutation.isPending}>Simpan Pertanyaan</Button>
                    <Button variant="ghost" className="h-14 px-8 font-bold text-slate-400" onClick={() => setEditingQuestion(null)}>Batal</Button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        description={confirmState.description}
        isLoading={confirmState.isLoading}
      />
    </div>
  )
}
