import { ReviewableRequest } from './ReviewableRequest'

export class AssetRequest extends ReviewableRequest {
  get code () {
    return this.operationDetails.code
  }

  get externalLink () {
    return this.operationDetails.externalResourceLink
  }

  get policies () {
    return this.operationDetails.policies
      .map(policy => policy.value)
      .reduce((sum, policy) => sum + policy, 0)
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
    return this.record.requestType
  }

  get assetType () {
    return this.operationDetails.type
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
