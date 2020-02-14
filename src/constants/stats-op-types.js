import { xdrEnumToConstant } from '@/utils/xdrEnumToConstant'

export const STATS_OPERATION_TYPES = Object.freeze(xdrEnumToConstant('StatsOpType'))

export const STATS_OPERATION_TYPES_STR = {
  paymentOut: 'paymentOut',
  withdraw: 'withdraw',
  spend: 'spend',
  deposit: 'deposit',
  payout: 'payout',
}
