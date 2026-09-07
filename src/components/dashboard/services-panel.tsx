'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Phone,
  Users,
  ShoppingCart,
  KeyRound,
  CheckCircle2,
  Unplug,
  type LucideIcon,
} from 'lucide-react'
import { SERVICES, ServiceId, ServiceStatus } from '@/lib/dashboard/types'
import { useDashboardStore } from '@/store/dashboard-store'

const SERVICE_ICONS: Record<ServiceId, LucideIcon> = {
  oats: Phone,
  'beeline-crm': Users,
}

function StatusBadge({ status }: { status: ServiceStatus }) {
  if (status === 'authorized') {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        подключён
      </Badge>
    )
  }
  return (
    <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100">
      <Unplug className="w-3 h-3 mr-1" />
      не подключён
    </Badge>
  )
}

function ServiceCard({ id }: { id: ServiceId }) {
  const svc = SERVICES[id]
  const Icon = SERVICE_ICONS[id]
  const status = useDashboardStore((s) => s.serviceStatuses[id])
  const requestAuth = useDashboardStore((s) => s.requestAuth)
  const requestPurchase = useDashboardStore((s) => s.requestPurchase)

  return (
    <Card className="p-3 border-slate-200">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
          <Icon className="w-4 h-4 text-slate-700" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{svc.name}</p>
          <p className="text-[10px] text-slate-400 truncate">{svc.vendor} · {svc.price}</p>
        </div>
      </div>
      <div className="mb-2">
        <StatusBadge status={status} />
      </div>
      {status === 'disconnected' ? (
        <div className="space-y-1.5">
          {/* Primary: подключение (вход со своими логином/паролем) */}
          <Button
            size="sm"
            className="w-full h-7 text-[11px]"
            onClick={() => requestAuth(id)}
          >
            <KeyRound className="w-3 h-3 mr-1" />
            Подключить
          </Button>
          {/* Secondary: покупка как fallback */}
          <button
            type="button"
            onClick={() => requestPurchase(id)}
            className="w-full text-[10px] text-slate-500 hover:text-purple-700 transition-colors flex items-center justify-center gap-1"
          >
            <ShoppingCart className="w-3 h-3" />
            Нет аккаунта? Купить
          </button>
        </div>
      ) : (
        <div className="text-[11px] text-emerald-700 font-medium text-center py-1">
          Активен · реальные данные
        </div>
      )}
    </Card>
  )
}

export function ServicesPanel() {
  const serviceIds = Object.keys(SERVICES) as ServiceId[]
  const statuses = useDashboardStore((s) => s.serviceStatuses)
  const authCount = Object.values(statuses).filter((s) => s === 'authorized').length
  const disconnectedCount = serviceIds.length - authCount

  return (
    <Card className="p-4 border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Сервисы</h3>
        <Badge variant="outline" className="text-[10px] py-0">
          {authCount}/{serviceIds.length} подключено
        </Badge>
      </div>

      <div className="space-y-2.5">
        {serviceIds.map((id) => (
          <ServiceCard key={id} id={id} />
        ))}
      </div>

      {disconnectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-200 p-2.5"
        >
          <p className="text-[11px] text-orange-800 leading-relaxed">
            <span className="font-medium">Подключите сервисы</span> со своими логином
            и паролем — на виджетах сразу появятся реальные данные. Если аккаунта нет —
            можно купить сервис как fallback.
          </p>
        </motion.div>
      )}
    </Card>
  )
}
