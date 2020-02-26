import safeGet from 'lodash/get'
import { REQUEST_STATES } from '@/constants'

export class KycRecoveryRequest {
  constructor (record) {
    this._record = record
    this.id = record.id || '0'
    this.hash = record.hash
    this.type = safeGet(record, 'xdrType.value')

    this.pendingTasks = record.pendingTasks
    this.allTasks = record.allTasks
    this.requestor = safeGet(record, 'requestor.id')

    this.state = record.state
    this.stateI = record.stateI

    this.creatorDetails = safeGet(record, 'requestDetails.creatorDetails')

    this.externalDetails = safeGet(record, 'externalDetails.data')
  }

  get record () {
    return this._record
  }

  get isApproved () {
    return this.stateI === REQUEST_STATES.approved.stateI
  }

  get isPending () {
    return this.stateI === REQUEST_STATES.pending.stateI
  }

  get isRejected () {
    return this.stateI === REQUEST_STATES.rejected.stateI
  }
}
