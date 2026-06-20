import { Button } from '../../components/Button'
import { Section } from '../../components/Section'
import type { Party } from '../../types'
import { formatCurrency } from '../../utils/currency'

type MenuPageProps = { party: Party, onCreateMenuItem: () => void, onOpenMenuDetails: (itemId: string) => void }

export function MenuPage({ party, onCreateMenuItem, onOpenMenuDetails }: MenuPageProps) {
  return <Section title="Cardápios" actions={<div className="party-actions"><Button onClick={onCreateMenuItem}>Criar item</Button></div>}>
    {party.menu.length === 0 ? <div className="empty-state"><p>não existe nenhum item criado</p></div> : <div className="grid-list">{party.menu.map((item) => <button className="card card-button" key={item.id} onClick={() => onOpenMenuDetails(item.id)}><div className="item-card-content"><div><h3>{item.name}</h3><p>{formatCurrency(item.price)}</p></div><div className="badges"><span className={item.active ? 'badge-active' : 'badge-inactive'}>{item.active ? 'Ativo' : 'Inativo'}</span></div></div></button>)}</div>}
  </Section>
}
