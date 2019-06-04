import { ReviewableRequest } from './ReviewableRequest'

export class AssetRequest extends ReviewableRequest {
  get code () {
    return this.operationDetails.asset.id || this.operationDetails.asset
  }

  get policies () {
    return this.operationDetails.policies
  }

  get name () {
    return this.operationDetails.creatorDetails.name
  }

  get signer () {
    return this.operationDetails.preIssuanceAssetSigner
  }

  get maxAmount () {
    return this.operationDetails.maxIssuanceAmount
  }

  get requestor () {
    return this.record.requestor.id
  }

  get type () {
    return this.record.xdrType.name
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
