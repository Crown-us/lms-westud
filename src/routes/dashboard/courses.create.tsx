import * as React from 'react'
import { createFileRoute, Link, useNavigate, useRouteContext, redirect } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, Loader2, Sparkles, Image as ImageIcon, Tag, DollarSign, Upload } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from '@/lib/toast-store'

export const Route = createFileRoute('/dashboard/courses/create')({
  beforeLoad: async ({ context }) => {
    const user = context.auth.user
    if (!user) throw redirect({ to: '/login', search: { redirect: '/dashboard/courses/create' } })
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (data?.role !== 'guru') throw redirect({ to: '/dashboard', search: {} })
  },
  component: CreateCoursePage,
})

function CreateCoursePage() {
  const { auth } = useRouteContext({ from: '/dashboard/courses/create' })
  const user = auth.user!
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isUploading, setIsUploading] = React.useState(false)

  const [formData, setFormData] = React.useState({
    title: '',
    category: 'Web Development',
    price_monthly: '',
    description: '',
    image_url: ''
  })

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '')
    if (e.target.value.toLowerCase() === 'gratis') {
      setFormData(prev => ({ ...prev, price_monthly: 'Gratis' }))
      return
    }
    if (value) {
      const formatted = new Intl.NumberFormat('id-ID').format(parseInt(value))
      setFormData(prev => ({ ...prev, price_monthly: `Rp ${formatted}` }))
    } else {
      setFormData(prev => ({ ...prev, price_monthly: '' }))
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setIsUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`
      const { error: uploadError } = await supabase.storage.from('courses').upload(filePath, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('courses').getPublicUrl(filePath)
      setFormData(prev => ({ ...prev, image_url: publicUrl }))
      toast.success('Gambar berhasil diunggah!')
    } catch (error: any) {
      toast.error('Gagal unggah: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const createMutation = useMutation({
    mutationFn: async (newData: typeof formData) => {
      const { data, error } = await supabase
        .from('courses')
        .insert({
          ...newData,
          instructor_id: user.id,
          status: 'published',
          rating: 0,
          total_students: 0
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-courses'] })
      toast.success('Kursus berhasil dibuat!')
      navigate({ to: '/dashboard/courses/$courseId/manage', params: { courseId: data.id.toString() } })
    },
    onError: (error: any) => {
      toast.error('Gagal: ' + error.message)
    }
  })

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 text-left">
      <div className="flex items-center justify-between text-left text-left">
        <div className="space-y-1 text-left text-left text-left">
          <Link to="/dashboard/courses" className="flex items-center gap-2 text-red-600 font-bold text-sm hover:underline mb-4 text-left">
            <ChevronLeft className="w-4 h-4" /> Kembali
          </Link>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight text-left">Buat Kursus Baru 🎓</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-left">Isi detail di bawah untuk mulai membagikan ilmu Anda.</p>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData) }} className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        <div className="md:col-span-2 space-y-6 text-left">
          <Card className="border-none shadow-sm rounded-[2.5rem] p-8 md:p-10 bg-white dark:bg-slate-900 text-left">
            <div className="space-y-6 text-left">
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left">Judul Kursus</label>
                <Input 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Contoh: Mastering Next.js 15" 
                  className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus-visible:ring-red-600 font-bold text-lg text-left"
                />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left text-left">Deskripsi Singkat</label>
                <textarea 
                  required
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={5}
                  placeholder="Jelaskan apa yang akan dipelajari siswa..."
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-red-600 transition-colors font-medium text-sm text-left"
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6 text-left">
          <Card className="border-none shadow-sm rounded-[2.5rem] p-8 bg-white dark:bg-slate-900 text-left">
            <div className="space-y-6 text-left">
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2 mb-2 text-left">
                  <ImageIcon className="w-3.5 h-3.5 text-red-600" />
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Cover Kursus</label>
                </div>
                {formData.image_url && (
                  <div className="aspect-video w-full rounded-xl overflow-hidden mb-4 border-2 border-slate-100 dark:border-slate-800 text-left">
                    <img src={formData.image_url} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                )}
                <label className="cursor-pointer text-left">
                  <div className="flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-red-600 transition-colors text-xs font-bold text-slate-500 text-left">
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {isUploading ? 'Mengunggah...' : 'Upload dari Lokal'}
                  </div>
                  <input type="file" className="hidden text-left" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                </label>
              </div>
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2 mb-1 text-left text-left">
                  <Tag className="w-3.5 h-3.5 text-red-600" />
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left text-left text-left">Kategori</label>
                </div>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full h-12 rounded-xl border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-white px-3 font-bold text-sm outline-none focus:border-red-600 text-left"
                >
                  <option>Web Development</option>
                  <option>UI/UX Design</option>
                  <option>Data Science</option>
                  <option>Marketing</option>
                  <option>IT Security</option>
                </select>
              </div>
              <div className="space-y-2 text-left text-left">
                <div className="flex items-center gap-2 mb-1 text-left">
                  <DollarSign className="w-3.5 h-3.5 text-red-600" />
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left text-left">Harga</label>
                </div>
                <Input required value={formData.price_monthly} onChange={handlePriceChange} placeholder="150000 atau Gratis" className="h-12 rounded-xl font-bold text-left" />
              </div>
              <Button type="submit" disabled={createMutation.isPending || isUploading} className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-red-100 dark:shadow-none transition-all active:scale-95 text-left">
                {createMutation.isPending ? <Loader2 className="animate-spin" /> : <><Sparkles className="w-5 h-5 mr-2" /> Terbitkan</>}
              </Button>
            </div>
          </Card>
        </div>
      </form>
    </div>
  )
}
