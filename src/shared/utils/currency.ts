export const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

export function formatCurrency(value: number) {
  return brlFormatter.format(Number.isFinite(value) ? value : 0)
}

export function parseCurrencyInput(value: string) {
  const sanitized = value.trim().replace(/\s/g, "")
  if (!sanitized) return null

  const normalized = sanitized.includes(",")
    ? sanitized.replace(/\./g, "").replace(",", ".")
    : sanitized

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null

  const parsed = Number(normalized)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

export function formatCurrencyInput(value: number) {
  if (!Number.isFinite(value)) return ""

  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
