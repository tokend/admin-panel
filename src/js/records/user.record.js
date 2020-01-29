import _get from 'lodash/get'

export class UserRecord {
  constructor (record = {}, identity = {}) {
    this._record = record
    this._identity = identity

    this.role = Number(_get(record, 'role.id') ||
      _get(identity, 'role'))
    this.address = _get(identity, 'address') ||
      _get(record, 'id')
    this.email = _get(identity, 'email')
    this.status = _get(identity, 'status')
    this.phone = _get(identity, 'phone_number')
    this.telegram = _get(identity, 'telegram_username')
  }
}
