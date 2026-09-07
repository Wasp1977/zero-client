'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { LayoutDashboard, LogIn, ArrowRight } from 'lucide-react'
import { useDashboardStore } from '@/store/dashboard-store'

export function LoginScreen() {
  const login = useDashboardStore((s) => s.login)
  const [name, setName] = useState('')

  const handleLogin = () => {
    login(name.trim() || 'Гость')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 shadow-lg border-slate-200">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center">
              <LayoutDashboard className="w-8 h-8 text-amber-600" />
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-slate-900">Вход в дашборд</h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                Состояние: <span className="font-medium text-amber-600">«без виджетов»</span>
                <br />
                После входа вы сможете подключать любые виджеты от любых сервисов
              </p>
            </div>

            <div className="w-full space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs text-slate-600">
                  Имя пользователя
                </Label>
                <Input
                  id="username"
                  placeholder="Например, Иван Петров"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>

              <Button
                onClick={handleLogin}
                className="w-full h-11 text-sm font-medium"
                size="lg"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Войти в дашборд
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="w-full pt-4 border-t border-slate-100">
              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                Это интерактивный прототип сценария.<br />
                Ниже на дашборде вы сможете пройти весь путь:<br />
                вход → подключение виджетов → синтетика/реальные данные →<br />
                покупка/авторизация сервисов (ОАТС, билайнСРМ).
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
