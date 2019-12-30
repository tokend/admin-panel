import _get from 'lodash/get'
import { FEE_TYPES } from '@/constants'

export class FeesRecord {
  constructor (record = {}, details) {
    this._record = record
    this._details = details

    this.asset =
      _get(record, 'asset.id') ||
      _get(record, 'appliedTo.asset') ||
      _get(details, 'assetCode')

    this.feeType =
      _get(record, 'appliedTo.feeType') ||
      _get(details, 'feeType')

    this.subtype = +this.feeType === +FEE_TYPES.paymentFee
      ? _get(record, 'appliedTo.subtype') || _get(details, 'paymentFeeSubtype')
      : 0

    this.lowerBound = _get(record, 'appliedTo.lowerBound') || 0
    this.upperBound = _get(record, 'appliedTo.upperBound') || 0

    this.fixed = _get(record, 'fixed') || 0
    this.percent = _get(record, 'percent') || 0
    this.exists = this._isFeeExists(record)
  }

  // In the fees that come from the server there is no field exists
  _isFeeExists (fee) {
    return typeof fee.exists === 'undefined' ? true : fee.exists
  }
}
