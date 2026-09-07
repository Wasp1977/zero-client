'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { LayoutDashboard, LogIn, ArrowRight, Phone } from 'lucide-react'
import { useDashboardStore } from '@/store/dashboard-store'

/**
 * Преобразует произвольный ввод в маску российского номера: +7 (XXX) XXX-XX-XX
 * Возвращает { value, digits } — отформатированную строку и только цифры.
 */
function formatPhone(input: string): { value: string; digits: string } {
  // Берём только цифры, первый символ нормализуем к 7
  let digits = input.replace(/\D/g, '')
  if (digits.length === 0) return { value: '', digits: '' }
  // Если начинается на 8 — заменяем на 7
  if (digits[0] === '8') digits = '7' + digits.slice(1)
  // Если не начинается на 7 — добавляем 7 в начало
  if (digits[0] !== '7') digits = '7' + digits
  // Ограничиваем 11 цифрами
  digits = digits.slice(0, 11)

  // Формируем маску
  let value = '+7'
  const rest = digits.slice(1) // без первой семёрки
  if (rest.length > 0) value += ' (' + rest.slice(0, 3)
  if (rest.length >= 3) value += ') ' + rest.slice(3, 6)
  if (rest.length >= 6) value += '-' + rest.slice(6, 8)
  if (rest.length >= 8) value += '-' + rest.slice(8, 10)
  return { value, digits }
}

export function LoginScreen() {
  const login = useDashboardStore((s) => s.login)
  const [phone, setPhone] = useState('')
  const [touched, setTouched] = useState(false)

  const handleChange = useCallback((raw: string) => {
    setTouched(true)
    const { value } = formatPhone(raw)
    setPhone(value)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) handleLogin()
  }

  // Номер валиден, если введено ровно 11 цифр (с кодом страны)
  const digits = formatPhone(phone).digits
  const isValid = digits.length === 11
  const showError = touched && !isValid && phone.length > 0

  const handleLogin = () => {
    if (!isValid) {
      setTouched(true)
      return
    }
    // Имя пользователя — последние 10 цифр без кода страны, в формате +7 XXX XXX-XX-XX
    login(phone)
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
                Войдите по номеру телефона, чтобы подключать виджеты сервисов
              </p>
            </div>

            <div className="w-full space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs text-slate-600">
                  Номер телефона
                </Label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    id="phone"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+7 (___) ___-__-__"
                    value={phone}
                    onChange={(e) => handleChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={`pl-9 ${showError ? 'border-rose-400 focus-visible:ring-rose-200' : ''}`}
                  />
                </div>
                {showError ? (
                  <p className="text-[11px] text-rose-600 leading-snug">
                    Введите номер полностью — 10 цифр после +7
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Маска: +7 (XXX) XXX-XX-XX
                  </p>
                )}
              </div>

              <Button
                onClick={handleLogin}
                disabled={!isValid}
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
                подключение сервисов (ОАТС, билайнСРМ).
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
