// Шаблоны дашбордов по ценности для трека бизнеса + примеры задач
// и подбор виджетов по описанию задачи пользователя.

import { WidgetId } from './types'

// ===========================================================================
//  Шаблоны дашбордов — готовые наборы виджетов под конкретный трек бизнеса.
//  Аналог «стартовых шаблонов» в Notion / Power BI / Tableau.
// ===========================================================================

export type BusinessTrack =
  | 'sales'         // Продажи
  | 'support'       // Поддержка
  | 'analytics'     // Аналитика
  | 'quality'       // Контроль качества
  | 'management'    // Руководство

export interface DashboardTemplate {
  id: string
  track: BusinessTrack
  title: string
  description: string
  // Какие виджеты входят в шаблон
  widgets: WidgetId[]
  // Цветовая гамма (Tailwind gradient)
  gradient: string
  // Эмодзи-иконка
  emoji: string
  // Ценность — что получает пользователь
  value: string
}

export const DASHBOARD_TEMPLATES: DashboardTemplate[] = [
  {
    id: 'tpl-sales',
    track: 'sales',
    title: 'Продажи',
    description: 'Лиды, сделки и воронка — всё для отдела продаж',
    widgets: ['beeline-leads', 'beeline-deals', 'oats-calls', 'analytics'],
    gradient: 'from-amber-400 to-orange-500',
    emoji: '💼',
    value: 'Управляйте воронкой от лида до сделки',
  },
  {
    id: 'tpl-support',
    track: 'support',
    title: 'Поддержка',
    description: 'Звонки, очереди и задачи — для отдела поддержки клиентов',
    widgets: ['oats-calls', 'oats-queue', 'tasks', 'analytics'],
    gradient: 'from-sky-400 to-blue-500',
    emoji: '🎧',
    value: 'Не теряйте ни одного обращения клиента',
  },
  {
    id: 'tpl-analytics',
    track: 'analytics',
    title: 'Аналитика',
    description: 'Обзор ключевых метрик и KPI по всем сервисам',
    widgets: ['analytics', 'oats-calls', 'beeline-leads', 'beeline-deals'],
    gradient: 'from-emerald-400 to-teal-500',
    emoji: '📊',
    value: 'Принимайте решения на основе данных',
  },
  {
    id: 'tpl-quality',
    track: 'quality',
    title: 'Контроль качества',
    description: 'Мониторинг звонков и сделок для оценки работы команды',
    widgets: ['oats-calls', 'oats-queue', 'beeline-deals', 'tasks'],
    gradient: 'from-fuchsia-400 to-purple-500',
    emoji: '🎯',
    value: 'Контролируйте качество работы сотрудников',
  },
  {
    id: 'tpl-management',
    track: 'management',
    title: 'Руководитель',
    description: 'Полная сводка по всем сервисам и отделам',
    widgets: ['analytics', 'oats-calls', 'beeline-leads', 'beeline-deals', 'oats-queue', 'tasks'],
    gradient: 'from-slate-500 to-slate-700',
    emoji: '👔',
    value: 'Весь дашборд под рукой — для принятия решений',
  },
]

// ===========================================================================
//  Примеры задач — кнопки быстрого выбора на вкладке «По задаче».
//  Пользователь может кликнуть на пример — задача подставится в поле ввода.
// ===========================================================================

export interface TaskExample {
  id: string
  label: string        // короткий текст на кнопке
  query: string        // полный текст для подстановки в поле
  // Какие виджеты подходят под эту задачу (для подбора)
  matchedWidgets: WidgetId[]
}

export const TASK_EXAMPLES: TaskExample[] = [
  {
    id: 'ex-leads',
    label: 'Хочу видеть новые лиды',
    query: 'Хочу отслеживать новые лиды, заявки клиентов и видеть воронку продаж от лида до сделки с аналитикой',
    matchedWidgets: ['beeline-leads', 'beeline-deals', 'analytics'],
  },
  {
    id: 'ex-calls',
    label: 'Контроль звонков',
    query: 'Нужно контролировать входящие и исходящие звонки сотрудников',
    matchedWidgets: ['oats-calls', 'oats-queue', 'analytics'],
  },
  {
    id: 'ex-deals',
    label: 'Активные сделки',
    query: 'Хочу видеть активные сделки и их сумму по стадиям воронки',
    matchedWidgets: ['beeline-deals', 'beeline-leads', 'analytics'],
  },
  {
    id: 'ex-queue',
    label: 'Очередь вызовов',
    query: 'Нужно следить за очередью вызовов и временем ожидания клиентов',
    matchedWidgets: ['oats-queue', 'oats-calls', 'tasks'],
  },
  {
    id: 'ex-team',
    label: 'Задачи команды',
    query: 'Хочу видеть задачи команды на сегодня и просроченные',
    matchedWidgets: ['tasks', 'analytics'],
  },
  {
    id: 'ex-overview',
    label: 'Обзор всего',
    query: 'Нужна общая аналитика по всем сервисам — звонки, лиды, сделки',
    matchedWidgets: ['analytics', 'oats-calls', 'beeline-leads', 'beeline-deals'],
  },
  {
    id: 'ex-support',
    label: 'Работа поддержки',
    query: 'Хочу оценить качество работы отдела поддержки по звонкам',
    matchedWidgets: ['oats-calls', 'oats-queue', 'tasks'],
  },
  {
    id: 'ex-sales-funnel',
    label: 'Воронка продаж',
    query: 'Нужна полная воронка продаж от лида до закрытой сделки',
    matchedWidgets: ['beeline-leads', 'beeline-deals', 'analytics'],
  },
]

