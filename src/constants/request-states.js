import config from '@/config'

export const REQUEST_STATES = Object.freeze({
  pending: 1,
  cancelled: 2,
  approved: 3,
  rejected: 4,
  permanentlyRejected: 5,
})

export const REQUEST_STATES_STR = Object.freeze({
  pending: 'pending',
  cancelled: 'cancelled',
  approved: 'approved',
  rejected: 'rejected',
  permanentlyRejected: 'permanentlyRejected',
  waitingForAutoReview: 'waitingForAutoReview',
})

export const KYC_REQUEST_STATES = Object.freeze(
  Object.entries({
    approved: {
      state: REQUEST_STATES.approved,
      translationId: 'request-states.approved',
    },
    rejected: {
      state: REQUEST_STATES.rejected,
      translationId: 'request-states.rejected',
    },
    pending: {
      state: REQUEST_STATES.pending,
      translationId: 'request-states.waiting-review',
    },
    waitingForAutoReview: {
      state: REQUEST_STATES.pending,
      translationId: 'request-states.request-sent-idmind',
    },
    processedAutoReview: {
      state: REQUEST_STATES.pending,
      translationId: 'request-states.request-processed-idmind',
    },
  })
    .filter(([key]) => {
      return Object.values(config.FEATURES.KYC_REQUEST_STATES)
        .includes(key)
    })
    .reduce((res, [key, value]) => {
      res[key] = value
      return res
    }, {})
)
