import safeGet from 'lodash/get'
import { REQUEST_STATES } from '@/constants'

export class ChangeRoleRequest {
  constructor (record) {
    this.id = record.id || '0'

    this.rejectReason = record.rejectReason
    this.resetReason = safeGet(
      record, 'requestDetails.creatorDetails.resetReason'
    )
    this.blockReason = safeGet(
      record, 'requestDetails.creatorDetails.blockReason'
    )

    this.relatedRequestId = safeGet(
      record, 'requestDetails.creatorDetails.latestApprovedRequestId'
    )

    this.creatorDetails = safeGet(record, 'requestDetails.creatorDetails')

    this.state = record.state
    this.stateI = record.stateI

    this.accountRoleToSet = safeGet(record, 'requestDetails.accountRoleToSet')
    this.blobId = safeGet(record, 'requestDetails.creatorDetails.blobId')
    this.externalDetails = safeGet(record, 'externalDetails.data')
  }

  get isApproved () {
    return this.stateI === REQUEST_STATES.approved
  }

  get isPending () {
    return this.stateI === REQUEST_STATES.pending
  }

  get isRejected () {
    return this.stateI === REQUEST_STATES.rejected
  }
}
