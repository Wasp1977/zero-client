'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Phone,
  ListOrdered,
  UserPlus,
  Briefcase,
  BarChart3,
  CheckSquare,
  X,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  WIDGETS,
  WidgetId,
  SYNTHETIC_DATA,
  REAL_DATA,
  SERVICES,
  ServiceId,
} from '@/lib/dashboard/types'
import { useDashboardStore } from '@/store/dashboard-store'

const ICONS: Record<string, LucideIcon> = {
  phone: Phone,
  queue: ListOrdered,
  'user-plus': UserPlus,
  briefcase: Briefcase,
  'bar-chart': BarChart3,
  'check-square': CheckSquare,
}

const SYNTHETIC_COLOR = '#fb923c' // orange-400
const REAL_COLOR = '#10b981' // emerald-500

function WidgetChart({ data, isSynthetic }: { data: any[]; isSynthetic: boolean }) {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="day"
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Bar dataKey="value" radius={[3, 3, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={isSynthetic ? SYNTHETIC_COLOR : REAL_COLOR} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function SyntheticBanner({
  service,
  onCta,
}: {
  service: ServiceId
  onCta: () => void
}) {
  const status = useDashboardStore((s) => s.serviceStatuses[service])
  const svc = SERVICES[service]
  const ctaLabel =
    status === 'not-owned' ? `Купить ${svc.name}` : `Авторизоваться в ${svc.name}`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-lg border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-3 space-y-2"
    >
      <div className="flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-[11px] font-medium text-orange-800 leading-snug">
            Синтетические демо-данные
          </p>
          <p className="text-[11px] text-orange-700 mt-0.5 leading-relaxed">
            Чтобы увидеть свои данные — {status === 'not-owned' ? 'купите и подключите' : 'авторизуйтесь в'}{' '}
            {svc.name}.
          </p>
        </div>
      </div>
      <Button size="sm" className="w-full h-7 text-[11px]" onClick={onCta}>
        {ctaLabel}
      </Button>
    </motion.div>
  )
}

function AuthorizedBanner({ service }: { service: ServiceId }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 flex items-center gap-2"
    >
      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
      <p className="text-[11px] font-medium text-emerald-800">
        Реальные данные из {SERVICES[service].name}
      </p>
    </motion.div>
  )
}

export function DashboardWidget({ id }: { id: WidgetId }) {
  const widget = WIDGETS[id]
  const Icon = ICONS[widget.icon]
  const removeWidget = useDashboardStore((s) => s.removeWidget)
  const requestAuth = useDashboardStore((s) => s.requestAuth)
  const requestPurchase = useDashboardStore((s) => s.requestPurchase)
  const serviceStatus = useDashboardStore((s) =>
    widget.service !== 'self' ? s.serviceStatuses[widget.service as ServiceId] : 'authorized',
  )

  const isReal = serviceStatus === 'authorized'
  const data = isReal ? REAL_DATA[id] : SYNTHETIC_DATA[id]

  const handleCta = () => {
    if (widget.service === 'self') return
    const svc = widget.service as ServiceId
    if (serviceStatus === 'not-owned') {
      requestPurchase(svc)
    } else {
      requestAuth(svc)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <Card className="p-4 relative group hover:shadow-md transition-shadow border-slate-200 h-full flex flex-col">
        <button
          onClick={() => removeWidget(id)}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-md hover:bg-slate-100 flex items-center justify-center"
          aria-label="Удалить виджет"
        >
          <X className="w-3.5 h-3.5 text-slate-500" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isReal ? 'bg-emerald-100' : 'bg-orange-100'
            }`}
          >
            <Icon className={`w-4 h-4 ${isReal ? 'text-emerald-600' : 'text-orange-600'}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-900 leading-tight">{widget.title}</h3>
            <p className="text-[10px] text-slate-400 leading-tight">{widget.description}</p>
          </div>
          <Badge
            variant="outline"
            className={`text-[10px] py-0 px-1.5 ${
              isReal
                ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                : 'border-orange-300 text-orange-700 bg-orange-50'
            }`}
          >
            {isReal ? 'реальные' : 'синтетика'}
          </Badge>
        </div>

        <div className="flex-1 space-y-2">
          {id === 'oats-calls' || id === 'beeline-leads' ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md bg-slate-50 p-2">
                  <p className="text-[10px] text-slate-500">Всего</p>
                  <p className={`text-lg font-bold ${isReal ? 'text-emerald-700' : 'text-orange-700'}`}>
                    {data.total ?? data.newToday}
                  </p>
                </div>
                <div className="rounded-md bg-slate-50 p-2">
                  <p className="text-[10px] text-slate-500">{id === 'oats-calls' ? 'Вход.' : 'В работе'}</p>
                  <p className={`text-lg font-bold ${isReal ? 'text-emerald-700' : 'text-orange-700'}`}>
                    {data.incoming ?? data.inProgress}
                  </p>
                </div>
              </div>
              <WidgetChart data={data.chart} isSynthetic={!isReal} />
            </>
          ) : id === 'oats-queue' ? (
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-md bg-slate-50 p-2 text-center">
                <p className="text-[10px] text-slate-500">Очереди</p>
                <p className={`text-base font-bold ${isReal ? 'text-emerald-700' : 'text-orange-700'}`}>
                  {data.activeQueues}
                </p>
              </div>
              <div className="rounded-md bg-slate-50 p-2 text-center">
                <p className="text-[10px] text-slate-500">Ожидают</p>
                <p className={`text-base font-bold ${isReal ? 'text-emerald-700' : 'text-orange-700'}`}>
                  {data.callsWaiting}
                </p>
              </div>
              <div className="rounded-md bg-slate-50 p-2 text-center">
                <p className="text-[10px] text-slate-500">Макс. ожид.</p>
                <p className={`text-base font-bold ${isReal ? 'text-emerald-700' : 'text-orange-700'}`}>
                  {data.longestWait}
                </p>
              </div>
            </div>
          ) : id === 'beeline-deals' ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md bg-slate-50 p-2">
                  <p className="text-[10px] text-slate-500">Активных сделок</p>
                  <p className={`text-lg font-bold ${isReal ? 'text-emerald-700' : 'text-orange-700'}`}>
                    {data.activeDeals}
                  </p>
                </div>
                <div className="rounded-md bg-slate-50 p-2">
                  <p className="text-[10px] text-slate-500">Сумма</p>
                  <p className={`text-sm font-bold ${isReal ? 'text-emerald-700' : 'text-orange-700'} leading-tight pt-1`}>
                    {data.totalValue}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                {data.byStage.map((s: any) => (
                  <div key={s.stage} className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 w-24 shrink-0">{s.stage}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${isReal ? 'bg-emerald-500' : 'bg-orange-400'} rounded-full`}
                        style={{ width: `${(s.count / Math.max(...data.byStage.map((x: any) => x.count))) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-slate-600 w-6 text-right">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : id === 'analytics' ? (
            <div className="space-y-2">
              <div className="rounded-md bg-slate-50 p-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-600" />
                <span className="text-[11px] text-slate-600">
                  Виджеты на дашборде и подключённые сервисы
                </span>
              </div>
              <AnalyticsInline />
            </div>
          ) : id === 'tasks' ? (
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-md bg-slate-50 p-2 text-center">
                <p className="text-[10px] text-slate-500">Сегодня</p>
                <p className="text-base font-bold text-slate-700">{data.today}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-2 text-center">
                <p className="text-[10px] text-slate-500">Просрочено</p>
                <p className="text-base font-bold text-rose-600">{data.overdue}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-2 text-center">
                <p className="text-[10px] text-slate-500">Выполнено</p>
                <p className="text-base font-bold text-emerald-600">{data.completed}</p>
              </div>
            </div>
          ) : null}
        </div>

        {widget.service !== 'self' && (
          <div className="mt-3">
            {isReal ? (
              <AuthorizedBanner service={widget.service as ServiceId} />
            ) : (
              <SyntheticBanner service={widget.service as ServiceId} onCta={handleCta} />
            )}
          </div>
        )}
      </Card>
    </motion.div>
  )
}

function AnalyticsInline() {
  const addedWidgets = useDashboardStore((s) => s.addedWidgets.length)
  const serviceStatuses = useDashboardStore((s) => s.serviceStatuses)
  const connectedServices = Object.values(serviceStatuses).filter((s) => s === 'authorized').length

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="rounded-md bg-slate-50 p-2">
        <p className="text-[10px] text-slate-500">Виджетов</p>
        <p className="text-lg font-bold text-slate-700">{addedWidgets}</p>
      </div>
      <div className="rounded-md bg-slate-50 p-2">
        <p className="text-[10px] text-slate-500">Сервисов подключено</p>
        <p className="text-lg font-bold text-slate-700">{connectedServices}</p>
      </div>
    </div>
  )
}
