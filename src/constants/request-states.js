import config from '@/config'

export const REQUEST_STATES = {
  pending: {
    state: 'pending',
    stateI: 1,
  },
  cancelled: {
    state: 'cancelled',
    stateI: 2,
  },
  approved: {
    state: 'approved',
    stateI: 3,
  },
  rejected: {
    state: 'rejected',
    stateI: 4,
  },
  permanentlyRejected: {
    state: 'permanentlyRejected',
    stateI: 5,
  },
}

export const KYC_REQUEST_STATES = Object.freeze(
  Object.entries({
    ...REQUEST_STATES,
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
