import _get from 'lodash/get'

export class KeyValueRecord {
  constructor (record) {
    this._record = record
    this.key = _get(record, 'id', '')
    this.u32 = String(_get(record, 'value.u32', ''))
    this.str = _get(record, 'value.str', '')
    this.u64 = String(_get(record, 'value.u64', ''))
    this.entryTypeName = _get(record, 'value.type.name', '')
    this.entryType = _get(record, 'value.type.value', '')

    this.value = this.u32 || this.str || this.u64 || '0'
  }

  get isHaveKey () {
    return Boolean(this.key)
  }
}
