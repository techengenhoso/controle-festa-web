const DAY_IN_MS = 24 * 60 * 60 * 1000

export function isValidBrazilianDate(value: string) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false
  const [day, month, year] = value.split('/').map(Number)
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

export function parseBrazilianDate(value: string) {
  if (!isValidBrazilianDate(value)) return null
  const [day, month, year] = value.split('/').map(Number)
  return new Date(year, month - 1, day)
}

export function formatBrazilianDate(date = new Date()) {
  return new Intl.DateTimeFormat('pt-BR').format(date)
}

export function isOlderThanDays(value: string, days: number) {
  const date = parseBrazilianDate(value)
  if (!date) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  return today.getTime() - date.getTime() > days * DAY_IN_MS
}
