'use client'

import { useState, useMemo } from 'react'
import {
  Phone,
  ListOrdered,
  UserPlus,
  Briefcase,
  BarChart3,
  CheckSquare,
  Megaphone,
  X,
  Plus,
  Search,
  Sparkles,
  LayoutGrid,
  Wand2,
  Check,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  WIDGETS,
  WidgetId,
  SYNTHETIC_DATA,
  SERVICES,
  ServiceId,
} from '@/lib/dashboard/types'
import { useDashboardStore } from '@/store/dashboard-store'
import {
  DASHBOARD_TEMPLATES,
  TASK_EXAMPLES,
  matchWidgetsByQuery,
  WIDGET_TITLES,
  TRACK_LABELS,
  DashboardTemplate,
} from '@/lib/dashboard/task-templates'
import { motion, AnimatePresence } from 'framer-motion'

const ICONS: Record<string, LucideIcon> = {
  phone: Phone,
  queue: ListOrdered,
  'user-plus': UserPlus,
  briefcase: Briefcase,
  'bar-chart': BarChart3,
  'check-square': CheckSquare,
  megaphone: Megaphone,
}

type Tab = 'manual' | 'task'

export function WidgetCatalog() {
  const closeFlow = useDashboardStore((s) => s.closeFlow)
  const viewer = useDashboardStore((s) => s.viewer)
  const [tab, setTab] = useState<Tab>('manual')

  const allWidgetIds = Object.keys(WIDGETS) as WidgetId[]

  // Для share-link зрителя фильтруем виджеты: только свои (self) + доступные сервисы
  const widgetIds = allWidgetIds.filter((id) => {
    const widget = WIDGETS[id]
    if (widget.service === 'self') return true
    const svc = widget.service as ServiceId
    if (!viewer) return true
    if (!viewer.isShared) return true
    return viewer.serviceBindings?.[svc] !== 'unavailable'
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-900 text-base">Каталог виджетов</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Добавьте виджеты вручную или подберите их под свою задачу
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={closeFlow} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Вкладки */}
        <div className="px-5 pt-4 flex items-center gap-1 border-b border-slate-100">
          <TabButton
            active={tab === 'manual'}
            onClick={() => setTab('manual')}
            icon={<LayoutGrid className="w-4 h-4" />}
            label="Вручную"
          />
          <TabButton
            active={tab === 'task'}
            onClick={() => setTab('task')}
            icon={<Wand2 className="w-4 h-4" />}
            label="По задаче"
            badge="AI"
          />
        </div>

        <div className="overflow-y-auto flex-1 p-5">
          {tab === 'manual' ? (
            <ManualTab widgetIds={widgetIds} />
          ) : (
            <TaskTab widgetIds={widgetIds} />
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
          <p className="text-[11px] text-slate-400">
            {tab === 'manual'
              ? 'Подсказка: если сервис не подключён, виджет покажет синтетические демо-данные с предложением подключиться'
              : 'Опишите задачу или выберите готовый шаблон — мы подберём виджеты автоматически'}
          </p>
        </div>
      </motion.div>
    </div>
  )
}

// ===========================================================================
//  Вкладка «Вручную» — список виджетов с поиском
// ===========================================================================

function ManualTab({ widgetIds }: { widgetIds: WidgetId[] }) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return widgetIds
    return widgetIds.filter((id) => {
      const w = WIDGETS[id]
      return (
        w.title.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) ||
        w.service.toLowerCase().includes(q)
      )
    })
  }, [widgetIds, search])

  return (
    <div className="space-y-3">
      {/* Поиск */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <Input
          placeholder="Поиск виджетов по названию или описанию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        )}
      </div>

      <p className="text-[11px] text-slate-400">
        Найдено: {filtered.length} из {widgetIds.length}
      </p>

      {/* Список виджетов */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((id) => (
          <WidgetCatalogItem key={id} id={id} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-sm text-slate-400">
          Ничего не найдено по запросу «{search}»
        </div>
      )}
    </div>
  )
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
                <Check className="w-3.5 h-3.5" /> Уже на дашборде
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

// ===========================================================================
//  Вкладка «По задаче» — шаблоны дашбордов + подбор по описанию задачи
// ===========================================================================

function TaskTab({ widgetIds }: { widgetIds: WidgetId[] }) {
  const [query, setQuery] = useState('')
  const addWidget = useDashboardStore((s) => s.addWidget)
  const addedWidgets = useDashboardStore((s) => s.addedWidgets)
  const closeFlow = useDashboardStore((s) => s.closeFlow)

  // Подбор виджетов по запросу
  const matches = useMemo(() => {
    if (!query.trim()) return []
    return matchWidgetsByQuery(query).filter((m) => widgetIds.includes(m.widget))
  }, [query, widgetIds])

  // Применить шаблон — добавить все виджеты из него
  const applyTemplate = (tpl: DashboardTemplate) => {
    // Фильтруем только доступные зрителю виджеты
    const widgetsToAdd = tpl.widgets.filter((w) => widgetIds.includes(w))
    widgetsToAdd.forEach((w) => {
      if (!addedWidgets.includes(w)) addWidget(w)
    })
    closeFlow()
  }

  // Добавить все подобранные виджеты
  const addAllMatched = () => {
    matches.forEach((m) => {
      if (!addedWidgets.includes(m.widget)) addWidget(m.widget)
    })
    closeFlow()
  }

  // Применить пример задачи — подставить текст в поле
  const applyExample = (exampleQuery: string) => {
    setQuery(exampleQuery)
  }

  return (
    <div className="space-y-5">
      {/* 1. Шаблоны дашбордов по ценности */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Шаблоны по ценности
          </h4>
        </div>
        <p className="text-[11px] text-slate-500 mb-3">
          Готовые наборы виджетов под ваш трек бизнеса — добавьте весь шаблон одним кликом
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {DASHBOARD_TEMPLATES.filter((tpl) => {
            // Для share-link зрителя фильтруем шаблоны, где есть доступные виджеты
            const availableWidgets = tpl.widgets.filter((w) => widgetIds.includes(w))
            return availableWidgets.length > 0
          }).map((tpl) => {
            const availableWidgets = tpl.widgets.filter((w) => widgetIds.includes(w))
            const allAdded = availableWidgets.every((w) => addedWidgets.includes(w))
            return (
              <button
                key={tpl.id}
                onClick={() => applyTemplate(tpl)}
                className={`relative text-left rounded-xl p-3 bg-gradient-to-br ${tpl.gradient} text-white hover:scale-[1.02] transition-transform`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-2xl leading-none">{tpl.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h5 className="text-sm font-bold leading-tight">{tpl.title}</h5>
                      {allAdded && (
                        <Badge className="bg-white/20 text-white hover:bg-white/20 text-[9px] py-0 px-1">
                          <Check className="w-2.5 h-2.5 mr-0.5" />
                          добавлено
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] opacity-90 mt-0.5 leading-snug">{tpl.description}</p>
                    <p className="text-[10px] opacity-75 mt-1 leading-snug">
                      → {tpl.value}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="text-[9px] opacity-75">
                        {availableWidgets.length} виджетов
                      </span>
                      <ChevronRight className="w-3 h-3 ml-auto" />
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Разделитель */}
      <div className="border-t border-slate-100" />

      {/* 2. Подбор по описанию задачи */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Wand2 className="w-3.5 h-3.5 text-purple-500" />
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Подбор по задаче
          </h4>
        </div>
        <p className="text-[11px] text-slate-500 mb-3">
          Опишите свою задачу — мы подберём виджеты, которые её покрывают
        </p>

        {/* Поле ввода задачи */}
        <div className="space-y-1.5">
          <Textarea
            placeholder="Например: хочу отслеживать новые лиды и не терять заявки клиентов"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-[70px] text-sm"
          />
        </div>

        {/* Кнопки примеров задач */}
        <div className="mt-2.5">
          <p className="text-[10px] text-slate-400 mb-1.5">Быстрый выбор:</p>
          <div className="flex flex-wrap gap-1.5">
            {TASK_EXAMPLES.map((ex) => (
              <button
                key={ex.id}
                onClick={() => applyExample(ex.query)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                  query === ex.query
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-purple-100 hover:text-purple-700'
                }`}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Результаты подбора */}
        <AnimatePresence>
          {matches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 rounded-lg border border-purple-200 bg-purple-50/50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <p className="text-xs font-semibold text-purple-900">
                      Подобрали {matches.length} {matches.length === 1 ? 'виджет' : 'виджетов'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="h-7 text-[11px] bg-purple-600 hover:bg-purple-700"
                    onClick={addAllMatched}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Добавить все
                  </Button>
                </div>
                <div className="space-y-1.5">
                  {matches.map((m) => {
                    const meta = WIDGET_TITLES[m.widget]
                    const isAdded = addedWidgets.includes(m.widget)
                    return (
                      <div
                        key={m.widget}
                        className="flex items-center gap-2 rounded-md bg-white border border-purple-100 p-2"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-slate-900">{meta.title}</span>
                            <Badge variant="outline" className="text-[9px] py-0">
                              {meta.service}
                            </Badge>
                            {isAdded && (
                              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[9px] py-0">
                                <Check className="w-2.5 h-2.5 mr-0.5" />
                                добавлен
                              </Badge>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                            Совпадения: {m.matchedKeywords.join(', ')}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[9px] py-0 px-1 shrink-0">
                          релевантность {m.score}
                        </Badge>
                        {!isAdded && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] px-2 shrink-0"
                            onClick={() => addWidget(m.widget)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Подсказка, если ничего не найдено */}
        {query.trim() && matches.length === 0 && (
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
            <p className="text-xs text-slate-500">
              Не нашли виджеты по вашему запросу. Попробуйте переформулировать
              или выберите пример задачи выше.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ===========================================================================
//  Кнопка вкладки
// ===========================================================================

function TabButton({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  badge?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
        active
          ? 'border-purple-500 text-purple-700'
          : 'border-transparent text-slate-500 hover:text-slate-700'
      }`}
    >
      {icon}
      {label}
      {badge && (
        <Badge className="ml-1 bg-purple-100 text-purple-700 hover:bg-purple-100 text-[9px] py-0 px-1">
          {badge}
        </Badge>
      )}
    </button>
  )
}
