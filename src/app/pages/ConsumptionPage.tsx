import { ConsumptionPage as ConsumptionFeaturePage } from '../../features/consumption/ui/ConsumptionPage'
import type { Consumption, MenuItem, Tab } from '../../features/party/model/types'

type ConsumptionPageProps = {
  activeMenu: MenuItem[]
  activeTabs: Tab[]
  hasActiveTabsAndMenu: boolean
  selectedTab: string
  selectedTabConsumptions: Consumption[]
  selectedActiveTab?: Tab
  showRegistered: boolean
  onDeleteConsumption: (consumptionId: string) => void
  onRegisterConsumption: (menuItemId: string) => void
  onSelectTab: (tabId: string) => void
  onToggleRegistered: () => void
}

export function ConsumptionPage(props: ConsumptionPageProps) {
  return <ConsumptionFeaturePage {...props} />
}
