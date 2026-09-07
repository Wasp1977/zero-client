'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { UserPlus, ArrowRight, Building2, Crown, Users, User } from 'lucide-react'
import { useDashboardStore } from '@/store/dashboard-store'
import { DEPARTMENTS, ViewerRole } from '@/lib/dashboard/types'

const ROLE_META: Record<Exclude<ViewerRole, 'admin'>, { label: string; icon: any }> = {
  director: { label: 'Директор', icon: Crown },
  manager: { label: 'Менеджер', icon: Users },
  employee: { label: 'Сотрудник', icon: User },
}

export function NamePromptScreen() {
  const pendingShareToken = useDashboardStore((s) => s.pendingShareToken)
  const loadFromShareToken = useDashboardStore((s) => s.loadFromShareToken)
  const cancelPendingShare = useDashboardStore((s) => s.cancelPendingShare)

  const [name, setName] = useState('')

  if (!pendingShareToken) return null

  // Декодируем payload чтобы показать контекст
  let role: Exclude<ViewerRole, 'admin'> = 'employee'
  let deptId: keyof typeof DEPARTMENTS = 'sales'
  try {
    // Используем ту же логику, что в store
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

  const handleSubmit = () => {
    if (!name.trim()) return
    loadFromShareToken(pendingShareToken, name.trim())
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
              <UserPlus className="w-8 h-8 text-purple-600" />
            </div>

            <div className="text-center space-y-1.5">
              <h1 className="text-xl font-bold text-slate-900">Представьтесь, пожалуйста</h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                Вы перешли по share-ссылке от администратора дашборда.
                Введите ваше имя — оно появится у админа в списке активных зрителей.
              </p>
            </div>

            {/* Контекст ссылки */}
            <div className="w-full rounded-lg border border-slate-200 bg-slate-50/60 p-3 space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <RoleIcon className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-600">Ваша роль по ссылке:</span>
                <span className="font-semibold text-slate-900">{roleMeta.label}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-600">Отдел:</span>
                <span className="font-semibold text-slate-900">{deptName}</span>
              </div>
            </div>

            <div className="w-full space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="viewer-name" className="text-xs text-slate-600">
                  Ваше имя
                </Label>
                <Input
                  id="viewer-name"
                  placeholder="Например, Анна Соколова"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  autoFocus
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!name.trim()}
                className="w-full h-11 text-sm font-medium"
                size="lg"
              >
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
              После входа вы увидите дашборд в режиме просмотра (read-only).
              <br />
              Данные отфильтрованы по вашей роли (RLS).
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
