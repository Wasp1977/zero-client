// Контент для «продающих» сторис — мини-баннеров с рекламой сервисов.
// Аналог Telegram Stories / анонсов фильмов: горизонтальная лента карточек,
// каждая из которых ведёт к целевому действию (купить / подключить / узнать больше).

import { ServiceId } from './types'

export type StoryKind =
  | 'service-purchase'   // прямая продажа сервиса
  | 'service-upsell'     // допродажа к уже подключённому
  | 'discount'           // скидка / спецпредложение
  | 'case-study'         // кейс / социальное доказательство

export interface Story {
  id: string
  kind: StoryKind
  title: string
  subtitle: string
  cta: string
  // Какой сервис продвигаем (для открытия соответствующего флоу)
  service?: ServiceId
  // Цветовая гамма баннера (Tailwind-классы)
  gradient: string
  // Эмодзи-иконка для визуального якоря
  emoji: string
  // Только для неавторизованных / только для авторизованных / для всех
  audience: 'all' | 'admin-only' | 'viewer-only'
}

export const STORIES: Story[] = [
  {
    id: 'story-oats-purchase',
    kind: 'service-purchase',
    title: 'ОАТС',
    subtitle: 'Облачная АТС: приём и маршрутизация звонков через виджеты дашборда',
    cta: 'Подключить за 990 ₽',
    service: 'oats',
    gradient: 'from-amber-400 via-orange-500 to-rose-500',
    emoji: '📞',
    audience: 'all',
  },
  {
    id: 'story-crm-purchase',
    kind: 'service-purchase',
    title: 'билайнСРМ',
    subtitle: 'CRM-система: лиды, сделки, воронка — всё в одном дашборде',
    cta: 'Подключить за 1490 ₽',
    service: 'beeline-crm',
    gradient: 'from-yellow-400 via-amber-500 to-orange-600',
    emoji: '💼',
    audience: 'all',
  },
  {
    id: 'story-bundle-discount',
    kind: 'discount',
    title: 'Комбо: ОАТС + СРМ',
    subtitle: 'Подключите оба сервиса вместе — скидка 20% и единый счёт',
    cta: 'Взять комбо',
    service: 'oats',
    gradient: 'from-fuchsia-500 via-purple-500 to-indigo-500',
    emoji: '🔥',
    audience: 'all',
  },
  {
    id: 'story-case-retail',
    kind: 'case-study',
    title: 'Кейс: ритейл +35%',
    subtitle: 'Сеть магазинов подняла конверсию звонков на 35% после подключения ОАТС',
    cta: 'Читать кейс',
    service: 'oats',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    emoji: '📈',
    audience: 'all',
  },
  {
    id: 'story-case-services',
    kind: 'case-study',
    title: 'Кейс: B2B +50 лидов',
    subtitle: 'IT-компания автоматизировала воронку: 50 новых лидов в неделю через СРМ',
    cta: 'Как они это сделали',
    service: 'beeline-crm',
    gradient: 'from-sky-400 via-blue-500 to-indigo-600',
    emoji: '🚀',
    audience: 'all',
  },
  {
    id: 'story-trial-oats',
    kind: 'discount',
    title: '7 дней бесплатно',
    subtitle: 'Попробуйте ОАТС без оплаты — все виджеты откроются на неделю',
    cta: 'Активировать триал',
    service: 'oats',
    gradient: 'from-rose-400 via-pink-500 to-fuchsia-600',
    emoji: '🎁',
    audience: 'all',
  },
]

// Хелпер: какие сторис показывать конкретному зрителю.
// Для админа — все. Для share-link зрителя — только те, чьи сервисы ему доступны
// (он не может купить сервис, к которому нет доступа по ссылке).
export function storiesForViewer(
  isShared: boolean,
  availableServices?: ServiceId[],
): Story[] {
  if (!isShared) {
    // Админ или adminPreview — видит все сторис
    return STORIES
  }
  // Share-link зритель — только сторис по доступным ему сервисам
  if (!availableServices || availableServices.length === 0) return []
  return STORIES.filter((s) => !s.service || availableServices.includes(s.service))
}
