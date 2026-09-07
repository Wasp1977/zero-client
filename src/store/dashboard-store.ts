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
} from '@/lib/dashboard/types'

interface DashboardState {
  // Текущий шаг сценария (для индикатора прогресса)
  currentStep: ScenarioStep

  // Статус входа пользователя
  isLoggedIn: boolean
  userName: string

  // Подключённые на дашборд виджеты (id виджетов, которые пользователь добавил)
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

  // Лог сценария
  scenarioLog: ScenarioEvent[]

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
  reset: () => void
}

const initialServiceStatuses: Record<ServiceId, ServiceStatus> = {
  oats: 'not-owned',
  'beeline-crm': 'not-owned',
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  currentStep: 'login',
  isLoggedIn: false,
  userName: '',
  addedWidgets: [],
  serviceStatuses: { ...initialServiceStatuses },
  activeFlow: { type: 'none' },
  scenarioLog: [],

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
        detail = `Сервис ${SERVICES[widget.service].name} уже авторизован — показываем реальные данные.`
      } else if (svc === 'owned') {
        detail = `Сервис ${SERVICES[widget.service].name} куплен, но не авторизован — показываем синтетику с CTA на авторизацию.`
        step = 'auth-required'
      } else {
        detail = `Сервис ${SERVICES[widget.service].name} не куплен — показываем синтетику с CTA на покупку.`
        step = 'purchase-required'
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
      `Запрошена авторизация в сервисе ${SERVICES[service].name}`,
      'Пользователь нажал CTA «Подключите сервис» на виджете с синтетическими данными.',
    )
  },

  requestPurchase: (service: ServiceId) => {
    set({ activeFlow: { type: 'purchase', service }, currentStep: 'purchase-flow' })
    get().logEvent(
      'purchase-flow',
      `Запущен сценарий продаж (CJ) для сервиса ${SERVICES[service].name}`,
      `Цена: ${SERVICES[service].price}. Если покупка не состоится — будет отложенный ремаркетинг.`,
    )
  },

  completePurchase: (service: ServiceId) => {
    set((s) => ({
      serviceStatuses: {
        ...s.serviceStatuses,
        [service]: 'owned',
      },
      activeFlow: { type: 'auth', service },
      currentStep: 'auth-flow',
    }))
    get().logEvent(
      'purchase-flow',
      `Покупка сервиса ${SERVICES[service].name} завершена`,
      'Сервис переведён в статус «куплен». Запускается авторизация.',
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
        `Авторизация в сервисе ${SERVICES[service].name} прошла успешно`,
        'Виджеты этого сервиса переключаются с синтетики на реальные данные.',
      )
    } else {
      set((s) => ({
        serviceStatuses: {
          ...s.serviceStatuses,
          [service]: s.serviceStatuses[service] === 'owned' ? 'owned' : 'owned',
        },
        activeFlow: { type: 'purchase', service },
        currentStep: 'purchase-flow',
      }))
      get().logEvent(
        'auth-flow',
        `Авторизация в сервисе ${SERVICES[service].name} не удалась`,
        'Предлагается альтернатива: покупка/ремаркетинг через CJ.',
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

  reset: () => {
    set({
      currentStep: 'login',
      isLoggedIn: false,
      userName: '',
      addedWidgets: [],
      serviceStatuses: { ...initialServiceStatuses },
      activeFlow: { type: 'none' },
      scenarioLog: [],
    })
  },
}))
