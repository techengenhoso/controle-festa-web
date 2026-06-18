import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from './components/Button'
import { Modal } from './components/Modal'
import { Nav } from './components/Nav'
import { Section } from './components/Section'
import type { AppData, MenuItem, Party, SectionId, Tab } from './types'
import { brazilianDateToIso, formatBrazilianDate, formatStoredDate, isValidBrazilianDate } from './utils/date'
import { formatCurrency } from './utils/currency'
import { createId } from './utils/id'
import { LIMITS, normalizeAppData, sortMenu, sortTabs } from './utils/normalization'
import { loadAppData, saveAppData } from './utils/storage'
import './styles/global.css'

type ModalState = 'party' | 'tab' | 'menu' | 'details' | null
type PartyForm = Pick<Party, 'name' | 'date' | 'notes'>
type TabForm = Pick<Tab, 'code' | 'nfcCard' | 'minimumSpend'>
type MenuForm = Pick<MenuItem, 'name' | 'price'>

const newParty = (): PartyForm => ({ name: '', date: formatBrazilianDate(), notes: '' })
const newTab = (): TabForm => ({ code: '', nfcCard: '', minimumSpend: 0 })
const newMenu = (): MenuForm => ({ name: '', price: 0 })
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
  const [selectedMenu, setSelectedMenu] = useState('')
  const [detailTitle, setDetailTitle] = useState('')
  const [detailRows, setDetailRows] = useState<Array<{ label: string; value: string }>>([])
  const [toast, setToast] = useState('')

  useEffect(() => saveAppData(appData), [appData])
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2400)
    return () => window.clearTimeout(timer)
  }, [toast])

  const activeParty = parties.find((party) => party.id === appData.selectedPartyId && party.active && !party.archived) ?? parties.find((party) => party.active && !party.archived)
  const visibleParties = showArchived ? parties : parties.filter((party) => !party.archived)
  const selectedTab = appData.selectedTabId ?? ''
  const activeTabs = sortTabs(activeParty?.tabs.filter((tab) => tab.active) ?? [])
  const activeMenu = sortMenu(activeParty?.menu.filter((item) => item.active) ?? [])

  const totals = {
    consumed: activeParty?.consumptions.reduce((sum, item) => sum + item.price, 0) ?? 0,
    minimum: activeParty?.tabs.reduce((sum, tab) => sum + tab.minimumSpend, 0) ?? 0,
  }

  function updateParty(partyId: string, updater: (party: Party) => Party) {
    setAppData((current) => normalizeAppData({ ...current, parties: current.parties.map((party) => (party.id === partyId ? updater(party) : party)) }))
  }

  function openPartyForm(party?: Party) {
    setEditingId(party?.id ?? null)
    setPartyForm(party ? { name: party.name, date: formatStoredDate(party.date), notes: party.notes } : newParty())
    setModal('party')
  }

  function openDetails(title: string, rows: Array<{ label: string; value: string }>) {
    setDetailTitle(title)
    setDetailRows(rows)
    setModal('details')
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
    setTabForm(tab ? { code: tab.code, nfcCard: tab.nfcCard, minimumSpend: tab.minimumSpend } : newTab())
    setModal('tab')
  }

  function saveTab(event: FormEvent) {
    event.preventDefault()
    if (!activeParty || !tabForm.code.trim()) return
    updateParty(activeParty.id, (party) => ({ ...party, tabs: editingId ? party.tabs.map((tab) => tab.id === editingId ? { ...tab, ...tabForm, code: tabForm.code.trim().slice(0, LIMITS.tabCode) } : tab) : [...party.tabs, { id: id(), ...tabForm, code: tabForm.code.trim().slice(0, LIMITS.tabCode), active: true, createdAt: new Date().toISOString() }] }))
    setModal(null)
  }

  function openMenuForm(item?: MenuItem) {
    setEditingId(item?.id ?? null)
    setMenuForm(item ? { name: item.name, price: item.price } : newMenu())
    setModal('menu')
  }

  function saveMenu(event: FormEvent) {
    event.preventDefault()
    if (!activeParty || !menuForm.name.trim()) return
    updateParty(activeParty.id, (party) => ({ ...party, menu: editingId ? party.menu.map((item) => item.id === editingId ? { ...item, ...menuForm, name: menuForm.name.trim().slice(0, LIMITS.menuItemName) } : item) : [...party.menu, { id: id(), ...menuForm, name: menuForm.name.trim().slice(0, LIMITS.menuItemName), active: true, createdAt: new Date().toISOString() }] }))
    setModal(null)
  }

  function registerConsumption() {
    if (!activeParty || !selectedTab || !selectedMenu) return
    const item = activeParty.menu.find((menuItem) => menuItem.id === selectedMenu)
    if (!item) return
    updateParty(activeParty.id, (party) => ({ ...party, consumptions: [...party.consumptions, { id: id(), tabId: selectedTab, menuItemId: item.id, itemName: item.name, price: item.price, createdAt: new Date().toISOString() }] }))
    setToast('Consumo registrado com sucesso!')
  }

  const emptyActive = !activeParty

  return (
    <main className="app-shell">
      <div className="app-container">
        <header className="hero">
          <span>Controle</span>
          <h1>Controle</h1>
          <p>{activeParty ? `${activeParty.name} • ${formatStoredDate(activeParty.date)}` : 'Nenhuma festa ativa'}</p>
        </header>

        <div className="layout">
          <Nav current={section} disabled={emptyActive} onChange={setSection} />
          <div className="content">
            {section === 'parties' && <Section title="Festas" subtitle="Gerencie eventos" actions={<><Button onClick={() => openPartyForm()}>Nova festa</Button><Button variant="secondary" onClick={() => setShowArchived((value) => !value)}>{showArchived ? 'Ocultar arquivadas' : 'Mostrar arquivadas'}</Button></>}>
              {visibleParties.length === 0 ? <div className="empty-state"><strong>Nenhuma festa criada ainda</strong><p>Crie a primeira festa para liberar comandas, cardápios, consumo e saldos.</p></div> : <div className="grid-list">{visibleParties.map((party) => <article className="card" key={party.id}><div><h3>{party.name}</h3><p>{formatStoredDate(party.date)} • {party.notes || 'Sem observações'}</p><div className="badges"><span>{party.active ? 'Ativa' : 'Inativa'}</span>{party.archived && <span>Arquivada</span>}</div></div><div className="actions"><Button variant="secondary" onClick={() => openPartyForm(party)}>Editar</Button><Button variant="secondary" onClick={() => openDetails(party.name, [{ label: 'Data', value: formatStoredDate(party.date) }, { label: 'Status', value: party.active ? 'Ativa' : 'Inativa' }, { label: 'Comandas', value: String(party.tabs.length) }, { label: 'Itens', value: String(party.menu.length) }, { label: 'Observações', value: party.notes || 'Sem observações' }])}>Detalhes</Button><Button variant="secondary" onClick={() => setActiveParty(party.id, !party.active)} disabled={party.archived}>{party.active ? 'Desativar' : 'Ativar'}</Button><Button variant="secondary" onClick={() => updateParty(party.id, (p) => ({ ...p, archived: !p.archived, active: p.archived ? p.active : false }))}>{party.archived ? 'Desarquivar' : 'Arquivar'}</Button><Button variant="danger" onClick={() => setAppData((current) => normalizeAppData({ ...current, parties: current.parties.filter((p) => p.id !== party.id) }))}>Excluir</Button></div></article>)}</div>}
            </Section>}

            {section === 'tabs' && activeParty && <Section title="Comandas" subtitle={activeParty.name} actions={<Button onClick={() => openTabForm()}>Nova comanda</Button>}>{activeParty.tabs.length === 0 ? <div className="empty-state"><strong>Nenhuma comanda criada para esta festa</strong><p>Adicione comandas para registrar consumo e acompanhar saldos.</p></div> : <div className="grid-list">{activeParty.tabs.map((tab) => <article className="card" key={tab.id}><div><h3>{tab.code}</h3><p>NFC: {tab.nfcCard || 'não informado'} • Mínimo {formatCurrency(tab.minimumSpend)}</p><div className="badges"><span>{tab.active ? 'Ativa' : 'Inativa'}</span></div></div><div className="actions"><Button variant="secondary" onClick={() => openTabForm(tab)}>Editar</Button><Button variant="secondary" onClick={() => openDetails(`Comanda ${tab.code}`, [{ label: 'Cartão NFC', value: tab.nfcCard || 'Não informado' }, { label: 'Consumo mínimo', value: formatCurrency(tab.minimumSpend) }, { label: 'Status', value: tab.active ? 'Ativa' : 'Inativa' }])}>Detalhes</Button><Button variant="secondary" onClick={() => updateParty(activeParty.id, (p) => ({ ...p, tabs: p.tabs.map((t) => t.id === tab.id ? { ...t, active: !t.active } : t) }))}>{tab.active ? 'Desativar' : 'Ativar'}</Button><Button variant="danger" onClick={() => updateParty(activeParty.id, (p) => ({ ...p, tabs: p.tabs.filter((t) => t.id !== tab.id), consumptions: p.consumptions.filter((c) => c.tabId !== tab.id) }))}>Excluir</Button></div></article>)}</div>}</Section>}

            {section === 'menu' && activeParty && <Section title="Cardápios" subtitle={activeParty.name} actions={<Button onClick={() => openMenuForm()}>Novo item</Button>}>{activeParty.menu.length === 0 ? <div className="empty-state"><strong>Nenhum item criado para esta festa</strong><p>Monte o cardápio para começar a registrar consumo.</p></div> : <div className="grid-list">{activeParty.menu.map((item) => <article className="card" key={item.id}><div><h3>{item.name}</h3><p>{formatCurrency(item.price)}</p><div className="badges"><span>{item.active ? 'Ativo' : 'Inativo'}</span></div></div><div className="actions"><Button variant="secondary" onClick={() => openMenuForm(item)}>Editar</Button><Button variant="secondary" onClick={() => openDetails(item.name, [{ label: 'Preço', value: formatCurrency(item.price) }, { label: 'Status', value: item.active ? 'Ativo' : 'Inativo' }])}>Detalhes</Button><Button variant="secondary" onClick={() => updateParty(activeParty.id, (p) => ({ ...p, menu: p.menu.map((m) => m.id === item.id ? { ...m, active: !m.active } : m) }))}>{item.active ? 'Desativar' : 'Ativar'}</Button><Button variant="danger" onClick={() => updateParty(activeParty.id, (p) => ({ ...p, menu: p.menu.filter((m) => m.id !== item.id) }))}>Excluir</Button></div></article>)}</div>}</Section>}

            {section === 'consumption' && activeParty && <Section title="Consumo" subtitle="Registrar itens"><div className="form-inline"><select value={selectedTab} onChange={(e) => setAppData((current) => ({ ...current, selectedTabId: e.target.value || undefined }))}><option value="">Selecione a comanda</option>{activeTabs.map((tab) => <option key={tab.id} value={tab.id}>{tab.code}</option>)}</select><select value={selectedMenu} onChange={(e) => setSelectedMenu(e.target.value)}><option value="">Selecione o item</option>{activeMenu.map((item) => <option key={item.id} value={item.id}>{item.name} - {formatCurrency(item.price)}</option>)}</select><Button onClick={registerConsumption} disabled={!selectedTab || !selectedMenu}>Registrar</Button></div>{activeParty.consumptions.length === 0 ? <div className="empty-state"><strong>Nenhum consumo registrado para esta festa</strong><p>Selecione uma comanda e um item para lançar o primeiro consumo.</p></div> : <div className="grid-list">{activeParty.consumptions.map((item) => <article className="card compact" key={item.id}><div><h3>{item.itemName}</h3><p>{activeParty.tabs.find((tab) => tab.id === item.tabId)?.code} • {formatCurrency(item.price)}</p></div><Button variant="danger" onClick={() => updateParty(activeParty.id, (p) => ({ ...p, consumptions: p.consumptions.filter((c) => c.id !== item.id) }))}>Remover</Button></article>)}</div>}</Section>}

            {section === 'balances' && activeParty && <Section title="Saldos" subtitle="Resumo financeiro"><div className="totals"><strong>Total consumido: {formatCurrency(totals.consumed)}</strong><strong>Total a consumir: {formatCurrency(totals.minimum)}</strong></div>{activeParty.tabs.length === 0 ? <div className="empty-state"><strong>Nenhuma comanda criada para esta festa</strong><p>Crie comandas para calcular saldos.</p></div> : <div className="grid-list">{activeParty.tabs.map((tab) => { const consumed = activeParty.consumptions.filter((item) => item.tabId === tab.id).reduce((sum, item) => sum + item.price, 0); return <article className="card" key={tab.id}><div><h3>{tab.code}</h3><p>Consumido: {formatCurrency(consumed)} • Saldo restante: {formatCurrency(Math.max(tab.minimumSpend - consumed, 0))}</p></div></article> })}</div>}</Section>}
          </div>
        </div>
      </div>
      {toast && <div className="toast">{toast}</div>}

      <Modal title={detailTitle} open={modal === 'details'} onClose={() => setModal(null)}><div className="detail-list">{detailRows.map((row) => <div key={row.label}><span>{row.label}</span><strong>{row.value}</strong></div>)}</div></Modal>

      <Modal title={editingId ? 'Editar festa' : 'Nova festa'} open={modal === 'party'} onClose={() => setModal(null)}><form onSubmit={saveParty} className="form"><input maxLength={20} placeholder="Nome da festa" value={partyForm.name} onChange={(e) => setPartyForm({ ...partyForm, name: e.target.value })} required /><input placeholder="dd/mm/aaaa" value={partyForm.date} onChange={(e) => setPartyForm({ ...partyForm, date: e.target.value })} required />{partyForm.date && !isValidBrazilianDate(partyForm.date) && <small>Use uma data válida no formato dd/mm/aaaa.</small>}<textarea maxLength={50} placeholder="Observações" value={partyForm.notes} onChange={(e) => setPartyForm({ ...partyForm, notes: e.target.value })} /><Button type="submit">Salvar</Button></form></Modal>
      <Modal title={editingId ? 'Editar comanda' : 'Nova comanda'} open={modal === 'tab'} onClose={() => setModal(null)}><form onSubmit={saveTab} className="form"><input maxLength={20} placeholder="Nome/código da comanda" value={tabForm.code} onChange={(e) => setTabForm({ ...tabForm, code: e.target.value })} required /><input placeholder="Cartão NFC" value={tabForm.nfcCard} onChange={(e) => setTabForm({ ...tabForm, nfcCard: e.target.value })} /><input min="0" step="0.01" type="number" placeholder="Consumo mínimo" value={tabForm.minimumSpend} onChange={(e) => setTabForm({ ...tabForm, minimumSpend: Number(e.target.value) })} /><Button type="submit">Salvar</Button></form></Modal>
      <Modal title={editingId ? 'Editar item' : 'Novo item'} open={modal === 'menu'} onClose={() => setModal(null)}><form onSubmit={saveMenu} className="form"><input maxLength={20} placeholder="Nome do item" value={menuForm.name} onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })} required /><input min="0" step="0.01" type="number" placeholder="Preço" value={menuForm.price} onChange={(e) => setMenuForm({ ...menuForm, price: Number(e.target.value) })} /><Button type="submit">Salvar</Button></form></Modal>
    </main>
  )
}

export default App
