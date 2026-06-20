import { Button } from '../../../shared/ui/Button'
import { Section } from '../../../shared/ui/Section'
import type { Party } from '../../party/model/types'
import { formatStoredDate } from '../../../shared/utils/date'

type PartiesPageProps = {
  visibleParties: Party[]
  archivedParties: Party[]
  showArchived: boolean
  onToggleArchived: () => void
  onCreateParty: () => void
  onOpenPartyDetails: (partyId: string) => void
}

export function PartiesPage({ visibleParties, archivedParties, showArchived, onToggleArchived, onCreateParty, onOpenPartyDetails }: PartiesPageProps) {
  return <Section title="Festas" actions={<div className="party-actions"><Button onClick={onCreateParty}>Criar festa</Button></div>}>
    {visibleParties.length === 0 ? <div className="empty-state"><p>não existe nenhuma festa cadastrada e desarquivada</p></div> : <div className="grid-list">{visibleParties.map((party) => <PartyCard key={party.id} party={party} onOpenPartyDetails={onOpenPartyDetails} />)}</div>}
    <div className="toggle-panel archived-toggle-panel"><Button variant="secondary" onClick={onToggleArchived}>{showArchived ? 'Ocultar festas arquivada' : 'Mostrar festas arquivada'}</Button>{showArchived && (archivedParties.length === 0 ? <div className="empty-state compact-state"><p>não existe nenhuma festa arquivada</p></div> : <div className="grid-list">{archivedParties.map((party) => <PartyCard key={party.id} party={party} onOpenPartyDetails={onOpenPartyDetails} archived />)}</div>)}</div>
  </Section>
}

type PartyCardProps = {
  party: Party
  archived?: boolean
  onOpenPartyDetails: (partyId: string) => void
}

function PartyCard({ party, archived = false, onOpenPartyDetails }: PartyCardProps) {
  return <button className="card card-button" onClick={() => onOpenPartyDetails(party.id)}><div className="party-card-content"><div className="party-card-main"><h3>{party.name}</h3><p>{formatStoredDate(party.date)}</p></div><div className="badges"><span className={archived ? 'badge-archived' : party.active ? 'badge-active' : 'badge-inactive'}>{archived ? 'Arquivada' : party.active ? 'Ativa' : 'Inativa'}</span></div></div></button>
}
