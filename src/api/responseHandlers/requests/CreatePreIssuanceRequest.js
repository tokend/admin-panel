import { ReviewableRequest } from './ReviewableRequest'

export class CreatePreIssuanceRequest extends ReviewableRequest {
  amount () {
    return this.operationDetails.amount
  }

  asset () {
    return this.operationDetails.asset
  }
}
