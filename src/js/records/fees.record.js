import _get from 'lodash/get'

export class FeesRecord {
  constructor (record = {}, details) {
    this._record = record
    this.asset =
    _get(record, 'asset.id') ||
    _get(record, 'appliedTo.asset') ||
    _get(details, 'assetCode')

    this.feeType =
      _get(record, 'appliedTo.feeType') ||
      _get(details, 'feeType')
    this.subtype =
      _get(record, 'appliedTo.subtype') ||
      _get(details, 'paymentFeeSubtype')

    this.lowerBound = _get(record, 'appliedTo.lowerBound') || 0
    this.upperBound = _get(record, 'appliedTo.upperBound') || 0

    this.fixed = _get(record, 'fixed') || 0
    this.percent = _get(record, 'percent') || 0
  }
}
