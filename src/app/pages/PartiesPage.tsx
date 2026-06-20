import { PartiesPage as PartiesFeaturePage } from '../../features/parties/ui/PartiesPage'
import type { Party } from '../../features/party/model/types'

type PartiesPageProps = {
  visibleParties: Party[]
  archivedParties: Party[]
  showArchived: boolean
  onToggleArchived: () => void
  onCreateParty: () => void
  onOpenPartyDetails: (partyId: string) => void
}

export function PartiesPage(props: PartiesPageProps) {
  return <PartiesFeaturePage {...props} />
}
