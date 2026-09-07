'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Phone,
  Users,
  ShoppingCart,
  LogIn,
  CheckCircle2,
  AlertCircle,
  Clock,
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
        авторизован
      </Badge>
    )
  }
  if (status === 'owned') {
    return (
      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
        <Clock className="w-3 h-3 mr-1" />
        куплен, без авторизации
      </Badge>
    )
  }
  return (
    <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">
      <AlertCircle className="w-3 h-3 mr-1" />
      не куплен
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
      {status === 'not-owned' ? (
        <Button
          size="sm"
          variant="outline"
          className="w-full h-7 text-[11px] border-purple-200 text-purple-700 hover:bg-purple-50"
          onClick={() => requestPurchase(id)}
        >
          <ShoppingCart className="w-3 h-3 mr-1" />
          Купить
        </Button>
      ) : status === 'owned' ? (
        <Button
          size="sm"
          variant="outline"
          className="w-full h-7 text-[11px] border-amber-200 text-amber-700 hover:bg-amber-50"
          onClick={() => requestAuth(id)}
        >
          <LogIn className="w-3 h-3 mr-1" />
          Авторизоваться
        </Button>
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
  const ownedCount = Object.values(statuses).filter((s) => s !== 'not-owned').length
  const authCount = Object.values(statuses).filter((s) => s === 'authorized').length

  return (
    <Card className="p-4 border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Сервисы</h3>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-[10px] py-0">
            {authCount}/{serviceIds.length} активны
          </Badge>
        </div>
      </div>

      <div className="space-y-2.5">
        {serviceIds.map((id) => (
          <ServiceCard key={id} id={id} />
        ))}
      </div>

      {ownedCount === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 rounded-lg bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-200 p-2.5"
        >
          <p className="text-[11px] text-purple-800 leading-relaxed">
            <span className="font-medium">Ремаркетинг CJ:</span> сервисы ещё не куплены —
            предлагаетесь виджеты с синтетикой и кнопкой покупки.
          </p>
        </motion.div>
      )}
    </Card>
  )
}
