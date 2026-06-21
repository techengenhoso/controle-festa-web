import { formatStoredDate } from "../../../shared/utils/date"
import { sortConsumptionsByCreatedAtDesc, sortMenu, sortTabs } from "./normalization"
import type { AppData, Consumption, MenuItem, Party, Tab } from "./types"

export function findActiveParty(appData: AppData) {
  return (
    appData.parties.find(
      party => party.id === appData.selectedPartyId && party.active && !party.archived
    ) ?? appData.parties.find(party => party.active && !party.archived)
  )
}

export function splitPartiesByArchive(parties: Party[]) {
  return {
    visibleParties: parties.filter(party => !party.archived),
    archivedParties: parties.filter(party => party.archived),
  }
}

export function getActiveTabs(party?: Party) {
  return sortTabs(party?.tabs.filter(tab => tab.active) ?? [])
}

export function getActiveMenu(party?: Party) {
  return sortMenu(party?.menu.filter(item => item.active) ?? [])
}

export function getConsumptionsByTab(party: Party | undefined, tabId: string) {
  return sortConsumptionsByCreatedAtDesc(
    party?.consumptions.filter((item: Consumption) => item.tabId === tabId) ?? []
  )
}

export function resolveSelectedTab(appData: AppData, activeTabs: Tab[]) {
  return activeTabs.some(tab => tab.id === appData.selectedTabId)
    ? (appData.selectedTabId ?? "")
    : (activeTabs[0]?.id ?? "")
}

export function sumConsumptionsByTab(party: Party | undefined, tabId: string) {
  return (
    party?.consumptions
      .filter(item => item.tabId === tabId)
      .reduce((sum, item) => sum + item.price, 0) ?? 0
  )
}

export function getRemainingMinimum(party: Party | undefined, tab: Tab | undefined) {
  if (!tab) return 0
  return Math.max(tab.minimumSpend - sumConsumptionsByTab(party, tab.id), 0)
}

export function getBalanceTotals(party: Party | undefined, tabs: Tab[]) {
  return {
    consumed:
      party?.consumptions
        .filter(item => tabs.some(tab => tab.id === item.tabId))
        .reduce((sum, item) => sum + item.price, 0) ?? 0,
    minimum: tabs.reduce((sum, tab) => sum + getRemainingMinimum(party, tab), 0),
  }
}

export function getPartyHeader(party: Party | undefined) {
  if (!party) return "Não existe festa ativa"
  return [party.name, formatStoredDate(party.date)].filter(Boolean).join(" • ")
}

export function findPartyItem<T extends { id: string }>(
  items: T[] | undefined,
  id: string | null
) {
  return items?.find(item => item.id === id)
}

export function hasActiveTabsAndMenu(tabs: Tab[], menu: MenuItem[]) {
  return tabs.length > 0 && menu.length > 0
}
