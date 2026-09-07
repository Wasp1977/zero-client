'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  X,
  Share2,
  Copy,
  Check,
  Trash2,
  Crown,
  Users,
  User,
  Link2,
  Eye,
  Clock,
  Building2,
  PlusCircle,
  UserPlus,
  RefreshCw,
  Phone,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useDashboardStore } from '@/store/dashboard-store'
import {
  ActiveViewer,
  DEPARTMENTS,
  DepartmentId,
  ServiceId,
  SERVICES,
  ViewerRole,
} from '@/lib/dashboard/types'

type Role = Exclude<ViewerRole, 'admin'>

const ROLE_META: Record<Role, { label: string; color: string; icon: any; access: string }> = {
  director: {
    label: 'Директор',
    color: 'bg-purple-100 text-purple-700',
    icon: Crown,
    access: 'Видит все отделы и сотрудников',
  },
  manager: {
    label: 'Менеджер',
    color: 'bg-sky-100 text-sky-700',
    icon: Users,
    access: 'Видит только свой отдел',
  },
  employee: {
    label: 'Сотрудник',
    color: 'bg-slate-100 text-slate-700',
    icon: User,
    access: 'Видит только свои данные',
  },
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60_000) return 'только что'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} мин назад`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} ч назад`
  return new Date(ts).toLocaleDateString('ru-RU')
}

