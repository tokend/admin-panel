import _get from 'lodash/get'

export class LimitsRecord {
  constructor (record = {}, details) {
    this._record = record
    this.assetCode =
      _get(record, 'asset.id') ||
      details.assetCode ||
      null

    this.annualOut = _get(record, 'annualOut') || ''
    this.dailyOut = _get(record, 'dailyOut') || ''
    this.weeklyOut = _get(record, 'weeklyOut') || ''
    this.monthlyOut = _get(record, 'monthlyOut') || ''

    this.statsOpType =
      _get(record, 'statsOpType') ||
      details.statsOpType ||
      null

    this.accountRole =
      _get(record, 'accountRole.id') ||
      _get(details, 'accountRole') ||
      null

    this.accountID =
      _get(record, 'account.id') ||
      details.accountId ||
      null

    this.isConvertNeeded = _get(record, 'isConvertNeeded') || false

    this.id = _get(record, 'id') || 0
  }
}
