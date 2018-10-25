import { ACCOUNT_TYPES } from '@/constants'

export const ACCOUNT_TYPES_VERBOSE = Object.freeze({
  operational: 'Operational',
  [ACCOUNT_TYPES.operational]: 'Operational',

  general: 'General',
  [ACCOUNT_TYPES.general]: 'General',

  accreditedInvestor: 'Accredited Investor',
  [ACCOUNT_TYPES.accreditedInvestor]: 'Accredited Investor',

  commission: 'Comission',
  [ACCOUNT_TYPES.commission]: 'Comission',

  master: 'Master',
  [ACCOUNT_TYPES.master]: 'Master',

  notVerified: 'Not verified',
  [ACCOUNT_TYPES.notVerified]: 'Not verified',

  syndycate: 'Syndicate user',
  [ACCOUNT_TYPES.syndicate]: 'Syndicate user',

  exchange: 'Exchange',
  [ACCOUNT_TYPES.exchange]: 'Exchange',

  institutionalInvestor: 'Institutional Investor',
  [ACCOUNT_TYPES.institutionalInvestor]: 'Institutional Investor',

  verified: 'Verified',
  [ACCOUNT_TYPES.verified]: 'Verified'
})

export default {
  getAccountTypeLocalizer (id) {
    return ACCOUNT_TYPES_VERBOSE[id + '']
  }
}
