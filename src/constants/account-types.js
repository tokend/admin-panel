import { xdrEnumToConstant } from '@/utils/xdrEnumToConstant'

export const ACCOUNT_TYPES = Object.freeze(
  xdrEnumToConstant('AccountType')
)

export const ACCOUNT_TYPES_VERBOSE = Object.freeze({
  [ACCOUNT_TYPES.general]: 'General',
  [ACCOUNT_TYPES.syndicate]: 'Syndicate',
  [ACCOUNT_TYPES.notVerified]: 'Unverified user'
})
