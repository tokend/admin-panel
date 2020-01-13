export const CREATE_ASSET_REQUEST_STATES = Object.freeze({
  pending: {
    code: 1,
    codeVerbose: 'pending',
    text: 'create-asset-request-states.pending',
  },
  canceled: {
    code: 2,
    codeVerbose: 'canceled',
    text: 'create-asset-request-states.canceled',
  },
  approved: {
    code: 3,
    codeVerbose: 'approved',
    text: 'create-asset-request-states.approved',
  },
  rejected: {
    code: 4,
    codeVerbose: 'rejected',
    text: 'create-asset-request-states.rejected',
  },
  permanentlyRejected: {
    code: 5,
    codeVerbose: 'permanentlyRejected',
    text: 'create-asset-request-states.perm-rejected',
  },
})
