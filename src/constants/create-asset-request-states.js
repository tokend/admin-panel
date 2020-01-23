export const CREATE_ASSET_REQUEST_STATES = Object.freeze({
  pending: {
    code: 1,
    codeVerbose: 'pending',
    translationId: 'create-asset-request-states.pending',
  },
  canceled: {
    code: 2,
    codeVerbose: 'canceled',
    translationId: 'create-asset-request-states.canceled',
  },
  approved: {
    code: 3,
    codeVerbose: 'approved',
    translationId: 'create-asset-request-states.approved',
  },
  rejected: {
    code: 4,
    codeVerbose: 'rejected',
    translationId: 'create-asset-request-states.rejected',
  },
  permanentlyRejected: {
    code: 5,
    codeVerbose: 'permanentlyRejected',
    translationId: 'create-asset-request-states.perm-rejected',
  },
})
