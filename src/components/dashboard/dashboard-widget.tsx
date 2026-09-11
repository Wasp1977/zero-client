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
  KeyRound,
  ShoppingCart,
  Megaphone,
  ChevronRight,
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
  getDataScope,
  applyRls,
} from '@/lib/dashboard/types'
import { useDashboardStore } from '@/store/dashboard-store'

const ICONS: Record<string, LucideIcon> = {
  phone: Phone,
  queue: ListOrdered,
  'user-plus': UserPlus,
  briefcase: Briefcase,
  'bar-chart': BarChart3,
  'check-square': CheckSquare,
  megaphone: Megaphone,
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
  onConnect,
  onPurchase,
}: {
  service: ServiceId
  onConnect: () => void
  onPurchase: () => void
}) {
  const svc = SERVICES[service]

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
            Подключите {svc.name} со своим логином и паролем, чтобы увидеть свои данные.
          </p>
        </div>
      </div>
      {/* Primary CTA: подключение (вход со своими логином/паролем) */}
      <Button size="sm" className="w-full h-8 text-[11px]" onClick={onConnect}>
        <KeyRound className="w-3.5 h-3.5 mr-1" />
        Подключить сервис
      </Button>
      {/* Secondary CTA: покупка как fallback */}
      <button
        type="button"
        onClick={onPurchase}
        className="w-full text-[11px] text-slate-500 hover:text-slate-700 underline-offset-2 hover:underline transition-colors flex items-center justify-center gap-1"
      >
        <ShoppingCart className="w-3 h-3" />
        Нет аккаунта? Купить {svc.name}
      </button>
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
  const viewer = useDashboardStore((s) => s.viewer)

  // isAdminPreview — админ смотрит «как зритель», только превью (нельзя редактировать).
  // isSharedViewer — открыт по share-ссылке (можно добавлять/удалять виджеты, RLS активен).
  const isAdminPreview = viewer !== null && !viewer.isShared
  const isReadOnly = isAdminPreview

  // Для share-link зрителя: real = serviceBindings[service] === 'verified'
  // Для админа: real = глобальный serviceStatuses[service] === 'authorized'
  const isReal = (() => {
    if (widget.service === 'self') return true
    const svc = widget.service as ServiceId
    if (viewer && viewer.isShared) {
      return viewer.serviceBindings?.[svc] === 'verified'
    }
    return serviceStatus === 'authorized'
  })()

  const rawData = isReal ? REAL_DATA[id] : SYNTHETIC_DATA[id]

  // Применяем RLS-фильтрацию по роли зрителя
  const scope = getDataScope(viewer)
  const data = applyRls(rawData, scope)

  const handleConnect = () => {
    if (widget.service === 'self') return
    requestAuth(widget.service as ServiceId)
  }
  const handlePurchase = () => {
    if (widget.service === 'self') return
    requestPurchase(widget.service as ServiceId)
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
        {!isReadOnly && (
          <button
            onClick={() => removeWidget(id)}
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-md hover:bg-slate-100 flex items-center justify-center"
            aria-label="Удалить виджет"
          >
            <X className="w-3.5 h-3.5 text-slate-500" />
          </button>
        )}

        <div className="flex items-center gap-2 mb-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isReal ? 'bg-emerald-100' : 'bg-orange-100'
            }`}
          >
            <Icon className={`w-4 h-4 ${isReal ? 'text-emerald-600' : 'text-orange-600'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 leading-tight">{widget.title}</h3>
            <p className="text-[10px] text-slate-400 leading-tight truncate">{widget.description}</p>
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

        {viewer && (
          <div className="mb-2 text-[10px] text-slate-500 bg-slate-50 rounded px-1.5 py-0.5 leading-snug truncate">
            {scope.scopeLabel}
          </div>
        )}

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
          ) : id === 'updates' ? (
            <UpdatesContent items={data.items ?? []} />
          ) : null}
        </div>

        {/* CTA сервисов (Подключить/Купить) — только для админа (viewer === null).
            Для share-link зрителей CTA в верхнем ServiceVerificationBanner. */}
        {widget.service !== 'self' && viewer === null && (
          <div className="mt-3">
            {isReal ? (
              <AuthorizedBanner service={widget.service as ServiceId} />
            ) : (
              <SyntheticBanner
                service={widget.service as ServiceId}
                onConnect={handleConnect}
                onPurchase={handlePurchase}
              />
            )}
          </div>
        )}
        {widget.service !== 'self' && viewer !== null && isReal && (
          <div className="mt-3">
            <AuthorizedBanner service={widget.service as ServiceId} />
          </div>
        )}
        {widget.service !== 'self' && viewer !== null && !isReal && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[10px] text-amber-700 leading-snug flex items-center gap-1">
            <Sparkles className="w-3 h-3 shrink-0" />
            Синтетика — подтвердите себя в сервисе (баннер сверху)
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

// ===========================================================================
//  UpdatesContent — лента обновлений / рекламы новых сервисов и фич
// ===========================================================================

const UPDATE_COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' },
  sky:     { bg: 'bg-sky-50',     text: 'text-sky-700',     border: 'border-sky-200' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  fuchsia: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200' },
  teal:    { bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200' },
}

const KIND_LABEL: Record<string, string> = {
  'service-launch': 'Новый сервис',
  'feature-update': 'Обновление функции',
  'system-update':  'Обновление системы',
  'discount':       'Спецпредложение',
  'case-study':     'Кейс',
}

function UpdatesContent({ items }: { items: any[] }) {
  const viewer = useDashboardStore((s) => s.viewer)
  const requestPurchase = useDashboardStore((s) => s.requestPurchase)
  const openServiceVerify = useDashboardStore((s) => s.openServiceVerify)
  const serviceBindings = viewer?.serviceBindings

  if (items.length === 0) {
    return (
      <div className="text-[11px] text-slate-400 text-center py-4">
        Обновлений пока нет
      </div>
    )
  }

  const handleClick = (item: any) => {
    if (!item.service) return
    const svc = item.service as ServiceId
    if (viewer?.isShared) {
      // Зритель по share-ссылке: если сервис ещё не verified — открыть форму подтверждения
      if (serviceBindings?.[svc] !== 'verified') {
        openServiceVerify(svc)
      }
    } else {
      // Админ: открывает флоу покупки
      requestPurchase(svc)
    }
  }

  return (
    <div className="space-y-2 max-h-[280px] overflow-y-auto no-scrollbar -mr-1 pr-1">
      {items.map((item) => {
        const colors = UPDATE_COLOR_MAP[item.color] ?? UPDATE_COLOR_MAP.amber
        const hasService = !!item.service
        return (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className={`rounded-lg border ${colors.border} ${colors.bg} p-2.5`}
          >
            <div className="flex items-start gap-2">
              <span className="text-base leading-none mt-0.5">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`text-[9px] uppercase tracking-wider font-semibold ${colors.text}`}>
                    {KIND_LABEL[item.kind] ?? item.kind}
                  </span>
                  <span className="text-[9px] text-slate-400">· {item.date}</span>
                </div>
                <p className="text-xs font-semibold text-slate-900 leading-tight">{item.title}</p>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{item.text}</p>
                {hasService && (
                  <button
                    onClick={() => handleClick(item)}
                    className={`mt-1.5 inline-flex items-center gap-0.5 text-[11px] font-semibold ${colors.text} hover:underline`}
                  >
                    {item.cta}
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
                {!hasService && (
                  <button
                    className={`mt-1.5 inline-flex items-center gap-0.5 text-[11px] font-semibold ${colors.text} hover:underline`}
                  >
                    {item.cta}
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )
      })}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; }
      `}</style>
    </div>
  )
}
