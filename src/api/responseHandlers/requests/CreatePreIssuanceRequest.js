import { ReviewableRequest } from './ReviewableRequest'

export class CreatePreIssuanceRequest extends ReviewableRequest {
  constructor (record) {
    super(record)
    this.operationDetails = this.record[this.record.request_type]
  }

  amount () {
    return this.operationDetails.amount
  }

  asset () {
    return this.operationDetails.asset
  }
}
