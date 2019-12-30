import { ASSET_POLICIES } from '@tokend/js-sdk'
import safeGet from 'lodash/get'

// Wraps list items of http://docs.tokend.io/horizon/#operation/getAssets
export class Asset {
  constructor (record = {}) {
    this._record = record

    this.code = record.id
    this.owner = safeGet(record, 'owner.id')
    this.type = record.assetType || record.type
    this.preissuedAssetSigner = record.preIssuanceAssetSigner

    this.availableForIssuance = record.availableForIssuance
    this.issued = record.issued
    this.maxIssuanceAmount = record.maxIssuanceAmount
    this.initialPreissuedAmount = record.initialPreissuedAmount
    this.pendingIssuance = record.pendingIssuance
    this.trailingDigitsCount = record.trailingDigits

    this.details = record.details
    this.name = safeGet(record, 'details.name')
    this.externalSystemType = safeGet(record, 'details.externalSystemType')
    this.isCoinpayments = safeGet(record, 'details.isCoinpayments')

    this.logo = safeGet(record, 'details.logo')
    this.logoKey = safeGet(record, 'details.logo.key')
    this.logoName = safeGet(record, 'details.logo.name')
    this.logoType = safeGet(record, 'details.logo.type')

    this.terms = safeGet(record, 'details.terms')
    this.termsKey = safeGet(record, 'details.terms.key')
    this.termsName = safeGet(record, 'details.terms.name')
    this.termsType = safeGet(record, 'details.terms.type')

    this.policies = this._policies()
    this.policy = this._policy()
  }

  logoUrl (storageUrl) {
    return this.logoKey ? `${storageUrl}/${this.logoKey}` : ''
  }

  termsUrl (storageUrl) {
    return this.termsKey ? `${storageUrl}/${this.termsKey}` : ''
  }

  _policies () {
    const policies = safeGet(this._record, 'policies.flags') || []
    return policies.map(policy => policy.value)
  }

  _policy () {
    return this._policies().reduce((s, p) => s | p, 0)
  }

  get record () {
    return this._record
  }

  get nameAndCode () {
    const name = this.name || this.code
    return `${name} (${this.code})`
  }

  get isBaseAsset () {
    return Boolean(this.policy & ASSET_POLICIES.baseAsset)
  }

  get isDepositable () {
    return Boolean(this.externalSystemType)
  }

  get isIssuanceManualReviewRequired () {
    return Boolean(this.policy & ASSET_POLICIES.issuanceManualReviewRequired)
  }

  get isStatsQuoteAsset () {
    return Boolean(this.policy & ASSET_POLICIES.statsQuoteAsset)
  }

  get isTwoStepWithdrawal () {
    return Boolean(this.policy & ASSET_POLICIES.twoStepWithdrawal)
  }

  get isTransferable () {
    return Boolean(this.policy & ASSET_POLICIES.transferable)
  }

  get isWithdrawable () {
    return Boolean(this.policy & ASSET_POLICIES.withdrawable) ||
      Boolean(this.policy & ASSET_POLICIES.withdrawableV2)
  }

  get isRequiresKYC () {
    return this.assetType
  }
}
