// @ts-nocheck
import * as React from 'react'
import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  ChevronRight, 
  Camera,
  CreditCard,
  Languages,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from '@/lib/toast-store'

export const Route = createFileRoute('/dashboard/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const { auth } = useRouteContext({ from: '/dashboard' } as any)
  const user = auth.user
  const queryClient = useQueryClient()
  const [isUploading, setIsUploading] = React.useState(false)

  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    bio: '',
    avatar_url: ''
  })

  // 1. Fetch real profile data
  const { isLoading: isFetching } = useQuery({
    queryKey: ['profile-settings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user?.id).single()
      if (error) throw error
      setFormData({
        name: data.name || '',
        email: data.email || '',
        bio: data.bio || '',
        avatar_url: data.avatar_url || ''
      })
      return data
    },
    enabled: !!user?.id
  })

  // 2. Avatar Upload Logic
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB')
      return
    }

    try {
      setIsUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}/${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload to 'courses' bucket (ensure this bucket is public in Supabase)
      const { error: uploadError } = await supabase.storage
        .from('courses')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('courses')
        .getPublicUrl(filePath)

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }))
      toast.success('Foto profil berhasil diunggah! Klik Simpan untuk menerapkan.')
    } catch (error: any) {
      toast.error('Gagal unggah foto: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  // 3. Update Profile Mutation
  const updateMutation = useMutation({
    mutationFn: async (updatedData: typeof formData) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updatedData.name,
          bio: updatedData.bio,
          avatar_url: updatedData.avatar_url
        })
        .eq('id', user?.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-settings', user?.id] })
      // Also invalidate global profile query if exists
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Profil berhasil diperbarui!')
    },
    onError: (err: any) => {
      toast.error('Gagal simpan profil: ' + err.message)
    }
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  if (isFetching) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10 text-left">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Pengaturan Akun</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Kelola informasi profil dan identitas mengajar Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
           {[
             { label: 'Profil Saya', icon: User, active: true },
             { label: 'Keamanan', icon: Lock, active: false },
             { label: 'Notifikasi', icon: Bell, active: false },
           ].map((item) => (
              <button 
                key={item.label}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${
                  item.active 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-100 dark:shadow-none' 
                  : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                 <item.icon className="w-5 h-5" />
                 {item.label}
              </button>
           ))}
        </div>

        <div className="md:col-span-2 space-y-8 text-left">
           <Card className="rounded-[2.5rem] border-none shadow-sm dark:shadow-none bg-white dark:bg-slate-900 p-8 md:p-10">
              <h3 className="text-xl font-black text-slate-800 dark:text-white mb-8">Informasi Profil</h3>
              
              <form onSubmit={handleSave} className="space-y-8">
                 <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative group cursor-pointer">
                       <img 
                         src={formData.avatar_url || `https://i.pravatar.cc/150?u=${user?.email}`} 
                         className="w-24 h-24 rounded-[2.5rem] object-cover ring-4 ring-red-50 dark:ring-red-900/30 group-hover:opacity-80 transition-all border-4 border-white dark:border-slate-900" 
                         alt="avatar" 
                       />
                       <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <Camera className="w-8 h-8 text-white drop-shadow-md" />
                          <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploading} />
                       </label>
                    </div>
                    <div className="text-center sm:text-left space-y-1">
                       <div className="font-black text-slate-800 dark:text-white">Foto Profil Anda</div>
                       <p className="text-xs text-slate-400 font-medium">Klik foto untuk mengganti. PNG atau JPG.</p>
                       {isUploading && <div className="flex items-center gap-2 text-red-600 font-bold text-[10px] uppercase tracking-widest mt-1"><Loader2 className="w-3 h-3 animate-spin" /> Mengunggah...</div>}
                    </div>
                 </div>

                 <Separator className="dark:bg-slate-800" />

                 <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                       <Input 
                         value={formData.name}
                         onChange={e => setFormData({...formData, name: e.target.value})}
                         className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 dark:bg-slate-800 font-bold" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                       <Input 
                         disabled
                         value={formData.email}
                         className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none font-bold opacity-70" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Biografi Singkat (Tampil di profil pengajar)</label>
                       <textarea 
                         value={formData.bio}
                         onChange={e => setFormData({...formData, bio: e.target.value})}
                         className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-red-600 outline-none min-h-[120px] dark:text-white"
                         placeholder="Ceritakan pengalaman mengajar Anda..."
                       />
                    </div>
                 </div>

                 <div className="flex justify-end pt-4">
                    <Button 
                      type="submit"
                      disabled={updateMutation.isPending || isUploading}
                      className="bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black px-10 h-14 shadow-xl shadow-red-100 dark:shadow-none transition-all active:scale-95"
                    >
                       {updateMutation.isPending ? <Loader2 className="animate-spin" /> : 'Simpan Perubahan'}
                    </Button>
                 </div>
              </form>
           </Card>

           <Card className="rounded-[2.5rem] border-none shadow-sm dark:shadow-none bg-white dark:bg-slate-900 p-8 md:p-10 text-left">
              <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6">Status Pengajar</h3>
              <div className="p-6 rounded-[2rem] bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="bg-red-600 text-white p-3 rounded-2xl">
                       <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                       <div className="font-black text-red-600 dark:text-red-400 text-sm uppercase">Akun Terverifikasi</div>
                       <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Anda memiliki akses penuh untuk menerbitkan kursus.</p>
                    </div>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  )
}
