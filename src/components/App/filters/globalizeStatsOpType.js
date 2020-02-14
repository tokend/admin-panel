import { STATS_OPERATION_TYPES_STR } from '@/constants'
import { globalize } from '@/components/App/filters/filters'

export function globalizeStatsOpType (value) {
  let translationId = ''
  switch (value) {
    case STATS_OPERATION_TYPES_STR.paymentOut: {
      translationId = 'filters.stats-op-type.payment-out'
      break
    }
    case STATS_OPERATION_TYPES_STR.withdraw: {
      translationId = 'filters.stats-op-type.withdraw'
      break
    }
    case STATS_OPERATION_TYPES_STR.spend: {
      translationId = 'filters.stats-op-type.spend'
      break
    }
    case STATS_OPERATION_TYPES_STR.deposit: {
      translationId = 'filters.stats-op-type.deposit'
      break
    }
    case STATS_OPERATION_TYPES_STR.payout: {
      translationId = 'filters.stats-op-type.payout'
      break
    }
    default: {
      translationId = 'filters.request-states.default'
      break
    }
  }
  return globalize(translationId)
}
