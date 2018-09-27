import config from '@/config'

export const REVIEW_TASKS_INDEX = Object.freeze({
  nothing: 0,
  superAdmin: 1,
  photoMatch: 2,
  validPoa: 4,
  requestForAutoReviewSent: 8,
  requestForAutoReviewApproved: 16,
  accreditedInvestor: 32,
  nonLatinDocs: 64
})

export const REVIEW_TASKS = Object.freeze(
  Object.entries(config.FEATURES.KYC_TASKS).reduce((newObj, [key, val]) => {
    if (val.exist) {
      return { ...newObj, [key]: REVIEW_TASKS_INDEX[key] }
    }
    return newObj
  }, {})
)

export const RENDERED_TASKS_TO_ADD = Object.freeze(
  Object.entries(config.FEATURES.KYC_TASKS)
      .filter(([key, val]) => val.render.add)
      .map(([key, val]) => REVIEW_TASKS_INDEX[key])
)

export const RENDERED_TASKS_TO_REMOVE = Object.freeze(
  Object.entries(config.FEATURES.KYC_TASKS)
      .filter(([key, val]) => val.render.remove)
      .map(([key, val]) => REVIEW_TASKS_INDEX[key])
)

export const SELECTED_TASKS_TO_ADD = Object.freeze(
  Object.entries(config.FEATURES.KYC_TASKS)
      .filter(([key, val]) => val.selected.add)
      .map(([key, val]) => REVIEW_TASKS_INDEX[key])
)

export const SELECTED_TASKS_TO_REMOVE = Object.freeze(
  Object.entries(config.FEATURES.KYC_TASKS)
      .filter(([key, val]) => val.selected.remove)
      .map(([key, val]) => REVIEW_TASKS_INDEX[key])
)

export const REVIEW_TASKS_VOCABULARY = Object.freeze({
  0: 'Nothing',
  1: 'Super admin',
  2: 'Photo match',
  4: 'Valid POA',
  8: 'Request sent to external service',
  16: 'Request processed by external service',
  32: 'Accredited investor',
  64: 'Non-latin docs'
})

export const PENDING_TASKS_VOCABULARY = Object.freeze({
  [ REVIEW_TASKS_INDEX.photoMatch |
    REVIEW_TASKS_INDEX.validPoa |
    REVIEW_TASKS_INDEX.requestForAutoReviewApproved |
    REVIEW_TASKS_INDEX.requestForAutoReviewSent
  ]: 'Waiting for manual review',
  [
    REVIEW_TASKS_INDEX.requestForAutoReviewApproved |
    REVIEW_TASKS_INDEX.requestForAutoReviewSent
  ]: 'Sending data to external service',
  [
    REVIEW_TASKS_INDEX.requestForAutoReviewApproved
  ]: 'Waiting for request to be processed by external service',
  [
    REVIEW_TASKS_INDEX.accreditedInvestor
  ]: 'Require manual review (accredited investor)'
})

export const KYC_TASKS_TO_REMOVE_ON_APPROVE = REVIEW_TASKS_INDEX.photoMatch | REVIEW_TASKS_INDEX.validPoa
export const KYC_TASKS_TO_REMOVE_ON_REJECT = REVIEW_TASKS_INDEX.nothing
export const KYC_TASKS_TO_ADD_ON_REJECT = REVIEW_TASKS_INDEX.nothing
export const KYC_TASKS_TO_ADD_ON_APPROVE = REVIEW_TASKS_INDEX.nothing
