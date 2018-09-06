import { ReviewableRequest } from './ReviewableRequest'

export class TokenRequest extends ReviewableRequest {
  constructor (record) {
    super(record)
    this.operationDetails = this.record[this.record.request_type]
  }

  get code () {
    return this.operationDetails.code
  }

  get externalLink () {
    return this.operationDetails.external_resource_link
  }

  get policies () {
    return this.operationDetails.policies.map(policy => policy.value).reduce((sum, policy) => sum + policy, 0)
  }

  get name () {
    return this.operationDetails.name
  }

  get signer () {
    return this.operationDetails.pre_issued_asset_signer
  }

  get maxAmount () {
    return this.operationDetails.max_issuance_amount
  }

  get requestor () {
    return this.record.requestor
  }

  get type () {
    return this.record.request_type
  }

  get rejectReason () {
    return this.record.reject_reason
  }
}
