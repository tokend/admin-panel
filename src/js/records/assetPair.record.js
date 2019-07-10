import _get from 'lodash/get'

export class AssetPairRecord {
  constructor (record = {}, details) {
    this._record = record
    this.base = _get(record, 'baseAsset.id')
    this.quote = _get(record, 'quoteAsset.id')

    this.maxPriceStep = _get(record, 'maxPriceStep') || 0
    this.physicalPrice = _get(record, 'price') || 0
    this.physicalPriceCorrection = _get(record, 'physicalPriceCorrection') || 0

    this.policy = _get(record, 'policies.value') || 0
    this.policies = _get(record, 'policies.flags') || []
  }
}
