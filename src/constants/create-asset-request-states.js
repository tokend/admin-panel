export const CREATE_ASSET_REQUEST_STATES = Object.freeze({
  pending: {
    code: 1,
    codeVerbose: 'pending',
  },
  canceled: {
    code: 2,
    codeVerbose: 'canceled',
  },
  approved: {
    code: 3,
    codeVerbose: 'approved',
  },
  rejected: {
    code: 4,
    codeVerbose: 'rejected',
  },
  permanentlyRejected: {
    code: 5,
    codeVerbose: 'permanentlyRejected',
  },
})
