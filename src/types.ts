export type Tab = {
  id: string
  code: string
  nfcCard: string
  minimumSpend: number
  active: boolean
  createdAt: string
}

export type MenuItem = {
  id: string
  name: string
  price: number
  active: boolean
  createdAt: string
}

export type Consumption = {
  id: string
  tabId: string
  menuItemId: string
  itemName: string
  price: number
  createdAt: string
}

export type Party = {
  id: string
  name: string
  date: string
  notes: string
  active: boolean
  archived: boolean
  createdAt: string
  tabs: Tab[]
  menu: MenuItem[]
  consumptions: Consumption[]
}

export type Page = 'parties' | 'tabs' | 'menu' | 'consumption' | 'balances'

export type SectionId = Page

export type AppData = {
  parties: Party[]
  selectedPartyId?: string
  selectedTabId?: string
}
