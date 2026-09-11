'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useDashboardStore } from '@/store/dashboard-store'
import { storiesForViewer, Story } from '@/lib/dashboard/stories'
import { ServiceId, SERVICES } from '@/lib/dashboard/types'

export function StoriesCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const viewer = useDashboardStore((s) => s.viewer)
  const requestPurchase = useDashboardStore((s) => s.requestPurchase)
  const openServiceVerify = useDashboardStore((s) => s.openServiceVerify)
  const serviceStatuses = useDashboardStore((s) => s.serviceStatuses)
  const serviceBindings = viewer?.serviceBindings

  // Выбираем сторис для текущего зрителя
  const isShared = !!viewer?.isShared
  const availableServices = isShared
    ? (Object.keys(SERVICES) as ServiceId[]).filter(
        (sv) => serviceBindings?.[sv] !== 'unavailable',
      )
    : undefined
  const stories = storiesForViewer(isShared, availableServices)

  if (stories.length === 0) return null

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const delta = dir === 'left' ? -280 : 280
    el.scrollBy({ left: delta, behavior: 'smooth' })
  }

  // Обработчик клика на сторис
  const handleClick = (story: Story) => {
    if (!story.service) return
    const svc = story.service
    if (isShared) {
      // Зритель по share-ссылке: если сервис ещё не verified — открыть форму подтверждения,
      // иначе — показать сообщение, что сервис уже подключён (ничего не делаем).
      if (serviceBindings?.[svc] !== 'verified') {
        openServiceVerify(svc)
      }
    } else {
      // Админ: открываем флоу покупки
      requestPurchase(svc)
    }
  }

  return (
    <div className="space-y-2">
      {/* Заголовок секции */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Рекомендуем
          </h3>
        </div>
        <span className="text-[10px] text-slate-400">
          {stories.length} {stories.length === 1 ? 'предложение' : 'предложений'}
        </span>
      </div>

      <div className="relative">
        {/* Левая стрелка */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-slate-600 transition-all"
          aria-label="Назад"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Карусель */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scroll-smooth py-1 px-8 no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} onClick={() => handleClick(story)} />
          ))}
        </div>

        {/* Правая стрелка */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-slate-600 transition-all"
          aria-label="Вперёд"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <style jsx>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </div>
  )
}

function StoryCard({ story, onClick }: { story: Story; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative shrink-0 w-[260px] h-[120px] rounded-xl bg-gradient-to-br ${story.gradient} p-3 text-left text-white overflow-hidden group`}
    >
      {/* Декоративный круг для визуального якоря */}
      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 -left-4 w-16 h-16 rounded-full bg-white/5" />

      {/* Контент */}
      <div className="relative h-full flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xl leading-none">{story.emoji}</span>
            <span className="text-[10px] uppercase tracking-wider font-semibold opacity-90">
              {kindLabel(story.kind)}
            </span>
          </div>
          <h4 className="text-sm font-bold leading-tight drop-shadow-sm">
            {story.title}
          </h4>
          <p className="text-[11px] opacity-90 mt-0.5 leading-snug line-clamp-2 drop-shadow-sm">
            {story.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[11px] font-semibold underline-offset-2 group-hover:underline">
            {story.cta}
          </span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </motion.button>
  )
}

function kindLabel(kind: string): string {
  switch (kind) {
    case 'service-purchase': return 'Сервис'
    case 'service-upsell': return 'Дополнительно'
    case 'discount': return 'Спецпредложение'
    case 'case-study': return 'Кейс'
    default: return ''
  }
}
