'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  X,
  Share2,
  Eye,
  Copy,
  Check,
  Trash2,
  User,
  Users,
  Crown,
  Building2,
  Shield,
  Link2,
} from 'lucide-react'
import { useState } from 'react'
import { useDashboardStore } from '@/store/dashboard-store'
import {
  EMPLOYEES,
  Employee,
  ViewerRole,
  DEPARTMENTS,
} from '@/lib/dashboard/types'

const ROLE_META: Record<ViewerRole, { label: string; color: string; icon: any; access: string }> = {
  admin: {
    label: 'Админ',
    color: 'bg-amber-100 text-amber-700',
    icon: Shield,
    access: 'Полные права, управляет шарингом',
  },
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

function EmployeeRow({ emp }: { emp: Employee }) {
  const previewAs = useDashboardStore((s) => s.previewAs)
  const generateShareLink = useDashboardStore((s) => s.generateShareLink)
  const [copied, setCopied] = useState(false)
  const meta = ROLE_META[emp.role]
  const RoleIcon = meta.icon
  const deptName = emp.role === 'director' ? 'Все отделы' : DEPARTMENTS[emp.deptId].name

  const handleCopyLink = () => {
    const token = generateShareLink(emp)
    const url = `${window.location.origin}/?share=${token}`
    navigator.clipboard?.writeText(url).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
    >
      <Card className="p-3 hover:shadow-sm transition-shadow border-slate-200">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
            <RoleIcon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-slate-900 truncate">{emp.name}</span>
              <Badge variant="outline" className={`text-[10px] py-0 ${meta.color} border-transparent`}>
                {meta.label}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
              <Building2 className="w-3 h-3" />
              {deptName}
              <span className="text-slate-300 mx-1">·</span>
              <span className="truncate">{emp.phone}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">{meta.access}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-[11px]"
            onClick={() => previewAs(emp)}
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            Превью
          </Button>
          <Button
            size="sm"
            className="h-8 text-[11px] bg-purple-600 hover:bg-purple-700"
            onClick={handleCopyLink}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1" />
                Скопировано
              </>
            ) : (
              <>
                <Link2 className="w-3.5 h-3.5 mr-1" />
                Поделиться
              </>
            )}
          </Button>
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
      <div className="text-[11px] text-slate-400 py-4 text-center border border-dashed border-slate-200 rounded-lg">
        Сгенерированные ссылки появятся здесь
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
              <span className="text-xs font-medium text-slate-700 truncate flex-1">
                {link.payload.name}
              </span>
              <button
                onClick={() => revokeShareLink(link.token)}
                className="text-slate-400 hover:text-rose-600 transition-colors"
                aria-label="Отозвать ссылку"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
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
  const [filter, setFilter] = useState<ViewerRole | 'all'>('all')

  const filtered = EMPLOYEES.filter((e) => filter === 'all' || e.role === filter)

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
                Выберите сотрудника — посмотрите превью от его имени или сгенерируйте share-ссылку.
                Права доступа применяются по роли (RLS).
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={closeFlow} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Инфо о RLS-практиках */}
          <div className="px-5 pt-4">
            <div className="rounded-lg bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-200 p-3">
              <p className="text-[11px] text-purple-900 leading-relaxed">
                <span className="font-semibold">Как это работает (по практикам Power BI / Tableau / Looker):</span>
                <br />
                • <span className="font-medium">RLS (Row-Level Security)</span> — данные фильтруются по роли зрителя:
                сотрудник видит только себя, менеджер — свой отдел, директор — всё.
                <br />
                • <span className="font-medium">Share-ссылка</span> содержит встроенный контекст (роль + userId + отдел),
                аналог signed-URL в Looker.
                <br />
                • <span className="font-medium">Превью «View As»</span> — админ может на лету переключаться в режим
                просмотра от лица любого сотрудника (как в Power BI).
              </p>
            </div>
          </div>

          {/* Фильтр по ролям */}
          <div className="px-5 pt-4 pb-2 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-500 mr-1">Роль:</span>
            {(['all', 'director', 'manager', 'employee'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setFilter(r)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                  filter === r
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r === 'all' ? 'Все' : ROLE_META[r].label}
              </button>
            ))}
          </div>

          {/* Список сотрудников */}
          <div className="px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filtered.map((emp) => (
              <EmployeeRow key={emp.id} emp={emp} />
            ))}
          </div>

          {/* История share-ссылок */}
          <div className="px-5 pb-5 border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="w-4 h-4 text-slate-500" />
              <h4 className="text-sm font-semibold text-slate-900">Активные share-ссылки</h4>
            </div>
            <ShareLinksList />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
