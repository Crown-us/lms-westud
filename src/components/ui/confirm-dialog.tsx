import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  variant?: 'danger' | 'warning' | 'info'
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Hapus',
  cancelText = 'Batal',
  isLoading = false,
  variant = 'danger'
}: ConfirmDialogProps) {
  // Close on Escape key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
          >
            <div className="p-8 md:p-10 space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center animate-bounce-subtle",
                  variant === 'danger' && "bg-red-50 dark:bg-red-950/30 text-red-600",
                  variant === 'warning' && "bg-amber-50 dark:bg-amber-950/30 text-amber-600",
                  variant === 'info' && "bg-blue-50 dark:bg-blue-950/30 text-blue-600"
                )}>
                  <AlertTriangle className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={cn(
                    "h-14 rounded-2xl font-black text-lg shadow-lg transition-all active:scale-95",
                    variant === 'danger' && "bg-red-600 hover:bg-red-700 text-white shadow-red-100 dark:shadow-none",
                    variant === 'warning' && "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-100 dark:shadow-none",
                    variant === 'info' && "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100 dark:shadow-none"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : confirmText}
                </Button>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  disabled={isLoading}
                  className="h-14 rounded-2xl font-black text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
                >
                  {cancelText}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
