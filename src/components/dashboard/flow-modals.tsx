'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  X,
  ShoppingCart,
  LogIn,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import { useDashboardStore } from '@/store/dashboard-store'
import { SERVICES, ServiceId } from '@/lib/dashboard/types'

export function FlowModals() {
  const activeFlow = useDashboardStore((s) => s.activeFlow)

  if (activeFlow.type === 'purchase') {
    return <PurchaseModal service={activeFlow.service} />
  }
  if (activeFlow.type === 'auth') {
    return <AuthModal service={activeFlow.service} />
  }
  if (activeFlow.type === 'catalog') {
    return null // handled separately
  }
  return null
}

function PurchaseModal({ service }: { service: ServiceId }) {
  const svc = SERVICES[service]
  const closeFlow = useDashboardStore((s) => s.closeFlow)
  const completePurchase = useDashboardStore((s) => s.completePurchase)
  const [step, setStep] = useState<'offer' | 'payment' | 'done'>('offer')
  const [processing, setProcessing] = useState(false)

  return (
    <ModalShell onClose={closeFlow} maxWidth="max-w-md">
      <ModalHeader
        icon={<ShoppingCart className="w-5 h-5 text-purple-600" />}
        title={`Покупка сервиса ${svc.name}`}
        subtitle="CJ — сценарий продаж и ремаркетинга"
      />

      {step === 'offer' && (
        <div className="p-5 space-y-4">
          <div className="rounded-lg bg-purple-50 border border-purple-200 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Спецпредложение</span>
            </div>
            <p className="text-xs text-purple-800 leading-relaxed">
              Сервис {svc.name} ещё не подключён. Купите его, чтобы открыть
              доступ к виджетам с реальными данными.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-900">{svc.name}</span>
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">{svc.price}</Badge>
            </div>
            <p className="text-xs text-slate-500">{svc.description}</p>
            <ul className="space-y-1 pt-2">
              {svc.features.map((f) => (
                <li key={f} className="text-xs text-slate-600 flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1 h-10" onClick={closeFlow}>
              Позже
            </Button>
            <Button className="flex-1 h-10" onClick={() => setStep('payment')}>
              <CreditCard className="w-4 h-4 mr-2" />
              Оформить подписку
            </Button>
          </div>

          <p className="text-[11px] text-slate-400 text-center pt-1">
            Если отказаться — отложенный ремаркетинг повторит предложение через N дней.
          </p>
        </div>
      )}

      {step === 'payment' && (
        <div className="p-5 space-y-4">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Номер карты</Label>
              <Input placeholder="4242 4242 4242 4242" defaultValue="4242 4242 4242 4242" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Срок</Label>
                <Input placeholder="12/27" defaultValue="12/27" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">CVC</Label>
                <Input placeholder="123" defaultValue="123" />
              </div>
            </div>
          </div>

          <div className="rounded-md bg-slate-50 p-3 flex items-center justify-between">
            <span className="text-xs text-slate-600">{svc.name} — подписка</span>
            <span className="text-sm font-bold text-slate-900">{svc.price}</span>
          </div>

          <Button
            className="w-full h-10"
            disabled={processing}
            onClick={() => {
              setProcessing(true)
              setTimeout(() => {
                setProcessing(false)
                setStep('done')
              }, 900)
            }}
          >
            {processing ? 'Обработка...' : `Оплатить ${svc.price}`}
          </Button>
        </div>
      )}

      {step === 'done' && (
        <div className="p-5 space-y-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto"
          >
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </motion.div>
          <div>
            <h4 className="font-semibold text-slate-900">Покупка завершена</h4>
            <p className="text-xs text-slate-500 mt-1">
              Сервис {svc.name} теперь «куплен». Запускаем авторизацию...
            </p>
          </div>
          <Button
            className="w-full h-10"
            onClick={() => completePurchase(service)}
          >
            <LogIn className="w-4 h-4 mr-2" />
            Перейти к авторизации
          </Button>
        </div>
      )}
    </ModalShell>
  )
}

function AuthModal({ service }: { service: ServiceId }) {
  const svc = SERVICES[service]
  const closeFlow = useDashboardStore((s) => s.closeFlow)
  const completeAuth = useDashboardStore((s) => s.completeAuth)
  const requestPurchase = useDashboardStore((s) => s.requestPurchase)
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const handleSubmit = (success: boolean) => {
    setProcessing(true)
    setError(null)
    setTimeout(() => {
      setProcessing(false)
      if (success) {
        completeAuth(service, true)
      } else {
        setError('Не удалось авторизоваться. Проверьте данные или купите сервис.')
      }
    }, 700)
  }

  return (
    <ModalShell onClose={closeFlow} maxWidth="max-w-md">
      <ModalHeader
        icon={<LogIn className="w-5 h-5 text-amber-600" />}
        title={`Авторизация в ${svc.name}`}
        subtitle="Подключите сервис, чтобы виджет показал реальные данные"
      />

      <div className="p-5 space-y-4">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Логин</Label>
            <Input
              placeholder="user@example.com"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Пароль</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-rose-800">Ошибка авторизации</p>
              <p className="text-[11px] text-rose-700 mt-0.5">
                Проверьте данные или оформите покупку сервиса.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="h-10"
            disabled={processing}
            onClick={() => handleSubmit(false)}
          >
            Симулировать ошибку
          </Button>
          <Button
            className="h-10"
            disabled={processing}
            onClick={() => handleSubmit(true)}
          >
            {processing ? 'Проверка...' : 'Войти успешно'}
          </Button>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <p className="text-[11px] text-slate-500 mb-2">
            Альтернатива, если авторизация не удалась:
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-xs text-purple-700 hover:text-purple-800"
            onClick={() => requestPurchase(service)}
          >
            <ShoppingCart className="w-3.5 h-3.5 mr-1" />
            Купить сервис через CJ
          </Button>
        </div>
      </div>
    </ModalShell>
  )
}

function ModalShell({
  children,
  onClose,
  maxWidth,
}: {
  children: React.ReactNode
  onClose: () => void
  maxWidth?: string
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth ?? 'max-w-lg'} max-h-[90vh] flex flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
      <button
        className="absolute top-3 right-3 w-8 h-8 rounded-md hover:bg-black/5 flex items-center justify-center text-white/80"
        onClick={onClose}
        aria-label="Закрыть"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

function ModalHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  subtitle?: string
}) {
  return (
    <div className="p-5 border-b border-slate-100 flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-slate-900 text-base">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}
