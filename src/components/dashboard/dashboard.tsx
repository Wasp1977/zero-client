'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  Plus,
  LogOut,
  LayoutGrid,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import { useDashboardStore } from '@/store/dashboard-store'
import { LoginScreen } from '@/components/dashboard/login-screen'
import { WidgetCatalog } from '@/components/dashboard/widget-catalog'
import { DashboardWidget } from '@/components/dashboard/dashboard-widget'
import { FlowModals } from '@/components/dashboard/flow-modals'
import { ServicesPanel } from '@/components/dashboard/services-panel'
import { ScenarioLog } from '@/components/dashboard/scenario-log'

export function Dashboard() {
  const isLoggedIn = useDashboardStore((s) => s.isLoggedIn)
  const userName = useDashboardStore((s) => s.userName)
  const addedWidgets = useDashboardStore((s) => s.addedWidgets)
  const openCatalog = useDashboardStore((s) => s.openCatalog)
  const activeFlow = useDashboardStore((s) => s.activeFlow)
  const logout = useDashboardStore((s) => s.logout)

  if (!isLoggedIn) {
    return <LoginScreen />
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <LayoutDashboard className="w-5 h-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                Дашборд виджетов
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                Пользователь: <span className="font-medium">{userName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={openCatalog} size="sm" className="h-9">
              <Plus className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Добавить виджет</span>
              <span className="sm:hidden">Виджет</span>
            </Button>
            <Button onClick={logout} variant="outline" size="sm" className="h-9">
              <LogOut className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Выйти</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Center — widgets area */}
          <div className="space-y-4 min-w-0">
            {/* Empty state */}
            {addedWidgets.length === 0 ? (
              <EmptyDashboard onAdd={openCatalog} />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-slate-500" />
                    <h2 className="text-sm font-semibold text-slate-900">
                      Виджеты на дашборде
                    </h2>
                    <Badge variant="outline" className="text-[10px] py-0">
                      {addedWidgets.length}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={openCatalog} className="h-8 text-xs">
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Ещё
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {addedWidgets.map((id) => (
                      <DashboardWidget key={id} id={id} />
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>

          {/* Right — services + log */}
          <div className="space-y-4 lg:sticky lg:top-[88px] lg:self-start">
            <ServicesPanel />
            <ScenarioLog />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="text-[11px] text-slate-500">
            Интерактивный прототип сценария: вход → виджеты → синтетика/реальные данные → покупка/авторизация сервисов.
          </p>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-orange-500" />
              синтетика
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              реальные данные
            </span>
          </div>
        </div>
      </footer>

      {/* Modals & Catalog */}
      <AnimatePresence>
        {activeFlow.type === 'catalog' && <WidgetCatalog />}
      </AnimatePresence>
      <FlowModals />
    </div>
  )
}

function EmptyDashboard({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 p-8 sm:p-12 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
        <LayoutGrid className="w-8 h-8 text-amber-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">
        Дашборд пуст
      </h3>
      <p className="text-sm text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
        Состояние «без виджетов». Подключите любые виджеты от любых сервисов —
        ОАТС, билайнСРМ или собственные. Если сервис ещё не куплен — покажем
        синтетические данные с предложением покупки.
      </p>
      <Button onClick={onAdd} size="lg">
        <Plus className="w-4 h-4 mr-2" />
        Открыть каталог виджетов
      </Button>
    </motion.div>
  )
}
