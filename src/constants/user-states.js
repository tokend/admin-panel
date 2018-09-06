export const USER_STATES = Object.freeze({
  nil: 1,
  waitingForApproval: 2,
  approved: 4,
  rejected: 8
})

export const USER_STATES_STR = Object.freeze({
  nil: 'nil',
  waitingForApproval: 'waiting_for_approval',
  approved: 'approved',
  rejected: 'rejected'
})
