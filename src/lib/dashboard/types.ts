// Типы для прототипа сценария дашборда

export type ServiceId = 'oats' | 'beeline-crm'

export type ServiceStatus =
  | 'not-owned'      // Сервис не куплен и не подключён
  | 'owned'          // Куплен, но не авторизован
  | 'authorized'     // Авторизован

export type WidgetId =
  | 'oats-calls'
  | 'oats-queue'
  | 'beeline-leads'
  | 'beeline-deals'
  | 'analytics'
  | 'tasks'

export type WidgetKind = 'synthetic' | 'real'

export interface WidgetMeta {
  id: WidgetId
  title: string
  service: ServiceId | 'self'
  description: string
  icon: string
}

export interface ServiceMeta {
  id: ServiceId
  name: string
  vendor: string
  price: string
  description: string
  features: string[]
}

export const SERVICES: Record<ServiceId, ServiceMeta> = {
  oats: {
    id: 'oats',
    name: 'ОАТС',
    vendor: 'Beeline',
    price: '990 ₽ / мес',
    description: 'Облачная АТС для приёма и маршрутизации звонков',
    features: [
      'Входящие и исходящие вызовы',
      'Голосовое меню IVR',
      'Запись разговоров',
      'Интеграция с CRM',
    ],
  },
  'beeline-crm': {
    id: 'beeline-crm',
    name: 'билайнСРМ',
    vendor: 'Beeline',
    price: '1490 ₽ / мес',
    description: 'CRM-система для управления клиентами и сделками',
    features: [
      'Воронка продаж',
      'Карточки клиентов',
      'Задачи и напоминания',
      'Аналитика по менеджерам',
    ],
  },
}

export const WIDGETS: Record<WidgetId, WidgetMeta> = {
  'oats-calls': {
    id: 'oats-calls',
    title: 'Звонки',
    service: 'oats',
    description: 'Статистика звонков за последние 7 дней',
    icon: 'phone',
  },
  'oats-queue': {
    id: 'oats-queue',
    title: 'Очередь вызовов',
    service: 'oats',
    description: 'Активные очереди и время ожидания',
    icon: 'queue',
  },
  'beeline-leads': {
    id: 'beeline-leads',
    title: 'Лиды',
    service: 'beeline-crm',
    description: 'Новые лиды по воронке продаж',
    icon: 'user-plus',
  },
  'beeline-deals': {
    id: 'beeline-deals',
    title: 'Сделки',
    service: 'beeline-crm',
    description: 'Активные сделки и их стадии',
    icon: 'briefcase',
  },
  analytics: {
    id: 'analytics',
    title: 'Аналитика',
    service: 'self',
    description: 'Общая сводка по дашборду',
    icon: 'bar-chart',
  },
  tasks: {
    id: 'tasks',
    title: 'Мои задачи',
    service: 'self',
    description: 'Личные задачи пользователя',
    icon: 'check-square',
  },
}

// Синтетические демо-данные (показываются, когда сервис не авторизован)
export const SYNTHETIC_DATA: Record<string, any> = {
  'oats-calls': {
    total: 142,
    incoming: 89,
    outgoing: 53,
    chart: [
      { day: 'Пн', value: 18 },
      { day: 'Вт', value: 22 },
      { day: 'Ср', value: 15 },
      { day: 'Чт', value: 28 },
      { day: 'Пт', value: 24 },
      { day: 'Сб', value: 16 },
      { day: 'Вс', value: 19 },
    ],
    note: 'Синтетические демо-данные — подключите ОАТС, чтобы увидеть свою статистику.',
  },
  'oats-queue': {
    activeQueues: 3,
    longestWait: '02:45',
    callsWaiting: 7,
    note: 'Синтетические демо-данные — подключите ОАТС, чтобы видеть свои очереди.',
  },
  'beeline-leads': {
    newToday: 12,
    inProgress: 28,
    chart: [
      { day: 'Пн', value: 8 },
      { day: 'Вт', value: 12 },
      { day: 'Ср', value: 9 },
      { day: 'Чт', value: 15 },
      { day: 'Пт', value: 11 },
      { day: 'Сб', value: 4 },
      { day: 'Вс', value: 6 },
    ],
    note: 'Синтетические демо-данные — подключите билайнСРМ, чтобы увидеть своих лидов.',
  },
  'beeline-deals': {
    activeDeals: 18,
    totalValue: '2 450 000 ₽',
    byStage: [
      { stage: 'Новое', count: 6 },
      { stage: 'В работе', count: 8 },
      { stage: 'Согласование', count: 3 },
      { stage: 'Закрыто', count: 1 },
    ],
    note: 'Синтетические демо-данные — подключите билайнСРМ, чтобы видеть свои сделки.',
  },
  analytics: {
    totalWidgets: 0,
    connectedServices: 0,
    note: 'Виджет использует данные самого дашборда — всегда реален.',
  },
  tasks: {
    today: 5,
    overdue: 1,
    completed: 12,
    note: 'Виджет использует данные самого дашборда — всегда реален.',
  },
}

// Реальные данные (показываются после авторизации в сервисе)
export const REAL_DATA: Record<string, any> = {
  'oats-calls': {
    total: 67,
    incoming: 41,
    outgoing: 26,
    chart: [
      { day: 'Пн', value: 8 },
      { day: 'Вт', value: 14 },
      { day: 'Ср', value: 6 },
      { day: 'Чт', value: 12 },
      { day: 'Пт', value: 18 },
      { day: 'Сб', value: 5 },
      { day: 'Вс', value: 4 },
    ],
    note: 'Реальные данные из вашего ОАТС.',
  },
  'oats-queue': {
    activeQueues: 2,
    longestWait: '01:12',
    callsWaiting: 3,
    note: 'Реальные данные очередей вашего ОАТС.',
  },
  'beeline-leads': {
    newToday: 7,
    inProgress: 14,
    chart: [
      { day: 'Пн', value: 5 },
      { day: 'Вт', value: 8 },
      { day: 'Ср', value: 4 },
      { day: 'Чт', value: 11 },
      { day: 'Пт', value: 6 },
      { day: 'Сб', value: 2 },
      { day: 'Вс', value: 1 },
    ],
    note: 'Реальные лиды из вашей билайнСРМ.',
  },
  'beeline-deals': {
    activeDeals: 11,
    totalValue: '1 280 000 ₽',
    byStage: [
      { stage: 'Новое', count: 3 },
      { stage: 'В работе', count: 5 },
      { stage: 'Согласование', count: 2 },
      { stage: 'Закрыто', count: 1 },
    ],
    note: 'Реальные сделки из вашей билайнСРМ.',
  },
  analytics: {
    totalWidgets: 0,
    connectedServices: 0,
    note: 'Виджет использует данные самого дашборда — всегда реален.',
  },
  tasks: {
    today: 5,
    overdue: 1,
    completed: 12,
    note: 'Виджет использует данные самого дашборда — всегда реален.',
  },
}

export type ScenarioStep =
  | 'login'
  | 'empty-dashboard'
  | 'widget-catalog'
  | 'widget-on-dashboard'
  | 'auth-required'
  | 'purchase-required'
  | 'purchase-flow'
  | 'auth-flow'
  | 'success'

export interface ScenarioEvent {
  ts: number
  step: ScenarioStep
  message: string
  detail?: string
}
