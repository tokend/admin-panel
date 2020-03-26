import safeGet from 'lodash/get'

export class RuleRecord {
  constructor (record) {
    this.id = record.id

    this.actionName = safeGet(record, 'action.name')
    this.actionValue = safeGet(record, 'action.value')
    this.forbids = safeGet(record, 'forbids')
    this.name = safeGet(record, 'details.name')
    this.resource = safeGet(record, 'resource')
    this.isDefault = safeGet(record, 'isDefault')
  }

  get nameOrId () {
    return this.name
      ? `${this.name}(${this.id})`
      : this.id
  }
}
