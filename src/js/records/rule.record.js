import _get from 'lodash/get'

export class RuleRecord {
  constructor (record) {
    this._record = record
    this.ruleId = _get(record, 'id', '')
  }
}
