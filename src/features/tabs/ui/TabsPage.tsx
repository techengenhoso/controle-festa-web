import { Button } from '../../../shared/ui/Button'
import { Section } from '../../../shared/ui/Section'
import type { Party } from '../../party/model/types'
import { formatCurrency } from '../../../shared/utils/currency'

type TabsPageProps = { party: Party, onCreateTab: () => void, onOpenTabDetails: (tabId: string) => void }

export function TabsPage({ party, onCreateTab, onOpenTabDetails }: TabsPageProps) {
  return <Section title="Comandas" actions={<div className="party-actions"><Button onClick={onCreateTab}>Criar comanda</Button></div>}>
    {party.tabs.length === 0 ? <div className="empty-state"><p>não existe nenhuma comanda criada</p></div> : <div className="grid-list">{party.tabs.map((tab) => <button className="card card-button" key={tab.id} onClick={() => onOpenTabDetails(tab.id)}><div className="item-card-content"><div><h3>{tab.code}</h3><p>{tab.nfcCard && <><strong className="tab-card-code">{tab.nfcCard}</strong> • </>}Mínimo {formatCurrency(tab.minimumSpend)}</p></div><div className="badges"><span className={tab.active ? 'badge-active' : 'badge-inactive'}>{tab.active ? 'Ativa' : 'Inativa'}</span></div></div></button>)}</div>}
  </Section>
}
