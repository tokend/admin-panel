import safeGet from 'lodash/get'
import { RuleRecord } from './rule.record'

const READ_ONLY_ACCOUNT_ID = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF'
export class RoleRecord {
  constructor (record) {
    this._record = record

    this.id = record.id
    this.ownerId = safeGet(record, 'owner.id')
    this.rules = this._rules()
    this.name = safeGet(record, 'details.name') || ''
    this.isReadOnly = this._isReadOnly()
  }

  _rules () {
    const rules = this._record.rules || []
    return rules.map(rule => new RuleRecord(rule))
  }

  _isReadOnly () {
    return this.ownerId === READ_ONLY_ACCOUNT_ID
  }

  get nameOrId () {
    return this.name
      ? `${this.name}(${this.id})`
      : this.id
  }
}
