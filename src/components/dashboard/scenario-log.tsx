'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  LogIn,
  LayoutGrid,
  Plus,
  AlertCircle,
  ShoppingCart,
  CheckCircle2,
  Activity,
} from 'lucide-react'
import { ScenarioEvent } from '@/lib/dashboard/types'
import { useDashboardStore } from '@/store/dashboard-store'

const STEP_LABELS: Record<string, { label: string; color: string }> = {
  login: { label: 'Вход', color: 'bg-amber-100 text-amber-700' },
  'empty-dashboard': { label: 'Дашборд пуст', color: 'bg-slate-100 text-slate-600' },
  'widget-catalog': { label: 'Каталог', color: 'bg-sky-100 text-sky-700' },
  'widget-on-dashboard': { label: 'Виджет добавлен', color: 'bg-emerald-100 text-emerald-700' },
  'auth-required': { label: 'Нужна авторизация', color: 'bg-orange-100 text-orange-700' },
  'purchase-required': { label: 'Нужна покупка', color: 'bg-rose-100 text-rose-700' },
  'purchase-flow': { label: 'Покупка (CJ)', color: 'bg-purple-100 text-purple-700' },
  'auth-flow': { label: 'Авторизация', color: 'bg-amber-100 text-amber-700' },
  success: { label: 'Успех', color: 'bg-emerald-100 text-emerald-700' },
}

function EventIcon({ step }: { step: string }) {
  switch (step) {
    case 'login':
      return <LogIn className="w-3 h-3" />
    case 'widget-catalog':
      return <LayoutGrid className="w-3 h-3" />
    case 'widget-on-dashboard':
    case 'success':
      return <CheckCircle2 className="w-3 h-3" />
    case 'auth-required':
      return <AlertCircle className="w-3 h-3" />
    case 'purchase-required':
    case 'purchase-flow':
      return <ShoppingCart className="w-3 h-3" />
    case 'auth-flow':
      return <LogIn className="w-3 h-3" />
    default:
      return <Activity className="w-3 h-3" />
  }
}

export function ScenarioLog() {
  const scenarioLog = useDashboardStore((s) => s.scenarioLog)

  return (
    <Card className="p-4 border-slate-200 flex flex-col h-full max-h-[600px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-slate-500" />
          Журнал сценария
        </h3>
        <Badge variant="outline" className="text-[10px] py-0">
          {scenarioLog.length} событий
        </Badge>
      </div>

      <ScrollArea className="flex-1 -mx-1 px-1">
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {scenarioLog.length === 0 ? (
              <div className="text-xs text-slate-400 py-8 text-center">
                События появятся здесь по мере прохождения сценария
              </div>
            ) : (
              scenarioLog.map((ev, i) => {
                const meta = STEP_LABELS[ev.step] ?? { label: ev.step, color: 'bg-slate-100 text-slate-600' }
                return (
                  <motion.div
                    key={ev.ts + '-' + i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-lg border border-slate-100 bg-slate-50/50 p-2.5"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center ${meta.color}`}>
                        <EventIcon step={ev.step} />
                      </span>
                      <Badge variant="outline" className={`text-[10px] py-0 px-1.5 ${meta.color} border-transparent`}>
                        {meta.label}
                      </Badge>
                      <span className="text-[10px] text-slate-400 ml-auto">
                        {new Date(ev.ts).toLocaleTimeString('ru-RU')}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-800 leading-tight">{ev.message}</p>
                    {ev.detail && (
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{ev.detail}</p>
                    )}
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </Card>
  )
}
