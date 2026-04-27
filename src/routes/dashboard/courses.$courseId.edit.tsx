// @ts-nocheck
import * as React from 'react'
import { createFileRoute, Link, useNavigate, useParams, useRouteContext, redirect } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, Loader2, Image as ImageIcon, Upload } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from '@/lib/toast-store'

export const Route = createFileRoute('/dashboard/courses/$courseId/edit')({
  beforeLoad: async ({ context, params }) => {
    const user = context.auth.user
    if (!user) throw redirect({ to: '/login', search: { redirect: `/dashboard/courses/${params.courseId}/edit` } })
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'guru') throw redirect({ to: '/dashboard', search: {} })
    const { data: course } = await supabase.from('courses').select('instructor_id').eq('id', params.courseId).single()
    if (course?.instructor_id !== user.id) throw redirect({ to: '/dashboard/courses', search: {} })
  },
  component: EditCoursePage,
})

function EditCoursePage() {
  const { courseId } = useParams({ from: '/dashboard/courses/$courseId/edit' })
  const { auth } = useRouteContext({ from: '/dashboard/courses/$courseId/edit' })
  const user = auth.user!
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isUploading, setIsUploading] = React.useState(false)

  const [formData, setFormData] = React.useState({
    title: '',
    category: 'Web Development',
    price_monthly: '',
    description: '',
    image_url: '',
    status: 'draft'
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

  useQuery({
    queryKey: ['course-edit', courseId],
    queryFn: async () => {
      const { data, error } = await supabase.from('courses').select('*').eq('id', courseId).single()
      if (error) throw error
      setFormData({
        title: data.title,
        category: data.category,
        price_monthly: data.price_monthly,
        description: data.description || '',
        image_url: data.image_url || '',
        status: data.status || 'draft'
      })
      return data
    }
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setIsUploading(true)
      const fileName = `${user.id}/${Math.random()}.${file.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage.from('courses').upload(fileName, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('courses').getPublicUrl(fileName)
      setFormData(prev => ({ ...prev, image_url: publicUrl }))
      toast.success('Gambar berhasil diunggah!')
    } catch (error: any) {
      toast.error('Gagal: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const updateMutation = useMutation({
    mutationFn: async (updatedData: typeof formData) => {
      const { data, error } = await supabase.from('courses').update(updatedData).eq('id', courseId).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-edit', courseId] })
      toast.success('Info kursus berhasil diperbarui!')
    },
    onError: (err: any) => toast.error('Gagal update: ' + err.message)
  })

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 text-left">
      <div className="flex items-center justify-between text-left">
        <div className="space-y-1 text-left">
          <Link to="/dashboard/courses/$courseId/manage" params={{ courseId }} className="flex items-center gap-2 text-red-600 font-bold text-sm hover:underline mb-4 text-left">
            <ChevronLeft className="w-4 h-4" /> Kembali ke Manajemen Materi
          </Link>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight text-left">Edit Info Kursus ✏️</h1>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(formData) }} className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        <div className="md:col-span-2 space-y-6 text-left">
          <Card className="border-none shadow-sm rounded-[2.5rem] p-8 md:p-10 bg-white dark:bg-slate-900 text-left">
            <div className="space-y-6 text-left">
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left">Judul Kursus</label>
                <Input required value={formData.title} onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))} className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 dark:bg-slate-800 font-bold text-lg text-left" />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left">Deskripsi</label>
                <textarea required value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={8} className="w-full p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-red-600 transition-colors font-medium text-sm text-left" />
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
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Status Visibilitas</label>
                </div>
                <select 
                   value={formData.status} 
                   onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
                   className="w-full h-12 rounded-xl border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-white px-3 font-bold text-sm outline-none focus:border-red-600 text-left"
                >
                   <option value="draft">Draft (Privat)</option>
                   <option value="published">Published (Publik)</option>
                </select>
              </div>

              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2 mb-2 text-left">
                  <ImageIcon className="w-3.5 h-3.5 text-red-600" />
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Cover</label>
                </div>
                {formData.image_url && <img src={formData.image_url} className="aspect-video w-full rounded-xl object-cover mb-4 border text-left" alt="Preview" />}
                <label className="cursor-pointer text-left">
                  <div className="flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-dashed text-xs font-bold text-slate-500 text-left">
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Ganti Cover
                  </div>
                  <input type="file" className="hidden text-left" accept="image/*" onChange={handleFileUpload} />
                </label>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left">Harga</label>
                <Input required value={formData.price_monthly} onChange={handlePriceChange} className="h-12 rounded-xl font-bold text-left" />
              </div>

              <div className="flex flex-col gap-3 pt-2 text-left">
                <Button type="submit" disabled={updateMutation.isPending || isUploading} className="w-full h-14 bg-red-600 text-white rounded-2xl font-black text-lg text-left shadow-lg shadow-red-100 dark:shadow-none">
                  {updateMutation.isPending ? <Loader2 className="animate-spin" /> : 'Simpan Perubahan'}
                </Button>
                <Link to="/dashboard/courses/$courseId/manage" params={{ courseId }}>
                  <Button type="button" variant="outline" className="w-full h-12 rounded-2xl font-black text-xs uppercase tracking-widest text-left">
                    Kelola Materi Bab & Kuis
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </form>
    </div>
  )
}
