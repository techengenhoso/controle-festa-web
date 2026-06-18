import type { Party } from '../types'
import { isOlderThanDays } from './date'

export const STORAGE_KEY_V2 = 'party-control:v2'
export const STORAGE_KEY_V1 = 'party-control:v1'

function normalizeParty(value: Partial<Party>): Party {
  return {
    id: value.id ?? crypto.randomUUID(),
    name: value.name ?? 'Festa',
    date: value.date ?? new Intl.DateTimeFormat('pt-BR').format(new Date()),
    notes: value.notes ?? '',
    active: Boolean(value.active),
    archived: Boolean(value.archived),
    createdAt: value.createdAt ?? new Date().toISOString(),
    tabs: Array.isArray(value.tabs) ? value.tabs : [],
    menu: Array.isArray(value.menu) ? value.menu : [],
    consumptions: Array.isArray(value.consumptions) ? value.consumptions : [],
  }
}

export function autoArchiveParties(parties: Party[]) {
  return parties.map((party) => ({
    ...party,
    active: isOlderThanDays(party.date, 15) ? false : party.active,
    archived: party.archived || isOlderThanDays(party.date, 15),
  }))
}

export function loadParties(): Party[] {
  const stored = localStorage.getItem(STORAGE_KEY_V2) ?? localStorage.getItem(STORAGE_KEY_V1)
  if (!stored) return []

  try {
    const parsed = JSON.parse(stored)
    const list = Array.isArray(parsed) ? parsed : Array.isArray(parsed.parties) ? parsed.parties : []
    const normalized = autoArchiveParties(list.map(normalizeParty))
    return normalized.map((party, index) => ({ ...party, active: party.active && !party.archived && !normalized.some((other, otherIndex) => otherIndex < index && other.active && !other.archived) }))
  } catch {
    return []
  }
}

export function saveParties(parties: Party[]) {
  localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(parties))
}
