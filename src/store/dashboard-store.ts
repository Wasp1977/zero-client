'use client'

import { create } from 'zustand'
import {
  ServiceId,
  ServiceStatus,
  WidgetId,
  ScenarioStep,
  ScenarioEvent,
  SERVICES,
  WIDGETS,
  Viewer,
  Employee,
  ViewerRole,
  DepartmentId,
  SharePayload,
  ActiveViewer,
  encodeShareToken,
  decodeShareToken,
  DEPARTMENTS,
} from '@/lib/dashboard/types'

interface DashboardState {
  // Текущий шаг сценария (для индикатора прогресса)
  currentStep: ScenarioStep

  // Статус входа пользователя (админа)
  isLoggedIn: boolean
  userName: string

  // Подключённые на дашборд виджеты
  addedWidgets: WidgetId[]

  // Статусы сервисов
  serviceStatuses: Record<ServiceId, ServiceStatus>

  // Текущий активный модальный поток
  activeFlow:
    | { type: 'none' }
    | { type: 'auth'; service: ServiceId }
    | { type: 'purchase'; service: ServiceId }
    | { type: 'reminders' }
    | { type: 'catalog' }
    | { type: 'share' }

  // Лог сценария
  scenarioLog: ScenarioEvent[]

  // ===== Роли и шаринг =====
  // Текущий «зритель» дашборда:
  //  - null = админ смотрит «как админ» (полные права)
  //  - иначе — это либо admin-превью как сотрудник (previewAs),
  //    либо viewer по share-ссылке (isShared=true → read-only режим)
  viewer: Viewer | null

  // Сгенерированные админом share-ссылки (история)
  shareLinks: Array<{ token: string; payload: SharePayload; createdAt: number }>

  // Активные зрители — те, кто перешёл по share-ссылке.
  // Появляются у админа после того, как зритель открыл ссылку и представился.
  // Persist в localStorage, чтобы переживать reload.
  activeViewers: ActiveViewer[]

  // Когда share-ссылка открыта без name — нужно спросить имя.
  // Этот флаг показывает, что ждём ввода имени от зрителя.
  pendingShareToken: string | null

  // Действия
  login: (name: string) => void
  logout: () => void
  openCatalog: () => void
  closeFlow: () => void
  addWidget: (id: WidgetId) => void
  removeWidget: (id: WidgetId) => void
  requestAuth: (service: ServiceId) => void
  requestPurchase: (service: ServiceId) => void
  completePurchase: (service: ServiceId) => void
  completeAuth: (service: ServiceId, success: boolean) => void
  logEvent: (step: ScenarioStep, message: string, detail?: string) => void

  // ===== Действия для ролей/шаринга =====
  openSharePanel: () => void
  previewAs: (employee: Employee) => void
  exitPreview: () => void
  generateShareLink: (role: Exclude<ViewerRole, 'admin'>, deptId: DepartmentId, name?: string) => string
  revokeShareLink: (token: string) => void
  loadFromShareToken: (token: string, phone: string, name?: string) => 'ok' | 'need-info'
  cancelPendingShare: () => void
  clearActiveViewers: () => void
  refreshActiveViewers: () => void

  reset: () => void
}

