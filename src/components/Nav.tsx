import type { SectionId } from '../types'

const items: Array<{ id: SectionId; label: string; icon: string }> = [
  { id: 'parties', label: 'Festas', icon: '🎉' },
  { id: 'tabs', label: 'Comandas', icon: '💳' },
  { id: 'menu', label: 'Cardápios', icon: '🍹' },
  { id: 'consumption', label: 'Consumos', icon: '🧾' },
  { id: 'balances', label: 'Saldos', icon: '📊' },
]

type NavProps = {
  current: SectionId
  disabled: boolean
  onChange: (section: SectionId) => void
}

export function Nav({ current, disabled, onChange }: NavProps) {
  return (
    <nav className="nav" aria-label="Navegação principal">
      {items.map((item) => {
        const itemDisabled = disabled && item.id !== 'parties'
        return (
          <button key={item.id} className={current === item.id ? 'active' : ''} disabled={itemDisabled} onClick={() => onChange(item.id)} type="button">
            <span>{item.icon}</span>
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
