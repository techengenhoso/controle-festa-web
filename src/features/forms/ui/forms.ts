import type { MenuItem, Party, Tab } from "../../party/model/types"

export type PartyForm = Pick<Party, "name" | "date" | "notes">
export type TabForm = Pick<Tab, "code" | "nfcCard"> & { minimumSpend: string }
export type MenuForm = Pick<MenuItem, "name"> & { price: string }

export const newParty = (): PartyForm => ({ name: "", date: "", notes: "" })
export const newTab = (): TabForm => ({
  code: "",
  nfcCard: "",
  minimumSpend: "",
})
export const newMenu = (): MenuForm => ({ name: "", price: "" })
export const formatTabCodeInput = (value: string) => value.toLocaleUpperCase("pt-BR")
