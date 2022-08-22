import _get from 'lodash/get'

export class RoleRecord {
  constructor (record) {
    this._record = record
    this.roleId = _get(record, 'id', '')
    this.details = _get(record, 'details', '')
    this.ruleIDs = record.rules.map(item => item.id) || []
  }
}
