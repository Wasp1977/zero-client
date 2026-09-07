// Типы для прототипа сценария дашборда

export type ServiceId = 'oats' | 'beeline-crm'

export type ServiceStatus =
  | 'disconnected'   // Сервис не подключён (нет авторизации). Пользователь может
                    // либо подключиться со своими логином/паролем, либо купить сервис.
  | 'authorized'    // Авторизован — виджеты показывают реальные данные.

export type WidgetId =
  | 'oats-calls'
  | 'oats-queue'
  | 'beeline-leads'
  | 'beeline-deals'
  | 'analytics'
  | 'tasks'

export type WidgetKind = 'synthetic' | 'real'

export type ViewerRole = 'admin' | 'director' | 'manager' | 'employee'

export type DepartmentId = 'sales' | 'support' | 'all'

export interface Department {
  id: DepartmentId
  name: string
}

export const DEPARTMENTS: Record<DepartmentId, Department> = {
  sales: { id: 'sales', name: 'Отдел продаж' },
  support: { id: 'support', name: 'Отдел поддержки' },
  all: { id: 'all', name: 'Все отделы' },
}

export interface Employee {
  id: string
  name: string
  role: Exclude<ViewerRole, 'admin'>
  deptId: Exclude<DepartmentId, 'all'>
  phone?: string
}

// Тестовый список сотрудников компании (для прототипа)
export const EMPLOYEES: Employee[] = [
  { id: 'u-sokolova', name: 'Анна Соколова', role: 'director', deptId: 'all', phone: '+7 (900) 111-22-33' },
  { id: 'u-volkov', name: 'Игорь Волков', role: 'manager', deptId: 'sales', phone: '+7 (901) 222-33-44' },
  { id: 'u-lebedeva', name: 'Мария Лебедева', role: 'manager', deptId: 'support', phone: '+7 (902) 333-44-55' },
  { id: 'u-orlov', name: 'Алексей Орлов', role: 'employee', deptId: 'sales', phone: '+7 (903) 444-55-66' },
  { id: 'u-zaytseva', name: 'Елена Зайцева', role: 'employee', deptId: 'sales', phone: '+7 (904) 555-66-77' },
  { id: 'u-kuznetsov', name: 'Дмитрий Кузнецов', role: 'employee', deptId: 'support', phone: '+7 (905) 666-77-88' },
]

export interface Viewer {
  role: ViewerRole
  userId: string        // 'admin' или id сотрудника из EMPLOYEES
  name: string
  phone?: string        // для share-link зрителей — их телефон (для логина)
  deptId: DepartmentId  // 'all' для director/admin
  isShared: boolean     // true — открыто по share-ссылке (read-only)
  shareToken?: string   // исходный токен, если isShared
}

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

// ===========================================================================
//  RLS: фильтрация данных по роли зрителя
// ===========================================================================
// В реальной системе эта фильтрация выполнялась бы на бэке. В прототипе — на клиенте.
// Логика:
//   - admin    → видит ВСЕ данные компании (полный агрегат)
//   - director → видит ВСЕ данные (как админ по данным, но без прав управления)
//   - manager  → видит только свой отдел (агрегат по отделу)
//   - employee → видит только себя (свои личные показатели)

export interface DataScope {
  scope: 'company' | 'department' | 'personal'
  scopeLabel: string
  multiplier: number // коэффициент относительно company-данных (для демо)
}

export function getDataScope(viewer: Viewer | null): DataScope {
  if (!viewer) {
    return { scope: 'company', scopeLabel: 'Все данные', multiplier: 1 }
  }
  switch (viewer.role) {
    case 'admin':
      return { scope: 'company', scopeLabel: 'Все данные (админ)', multiplier: 1 }
    case 'director':
      return { scope: 'company', scopeLabel: 'Все отделы и сотрудники', multiplier: 1 }
    case 'manager':
      return {
        scope: 'department',
        scopeLabel: `Только отдел: ${DEPARTMENTS[viewer.deptId].name}`,
        multiplier: 0.45, // менеджер видит ~45% от общего (свой отдел)
      }
    case 'employee':
      return {
        scope: 'personal',
        scopeLabel: `Только мои данные (${viewer.name})`,
        multiplier: 0.12, // сотрудник видит ~12% (только себя)
      }
  }
}

// Применяет RLS-масштабирование к данным виджета (демо-имитация)
export function applyRls<T extends Record<string, any>>(data: T, scope: DataScope): T {
  const m = scope.multiplier
  const scaled: Record<string, any> = {}
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === 'number') {
      scaled[k] = Math.max(0, Math.round(v * m))
    } else if (Array.isArray(v) && v.every((x) => typeof x === 'object' && x !== null)) {
      scaled[k] = v.map((item: any) => {
        if (typeof item.value === 'number') return { ...item, value: Math.max(0, Math.round(item.value * m)) }
        if (typeof item.count === 'number') return { ...item, count: Math.max(0, Math.round(item.count * m)) }
        return item
      })
    } else {
      scaled[k] = v
    }
  }
  return scaled as T
}

// ===========================================================================
//  Share-token encode/decode (base64-URL-safe, для прототипа)
// ===========================================================================
// В проде — подписанный JWT с exp; в прототипе — простой base64-json.
// ВАЖНО: админ не знает, кто именно перейдёт по ссылке — он создаёт ссылку
// с ролью и отделом, а имя зритель вводит сам при первом открытии.
// Поэтому name в payload может быть пустым — он заполнится после первого открытия.

export interface SharePayload {
  role: Exclude<ViewerRole, 'admin'>
  deptId: DepartmentId
  name?: string          // если не задано — спросим при первом открытии
  iat: number
}

export interface ActiveViewer {
  // Идентификатор генерируется при первом открытии ссылки
  sessionId: string
  // Ссылка, по которой перешёл зритель (последние 8 символов для отображения)
  shareTokenShort: string
  // Данные зрителя
  role: Exclude<ViewerRole, 'admin'>
  deptId: DepartmentId
  name?: string           // имя — опционально, зритель может не представиться
  phone: string           // телефон — обязательный, используется как логин
  // Когда впервые открыл
  firstSeenAt: number
  // Когда последний раз был активен
  lastSeenAt: number
}

export function encodeShareToken(payload: SharePayload): string {
  const json = JSON.stringify(payload)
  // base64url
  const b64 = btoa(unescape(encodeURIComponent(json)))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeShareToken(token: string): SharePayload | null {
  try {
    const b64 = token.replace(/-/g, '+').replace(/_/g, '/')
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4)
    const json = decodeURIComponent(escape(atob(padded)))
    return JSON.parse(json) as SharePayload
  } catch {
    return null
  }
}