const initialServiceStatuses: Record<ServiceId, ServiceStatus> = {
  oats: 'disconnected',
  'beeline-crm': 'disconnected',
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  currentStep: 'login',
  isLoggedIn: false,
  userName: '',
  addedWidgets: [],
  serviceStatuses: { ...initialServiceStatuses },
  activeFlow: { type: 'none' },
  scenarioLog: [],
  viewer: null,
  shareLinks: [],
  activeViewers: loadActiveViewersFromStorage(),
  pendingShareToken: null,

  login: (name: string) => {
    set({
      isLoggedIn: true,
      userName: name,
      currentStep: 'empty-dashboard',
    })
    get().logEvent(
      'login',
      `Вход выполнен: ${name}`,
      'Состояние «без виджетов» — дашборд пуст, доступен каталог.',
    )
  },

  logout: () => {
    get().reset()
  },

  openCatalog: () => {
    set({ activeFlow: { type: 'catalog' }, currentStep: 'widget-catalog' })
    get().logEvent(
      'widget-catalog',
      'Открыт каталог виджетов',
      'Доступны виджеты от ОАТС, билайнСРМ и собственные виджеты дашборда.',
    )
  },

  closeFlow: () => {
    set({ activeFlow: { type: 'none' } })
  },

  addWidget: (id: WidgetId) => {
    const { addedWidgets, serviceStatuses } = get()
    if (addedWidgets.includes(id)) {
      set({ activeFlow: { type: 'none' } })
      return
    }
    const widget = WIDGETS[id]
    const newAddedWidgets = [...addedWidgets, id]
    set({
      addedWidgets: newAddedWidgets,
      activeFlow: { type: 'none' },
      currentStep: 'widget-on-dashboard',
    })

    let step: ScenarioStep = 'widget-on-dashboard'
    let msg = `Виджет «${widget.title}» добавлен на дашборд`
    let detail: string | undefined
    if (widget.service !== 'self') {
      const svc = serviceStatuses[widget.service]
      if (svc === 'authorized') {
        detail = `Сервис ${SERVICES[widget.service].name} уже подключён — показываем реальные данные.`
      } else {
        detail = `Сервис ${SERVICES[widget.service].name} не подключён — показываем синтетику с основным CTA «Подключить сервис» (fallback — покупка).`
        step = 'auth-required'
      }
    } else {
      detail = 'Собственный виджет дашборда — данные доступны сразу.'
    }
    get().logEvent(step, msg, detail)
  },

  removeWidget: (id: WidgetId) => {
    set((s) => ({ addedWidgets: s.addedWidgets.filter((w) => w !== id) }))
  },

  requestAuth: (service: ServiceId) => {
    set({ activeFlow: { type: 'auth', service }, currentStep: 'auth-flow' })
    get().logEvent(
      'auth-flow',
      `Открыта форма подключения сервиса ${SERVICES[service].name}`,
      'Основной сценарий: пользователь входит со своими логином и паролем. Если их нет или не удалось войти — предложим покупку сервиса.',
    )
  },

  requestPurchase: (service: ServiceId) => {
    set({ activeFlow: { type: 'purchase', service }, currentStep: 'purchase-flow' })
    get().logEvent(
      'purchase-flow',
      `Запущен fallback-сценарий покупки сервиса ${SERVICES[service].name} (CJ)`,
      `Цена: ${SERVICES[service].price}. Предлагается, если у пользователя нет логина/пароля или не удалось войти.`,
    )
  },

  completePurchase: (service: ServiceId) => {
    // Покупка сервиса создаёт аккаунт — сервис сразу становится авторизованным
    set((s) => ({
      serviceStatuses: {
        ...s.serviceStatuses,
        [service]: 'authorized',
      },
      activeFlow: { type: 'none' },
      currentStep: 'success',
    }))
    get().logEvent(
      'success',
      `Покупка сервиса ${SERVICES[service].name} завершена — аккаунт создан`,
      'После покупки сервис автоматически подключается, виджеты переключаются с синтетики на реальные данные.',
    )
  },

  completeAuth: (service: ServiceId, success: boolean) => {
    if (success) {
      set((s) => ({
        serviceStatuses: {
          ...s.serviceStatuses,
          [service]: 'authorized',
        },
        activeFlow: { type: 'none' },
        currentStep: 'success',
      }))
      get().logEvent(
        'success',
        `Подключение к сервису ${SERVICES[service].name} выполнено успешно`,
        'Виджеты этого сервиса переключаются с синтетики на реальные данные.',
      )
    } else {
      // Остаёмся в окне авторизации — пользователь может повторить вход
      // или выбрать fallback «Купить сервис».
      set({ activeFlow: { type: 'auth', service }, currentStep: 'auth-flow' })
      get().logEvent(
        'auth-flow',
        `Не удалось подключиться к сервису ${SERVICES[service].name}`,
        'Показываем ошибку и усиливаем альтернативу: «Нет аккаунта? Купить сервис».',
      )
    }
  },

  logEvent: (step, message, detail) => {
    set((s) => ({
      scenarioLog: [
        ...s.scenarioLog,
        { ts: Date.now(), step, message, detail },
      ],
    }))
  },

  // ===== Роли и шаринг =====
  openSharePanel: () => {
    set({ activeFlow: { type: 'share' } })
    get().logEvent(
      'widget-on-dashboard',
      'Открыта панель «Поделиться дашбордом»',
      'Админ может выбрать сотрудника, посмотреть превью от его имени или сгенерировать share-ссылку.',
    )
  },

  previewAs: (employee: Employee) => {
    const viewer: Viewer = {
      role: employee.role,
      userId: employee.id,
      name: employee.name,
      deptId: employee.deptId,
      isShared: false,
    }
    set({ viewer, activeFlow: { type: 'none' } })
    const roleLabel = ROLE_LABELS[employee.role]
    get().logEvent(
      'widget-on-dashboard',
      `Превью как ${roleLabel}: ${employee.name}`,
      `Применён RLS: ${employee.role === 'director' ? 'видит все отделы' : employee.role === 'manager' ? `видит отдел «${DEPARTMENTS[employee.deptId].name}»` : 'видит только свои данные'}.`,
    )
  },

  exitPreview: () => {
    set({ viewer: null })
    get().logEvent(
      'widget-on-dashboard',
      'Выход из режима превью — возврат к виду админа',
      'Админ снова видит все данные с полными правами.',
    )
  },

  generateShareLink: (role: Exclude<ViewerRole, 'admin'>, deptId: DepartmentId, name?: string) => {
    const payload: SharePayload = {
      role,
      deptId,
      name,
      iat: Date.now(),
    }
    const token = encodeShareToken(payload)
    set((s) => ({
      shareLinks: [
        { token, payload, createdAt: payload.iat },
        ...s.shareLinks,
      ],
    }))
    get().logEvent(
      'widget-on-dashboard',
      `Создана share-ссылка: роль=${ROLE_LABELS[role]}, отдел=${DEPARTMENTS[deptId].name}${name ? `, имя=${name}` : ' (без имени — спросим при открытии)'}`,
      `Ссылка содержит встроенный контекст: роль + отдел. RLS будет применён при открытии.`,
    )
    return token
  },

  revokeShareLink: (token: string) => {
    set((s) => ({ shareLinks: s.shareLinks.filter((l) => l.token !== token) }))
    get().logEvent(
      'widget-on-dashboard',
      'Share-ссылка отозвана',
      'Доступ по этой ссылке больше недействителен (в реальной системе — помечаем как revoked на бэке).',
    )
  },

  loadFromShareToken: (token: string, phone: string, name?: string) => {
    const payload = decodeShareToken(token)
    if (!payload) return 'ok' as const // невалидный токен — игнорируем

    const finalPhone = phone.trim()
    if (!finalPhone) {
      set({ pendingShareToken: token })
      return 'need-info' as const
    }

    // Если в токене есть имя — используем его, иначе из аргумента, иначе пусто
    const finalName = payload.name?.trim() || name?.trim() || ''

    const viewer: Viewer = {
      role: payload.role,
      userId: `share-${token.slice(-8)}`,
      name: finalName || finalPhone,  // если имени нет — показываем телефон как имя
      phone: finalPhone,
      deptId: payload.deptId,
      isShared: true,
      shareToken: token,
    }

    // Добавляем/обновляем в activeViewers + persist в localStorage
    const now = Date.now()
    set((s) => {
      const existing = s.activeViewers.find(
        (v) => v.shareTokenShort === token.slice(-8) && v.phone === finalPhone,
      )
      let activeViewers: ActiveViewer[]
      if (existing) {
        activeViewers = s.activeViewers.map((v) =>
          v === existing ? { ...v, lastSeenAt: now, name: finalName || v.name } : v,
        )
      } else {
        const newViewer: ActiveViewer = {
          sessionId: `s-${now}-${Math.random().toString(36).slice(2, 8)}`,
          shareTokenShort: token.slice(-8),
          role: payload.role,
          deptId: payload.deptId,
          name: finalName || undefined,
          phone: finalPhone,
          firstSeenAt: now,
          lastSeenAt: now,
        }
        activeViewers = [newViewer, ...s.activeViewers].slice(0, 50) // максимум 50
      }
      saveActiveViewersToStorage(activeViewers)
      return {
        viewer,
        isLoggedIn: true,
        userName: finalName || finalPhone,
        currentStep: 'widget-on-dashboard',
        addedWidgets: ['oats-calls', 'beeline-leads', 'analytics'],
        serviceStatuses: {
          oats: 'authorized',
          'beeline-crm': 'authorized',
        },
        pendingShareToken: null,
        activeViewers,
      }
    })
    return 'ok' as const
  },

  cancelPendingShare: () => {
    set({ pendingShareToken: null })
  },

  clearActiveViewers: () => {
    set({ activeViewers: [] })
    saveActiveViewersToStorage([])
    get().logEvent(
      'widget-on-dashboard',
      'Список активных зрителей очищен',
      'Локальная история просмотров удалена. На серверной стороне эти записи хранятся отдельно.',
    )
  },

  refreshActiveViewers: () => {
    // Перечитываем из localStorage — актуально, если другая вкладка добавила зрителя
    const fresh = loadActiveViewersFromStorage()
    set({ activeViewers: fresh })
  },

  reset: () => {
    set({
      currentStep: 'login',
      isLoggedIn: false,
      userName: '',
      addedWidgets: [],
      serviceStatuses: { ...initialServiceStatuses },
      activeFlow: { type: 'none' },
      scenarioLog: [],
      viewer: null,
      shareLinks: [],
      pendingShareToken: null,
      // activeViewers НЕ сбрасываем — они переживают logout,
      // т.к. это история просмотров, видимая админу.
    })
  },
}))

const ROLE_LABELS: Record<ViewerRole, string> = {
  admin: 'админ',
  director: 'директор',
  manager: 'менеджер',
  employee: 'сотрудник',
}

// ===== localStorage helpers для activeViewers =====
// Храним активных зрителей между сессиями — чтобы админ видел, кто открывал ссылки

const STORAGE_KEY = 'dashboard-active-viewers'

function loadActiveViewersFromStorage(): ActiveViewer[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as ActiveViewer[]
  } catch {
    return []
  }
}

function saveActiveViewersToStorage(viewers: ActiveViewer[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(viewers))
  } catch {
    // ignore
  }
}