// ===========================================================================
//  Keyword matching — подбор виджетов по описанию задачи.
//  Простая логика: каждое ключевое слово добавляет вес виджету.
//  Возвращаем виджеты с весом > 0, отсортированные по убыванию веса.
// ===========================================================================

interface WidgetKeywords {
  widget: WidgetId
  keywords: string[]
}

const WIDGET_KEYWORDS: WidgetKeywords[] = [
  {
    widget: 'oats-calls',
    keywords: ['звон', 'вызов', 'входящ', 'исходящ', 'телефон', 'озвон', 'контроль', 'звонки'],
  },
  {
    widget: 'oats-queue',
    keywords: ['очередь', 'ожидание', 'ожид', 'постановка', 'ivR', 'ivr', 'голосовое меню'],
  },
  {
    widget: 'beeline-leads',
    keywords: ['лид', 'заявк', 'новый клиент', 'потенциальн', 'привлеч', 'лиды'],
  },
  {
    widget: 'beeline-deals',
    keywords: ['сделк', 'воронк', 'продаж', 'стадия', 'сумма', 'контракт', 'договор', 'сделки'],
  },
  {
    widget: 'analytics',
    keywords: ['аналитик', 'отчет', 'отчёт', 'метрик', 'kpi', 'kпэ', 'показател', 'статистик', 'обзор', 'сводк', 'итог'],
  },
  {
    widget: 'tasks',
    keywords: ['задач', 'дела', 'дел', 'todo', 'план', 'напомин', 'просроч', 'команд', 'работа'],
  },
  {
    widget: 'updates',
    keywords: ['обновл', 'новост', 'анонс', 'новый сервис', 'функци', 'изменен', 'релиз', 'changelog'],
  },
]

export interface WidgetMatch {
  widget: WidgetId
  score: number
  // Какие ключевые слова нашли совпадение
  matchedKeywords: string[]
}

export function matchWidgetsByQuery(query: string): WidgetMatch[] {
  const q = query.toLowerCase().trim()
  if (!q) return []

  const matches: WidgetMatch[] = []

  for (const { widget, keywords } of WIDGET_KEYWORDS) {
    const matched: string[] = []
    let score = 0
    for (const kw of keywords) {
      if (q.includes(kw.toLowerCase())) {
        matched.push(kw)
        score += 1
      }
    }
    if (score > 0) {
      matches.push({ widget, score, matchedKeywords: matched })
    }
  }

  // Сортировка по убыванию веса
  return matches.sort((a, b) => b.score - a.score)
}

// ===========================================================================
//  Метаданные о виджетах — для отображения в результатах подбора.
//  Используем WIDGETS из types.ts, тут только заголовки для удобства.
// ===========================================================================

export const WIDGET_TITLES: Record<WidgetId, { title: string; service: string }> = {
  'oats-calls':      { title: 'Звонки',           service: 'ОАТС' },
  'oats-queue':      { title: 'Очередь вызовов',  service: 'ОАТС' },
  'beeline-leads':   { title: 'Лиды',             service: 'билайнСРМ' },
  'beeline-deals':   { title: 'Сделки',            service: 'билайнСРМ' },
  'analytics':       { title: 'Аналитика',         service: 'Дашборд' },
  'tasks':           { title: 'Мои задачи',        service: 'Дашборд' },
  'updates':         { title: 'Обновления',        service: 'Дашборд' },
}

export const TRACK_LABELS: Record<BusinessTrack, string> = {
  sales: 'Продажи',
  support: 'Поддержка',
  analytics: 'Аналитика',
  quality: 'Контроль качества',
  management: 'Руководство',
}
