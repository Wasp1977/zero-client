'use client'

import {
  Phone,
  ListOrdered,
  UserPlus,
  Briefcase,
  BarChart3,
  CheckSquare,
  X,
  Plus,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  WIDGETS,
  WidgetId,
  SERVICES,
  ServiceId,
} from '@/lib/dashboard/types'
import { useDashboardStore } from '@/store/dashboard-store'
import { motion } from 'framer-motion'

const ICONS: Record<string, LucideIcon> = {
  phone: Phone,
  queue: ListOrdered,
  'user-plus': UserPlus,
  briefcase: Briefcase,
  'bar-chart': BarChart3,
  'check-square': CheckSquare,
}

function WidgetCatalogItem({ id }: { id: WidgetId }) {
  const widget = WIDGETS[id]
  const Icon = ICONS[widget.icon]
  const addWidget = useDashboardStore((s) => s.addWidget)
  const isAdded = useDashboardStore((s) => s.addedWidgets.includes(id))
  const serviceStatus = useDashboardStore((s) =>
    widget.service !== 'self' ? s.serviceStatuses[widget.service as ServiceId] : 'authorized',
  )

  const svcLabel =
    widget.service === 'self'
      ? 'Дашборд'
      : SERVICES[widget.service as ServiceId].name

  const svcStatusBadge =
    widget.service === 'self'
      ? null
      : serviceStatus === 'authorized'
        ? <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">подключён</Badge>
        : <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100">не подключён</Badge>

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      <Card className="p-4 hover:shadow-md transition-shadow border-slate-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-slate-700" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-slate-900 text-sm">{widget.title}</h4>
              <Badge variant="outline" className="text-[10px] py-0">{svcLabel}</Badge>
              {svcStatusBadge}
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{widget.description}</p>
            {isAdded ? (
              <div className="mt-3 text-xs text-emerald-600 font-medium flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5" /> Уже на дашборде
              </div>
            ) : (
              <Button
                size="sm"
                className="mt-3 h-8 text-xs"
                onClick={() => addWidget(id)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Добавить виджет
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export function WidgetCatalog() {
  const closeFlow = useDashboardStore((s) => s.closeFlow)
  const viewer = useDashboardStore((s) => s.viewer)
  const allWidgetIds = Object.keys(WIDGETS) as WidgetId[]

  // Для share-link зрителя фильтруем виджеты: только свои (self) + доступные сервисы
  // (недоступные сервисы скрываем полностью)
  const widgetIds = allWidgetIds.filter((id) => {
    const widget = WIDGETS[id]
    if (widget.service === 'self') return true
    const svc = widget.service as ServiceId
    if (!viewer) return true // админ видит все
    if (!viewer.isShared) return true // adminPreview видит все
    // share-link зритель: только виджеты доступных сервисов
    return viewer.serviceBindings?.[svc] !== 'unavailable'
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-900 text-base">Каталог виджетов</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Подключайте любые виджеты от любых сервисов — ОАТС, билайнСРМ или собственные.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={closeFlow} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {widgetIds.map((id) => (
            <WidgetCatalogItem key={id} id={id} />
          ))}
        </div>

        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
          <p className="text-[11px] text-slate-400">
            Подсказка: если сервис не авторизован, виджет покажет синтетические демо-данные
            с предложением подключить сервис.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
