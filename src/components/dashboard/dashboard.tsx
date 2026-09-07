'use client'

import { useEffect, useRef } from 'react'
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
  Share2,
} from 'lucide-react'
import { useDashboardStore } from '@/store/dashboard-store'
import { LoginScreen } from '@/components/dashboard/login-screen'
import { WidgetCatalog } from '@/components/dashboard/widget-catalog'
import { DashboardWidget } from '@/components/dashboard/dashboard-widget'
import { FlowModals } from '@/components/dashboard/flow-modals'
import { SharePanel } from '@/components/dashboard/share-panel'
import { ViewerBanner } from '@/components/dashboard/viewer-banner'
import { NamePromptScreen } from '@/components/dashboard/name-prompt-screen'

export function Dashboard() {
  const isLoggedIn = useDashboardStore((s) => s.isLoggedIn)
  const userName = useDashboardStore((s) => s.userName)
  const addedWidgets = useDashboardStore((s) => s.addedWidgets)
  const openCatalog = useDashboardStore((s) => s.openCatalog)
  const openSharePanel = useDashboardStore((s) => s.openSharePanel)
  const activeFlow = useDashboardStore((s) => s.activeFlow)
  const logout = useDashboardStore((s) => s.logout)
  const viewer = useDashboardStore((s) => s.viewer)
  const loadFromShareToken = useDashboardStore((s) => s.loadFromShareToken)
  const pendingShareToken = useDashboardStore((s) => s.pendingShareToken)

  const shareInitialized = useRef(false)

  // One-shot парсинг share-токена из URL при первом монтировании.
  // Делаем через useEffect + guard, чтобы избежать двойного вызова в StrictMode.
  useEffect(() => {
    if (shareInitialized.current) return
    if (typeof window === 'undefined') return
    shareInitialized.current = true

    const params = new URLSearchParams(window.location.search)
    const token = params.get('share')
    if (token) {
      // На этом этапе телефона ещё нет — просто помечаем pendingShareToken,
      // дальше NamePromptScreen запросит телефон + имя у зрителя
      loadFromShareToken(token, '')
      // Чистим URL — чтобы при reload не было «режима просмотра»
      const url = new URL(window.location.href)
      url.searchParams.delete('share')
      window.history.replaceState({}, '', url.toString())
    }
  }, [loadFromShareToken])

  // Если ждём ввод телефона/имени от зрителя — показываем экран входа
  if (pendingShareToken) {
    return <NamePromptScreen />
  }

  if (!isLoggedIn) {
    return <LoginScreen />
  }

  // isSharedViewer — открыто по share-ссылке. Может добавлять виджеты, RLS работает.
  // isAdminPreview — админ смотрит «как зритель». Только превью, без прав.
  const isSharedViewer = viewer !== null && viewer.isShared
  const isAdminPreview = viewer !== null && !viewer.isShared
  // Скрываем кнопку «Поделиться» и для share-зрителя, и в режиме превью
  const canShare = viewer === null
  // Добавлять/удалять виджеты может админ и share-зритель (но не превью)
  const canEditWidgets = !isAdminPreview

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
                {viewer && (
                  <>
                    {' · '}
                    <span className="text-purple-700">
                      {viewer.isShared ? 'просмотр по share-ссылке' : 'режим превью'}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Кнопка "Поделиться" доступна только админу */}
            {canShare && (
              <Button onClick={openSharePanel} variant="outline" size="sm" className="h-9 border-purple-200 text-purple-700 hover:bg-purple-50">
                <Share2 className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Поделиться</span>
                <span className="sm:hidden">Доступ</span>
              </Button>
            )}
            {/* Добавлять виджеты может админ и share-зритель */}
            {canEditWidgets && (
              <Button onClick={openCatalog} size="sm" className="h-9">
                <Plus className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Добавить виджет</span>
                <span className="sm:hidden">Виджет</span>
              </Button>
            )}
            <Button onClick={logout} variant="outline" size="sm" className="h-9">
              <LogOut className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Выйти</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Viewer banner (превью / share-режим) */}
      <ViewerBanner />

      {/* Main */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6">
        <div className="space-y-4 min-w-0">
          {/* Empty state */}
          {addedWidgets.length === 0 ? (
            <EmptyDashboard onAdd={openCatalog} canEdit={canEditWidgets} />
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
                {canEditWidgets && (
                  <Button variant="ghost" size="sm" onClick={openCatalog} className="h-8 text-xs">
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Ещё
                  </Button>
                )}
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
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="text-[11px] text-slate-500">
            Интерактивный прототип: вход → виджеты → синтетика/реальные данные →
            share-ссылки + RLS по ролям (сотрудник / менеджер / директор).
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
            <span className="flex items-center gap-1">
              <Share2 className="w-3 h-3 text-purple-600" />
              share-ссылки
            </span>
          </div>
        </div>
      </footer>

      {/* Modals & Catalog */}
      <AnimatePresence>
        {activeFlow.type === 'catalog' && <WidgetCatalog />}
        {activeFlow.type === 'share' && <SharePanel />}
      </AnimatePresence>
      <FlowModals />
    </div>
  )
}

function EmptyDashboard({ onAdd, canEdit }: { onAdd: () => void; canEdit: boolean }) {
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
        ОАТС, билайнСРМ или собственные. Данные в виджетах будут отфильтрованы
        по вашей роли (RLS).
      </p>
      {canEdit && (
        <Button onClick={onAdd} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Открыть каталог виджетов
        </Button>
      )}
    </motion.div>
  )
}
