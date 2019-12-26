import safeGet from 'lodash/get'

// Wraps list items of http://docs.tokend.io/horizon/#operation/getBalanceList
export class Balance {
  constructor (record = {}) {
    this._record = record

    this.id = record.id
    this.assetCode = safeGet(record, 'asset.id')

    this.available = safeGet(record, 'state.available')
    this.locked = safeGet(record, 'state.locked')
  }
}
