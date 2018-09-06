import { requests } from '../../requests'
import { ManageAssetBuilder } from 'tokend-js-sdk'
import server from '@/utils/server'

import { xdr } from 'tokend-js-sdk'

export class ReviewableRequest {
  constructor (record) {
    this.record = { ...record, ...record.details }
    delete this.record.details
  }

  get id () {
    return this.record.id
  }

  get state () {
    return this.record.request_state
  }

  get rejectReason () {
    return this.record.reject_reason
  }

  // actions:

  fulfill () {
    const approveAction = xdr.ReviewRequestOpAction.fromName('approve').value
    return this._review(approveAction)
  }

  reject (reason = '', isPermanent = false) {
    const action = isPermanent
      ? xdr.ReviewRequestOpAction.permanentReject().value
      : xdr.ReviewRequestOpAction.reject().value
    return this._review(action, reason)
  }

  cancel () {
    const opts = { requestID: this.record.id }
    const op = ManageAssetBuilder.cancelAssetRequest(opts)
    return server.submitOperation(op, true)
  }

  _review (action, reason = '') {
    const opts = {
      requestID: this.record.id,
      requestHash: this.record.hash,
      requestType: this.record.request_type_i, // xdr.ReviewableRequestType.fromName('preIssuanceCreate').value,
      action,
      reason
    }
    return requests.reviewRequest(opts)
  }
}
