'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Eye,
  X,
  Share2,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react'
import { useDashboardStore } from '@/store/dashboard-store'
import { DEPARTMENTS, Viewer, ViewerRole } from '@/lib/dashboard/types'

const ROLE_LABELS: Record<ViewerRole, string> = {
  admin: 'Админ',
  director: 'Директор',
  manager: 'Менеджер',
  employee: 'Сотрудник',
}

function scopeLabelFor(viewer: Viewer): string {
  if (viewer.role === 'director') return 'видит все отделы и сотрудников'
  if (viewer.role === 'manager') return `видит отдел «${DEPARTMENTS[viewer.deptId].name}»`
  return 'видит только свои данные'
}

export function ViewerBanner() {
  const viewer = useDashboardStore((s) => s.viewer)
  const exitPreview = useDashboardStore((s) => s.exitPreview)

  return (
    <AnimatePresence>
      {viewer && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div
            className={`border-b ${
              viewer.isShared
                ? 'bg-amber-50 border-amber-200'
                : 'bg-sky-50 border-sky-200'
            }`}
          >
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                {viewer.isShared ? (
                  <Share2 className="w-4 h-4 text-amber-600 shrink-0" />
                ) : (
                  <Eye className="w-4 h-4 text-sky-600 shrink-0" />
                )}
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span
                    className={`text-xs font-semibold ${
                      viewer.isShared ? 'text-amber-900' : 'text-sky-900'
                    }`}
                  >
                    {viewer.isShared ? 'Режим просмотра по share-ссылке' : 'Превью как зритель'}
                  </span>
                  <span className="text-[11px] text-slate-600">
                    <span className="font-semibold">{viewer.name}</span>
                    {' · '}
                    {ROLE_LABELS[viewer.role]}
                    {' · '}
                    {scopeLabelFor(viewer)}
                  </span>
                  {viewer.isShared && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                      <ShieldAlert className="w-3 h-3" />
                      read-only
                    </span>
                  )}
                  {!viewer.isShared && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded">
                      <ShieldCheck className="w-3 h-3" />
                      только превью
                    </span>
                  )}
                </div>
              </div>
              {!viewer.isShared && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] border-sky-200 text-sky-700 hover:bg-sky-100"
                  onClick={exitPreview}
                >
                  <X className="w-3 h-3 mr-1" />
                  Выйти из превью
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
