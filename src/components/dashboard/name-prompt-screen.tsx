'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Phone,
  User,
  ArrowRight,
  Building2,
  Crown,
  Users,
  LogIn,
} from 'lucide-react'
import { useDashboardStore } from '@/store/dashboard-store'
import { DEPARTMENTS, ViewerRole } from '@/lib/dashboard/types'
import { formatPhone, isValidPhone } from '@/lib/dashboard/phone'

const ROLE_META: Record<Exclude<ViewerRole, 'admin'>, { label: string; icon: any }> = {
  director: { label: 'Директор', icon: Crown },
  manager: { label: 'Менеджер', icon: Users },
  employee: { label: 'Сотрудник', icon: User },
}

export function NamePromptScreen() {
  const pendingShareToken = useDashboardStore((s) => s.pendingShareToken)
  const loadFromShareToken = useDashboardStore((s) => s.loadFromShareToken)
  const cancelPendingShare = useDashboardStore((s) => s.cancelPendingShare)

  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [touched, setTouched] = useState(false)

  const handlePhoneChange = useCallback((raw: string) => {
    setTouched(true)
    const { value } = formatPhone(raw)
    setPhone(value)
  }, [])

  if (!pendingShareToken) return null

  // Декодируем payload чтобы показать контекст
  let role: Exclude<ViewerRole, 'admin'> = 'employee'
  let deptId: keyof typeof DEPARTMENTS = 'sales'
  try {
    const b64 = pendingShareToken.replace(/-/g, '+').replace(/_/g, '/')
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4)
    const json = decodeURIComponent(escape(atob(padded)))
    const payload = JSON.parse(json)
    role = payload.role
    deptId = payload.deptId
  } catch {
    // ignore
  }

  const roleMeta = ROLE_META[role]
  const RoleIcon = roleMeta.icon
  const deptName = role === 'director' ? 'Все отделы' : DEPARTMENTS[deptId].name

  const phoneValid = isValidPhone(phone)
  const showPhoneError = touched && !phoneValid && phone.length > 0

  const handleSubmit = () => {
    if (!phoneValid) {
      setTouched(true)
      return
    }
    loadFromShareToken(pendingShareToken, phone, name.trim() || undefined)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-fuchsia-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 shadow-lg border-slate-200">
          <div className="flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center">
              <LogIn className="w-8 h-8 text-purple-600" />
            </div>

            <div className="text-center space-y-1.5">
              <h1 className="text-xl font-bold text-slate-900">Вход в дашборд</h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                Вы перешли по share-ссылке от администратора.
                Введите номер телефона для входа — он отобразится у админа
                в списке активных зрителей.
              </p>
            </div>

            {/* Контекст ссылки */}
            <div className="w-full rounded-lg border border-slate-200 bg-slate-50/60 p-3 space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <RoleIcon className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-600">Ваша роль по ссылке:</span>
                <span className="font-semibold text-slate-900">{roleMeta.label}</span>
              </div>
              {role !== 'employee' && (
                <div className="flex items-center gap-2 text-xs">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-600">Отдел:</span>
                  <span className="font-semibold text-slate-900">{deptName}</span>
                </div>
              )}
              {role === 'employee' && (
                <div className="flex items-center gap-2 text-xs">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-600">Доступ:</span>
                  <span className="font-semibold text-slate-900">только свои данные</span>
                </div>
              )}
            </div>

            <div className="w-full space-y-3">
              {/* Phone — обязательный */}
              <div className="space-y-1.5">
                <Label htmlFor="viewer-phone" className="text-xs text-slate-600">
                  Номер телефона <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    id="viewer-phone"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+7 (___) ___-__-__"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && phoneValid && handleSubmit()}
                    className={`pl-9 ${showPhoneError ? 'border-rose-400 focus-visible:ring-rose-200' : ''}`}
                    autoFocus
                  />
                </div>
                {showPhoneError ? (
                  <p className="text-[11px] text-rose-600 leading-snug">
                    Введите номер полностью — 10 цифр после +7
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Маска: +7 (XXX) XXX-XX-XX · используется как логин
                  </p>
                )}
              </div>

              {/* Name — опциональный */}
              <div className="space-y-1.5">
                <Label htmlFor="viewer-name" className="text-xs text-slate-600">
                  Ваше имя <span className="text-slate-400">(необязательно)</span>
                </Label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    id="viewer-name"
                    placeholder="Например, Анна Соколова"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && phoneValid && handleSubmit()}
                    className="pl-9"
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Если не указать — у админа будет виден только номер телефона
                </p>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!phoneValid}
                className="w-full h-11 text-sm font-medium"
                size="lg"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Открыть дашборд
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <button
                onClick={cancelPendingShare}
                className="w-full text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
              >
                Отмена — войти как админ
              </button>
            </div>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              После входа вы сможете добавлять виджеты на дашборд.
              <br />
              Данные в виджетах будут отфильтрованы по вашей роли (RLS).
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
