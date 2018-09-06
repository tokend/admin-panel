import { REVIEW_TASKS } from './review-tasks'
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

const masks = Object.freeze({
  manual: REVIEW_TASKS.photoMatch | REVIEW_TASKS.validPoa,
  auto: REVIEW_TASKS.requestForAutoReviewSent | REVIEW_TASKS.requestForAutoReviewApproved
})

export const KYC_REQUEST_STATES = Object.freeze(
  Object.entries({
    approved: {
      tasksToProcess: null,
      tasksProcessed: null,
      state: REQUEST_STATES.approved,
      label: 'Approved'
    },
    rejected: {
      tasksToProcess: null,
      tasksProcessed: null,
      state: REQUEST_STATES.rejected,
      label: 'Rejected'
    },
    pending: {
      tasksToProcess: masks.manual,
      tasksProcessed: null,
      state: REQUEST_STATES.pending,
      label: 'Waiting for review'
    },
    waitingForAutoReview: {
      tasksToProcess: REVIEW_TASKS.requestForAutoReviewSent,
      tasksProcessed: masks.manual,
      state: REQUEST_STATES.pending,
      label: 'Request sent to IDMind'
    },
    processedAutoReview: {
      tasksToProcess: REVIEW_TASKS.requestForAutoReviewApproved,
      tasksProcessed: masks.manual | REVIEW_TASKS.requestForAutoReviewSent,
      state: REQUEST_STATES.pending,
      label: 'Request processed by IDMind'
    },
    accreditedInvestor: {
      tasksToProcess: REVIEW_TASKS.accreditedInvestor,
      tasksProcessed: masks.manual | masks.auto,
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
