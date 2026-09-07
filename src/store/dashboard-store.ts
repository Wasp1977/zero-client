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
