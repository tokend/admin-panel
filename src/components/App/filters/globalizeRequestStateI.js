import { REQUEST_STATES } from '@/constants'
import { globalize } from '@/components/App/filters/filters'

export function globalizeRequestStateI (value) {
  let translationId = ''
  switch (+value) {
    case REQUEST_STATES.pending.stateI: {
      translationId = 'filters.request-states.pending'
      break
    }
    case REQUEST_STATES.cancelled.stateI: {
      translationId = 'filters.request-states.cancelled'
      break
    }
    case REQUEST_STATES.approved.stateI: {
      translationId = 'filters.request-states.approved'
      break
    }
    case REQUEST_STATES.rejected.stateI: {
      translationId = 'filters.request-states.rejected'
      break
    }
    case REQUEST_STATES.permanentlyRejected.stateI: {
      translationId = 'filters.request-states.permanently-rejected'
      break
    }
    default: {
      translationId = 'filters.request-states.default'
      break
    }
  }
  return globalize(translationId)
}
