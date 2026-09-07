// Общая утилита форматирования российского номера телефона в маску +7 (XXX) XXX-XX-XX

export function formatPhone(input: string): { value: string; digits: string } {
  let digits = input.replace(/\D/g, '')
  if (digits.length === 0) return { value: '', digits: '' }
  if (digits[0] === '8') digits = '7' + digits.slice(1)
  if (digits[0] !== '7') digits = '7' + digits
  digits = digits.slice(0, 11)

  let value = '+7'
  const rest = digits.slice(1)
  if (rest.length > 0) value += ' (' + rest.slice(0, 3)
  if (rest.length >= 3) value += ') ' + rest.slice(3, 6)
  if (rest.length >= 6) value += '-' + rest.slice(6, 8)
  if (rest.length >= 8) value += '-' + rest.slice(8, 10)
  return { value, digits }
}

export function isValidPhone(phone: string): boolean {
  return formatPhone(phone).digits.length === 11
}
