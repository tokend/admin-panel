import { STATS_OPERATION_TYPES } from '@/constants'
import { globalize } from '@/components/App/filters/filters'

export function globalizeStatsOpType (value) {
  let translationId = ''
  switch (value) {
    case STATS_OPERATION_TYPES.paymentOut: {
      translationId = 'filters.stats-op-type.payment-out'
      break
    }
    case STATS_OPERATION_TYPES.withdraw: {
      translationId = 'filters.stats-op-type.withdraw'
      break
    }
    case STATS_OPERATION_TYPES.spend: {
      translationId = 'filters.stats-op-type.spend'
      break
    }
    case STATS_OPERATION_TYPES.deposit: {
      translationId = 'filters.stats-op-type.deposit'
      break
    }
    case STATS_OPERATION_TYPES.payout: {
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
