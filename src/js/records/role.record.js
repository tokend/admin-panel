import safeGet from 'lodash/get'

export class Role {
  constructor (record) {
    this.id = record.id

    this.rules = safeGet(record, 'rules')
    this.rulesIDs = this._rulesIDs()
    this.name = safeGet(record, 'details.name') || ''
  }

  _rulesIDs () {
    return this.rules.map(rules => rules.id)
  }

  get nameOrId () {
    return this.name
      ? `${this.name}(${this.id})`
      : this.id
  }
}
