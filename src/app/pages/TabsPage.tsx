import { TabsPage as TabsFeaturePage } from '../../features/tabs/ui/TabsPage'
import type { Party } from '../../features/party/model/types'

type TabsPageProps = {
  party: Party
  onCreateTab: () => void
  onOpenTabDetails: (tabId: string) => void
}

export function TabsPage(props: TabsPageProps) {
  return <TabsFeaturePage {...props} />
}
