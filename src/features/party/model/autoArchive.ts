import type { Party } from './types'
import { isMoreThanDaysAfterDate } from '../../../shared/utils/date'
import { sortParties } from './normalization'

const AUTO_ARCHIVE_DAYS = 15

export function autoArchiveParties(parties: Party[]) {
  return sortParties(parties).map((party) => {
    const shouldArchive = isMoreThanDaysAfterDate(party.date, AUTO_ARCHIVE_DAYS)
    return {
      ...party,
      active: shouldArchive ? false : party.active,
      archived: party.archived || shouldArchive,
    }
  })
}
