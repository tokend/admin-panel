import { ReviewableRequest } from './ReviewableRequest'
import { snakeToCamekCase } from '@/utils/un-camel-case'

export class TokenRequest extends ReviewableRequest {
  constructor (record) {
    console.log(record)
    super(record)
    this.operationDetails = this.record[snakeToCamekCase(this.record.requestType)]
  }

  get code () {
    return this.operationDetails.code
  }

  get externalLink () {
    return this.operationDetails.externalResourceLink
  }

  get policies () {
    return this.operationDetails.policies.map(policy => policy.value).reduce((sum, policy) => sum + policy, 0)
  }

  get name () {
    return this.operationDetails.name
  }

  get signer () {
    return this.operationDetails.preIssuedAssetSigner
  }

  get maxAmount () {
    return this.operationDetails.maxIssuanceAmount
  }

  get requestor () {
    return this.record.requestor
  }

  get type () {
    return this.record.requesType
  }

  get rejectReason () {
    return this.record.rejectReason
  }

  get issuedAmount () {
    return this.operationDetails.initialPreissuedAmount
  }

  get creationDate () {
    return this.record.createdAt
  }

  get updateDate () {
    return this.record.updatedAt
  }
}
