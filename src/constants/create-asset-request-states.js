export const CREATE_ASSET_REQUEST_STATES = Object.freeze({
  pending: {
    code: 1,
    codeVerbose: 'pending',
    text: 'Pending',
  },
  canceled: {
    code: 2,
    codeVerbose: 'canceled',
    text: 'Canceled',
  },
  approved: {
    code: 3,
    codeVerbose: 'approved',
    text: 'Approved',
  },
  rejected: {
    code: 4,
    codeVerbose: 'rejected',
    text: 'Rejected',
  },
  permanentlyRejected: {
    code: 5,
    codeVerbose: 'permanentlyRejected',
    text: 'Permanently rejected',
  },
})
