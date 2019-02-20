import config from '@/config'

export const REQUEST_STATES = Object.freeze({
  pending: 1,
  cancelled: 2,
  approved: 3,
  rejected: 4,
  permanentlyRejected: 5,
  waitForAutoApproval: 6
})

export const REQUEST_STATES_STR = Object.freeze({
  pending: 'pending',
  cancelled: 'cancelled',
  approved: 'approved',
  rejected: 'rejected',
  permanentlyRejected: 'permanentlyRejected',
  waitingForAutoReview: 'waitingForAutoReview'
})

export const KYC_REQUEST_STATES = Object.freeze(
  Object.entries({
    approved: {
      state: REQUEST_STATES.approved,
      label: 'Approved'
    },
    rejected: {
      state: REQUEST_STATES.rejected,
      label: 'Rejected'
    },
    pending: {
      state: REQUEST_STATES.pending,
      label: 'Waiting for review'
    },
    waitingForAutoReview: {
      state: REQUEST_STATES.pending,
      label: 'Request sent to IDMind'
    },
    processedAutoReview: {
      state: REQUEST_STATES.pending,
      label: 'Request processed by IDMind'
    },
    accreditedInvestor: {
      state: REQUEST_STATES.pending,
      label: 'Accredited Investors (require manual review)'
    }
  })
  .filter(([key]) => Object.values(config.FEATURES.KYC_REQUEST_STATES).includes(key))
  .reduce((res, [key, value]) => {
    res[key] = value
    return res
  }, {})
)
