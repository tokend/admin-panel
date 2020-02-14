import { LIMIT_TYPES } from '@/constants'
import { globalize } from '@/components/App/filters/filters'

export function globalizeLimitType (value) {
  let translationId = ''
  switch (value) {
    case LIMIT_TYPES.dailyOut: {
      translationId = 'filters.limit-types.daily'
      break
    }
    case LIMIT_TYPES.weeklyOut: {
      translationId = 'filters.limit-types.weekly'
      break
    }
    case LIMIT_TYPES.monthlyOut: {
      translationId = 'filters.limit-types.monthly'
      break
    }
    case LIMIT_TYPES.annualOut: {
      translationId = 'filters.limit-types.annual'
      break
    }
    default: {
      translationId = 'filters.limit-types.default'
      break
    }
  }
  return globalize(translationId)
}
