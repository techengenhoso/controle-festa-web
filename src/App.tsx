import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from './components/Button'
import { Modal } from './components/Modal'
import { Nav } from './components/Nav'
import { Section } from './components/Section'
import type { AppData, MenuItem, Party, SectionId, Tab } from './types'
import { brazilianDateToIso, formatBrazilianDateInput, formatStoredDate, isValidBrazilianDate } from './utils/date'
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from './utils/currency'
import { createId } from './utils/id'
import { LIMITS, normalizeAppData, sortMenu, sortTabs } from './utils/normalization'
import { loadAppData, saveAppData } from './utils/storage'
import './styles/global.css'

type ModalState = 'party' | 'tab' | 'menu' | 'partyDetails' | 'tabDetails' | 'menuDetails' | null
type PartyForm = Pick<Party, 'name' | 'date' | 'notes'>
type TabForm = Pick<Tab, 'code' | 'nfcCard'> & { minimumSpend: string }
type MenuForm = Pick<MenuItem, 'name'> & { price: string }

const newParty = (): PartyForm => ({ name: '', date: '', notes: '' })
const newTab = (): TabForm => ({ code: '', nfcCard: '', minimumSpend: '' })
const newMenu = (): MenuForm => ({ name: '', price: '' })
const id = createId

function App() {
  const [appData, setAppData] = useState<AppData>(() => loadAppData())
  const parties = appData.parties
  const [section, setSection] = useState<SectionId>('parties')
  const [showArchived, setShowArchived] = useState(false)
  const [modal, setModal] = useState<ModalState>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [partyForm, setPartyForm] = useState(newParty)
  const [tabForm, setTabForm] = useState(newTab)
  const [menuForm, setMenuForm] = useState(newMenu)
  const [selectedPartyDetailId, setSelectedPartyDetailId] = useState<string | null>(null)
  const [selectedTabDetailId, setSelectedTabDetailId] = useState<string | null>(null)
  const [selectedMenuDetailId, setSelectedMenuDetailId] = useState<string | null>(null)
  const [showRegistered, setShowRegistered] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => saveAppData(appData), [appData])
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2400)
    return () => window.clearTimeout(timer)
  }, [toast])

  const activeParty = parties.find((party) => party.id === appData.selectedPartyId && party.active && !party.archived) ?? parties.find((party) => party.active && !party.archived)
  const visibleParties = parties.filter((party) => !party.archived)
  const archivedParties = parties.filter((party) => party.archived)
  const selectedTab = appData.selectedTabId ?? ''
  const selectedActiveTab = activeParty?.tabs.find((tab) => tab.id === selectedTab && tab.active)
  const selectedTabConsumptions = activeParty?.consumptions.filter((item) => item.tabId === selectedTab) ?? []
  const selectedPartyDetail = parties.find((party) => party.id === selectedPartyDetailId)
  const selectedTabDetail = activeParty?.tabs.find((tab) => tab.id === selectedTabDetailId)
  const selectedMenuDetail = activeParty?.menu.find((item) => item.id === selectedMenuDetailId)
  const activeTabs = sortTabs(activeParty?.tabs.filter((tab) => tab.active) ?? [])
  const activeMenu = sortMenu(activeParty?.menu.filter((item) => item.active) ?? [])

  const totals = {
    consumed: activeParty?.consumptions.reduce((sum, item) => sum + item.price, 0) ?? 0,
    minimum: activeParty?.tabs.reduce((sum, tab) => sum + Math.max(tab.minimumSpend - activeParty.consumptions.filter((item) => item.tabId === tab.id).reduce((tabSum, item) => tabSum + item.price, 0), 0), 0) ?? 0,
  }

  function updateParty(partyId: string, updater: (party: Party) => Party) {
    setAppData((current) => normalizeAppData({ ...current, parties: current.parties.map((party) => (party.id === partyId ? updater(party) : party)) }))
  }

  function openPartyForm(party?: Party) {
    setEditingId(party?.id ?? null)
    setPartyForm(party ? { name: party.name, date: formatStoredDate(party.date), notes: party.notes } : newParty())
    setModal('party')
  }

  function openPartyDetails(partyId: string) {
    setSelectedPartyDetailId(partyId)
    setModal('partyDetails')
  }

  function openTabDetails(tabId: string) {
    setSelectedTabDetailId(tabId)
    setModal('tabDetails')
  }

  function openMenuDetails(itemId: string) {
    setSelectedMenuDetailId(itemId)
    setModal('menuDetails')
  }

  function saveParty(event: FormEvent) {
    event.preventDefault()
    if (!partyForm.name.trim() || !isValidBrazilianDate(partyForm.date)) return
    const isoDate = brazilianDateToIso(partyForm.date)
    if (!isoDate) return
    const payload = { ...partyForm, date: isoDate, name: partyForm.name.trim().slice(0, LIMITS.partyName), notes: partyForm.notes.trim().slice(0, LIMITS.partyNotes) }
    setAppData((current) => normalizeAppData({ ...current, parties: editingId
      ? current.parties.map((party) => (party.id === editingId ? { ...party, ...payload } : party))
      : [...current.parties, { id: id(), ...payload, active: current.parties.every((party) => party.archived), archived: false, createdAt: new Date().toISOString(), tabs: [], menu: [], consumptions: [] }] }))
    setModal(null)
  }

  function setActiveParty(partyId: string, active: boolean) {
    setAppData((current) => normalizeAppData({ ...current, selectedPartyId: active ? partyId : current.selectedPartyId === partyId ? undefined : current.selectedPartyId, parties: current.parties.map((party) => ({ ...party, active: active ? party.id === partyId : party.id === partyId ? false : party.active })) }))
  }

  function openTabForm(tab?: Tab) {
    setEditingId(tab?.id ?? null)
    setTabForm(tab ? { code: tab.code, nfcCard: tab.nfcCard, minimumSpend: formatCurrencyInput(tab.minimumSpend) } : newTab())
    setModal('tab')
  }

  function deleteParty(partyId: string) {
    const party = parties.find((item) => item.id === partyId)
    if (!party?.archived) return
    setAppData((current) => normalizeAppData({ ...current, parties: current.parties.filter((p) => p.id !== partyId) }))
    setModal(null)
  }

  function saveTab(event: FormEvent) {
    event.preventDefault()
    const minimumSpend = tabForm.minimumSpend.trim() ? parseCurrencyInput(tabForm.minimumSpend) : 0
    if (!activeParty || !tabForm.code.trim() || minimumSpend === null) return
    const payload = { code: tabForm.code.trim().slice(0, LIMITS.tabCode), nfcCard: tabForm.nfcCard.trim().slice(0, LIMITS.tabNfcCard), minimumSpend }
    updateParty(activeParty.id, (party) => ({ ...party, tabs: editingId ? party.tabs.map((tab) => tab.id === editingId ? { ...tab, ...payload } : tab) : [...party.tabs, { id: id(), ...payload, active: true, createdAt: new Date().toISOString() }] }))
    setModal(null)
  }

  function openMenuForm(item?: MenuItem) {
    setEditingId(item?.id ?? null)
    setMenuForm(item ? { name: item.name, price: formatCurrencyInput(item.price) } : newMenu())
    setModal('menu')
  }

  function saveMenu(event: FormEvent) {
    event.preventDefault()
    const price = parseCurrencyInput(menuForm.price)
    if (!activeParty || !menuForm.name.trim() || price === null) return
    const payload = { name: menuForm.name.trim().slice(0, LIMITS.menuItemName), price }
    updateParty(activeParty.id, (party) => ({
      ...party,
      menu: editingId ? party.menu.map((item) => item.id === editingId ? { ...item, ...payload } : item) : [...party.menu, { id: id(), ...payload, active: true, createdAt: new Date().toISOString() }],
      consumptions: editingId ? party.consumptions.map((consumption) => consumption.menuItemId === editingId ? { ...consumption, itemName: payload.name, price: payload.price } : consumption) : party.consumptions,
    }))
    setModal(null)
  }



  const emptyActive = !activeParty

  return (
    <main className="app-shell">
      <div className="app-container">
        <header className="hero">
          <h1>Controle</h1>
          {activeParty && <p>{activeParty.name} • {formatStoredDate(activeParty.date)}</p>}
        </header>

        <div className="layout">
          <Nav current={section} disabled={emptyActive} onChange={setSection} />
          <div className="content">
            {section === 'parties' && <Section title="Festas" actions={<div className="party-actions"><Button onClick={() => openPartyForm()}>Criar festa</Button></div>}>
              {visibleParties.length === 0 ? <div className="empty-state"><strong>Nenhuma festa ativa criada ainda</strong><p>Crie uma festa ou abra o quadro de festas arquivadas</p></div> : <div className="grid-list">{visibleParties.map((party) => <button className="card card-button" key={party.id} onClick={() => openPartyDetails(party.id)}><div className="party-card-content"><div className="party-card-main"><h3>{party.name}</h3><p>{formatStoredDate(party.date)}</p></div><div className="badges"><span className={party.active ? 'badge-active' : 'badge-inactive'}>{party.active ? 'Ativa' : 'Inativa'}</span></div></div></button>)}</div>}
              <div className="toggle-panel"><Button variant="secondary" onClick={() => setShowArchived((value) => !value)}>{showArchived ? 'Ocultar festas arquivada' : 'Mostrar festas arquivada'}</Button>{showArchived && (archivedParties.length === 0 ? <div className="empty-state compact-state"><strong>Nenhuma festa arquivada</strong><p>As festas arquivadas aparecerão aqui</p></div> : <div className="grid-list">{archivedParties.map((party) => <button className="card card-button" key={party.id} onClick={() => openPartyDetails(party.id)}><div className="party-card-content"><div className="party-card-main"><h3>{party.name}</h3><p>{formatStoredDate(party.date)}</p></div><div className="badges"><span className="badge-archived">Arquivada</span></div></div></button>)}</div>)}</div>
            </Section>}

            {section === 'tabs' && activeParty && <Section title="Comandas" actions={<div className="party-actions"><Button onClick={() => openTabForm()}>Criar comanda</Button></div>}>{activeParty.tabs.length === 0 ? <div className="empty-state"><p>Adicione comandas para registrar consumo e acompanhar saldos</p></div> : <div className="grid-list">{activeParty.tabs.map((tab) => <button className="card card-button" key={tab.id} onClick={() => openTabDetails(tab.id)}><div className="item-card-content"><div><h3>{tab.code}</h3><p>{tab.nfcCard && <><strong className="tab-card-code">{tab.nfcCard}</strong> • </>}Mínimo {formatCurrency(tab.minimumSpend)}</p></div><div className="badges"><span className={tab.active ? 'badge-active' : 'badge-inactive'}>{tab.active ? 'Ativa' : 'Inativa'}</span></div></div></button>)}</div>}</Section>}

            {section === 'menu' && activeParty && <Section title="Cardápios" actions={<div className="party-actions"><Button onClick={() => openMenuForm()}>Criar item</Button></div>}>{activeParty.menu.length === 0 ? <div className="empty-state"><p>Monte o cardápio para começar a registrar consumo</p></div> : <div className="grid-list">{activeParty.menu.map((item) => <button className="card card-button" key={item.id} onClick={() => openMenuDetails(item.id)}><div className="item-card-content"><div><h3>{item.name}</h3><p>{formatCurrency(item.price)}</p></div><div className="badges"><span className={item.active ? 'badge-active' : 'badge-inactive'}>{item.active ? 'Ativo' : 'Inativo'}</span></div></div></button>)}</div>}</Section>}

            {section === 'consumption' && activeParty && <Section title="Consumos"><div className="chip-list">{activeTabs.map((tab) => <Button key={tab.id} variant={selectedTab === tab.id ? 'primary' : 'secondary'} onClick={() => setAppData((current) => ({ ...current, selectedTabId: tab.id }))}>{tab.code}</Button>)}</div>{activeTabs.length === 0 && <div className="empty-state"><p>Ative ou crie uma comanda para registrar consumos</p></div>}{selectedActiveTab && <><div className="grid-list consumption-menu">{activeMenu.map((item) => <article className="card compact" key={item.id}><div><h3>{item.name}</h3><p>{formatCurrency(item.price)}</p></div><Button onClick={() => { const menuItem = activeParty.menu.find((menu) => menu.id === item.id); if (!activeParty.active || !selectedActiveTab || !menuItem?.active) return; updateParty(activeParty.id, (party) => ({ ...party, consumptions: [...party.consumptions, { id: id(), tabId: selectedTab, menuItemId: menuItem.id, itemName: menuItem.name, price: menuItem.price, createdAt: new Date().toISOString() }] })); setToast('Item registrado') }}>Registrar</Button></article>)}</div><div className="toggle-panel"><Button variant="secondary" onClick={() => setShowRegistered((value) => !value)}>{showRegistered ? 'Ocultar itens registrados' : 'Mostrar itens registrados'}</Button>{showRegistered && selectedTabConsumptions.length > 0 && <div className="grid-list">{selectedTabConsumptions.map((item) => <article className="card compact" key={item.id}><div><h3>{item.itemName}</h3><p>{formatCurrency(item.price)}</p></div><Button variant="danger" onClick={() => updateParty(activeParty.id, (p) => ({ ...p, consumptions: p.consumptions.filter((c) => c.id !== item.id) }))}>Remover</Button></article>)}</div>}</div></>}</Section>}

            {section === 'balances' && activeParty && <Section title="Saldos"><div className="totals"><strong>Total consumido: {formatCurrency(totals.consumed)}</strong><strong>Total a consumir: {formatCurrency(totals.minimum)}</strong></div>{activeParty.tabs.length === 0 ? <div className="empty-state"><p>Crie comandas para calcular saldos</p></div> : <div className="grid-list">{activeParty.tabs.map((tab) => { const consumed = activeParty.consumptions.filter((item) => item.tabId === tab.id).reduce((sum, item) => sum + item.price, 0); const remaining = Math.max(tab.minimumSpend - consumed, 0); return <article className="card" key={tab.id}><div><h3>{tab.code}</h3><p className="balance-summary"><span>Consumido {formatCurrency(consumed)}</span><span>{remaining > 0 ? `A consumir ${formatCurrency(remaining)}` : 'Mínimo consumido'}</span></p></div></article> })}</div>}</Section>}
          </div>
        </div>
      </div>
      {toast && <div className="toast">{toast}</div>}


      {selectedPartyDetail && <Modal title="Detalhes da festa" open={modal === 'partyDetails'} onClose={() => setModal(null)}><div className="detail-list"><div><span>Nome</span><strong>{selectedPartyDetail.name}</strong></div><div><span>Data</span><strong>{formatStoredDate(selectedPartyDetail.date)}</strong></div><div><span>Observação</span><strong>{selectedPartyDetail.notes || 'Sem observações'}</strong></div><div><span>Status</span><strong>{selectedPartyDetail.active ? 'Ativa' : 'Inativa'}</strong></div></div><div className="modal-actions"><Button variant="secondary" onClick={() => openPartyForm(selectedPartyDetail)}>Editar</Button>{selectedPartyDetail.archived ? <><Button variant="secondary" onClick={() => updateParty(selectedPartyDetail.id, (p) => ({ ...p, archived: false }))}>Desarquivar</Button><Button variant="danger" onClick={() => deleteParty(selectedPartyDetail.id)}>Excluir</Button></> : <><Button variant="secondary" onClick={() => setActiveParty(selectedPartyDetail.id, !selectedPartyDetail.active)}>{selectedPartyDetail.active ? 'Desativar' : 'Ativar'}</Button><Button variant="secondary" onClick={() => updateParty(selectedPartyDetail.id, (p) => ({ ...p, archived: true, active: false }))}>Arquivar</Button></>}</div></Modal>}
      {selectedTabDetail && activeParty && <Modal title="Detalhes da comanda" open={modal === 'tabDetails'} onClose={() => setModal(null)}><div className="detail-list"><div><span>Nome</span><strong>{selectedTabDetail.code}</strong></div><div><span>Código</span><strong>{selectedTabDetail.nfcCard || 'Sem código'}</strong></div><div><span>Mínimo</span><strong>{formatCurrency(selectedTabDetail.minimumSpend)}</strong></div><div><span>Status</span><strong>{selectedTabDetail.active ? 'Ativa' : 'Inativa'}</strong></div></div><div className="modal-actions"><Button variant="secondary" onClick={() => openTabForm(selectedTabDetail)}>Editar</Button><Button variant="secondary" onClick={() => updateParty(activeParty.id, (p) => ({ ...p, tabs: p.tabs.map((t) => t.id === selectedTabDetail.id ? { ...t, active: !t.active } : t) }))}>{selectedTabDetail.active ? 'Desativar' : 'Ativar'}</Button><Button variant="danger" onClick={() => { updateParty(activeParty.id, (p) => ({ ...p, tabs: p.tabs.filter((t) => t.id !== selectedTabDetail.id), consumptions: p.consumptions.filter((c) => c.tabId !== selectedTabDetail.id) })); setModal(null) }}>Excluir</Button></div></Modal>}
      {selectedMenuDetail && activeParty && <Modal title="Detalhes da comanda" open={modal === 'menuDetails'} onClose={() => setModal(null)}><div className="detail-list"><div><span>Nome</span><strong>{selectedMenuDetail.name}</strong></div><div><span>Preço</span><strong>{formatCurrency(selectedMenuDetail.price)}</strong></div><div><span>Status</span><strong>{selectedMenuDetail.active ? 'Ativo' : 'Inativo'}</strong></div></div><div className="modal-actions"><Button variant="secondary" onClick={() => openMenuForm(selectedMenuDetail)}>Editar</Button><Button variant="secondary" onClick={() => updateParty(activeParty.id, (p) => ({ ...p, menu: p.menu.map((m) => m.id === selectedMenuDetail.id ? { ...m, active: !m.active } : m) }))}>{selectedMenuDetail.active ? 'Desativar' : 'Ativar'}</Button><Button variant="danger" onClick={() => { updateParty(activeParty.id, (p) => ({ ...p, menu: p.menu.filter((m) => m.id !== selectedMenuDetail.id), consumptions: p.consumptions.filter((c) => c.menuItemId !== selectedMenuDetail.id) })); setModal(null) }}>Excluir</Button></div></Modal>}

      <Modal title={editingId ? 'Editar festa' : 'Nova festa'} open={modal === 'party'} onClose={() => setModal(null)}><form onSubmit={saveParty} className="form"><input maxLength={20} placeholder="Nome da festa" value={partyForm.name} onChange={(e) => setPartyForm({ ...partyForm, name: e.target.value })} required /><input placeholder="dd/mm/aaaa" inputMode="numeric" pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}" value={partyForm.date} onChange={(e) => setPartyForm({ ...partyForm, date: formatBrazilianDateInput(e.target.value) })} required />{partyForm.date && !isValidBrazilianDate(partyForm.date) && <small>Use uma data válida no formato dd/mm/aaaa</small>}<input maxLength={50} placeholder="Observações" value={partyForm.notes} onChange={(e) => setPartyForm({ ...partyForm, notes: e.target.value })} /><Button type="submit">Salvar</Button></form></Modal>
      <Modal title={editingId ? 'Editar comanda' : 'Nova comanda'} open={modal === 'tab'} onClose={() => setModal(null)}><form onSubmit={saveTab} className="form"><input maxLength={20} placeholder="Responsável da comanda" value={tabForm.code} onChange={(e) => setTabForm({ ...tabForm, code: e.target.value })} required /><input maxLength={10} placeholder="Código da comanda" value={tabForm.nfcCard} onChange={(e) => setTabForm({ ...tabForm, nfcCard: e.target.value })} /><input maxLength={10} min="0" step="0.01" type="text" placeholder="Consumo mínimo" value={tabForm.minimumSpend} onChange={(e) => setTabForm({ ...tabForm, minimumSpend: e.target.value })} inputMode="decimal" pattern="[0-9]+([,.][0-9]{1,2})?" /><Button type="submit">Salvar</Button></form></Modal>
      <Modal title={editingId ? 'Editar item' : 'Novo item'} open={modal === 'menu'} onClose={() => setModal(null)}><form onSubmit={saveMenu} className="form"><input maxLength={20} placeholder="Nome do item" value={menuForm.name} onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })} required /><input maxLength={10} min="0" step="0.01" type="text" placeholder="Preço" value={menuForm.price} onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })} required inputMode="decimal" pattern="[0-9]+([,.][0-9]{1,2})?" /><Button type="submit">Salvar</Button></form></Modal>
    </main>
  )
}

export default App
