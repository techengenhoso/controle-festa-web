const DAY_IN_MS = 24 * 60 * 60 * 1000
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const BRAZILIAN_DATE_PATTERN = /^\d{2}\/\d{2}\/\d{4}$/

function toUtcDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day))
}

function isRealDate(year: number, month: number, day: number) {
  const date = toUtcDate(year, month, day)
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function isValidIsoDate(value: string) {
  if (!ISO_DATE_PATTERN.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  return isRealDate(year, month, day)
}

export function isValidBrazilianDate(value: string) {
  if (!BRAZILIAN_DATE_PATTERN.test(value)) return false
  const [day, month, year] = value.split('/').map(Number)
  return isRealDate(year, month, day)
}

export function brazilianDateToIso(value: string) {
  if (!isValidBrazilianDate(value)) return null
  const [day, month, year] = value.split('/')
  return `${year}-${month}-${day}`
}

export function isoDateToBrazilian(value: string) {
  if (!isValidIsoDate(value)) return value
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

export function normalizeDateToIso(value: string) {
  if (isValidIsoDate(value)) return value
  return brazilianDateToIso(value)
}

export function formatBrazilianDate(date = new Date()) {
  const year = date.getFullYear().toString().padStart(4, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${day}/${month}/${year}`
}

export function formatStoredDate(value: string) {
  return isoDateToBrazilian(value)
}

export function parseIsoDate(value: string) {
  if (!isValidIsoDate(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  return toUtcDate(year, month, day)
}

export function isMoreThanDaysAfterDate(value: string, days: number) {
  const date = parseIsoDate(value)
  if (!date) return false
  const today = new Date()
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  return todayUtc - date.getTime() > days * DAY_IN_MS
}