function CreateLinkForm() {
  const generateShareLink = useDashboardStore((s) => s.generateShareLink)
  const [role, setRole] = useState<Role>('employee')
  const [deptId, setDeptId] = useState<DepartmentId>('sales')
  const [name, setName] = useState('')
  // Сервисы — multi-select, по умолчанию оба включены
  const [services, setServices] = useState<ServiceId[]>(['oats', 'beeline-crm'])
  const [generatedToken, setGeneratedToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const toggleService = (sv: ServiceId) => {
    setServices((prev) =>
      prev.includes(sv) ? prev.filter((x) => x !== sv) : [...prev, sv],
    )
  }

  const handleCreate = () => {
    if (services.length === 0) return // нельзя создать ссылку без сервисов
    const token = generateShareLink(role, deptId, services, name.trim() || undefined)
    setGeneratedToken(token)
    setCopied(false)
  }

  const handleCopy = () => {
    if (!generatedToken) return
    const url = `${window.location.origin}/?share=${generatedToken}`
    navigator.clipboard?.writeText(url).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  // Для director (все отделы) и employee (только свои данные) — отдел не нужен
  const showDept = role === 'manager'

  // При смене роли на director/employee сбрасываем deptId на дефолт (не критично,
  // т.к. он не используется в этих ролях, но поддерживает консистентность)
  const handleRoleChange = (v: string) => {
    const newRole = v as Role
    setRole(newRole)
    if (newRole === 'director') setDeptId('all')
    else if (newRole === 'employee') setDeptId('sales') // дефолт, не используется в RLS
  }

  return (
    <Card className="p-4 border-slate-200">
      <div className="flex items-center gap-2 mb-3">
        <PlusCircle className="w-4 h-4 text-purple-600" />
        <h4 className="text-sm font-semibold text-slate-900">Создать новую ссылку</h4>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-600">Роль зрителя</Label>
          <Select value={role} onValueChange={handleRoleChange}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="director">Директор — видит все отделы</SelectItem>
              <SelectItem value="manager">Менеджер — видит свой отдел</SelectItem>
              <SelectItem value="employee">Сотрудник — видит только свои данные</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showDept && (
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-600">Отдел</Label>
            <Select
              value={deptId}
              onValueChange={(v) => setDeptId(v as DepartmentId)}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Отдел продаж</SelectItem>
                <SelectItem value="support">Отдел поддержки</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {role === 'employee' && (
          <div className="rounded-md bg-slate-50 border border-slate-200 px-2.5 py-1.5 text-[10px] text-slate-500 leading-snug">
            Для роли «Сотрудник» отдел не нужен — зритель видит только свои личные данные.
          </div>
        )}

        {role === 'director' && (
          <div className="rounded-md bg-slate-50 border border-slate-200 px-2.5 py-1.5 text-[10px] text-slate-500 leading-snug">
            Для роли «Директор» доступны все отделы и сотрудники компании.
          </div>
        )}

        {/* Multi-select сервисов */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-600">
            Доступ к сервисам <span className="text-rose-500">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {(['oats', 'beeline-crm'] as ServiceId[]).map((sv) => {
              const svc = SERVICES[sv]
              const checked = services.includes(sv)
              return (
                <button
                  key={sv}
                  type="button"
                  onClick={() => toggleService(sv)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors text-left ${
                    checked
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      checked
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {checked && <Check className="w-3 h-3" />}
                  </span>
                  <span className="truncate">{svc.name}</span>
                </button>
              )
            })}
          </div>
          <p className="text-[10px] text-slate-400 leading-snug">
            Зритель увидит только виджеты выбранных сервисов.
            Сначала — синтетика, после подтверждения личности — реальные данные.
          </p>
          {services.length === 0 && (
            <p className="text-[10px] text-rose-600 leading-snug">
              Выберите хотя бы один сервис
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-slate-600">
            Имя зрителя <span className="text-slate-400">(необязательно)</span>
          </Label>
          <Input
            placeholder="Зритель сам представится при открытии ссылки"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 text-sm"
          />
          <p className="text-[10px] text-slate-400 leading-snug">
            При открытии ссылки зритель обязательно вводит свой номер телефона (для логина),
            а имя — по желанию. У админа будет виден телефон + имя, или только телефон.
          </p>
        </div>

        <Button
          onClick={handleCreate}
          disabled={services.length === 0}
          className="w-full h-10"
          size="sm"
        >
          <Link2 className="w-4 h-4 mr-1.5" />
          Создать share-ссылку
        </Button>

        <AnimatePresence>
          {generatedToken && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <p className="text-[11px] font-medium text-emerald-800">
                    Ссылка создана — отправьте её сотруднику
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Input
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/?share=${generatedToken}`}
                    className="h-7 text-[10px] font-mono bg-white"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <Button
                    size="sm"
                    className="h-7 px-2 shrink-0 bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleCopy}
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
                <p className="text-[10px] text-emerald-700 leading-snug">
                  {copied ? 'Ссылка скопирована в буфер обмена' : 'Нажмите, чтобы скопировать'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  )
}

function ActiveViewersList() {
  const activeViewers = useDashboardStore((s) => s.activeViewers)
  const clearActiveViewers = useDashboardStore((s) => s.clearActiveViewers)

  if (activeViewers.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
        <UserPlus className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-xs text-slate-500 font-medium">Пока никто не открывал ваши ссылки</p>
        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed max-w-xs mx-auto">
          Создайте ссылку выше и отправьте сотруднику.
          Когда он перейдёт по ней и представится — он появится здесь.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-[10px] py-0">
          {activeViewers.length} {activeViewers.length === 1 ? 'зритель' : 'зрителей'}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-[11px] text-slate-500 hover:text-rose-600"
          onClick={clearActiveViewers}
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Очистить
        </Button>
      </div>

      {activeViewers.map((v) => (
        <ActiveViewerCard key={v.sessionId} viewer={v} />
      ))}
    </div>
  )
}

function ActiveViewerCard({ viewer }: { viewer: ActiveViewer }) {
  const meta = ROLE_META[viewer.role]
  const RoleIcon = meta.icon
  const deptName = viewer.role === 'director'
    ? 'Все отделы'
    : viewer.role === 'employee'
      ? 'Только свои данные'
      : DEPARTMENTS[viewer.deptId].name
  const displayName = viewer.name?.trim() || viewer.phone

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
    >
      <Card className="p-3 border-slate-200 hover:shadow-sm transition-shadow">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
            <RoleIcon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-semibold text-slate-900 truncate">{displayName}</span>
              <Badge variant="outline" className={`text-[10px] py-0 ${meta.color} border-transparent`}>
                {meta.label}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 flex-wrap">
              <span className="flex items-center gap-0.5">
                <Phone className="w-3 h-3" />
                {viewer.phone}
              </span>
              {viewer.name?.trim() && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="truncate">{viewer.name}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
              <span className="flex items-center gap-0.5">
                <Building2 className="w-3 h-3" />
                {deptName}
              </span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-0.5">
                <Clock className="w-3 h-3" />
                {relativeTime(viewer.lastSeenAt)}
              </span>
            </div>
            {/* Сервисы: verified (зелёный) / unverified (амбра) */}
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              {viewer.services.map((sv) => {
                const isVerified = viewer.verifiedServices.includes(sv)
                return (
                  <Badge
                    key={sv}
                    variant="outline"
                    className={`text-[9px] py-0 px-1 ${
                      isVerified
                        ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                        : 'border-amber-300 text-amber-700 bg-amber-50'
                    }`}
                  >
                    {isVerified ? (
                      <ShieldCheck className="w-2.5 h-2.5 mr-0.5" />
                    ) : (
                      <ShieldAlert className="w-2.5 h-2.5 mr-0.5" />
                    )}
                    {SERVICES[sv].name}
                  </Badge>
                )
              })}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">
              ссылка …{viewer.shareTokenShort}
            </p>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 shrink-0">
            <Eye className="w-3 h-3 mr-1" />
            активен
          </Badge>
        </div>
      </Card>
    </motion.div>
  )
}

function ShareLinksList() {
  const shareLinks = useDashboardStore((s) => s.shareLinks)
  const revokeShareLink = useDashboardStore((s) => s.revokeShareLink)

  if (shareLinks.length === 0) {
    return (
      <div className="text-[11px] text-slate-400 py-3 text-center border border-dashed border-slate-200 rounded-lg">
        Созданные ссылки появятся здесь
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      {shareLinks.map((link) => {
        const meta = ROLE_META[link.payload.role]
        const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/?share=${link.token}`
        return (
          <motion.div
            key={link.token}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-lg border border-slate-200 bg-slate-50/60 p-2.5"
          >
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={`text-[10px] py-0 ${meta.color} border-transparent`}>
                {meta.label}
              </Badge>
              <span className="text-[10px] text-slate-500">
                {link.payload.role === 'director'
                  ? 'Все отделы'
                  : link.payload.role === 'employee'
                    ? 'Только свои данные'
                    : DEPARTMENTS[link.payload.deptId].name}
              </span>
              {link.payload.name && (
                <span className="text-[10px] text-slate-400 truncate">
                  · {link.payload.name}
                </span>
              )}
              <button
                onClick={() => revokeShareLink(link.token)}
                className="text-slate-400 hover:text-rose-600 transition-colors ml-auto"
                aria-label="Отозвать ссылку"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-1 mb-1.5 flex-wrap">
              {link.payload.services.map((sv) => (
                <Badge
                  key={sv}
                  variant="outline"
                  className="text-[9px] py-0 px-1 border-slate-200 text-slate-600 bg-slate-50"
                >
                  {SERVICES[sv].name}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <Input
                readOnly
                value={url}
                className="h-7 text-[10px] font-mono bg-white"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 shrink-0"
                onClick={() => navigator.clipboard?.writeText(url).catch(() => {})}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export function SharePanel() {
  const closeFlow = useDashboardStore((s) => s.closeFlow)
  const activeViewers = useDashboardStore((s) => s.activeViewers)
  const refreshActiveViewers = useDashboardStore((s) => s.refreshActiveViewers)

  // Авто-refresh при открытии панели + подписка на storage-события
  // (другая вкладка добавила зрителя — обновляем этот список)
  useEffect(() => {
    refreshActiveViewers()
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'dashboard-active-viewers' || e.key === null) {
        refreshActiveViewers()
      }
    }
    window.addEventListener('storage', onStorage)
    // Polling каждые 2 секунды — на случай если storage-событие не сработало
    // (например, в рамках одной вкладки)
    const interval = setInterval(refreshActiveViewers, 2000)
    return () => {
      window.removeEventListener('storage', onStorage)
      clearInterval(interval)
    }
  }, [refreshActiveViewers])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Поделиться дашбордом</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Создавайте ссылки и отправляйте сотрудникам. Когда они перейдут по ссылке
                и представятся — появятся в списке активных зрителей ниже.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-[11px] text-slate-500"
              onClick={refreshActiveViewers}
              title="Обновить список"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={closeFlow} className="h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Инфо про новую логику */}
          <div className="rounded-lg bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-200 p-3">
            <p className="text-[11px] text-purple-900 leading-relaxed">
              <span className="font-semibold">Как это работает:</span>
              <br />
              • Админ <span className="font-medium">не видит</span> заранее список сотрудников — только создаёт ссылки
              с ролью (для сотрудника отдел не нужен — он видит только свои данные).
              <br />
              • Зритель открывает ссылку и обязательно вводит <span className="font-medium">номер телефона</span> (для логина),
              имя — по желанию.
              <br />
              • У админа зритель автоматически появляется в блоке «Активные зрители» — с телефоном (и именем, если указал).
              <br />
              • Зрители могут добавлять виджеты на дашборд, но данные фильтруются по их роли (RLS).
            </p>
          </div>

          {/* 1. Создать ссылку */}
          <CreateLinkForm />

          {/* 2. Активные зрители — главное нововведение */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-semibold text-slate-900">Активные зрители</h4>
              <Badge variant="outline" className="text-[10px] py-0 ml-auto">
                обновляется автоматически
              </Badge>
            </div>
            <ActiveViewersList />
          </div>

          {/* 3. Список созданных ссылок */}
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="w-4 h-4 text-slate-500" />
              <h4 className="text-sm font-semibold text-slate-900">Все созданные ссылки</h4>
            </div>
            <ShareLinksList />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
