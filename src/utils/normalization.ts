import type { AppData, Consumption, MenuItem, Party, Tab } from '../types'
import { normalizeDateToIso } from './date'
import { createId } from './id'

const collator = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true })

export const LIMITS = {
  partyName: 20,
  partyNotes: 50,
  tabCode: 20,
  menuItemName: 20,
} as const

function limitText(value: unknown, limit: number, fallback = '') {
  return String(value ?? fallback).trim().slice(0, limit)
}

function numberOrZero(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(number, 0) : 0
}

export function sortParties(parties: Party[]) {
  return [...parties].sort((a, b) => a.date.localeCompare(b.date) || collator.compare(a.name, b.name))
}

export function sortTabs(tabs: Tab[]) {
  return [...tabs].sort((a, b) => collator.compare(a.code, b.code))
}

export function sortMenu(menu: MenuItem[]) {
  return [...menu].sort((a, b) => collator.compare(a.name, b.name))
}

export function normalizeTab(value: Partial<Tab>): Tab {
  return {
    id: value.id ?? createId(),
    code: limitText(value.code, LIMITS.tabCode, 'Comanda'),
    nfcCard: String(value.nfcCard ?? '').trim(),
    minimumSpend: numberOrZero(value.minimumSpend),
    active: value.active ?? true,
    createdAt: value.createdAt ?? new Date().toISOString(),
  }
}

export function normalizeMenuItem(value: Partial<MenuItem>): MenuItem {
  return {
    id: value.id ?? createId(),
    name: limitText(value.name, LIMITS.menuItemName, 'Item'),
    price: numberOrZero(value.price),
    active: value.active ?? true,
    createdAt: value.createdAt ?? new Date().toISOString(),
  }
}

export function normalizeConsumption(value: Partial<Consumption>): Consumption {
  return {
    id: value.id ?? createId(),
    tabId: String(value.tabId ?? ''),
    menuItemId: String(value.menuItemId ?? ''),
    itemName: limitText(value.itemName, LIMITS.menuItemName, 'Item'),
    price: numberOrZero(value.price),
    createdAt: value.createdAt ?? new Date().toISOString(),
  }
}

export function normalizeParty(value: Partial<Party>): Party {
  const date = normalizeDateToIso(String(value.date ?? '')) ?? normalizeDateToIso(new Intl.DateTimeFormat('pt-BR').format(new Date())) ?? ''

  return {
    id: value.id ?? createId(),
    name: limitText(value.name, LIMITS.partyName, 'Festa'),
    date,
    notes: limitText(value.notes, LIMITS.partyNotes),
    active: Boolean(value.active),
    archived: Boolean(value.archived),
    createdAt: value.createdAt ?? new Date().toISOString(),
    tabs: sortTabs(Array.isArray(value.tabs) ? value.tabs.map(normalizeTab) : []),
    menu: sortMenu(Array.isArray(value.menu) ? value.menu.map(normalizeMenuItem) : []),
    consumptions: Array.isArray(value.consumptions) ? value.consumptions.map(normalizeConsumption) : [],
  }
}

export function normalizeAppData(value: Partial<AppData> | Party[]): AppData {
  const parties = Array.isArray(value) ? value : Array.isArray(value.parties) ? value.parties : []
  const normalizedParties = sortParties(parties.map(normalizeParty))

  return {
    parties: normalizedParties,
    selectedPartyId: Array.isArray(value) ? undefined : value.selectedPartyId,
    selectedTabId: Array.isArray(value) ? undefined : value.selectedTabId,
  }
}
