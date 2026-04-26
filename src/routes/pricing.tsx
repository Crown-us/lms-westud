// @ts-nocheck
// @ts-nocheck
import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Zap, Crown, Building, ArrowRight, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export const Route = createFileRoute('/pricing')({
  component: PricingPage,
})

const PLANS = [
  { 
    name: 'Gratis', 
    monthlyPrice: 'Rp 0', 
    yearlyPrice: 'Rp 0',
    desc: 'Untuk pembelajar pemula yang ingin eksplorasi.', 
    icon: Zap,
    features: ['Akses 5 Kursus Gratis', 'Komunitas Dasar', 'Sertifikat Digital', 'Akses Mobile']
  },
  { 
    name: 'Pro', 
    monthlyPrice: 'Rp 149rb', 
    yearlyPrice: 'Rp 1.2jt',
    period: '/bulan', 
    yearlyPeriod: '/tahun',
    featured: true,
    desc: 'Pilihan terbaik untuk profesional karir.', 
    icon: Crown,
    features: ['Akses Semua Kursus', 'Grup Discord Eksklusif', 'Sesi Tanya Jawab Live', 'Update Materi Mingguan', 'Priority Support']
  },
  { 
    name: 'Bisnis', 
    monthlyPrice: 'Rp 499rb', 
    yearlyPrice: 'Rp 4.5jt',
    period: '/bulan', 
    yearlyPeriod: '/tahun',
    desc: 'Untuk tim dan perusahaan kecil.', 
    icon: Building,
    features: ['Hingga 10 Anggota', 'Dashboard Analytics Tim', 'Laporan Progres Belajar', 'Custom Learning Path']
  },
]

function PricingPage() {
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'yearly'>('monthly')

  // Theme colors based on billing cycle
  const isYearly = billingCycle === 'yearly'
  const themeColor = isYearly ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-600 dark:text-red-400'
  const bgColor = isYearly ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'bg-red-50 dark:bg-red-900/30'
  const toggleBg = isYearly ? 'bg-indigo-600' : 'bg-red-600'

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-left flex flex-col transition-colors duration-700">
      <main className="pt-32 pb-20 max-w-7xl mx-auto px-6 w-full text-left">
        <div className="text-center max-w-3xl mx-auto space-y-6 mb-16">
           <motion.div 
             animate={{ backgroundColor: isYearly ? 'rgba(79, 70, 229, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}
             className={`inline-flex items-center gap-2 ${bgColor} ${themeColor} px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase transition-colors duration-500`}
           >
             <Sparkles className="w-4 h-4" /> Investasi Karir Terbaik
           </motion.div>
           <h1 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
             Pilih Paket <br/> 
             <motion.span 
               animate={{ color: isYearly ? '#4f46e5' : '#ef4444' }}
               className="italic transition-colors duration-500"
             >
               Kesuksesanmu.
             </motion.span>
           </h1>
           <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Bergabunglah dengan ribuan profesional lainnya. Hemat hingga 30% dengan paket tahunan.</p>
           
           {/* GACOR TOGGLE SYSTEM */}
           <div className="flex items-center justify-center gap-4 pt-4">
              <span className={`text-sm font-black transition-colors ${!isYearly ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>Bulanan</span>
              <button 
                onClick={() => setBillingCycle(isYearly ? 'monthly' : 'yearly')}
                className="w-16 h-8 rounded-full bg-slate-100 dark:bg-slate-800 relative p-1 transition-all"
              >
                 <motion.div 
                   animate={{ 
                     x: isYearly ? 32 : 0,
                     backgroundColor: isYearly ? '#4f46e5' : '#ef4444'
                   }}
                   className="w-6 h-6 rounded-full shadow-lg transition-colors duration-500"
                 />
              </button>
              <span className={`text-sm font-black transition-colors ${isYearly ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>Tahunan</span>
              <motion.div
                animate={{ 
                  scale: isYearly ? [1, 1.1, 1] : 1,
                  backgroundColor: isYearly ? '#22c55e' : '#94a3b8'
                }}
                transition={{ repeat: isYearly ? Infinity : 0, duration: 2 }}
                className="text-white border-none text-[10px] font-black px-3 py-1 rounded-full"
              >
                DISKON 30%
              </motion.div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
           {PLANS.map((plan) => (
             <motion.div
               key={plan.name}
               layout
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="h-full"
             >
               <Card className={`h-full relative border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[3rem] overflow-hidden p-10 flex flex-col text-left ${plan.featured ? 'bg-slate-900 text-white scale-105 z-10 border-4 border-red-600/20' : 'bg-slate-50 dark:bg-slate-900'}`}>
                  {plan.featured && (
                    <motion.div 
                      animate={{ backgroundColor: isYearly ? '#4f46e5' : '#ef4444' }}
                      className="absolute top-0 right-0 text-white px-6 py-2 rounded-bl-3xl font-black text-[10px] uppercase tracking-widest transition-colors duration-500"
                    >
                      Paling Populer
                    </motion.div>
                  )}
                  <div className="mb-10 text-left">
                     <motion.div 
                       animate={{ 
                         backgroundColor: plan.featured ? (isYearly ? '#4f46e5' : '#ef4444') : (isYearly ? '#eef2ff' : '#ffffff'),
                         color: plan.featured ? '#ffffff' : (isYearly ? '#4f46e5' : '#ef4444')
                       }}
                       className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-colors duration-500`}
                     >
                        <plan.icon className="w-8 h-8" />
                     </motion.div>
                     <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                     <div className="flex items-baseline gap-1">
                        <AnimatePresence mode="wait">
                          <motion.span 
                            key={billingCycle}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-4xl font-black"
                          >
                            {billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                          </motion.span>
                        </AnimatePresence>
                        <span className="text-sm font-bold opacity-50">
                           {plan.period ? (billingCycle === 'monthly' ? plan.period : plan.yearlyPeriod) : ''}
                        </span>
                     </div>
                     <p className={`text-xs mt-3 font-medium ${plan.featured ? 'text-slate-400' : 'text-slate-500'}`}>{plan.desc}</p>
                  </div>
                  <div className="space-y-4 mb-10 flex-1 text-left">
                     {plan.features.map(f => (
                       <div key={f} className="flex gap-3 items-center text-sm font-bold text-left">
                          <motion.div animate={{ color: isYearly ? '#4f46e5' : '#ef4444' }}>
                            <Check className={`w-5 h-5 shrink-0 transition-colors duration-500`} />
                          </motion.div>
                          <span className={plan.featured ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400'}>{f}</span>
                       </div>
                     ))}
                  </div>
                  <Button 
                    className={`w-full h-14 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95 border-none ${
                      plan.featured 
                        ? 'text-white' 
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:text-white'
                    }`}
                    style={{ 
                      backgroundColor: plan.featured ? (isYearly ? '#4f46e5' : '#ef4444') : undefined 
                    }}
                  >
                     Mulai Sekarang <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
               </Card>
             </motion.div>
           ))}
        </div>
      </main>
    </div>
  )
}
