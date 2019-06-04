import safeGet from 'lodash/get'
import { REQUEST_STATES } from '@/constants'

export class ChangeRoleRequest {
  constructor (record) {
    this._record = record
    this.id = record.id || '0'
    this.hash = record.hash
    this.type = safeGet(record, 'xdrType.value')

    this.rejectReason = record.rejectReason
    this.pendingTasks = record.pendingTasks
    this.allTasks = record.allTasks
    this.requestor = safeGet(record, 'requestor.id')

    this.resetReason = safeGet(
      record, 'requestDetails.creatorDetails.resetReason'
    )
    this.blockReason = safeGet(
      record, 'requestDetails.creatorDetails.blockReason'
    )

    this.relatedRequestId = safeGet(
      record, 'requestDetails.creatorDetails.latestApprovedRequestId'
    )

    this.accountRoleToSet = safeGet(record, 'requestDetails.accountRoleToSet')
    this.state = record.state
    this.stateI = record.stateI

    this.creatorDetails = safeGet(record, 'requestDetails.creatorDetails')
    this.blobId = safeGet(record, 'requestDetails.creatorDetails.blobId')

    this.externalDetails = safeGet(record, 'externalDetails.data')
  }

  get record () {
    return this._record
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
