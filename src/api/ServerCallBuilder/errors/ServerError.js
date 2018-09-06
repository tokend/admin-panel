import store from '@/store'
import deepCamelCase from 'camelcase-keys-deep'

export class ServerError {
  constructor (error) {
    this._raw = error || {}
    this._details = deepCamelCase((error || {}).body || {})
    this._setDefaultMessage()
  }

  static get messages () {
    return {
      connection: 'Connection error. Please try again later.',
      unexpected: 'Unexpected error. Please try again later.',
      notFound: 'Item not found. Please check params and try again.',
      internalError: 'Unexpected server-side error. Please try again later.'
    }
  }

  get statusText () { return this._raw.statusText || '' }
  get status () { return this._raw.status || 0 }
  get details () { return this._details || {} }
  get message () { return this._message || '' }

  _setDefaultMessage () {
    const status = this.status
    const details = this.details
    const messages = ServerError.messages

    if (!(status || details)) {
      this.setMessage(messages.connection)
    } else if (status === 404) {
      this.setMessage(messages.notFound)
    } else if (status === 500) {
      this.setMessage(messages.internalError)
    } else {
      this.setMessage(messages.unexpected)
    }
  }

  setMessage (message) {
    if (!message) return this
    this._message = message
    return this
  }

  showMessage (message) {
    store.dispatch('SET_ERROR', this.message)
    return this
  }
}
