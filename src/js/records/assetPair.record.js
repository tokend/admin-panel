import _get from 'lodash/get'

export class AssetPairRecord {
  constructor (record = {}, details) {
    this._record = record
    this.base = _get(record, 'base')
    this.quote = _get(record, 'quote')

    this.currentPrice = _get(record, 'current_price') || 0
    this.maxPriceStep = _get(record, 'max_price_step') || 0

    this.physicalPrice = _get(record, 'physical_price') || 0
    this.physicalPriceCorrection = _get(record, 'physical_price_correction') || 0

    this.policy = _get(record, 'policy') || 0
    this.policies = _get(record, 'policies') || []
  }
}
