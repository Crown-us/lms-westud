// @ts-nocheck
import { createFileRoute, redirect, useRouteContext } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Search, 
  Send, 
  MoreVertical, 
  MessageSquare,
  Loader2,
  Paperclip
} from 'lucide-react'
import * as React from 'react'
import { supabase } from '@/lib/supabase'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/lib/toast-store'
import { profileQueries, dashboardQueries } from '@/lib/queries'
import { motion, AnimatePresence } from 'framer-motion'

export const Route = createFileRoute('/dashboard/messages')({
  beforeLoad: async ({ context }) => {
    const user = context.auth.user
    if (!user) throw redirect({ to: '/login', search: { redirect: '/dashboard/messages' } })
  },
  component: ChatAndDiscussionPage,
})

function ChatAndDiscussionPage() {
  const { auth } = useRouteContext({ from: '/dashboard' } as any)
  const user = auth.user!
  const queryClient = useQueryClient()
  
  const [selectedChatId, setSelectedChatId] = React.useState<string | null>(null)
  const [reply, setReply] = React.useState('')
  const [searchTerm, setSearchQuery] = React.useState('')

  const { data: profile } = useQuery(profileQueries.detail(user.id))
  const isTeacher = profile?.role === 'guru'

  // Fetch discussions based on role
  const { data: discussions = [], refetch } = useQuery(
    isTeacher 
    ? dashboardQueries.instructorDiscussions(user.id)
    : dashboardQueries.studentDiscussions(user.id)
  )

  // Real-time listener
  React.useEffect(() => {
    const channel = supabase
      .channel('global-discussions')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'discussions' }, () => {
        refetch()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [refetch])

  // Group by student & lesson for sidebar
  const chatList = React.useMemo(() => {
    const groups: Record<string, any> = {}
    discussions.forEach(d => {
      // For teacher: group by student (user_id) + lesson
      // For student: group by lesson (they chat with teacher/others in that lesson)
      const key = isTeacher ? `${d.user_id}-${d.lesson_id}` : `lesson-${d.lesson_id}`
      
      if (!groups[key]) {
        groups[key] = {
          id: key,
          user: isTeacher ? d.user : { name: d.lesson?.module?.course?.title || 'Diskusi Kursus', avatar_url: null },
          lesson: d.lesson,
          lastMsg: d.content,
          time: new Date(d.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          rawDate: d.created_at,
          messages: []
        }
      }
      groups[key].messages.push(d)
    })
    return Object.values(groups).sort((a: any, b: any) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime())
  }, [discussions, isTeacher])

  const selectedChat = chatList.find((c: any) => c.id === selectedChatId) || chatList[0]

  const postReplyMutation = useMutation({
    mutationFn: async ({ content, lessonId }: { content: string, lessonId: number }) => {
      const { error } = await supabase.from('discussions').insert({
        lesson_id: lessonId,
        user_id: user.id,
        content
      })
      if (error) throw error
    },
    onSuccess: () => {
      setReply('')
      refetch()
      toast.success('Pesan terkirim!')
    },
    onError: (err: any) => toast.error('Gagal kirim: ' + err.message)
  })

  return (
    <div className="h-[calc(100vh-160px)] flex gap-6 text-left">
      {/* Sidebar Chat */}
      <Card className="w-80 md:w-96 flex flex-col border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900 overflow-hidden text-left">
        <div className="p-6 border-b dark:border-slate-800 space-y-4 text-left">
           <div className="flex items-center justify-between text-left">
              <h2 className="text-xl font-black dark:text-white font-display text-left">Diskusi</h2>
              <Badge className="bg-red-50 dark:bg-red-900/20 text-red-600 border-none font-black">{chatList.length}</Badge>
           </div>
           <div className="relative text-left">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                value={searchTerm}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari percakapan..." 
                className="pl-12 h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold dark:text-white" 
              />
           </div>
        </div>
        
        <ScrollArea className="flex-1 text-left">
           <div className="p-3 space-y-2 text-left">
              {chatList.length > 0 ? chatList.map((chat: any) => {
                const isActive = (selectedChatId || chatList[0].id) === chat.id
                return (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChatId(chat.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-[2rem] transition-all text-left ${
                      isActive 
                      ? 'bg-red-600 text-white shadow-xl shadow-red-100 dark:shadow-none' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                     <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                        {chat.user?.avatar_url ? (
                          <img src={chat.user.avatar_url} className="w-full h-full object-cover" alt="avatar" />
                        ) : (
                          <MessageSquare className={`w-6 h-6 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                        )}
                     </div>
                     <div className="flex-1 min-w-0 text-left">
                        <div className="flex justify-between items-start mb-0.5 text-left">
                           <span className="font-black text-sm truncate text-left">{chat.user?.name}</span>
                           <span className={`text-[9px] font-black text-left uppercase ${isActive ? 'text-red-100' : 'text-slate-400'}`}>{chat.time}</span>
                        </div>
                        <p className={`text-[10px] font-black truncate uppercase tracking-tighter mb-1 ${isActive ? 'text-red-200' : 'text-red-600'}`}>{chat.lesson?.title}</p>
                        <p className={`text-xs truncate font-medium text-left ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>{chat.lastMsg}</p>
                     </div>
                  </button>
                )
              }) : (
                <div className="p-12 text-center text-slate-300 dark:text-slate-700 font-black text-[10px] uppercase tracking-[0.2em]">Belum ada diskusi</div>
              )}
           </div>
        </ScrollArea>
      </Card>

      {/* Chat Window */}
      <Card className="flex-1 flex flex-col border-none shadow-sm rounded-[3rem] bg-white dark:bg-slate-900 overflow-hidden text-left">
        {selectedChat ? (
          <>
            <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/30 text-left">
               <div className="flex items-center gap-4 text-left">
                  <div className="w-11 h-11 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-100 dark:shadow-none font-black text-xl font-display">
                     {selectedChat.user?.name?.charAt(0)}
                  </div>
                  <div className="text-left">
                     <h3 className="font-black dark:text-white text-left font-display">{selectedChat.user?.name}</h3>
                     <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                        PADA: <span className="text-red-600">{selectedChat.lesson?.title}</span>
                     </div>
                  </div>
               </div>
               <Button variant="ghost" size="icon" className="rounded-full"><MoreVertical className="w-5 h-5 text-slate-400" /></Button>
            </div>

            <ScrollArea className="flex-1 p-8 text-left">
               <div className="space-y-8 text-left max-w-4xl mx-auto">
                  {[...selectedChat.messages].reverse().map((msg: any) => {
                    const isMe = msg.user_id === user.id
                    return (
                      <div key={msg.id} className={`flex items-start gap-4 max-w-[80%] text-left ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                         <div className={`w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-1 overflow-hidden`}>
                            {msg.user?.avatar_url ? <img src={msg.user.avatar_url} className="w-full h-full object-cover" /> : <span className="text-[10px] font-black">{msg.user?.name?.charAt(0)}</span>}
                         </div>
                         <div className={`space-y-2 text-left ${isMe ? 'text-right' : ''}`}>
                            <div className={`p-5 rounded-[2rem] text-sm font-bold leading-relaxed text-left shadow-sm ${
                              isMe 
                              ? 'bg-red-600 text-white rounded-tr-none' 
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border dark:border-slate-700'
                            }`}>
                               {msg.content}
                            </div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">
                               {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                         </div>
                      </div>
                    )
                  })}
               </div>
            </ScrollArea>

            <div className="p-8 bg-slate-50/50 dark:bg-slate-800/50 border-t dark:border-slate-800 text-left">
               <form 
                  onSubmit={(e) => { e.preventDefault(); reply && postReplyMutation.mutate({ content: reply, lessonId: selectedChat.lesson.id }) }}
                  className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-[2.5rem] shadow-xl border dark:border-slate-800 max-w-4xl mx-auto text-left"
               >
                  <Button type="button" variant="ghost" size="icon" className="rounded-full text-slate-400 shrink-0 ml-2"><Paperclip className="w-5 h-5" /></Button>
                  <input 
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    placeholder="Tulis pesan..." 
                    className="flex-1 bg-transparent border-none focus:ring-0 outline-none px-4 font-bold text-sm text-slate-900 dark:text-white" 
                  />
                  <Button 
                    type="submit"
                    disabled={!reply || postReplyMutation.isPending}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-full w-14 h-14 p-0 shadow-xl shadow-red-200 dark:shadow-none shrink-0 transition-all active:scale-90"
                  >
                     {postReplyMutation.isPending ? <Loader2 className="animate-spin w-6 h-6" /> : <Send className="w-6 h-6" />}
                  </Button>
               </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 opacity-20 text-left">
             <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-[3rem] flex items-center justify-center">
                <MessageSquare className="w-16 h-16 text-slate-400" />
             </div>
             <p className="font-black uppercase tracking-[0.3em] text-[10px]">Pilih percakapan untuk memulai</p>
          </div>
        )}
      </Card>
    </div>
  )
}
