import _get from 'lodash/get'

export class RoleRecord {
  constructor (record) {
    this._record = record
    this.roleId = _get(record, 'id', '')
    this.details = _get(record, 'attributes.details', '')
    this.ruleIDs = record.relationships.rules.data.map(item => item.id)
  }
}
