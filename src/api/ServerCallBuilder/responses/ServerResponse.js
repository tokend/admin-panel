import deepCamelCase from 'camelcase-keys-deep'

export class ServerResponse {
  constructor (response) {
    this._rawResponse = response
    this._data = deepCamelCase((response.body || {}).data || response.body)
  }

  get data () {
    return this._data
  }

  get body () {
    return this._rawResponse.body
  }

  get status () {
    return this._rawResponse.status
  }

  get statusText () {
    return this._rawResponse.statusText
  }
}
