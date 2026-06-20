import type { FormEvent } from 'react'
import { Button } from '../../../shared/ui/Button'
import { Modal } from '../../../shared/ui/Modal'
import { formatBrazilianDateInput, isValidBrazilianDate } from '../../../shared/utils/date'
import { formatTabCodeInput, type MenuForm, type PartyForm, type TabForm } from './forms'

type EntityFormsProps = {
  editingId: string | null
  menuForm: MenuForm
  modal: string | null
  partyForm: PartyForm
  tabForm: TabForm
  onClose: () => void
  onMenuFormChange: (form: MenuForm) => void
  onPartyFormChange: (form: PartyForm) => void
  onSaveMenu: (event: FormEvent) => void
  onSaveParty: (event: FormEvent) => void
  onSaveTab: (event: FormEvent) => void
  onTabFormChange: (form: TabForm) => void
}

export function EntityForms({ editingId, menuForm, modal, partyForm, tabForm, onClose, onMenuFormChange, onPartyFormChange, onSaveMenu, onSaveParty, onSaveTab, onTabFormChange }: EntityFormsProps) {
  return <>
    <Modal title={editingId ? 'Editar festa' : 'Nova festa'} open={modal === 'party'} onClose={onClose}><form onSubmit={onSaveParty} className="form"><input maxLength={20} placeholder="Nome da festa" value={partyForm.name} onChange={(e) => onPartyFormChange({ ...partyForm, name: e.target.value })} required /><input placeholder="dd/mm/aaaa" inputMode="numeric" pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}" value={partyForm.date} onChange={(e) => onPartyFormChange({ ...partyForm, date: formatBrazilianDateInput(e.target.value) })} required />{partyForm.date && !isValidBrazilianDate(partyForm.date) && <small>Use uma data válida no formato dd/mm/aaaa</small>}<input maxLength={50} placeholder="Observações" value={partyForm.notes} onChange={(e) => onPartyFormChange({ ...partyForm, notes: e.target.value })} /><Button type="submit">Salvar</Button></form></Modal>
    <Modal title={editingId ? 'Editar comanda' : 'Nova comanda'} open={modal === 'tab'} onClose={onClose}><form onSubmit={onSaveTab} className="form"><input maxLength={20} placeholder="Responsável da comanda" value={tabForm.code} onChange={(e) => onTabFormChange({ ...tabForm, code: e.target.value })} required /><input maxLength={10} placeholder="Código da comanda" value={tabForm.nfcCard} onChange={(e) => onTabFormChange({ ...tabForm, nfcCard: formatTabCodeInput(e.target.value) })} /><input maxLength={12} min="0" step="0.01" type="text" placeholder="Consumo mínimo" value={tabForm.minimumSpend} onChange={(e) => onTabFormChange({ ...tabForm, minimumSpend: e.target.value })} inputMode="decimal" pattern="[0-9.]+(,[0-9]{1,2})?" /><Button type="submit">Salvar</Button></form></Modal>
    <Modal title={editingId ? 'Editar item' : 'Novo item'} open={modal === 'menu'} onClose={onClose}><form onSubmit={onSaveMenu} className="form"><input maxLength={20} placeholder="Nome do item" value={menuForm.name} onChange={(e) => onMenuFormChange({ ...menuForm, name: e.target.value })} required /><input maxLength={12} min="0" step="0.01" type="text" placeholder="Preço (opcional)" value={menuForm.price} onChange={(e) => onMenuFormChange({ ...menuForm, price: e.target.value })} inputMode="decimal" pattern="[0-9.]+(,[0-9]{1,2})?" /><Button type="submit">Salvar</Button></form></Modal>
  </>
}
