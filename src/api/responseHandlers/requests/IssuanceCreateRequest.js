import { ReviewableRequest } from './ReviewableRequest'

export class IssuanceCreateRequest extends ReviewableRequest {
  constructor (record) {
    super(record)
    this.operationDetails = this.record[this.record.request_type]
  }

  get amount () {
    return this.operationDetails.amount
  }

  get asset () {
    return this.operationDetails.asset
  }

  get reference () {
    return this.record.reference
  }

  get requestor () {
    return this.record.requestor
  }
}
