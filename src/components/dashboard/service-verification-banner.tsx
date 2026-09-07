'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Phone,
  Sparkles,
} from 'lucide-react'
import { useDashboardStore } from '@/store/dashboard-store'
import { SERVICES, ServiceId } from '@/lib/dashboard/types'

export function ServiceVerificationBanner() {
  const viewer = useDashboardStore((s) => s.viewer)
  const openServiceVerify = useDashboardStore((s) => s.openServiceVerify)

  if (!viewer || !viewer.isShared || !viewer.serviceBindings) return null

  const services = Object.keys(SERVICES) as ServiceId[]
  const unverified = services.filter(
    (sv) => viewer.serviceBindings![sv] === 'unverified',
  )
  const verified = services.filter(
    (sv) => viewer.serviceBindings![sv] === 'verified',
  )
  const available = services.filter(
    (sv) => viewer.serviceBindings![sv] !== 'unavailable',
  )

  // Если все доступные сервисы подтверждены — баннер не показываем
  if (unverified.length === 0) {
    return (
      <AnimatePresence>
        {verified.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-emerald-50 border-b border-emerald-200">
              <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2 flex items-center gap-2 flex-wrap">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-medium text-emerald-900">
                  Все сервисы подтверждены
                </span>
                <span className="text-[11px] text-emerald-700">
                  · виджеты показывают реальные данные с учётом вашей роли
                </span>
                <div className="flex items-center gap-1 ml-auto">
                  {verified.map((sv) => (
                    <Badge
                      key={sv}
                      className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                    >
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      {SERVICES[sv].name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  const oneUnverified = unverified.length === 1

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-start gap-3 flex-wrap">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900">
              Чтобы подгрузить {oneUnverified ? 'данные, подтвердите себя в сервисе' : 'данные, подтвердите себя в сервисах'}
            </p>
            <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
              Сейчас виджеты показывают синтетические демо-данные.
              {' '}
              {oneUnverified ? 'Подтвердите себя —' : 'Подтвердите себя в каждом из сервисов —'}
              {' '}и данные подгрузятся с учётом вашей роли ({roleLabel(viewer.role)}).
              {verified.length > 0 && (
                <>
                  {' '}
                  Уже подтверждено: {verified.map((sv) => SERVICES[sv].name).join(', ')}.
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {unverified.map((sv) => (
              <Button
                key={sv}
                size="sm"
                onClick={() => openServiceVerify(sv)}
                className="h-9 bg-amber-600 hover:bg-amber-700 text-white"
              >
                <KeyRound className="w-4 h-4 mr-1.5" />
                Подтвердить {SERVICES[sv].name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function roleLabel(role: string): string {
  switch (role) {
    case 'director': return 'директор — все отделы'
    case 'manager': return 'менеджер — свой отдел'
    case 'employee': return 'сотрудник — только свои данные'
    default: return role
  }
}
