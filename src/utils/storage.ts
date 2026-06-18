import type { AppData } from '../types'
import { autoArchiveParties } from './autoArchive'
import { normalizeAppData } from './normalization'

export const STORAGE_KEY_V2 = 'party-control:v2'
export const STORAGE_KEY_V1 = 'party-control:v1'

const emptyData: AppData = { parties: [] }

function enforceSingleActiveParty(data: AppData): AppData {
  let foundActive = false
  const parties = data.parties.map((party) => {
    const active = party.active && !party.archived && !foundActive
    if (active) foundActive = true
    return { ...party, active }
  })

  return { ...data, parties }
}

export function loadAppData(): AppData {
  const stored = localStorage.getItem(STORAGE_KEY_V2) ?? localStorage.getItem(STORAGE_KEY_V1)
  if (!stored) return emptyData

  try {
    const parsed = JSON.parse(stored)
    const normalized = normalizeAppData(parsed)
    return enforceSingleActiveParty({ ...normalized, parties: autoArchiveParties(normalized.parties) })
  } catch {
    return emptyData
  }
}

export function saveAppData(data: AppData) {
  const normalized = normalizeAppData(data)
  localStorage.setItem(STORAGE_KEY_V2, JSON.stringify({ ...normalized, parties: autoArchiveParties(normalized.parties) }))
}
