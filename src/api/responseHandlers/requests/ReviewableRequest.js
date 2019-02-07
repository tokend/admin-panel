import config from '@/config'
import { Sdk } from '@/sdk'
import { snakeToCamelCase } from '@/utils/un-camel-case'

export class ReviewableRequest {
  constructor (record) {
    this.record = { ...record, ...record.details }
    delete this.record.details

    this.operationDetails =
      this.record[snakeToCamelCase(this.record.requestType)]
  }

  get id () {
    return this.record.id
  }

  get state () {
    return this.record.requestState
  }

  get rejectReason () {
    return this.record.rejectReason
  }

  // actions:

  fulfill () {
    const approveAction = Sdk.xdr.ReviewRequestOpAction.fromName('approve').value
    return this._review(approveAction)
  }

  reject (reason = '', isPermanent = false) {
    const action = isPermanent
      ? Sdk.xdr.ReviewRequestOpAction.permanentReject().value
      : Sdk.xdr.ReviewRequestOpAction.reject().value
    return this._review(action, reason)
  }

  cancel () {
    const opts = { requestID: this.record.id }
    const operation = Sdk.base.ManageAssetBuilder.cancelAssetRequest(opts)
    return Sdk.horizon.transactions.submitOperations(operation)
  }

  _review (action, reason = '') {
    const operation = Sdk.base.ReviewRequestBuilder.reviewRequest({
      requestID: this.record.id,
      requestHash: this.record.hash,
      requestType: this.record.requestTypeI,
      action,
      reason,
      source: config.MASTER_ACCOUNT
    })
    return Sdk.horizon.transactions.submitOperations(operation)
  }
}
