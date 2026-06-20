import { autoArchiveParties } from "../../features/party/model/autoArchive"
import { normalizeAppData } from "../../features/party/model/normalization"
import type { AppData } from "../../features/party/model/types"

export const STORAGE_KEY_V2 = "party-control:v2"
export const STORAGE_KEY_V1 = "party-control:v1"

const emptyData: AppData = { parties: [] }

function readStorage(key: string) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Ignora ambientes com armazenamento indisponível ou quota excedida.
  }
}

export function loadAppData(): AppData {
  const stored = readStorage(STORAGE_KEY_V2) ?? readStorage(STORAGE_KEY_V1)
  if (!stored) return emptyData

  try {
    const parsed = JSON.parse(stored)
    const normalized = normalizeAppData(parsed)
    return normalizeAppData({
      ...normalized,
      parties: autoArchiveParties(normalized.parties),
    })
  } catch {
    return emptyData
  }
}

export function saveAppData(data: AppData) {
  const normalized = normalizeAppData(data)
  writeStorage(
    STORAGE_KEY_V2,
    JSON.stringify(
      normalizeAppData({
        ...normalized,
        parties: autoArchiveParties(normalized.parties),
      })
    )
  )
}
