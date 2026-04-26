import { motion, AnimatePresence } from 'framer-motion'
import { useToastStore } from '@/lib/toast-store'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Toaster() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed bottom-0 right-0 z-[1000] p-6 w-full max-w-md pointer-events-none flex flex-col gap-3">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={cn(
              "pointer-events-auto relative group flex items-start gap-4 p-5 rounded-[2rem] border shadow-2xl backdrop-blur-xl bg-white/90 dark:bg-slate-900/90",
              toast.type === 'success' && "border-green-100 dark:border-green-900/30",
              toast.type === 'error' && "border-red-100 dark:border-red-900/30",
              toast.type === 'warning' && "border-amber-100 dark:border-amber-900/30",
              toast.type === 'info' && "border-blue-100 dark:border-blue-900/30"
            )}
          >
            <div className={cn(
              "p-2 rounded-xl",
              toast.type === 'success' && "bg-green-100 dark:bg-green-950/30 text-green-600",
              toast.type === 'error' && "bg-red-100 dark:bg-red-950/30 text-red-600",
              toast.type === 'warning' && "bg-amber-100 dark:bg-amber-950/30 text-amber-600",
              toast.type === 'info' && "bg-blue-100 dark:bg-blue-950/30 text-blue-600"
            )}>
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
              {toast.type === 'info' && <Info className="w-5 h-5" />}
            </div>

            <div className="flex-1 pt-0.5">
              <p className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                {toast.type === 'success' ? 'Sukses!' : 
                 toast.type === 'error' ? 'Error!' : 
                 toast.type === 'warning' ? 'Peringatan' : 'Info'}
              </p>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
